<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\Booking;
use App\Models\Report;
use App\Models\ReportFile;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
class ReportController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Report::with([
            'booking.user',
            'booking.lab',
            'user',
            'files',
        ])->latest();
        if (! $user->canApprove()) {
            $query->where('user_id', $user->id);
        }
        $reports = $query->paginate(
            $request->integer('per_page', 10)
        );
        return ReportResource::collection($reports);
    }
    public function store(StoreReportRequest $request)
    {
        $user = $request->user();
        $booking = Booking::with(['user', 'lab'])
            ->findOrFail($request->validated('booking_id'));
        // Pastikan borrowing otomatis berubah menjadi completed
        // jika tanggal + jam selesai sudah lewat.
        $startDateTime = Carbon::parse(
            $booking->date . ' ' . $booking->start_time
        );

        $endDateTime = Carbon::parse(
            $booking->date . ' ' . $booking->end_time
        );

        $now = now();

if (! $user->canApprove() && $booking->user_id !== $user->id) {
    return response()->json([
        'message' => 'Anda tidak dapat membuat laporan untuk borrowing milik pengguna lain.',
    ], 403);
}

        $now = now();

if (
    ! $user->canApprove()
    && ($now->lt($startDateTime) || $now->greaterThanOrEqualTo($endDateTime))
) {
            return response()->json([
                'message' => 'Laporan hanya dapat diunggah pada waktu borrowing yang telah dijadwalkan.',
            ], 422);
        }
        if ($booking->report()->exists()) {
            return response()->json([
                'message' => 'Laporan untuk borrowing ini sudah dibuat.',
            ], 422);
        }
        $photoPath = null;

        if ($request->hasFile('photo')) {
            $filename = Str::uuid()->toString() . '.' . $request->file('photo')->getClientOriginalExtension();

            $photoPath = $request->file('photo')->storeAs(
                'reports',
                $filename,
                'private'
            );
        }
        $report = Report::create([
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'photo' => $photoPath,
            'description' => $request->validated('description'),
        ]);
        try {
            foreach ($request->file('before', []) as $file) {
                $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs(
                    'reports',
                    $filename,
                    'private'
                );
                ReportFile::create([
                    'report_id' => $report->id,
                    'type' => 'before',
                    'file' => $path,
                ]);
            }
            foreach ($request->file('after', []) as $file) {
                $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs(
                    'reports',
                    $filename,
                    'private'
                );
                ReportFile::create([
                    'report_id' => $report->id,
                    'type' => 'after',
                    'file' => $path,
                ]);
            }
        } catch (\Throwable $e) {
            foreach ($report->files as $reportFile) {
                Storage::disk('private')->delete($reportFile->file);
                $reportFile->delete();
            }
            $report->delete();
            throw $e;
        }

        $booking->update([
            'status' => Booking::STATUS_COMPLETED,
        ]);
        
        return response()->json([
            'message' => 'Laporan berhasil disimpan.',
            'data' => new ReportResource(
                $report->load([
                    'booking.user',
                    'booking.lab',
                    'user',
                    'files',
                ])
            ),
        ], 201);
    }
    public function all(Request $request)
    {
        $reports = Report::with([
            'booking.user',
            'booking.lab',
            'user',
            'files',
        ])
            ->latest()
            ->get();
        return ReportResource::collection($reports);
    }
    public function destroy(Request $request, Report $report)
    {
        $user = $request->user();
        if (! $user->isAdmin() && $report->user_id !== $user->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin menghapus laporan ini.',
            ], 403);
        }
        if ($report->photo) {
            Storage::disk('private')->delete($report->photo);
        }
        foreach ($report->files as $reportFile) {
            Storage::disk('private')->delete($reportFile->file);
            $reportFile->delete();
        }
        $report->delete();
        return response()->json([
            'message' => 'Laporan berhasil dihapus.',
        ]);
    }
    public function showPhoto(Request $request, Report $report)
    {
        $user = $request->user();
        if (! $user->canApprove() && $report->user_id !== $user->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin melihat foto ini.',
            ], 403);
        }
        if (! $report->photo || ! Storage::disk('private')->exists($report->photo)) {
            return response()->json([
                'message' => 'Foto laporan tidak ditemukan.',
            ], 404);
        }
        $path = $report->photo;
        return response()->file(
            Storage::disk('private')->path($path)
        );
    }
    public function showFile(Request $request, Report $report, ReportFile $file)
    {
        $user = $request->user();
        if ($file->report_id !== $report->id) {
            return response()->json([
                'message' => 'File laporan tidak sesuai.',
            ], 404);
        }
        if (! $user->canApprove() && $report->user_id !== $user->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin melihat file ini.',
            ], 403);
        }
        if (! Storage::disk('private')->exists($file->file)) {
            return response()->json([
                'message' => 'File laporan tidak ditemukan.',
            ], 404);
        }
        return response()->file(
            Storage::disk('private')->path($file->file)
        );
    }
}
