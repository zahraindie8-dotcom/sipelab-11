<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLabRequest extends FormRequest
{
    /**
     * Hanya admin yang boleh mengubah lab.
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
            'name' => ['sometimes', 'string', 'max:255'],
            'capacity' => ['sometimes', 'integer', 'min:1', 'max:500'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Pesan error dalam Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'name.string' => 'Nama lab harus berupa teks.',
            'capacity.integer' => 'Kapasitas harus berupa angka.',
        ];
    }
}
