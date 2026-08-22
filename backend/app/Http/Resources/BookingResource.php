<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'user_name' => $this->user?->name,
            'lab' => new LabResource($this->whenLoaded('lab')),
            'lab_name' => $this->lab?->name,
            'date' => substr((string) $this->date, 0, 10),
            'start_time' => $this->start_time ? substr($this->start_time, 0, 5) : $this->start_time,
            'end_time' => $this->end_time ? substr($this->end_time, 0, 5) : $this->end_time,
            'status' => $this->status,
            'status_label' => $this->status_label,
            'notes' => $this->notes,
            'has_report' => $this->whenLoaded('report', fn () => $this->report !== null, false),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
