<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'lab_id',
        'date',
        'start_time',
        'end_time',
        'status',
        'notes',
    ];

    // Catatan: kolom 'date' sengaja TIDAK di-cast ke Carbon. Kolom DATE harus
    // diperlakukan sebagai string murni ('Y-m-d') agar query where('date', ...)
    // dan perbandingan jadwal tidak bergeser akibat konversi zona waktu.

    /**
     * Relasi ke user pemesan.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke lab yang dipesan.
     */
    public function lab()
    {
        return $this->belongsTo(Lab::class);
    }

    /**
     * Relasi ke laporan penggunaan lab.
     */
    public function report()
    {
        return $this->hasOne(Report::class);
    }

    /**
     * Scope: booking yang statusnya disetujui.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * Scope: booking yang rentang waktunya tumpang tindih dengan tanggal & jam tertentu.
     *
     * Input jam bisa format H:i ("10:00") atau H:i:s ("10:00:00"); keduanya
     * dinormalisasi ke H:i:s agar cocok dengan kolom TIME di database.
     *
     * @param  string|null  $exceptId  Booking yang dikecualikan (saat edit).
     */
    public function scopeOverlapping($query, $date, $startTime, $endTime, $exceptId = null)
    {
        $start = strlen($startTime) === 5 ? $startTime.':00' : $startTime;
        $end = strlen($endTime) === 5 ? $endTime.':00' : $endTime;

        return $query->where('date', $date)
            ->where(function ($q) use ($start, $end) {
                $q->where('start_time', '<', $end)
                    ->where('end_time', '>', $start);
            })
            ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId));
    }

    /**
     * Label status dalam Bahasa Indonesia.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_APPROVED => 'Disetujui',
            self::STATUS_REJECTED => 'Ditolak',
            default => 'Menunggu',
        };
    }
}
