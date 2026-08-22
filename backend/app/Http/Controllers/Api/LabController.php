<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLabRequest;
use App\Http\Requests\UpdateLabRequest;
use App\Http\Resources\LabResource;
use App\Models\Lab;
use Illuminate\Http\Request;

class LabController extends Controller
{
    /**
     * Daftar semua lab (semua role boleh melihat).
     */
    public function index(Request $request)
    {
        $labs = Lab::query()
            ->when($request->query('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
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
}
