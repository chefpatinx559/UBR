<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'date_of_birth',
        'gender',
        'city',
        'profession',
        'education_level',
        'denomination',
        'practice_frequency',
        'church_involvement',
        'conversion_years',
        'current_church',
        'ministry',
        'about_me',
        'looking_for',
        'interests',
        'preferred_age_min',
        'preferred_age_max',
        'preferred_distance',
        'preferred_denomination',
        'preferred_spiritual_level',
        'profile_visible',
        'match_notifications',
        'message_notifications',
        'spiritual_reminders',
        'email_notifications',
        'push_notifications',
        'allow_non_match_messages',
        'show_online_status',
        'subscription_type',
        'subscription_expires_at',
        'latitude',
        'longitude',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'date_of_birth' => 'date',
        'subscription_expires_at' => 'datetime',
        'last_active_at' => 'datetime',
        'interests' => 'array',
        'profile_visible' => 'boolean',
        'match_notifications' => 'boolean',
        'message_notifications' => 'boolean',
        'spiritual_reminders' => 'boolean',
        'email_notifications' => 'boolean',
        'push_notifications' => 'boolean',
        'allow_non_match_messages' => 'boolean',
        'show_online_status' => 'boolean',
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
        'is_admin' => 'boolean',
        'password' => 'hashed',
    ];

    // Relationships
    public function photos()
    {
        return $this->hasMany(UserPhoto::class)->orderBy('order');
    }

    public function primaryPhoto()
    {
        return $this->hasOne(UserPhoto::class)->where('is_primary', true);
    }

    public function sentMatches()
    {
        return $this->hasMany(Match::class, 'user_id');
    }

    public function receivedMatches()
    {
        return $this->hasMany(Match::class, 'matched_user_id');
    }

    public function mutualMatches()
    {
        return $this->hasMany(Match::class, 'user_id')->where('is_mutual', true);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class, 'user1_id')
            ->orWhere('user2_id', $this->id);
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function blockedUsers()
    {
        return $this->hasMany(BlockedUser::class, 'user_id');
    }

    public function blockedBy()
    {
        return $this->hasMany(BlockedUser::class, 'blocked_user_id');
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    public function reportedBy()
    {
        return $this->hasMany(Report::class, 'reported_user_id');
    }

    public function testimonials()
    {
        return $this->hasMany(Testimonial::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class)->orderBy('created_at', 'desc');
    }

    // Accessors
    public function age(): Attribute
    {
        return Attribute::make(
            get: fn () => Carbon::parse($this->date_of_birth)->age,
        );
    }

    public function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->first_name . ' ' . $this->last_name,
        );
    }

    public function isOnline(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->last_active_at && $this->last_active_at->diffInMinutes(now()) <= 15,
        );
    }

    public function hasActiveSubscription(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->subscription_expires_at && $this->subscription_expires_at->isFuture(),
        );
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeVisible($query)
    {
        return $query->where('profile_visible', true);
    }

    public function scopeInRadius($query, $latitude, $longitude, $radius = 50)
    {
        return $query->whereRaw(
            "(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) <= ?",
            [$latitude, $longitude, $latitude, $radius]
        );
    }

    public function scopeCompatibleAge($query, $user)
    {
        $userAge = $user->age;
        return $query->whereBetween('date_of_birth', [
            now()->subYears($user->preferred_age_max)->format('Y-m-d'),
            now()->subYears($user->preferred_age_min)->format('Y-m-d')
        ]);
    }

    // Methods
    public function updateLastActive()
    {
        $this->update(['last_active_at' => now()]);
    }

    public function hasLiked($userId)
    {
        return $this->sentMatches()
            ->where('matched_user_id', $userId)
            ->where('action', 'like')
            ->exists();
    }

    public function hasBlocked($userId)
    {
        return $this->blockedUsers()
            ->where('blocked_user_id', $userId)
            ->exists();
    }

    public function isBlockedBy($userId)
    {
        return $this->blockedBy()
            ->where('user_id', $userId)
            ->exists();
    }

    public function calculateCompatibility($otherUser)
    {
        $score = 0;
        $factors = [];

        // Dénomination (30%)
        if ($this->denomination === $otherUser->denomination) {
            $score += 30;
            $factors['denomination'] = 30;
        } elseif (in_array($this->denomination, ['catholic', 'orthodox']) && in_array($otherUser->denomination, ['catholic', 'orthodox'])) {
            $score += 20;
            $factors['denomination'] = 20;
        } elseif (in_array($this->denomination, ['protestant', 'evangelical', 'pentecostal']) && in_array($otherUser->denomination, ['protestant', 'evangelical', 'pentecostal'])) {
            $score += 25;
            $factors['denomination'] = 25;
        } else {
            $factors['denomination'] = 0;
        }

        // Fréquence de pratique (25%)
        $practiceScore = [
            'daily' => 4,
            'weekly' => 3,
            'monthly' => 2,
            'occasionally' => 1
        ];
        $userPractice = $practiceScore[$this->practice_frequency] ?? 0;
        $otherPractice = $practiceScore[$otherUser->practice_frequency] ?? 0;
        $practiceDiff = abs($userPractice - $otherPractice);
        $practiceCompatibility = max(0, 25 - ($practiceDiff * 8));
        $score += $practiceCompatibility;
        $factors['practice'] = $practiceCompatibility;

        // Intérêts communs (20%)
        $userInterests = $this->interests ?? [];
        $otherInterests = $otherUser->interests ?? [];
        $commonInterests = array_intersect($userInterests, $otherInterests);
        $interestScore = min(20, count($commonInterests) * 3);
        $score += $interestScore;
        $factors['interests'] = $interestScore;

        // Âge compatible (15%)
        $ageDiff = abs($this->age - $otherUser->age);
        $ageScore = max(0, 15 - ($ageDiff * 1.5));
        $score += $ageScore;
        $factors['age'] = $ageScore;

        // Engagement dans l'église (10%)
        $involvementScore = [
            'leader' => 4,
            'active' => 3,
            'regular' => 2,
            'occasional' => 1
        ];
        $userInvolvement = $involvementScore[$this->church_involvement] ?? 0;
        $otherInvolvement = $involvementScore[$otherUser->church_involvement] ?? 0;
        $involvementDiff = abs($userInvolvement - $otherInvolvement);
        $involvementCompatibility = max(0, 10 - ($involvementDiff * 3));
        $score += $involvementCompatibility;
        $factors['involvement'] = $involvementCompatibility;

        return [
            'score' => round($score, 2),
            'factors' => $factors
        ];
    }
}