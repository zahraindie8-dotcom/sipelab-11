<?php

namespace Database\Factories;

use App\Models\Lab;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lab>
 */
class LabFactory extends Factory
{
    protected $model = Lab::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $letter = fake()->randomLetter();
        $num = fake()->numberBetween(1, 99);

        return [
            'name' => fake()->randomElement([
                'Lab Komputer 1',
                'Lab Komputer 2',
                'Lab IPA',
                'Lab Fisika',
                'Lab Kimia',
                'Lab Bahasa',
                'Lab Multimedia',
                'Lab RPL',
                'Lab Jaringan',
            ]),
            'code' => strtoupper($letter . $letter . '-' . $num),
            'capacity' => fake()->numberBetween(20, 40),
            'description' => fake()->sentence(8),
            'location' => 'Gedung ' . strtoupper($letter) . ', Lantai ' . fake()->numberBetween(1, 3),
            'status' => Lab::STATUS_ACTIVE,
        ];
    }
}
