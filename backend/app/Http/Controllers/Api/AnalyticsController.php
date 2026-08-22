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
     * Data analitik untuk admin:
     * - Booking per bulan (12 bulan terakhir)
     * - Penggunaan lab (jumlah booking disetujui per lab)
     * - Status breakdown (pending / approved / rejected)
     * - Booking per hari dalam minggu ini
     * - Jam tersibuk
     */
    public function index(Request $request)
    {
        // ============================================================
        // 1. Booking per bulan (12 bulan terakhir)
        // ============================================================
        $monthlyBookings = Booking::where('created_at', '>=', now()->subMonths(11)->startOfMonth())
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
        $labUsage = Lab::withCount([
            'bookings as approved_count' => fn ($q) => $q->where('status', Booking::STATUS_APPROVED),
            'bookings as total_count',
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
        $statusBreakdown = Booking::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // ============================================================
        // 4. Booking per hari dalam minggu ini
        // ============================================================
        $weeklyBookings = Booking::whereBetween('date', [
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
        $peakHours = Booking::select(
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
        // 6. Ringkasan
        // ============================================================
        $totalBookings = Booking::count();
        $totalApproved = Booking::where('status', Booking::STATUS_APPROVED)->count();
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
        ]);
    }
}
