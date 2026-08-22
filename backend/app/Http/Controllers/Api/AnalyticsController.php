<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Lab;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Data analitik — accessible by admin, guru, and siswa (role-scoped).
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
        $baseQuery = Booking::query()
            ->when(! $user->canApprove(), fn ($q) => $q->where('user_id', $user->id))
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->where('created_at', '<=', $dateTo . ' 23:59:59'));

        // ============================================================
        // 1. Booking per bulan (N bulan terakhir)
        // ============================================================
        $monthlyBookings = (clone $baseQuery)
            ->where('created_at', '>=', now()->subMonths($months - 1)->startOfMonth())
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved"),
                DB::raw("SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending"),
                DB::raw("SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected"),
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Isi bulan yang kosong dengan 0.
        $months = collect();
        for ($i = 11; $i >= 0; $i--) {
            $key = now()->subMonths($i)->format('Y-m');
            $found = $monthlyBookings->firstWhere('month', $key);
            $months->push([
                'month' => $key,
                'label' => now()->subMonths($i)->locale('id')->isoFormat('MMM YYYY'),
                'total' => $found['total'] ?? 0,
                'approved' => $found['approved'] ?? 0,
                'pending' => $found['pending'] ?? 0,
                'rejected' => $found['rejected'] ?? 0,
            ]);
        }

        // ============================================================
        // 2. Penggunaan lab (jumlah booking disetujui per lab)
        // ============================================================
        $labQuery = Lab::query()
            ->when(! $user->canApprove(), function ($q) use ($user) {
                $q->whereHas('bookings', fn ($bq) => $bq->where('user_id', $user->id));
            });

        $labUsage = (clone $labQuery)->withCount([
            'bookings as approved_count' => fn ($q) => $q->where('status', Booking::STATUS_APPROVED)
                ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
                ->when($dateTo, fn ($q) => $q->where('created_at', '<=', $dateTo . ' 23:59:59')),
            'bookings as total_count' => fn ($q) => $q
                ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', $dateFrom))
                ->when($dateTo, fn ($q) => $q->where('created_at', '<=', $dateTo . ' 23:59:59')),
        ])->orderByDesc('approved_count')->get()->map(fn ($lab) => [
            'id' => $lab->id,
            'name' => $lab->name,
            'capacity' => $lab->capacity,
            'approved_count' => (int) $lab->approved_count,
            'total_count' => (int) $lab->total_count,
        ]);

        // ============================================================
        // 3. Status breakdown
        // ============================================================
        $statusBreakdown = (clone $baseQuery)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // ============================================================
        // 4. Booking per hari dalam minggu ini
        // ============================================================
        $weeklyBookings = (clone $baseQuery)
            ->whereBetween('date', [
                now()->startOfWeek()->toDateString(),
                now()->endOfWeek()->toDateString(),
            ])->select(
                DB::raw('DAYOFWEEK(date) as day_of_week'),
                DB::raw('COUNT(*) as total'),
            )->groupBy('day_of_week')
            ->get()
            ->mapWithKeys(fn ($row) => [$row['day_of_week'] => (int) $row['total']]);

        // ============================================================
        // 5. Jam tersibuk (jam yang paling banyak booking)
        // ============================================================
        $peakHours = (clone $baseQuery)->select(
            DB::raw('HOUR(start_time) as hour'),
            DB::raw('COUNT(*) as total'),
        )->groupBy('hour')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'hour' => str_pad($row['hour'], 2, '0', STR_PAD_LEFT) . ':00',
                'total' => (int) $row['total'],
            ]);

        // ============================================================
        // 6. Month-over-Month Trends
        // ============================================================
        $thisMonthStart = now()->startOfMonth();
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();

        $thisMonthQuery = (clone $baseQuery)
            ->where('created_at', '>=', $thisMonthStart)
            ->where('created_at', '<=', now());
        $lastMonthQuery = Booking::query()
            ->when(! $user->canApprove(), fn ($q) => $q->where('user_id', $user->id))
            ->where('created_at', '>=', $lastMonthStart)
            ->where('created_at', '<=', $lastMonthEnd);

        $thisMonthTotal = (clone $thisMonthQuery)->count();
        $lastMonthTotal = (clone $lastMonthQuery)->count();
        $thisMonthApproved = (clone $thisMonthQuery)->where('status', Booking::STATUS_APPROVED)->count();
        $lastMonthApproved = (clone $lastMonthQuery)->where('status', Booking::STATUS_APPROVED)->count();

        $trends = [
            'this_month' => [
                'label' => now()->locale('id')->isoFormat('MMMM YYYY'),
                'total' => $thisMonthTotal,
                'approved' => $thisMonthApproved,
            ],
            'last_month' => [
                'label' => now()->subMonth()->locale('id')->isoFormat('MMMM YYYY'),
                'total' => $lastMonthTotal,
                'approved' => $lastMonthApproved,
            ],
            'total_change' => $lastMonthTotal > 0
                ? round((($thisMonthTotal - $lastMonthTotal) / $lastMonthTotal) * 100, 1)
                : ($thisMonthTotal > 0 ? 100.0 : 0.0),
            'approved_change' => $lastMonthApproved > 0
                ? round((($thisMonthApproved - $lastMonthApproved) / $lastMonthApproved) * 100, 1)
                : ($thisMonthApproved > 0 ? 100.0 : 0.0),
        ];

        // ============================================================
        // 7. Ringkasan
        // ============================================================
        $totalBookings = (clone $baseQuery)->count();
        $totalApproved = (clone $baseQuery)->where('status', Booking::STATUS_APPROVED)->count();
        $totalLabs = Lab::count();

        return response()->json([
            'summary' => [
                'total_bookings' => $totalBookings,
                'total_approved' => $totalApproved,
                'total_labs' => $totalLabs,
                'approval_rate' => $totalBookings > 0
                    ? round(($totalApproved / $totalBookings) * 100, 1)
                    : 0,
            ],
            'monthly_bookings' => $months,
            'lab_usage' => $labUsage,
            'status_breakdown' => [
                'pending' => $statusBreakdown['pending'] ?? 0,
                'approved' => $statusBreakdown['approved'] ?? 0,
                'rejected' => $statusBreakdown['rejected'] ?? 0,
            ],
            'weekly_bookings' => $weeklyBookings,
            'peak_hours' => $peakHours,
            'trends' => $trends,
        ]);
    }
}
