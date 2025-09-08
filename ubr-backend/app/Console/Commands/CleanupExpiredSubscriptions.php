<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Subscription;
use App\Models\Notification;

class CleanupExpiredSubscriptions extends Command
{
    protected $signature = 'ubr:cleanup-subscriptions';
    protected $description = 'Cleanup expired subscriptions and notify users';

    public function handle()
    {
        // Trouver les abonnements expirés
        $expiredSubscriptions = Subscription::where('status', 'paid')
            ->where('expires_at', '<', now())
            ->with('user')
            ->get();

        foreach ($expiredSubscriptions as $subscription) {
            // Marquer l'abonnement comme expiré
            $subscription->update(['status' => 'expired']);

            // Mettre à jour l'utilisateur
            $subscription->user->update([
                'subscription_type' => 'free',
                'subscription_expires_at' => null,
            ]);

            // Notifier l'utilisateur
            Notification::create([
                'user_id' => $subscription->user_id,
                'type' => 'system',
                'title' => 'Abonnement expiré',
                'content' => 'Votre abonnement ' . ucfirst($subscription->plan) . ' a expiré. Renouvelez-le pour continuer à profiter de tous les avantages.',
                'data' => ['subscription_id' => $subscription->id]
            ]);
        }

        $this->info("Nettoyage terminé : {$expiredSubscriptions->count()} abonnements expirés traités");
    }
}