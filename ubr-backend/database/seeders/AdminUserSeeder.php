<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'UBR',
            'email' => 'admin@ubr.ci',
            'password' => Hash::make('admin123'),
            'date_of_birth' => '1990-01-01',
            'gender' => 'male',
            'city' => 'Abidjan',
            'denomination' => 'catholic',
            'practice_frequency' => 'daily',
            'is_admin' => true,
            'is_verified' => true,
            'email_verified_at' => now(),
        ]);

        $this->command->info('Utilisateur administrateur créé : admin@ubr.ci / admin123');
    }
}