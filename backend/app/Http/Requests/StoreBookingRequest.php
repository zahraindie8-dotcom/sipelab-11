<?php

namespace App\Http\Requests;

use App\Models\Booking;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingRequest extends FormRequest
{
    /**
     * User yang login boleh membuat booking.
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
            'lab_id' => ['required', 'integer', 'exists:labs,id'],
            'date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Validasi tambahan: cek bentrok jadwal di lab & tanggal yang sama.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $data = $this->validated();

            // Booking yang dianggap mengunci jadwal: yang sudah disetujui.
            // ScopeOverlapping menormalkan format jam (H:i -> H:i:s) agar
            // perbandingan dengan kolom TIME di database akurat di batas waktu.
            $conflict = Booking::where('lab_id', $data['lab_id'])
                ->where('status', Booking::STATUS_APPROVED)
                ->overlapping($data['date'], $data['start_time'], $data['end_time'])
                ->exists();

            if ($conflict) {
                $validator->errors()->add(
                    'schedule',
                    'Jadwal bentrok: lab sudah dipesan pada tanggal dan jam tersebut.'
                );
            }
        });
    }

    /**
     * Pesan error dalam Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'lab_id.required' => 'Pilih lab terlebih dahulu.',
            'lab_id.exists' => 'Lab yang dipilih tidak ditemukan.',
            'date.required' => 'Tanggal wajib diisi.',
            'date.date_format' => 'Format tanggal tidak valid (YYYY-MM-DD).',
            'date.after_or_equal' => 'Tanggal tidak boleh di masa lalu.',
            'start_time.required' => 'Jam mulai wajib diisi.',
            'start_time.date_format' => 'Format jam mulai tidak valid (HH:MM).',
            'end_time.required' => 'Jam selesai wajib diisi.',
            'end_time.after' => 'Jam selesai harus setelah jam mulai.',
        ];
    }
}
