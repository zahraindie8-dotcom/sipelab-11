<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Lab;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pengujian fitur Smart Booking:
 * - Cancel booking
 * - Lab availability
 * - Lab maintenance/inactive
 * - Kapasitas peserta
 * - Notifikasi internal
 */
class SmartBookingTest extends TestCase
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
        $this->lab = Lab::factory()->create(['status' => Lab::STATUS_ACTIVE, 'capacity' => 30]);
    }

    // ============================================================
    // Cancel Booking
    // ============================================================

    public function test_siswa_bisa_membatalkan_booking_sendiri(): void
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
            ->postJson("/api/bookings/{$booking->id}/cancel")
            ->assertOk();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => Booking::STATUS_CANCELLED,
        ]);
    }

    public function test_admin_bisa_membatalkan_booking_siswa(): void
    {
        $booking = Booking::create([
            'user_id' => $this->siswa->id,
            'lab_id' => $this->lab->id,
            'date' => now()->addDay()->toDateString(),
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
            'status' => Booking::STATUS_PENDING,
        ]);

        $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/bookings/{$booking->id}/cancel")
            ->assertOk();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => Booking::STATUS_CANCELLED,
        ]);
    }

    public function test_siswa_tidak_bisa_membatalkan_booking_guru(): void
    {
        $booking = Booking::create([
            'user_id' => $this->guru->id,
            'lab_id' => $this->lab->id,
            'date' => now()->addDay()->toDateString(),
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
            'status' => Booking::STATUS_PENDING,
        ]);

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson("/api/bookings/{$booking->id}/cancel")
            ->assertForbidden();
    }

    public function test_tidak_bisa_membatalkan_booking_yang_sudah_disetujui(): void
    {
        $booking = Booking::create([
            'user_id' => $this->siswa->id,
            'lab_id' => $this->lab->id,
            'date' => now()->addDay()->toDateString(),
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
            'status' => Booking::STATUS_APPROVED,
        ]);

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson("/api/bookings/{$booking->id}/cancel")
            ->assertUnprocessable();
    }

    public function test_cancel_mengirim_notifikasi_ke_admin_dan_guru(): void
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
            ->postJson("/api/bookings/{$booking->id}/cancel")
            ->assertOk();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->admin->id,
            'type' => Notification::TYPE_BOOKING_CANCELLED,
            'booking_id' => $booking->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->guru->id,
            'type' => Notification::TYPE_BOOKING_CANCELLED,
            'booking_id' => $booking->id,
        ]);
    }

    // ============================================================
    // Lab Availability
    // ============================================================

    public function test_availability_lab_tersedia(): void
    {
        $date = now()->addDay()->toDateString();

        $response = $this->actingAs($this->siswa, 'sanctum')
            ->getJson("/api/labs/{$this->lab->id}/availability?date={$date}&start_time=08:00&end_time=10:00");

        $response->assertOk()
            ->assertJsonPath('available', true)
            ->assertJsonCount(0, 'conflicts');
    }

    public function test_availability_lab_tidak_tersedia_karena_booking(): void
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

        $response = $this->actingAs($this->siswa, 'sanctum')
            ->getJson("/api/labs/{$this->lab->id}/availability?date={$date}&start_time=08:00&end_time=10:00");

        $response->assertOk()
            ->assertJsonPath('available', false)
            ->assertJsonCount(1, 'conflicts');
    }

    public function test_availability_lab_maintenance(): void
    {
        $maintenanceLab = Lab::factory()->create(['status' => Lab::STATUS_MAINTENANCE]);
        $date = now()->addDay()->toDateString();

        $response = $this->actingAs($this->siswa, 'sanctum')
            ->getJson("/api/labs/{$maintenanceLab->id}/availability?date={$date}&start_time=08:00&end_time=10:00");

        $response->assertOk()
            ->assertJsonPath('available', false);
    }

    // ============================================================
    // Lab Maintenance / Inactive
    // ============================================================

    public function test_booking_lab_maintenance_ditolak(): void
    {
        $maintenanceLab = Lab::factory()->create(['status' => Lab::STATUS_MAINTENANCE]);

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/bookings', [
                'lab_id' => $maintenanceLab->id,
                'date' => now()->addDay()->toDateString(),
                'start_time' => '08:00',
                'end_time' => '10:00',
            ])
            ->assertUnprocessable();
    }

    public function test_booking_lab_inactive_ditolak(): void
    {
        $inactiveLab = Lab::factory()->create(['status' => Lab::STATUS_INACTIVE]);

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/bookings', [
                'lab_id' => $inactiveLab->id,
                'date' => now()->addDay()->toDateString(),
                'start_time' => '08:00',
                'end_time' => '10:00',
            ])
            ->assertUnprocessable();
    }

    public function test_approve_lab_maintenance_ditolak(): void
    {
        $maintenanceLab = Lab::factory()->create(['status' => Lab::STATUS_MAINTENANCE]);

        $booking = Booking::create([
            'user_id' => $this->siswa->id,
            'lab_id' => $maintenanceLab->id,
            'date' => now()->addDay()->toDateString(),
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
            'status' => Booking::STATUS_PENDING,
        ]);

        $this->actingAs($this->guru, 'sanctum')
            ->postJson("/api/bookings/{$booking->id}/approve")
            ->assertUnprocessable();
    }

    // ============================================================
    // Kapasitas Peserta
    // ============================================================

    public function test_booking_melebihi_kapasitas_ditolak(): void
    {
        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/bookings', [
                'lab_id' => $this->lab->id,
                'date' => now()->addDay()->toDateString(),
                'start_time' => '08:00',
                'end_time' => '10:00',
                'participant_count' => $this->lab->capacity + 1,
            ])
            ->assertUnprocessable();
    }

    public function test_booking_sesuai_kapasitas_diterima(): void
    {
        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/bookings', [
                'lab_id' => $this->lab->id,
                'date' => now()->addDay()->toDateString(),
                'start_time' => '08:00',
                'end_time' => '10:00',
                'participant_count' => $this->lab->capacity,
            ])
            ->assertCreated();
    }

    // ============================================================
    // Notifikasi
    // ============================================================

    public function test_booking_baru_mengirim_notifikasi_ke_admin_dan_guru(): void
    {
        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/bookings', [
                'lab_id' => $this->lab->id,
                'date' => now()->addDay()->toDateString(),
                'start_time' => '08:00',
                'end_time' => '10:00',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->admin->id,
            'type' => Notification::TYPE_BOOKING_CREATED,
        ]);
    }

    public function test_approve_mengirim_notifikasi_ke_pemesan(): void
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
            ->postJson("/api/bookings/{$booking->id}/approve")
            ->assertOk();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->siswa->id,
            'type' => Notification::TYPE_BOOKING_APPROVED,
            'booking_id' => $booking->id,
        ]);
    }

    public function test_reject_mengirim_notifikasi_ke_pemesan(): void
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
            ->postJson("/api/bookings/{$booking->id}/reject", ['reason' => 'Jadwal bentrok'])
            ->assertOk();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->siswa->id,
            'type' => Notification::TYPE_BOOKING_REJECTED,
            'booking_id' => $booking->id,
        ]);
    }

    public function test_daftar_notifikasi(): void
    {
        Notification::create([
            'user_id' => $this->siswa->id,
            'type' => Notification::TYPE_BOOKING_APPROVED,
            'title' => 'Booking Disetujui',
            'message' => 'Booking lab telah disetujui.',
        ]);

        $this->actingAs($this->siswa, 'sanctum')
            ->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_unread_count(): void
    {
        Notification::create([
            'user_id' => $this->siswa->id,
            'type' => Notification::TYPE_BOOKING_APPROVED,
            'title' => 'Booking Disetujui',
            'message' => 'Booking lab telah disetujui.',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $this->siswa->id,
            'type' => Notification::TYPE_BOOKING_APPROVED,
            'title' => 'Booking Disetujui',
            'message' => 'Booking lab telah disetujui.',
            'is_read' => true,
        ]);

        $this->actingAs($this->siswa, 'sanctum')
            ->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('count', 1);
    }

    public function test_mark_as_read(): void
    {
        $notification = Notification::create([
            'user_id' => $this->siswa->id,
            'type' => Notification::TYPE_BOOKING_APPROVED,
            'title' => 'Booking Disetujui',
            'message' => 'Booking lab telah disetujui.',
            'is_read' => false,
        ]);

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson("/api/notifications/{$notification->id}/read")
            ->assertOk();

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'is_read' => true,
        ]);
    }

    public function test_mark_all_as_read(): void
    {
        Notification::create([
            'user_id' => $this->siswa->id,
            'type' => Notification::TYPE_BOOKING_APPROVED,
            'title' => 'Booking Disetujui',
            'message' => 'Booking lab telah disetujui.',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $this->siswa->id,
            'type' => Notification::TYPE_BOOKING_APPROVED,
            'title' => 'Booking Disetujui',
            'message' => 'Booking lab telah disetujui.',
            'is_read' => false,
        ]);

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson('/api/notifications/read-all')
            ->assertOk();

        $this->assertDatabaseCount('notifications', 2);
        $this->assertDatabaseHas('notifications', ['user_id' => $this->siswa->id, 'is_read' => true]);
    }

    public function test_user_tidak_bisa_membaca_notifikasi_orang_lain(): void
    {
        $notification = Notification::create([
            'user_id' => $this->admin->id,
            'type' => Notification::TYPE_BOOKING_APPROVED,
            'title' => 'Booking Disetujui',
            'message' => 'Booking lab telah disetujui.',
        ]);

        $this->actingAs($this->siswa, 'sanctum')
            ->postJson("/api/notifications/{$notification->id}/read")
            ->assertForbidden();
    }

    // ============================================================
    // Approve menyimpan approved_by & approved_at
    // ============================================================

    public function test_approve_menyimpan_approved_by_dan_approved_at(): void
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
            ->postJson("/api/bookings/{$booking->id}/approve")
            ->assertOk();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'approved_by' => $this->guru->id,
        ]);

        $this->assertNotNull($booking->fresh()->approved_at);
    }

    // ============================================================
    // Reject menyimpan rejection_reason
    // ============================================================

    public function test_reject_menyimpan_rejection_reason(): void
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
            ->postJson("/api/bookings/{$booking->id}/reject", ['reason' => 'Bentrok jadwal'])
            ->assertOk();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'rejection_reason' => 'Bentrok jadwal',
        ]);
    }
}
