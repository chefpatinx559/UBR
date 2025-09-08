<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'receiver_id',
        'content',
        'type',
        'attachment_path',
        'is_read',
        'read_at',
        'is_deleted_by_sender',
        'is_deleted_by_receiver',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'is_deleted_by_sender' => 'boolean',
        'is_deleted_by_receiver' => 'boolean',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function scopeNotDeletedBy($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('sender_id', $userId)->where('is_deleted_by_sender', false)
              ->orWhere('receiver_id', $userId)->where('is_deleted_by_receiver', false);
        });
    }

    protected static function boot()
    {
        parent::boot();

        static::created(function ($message) {
            // Update conversation last message time
            $message->conversation->update(['last_message_at' => $message->created_at]);

            // Send notification to receiver
            if ($message->receiver->message_notifications) {
                Notification::create([
                    'user_id' => $message->receiver_id,
                    'type' => 'message',
                    'title' => 'Nouveau message',
                    'content' => $message->sender->first_name . ' vous a envoyé un message',
                    'data' => [
                        'sender_id' => $message->sender_id,
                        'conversation_id' => $message->conversation_id,
                        'message_preview' => substr($message->content, 0, 50)
                    ]
                ]);
            }
        });
    }
}