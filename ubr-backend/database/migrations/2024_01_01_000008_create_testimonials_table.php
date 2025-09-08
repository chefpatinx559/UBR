<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('partner_name')->nullable();
            $table->enum('relationship_status', ['dating', 'engaged', 'married']);
            $table->integer('rating'); // 1-5 stars
            $table->text('content');
            $table->string('city')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->boolean('is_approved')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            
            $table->index(['is_approved', 'rating', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('testimonials');
    }
};