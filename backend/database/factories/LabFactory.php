<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lab>
 */
class LabFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement([
                'Lab Komputer 1',
                'Lab Komputer 2',
                'Lab IPA',
                'Lab Fisika',
                'Lab Kimia',
                'Lab Bahasa',
                'Lab Multimedia',
            ]),
            'capacity' => fake()->numberBetween(20, 40),
            'description' => fake()->sentence(8),
        ];
    }
}
