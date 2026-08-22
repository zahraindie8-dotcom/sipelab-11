<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\Booking;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    /**
     * Daftar laporan penggunaan lab.
     *
     * - Admin/guru: semua laporan.
     * - Siswa: hanya laporan miliknya.
     */
    public function index(Request $request)
    {
        $query = Report::with(['booking.user', 'booking.lab', 'user'])
            ->when(! $request->user()->canApprove(), function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->latest();

        return ReportResource::collection(
            $query->paginate($request->integer('per_page', 10))
        );
    }

    /**
     * Upload laporan penggunaan lab (hanya untuk booking yang disetujui).
     */
    public function store(StoreReportRequest $request)
    {
        $booking = Booking::findOrFail($request->validated('booking_id'));

        if ($booking->status !== Booking::STATUS_APPROVED) {
            return response()->json([
                'message' => 'Laporan hanya bisa dibuat untuk booking yang sudah disetujui.',
            ], 422);
        }

        // Hanya pemilik booking atau admin/guru yang boleh melapor.
        $user = $request->user();
        if (! $user->canApprove() && $booking->user_id !== $user->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke booking ini.',
            ], 403);
        }

        // Cegah laporan ganda untuk booking yang sama.
        if ($booking->report()->exists()) {
            return response()->json([
                'message' => 'Booking ini sudah memiliki laporan.',
            ], 422);
        }

        $photoPath = $request->file('photo')->store('reports', 'public');

        $report = Report::create([
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'photo' => $photoPath,
            'description' => $request->validated('description'),
        ]);

        return response()->json([
            'message' => 'Laporan berhasil diunggah.',
            'data' => new ReportResource($report->load(['booking.user', 'booking.lab', 'user'])),
        ], 201);
    }

    /**
     * Semua laporan untuk export/cetak (tanpa pagination).
     * Hanya admin & guru.
     */
    public function all(Request $request)
    {
        $reports = Report::with(['booking.user', 'booking.lab', 'user'])
            ->latest()
            ->get();

        return ReportResource::collection($reports);
    }

    /**
     * Hapus laporan (pemilik atau admin).
     */
    public function destroy(Request $request, Report $report)
    {
        $user = $request->user();

        if (! $user->isAdmin() && $report->user_id !== $user->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke laporan ini.',
            ], 403);
        }

        if ($report->photo) {
            Storage::disk('public')->delete($report->photo);
        }

        $report->delete();

        return response()->json([
            'message' => 'Laporan berhasil dihapus.',
        ]);
    }
}
