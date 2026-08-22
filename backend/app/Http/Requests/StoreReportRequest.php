<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
{
    /**
     * User yang login boleh membuat laporan.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:5120'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Pesan error dalam Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'booking_id.required' => 'Booking wajib dipilih.',
            'booking_id.exists' => 'Booking tidak ditemukan.',
            'photo.required' => 'Foto bukti penggunaan wajib diunggah.',
            'photo.image' => 'File harus berupa gambar.',
            'photo.mimes' => 'Format foto harus JPG atau PNG.',
            'photo.max' => 'Ukuran foto maksimal 5 MB.',
        ];
    }
}
