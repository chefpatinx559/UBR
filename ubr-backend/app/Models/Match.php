<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Match extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'matched_user_id',
        'action',
        'is_mutual',
        'compatibility_score',
        'compatibility_details',
    ];

    protected $casts = [
        'is_mutual' => 'boolean',
        'compatibility_details' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function matchedUser()
    {
        return $this->belongsTo(User::class, 'matched_user_id');
    }

    public function scopeMutual($query)
    {
        return $query->where('is_mutual', true);
    }

    public function scopeLikes($query)
    {
        return $query->where('action', 'like');
    }

    public function scopeSuperLikes($query)
    {
        return $query->where('action', 'super_like');
    }

    protected static function boot()
    {
        parent::boot();

        static::created(function ($match) {
            if ($match->action === 'like' || $match->action === 'super_like') {
                // Check if there's a mutual match
                $reverseMatch = static::where('user_id', $match->matched_user_id)
                    ->where('matched_user_id', $match->user_id)
                    ->whereIn('action', ['like', 'super_like'])
                    ->first();

                if ($reverseMatch) {
                    // Update both matches as mutual
                    $match->update(['is_mutual' => true]);
                    $reverseMatch->update(['is_mutual' => true]);

                    // Create conversation
                    Conversation::firstOrCreate([
                        'user1_id' => min($match->user_id, $match->matched_user_id),
                        'user2_id' => max($match->user_id, $match->matched_user_id),
                    ]);

                    // Send notifications
                    Notification::create([
                        'user_id' => $match->user_id,
                        'type' => 'match',
                        'title' => 'Nouveau match !',
                        'content' => 'Vous avez un nouveau match mutuel !',
                        'data' => ['matched_user_id' => $match->matched_user_id]
                    ]);

                    Notification::create([
                        'user_id' => $match->matched_user_id,
                        'type' => 'match',
                        'title' => 'Nouveau match !',
                        'content' => 'Vous avez un nouveau match mutuel !',
                        'data' => ['matched_user_id' => $match->user_id]
                    ]);
                }
            }
        });
    }
}