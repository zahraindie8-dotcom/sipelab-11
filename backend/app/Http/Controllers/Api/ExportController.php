<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ExportController extends Controller
{
    /**
     * Export bookings to CSV.
     * Hanya admin & guru yang bisa export.
     */
    public function bookings(Request $request)
    {
        $query = Booking::with(['user', 'lab', 'approver'])
            ->when(! $request->user()->canApprove(), function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->when($request->query('status'), function ($q, $status) {
                $q->where('status', $status);
            })
            ->when($request->query('lab_id'), function ($q, $labId) {
                $q->where('lab_id', $labId);
            })
            ->when($request->query('date_from'), function ($q, $dateFrom) {
                $q->where('date', '>=', $dateFrom);
            })
            ->when($request->query('date_to'), function ($q, $dateTo) {
                $q->where('date', '<=', $dateTo);
            })
            ->latest()
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="booking_export_' . now()->format('Y-m-d_H-i-s') . '.csv"',
        ];

        $callback = function () use ($query) {
            $file = fopen('php://output', 'w');

            // Header CSV
            fputcsv($file, [
                'ID',
                'Pemesan',
                'Email',
                'Role',
                'Lab',
                'Kode Lab',
                'Tanggal',
                'Jam Mulai',
                'Jam Selesai',
                'Tujuan',
                'Jumlah Peserta',
                'Status',
                'Disetujui Oleh',
                'Waktu Persetujuan',
                'Alasan Penolakan',
                'Catatan',
                'Dibuat Pada',
            ]);

            // Data CSV
            foreach ($query as $booking) {
                fputcsv($file, [
                    $booking->id,
                    $booking->user?->name ?? '-',
                    $booking->user?->email ?? '-',
                    $booking->user?->role ?? '-',
                    $booking->lab?->name ?? '-',
                    $booking->lab?->code ?? '-',
                    $booking->date,
                    $booking->start_time,
                    $booking->end_time,
                    $booking->purpose ?? '-',
                    $booking->participant_count ?? 0,
                    $booking->status_label,
                    $booking->approver?->name ?? '-',
                    $booking->approved_at?->format('d/m/Y H:i') ?? '-',
                    $booking->rejection_reason ?? '-',
                    $booking->notes ?? '-',
                    $booking->created_at?->format('d/m/Y H:i') ?? '-',
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    /**
     * Export reports to CSV.
     * Admin & guru bisa export semua, siswa hanya miliknya.
     */
    public function reports(Request $request)
    {
        $query = Report::with(['booking.user', 'booking.lab', 'user'])
            ->when(! $request->user()->canApprove(), function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->latest()
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="laporan_export_' . now()->format('Y-m-d_H-i-s') . '.csv"',
        ];

        $callback = function () use ($query) {
            $file = fopen('php://output', 'w');

            // Header CSV
            fputcsv($file, [
                'ID',
                'Lab',
                'Kode Lab',
                'Tanggal Booking',
                'Jam',
                'Status Booking',
                'Pelapor',
                'Email Pelapor',
                'Deskripsi Aktivitas',
                'Foto',
                'Dilaporkan Pada',
            ]);

            // Data CSV
            foreach ($query as $report) {
                fputcsv($file, [
                    $report->id,
                    $report->booking?->lab?->name ?? '-',
                    $report->booking?->lab?->code ?? '-',
                    $report->booking?->date ?? '-',
                    ($report->booking?->start_time ?? '-') . ' - ' . ($report->booking?->end_time ?? '-'),
                    $report->booking?->status_label ?? '-',
                    $report->user?->name ?? '-',
                    $report->user?->email ?? '-',
                    $report->description ?? '-',
                    $report->photo_url ?? '-',
                    $report->created_at?->format('d/m/Y H:i') ?? '-',
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }
}
