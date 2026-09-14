<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lab extends Model
{
    use HasFactory;

public const STATUS_ACTIVE = 'active';
public const STATUS_MAINTENANCE = 'maintenance';
public const STATUS_INACTIVE = 'inactive';

    protected $fillable = [
        'name',
        'code',
        'capacity',
        'description',
        'location',
        'status',


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
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Label status dalam Bahasa Indonesia.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_MAINTENANCE => 'Maintenance',
            self::STATUS_INACTIVE => 'Tidak Aktif',
            default => 'Aktif',
        };
    }
}
