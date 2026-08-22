<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Lab;
use App\Models\User;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    /**
     * Seed beberapa booking contoh dengan berbagai status.
     */
    public function run(): void
    {
        $guru = User::where('role', 'guru')->first();
        $siswa = User::where('role', 'siswa')->first();

        if (! $guru || ! $siswa) {
            return;
        }

        $labs = Lab::limit(3)->get();

        $bookings = [
            [
                'user_id' => $guru->id,
                'lab_id' => $labs[0]->id,
                'date' => now()->addDays(1)->toDateString(),
                'start_time' => '07:00:00',
                'end_time' => '09:00:00',
                'status' => Booking::STATUS_PENDING,
                'notes' => 'Praktikum pemrograman dasar kelas X.',
            ],
            [
                'user_id' => $siswa->id,
                'lab_id' => $labs[1]->id,
                'date' => now()->addDays(2)->toDateString(),
                'start_time' => '10:00:00',
                'end_time' => '12:00:00',
                'status' => Booking::STATUS_APPROVED,
                'notes' => 'Latihan ujian CBT.',
            ],
            [
                'user_id' => $guru->id,
                'lab_id' => $labs[2]->id,
                'date' => now()->addDays(3)->toDateString(),
                'start_time' => '13:00:00',
                'end_time' => '15:00:00',
                'status' => Booking::STATUS_REJECTED,
                'notes' => 'Jadwal bertabrakan dengan kegiatan sekolah.',
            ],
        ];

        foreach ($bookings as $booking) {
            Booking::create($booking);
        }
    }
}
