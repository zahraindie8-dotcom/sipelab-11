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
                'capacity' => 36,
                'description' => 'Lab komputer untuk mata pelajaran TIK dan pemrograman.',
            ],
            [
                'name' => 'Lab Komputer 2',
                'capacity' => 30,
                'description' => 'Lab komputer untuk ujian berbasis komputer (CBT).',
            ],
            [
                'name' => 'Lab IPA',
                'capacity' => 32,
                'description' => 'Lab untuk praktikum fisika, kimia, dan biologi.',
            ],
            [
                'name' => 'Lab Bahasa',
                'capacity' => 28,
                'description' => 'Lab bahasa untuk pembelajaran listening dan speaking.',
            ],
            [
                'name' => 'Lab Multimedia',
                'capacity' => 25,
                'description' => 'Lab multimedia untuk desain grafis dan editing video.',
            ],
        ];

        foreach ($labs as $lab) {
            Lab::updateOrCreate(['name' => $lab['name']], $lab);
        }
    }
}
