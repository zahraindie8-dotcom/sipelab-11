<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
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
            'booking' => new BookingResource($this->whenLoaded('booking')),
            'booking_id' => $this->booking_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'photo' => $this->photo,
            // Gunakan URL API yang aman untuk foto
            'photo_url' => $this->photo ? url("/api/reports/{$this->id}/photo") : null,
            'description' => $this->description,
            'created_at' => $this->created_at,
        ];
    }
}
