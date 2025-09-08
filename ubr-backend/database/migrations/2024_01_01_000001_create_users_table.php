<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female']);
            $table->string('city');
            $table->string('profession')->nullable();
            $table->enum('education_level', ['high_school', 'bachelor', 'master', 'phd', 'other'])->nullable();
            
            // Informations spirituelles
            $table->enum('denomination', ['catholic', 'protestant', 'evangelical', 'pentecostal', 'orthodox', 'other']);
            $table->enum('practice_frequency', ['daily', 'weekly', 'monthly', 'occasionally']);
            $table->enum('church_involvement', ['leader', 'active', 'regular', 'occasional'])->nullable();
            $table->integer('conversion_years')->nullable();
            $table->string('current_church')->nullable();
            $table->string('ministry')->nullable();
            
            // Descriptions
            $table->text('about_me')->nullable();
            $table->text('looking_for')->nullable();
            $table->json('interests')->nullable(); // Array of interests
            
            // Préférences de recherche
            $table->integer('preferred_age_min')->default(20);
            $table->integer('preferred_age_max')->default(50);
            $table->integer('preferred_distance')->default(50); // en km
            $table->enum('preferred_denomination', ['any', 'catholic', 'protestant', 'evangelical', 'pentecostal', 'orthodox'])->default('any');
            $table->enum('preferred_spiritual_level', ['any', 'high', 'medium', 'growing'])->default('any');
            
            // Paramètres de confidentialité
            $table->boolean('profile_visible')->default(true);
            $table->boolean('match_notifications')->default(true);
            $table->boolean('message_notifications')->default(true);
            $table->boolean('spiritual_reminders')->default(true);
            $table->boolean('email_notifications')->default(true);
            $table->boolean('push_notifications')->default(false);
            $table->boolean('allow_non_match_messages')->default(false);
            $table->boolean('show_online_status')->default(true);
            
            // Statut et vérification
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_admin')->default(false);
            $table->enum('subscription_type', ['free', 'discovery', 'serious', 'commitment'])->default('free');
            $table->timestamp('subscription_expires_at')->nullable();
            $table->timestamp('last_active_at')->nullable();
            
            // Géolocalisation
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            $table->rememberToken();
            $table->timestamps();
            
            // Index pour les recherches
            $table->index(['city', 'is_active', 'is_verified']);
            $table->index(['gender', 'denomination', 'is_active']);
            $table->index(['date_of_birth', 'is_active']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};