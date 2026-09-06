<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLabRequest;
use App\Http\Requests\UpdateLabRequest;
use App\Http\Resources\LabResource;
use App\Models\Booking;
use App\Models\Lab;
use Illuminate\Http\Request;

class LabController extends Controller
{
    /**
     * Daftar semua lab (semua role boleh melihat).
     * Filter: ?search=xxx&status=active
     */
    public function index(Request $request)
    {
        $labs = Lab::query()
            ->when($request->query('search'), function ($query, $search) {
                // Sanitize: escape SQL wildcards to prevent pattern abuse
                $safeSearch = str_replace(['%', '_'], ['\%', '\_'], $search);

                $query->where(function ($q) use ($safeSearch) {
                    $q->where('name', 'like', "%{$safeSearch}%")
                        ->orWhere('description', 'like', "%{$safeSearch}%");
                });
            })
            ->orderBy('name')
            ->paginate($request->integer('per_page', 10));

        return LabResource::collection($labs);
    }

    /**
     * Detail satu lab.
     */
    public function show(Lab $lab)
    {
        return new LabResource($lab);
    }

    /**
     * Tambah lab baru (admin).
     */
    public function store(StoreLabRequest $request)
    {
        $lab = Lab::create($request->validated());

        return new LabResource($lab);
    }

    /**
     * Ubah data lab (admin).
     */
    public function update(UpdateLabRequest $request, Lab $lab)
    {
        $lab->update($request->validated());

        return new LabResource($lab->fresh());
    }

    /**
     * Hapus lab (admin).
     */
    public function destroy(Lab $lab)
    {
        $lab->delete();

        return response()->json([
            'message' => 'Lab berhasil dihapus.',
        ]);
    }

    /**
     * Cek ketersediaan lab pada tanggal dan jam tertentu.
     * GET /api/labs/{lab}/availability?date=2024-01-01&start_time=08:00&end_time=10:00
     */
    public function availability(Request $request, Lab $lab)
    {
        $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        // Cek apakah lab aktif
        if (! $lab->isAvailable()) {
            return response()->json([
                'available' => false,
                'message' => 'Lab tidak tersedia (status: '.$lab->status_label.').',
            ]);
        }

        // Cek apakah ada booking yang tumpang tindih (pending atau approved)
        $conflicts = Booking::where('lab_id', $lab->id)
            ->overlapping(
                $request->date,
                $request->start_time,
                $request->end_time
            )
            ->get()
            ->map(fn ($b) => [
                'id' => $b->id,
                'status' => $b->status,
                'status_label' => $b->status_label,
                'start_time' => substr($b->start_time, 0, 5),
                'end_time' => substr($b->end_time, 0, 5),
            ]);

        return response()->json([
            'available' => $conflicts->isEmpty(),
            'lab' => [
                'id' => $lab->id,
                'name' => $lab->name,
                'capacity' => $lab->capacity,
                'status' => $lab->status,
            ],
            'conflicts' => $conflicts,
        ]);
    }
}
