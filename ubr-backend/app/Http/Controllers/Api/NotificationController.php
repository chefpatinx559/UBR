<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = $user->notifications();

        // Filtrer par type si spécifié
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        $notifications = $query->paginate(20);

        return response()->json($notifications);
    }

    public function markAsRead(Request $request, $notificationId)
    {
        $user = $request->user();
        $notification = $user->notifications()->findOrFail($notificationId);

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marquée comme lue'
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        
        $count = $user->notifications()->unread()->count();
        $user->notifications()->unread()->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'message' => "Toutes les notifications ont été marquées comme lues ($count notifications)"
        ]);
    }

    public function delete(Request $request, $notificationId)
    {
        $user = $request->user();
        $notification = $user->notifications()->findOrFail($notificationId);

        $notification->delete();

        return response()->json([
            'message' => 'Notification supprimée'
        ]);
    }

    public function getUnreadCount(Request $request)
    {
        $user = $request->user();
        $count = $user->notifications()->unread()->count();

        return response()->json([
            'unread_count' => $count
        ]);
    }
}