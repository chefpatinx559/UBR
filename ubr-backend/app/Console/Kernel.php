<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Rappels spirituels quotidiens à 8h
        $schedule->command('ubr:spiritual-reminders')
            ->dailyAt('08:00')
            ->timezone('Africa/Abidjan');

        // Nettoyage des abonnements expirés tous les jours à minuit
        $schedule->command('ubr:cleanup-subscriptions')
            ->dailyAt('00:00')
            ->timezone('Africa/Abidjan');

        // Nettoyage des tokens expirés
        $schedule->command('sanctum:prune-expired --hours=24')
            ->daily();

        // Sauvegarde de la base de données (si configurée)
        // $schedule->command('backup:run')->daily();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}