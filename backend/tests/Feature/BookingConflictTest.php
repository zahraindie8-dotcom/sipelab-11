<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Lab;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingConflictTest extends TestCase
{
    use RefreshDatabase;

    private User $siswa;
    private User $guru;
    private Lab $lab;

    protected function setUp(): void
    {
        parent::setUp();

        $this->siswa = User::factory()->create(['role' => 'siswa']);
        $this->guru = User::factory()->create(['role' => 'guru']);
        $this->lab = Lab::factory()->create(['status' => Lab::STATUS_ACTIVE]);
    }

    public function test_booking_bisa_dibuat_tanpa_bentrok(): void
    {
        $response = $this->actingAs($this->siswa, 'sanctum')->postJson('/api/bookings', [
            'lab_id' => $this->lab->id,
            'date' => now()->addDay()->toDateString(),
            'start_time' => '08:00',
            'end_time' => '10:00',
            'purpose' => 'Praktikum',
            'participant_count' => 20,
            'notes' => 'Praktikum',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', Booking::STATUS_PENDING);
    }

    public function test_booking_bentrok_dengan_jadwal_disetujui_ditolak(): void
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

        $response = $this->actingAs($this->siswa, 'sanctum')->postJson('/api/bookings', [
            'lab_id' => $this->lab->id,
            'date' => $date,
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('schedule');
    }

    public function test_booking_dengan_jadwal_bersebelahan_diperbolehkan(): void
    {
        $date = now()->addDay()->toDateString();

        Booking::create([
            'user_id' => $this->guru->id,
            'lab_id' => $this->lab->id,
            'date' => $date,
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
            'status' => Booking::STATUS_APPROVED,
        ]);

        // Mulai tepat setelah booking sebelumnya selesai — tidak bentrok.
        $response = $this->actingAs($this->siswa, 'sanctum')->postJson('/api/bookings', [
            'lab_id' => $this->lab->id,
            'date' => $date,
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        $response->assertCreated();
    }

    public function test_booking_bentrok_dengan_booking_pending_ditolak(): void
    {
        $date = now()->addDay()->toDateString();

        // Booking pending juga mengunci jadwal (anti double booking).
        Booking::create([
            'user_id' => $this->guru->id,
            'lab_id' => $this->lab->id,
            'date' => $date,
            'start_time' => '09:00:00',
            'end_time' => '11:00:00',
            'status' => Booking::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->siswa, 'sanctum')->postJson('/api/bookings', [
            'lab_id' => $this->lab->id,
            'date' => $date,
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('schedule');
    }

    public function test_booking_bentrok_dengan_booking_cancelled_diperbolehkan(): void
    {
        $date = now()->addDay()->toDateString();

        // Booking cancelled tidak mengunci jadwal.
        Booking::create([
            'user_id' => $this->guru->id,
            'lab_id' => $this->lab->id,
            'date' => $date,
            'start_time' => '09:00:00',
            'end_time' => '11:00:00',
            'status' => Booking::STATUS_CANCELLED,
        ]);

        $response = $this->actingAs($this->siswa, 'sanctum')->postJson('/api/bookings', [
            'lab_id' => $this->lab->id,
            'date' => $date,
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        $response->assertCreated();
    }

    public function test_persetujuan_menolak_booking_yang_bentrok_dengan_jadwal_disetujui(): void
    {
        $date = now()->addDay()->toDateString();

        // Booking A sudah disetujui: 09:00-11:00.
        $approved = Booking::create([
            'user_id' => $this->guru->id,
            'lab_id' => $this->lab->id,
            'date' => $date,
            'start_time' => '09:00:00',
            'end_time' => '11:00:00',
            'status' => Booking::STATUS_APPROVED,
        ]);

        // Booking B pending, tumpang tindih: 10:00-12:00.
        $pending = Booking::create([
            'user_id' => $this->siswa->id,
            'lab_id' => $this->lab->id,
            'date' => $date,
            'start_time' => '10:00:00',
            'end_time' => '12:00:00',
            'status' => Booking::STATUS_PENDING,
        ]);

        // Guru menyetujui B — harus ditolak karena bentrok dengan A.
        $response = $this->actingAs($this->guru, 'sanctum')
            ->postJson("/api/bookings/{$pending->id}/approve");

        $response->assertUnprocessable();
        $this->assertDatabaseHas('bookings', [
            'id' => $pending->id,
            'status' => Booking::STATUS_PENDING,
        ]);
    }

    public function test_persetujuan_menerima_booking_yang_tidak_bentrok(): void
    {
        $date = now()->addDay()->toDateString();

        $pending = Booking::create([
            'user_id' => $this->siswa->id,
            'lab_id' => $this->lab->id,
            'date' => $date,
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
            'status' => Booking::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->guru, 'sanctum')
            ->postJson("/api/bookings/{$pending->id}/approve");

        $response->assertOk();
        $this->assertDatabaseHas('bookings', [
            'id' => $pending->id,
            'status' => Booking::STATUS_APPROVED,
        ]);
    }
}
