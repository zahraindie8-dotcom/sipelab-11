<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
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
        $isGuru = $this->user()?->role === 'guru';
        $isSiswa = $this->user()?->role === 'siswa';
        return [
            'lab_id' => ['required', 'integer', 'exists:labs,id'],
            'kelas' => ['nullable', 'string', 'max:100'],
            'jurusan' => ['nullable', 'string', 'max:150'],
            'date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'purpose' => ['nullable', 'string', 'max:500'],
            'participant_count' => ['nullable', 'integer', 'min:1', 'max:500'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
    /**
     * Pesan error dalam Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'lab_id.required' => 'Pilih lab terlebih dahulu.',
            'lab_id.exists' => 'Lab yang dipilih tidak ditemukan.',
            'kelas.required' => 'Kelas wajib diisi.',
            'kelas.max' => 'Kelas maksimal 100 karakter.',
            'jurusan.required' => 'Jurusan wajib diisi.',
            'jurusan.max' => 'Jurusan maksimal 150 karakter.',
            'date.required' => 'Tanggal wajib diisi.',
            'date.date_format' => 'Format tanggal tidak valid (YYYY-MM-DD).',
            'date.after_or_equal' => 'Tanggal tidak boleh di masa lalu.',
            'start_time.required' => 'Jam mulai wajib diisi.',
            'start_time.date_format' => 'Format jam mulai tidak valid (HH:MM).',
            'end_time.required' => 'Jam selesai wajib diisi.',
            'end_time.after' => 'Jam selesai harus setelah jam mulai.',
            'purpose.required' => 'Tujuan penggunaan wajib diisi.',
            'purpose.max' => 'Tujuan penggunaan maksimal 500 karakter.',
            'participant_count.required' => 'Jumlah peserta wajib diisi.',
            'participant_count.min' => 'Jumlah peserta minimal 1 orang.',
            'participant_count.max' => 'Jumlah peserta maksimal 500 orang.',
        ];
    }
}