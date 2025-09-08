<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('reported_user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('tracking_number')->unique();
            $table->enum('type', ['fake_profile', 'inappropriate_content', 'harassment', 'scam', 'underage', 'impersonation', 'technical_issue', 'other']);
            $table->enum('urgency', ['low', 'medium', 'high'])->default('low');
            $table->text('description');
            $table->text('evidence')->nullable();
            $table->enum('status', ['pending', 'investigating', 'resolved', 'dismissed'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->foreignId('handled_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'urgency', 'created_at']);
            $table->index(['reporter_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('reports');
    }
};