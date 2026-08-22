<?php

namespace App\Http\Requests;

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
            'capacity' => ['required', 'integer', 'min:1', 'max:500'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Pesan error dalam Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama lab wajib diisi.',
            'capacity.required' => 'Kapasitas lab wajib diisi.',
            'capacity.integer' => 'Kapasitas harus berupa angka.',
            'capacity.min' => 'Kapasitas minimal 1.',
        ];
    }
}
