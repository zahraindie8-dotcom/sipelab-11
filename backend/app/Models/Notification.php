<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    public const TYPE_BOOKING_CREATED = 'booking_created';
    public const TYPE_BOOKING_APPROVED = 'booking_approved';
    public const TYPE_BOOKING_REJECTED = 'booking_rejected';
    public const TYPE_BOOKING_CANCELLED = 'booking_cancelled';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'booking_id',
        'is_read',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_read' => 'boolean',
    ];

    /**
     * Relasi ke user penerima notifikasi.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke booking terkait.
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Tandai notifikasi sudah dibaca.
     */
    public function markAsRead(): void
    {
        $this->update(['is_read' => true]);
    }

    /**
     * Label jenis notifikasi dalam Bahasa Indonesia.
     */
    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            self::TYPE_BOOKING_CREATED => 'Booking Dibuat',
            self::TYPE_BOOKING_APPROVED => 'Booking Disetujui',
            self::TYPE_BOOKING_REJECTED => 'Booking Ditolak',
            self::TYPE_BOOKING_CANCELLED => 'Booking Dibatalkan',
            default => 'Notifikasi',
        };
    }
}
