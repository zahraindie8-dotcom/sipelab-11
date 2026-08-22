<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lab extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'capacity',
        'description',
    ];

    /**
     * Relasi ke booking di lab ini.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
