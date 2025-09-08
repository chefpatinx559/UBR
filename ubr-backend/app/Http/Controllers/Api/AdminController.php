<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Report;
use App\Models\Testimonial;
use App\Models\Subscription;
use App\Models\Message;
use App\Models\Match;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('admin');
    }

    public function getStats(Request $request)
    {
        $stats = [
            'users' => [
                'total' => User::count(),
                'active' => User::active()->count(),
                'verified' => User::verified()->count(),
                'new_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
            ],
            'matches' => [
                'total' => Match::mutual()->count(),
                'this_week' => Match::mutual()->where('created_at', '>=', now()->startOfWeek())->count(),
            ],
            'messages' => [
                'total' => Message::count(),
                'today' => Message::where('created_at', '>=', now()->startOfDay())->count(),
            ],
            'reports' => [
                'pending' => Report::pending()->count(),
                'urgent' => Report::urgent()->count(),
            ],
            'subscriptions' => [
                'active' => Subscription::active()->count(),
                'revenue_this_month' => Subscription::where('verified_at', '>=', now()->startOfMonth())
                    ->where('status', 'paid')
                    ->sum('amount'),
            ],
            'testimonials' => [
                'pending' => Testimonial::where('is_approved', false)->count(),
                'approved' => Testimonial::approved()->count(),
            ],
        ];

        return response()->json($stats);
    }

    public function getUsers(Request $request)
    {
        $query = User::with(['primaryPhoto', 'subscriptions' => function ($q) {
            $q->latest();
        }]);

        // Filtres
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        if ($request->has('verified')) {
            $query->where('is_verified', $request->boolean('verified'));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($users);
    }

    public function suspendUser(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'suspended' => 'required|boolean',
            'reason' => 'sometimes|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($userId);
        $user->update(['is_active' => !$request->suspended]);

        if ($request->suspended) {
            // Créer une notification pour l'utilisateur
            \App\Models\Notification::create([
                'user_id' => $user->id,
                'type' => 'system',
                'title' => 'Compte suspendu',
                'content' => 'Votre compte a été temporairement suspendu. Contactez le support pour plus d\'informations.',
                'data' => ['reason' => $request->reason ?? 'Non spécifié']
            ]);
        }

        return response()->json([
            'message' => $request->suspended ? 'Utilisateur suspendu' : 'Utilisateur réactivé',
            'user' => $user
        ]);
    }

    public function deleteUser(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        
        // Supprimer toutes les données associées
        $user->photos()->delete();
        $user->matches()->delete();
        $user->sentMessages()->delete();
        $user->receivedMessages()->delete();
        $user->blockedUsers()->delete();
        $user->blockedBy()->delete();
        $user->reports()->delete();
        $user->testimonials()->delete();
        $user->subscriptions()->delete();
        $user->notifications()->delete();
        
        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé définitivement'
        ]);
    }

    public function getReports(Request $request)
    {
        $query = Report::with(['reporter.primaryPhoto', 'reportedUser.primaryPhoto', 'handler']);

        // Filtres
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('urgency')) {
            $query->where('urgency', $request->urgency);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $reports = $query->orderBy('urgency', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($reports);
    }

    public function handleReport(Request $request, $reportId)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:investigating,resolved,dismissed',
            'admin_notes' => 'sometimes|string|max:1000',
            'action' => 'sometimes|in:warning,suspend,ban',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $admin = $request->user();
        $report = Report::findOrFail($reportId);

        $report->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
            'handled_by' => $admin->id,
            'resolved_at' => in_array($request->status, ['resolved', 'dismissed']) ? now() : null,
        ]);

        // Prendre des actions sur l'utilisateur signalé si nécessaire
        if ($request->has('action') && $report->reported_user_id) {
            $reportedUser = $report->reportedUser;
            
            switch ($request->action) {
                case 'warning':
                    \App\Models\Notification::create([
                        'user_id' => $reportedUser->id,
                        'type' => 'system',
                        'title' => 'Avertissement',
                        'content' => 'Vous avez reçu un avertissement suite à un signalement. Veuillez respecter les règles de la communauté.',
                        'data' => ['report_id' => $report->id]
                    ]);
                    break;
                    
                case 'suspend':
                    $reportedUser->update(['is_active' => false]);
                    \App\Models\Notification::create([
                        'user_id' => $reportedUser->id,
                        'type' => 'system',
                        'title' => 'Compte suspendu',
                        'content' => 'Votre compte a été suspendu suite à un signalement. Contactez le support.',
                        'data' => ['report_id' => $report->id]
                    ]);
                    break;
                    
                case 'ban':
                    $reportedUser->update(['is_active' => false]);
                    // Ici on pourrait ajouter une table de bannissements permanents
                    break;
            }
        }

        return response()->json([
            'message' => 'Signalement traité avec succès',
            'report' => $report->fresh(['reporter.primaryPhoto', 'reportedUser.primaryPhoto', 'handler'])
        ]);
    }

    public function getTestimonials(Request $request)
    {
        $query = Testimonial::with('user.primaryPhoto');

        if ($request->has('status')) {
            if ($request->status === 'pending') {
                $query->where('is_approved', false);
            } elseif ($request->status === 'approved') {
                $query->approved();
            }
        }

        $testimonials = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($testimonials);
    }

    public function approveTestimonial(Request $request, $testimonialId)
    {
        $testimonial = Testimonial::findOrFail($testimonialId);
        
        $testimonial->update([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        // Notifier l'utilisateur
        \App\Models\Notification::create([
            'user_id' => $testimonial->user_id,
            'type' => 'system',
            'title' => 'Témoignage approuvé',
            'content' => 'Votre témoignage a été approuvé et est maintenant visible publiquement.',
            'data' => ['testimonial_id' => $testimonial->id]
        ]);

        return response()->json([
            'message' => 'Témoignage approuvé',
            'testimonial' => $testimonial
        ]);
    }

    public function rejectTestimonial(Request $request, $testimonialId)
    {
        $testimonial = Testimonial::findOrFail($testimonialId);
        
        // Notifier l'utilisateur avant suppression
        \App\Models\Notification::create([
            'user_id' => $testimonial->user_id,
            'type' => 'system',
            'title' => 'Témoignage rejeté',
            'content' => 'Votre témoignage n\'a pas pu être approuvé. Contactez le support pour plus d\'informations.',
        ]);

        $testimonial->delete();

        return response()->json([
            'message' => 'Témoignage rejeté et supprimé'
        ]);
    }

    public function getSubscriptions(Request $request)
    {
        $query = Subscription::with('user.primaryPhoto');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $subscriptions = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($subscriptions);
    }

    public function verifySubscription(Request $request, $subscriptionId)
    {
        $subscription = Subscription::findOrFail($subscriptionId);
        
        $subscription->update([
            'status' => 'paid',
            'verified_at' => now(),
        ]);

        // Mettre à jour l'utilisateur
        $subscription->user->update([
            'subscription_type' => $subscription->plan,
            'subscription_expires_at' => $subscription->expires_at,
        ]);

        // Notifier l'utilisateur
        \App\Models\Notification::create([
            'user_id' => $subscription->user_id,
            'type' => 'system',
            'title' => 'Abonnement activé',
            'content' => 'Votre abonnement ' . ucfirst($subscription->plan) . ' a été activé avec succès !',
            'data' => ['subscription_id' => $subscription->id]
        ]);

        return response()->json([
            'message' => 'Abonnement vérifié et activé',
            'subscription' => $subscription
        ]);
    }
}