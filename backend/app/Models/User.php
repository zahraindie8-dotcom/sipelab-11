<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Role yang tersedia di sistem.
     */
    public const ROLES = ['admin', 'guru', 'siswa'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
        'remember_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Relasi ke booking yang dibuat user.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Relasi ke laporan yang diunggah user.
     */
    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    /**
     * Relasi ke notifikasi yang diterima user.
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Jumlah notifikasi belum dibaca.
     */
    public function getUnreadNotificationCountAttribute(): int
    {
        return $this->notifications()->where('is_read', false)->count();
    }

    /**
     * Cek apakah user adalah admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Cek apakah user dapat menyetujui booking (admin atau guru).
     */
    public function canApprove(): bool
    {
        return in_array($this->role, ['admin', 'guru'], true);
    }

    /**
     * Label role dalam Bahasa Indonesia.
     */
    public function getRoleLabelAttribute(): string
    {
        return match ($this->role) {
            'admin' => 'Admin',
            'guru' => 'Guru',
            default => 'Siswa',
        };
    }
}
