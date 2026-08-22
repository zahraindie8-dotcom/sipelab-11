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
        $admin = User::where('role', 'admin')->first();
        $guru = User::where('role', 'guru')->first();
        $siswa = User::where('role', 'siswa')->first();

        if (! $admin || ! $guru || ! $siswa) {
            return;
        }

        $labs = Lab::where('status', Lab::STATUS_ACTIVE)->limit(4)->get();
        if ($labs->count() < 3) {
            return;
        }

        $bookings = [
            // Pending — menunggu approval
            [
                'user_id' => $siswa->id,
                'lab_id' => $labs[0]->id,
                'date' => now()->addDays(1)->toDateString(),
                'start_time' => '07:00:00',
                'end_time' => '09:00:00',
                'purpose' => 'Praktikum pemrograman dasar kelas X',
                'participant_count' => 24,
                'status' => Booking::STATUS_PENDING,
                'notes' => 'Praktikum pemrograman dasar kelas X.',
            ],
            // Approved — sudah disetujui
            [
                'user_id' => $siswa->id,
                'lab_id' => $labs[1]->id,
                'date' => now()->addDays(2)->toDateString(),
                'start_time' => '10:00:00',
                'end_time' => '12:00:00',
                'purpose' => 'Latihan ujian CBT',
                'participant_count' => 28,
                'status' => Booking::STATUS_APPROVED,
                'approved_by' => $guru->id,
                'approved_at' => now()->subHour(),
                'notes' => 'Latihan ujian CBT.',
            ],
            // Rejected — ditolak
            [
                'user_id' => $guru->id,
                'lab_id' => $labs[2]->id,
                'date' => now()->addDays(3)->toDateString(),
                'start_time' => '13:00:00',
                'end_time' => '15:00:00',
                'purpose' => 'Kegiatan ekstrakurikuler robotik',
                'participant_count' => 15,
                'status' => Booking::STATUS_REJECTED,
                'rejection_reason' => 'Jadwal bertabrakan dengan kegiatan sekolah.',
                'notes' => 'Jadwal bertabrakan dengan kegiatan sekolah.',
            ],
            // Cancelled — dibatalkan
            [
                'user_id' => $siswa->id,
                'lab_id' => $labs[0]->id,
                'date' => now()->addDays(4)->toDateString(),
                'start_time' => '14:00:00',
                'end_time' => '16:00:00',
                'purpose' => 'Belajar mandiri',
                'participant_count' => 5,
                'status' => Booking::STATUS_CANCELLED,
                'notes' => 'Dibatalkan karena jadwal berubah.',
            ],
            // Approved — booking guru
            [
                'user_id' => $guru->id,
                'lab_id' => $labs[0]->id,
                'date' => now()->addDays(5)->toDateString(),
                'start_time' => '08:00:00',
                'end_time' => '10:00:00',
                'purpose' => 'Praktikum jaringan komputer',
                'participant_count' => 30,
                'status' => Booking::STATUS_APPROVED,
                'approved_by' => $admin->id,
                'approved_at' => now()->subHours(2),
                'notes' => 'Praktikum jaringan komputer kelas XI.',
            ],
        ];

        foreach ($bookings as $booking) {
            Booking::create($booking);
        }
    }
}
