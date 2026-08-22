<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'booking_id',
        'user_id',
        'photo',
        'description',
    ];

    /**
     * Relasi ke booking terkait.
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Relasi ke user yang membuat laporan.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * URL lengkap foto bukti.
     */
    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo
            ? asset('storage/'.$this->photo)
            : null;
    }
}
