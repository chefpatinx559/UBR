<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Notification;

class SendSpiritualReminders extends Command
{
    protected $signature = 'ubr:spiritual-reminders';
    protected $description = 'Send daily spiritual reminders to users';

    public function handle()
    {
        $verses = [
            "Celui qui trouve une épouse trouve le bonheur; c'est une grâce qu'il obtient de l'Éternel. - Proverbes 18:22",
            "C'est pourquoi l'homme quittera son père et sa mère, et s'attachera à sa femme, et ils deviendront une seule chair. - Genèse 2:24",
            "Que le mariage soit honoré de tous, et le lit conjugal exempt de souillure. - Hébreux 13:4",
            "Maris, aimez vos femmes, comme Christ a aimé l'Église. - Éphésiens 5:25",
            "L'amour est patient, il est plein de bonté; l'amour n'est point envieux. - 1 Corinthiens 13:4",
        ];

        $users = User::active()
            ->where('spiritual_reminders', true)
            ->get();

        $verse = $verses[array_rand($verses)];

        foreach ($users as $user) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'spiritual',
                'title' => 'Rappel spirituel du jour',
                'content' => $verse,
                'data' => ['type' => 'daily_verse']
            ]);
        }

        $this->info("Rappels spirituels envoyés à {$users->count()} utilisateurs");
    }
}