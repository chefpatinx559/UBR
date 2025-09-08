<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Testimonial;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    public function run()
    {
        // Créer des utilisateurs de test
        $users = [
            [
                'first_name' => 'Marie',
                'last_name' => 'Kouassi',
                'email' => 'marie@test.com',
                'password' => Hash::make('password123'),
                'date_of_birth' => '1997-05-15',
                'gender' => 'female',
                'city' => 'Abidjan',
                'profession' => 'Infirmière',
                'denomination' => 'catholic',
                'practice_frequency' => 'daily',
                'church_involvement' => 'active',
                'about_me' => 'Je suis une femme de foi passionnée par le service à Dieu et aux autres.',
                'looking_for' => 'Je cherche un homme de Dieu pour construire une famille chrétienne.',
                'interests' => ['bible_study', 'worship', 'volunteering', 'reading'],
                'is_verified' => true,
            ],
            [
                'first_name' => 'Jean',
                'last_name' => 'Baptiste',
                'email' => 'jean@test.com',
                'password' => Hash::make('password123'),
                'date_of_birth' => '1992-08-20',
                'gender' => 'male',
                'city' => 'Abidjan',
                'profession' => 'Ingénieur',
                'denomination' => 'protestant',
                'practice_frequency' => 'daily',
                'church_involvement' => 'leader',
                'about_me' => 'Homme de Dieu passionné par la technologie et l\'évangélisation.',
                'looking_for' => 'Je cherche une femme de foi pour partager ma vie et servir Dieu ensemble.',
                'interests' => ['bible_study', 'technology', 'missions', 'music'],
                'is_verified' => true,
            ],
            [
                'first_name' => 'Grace',
                'last_name' => 'Koffi',
                'email' => 'grace@test.com',
                'password' => Hash::make('password123'),
                'date_of_birth' => '1995-03-10',
                'gender' => 'female',
                'city' => 'Bouaké',
                'profession' => 'Enseignante',
                'denomination' => 'evangelical',
                'practice_frequency' => 'weekly',
                'church_involvement' => 'active',
                'about_me' => 'Enseignante passionnée par l\'éducation et la musique chrétienne.',
                'looking_for' => 'Un partenaire spirituel pour une relation sérieuse.',
                'interests' => ['education', 'music', 'children', 'worship'],
                'is_verified' => true,
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }

        // Créer quelques témoignages de test
        $testimonials = [
            [
                'user_id' => 2,
                'partner_name' => 'Marie',
                'relationship_status' => 'married',
                'rating' => 5,
                'content' => 'Grâce à UBR, nous avons trouvé bien plus qu\'un partenaire, nous avons trouvé notre complément selon le plan de Dieu.',
                'city' => 'Abidjan',
                'is_approved' => true,
                'approved_at' => now(),
            ],
            [
                'user_id' => 3,
                'partner_name' => 'Paul',
                'relationship_status' => 'engaged',
                'rating' => 5,
                'content' => 'L\'algorithme de matching est incroyable ! Nous partageons les mêmes valeurs et la même vision du mariage chrétien.',
                'city' => 'Bouaké',
                'is_approved' => true,
                'approved_at' => now(),
            ],
        ];

        foreach ($testimonials as $testimonialData) {
            Testimonial::create($testimonialData);
        }

        $this->command->info('Utilisateurs de test créés avec succès');
        $this->command->info('Comptes de test :');
        $this->command->info('- marie@test.com / password123');
        $this->command->info('- jean@test.com / password123');
        $this->command->info('- grace@test.com / password123');
    }
}