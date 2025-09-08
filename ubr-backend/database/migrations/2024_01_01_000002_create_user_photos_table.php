<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('filename');
            $table->string('original_name');
            $table->string('path');
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
            
            $table->index(['user_id', 'is_primary']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_photos');
    }
};