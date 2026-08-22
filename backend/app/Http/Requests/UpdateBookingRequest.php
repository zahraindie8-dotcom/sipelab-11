<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookingRequest extends FormRequest
{
    /**
     * Pemilik booking atau admin boleh mengubah.
     */
    public function authorize(): bool
    {
        $booking = $this->route('booking');

        return $this->user()?->isAdmin()
            || $booking->user_id === $this->user()?->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'lab_id' => ['sometimes', 'integer', 'exists:labs,id'],
            'date' => ['sometimes', 'date_format:Y-m-d', 'after_or_equal:today'],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time' => ['sometimes', 'date_format:H:i', 'after:start_time'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Pesan error dalam Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'lab_id.exists' => 'Lab yang dipilih tidak ditemukan.',
            'date.date_format' => 'Format tanggal tidak valid (YYYY-MM-DD).',
            'date.after_or_equal' => 'Tanggal tidak boleh di masa lalu.',
            'end_time.after' => 'Jam selesai harus setelah jam mulai.',
        ];
    }
}
