<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lab extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'capacity',
        'description',
        'location',

    ];

    /**
     * Relasi ke booking di lab ini.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Karena tabel labs saat ini tidak memiliki kolom status,
     * semua lab dianggap aktif/tersedia.
     */
    public function isAvailable(): bool
    {
        return true;
    }

    /**
     * Status lab saat ini.
     */
    public function getStatusAttribute(): string
    {
        return 'active';
    }

    /**
     * Label status dalam Bahasa Indonesia.
     */
    public function getStatusLabelAttribute(): string
    {
        return 'Aktif';
    }
}
