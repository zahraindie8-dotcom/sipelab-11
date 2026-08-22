<?php

namespace Database\Seeders;

use App\Models\Lab;
use Illuminate\Database\Seeder;

class LabSeeder extends Seeder
{
    /**
     * Seed data lab contoh.
     */
    public function run(): void
    {
        $labs = [
            [
                'name' => 'Lab Komputer 1',
                'code' => 'KOM-01',
                'capacity' => 36,
                'description' => 'Lab komputer untuk mata pelajaran TIK dan pemrograman.',
                'location' => 'Gedung A, Lantai 2',
                'status' => Lab::STATUS_ACTIVE,
            ],
            [
                'name' => 'Lab Komputer 2',
                'code' => 'KOM-02',
                'capacity' => 30,
                'description' => 'Lab komputer untuk ujian berbasis komputer (CBT).',
                'location' => 'Gedung A, Lantai 2',
                'status' => Lab::STATUS_ACTIVE,
            ],
            [
                'name' => 'Lab IPA',
                'code' => 'IPA-01',
                'capacity' => 32,
                'description' => 'Lab untuk praktikum fisika, kimia, dan biologi.',
                'location' => 'Gedung B, Lantai 1',
                'status' => Lab::STATUS_ACTIVE,
            ],
            [
                'name' => 'Lab Bahasa',
                'code' => 'BHS-01',
                'capacity' => 28,
                'description' => 'Lab bahasa untuk pembelajaran listening dan speaking.',
                'location' => 'Gedung C, Lantai 1',
                'status' => Lab::STATUS_ACTIVE,
            ],
            [
                'name' => 'Lab Multimedia',
                'code' => 'MUL-01',
                'capacity' => 25,
                'description' => 'Lab multimedia untuk desain grafis dan editing video.',
                'location' => 'Gedung C, Lantai 2',
                'status' => Lab::STATUS_MAINTENANCE,
            ],
            [
                'name' => 'Lab RPL',
                'code' => 'RPL-01',
                'capacity' => 30,
                'description' => 'Lab Rekayasa Perangkat Lunak untuk praktikum pemrograman web dan mobile.',
                'location' => 'Gedung D, Lantai 1',
                'status' => Lab::STATUS_ACTIVE,
            ],
            [
                'name' => 'Lab Jaringan',
                'code' => 'JAR-01',
                'capacity' => 20,
                'description' => 'Lab jaringan komulator untuk praktikum konfigurasi router dan switch.',
                'location' => 'Gedung D, Lantai 2',
                'status' => Lab::STATUS_INACTIVE,
            ],
        ];

        foreach ($labs as $lab) {
            Lab::updateOrCreate(['code' => $lab['code']], $lab);
        }
    }
}
