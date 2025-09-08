<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'reporter_id',
        'reported_user_id',
        'tracking_number',
        'type',
        'urgency',
        'description',
        'evidence',
        'status',
        'admin_notes',
        'handled_by',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function reportedUser()
    {
        return $this->belongsTo(User::class, 'reported_user_id');
    }

    public function handler()
    {
        return $this->belongsTo(User::class, 'handled_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeUrgent($query)
    {
        return $query->where('urgency', 'high');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($report) {
            if (!$report->tracking_number) {
                $report->tracking_number = 'UBR-' . strtoupper(Str::random(6));
            }
        });
    }
}