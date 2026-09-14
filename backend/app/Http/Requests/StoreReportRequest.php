<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'booking_id' => [
                'required',
                'integer',
                'exists:bookings,id',
            ],

            'before' => [
                'nullable',
                'array',
                'min:1',
                'max:25',
            ],
            'before.*' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,mp4,mov,webm',
                'max:5120',
            ],

            'after' => [
                'nullable',
                'array',
                'min:1',
                'max:25',
            ],
            'after.*' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,mp4,mov,webm',
                'max:5120',
            ],

            'photo' => [
                'required_without_all:before,after',
                'file',
                'mimes:jpeg,jpg,png,mp4,mov,webm',
                'max:5120',
            ],

            'description' => [
                'required',
                'string',
                'max:2000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'booking_id.required' => 'Borrowing wajib dipilih.',
            'booking_id.exists' => 'Borrowing tidak ditemukan.',

            'before.array' => 'Data Before tidak valid.',
            'before.min' => 'Minimal 1 file Before wajib diunggah.',
            'before.max' => 'Maksimal 25 file Before dapat diunggah.',
            'before.*.file' => 'File Before tidak valid.',
            'before.*.mimes' => 'File Before harus berupa JPG, JPEG, PNG, MP4, MOV, atau WEBM.',
            'before.*.max' => 'Setiap file Before maksimal 5 MB.',

            'after.array' => 'Data After tidak valid.',
            'after.min' => 'Minimal 1 file After wajib diunggah.',
            'after.max' => 'Maksimal 25 file After dapat diunggah.',
            'after.*.file' => 'File After tidak valid.',
            'after.*.mimes' => 'File After harus berupa JPG, JPEG, PNG, MP4, MOV, atau WEBM.',
            'after.*.max' => 'Setiap file After maksimal 5 MB.',

            'photo.file' => 'Foto laporan tidak valid.',
            'photo.mimes' => 'Foto laporan harus berupa JPG, JPEG, PNG, MP4, MOV, atau WEBM.',
            'photo.max' => 'Foto laporan maksimal 5 MB.',
            'photo.required_without_all' => 'Foto laporan wajib diunggah jika file Before atau After tidak tersedia.',

            'description.required' => 'Deskripsi aktivitas wajib diisi.',
            'description.max' => 'Deskripsi aktivitas maksimal 2000 karakter.',
        ];
    }
}
