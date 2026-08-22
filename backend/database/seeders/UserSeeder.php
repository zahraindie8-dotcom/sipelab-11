<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Seed akun demo untuk setiap role.
     *
     * Password semua akun: password
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@sipelab.test'],
            [
                'name' => 'Admin Lab',
                'password' => 'password',
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'guru@sipelab.test'],
            [
                'name' => 'Bapak/Ibu Guru',
                'password' => 'password',
                'role' => 'guru',
            ]
        );

        User::updateOrCreate(
            ['email' => 'siswa@sipelab.test'],
            [
                'name' => 'Siswa Contoh',
                'password' => 'password',
                'role' => 'siswa',
            ]
        );

        // Beberapa siswa tambahan agar data terlihat hidup.
        User::factory()->count(8)->create(['role' => 'siswa']);
    }
}
