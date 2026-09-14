<?php

namespace App\Http\Requests;
use App\Models\Lab;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class StoreLabRequest extends FormRequest
{
    /**
     * Hanya admin yang boleh menambah lab.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255'],
        'code' => ['required', 'string', 'max:50', 'unique:labs,code'],
        'capacity' => ['required', 'integer', 'min:1', 'max:500'],
        'location' => ['nullable', 'string', 'max:255'],
        'description' => ['nullable', 'string', 'max:1000'],
        'status' => [
            'nullable',
            Rule::in([
                Lab::STATUS_ACTIVE,
                Lab::STATUS_MAINTENANCE,
                Lab::STATUS_INACTIVE,
            ]),
        ],
    ];
}

    /**
     * Pesan error dalam Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama lab wajib diisi.',
            'name.string' => 'Nama lab harus berupa teks.',
            'capacity.required' => 'Kapasitas lab wajib diisi.',
            'capacity.integer' => 'Kapasitas harus berupa angka.',
            'capacity.min' => 'Kapasitas minimal 1.',
            'capacity.max' => 'Kapasitas maksimal 500.',
            'code.required' => 'Kode lab wajib diisi.',
            'code.string' => 'Kode lab harus berupa teks.',
            'code.max' => 'Kode lab maksimal 50 karakter.',
	    'code.unique' => 'Kode lab sudah digunakan.',
'status.in' => 'Status lab tidak valid.',
            'description.string' => 'Deskripsi harus berupa teks.',
            'description.max' => 'Deskripsi maksimal 1000 karakter.',
            'location.string' => 'Lokasi lab harus berupa teks.',
            'location.max' => 'Lokasi maksimal 255 karakter.',
        ];
    }
}