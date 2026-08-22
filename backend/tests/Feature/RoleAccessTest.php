<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Lab;
use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Memastikan pembedaan akses admin / guru / siswa tidak berubah:
 * - Admin : kelola lab, semua booking, persetujuan, semua laporan
 * - Guru  : persetujuan, semua booking (tanpa kelola lab)
 * - Siswa : hanya data miliknya (booking & laporan), tidak boleh menyetujui
 */
class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $guru;
    private User $siswa;
    private User $siswaLain;
    private Lab $lab;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->guru = User::factory()->create(['role' => 'guru']);
        $this->siswa = User::factory()->create(['role' => 'siswa']);
        $this->siswaLain = User::factory()->create(['role' => 'siswa']);
        $this->lab = Lab::factory()->create(['status' => Lab::STATUS_ACTIVE]);
    }

    private function createBooking(User $user, array $overrides = []): Booking
    {
        return Booking::create(array_merge([
            'user_id' => $user->id,
            'lab_id' => $this->lab->id,
            'date' => now()->addDay()->toDateString(),
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
            'status' => Booking::STATUS_PENDING,
        ], $overrides));
    }

    private function createReport(User $user): Report
    {
        $booking = $this->createBooking($user, ['status' => Booking::STATUS_APPROVED]);

        return Report::create([
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'photo' => 'reports/foto-uji.jpg',
            'description' => 'Aktivitas praktikum uji.',
        ]);
    }

    // ============================================================
    // Dashboard
    // ============================================================

    public function test_dashboard_siswa_hanya_menampilkan_statistik_booking_miliknya(): void
    {
        $this->createBooking($this->siswa);
        $this->createBooking($this->siswa);
        $this->createBooking($this->siswaLain);
        $this->createBooking($this->guru);

        $response = $this->actingAs($this->siswa, 'sanctum')->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonPath('stats.total_bookings', 2)
            ->assertJsonCount(0, 'pending_approvals');
    }

    public function test_dashboard_admin_dan_guru_melihat_semua_booking_dan_antrian_persetujuan(): void
    {
        $this->createBooking($this->siswa);
        $this->createBooking($this->siswaLain);

        foreach ([$this->admin, $this->guru] as $user) {
            $this->actingAs($user, 'sanctum')->getJson('/api/dashboard')
                ->assertOk()
                ->assertJsonPath('stats.total_bookings', 2)
                ->assertJsonCount(2, 'pending_approvals');
        }
    }

    public function test_dashboard_siswa_hanya_menampilkan_booking_disetujui_yang_akan_datang(): void
    {
        $this->createBooking($this->siswa, ['status' => Booking::STATUS_APPROVED]);
        $this->createBooking($this->siswa, [
            'status' => Booking::STATUS_APPROVED,
            'date' => now()->subDay()->toDateString(), // sudah lewat, tidak masuk upcoming
        ]);
        $this->createBooking($this->siswaLain, ['status' => Booking::STATUS_APPROVED]);

        $this->actingAs($this->siswa, 'sanctum')->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonCount(1, 'upcoming_bookings');
    }

    // ============================================================
    // Manajemen Lab
    // ============================================================

    public function test_lab_hanya_bisa_dibuat_diubah_dihapus_oleh_admin(): void
    {
        $payload = ['name' => 'Lab Baru', 'code' => 'NEW-01', 'capacity' => 30, 'description' => 'Deskripsi lab.'];

        foreach ([$this->siswa, $this->guru] as $user) {
            $this->actingAs($user, 'sanctum')->postJson('/api/labs', $payload)->assertForbidden();
            $this->actingAs($user, 'sanctum')->putJson("/api/labs/{$this->lab->id}", $payload)->assertForbidden();
            $this->actingAs($user, 'sanctum')->deleteJson("/api/labs/{$this->lab->id}")->assertForbidden();
        }

        $this->actingAs($this->admin, 'sanctum')->postJson('/api/labs', $payload)->assertCreated();
        $updatePayload = ['name' => 'Lab Diubah', 'code' => 'UPD-01', 'capacity' => 40, 'description' => 'Deskripsi diubah.'];
        $this->actingAs($this->admin, 'sanctum')->putJson("/api/labs/{$this->lab->id}", $updatePayload)->assertOk();
        $this->actingAs($this->admin, 'sanctum')->deleteJson("/api/labs/{$this->lab->id}")->assertOk();
    }

    public function test_semua_role_dapat_melihat_daftar_lab(): void
    {
        foreach ([$this->admin, $this->guru, $this->siswa] as $user) {
            $this->actingAs($user, 'sanctum')->getJson('/api/labs')->assertOk();
        }
    }

    // ============================================================
    // Booking
    // ============================================================

    public function test_daftar_booking_siswa_hanya_booking_miliknya_sedangkan_admin_dan_guru_semua(): void
    {
        $this->createBooking($this->siswa);
        $this->createBooking($this->siswaLain);
        $this->createBooking($this->guru);

        $this->actingAs($this->siswa, 'sanctum')->getJson('/api/bookings')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->actingAs($this->guru, 'sanctum')->getJson('/api/bookings')
            ->assertOk()
            ->assertJsonCount(3, 'data');

        $this->actingAs($this->admin, 'sanctum')->getJson('/api/bookings')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_semua_role_dapat_membuat_booking(): void
    {
        // Buat 3 lab berbeda agar tidak bentrok.
        $lab2 = Lab::factory()->create(['status' => Lab::STATUS_ACTIVE]);
        $lab3 = Lab::factory()->create(['status' => Lab::STATUS_ACTIVE]);

        $users = [$this->admin, $this->guru, $this->siswa];
        $labIds = [$this->lab->id, $lab2->id, $lab3->id];

        foreach ($users as $i => $user) {
            $this->actingAs($user, 'sanctum')->postJson('/api/bookings', [
                'lab_id' => $labIds[$i],
                'date' => now()->addDay()->toDateString(),
                'start_time' => '13:00',
                'end_time' => '15:00',
            ])->assertCreated();
        }
    }

    public function test_siswa_tidak_bisa_melihat_atau_menghapus_booking_orang_lain(): void
    {
        $milikLain = $this->createBooking($this->siswaLain);

        $this->actingAs($this->siswa, 'sanctum')
            ->getJson("/api/bookings/{$milikLain->id}")
            ->assertForbidden();

        $this->actingAs($this->siswa, 'sanctum')
            ->deleteJson("/api/bookings/{$milikLain->id}")
            ->assertForbidden();

        // Admin boleh melihat & menghapus booking siapa pun.
        $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/bookings/{$milikLain->id}")
            ->assertOk();

        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/bookings/{$milikLain->id}")
            ->assertOk();

        $this->assertDatabaseMissing('bookings', ['id' => $milikLain->id]);
    }

    public function test_guru_tidak_bisa_menghapus_booking_orang_lain(): void
    {
        $milikSiswa = $this->createBooking($this->siswa);

        $this->actingAs($this->guru, 'sanctum')
            ->deleteJson("/api/bookings/{$milikSiswa->id}")
            ->assertForbidden();
    }

    // ============================================================
    // Persetujuan
    // ============================================================

    public function test_persetujuan_hanya_untuk_admin_dan_guru(): void
    {
        $milikSiswa = $this->createBooking($this->siswa, [
            'start_time' => '13:00:00',
            'end_time' => '15:00:00',
        ]);

        // Siswa tidak boleh menyetujui/menolak.
        $this->actingAs($this->siswa, 'sanctum')
            ->postJson("/api/bookings/{$milikSiswa->id}/approve")
            ->assertForbidden();

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson("/api/bookings/{$milikSiswa->id}/reject", ['reason' => 'Tolak'])
            ->assertForbidden();

        // Guru dapat menyetujui booking siapa pun.
        $this->actingAs($this->guru, 'sanctum')
            ->postJson("/api/bookings/{$milikSiswa->id}/approve")
            ->assertOk();

        $this->assertDatabaseHas('bookings', [
            'id' => $milikSiswa->id,
            'status' => Booking::STATUS_APPROVED,
        ]);

        // Admin dapat menolak booking dengan alasan.
        $bookingLain = $this->createBooking($this->siswaLain, [
            'start_time' => '13:00:00',
            'end_time' => '15:00:00',
        ]);

        $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/bookings/{$bookingLain->id}/reject", ['reason' => 'Bentrok dengan kegiatan sekolah'])
            ->assertOk();

        $this->assertDatabaseHas('bookings', [
            'id' => $bookingLain->id,
            'status' => Booking::STATUS_REJECTED,
        ]);
    }

    // ============================================================
    // Laporan
    // ============================================================

    public function test_daftar_laporan_siswa_hanya_miliknya_sedangkan_admin_dan_guru_semua(): void
    {
        Storage::fake('public');

        $this->createReport($this->siswa);
        $this->createReport($this->siswaLain);

        $this->actingAs($this->siswa, 'sanctum')->getJson('/api/reports')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->actingAs($this->guru, 'sanctum')->getJson('/api/reports')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->actingAs($this->admin, 'sanctum')->getJson('/api/reports')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_siswa_tidak_bisa_melaporkan_booking_orang_lain(): void
    {
        Storage::fake('public');

        $approvedLain = $this->createBooking($this->siswaLain, ['status' => Booking::STATUS_APPROVED]);

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/reports', [
                'booking_id' => $approvedLain->id,
                'description' => 'Coba melapor booking orang lain.',
                'photo' => UploadedFile::fake()->image('foto.jpg'),
            ])
            ->assertForbidden();
    }

    public function test_admin_dan_guru_dapat_melaporkan_booking_apa_pun(): void
    {
        Storage::fake('public');

        $approved = $this->createBooking($this->siswa, ['status' => Booking::STATUS_APPROVED]);

        $this->actingAs($this->guru, 'sanctum')
            ->postJson('/api/reports', [
                'booking_id' => $approved->id,
                'description' => 'Dilaporkan oleh guru.',
                'photo' => UploadedFile::fake()->image('foto.jpg'),
            ])
            ->assertCreated();

        $this->assertDatabaseCount('reports', 1);
    }

    public function test_siswa_tidak_bisa_menghapus_laporan_orang_lain_tetapi_admin_bisa(): void
    {
        Storage::fake('public');

        $laporanLain = $this->createReport($this->siswaLain);

        $this->actingAs($this->siswa, 'sanctum')
            ->deleteJson("/api/reports/{$laporanLain->id}")
            ->assertForbidden();

        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/reports/{$laporanLain->id}")
            ->assertOk();

        $this->assertDatabaseMissing('reports', ['id' => $laporanLain->id]);
    }
}
