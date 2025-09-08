<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan',
        'amount',
        'payment_method',
        'transaction_id',
        'status',
        'starts_at',
        'expires_at',
        'payment_proof',
        'verified_at',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'paid')
            ->where('expires_at', '>', now());
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function isActive()
    {
        return $this->status === 'paid' && $this->expires_at->isFuture();
    }

    public function isExpired()
    {
        return $this->expires_at->isPast();
    }

    public static function getPlanPrices()
    {
        return [
            'discovery' => 10000, // 1 mois
            'serious' => 25000,   // 3 mois
            'commitment' => 45000, // 6 mois
        ];
    }

    public static function getPlanDurations()
    {
        return [
            'discovery' => 1,  // mois
            'serious' => 3,    // mois
            'commitment' => 6, // mois
        ];
    }
}