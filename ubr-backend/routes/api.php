<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\MatchController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\BlockController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TestimonialController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ContactController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Routes publiques
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::post('/contact', [ContactController::class, 'send']);

// Témoignages publics
Route::get('/testimonials', [TestimonialController::class, 'index']);
Route::get('/testimonials/stats', [TestimonialController::class, 'getStats']);

// Routes protégées par authentification
Route::middleware(['auth:sanctum', 'update.activity'])->group(function () {
    
    // Authentification
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refreshToken']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Profil utilisateur
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/profile', [UserController::class, 'update']);
    Route::post('/users/photos', [UserController::class, 'uploadPhoto']);
    Route::delete('/users/photos/{photoId}', [UserController::class, 'deletePhoto']);
    Route::put('/users/photos/{photoId}/primary', [UserController::class, 'setPrimaryPhoto']);
    Route::get('/users/stats', [UserController::class, 'getStats']);
    Route::put('/users/location', [UserController::class, 'updateLocation']);
    
    // Matches
    Route::post('/matches/like/{userId}', [MatchController::class, 'like']);
    Route::post('/matches/dislike/{userId}', [MatchController::class, 'dislike']);
    Route::post('/matches/super-like/{userId}', [MatchController::class, 'superLike']);
    Route::get('/matches', [MatchController::class, 'getMatches']);
    Route::delete('/matches/{matchId}', [MatchController::class, 'unmatch']);
    Route::get('/matches/compatibility/{userId}', [MatchController::class, 'getCompatibilityDetails']);
    
    // Messages
    Route::get('/messages/conversations', [MessageController::class, 'getConversations']);
    Route::get('/messages/{conversationId}', [MessageController::class, 'getMessages']);
    Route::get('/messages/conversation/{userId}', [MessageController::class, 'getConversation']);
    Route::post('/messages', [MessageController::class, 'sendMessage']);
    Route::put('/messages/{messageId}/read', [MessageController::class, 'markAsRead']);
    Route::delete('/messages/{messageId}', [MessageController::class, 'deleteMessage']);
    
    // Blocage d'utilisateurs
    Route::post('/users/{userId}/block', [BlockController::class, 'block']);
    Route::delete('/users/{userId}/unblock', [BlockController::class, 'unblock']);
    Route::get('/blocked-users', [BlockController::class, 'getBlocked']);
    Route::delete('/blocked-users/clear', [BlockController::class, 'clearAll']);
    
    // Signalements
    Route::post('/reports', [ReportController::class, 'store']);
    Route::get('/reports', [ReportController::class, 'index']);
    Route::get('/reports/{trackingNumber}', [ReportController::class, 'show']);
    
    // Témoignages
    Route::post('/testimonials', [TestimonialController::class, 'store']);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{notificationId}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notificationId}', [NotificationController::class, 'delete']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
});

// Routes administrateur
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    
    // Statistiques
    Route::get('/stats', [AdminController::class, 'getStats']);
    
    // Gestion des utilisateurs
    Route::get('/users', [AdminController::class, 'getUsers']);
    Route::put('/users/{userId}/suspend', [AdminController::class, 'suspendUser']);
    Route::delete('/users/{userId}', [AdminController::class, 'deleteUser']);
    
    // Gestion des signalements
    Route::get('/reports', [AdminController::class, 'getReports']);
    Route::put('/reports/{reportId}', [AdminController::class, 'handleReport']);
    
    // Gestion des témoignages
    Route::get('/testimonials', [AdminController::class, 'getTestimonials']);
    Route::put('/testimonials/{testimonialId}/approve', [AdminController::class, 'approveTestimonial']);
    Route::delete('/testimonials/{testimonialId}', [AdminController::class, 'rejectTestimonial']);
    
    // Gestion des abonnements
    Route::get('/subscriptions', [AdminController::class, 'getSubscriptions']);
    Route::put('/subscriptions/{subscriptionId}/verify', [AdminController::class, 'verifySubscription']);
});

// Route de test pour vérifier que l'API fonctionne
Route::get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'message' => 'UBR API is running',
        'timestamp' => now()->toISOString()
    ]);
});