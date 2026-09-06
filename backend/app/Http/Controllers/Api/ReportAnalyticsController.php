<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Lab;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportAnalyticsController extends Controller
{
    /**
     * Data analitik laporan penggunaan lab.
     *
     * Query params:
     * - date_from: filter start date (created_at >=)
     * - date_to: filter end date (created_at <=)
     * - months: number of months for monthly chart (default 12)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $months = (int) $request->query('months', 12);
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        // Base query scoped by role
        $baseQuery = Report::query()
            ->when(! $user->canApprove(), fn ($q) => $q->where('user_id', $user->id))
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->where('created_at', '<=', $dateTo . ' 23:59:59'));

        // ============================================================
        // 1. Summary
        // ============================================================
            $totalReports = (clone $baseQuery)->count();

            $bookingQuery = Booking::query()
                ->when(! $user->canApprove(), fn ($q) => $q->where('user_id', $user->id));

            $totalBookings = (clone $bookingQuery)->count();

            $totalApproved = (clone $bookingQuery)
                ->where('status', Booking::STATUS_APPROVED)
                ->count();

            $reportsWithPhotos = (clone $baseQuery)
                ->whereNotNull('photo')
                ->count();

        // ============================================================
        // 2. Laporan per bulan (N bulan terakhir)
        // ============================================================
        $monthlyReports = (clone $baseQuery)
            ->where('created_at', '>=', now()->subMonths($months - 1)->startOfMonth())
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('COUNT(*) as total'),
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Isi bulan yang kosong dengan 0
        $monthlyData = collect();
        for ($i = $months - 1; $i >= 0; $i--) {
            $key = now()->subMonths($i)->format('Y-m');
            $found = $monthlyReports->firstWhere('month', $key);
            $monthlyData->push([
                'month' => $key,
                'label' => now()->subMonths($i)->locale('id')->isoFormat('MMM YYYY'),
                'total' => $found['total'] ?? 0,
            ]);
        }

        // ============================================================
        // 3. Laporan per lab
        // ============================================================
        $labQuery = Lab::query()
            ->when(! $user->canApprove(), function ($q) use ($user) {
                $q->whereHas('bookings.reports', fn ($bq) => $bq->where('user_id', $user->id));
            });

        $labReports = (clone $labQuery)->withCount([
            'bookings as reports_count' => fn ($q) => $q->whereHas('report')
                ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
                ->when($dateTo, fn ($q) => $q->where('created_at', '<=', $dateTo . ' 23:59:59')),
        ])->orderByDesc('reports_count')->get()->map(fn ($lab) => [
            'id' => $lab->id,
            'name' => $lab->name,
            'code' => $lab->code,
            'reports_count' => (int) $lab->reports_count,
        ]);

        // ============================================================
        // 4. Top pelapor
        // ============================================================
        $topReporters = (clone $baseQuery)
            ->join('users', 'reports.user_id', '=', 'users.id')
            ->select('users.name', DB::raw('COUNT(*) as total'))
            ->groupBy('users.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
                'total' => (int) $row->total,
            ]);

        // ============================================================
        // 5. Month-over-Month Trends
        // ============================================================
        $thisMonthStart = now()->startOfMonth();
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();

        $thisMonthReports = (clone $baseQuery)
            ->where('created_at', '>=', $thisMonthStart)
            ->where('created_at', '<=', now())
            ->count();
        $lastMonthReports = Report::query()
            ->when(! $user->canApprove(), fn ($q) => $q->where('user_id', $user->id))
            ->where('created_at', '>=', $lastMonthStart)
            ->where('created_at', '<=', $lastMonthEnd)
            ->count();

        $trends = [
            'this_month' => [
                'label' => now()->locale('id')->isoFormat('MMMM YYYY'),
                'total' => $thisMonthReports,
            ],
            'last_month' => [
                'label' => now()->subMonth()->locale('id')->isoFormat('MMMM YYYY'),
                'total' => $lastMonthReports,
            ],
            'change' => $lastMonthReports > 0
                ? round((($thisMonthReports - $lastMonthReports) / $lastMonthReports) * 100, 1)
                : ($thisMonthReports > 0 ? 100.0 : 0.0),
        ];

        return response()->json([
            'summary' => [
                'total_reports' => $totalReports,
                'total_bookings' => $totalBookings,
                'total_approved' => $totalApproved,
                'reports_with_photos' => $reportsWithPhotos,
                'report_rate' => $totalApproved > 0
                    ? round(($totalReports / $totalApproved) * 100, 1)
                    : 0,
            ],
            'monthly_reports' => $monthlyData,
            'lab_reports' => $labReports,
            'top_reporters' => $topReporters,
            'trends' => $trends,
        ]);
    }
}
