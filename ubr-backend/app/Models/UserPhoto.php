<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class UserPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'filename',
        'original_name',
        'path',
        'is_primary',
        'is_verified',
        'order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'is_verified' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getUrlAttribute()
    {
        return Storage::url($this->path);
    }

    public function getFullPathAttribute()
    {
        return storage_path('app/public/' . $this->path);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($photo) {
            if ($photo->is_primary) {
                // Ensure only one primary photo per user
                static::where('user_id', $photo->user_id)
                    ->where('is_primary', true)
                    ->update(['is_primary' => false]);
            }
        });

        static::deleting(function ($photo) {
            // Delete the actual file
            if (Storage::exists('public/' . $photo->path)) {
                Storage::delete('public/' . $photo->path);
            }
        });
    }
}