<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TestimonialController extends Controller
{
    public function index(Request $request)
    {
        $query = Testimonial::approved()
            ->with('user.primaryPhoto')
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc');

        // Filtres
        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->has('filter')) {
            switch ($request->filter) {
                case 'positive':
                    $query->positive();
                    break;
                case 'neutral':
                    $query->neutral();
                    break;
                case 'negative':
                    $query->negative();
                    break;
            }
        }

        if ($request->has('featured')) {
            $query->featured();
        }

        $testimonials = $query->paginate(20);

        return response()->json($testimonials);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'partner_name' => 'sometimes|string|max:255',
            'relationship_status' => 'required|in:dating,engaged,married',
            'rating' => 'required|integer|min:1|max:5',
            'content' => 'required|string|max:1000',
            'city' => 'sometimes|string|max:255',
            'is_anonymous' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Vérifier si l'utilisateur n'a pas déjà soumis un témoignage récemment
        $recentTestimonial = $user->testimonials()
            ->where('created_at', '>', now()->subDays(30))
            ->first();

        if ($recentTestimonial) {
            return response()->json([
                'message' => 'Vous avez déjà soumis un témoignage ce mois-ci'
            ], 422);
        }

        $testimonial = Testimonial::create([
            'user_id' => $user->id,
            'partner_name' => $request->partner_name,
            'relationship_status' => $request->relationship_status,
            'rating' => $request->rating,
            'content' => $request->content,
            'city' => $request->city ?? $user->city,
            'is_anonymous' => $request->boolean('is_anonymous', false),
        ]);

        return response()->json([
            'message' => 'Témoignage soumis avec succès. Il sera modéré avant publication.',
            'testimonial' => $testimonial
        ], 201);
    }

    public function getStats()
    {
        $stats = [
            'total' => Testimonial::approved()->count(),
            'average_rating' => round(Testimonial::approved()->avg('rating'), 1),
            'positive' => Testimonial::approved()->positive()->count(),
            'neutral' => Testimonial::approved()->neutral()->count(),
            'negative' => Testimonial::approved()->negative()->count(),
            'this_month' => Testimonial::approved()
                ->where('created_at', '>=', now()->startOfMonth())
                ->count(),
        ];

        return response()->json($stats);
    }
}