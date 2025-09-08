<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('matched_user_id')->constrained('users')->onDelete('cascade');
            $table->enum('action', ['like', 'dislike', 'super_like']);
            $table->boolean('is_mutual')->default(false);
            $table->decimal('compatibility_score', 5, 2)->nullable();
            $table->json('compatibility_details')->nullable(); // Détails de compatibilité
            $table->timestamps();
            
            $table->unique(['user_id', 'matched_user_id']);
            $table->index(['user_id', 'is_mutual']);
            $table->index(['matched_user_id', 'is_mutual']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('matches');
    }
};