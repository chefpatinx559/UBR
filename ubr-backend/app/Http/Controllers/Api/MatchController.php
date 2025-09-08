<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Match;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MatchController extends Controller
{
    public function like(Request $request, $userId)
    {
        $currentUser = $request->user();
        $targetUser = User::active()->verified()->findOrFail($userId);

        // Vérifier si l'utilisateur n'est pas bloqué
        if ($currentUser->hasBlocked($userId) || $currentUser->isBlockedBy($userId)) {
            return response()->json([
                'message' => 'Action non autorisée'
            ], 403);
        }

        // Vérifier si l'action n'a pas déjà été effectuée
        $existingMatch = Match::where('user_id', $currentUser->id)
            ->where('matched_user_id', $userId)
            ->first();

        if ($existingMatch) {
            return response()->json([
                'message' => 'Vous avez déjà interagi avec ce profil'
            ], 422);
        }

        // Calculer la compatibilité
        $compatibility = $currentUser->calculateCompatibility($targetUser);

        $match = Match::create([
            'user_id' => $currentUser->id,
            'matched_user_id' => $userId,
            'action' => 'like',
            'compatibility_score' => $compatibility['score'],
            'compatibility_details' => $compatibility['factors'],
        ]);

        $response = [
            'message' => 'Like envoyé',
            'match' => $match,
            'compatibility_score' => $compatibility['score'],
            'is_match' => $match->is_mutual,
        ];

        if ($match->is_mutual) {
            $response['message'] = 'C\'est un match !';
        }

        return response()->json($response);
    }

    public function dislike(Request $request, $userId)
    {
        $currentUser = $request->user();

        // Vérifier si l'action n'a pas déjà été effectuée
        $existingMatch = Match::where('user_id', $currentUser->id)
            ->where('matched_user_id', $userId)
            ->first();

        if ($existingMatch) {
            return response()->json([
                'message' => 'Vous avez déjà interagi avec ce profil'
            ], 422);
        }

        Match::create([
            'user_id' => $currentUser->id,
            'matched_user_id' => $userId,
            'action' => 'dislike',
        ]);

        return response()->json([
            'message' => 'Profil passé'
        ]);
    }

    public function superLike(Request $request, $userId)
    {
        $currentUser = $request->user();
        $targetUser = User::active()->verified()->findOrFail($userId);

        // Vérifier si l'utilisateur a un abonnement actif
        if (!$currentUser->hasActiveSubscription) {
            return response()->json([
                'message' => 'Un abonnement actif est requis pour les super likes'
            ], 403);
        }

        // Vérifier si l'utilisateur n'est pas bloqué
        if ($currentUser->hasBlocked($userId) || $currentUser->isBlockedBy($userId)) {
            return response()->json([
                'message' => 'Action non autorisée'
            ], 403);
        }

        // Vérifier si l'action n'a pas déjà été effectuée
        $existingMatch = Match::where('user_id', $currentUser->id)
            ->where('matched_user_id', $userId)
            ->first();

        if ($existingMatch) {
            return response()->json([
                'message' => 'Vous avez déjà interagi avec ce profil'
            ], 422);
        }

        // Calculer la compatibilité
        $compatibility = $currentUser->calculateCompatibility($targetUser);

        $match = Match::create([
            'user_id' => $currentUser->id,
            'matched_user_id' => $userId,
            'action' => 'super_like',
            'compatibility_score' => $compatibility['score'],
            'compatibility_details' => $compatibility['factors'],
        ]);

        $response = [
            'message' => 'Super like envoyé',
            'match' => $match,
            'compatibility_score' => $compatibility['score'],
            'is_match' => $match->is_mutual,
        ];

        if ($match->is_mutual) {
            $response['message'] = 'C\'est un match !';
        }

        return response()->json($response);
    }

    public function getMatches(Request $request)
    {
        $user = $request->user();

        $matches = $user->mutualMatches()
            ->with(['matchedUser.primaryPhoto', 'matchedUser.photos'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($matches);
    }

    public function unmatch(Request $request, $matchId)
    {
        $user = $request->user();
        $match = Match::where('user_id', $user->id)
            ->where('id', $matchId)
            ->where('is_mutual', true)
            ->firstOrFail();

        // Supprimer les deux matches
        Match::where(function ($query) use ($match) {
            $query->where('user_id', $match->user_id)
                  ->where('matched_user_id', $match->matched_user_id);
        })->orWhere(function ($query) use ($match) {
            $query->where('user_id', $match->matched_user_id)
                  ->where('matched_user_id', $match->user_id);
        })->delete();

        return response()->json([
            'message' => 'Match supprimé'
        ]);
    }

    public function getCompatibilityDetails(Request $request, $userId)
    {
        $currentUser = $request->user();
        $targetUser = User::findOrFail($userId);

        $compatibility = $currentUser->calculateCompatibility($targetUser);

        return response()->json([
            'compatibility_score' => $compatibility['score'],
            'factors' => $compatibility['factors'],
            'recommendations' => $this->getCompatibilityRecommendations($compatibility['factors'])
        ]);
    }

    private function getCompatibilityRecommendations($factors)
    {
        $recommendations = [];

        if ($factors['denomination'] < 20) {
            $recommendations[] = 'Explorez vos différences de dénomination et trouvez des points communs dans votre foi.';
        }

        if ($factors['practice'] < 15) {
            $recommendations[] = 'Discutez de vos pratiques spirituelles respectives et trouvez un équilibre.';
        }

        if ($factors['interests'] < 10) {
            $recommendations[] = 'Découvrez de nouveaux intérêts ensemble pour renforcer votre connexion.';
        }

        if ($factors['age'] < 10) {
            $recommendations[] = 'La différence d\'âge peut apporter une richesse d\'expériences complémentaires.';
        }

        return $recommendations;
    }
}