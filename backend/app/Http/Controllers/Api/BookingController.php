<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /**
     * Daftar booking.
     *
     * - Admin/guru: semua booking.
     * - Siswa: hanya booking miliknya.
     * Filter: ?status=pending&lab_id=1&date=2024-01-01
     */
    public function index(Request $request)
    {
        $query = Booking::with(['user', 'lab', 'report'])
            ->when(! $request->user()->canApprove(), function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->when($request->query('status'), function ($q, $status) {
                $q->where('status', $status);
            })
            ->when($request->query('lab_id'), function ($q, $labId) {
                $q->where('lab_id', $labId);
            })
            ->when($request->query('date'), function ($q, $date) {
                $q->whereDate('date', $date);
            })
            ->latest();

        return BookingResource::collection(
            $query->paginate($request->integer('per_page', 10))
        );
    }

    /**
     * Detail satu booking.
     */
    public function show(Request $request, Booking $booking)
    {
        $this->authorizeAccess($request, $booking);

        return new BookingResource(
            $booking->load(['user', 'lab', 'report'])
        );
    }

    /**
     * Buat booking baru (semua role login).
     */
    public function store(StoreBookingRequest $request)
    {
        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'lab_id' => $request->validated('lab_id'),
            'date' => $request->validated('date'),
            'start_time' => $request->validated('start_time'),
            'end_time' => $request->validated('end_time'),
            'notes' => $request->validated('notes'),
            'status' => Booking::STATUS_PENDING,
        ]);

        return new BookingResource(
            $booking->load(['user', 'lab', 'report'])
        );
    }

    /**
     * Ubah booking (pemilik atau admin).
     */
    public function update(UpdateBookingRequest $request, Booking $booking)
    {
        $this->authorizeAccess($request, $booking);

        if ($booking->status !== Booking::STATUS_PENDING) {
            return response()->json([
                'message' => 'Booking yang sudah disetujui/ditolak tidak dapat diubah.',
            ], 422);
        }

        $data = $request->validated();

        // Cek bentrok ulang dengan nilai baru (jadwal yang sudah disetujui).
        $conflict = Booking::where('lab_id', $data['lab_id'] ?? $booking->lab_id)
            ->where('status', Booking::STATUS_APPROVED)
            ->overlapping(
                $data['date'] ?? substr($booking->date, 0, 10),
                $data['start_time'] ?? substr($booking->start_time, 0, 5),
                $data['end_time'] ?? substr($booking->end_time, 0, 5),
                $booking->id
            )
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Jadwal bentrok: lab sudah dipesan pada tanggal dan jam tersebut.',
            ], 422);
        }

        $booking->update($data);

        return new BookingResource(
            $booking->fresh(['user', 'lab', 'report'])
        );
    }

    /**
     * Hapus booking (pemilik atau admin).
     */
    public function destroy(Request $request, Booking $booking)
    {
        // Hanya pemilik booking atau admin yang boleh menghapus.
        if (! $request->user()->isAdmin() && $request->user()->id !== $booking->user_id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke booking ini.',
            ], 403);
        }

        $booking->delete();

        return response()->json([
            'message' => 'Booking berhasil dihapus.',
        ]);
    }

    /**
     * Setujui booking (admin/guru).
     */
    public function approve(Request $request, Booking $booking)
    {
        if ($booking->status !== Booking::STATUS_PENDING) {
            return response()->json([
                'message' => 'Hanya booking berstatus menunggu yang dapat diproses.',
            ], 422);
        }

        // Validasi bentrok ulang saat persetujuan: dua booking pending yang
        // tumpang tindih tidak boleh sama-sama disetujui (double booking).
        $conflict = Booking::where('lab_id', $booking->lab_id)
            ->where('status', Booking::STATUS_APPROVED)
            ->overlapping(
                substr($booking->date, 0, 10),
                $booking->start_time,
                $booking->end_time,
                $booking->id
            )
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Gagal menyetujui: jadwal ini bentrok dengan booking lain yang sudah disetujui.',
            ], 422);
        }

        $booking->update(['status' => Booking::STATUS_APPROVED]);

        return response()->json([
            'message' => 'Booking disetujui.',
            'data' => new BookingResource($booking->fresh(['user', 'lab', 'report'])),
        ]);
    }

    /**
     * Tolak booking (admin/guru).
     */
    public function reject(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($booking->status !== Booking::STATUS_PENDING) {
            return response()->json([
                'message' => 'Hanya booking berstatus menunggu yang dapat diproses.',
            ], 422);
        }

        $booking->update([
            'status' => Booking::STATUS_REJECTED,
            'notes' => ! empty($validated['reason'])
                ? trim($booking->notes."\nAlasan ditolak: ".$validated['reason'])
                : $booking->notes,
        ]);

        return response()->json([
            'message' => 'Booking ditolak.',
            'data' => new BookingResource($booking->fresh(['user', 'lab', 'report'])),
        ]);
    }

    /**
     * Pastikan user boleh mengakses booking ini.
     */
    private function authorizeAccess(Request $request, Booking $booking): void
    {
        if (! $request->user()->canApprove() && $request->user()->id !== $booking->user_id) {
            abort(403, 'Anda tidak memiliki akses ke booking ini.');
        }
    }
}
