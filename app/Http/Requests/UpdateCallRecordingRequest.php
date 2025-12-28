<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCallRecordingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'array'],
            'product_id.*' => ['integer', 'exists:products,id'],
            'signature' => ['required', 'string'],
            'post_activity' => ['nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('product_id') && is_string($this->product_id)) {
            $this->merge([
                'product_id' => json_decode($this->product_id, true),
            ]);
        }
    }
}
