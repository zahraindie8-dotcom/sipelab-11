<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Lab;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        $query = Booking::with(['user', 'lab', 'approver', 'report'])
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
            ->when($request->query('date_from'), function ($q, $dateFrom) {
                $q->where('date', '>=', $dateFrom);
            })
            ->when($request->query('date_to'), function ($q, $dateTo) {
                $q->where('date', '<=', $dateTo);
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
            $booking->load(['user', 'lab', 'approver', 'report'])
        );
    }

    /**
     * Buat booking baru (semua role login).
     * Menggunakan database transaction + lock untuk mencegah race condition.
     */
    public function store(StoreBookingRequest $request)
    {
        $validated = $request->validated();

        // Cek status lab — lab maintenance/inactive tidak boleh dibooking
        $lab = Lab::findOrFail($validated['lab_id']);
        if (! $lab->isAvailable()) {
            return response()->json([
                'message' => 'Lab tidak tersedia untuk dibooking (status: '.$lab->status_label.').',
            ], 422);
        }

        // Cek kapasitas — jumlah peserta tidak boleh melebihi kapasitas lab
        if (($validated['participant_count'] ?? 0) > $lab->capacity) {
            return response()->json([
                'message' => "Jumlah peserta ({$validated['participant_count']}) melebihi kapasitas lab ({$lab->capacity}).",
            ], 422);
        }

        // Gunakan database lock untuk mencegah race condition double booking
        $booking = DB::transaction(function () use ($validated, $request) {
            // Cek bentrok jadwal — hanya booking pending/approved yang mengunci
            $conflict = Booking::where('lab_id', $validated['lab_id'])
                ->overlapping(
                    $validated['date'],
                    $validated['start_time'],
                    $validated['end_time']
                )
                ->exists();

            if ($conflict) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'schedule' => 'Jadwal bentrok: lab sudah dipesan pada tanggal dan jam tersebut.',
                ]);
            }

            return Booking::create([
                'user_id' => $request->user()->id,
                'lab_id' => $validated['lab_id'],
                'date' => $validated['date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'purpose' => $validated['purpose'] ?? null,
                'participant_count' => $validated['participant_count'] ?? 0,
                'notes' => $validated['notes'] ?? null,
                'status' => Booking::STATUS_PENDING,
            ]);
        });

        // Kirim notifikasi ke admin & guru
        $this->notifyApprovers(
            $request->user(),
            $booking,
            Notification::TYPE_BOOKING_CREATED,
            'Booking Lab Dibuat',
            "Booking lab {$booking->lab->name} oleh {$request->user()->name} pada {$booking->date} ({$booking->start_time}-{$booking->end_time}) menunggu persetujuan."
        );

        return (new BookingResource(
            $booking->load(['user', 'lab', 'approver', 'report'])
        ))->response()->setStatusCode(201);
    }

    /**
     * Ubah booking (pemilik atau admin).
     */
    public function update(UpdateBookingRequest $request, Booking $booking)
    {
        $this->authorizeAccess($request, $booking);

        if (! $booking->isEditable()) {
            return response()->json([
                'message' => 'Booking yang sudah disetujui/ditolak/dibatalkan tidak dapat diubah.',
            ], 422);
        }

        $data = $request->validated();

        // Cek status lab
        $labId = $data['lab_id'] ?? $booking->lab_id;
        $lab = Lab::findOrFail($labId);
        if (! $lab->isAvailable()) {
            return response()->json([
                'message' => 'Lab tidak tersedia untuk dibooking (status: '.$lab->status_label.').',
            ], 422);
        }

        // Cek kapasitas
        $participantCount = $data['participant_count'] ?? $booking->participant_count;
        if ($participantCount > $lab->capacity) {
            return response()->json([
                'message' => "Jumlah peserta ({$participantCount}) melebihi kapasitas lab ({$lab->capacity}).",
            ], 422);
        }

        // Cek bentrok ulang dengan nilai baru (jadwal yang sudah disetujui atau pending)
        $conflict = Booking::where('lab_id', $labId)
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
            $booking->fresh(['user', 'lab', 'approver', 'report'])
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

        // Cek apakah lab masih aktif
        if (! $booking->lab->isAvailable()) {
            return response()->json([
                'message' => 'Lab tidak tersedia (status: '.$booking->lab->status_label.').',
            ], 422);
        }

        // Validasi bentrok ulang saat persetujuan
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

        $booking->update([
            'status' => Booking::STATUS_APPROVED,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        // Kirim notifikasi ke pemesan
        Notification::create([
            'user_id' => $booking->user_id,
            'type' => Notification::TYPE_BOOKING_APPROVED,
            'title' => 'Booking Disetujui',
            'message' => "Booking lab {$booking->lab->name} pada {$booking->date} ({$booking->start_time}-{$booking->end_time}) telah disetujui oleh {$request->user()->name}.",
            'booking_id' => $booking->id,
        ]);

        return response()->json([
            'message' => 'Booking disetujui.',
            'data' => new BookingResource($booking->fresh(['user', 'lab', 'approver', 'report'])),
        ]);
    }

    /**
     * Tolak booking (admin/guru).
     */
    public function reject(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        if ($booking->status !== Booking::STATUS_PENDING) {
            return response()->json([
                'message' => 'Hanya booking berstatus menunggu yang dapat diproses.',
            ], 422);
        }

        $booking->update([
            'status' => Booking::STATUS_REJECTED,
            'rejection_reason' => $validated['reason'],
            'notes' => trim($booking->notes."\nAlasan ditolak: ".$validated['reason']),
        ]);

        // Kirim notifikasi ke pemesan
        Notification::create([
            'user_id' => $booking->user_id,
            'type' => Notification::TYPE_BOOKING_REJECTED,
            'title' => 'Booking Ditolak',
            'message' => "Booking lab {$booking->lab->name} pada {$booking->date} ({$booking->start_time}-{$booking->end_time}) ditolak. Alasan: {$validated['reason']}",
            'booking_id' => $booking->id,
        ]);

        return response()->json([
            'message' => 'Booking ditolak.',
            'data' => new BookingResource($booking->fresh(['user', 'lab', 'approver', 'report'])),
        ]);
    }

    /**
     * Batalkan booking (pemilik atau admin).
     * Booking hanya bisa dibatalkan jika statusnya pending.
     */
    public function cancel(Request $request, Booking $booking)
    {
        // Cek hak akses: pemilik atau admin
        if (! $request->user()->isAdmin() && $request->user()->id !== $booking->user_id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke booking ini.',
            ], 403);
        }

        if (! $booking->isCancellable()) {
            return response()->json([
                'message' => 'Booking hanya bisa dibatalkan jika masih berstatus menunggu.',
            ], 422);
        }

        $booking->update(['status' => Booking::STATUS_CANCELLED]);

        // Kirim notifikasi ke admin/guru jika yang membatalkan adalah siswa
        if (! $request->user()->canApprove()) {
            $this->notifyApprovers(
                $request->user(),
                $booking,
                Notification::TYPE_BOOKING_CANCELLED,
                'Booking Dibatalkan',
                "Booking lab {$booking->lab->name} oleh {$booking->user->name} pada {$booking->date} telah dibatalkan."
            );
        }

        return response()->json([
            'message' => 'Booking berhasil dibatalkan.',
            'data' => new BookingResource($booking->fresh(['user', 'lab', 'approver', 'report'])),
        ]);
    }

    /**
     * Kirim notifikasi ke semua admin dan guru (kecuali pengirim).
     */
    private function notifyApprovers($sender, Booking $booking, string $type, string $title, string $message): void
    {
        $approvers = \App\Models\User::whereIn('role', ['admin', 'guru'])
            ->where('id', '!=', $sender->id)
            ->get();

        foreach ($approvers as $approver) {
            Notification::create([
                'user_id' => $approver->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'booking_id' => $booking->id,
            ]);
        }
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
