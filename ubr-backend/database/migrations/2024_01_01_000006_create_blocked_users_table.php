<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('blocked_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('blocked_user_id')->constrained('users')->onDelete('cascade');
            $table->enum('reason', ['harassment', 'fake_profile', 'inappropriate', 'spam', 'other']);
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'blocked_user_id']);
            $table->index(['user_id', 'reason']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('blocked_users');
    }
};