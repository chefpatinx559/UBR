<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    public function getConversations(Request $request)
    {
        $user = $request->user();

        $conversations = Conversation::where('user1_id', $user->id)
            ->orWhere('user2_id', $user->id)
            ->with(['lastMessage', 'user1.primaryPhoto', 'user2.primaryPhoto'])
            ->orderBy('last_message_at', 'desc')
            ->get();

        $conversations->transform(function ($conversation) use ($user) {
            $otherUser = $conversation->getOtherUser($user->id);
            $conversation->other_user = $otherUser;
            $conversation->unread_count = $conversation->messages()
                ->where('receiver_id', $user->id)
                ->where('is_read', false)
                ->count();
            return $conversation;
        });

        return response()->json($conversations);
    }

    public function getMessages(Request $request, $conversationId)
    {
        $user = $request->user();
        
        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($query) use ($user) {
                $query->where('user1_id', $user->id)
                      ->orWhere('user2_id', $user->id);
            })
            ->firstOrFail();

        $messages = $conversation->messages()
            ->notDeletedBy($user->id)
            ->with(['sender.primaryPhoto'])
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        // Marquer les messages comme lus
        $conversation->markAsRead($user->id);

        return response()->json($messages);
    }

    public function sendMessage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string|max:1000',
            'type' => 'sometimes|in:text,image,voice,file',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $sender = $request->user();
        $receiverId = $request->receiver_id;

        // Vérifier que l'utilisateur n'est pas bloqué
        if ($sender->hasBlocked($receiverId) || $sender->isBlockedBy($receiverId)) {
            return response()->json([
                'message' => 'Impossible d\'envoyer un message à cet utilisateur'
            ], 403);
        }

        // Vérifier s'il y a un match ou si les messages non-match sont autorisés
        $hasMatch = Match::where('user_id', $sender->id)
            ->where('matched_user_id', $receiverId)
            ->where('is_mutual', true)
            ->exists();

        $receiver = User::findOrFail($receiverId);
        
        if (!$hasMatch && !$receiver->allow_non_match_messages) {
            return response()->json([
                'message' => 'Vous devez avoir un match mutuel pour envoyer un message'
            ], 403);
        }

        // Créer ou récupérer la conversation
        $conversation = Conversation::firstOrCreate([
            'user1_id' => min($sender->id, $receiverId),
            'user2_id' => max($sender->id, $receiverId),
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $sender->id,
            'receiver_id' => $receiverId,
            'content' => $request->content,
            'type' => $request->type ?? 'text',
        ]);

        return response()->json([
            'message' => 'Message envoyé',
            'data' => $message->load('sender.primaryPhoto')
        ], 201);
    }

    public function markAsRead(Request $request, $messageId)
    {
        $user = $request->user();
        $message = Message::where('receiver_id', $user->id)->findOrFail($messageId);

        $message->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'message' => 'Message marqué comme lu'
        ]);
    }

    public function deleteMessage(Request $request, $messageId)
    {
        $user = $request->user();
        $message = Message::where(function ($query) use ($user) {
            $query->where('sender_id', $user->id)
                  ->orWhere('receiver_id', $user->id);
        })->findOrFail($messageId);

        if ($message->sender_id === $user->id) {
            $message->update(['is_deleted_by_sender' => true]);
        } else {
            $message->update(['is_deleted_by_receiver' => true]);
        }

        return response()->json([
            'message' => 'Message supprimé'
        ]);
    }

    public function getConversation(Request $request, $userId)
    {
        $currentUser = $request->user();
        
        $conversation = Conversation::where(function ($query) use ($currentUser, $userId) {
            $query->where('user1_id', $currentUser->id)->where('user2_id', $userId);
        })->orWhere(function ($query) use ($currentUser, $userId) {
            $query->where('user1_id', $userId)->where('user2_id', $currentUser->id);
        })->first();

        if (!$conversation) {
            return response()->json([
                'message' => 'Aucune conversation trouvée'
            ], 404);
        }

        $messages = $conversation->messages()
            ->notDeletedBy($currentUser->id)
            ->with(['sender.primaryPhoto'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Marquer comme lu
        $conversation->markAsRead($currentUser->id);

        return response()->json([
            'conversation' => $conversation,
            'messages' => $messages,
            'other_user' => $conversation->getOtherUser($currentUser->id)
        ]);
    }
}