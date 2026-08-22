<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pengujian endpoint manajemen user (admin).
 *
 * - Hanya admin yang boleh mengakses CRUD user.
 * - Guru & siswa ditolak (403).
 * - Validasi input: nama, email unik, password min 8, role valid.
 * - Admin tidak boleh menghapus diri sendiri.
 */
class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $guru;
    private User $siswa;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->guru = User::factory()->create(['role' => 'guru']);
        $this->siswa = User::factory()->create(['role' => 'siswa']);
    }

    // ============================================================
    // Akses (RBAC)
    // ============================================================

    public function test_admin_dapat_melihat_daftar_user(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/users')
            ->assertOk();
    }

    public function test_guru_dan_siswa_tidak_bisa_melihat_daftar_user(): void
    {
        foreach ([$this->guru, $this->siswa] as $user) {
            $this->actingAs($user, 'sanctum')
                ->getJson('/api/users')
                ->assertForbidden();
        }
    }

    public function test_hanya_admin_bisa_membuat_user(): void
    {
        $payload = [
            'name' => 'User Baru',
            'email' => 'baru@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'siswa',
        ];

        foreach ([$this->guru, $this->siswa] as $user) {
            $this->actingAs($user, 'sanctum')
                ->postJson('/api/users', $payload)
                ->assertForbidden();
        }

        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/users', $payload)
            ->assertCreated();
    }

    public function test_hanya_admin_bisa_mengubah_user(): void
    {
        $payload = ['name' => 'Nama Diubah'];

        $this->actingAs($this->siswa, 'sanctum')
            ->putJson("/api/users/{$this->guru->id}", $payload)
            ->assertForbidden();

        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/users/{$this->guru->id}", $payload)
            ->assertOk();
    }

    public function test_hanya_admin_bisa_menghapus_user(): void
    {
        $this->actingAs($this->siswa, 'sanctum')
            ->deleteJson("/api/users/{$this->guru->id}")
            ->assertForbidden();

        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/users/{$this->guru->id}")
            ->assertOk();
    }

    // ============================================================
    // CRUD — Create
    // ============================================================

    public function test_admin_bisa_membuat_user_baru(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/users', [
                'name' => 'Ahmad Fauzi',
                'email' => 'ahmad@test.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role' => 'guru',
            ])
            ->assertCreated()
            ->assertJsonPath('data.email', 'ahmad@test.com')
            ->assertJsonPath('data.role', 'guru');

        $this->assertDatabaseHas('users', ['email' => 'ahmad@test.com', 'role' => 'guru']);
    }

    // ============================================================
    // Validasi Input — Create
    // ============================================================

    public function test_validasi_field_wajib_saatan_tambah_user(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/users', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password', 'role']);
    }

    public function test_email_harus_unik(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/users', [
                'name' => 'Duplikat',
                'email' => $this->siswa->email,
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role' => 'siswa',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_password_minimal_8_karakter(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/users', [
                'name' => 'Pendek',
                'email' => 'pendek@test.com',
                'password' => 'short',
                'password_confirmation' => 'short',
                'role' => 'siswa',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    public function test_role_harus_valid(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/users', [
                'name' => 'Invalid Role',
                'email' => 'invalid@test.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role' => 'superadmin',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['role']);
    }

    // ============================================================
    // CRUD — Update
    // ============================================================

    public function test_admin_bisa_mengubah_nama_dan_role(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/users/{$this->siswa->id}", [
                'name' => 'Siswa Diubah',
                'role' => 'guru',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Siswa Diubah')
            ->assertJsonPath('data.role', 'guru');

        $this->assertDatabaseHas('users', [
            'id' => $this->siswa->id,
            'name' => 'Siswa Diubah',
            'role' => 'guru',
        ]);
    }

    public function test_password_opsional_saatan_edit(): void
    {
        $oldPassword = $this->siswa->password;

        // Tanpa password → password tidak berubah.
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/users/{$this->siswa->id}", ['name' => 'Tidak Ganti Password'])
            ->assertOk();

        $this->assertDatabaseHas('users', ['id' => $this->siswa->id, 'password' => $oldPassword]);
    }

    public function test_admin_bisa_mengubah_password(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/users/{$this->siswa->id}", [
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ])
            ->assertOk();

        $this->assertNotEquals($this->siswa->password, User::find($this->siswa->id)->password);
    }

    // ============================================================
    // CRUD — Delete
    // ============================================================

    public function test_admin_tidak_bisa_menghapus_diri_sendiri(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/users/{$this->admin->id}")
            ->assertUnprocessable();

        $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    }

    public function test_admin_bisa_menghapus_guru_dan_siswa(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/users/{$this->guru->id}")
            ->assertOk();

        $this->assertDatabaseMissing('users', ['id' => $this->guru->id]);
    }

    // ============================================================
    // Search & Filter
    // ============================================================

    public function test_admin_bisa_mencari_user_berdasarkan_nama(): void
    {
        User::factory()->create(['name' => 'Ahmad Fauzi', 'role' => 'siswa']);

        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/users?search=Ahmad')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_bisa_filter_berdasarkan_role(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/users?role=guru')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
