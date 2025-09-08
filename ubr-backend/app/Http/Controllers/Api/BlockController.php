<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\BlockedUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BlockController extends Controller
{
    public function block(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|in:harassment,fake_profile,inappropriate,spam,other',
            'description' => 'sometimes|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $currentUser = $request->user();
        $targetUser = User::findOrFail($userId);

        // Vérifier que l'utilisateur ne se bloque pas lui-même
        if ($currentUser->id === $userId) {
            return response()->json([
                'message' => 'Vous ne pouvez pas vous bloquer vous-même'
            ], 422);
        }

        // Vérifier si l'utilisateur n'est pas déjà bloqué
        $existingBlock = BlockedUser::where('user_id', $currentUser->id)
            ->where('blocked_user_id', $userId)
            ->first();

        if ($existingBlock) {
            return response()->json([
                'message' => 'Utilisateur déjà bloqué'
            ], 422);
        }

        $block = BlockedUser::create([
            'user_id' => $currentUser->id,
            'blocked_user_id' => $userId,
            'reason' => $request->reason,
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Utilisateur bloqué avec succès',
            'block' => $block->load('blockedUser.primaryPhoto')
        ], 201);
    }

    public function unblock(Request $request, $userId)
    {
        $currentUser = $request->user();

        $block = BlockedUser::where('user_id', $currentUser->id)
            ->where('blocked_user_id', $userId)
            ->firstOrFail();

        $block->delete();

        return response()->json([
            'message' => 'Utilisateur débloqué avec succès'
        ]);
    }

    public function getBlocked(Request $request)
    {
        $user = $request->user();

        $blocked = $user->blockedUsers()
            ->with('blockedUser.primaryPhoto')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($blocked);
    }

    public function clearAll(Request $request)
    {
        $user = $request->user();

        $count = $user->blockedUsers()->count();
        $user->blockedUsers()->delete();

        return response()->json([
            'message' => "Tous les utilisateurs bloqués ont été débloqués ($count utilisateurs)"
        ]);
    }
}