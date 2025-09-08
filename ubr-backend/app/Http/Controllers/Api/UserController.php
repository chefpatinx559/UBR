<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $user->updateLastActive();

        $query = User::active()
            ->verified()
            ->visible()
            ->where('id', '!=', $user->id)
            ->where('gender', '!=', $user->gender);

        // Exclure les utilisateurs déjà likés/dislikés
        $likedUserIds = $user->sentMatches()->pluck('matched_user_id');
        $query->whereNotIn('id', $likedUserIds);

        // Exclure les utilisateurs bloqués
        $blockedUserIds = $user->blockedUsers()->pluck('blocked_user_id');
        $blockedByUserIds = $user->blockedBy()->pluck('user_id');
        $query->whereNotIn('id', $blockedUserIds)
              ->whereNotIn('id', $blockedByUserIds);

        // Filtres de préférence
        $query->compatibleAge($user);

        if ($user->preferred_denomination !== 'any') {
            $query->where('denomination', $user->preferred_denomination);
        }

        // Filtrage par distance si géolocalisation disponible
        if ($user->latitude && $user->longitude) {
            $query->inRadius($user->latitude, $user->longitude, $user->preferred_distance);
        }

        $users = $query->with(['primaryPhoto', 'photos'])
            ->inRandomOrder()
            ->paginate(10);

        // Calculer la compatibilité pour chaque utilisateur
        $users->getCollection()->transform(function ($otherUser) use ($user) {
            $compatibility = $user->calculateCompatibility($otherUser);
            $otherUser->compatibility_score = $compatibility['score'];
            $otherUser->compatibility_details = $compatibility['factors'];
            return $otherUser;
        });

        return response()->json($users);
    }

    public function show(Request $request, $id)
    {
        $user = User::active()
            ->verified()
            ->visible()
            ->with(['photos', 'primaryPhoto'])
            ->findOrFail($id);

        $currentUser = $request->user();
        
        // Vérifier si l'utilisateur est bloqué
        if ($currentUser->hasBlocked($id) || $currentUser->isBlockedBy($id)) {
            return response()->json([
                'message' => 'Profil non accessible'
            ], 403);
        }

        // Calculer la compatibilité
        $compatibility = $currentUser->calculateCompatibility($user);
        $user->compatibility_score = $compatibility['score'];
        $user->compatibility_details = $compatibility['factors'];

        return response()->json($user);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'city' => 'sometimes|string|max:255',
            'profession' => 'sometimes|string|max:255',
            'education_level' => 'sometimes|in:high_school,bachelor,master,phd,other',
            'denomination' => 'sometimes|in:catholic,protestant,evangelical,pentecostal,orthodox,other',
            'practice_frequency' => 'sometimes|in:daily,weekly,monthly,occasionally',
            'church_involvement' => 'sometimes|in:leader,active,regular,occasional',
            'conversion_years' => 'sometimes|integer|min:0|max:50',
            'current_church' => 'sometimes|string|max:255',
            'ministry' => 'sometimes|string|max:255',
            'about_me' => 'sometimes|string|max:1000',
            'looking_for' => 'sometimes|string|max:1000',
            'interests' => 'sometimes|array',
            'preferred_age_min' => 'sometimes|integer|min:18|max:99',
            'preferred_age_max' => 'sometimes|integer|min:18|max:99',
            'preferred_distance' => 'sometimes|integer|min:5|max:500',
            'preferred_denomination' => 'sometimes|in:any,catholic,protestant,evangelical,pentecostal,orthodox',
            'preferred_spiritual_level' => 'sometimes|in:any,high,medium,growing',
            'profile_visible' => 'sometimes|boolean',
            'match_notifications' => 'sometimes|boolean',
            'message_notifications' => 'sometimes|boolean',
            'spiritual_reminders' => 'sometimes|boolean',
            'email_notifications' => 'sometimes|boolean',
            'push_notifications' => 'sometimes|boolean',
            'allow_non_match_messages' => 'sometimes|boolean',
            'show_online_status' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($validator->validated());

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => $user->fresh()->load(['primaryPhoto', 'photos'])
        ]);
    }

    public function uploadPhoto(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
            'is_primary' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Vérifier le nombre maximum de photos
        $photoCount = $user->photos()->count();
        if ($photoCount >= config('app.max_photos', 6)) {
            return response()->json([
                'message' => 'Vous avez atteint le nombre maximum de photos autorisées.'
            ], 422);
        }

        $file = $request->file('photo');
        $filename = time() . '_' . $user->id . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = 'photos/' . $user->id . '/' . $filename;

        // Redimensionner et optimiser l'image
        $image = Image::make($file);
        $image->fit(800, 800, function ($constraint) {
            $constraint->upsize();
        });
        $image->encode('jpg', 85);

        // Sauvegarder l'image
        Storage::put('public/' . $path, $image->stream());

        $photo = UserPhoto::create([
            'user_id' => $user->id,
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'path' => $path,
            'is_primary' => $request->boolean('is_primary', $photoCount === 0),
            'order' => $photoCount,
        ]);

        return response()->json([
            'message' => 'Photo uploadée avec succès',
            'photo' => $photo
        ], 201);
    }

    public function deletePhoto(Request $request, $photoId)
    {
        $user = $request->user();
        $photo = UserPhoto::where('user_id', $user->id)->findOrFail($photoId);

        $photo->delete();

        return response()->json([
            'message' => 'Photo supprimée avec succès'
        ]);
    }

    public function setPrimaryPhoto(Request $request, $photoId)
    {
        $user = $request->user();
        $photo = UserPhoto::where('user_id', $user->id)->findOrFail($photoId);

        // Retirer le statut primary des autres photos
        UserPhoto::where('user_id', $user->id)
            ->where('id', '!=', $photoId)
            ->update(['is_primary' => false]);

        $photo->update(['is_primary' => true]);

        return response()->json([
            'message' => 'Photo principale mise à jour',
            'photo' => $photo
        ]);
    }

    public function getStats(Request $request)
    {
        $user = $request->user();

        $stats = [
            'profile_views' => 0, // À implémenter avec une table de vues
            'likes_sent' => $user->sentMatches()->where('action', 'like')->count(),
            'likes_received' => $user->receivedMatches()->where('action', 'like')->count(),
            'matches' => $user->mutualMatches()->count(),
            'messages_sent' => $user->sentMessages()->count(),
            'messages_received' => $user->receivedMessages()->count(),
            'days_active' => $user->created_at->diffInDays(now()),
        ];

        return response()->json($stats);
    }

    public function updateLocation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $user->update([
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        return response()->json([
            'message' => 'Localisation mise à jour'
        ]);
    }
}