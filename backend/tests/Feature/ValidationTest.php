<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Lab;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Memastikan validasi input di setiap endpoint tetap berjalan:
 * field wajib, format email/jam/tanggal, batas angka, tanggal masa lalu,
 * konflik jadwal, hingga ukuran & jenis file foto.
 */
class ValidationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $guru;
    private User $siswa;
    private Lab $lab;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->guru = User::factory()->create(['role' => 'guru']);
        $this->siswa = User::factory()->create(['role' => 'siswa']);
        $this->lab = Lab::factory()->create();
    }

    private function validBookingPayload(array $overrides = []): array
    {
        return array_merge([
            'lab_id' => $this->lab->id,
            'date' => now()->addDay()->toDateString(),
            'start_time' => '08:00',
            'end_time' => '10:00',
            'notes' => 'Praktikum uji validasi.',
        ], $overrides);
    }

    // ============================================================
    // Login
    // ============================================================

    public function test_login_menolak_email_kosong_atau_format_salah(): void
    {
        $this->postJson('/api/login', ['email' => '', 'password' => 'password'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->postJson('/api/login', ['email' => 'bukan-email', 'password' => 'password'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_login_menolak_password_kosong(): void
    {
        $this->postJson('/api/login', ['email' => 'admin@sipelab.test', 'password' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');
    }

    public function test_login_menolak_kredensial_salah(): void
    {
        $this->postJson('/api/login', [
            'email' => $this->siswa->email,
            'password' => 'salah-password',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    // ============================================================
    // Register
    // ============================================================

    public function test_register_menolak_data_tidak_lengkap(): void
    {
        $this->postJson('/api/register', ['email' => 'bukan-email', 'password' => '123'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_register_menolak_email_duplikat(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Duplikat',
            'email' => $this->siswa->email,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_register_menolak_password_kurang_dari_8_karakter(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Siswa Baru',
            'email' => 'baru@sipelab.test',
            'password' => '1234567',
            'password_confirmation' => '1234567',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');
    }

    public function test_register_menolak_konfirmasi_password_tidak_cocok(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Siswa Baru',
            'email' => 'baru@sipelab.test',
            'password' => 'password123',
            'password_confirmation' => 'berbeda123',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');
    }

    public function test_register_berhasil_dengan_data_valid(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Siswa Baru',
            'email' => 'baru@sipelab.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
            ->assertCreated()
            ->assertJsonPath('user.role', 'siswa');
    }

    // ============================================================
    // Lab
    // ============================================================

    public function test_lab_menolak_nama_dan_kapasitas_kosong(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/labs', ['name' => '', 'capacity' => '', 'description' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'capacity']);
    }

    public function test_lab_menolak_kapasitas_bukan_angka_atau_di_bawah_1(): void
    {
        foreach (['abc', 0, -5, 501] as $capacity) {
            $this->actingAs($this->admin, 'sanctum')
                ->postJson('/api/labs', ['name' => 'Lab X', 'capacity' => $capacity])
                ->assertUnprocessable()
                ->assertJsonValidationErrors('capacity');
        }
    }

    public function test_update_lab_menolak_kapasitas_invalid(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/labs/{$this->lab->id}", ['capacity' => 0])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('capacity');
    }

    // ============================================================
    // Booking
    // ============================================================

    public function test_booking_menolak_lab_tidak_dipilih_atau_tidak_ada(): void
    {
        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/bookings', $this->validBookingPayload(['lab_id' => '']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('lab_id');

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/bookings', $this->validBookingPayload(['lab_id' => 99999]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('lab_id');
    }

    public function test_booking_menolak_tanggal_di_masa_lalu_atau_format_salah(): void
    {
        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/bookings', $this->validBookingPayload(['date' => '2020-01-01']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('date');

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/bookings', $this->validBookingPayload(['date' => '20-08-2026']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('date');
    }

    public function test_booking_menolak_format_jam_salah(): void
    {
        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/bookings', $this->validBookingPayload(['start_time' => '8:00']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('start_time');

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/bookings', $this->validBookingPayload(['end_time' => '0800']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('end_time');
    }

    public function test_booking_menolak_jam_selesai_sebelum_atau_sama_dengan_jam_mulai(): void
    {
        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/bookings', $this->validBookingPayload(['end_time' => '07:00']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('end_time');

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/bookings', $this->validBookingPayload(['end_time' => '08:00']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('end_time');
    }

    public function test_update_booking_menolak_tanggal_masa_lalu_dan_jam_salah(): void
    {
        $booking = Booking::create([
            'user_id' => $this->siswa->id,
            'lab_id' => $this->lab->id,
            'date' => now()->addDay()->toDateString(),
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
            'status' => Booking::STATUS_PENDING,
        ]);

        $this->actingAs($this->siswa, 'sanctum')
            ->putJson("/api/bookings/{$booking->id}", ['date' => '2020-01-01'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('date');

        $this->actingAs($this->siswa, 'sanctum')
            ->putJson("/api/bookings/{$booking->id}", [
                'start_time' => '11:00',
                'end_time' => '10:00',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('end_time');

        $this->actingAs($this->siswa, 'sanctum')
            ->putJson("/api/bookings/{$booking->id}", ['lab_id' => 99999])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('lab_id');
    }

    public function test_booking_menolak_jadwal_bentrok_dengan_booking_disetujui(): void
    {
        $date = now()->addDay()->toDateString();

        Booking::create([
            'user_id' => $this->guru->id,
            'lab_id' => $this->lab->id,
            'date' => $date,
            'start_time' => '09:00:00',
            'end_time' => '11:00:00',
            'status' => Booking::STATUS_APPROVED,
        ]);

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/bookings', $this->validBookingPayload([
                'date' => $date,
                'start_time' => '10:00',
                'end_time' => '12:00',
            ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('schedule');
    }

    // ============================================================
    // Penolakan booking
    // ============================================================

    public function test_reject_menolak_alasan_terlalu_panjang(): void
    {
        $booking = Booking::create([
            'user_id' => $this->siswa->id,
            'lab_id' => $this->lab->id,
            'date' => now()->addDay()->toDateString(),
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
            'status' => Booking::STATUS_PENDING,
        ]);

        $this->actingAs($this->guru, 'sanctum')
            ->postJson("/api/bookings/{$booking->id}/reject", ['reason' => str_repeat('a', 1001)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('reason');

        // Tanpa alasan tetap boleh (opsional).
        $this->actingAs($this->guru, 'sanctum')
            ->postJson("/api/bookings/{$booking->id}/reject")
            ->assertOk();
    }

    // ============================================================
    // Laporan
    // ============================================================

    private function approvedBookingFor(User $user): Booking
    {
        return Booking::create([
            'user_id' => $user->id,
            'lab_id' => $this->lab->id,
            'date' => now()->addDay()->toDateString(),
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
            'status' => Booking::STATUS_APPROVED,
        ]);
    }

    public function test_report_menolak_foto_kosong_atau_bukan_gambar(): void
    {
        Storage::fake('public');

        $booking = $this->approvedBookingFor($this->siswa);

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/reports', ['booking_id' => $booking->id, 'description' => 'Tanpa foto.'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('photo');

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/reports', [
                'booking_id' => $booking->id,
                'description' => 'File bukan gambar.',
                'photo' => UploadedFile::fake()->create('catatan.txt', 100),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('photo');
    }

    public function test_report_menolak_booking_tidak_ditemukan(): void
    {
        Storage::fake('public');

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/reports', [
                'booking_id' => 99999,
                'description' => 'Booking tidak ada.',
                'photo' => UploadedFile::fake()->image('foto.jpg'),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('booking_id');
    }

    public function test_report_berhasil_dengan_foto_valid(): void
    {
        Storage::fake('public');

        $booking = $this->approvedBookingFor($this->siswa);

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/reports', [
                'booking_id' => $booking->id,
                'description' => 'Aktivitas praktikum.',
                'photo' => UploadedFile::fake()->image('foto.jpg'),
            ])
            ->assertCreated()
            ->assertJsonPath('data.booking_id', $booking->id);
    }
}
