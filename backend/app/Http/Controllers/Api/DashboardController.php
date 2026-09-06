<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Lab;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Statistik ringkas untuk halaman dashboard.
     *
     * Respons dibuat sadar-peran (admin / guru / siswa) sehingga tiap dashboard
     * menampilkan konten yang berbeda:
     * - admin : statistik seluruh sekolah + penggunaan lab + aktivitas terbaru
     * - guru  : antrian persetujuan + statistik seluruh booking + penggunaan lab
     * - siswa : statistik & jadwal booking miliknya sendiri
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Basis query booking sesuai peran: siswa hanya melihat booking miliknya.
        $bookingQuery = Booking::query()
            ->when(! $user->canApprove(), fn ($q) => $q->where('user_id', $user->id));

        $totalBookings = (clone $bookingQuery)->count();
        $pendingCount = (clone $bookingQuery)->where('status', Booking::STATUS_PENDING)->count();
        $approvedCount = (clone $bookingQuery)->where('status', Booking::STATUS_APPROVED)->count();
        $rejectedCount = (clone $bookingQuery)->where('status', Booking::STATUS_REJECTED)->count();
        $cancelledCount = (clone $bookingQuery)->where('status', Booking::STATUS_CANCELLED)->count();

        // Total penggunaan lab (jumlah booking disetujui) per lab.

$labUsage = Lab::withCount([
    'bookings as approved_count' => fn ($q) =>
        $q->where('status', Booking::STATUS_APPROVED)
            ->when(
                ! $user->canApprove(),
                fn ($q) => $q->where('user_id', $user->id)
            ),
])->orderByDesc('approved_count')->get()->map(fn ($lab) => [

            'id' => $lab->id,
            'name' => $lab->name,
            'code' => $lab->code,
            'capacity' => $lab->capacity,
            'approved_count' => (int) $lab->approved_count,
        ]);

        // Aktivitas terbaru: 5 booking terakhir.
        $recentBookings = (clone $bookingQuery)
            ->with(['user', 'lab', 'report'])
            ->latest()
            ->limit(5)
            ->get();

        // Antrian persetujuan (admin & guru): 5 booking pending terbaru.
        $pendingApprovals = $user->canApprove()
            ? Booking::with(['user', 'lab', 'report'])
                ->where('status', Booking::STATUS_PENDING)
                ->latest()
                ->limit(5)
                ->get()
            : collect();

        // Jadwal yang akan datang (siswa): booking disetujui miliknya.
        $upcomingBookings = $user->role === 'siswa'
            ? (clone $bookingQuery)
                ->with(['user', 'lab', 'report'])
                ->where('status', Booking::STATUS_APPROVED)
                ->where('date', '>=', now()->toDateString())
                ->orderBy('date')
                ->orderBy('start_time')
                ->limit(5)
                ->get()
            : collect();

        // Jumlah notifikasi belum dibaca
        $unreadNotifications = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        // Mini chart data: booking count per day (last 7 days)
        $dailyBookingsMap = (clone $bookingQuery)
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->select(
                DB::raw('DATE(created_at) as day'),
                DB::raw('COUNT(*) as total'),
            )
            ->groupBy('day')
            ->pluck('total', 'day')
            ->toArray();

        $miniChartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = now()->subDays($i)->toDateString();
            $miniChartData[] = (int) ($dailyBookingsMap[$day] ?? 0);
        }

        return response()->json([
            'stats' => [
                'total_labs' => Lab::count(),
                'total_bookings' => $totalBookings,
                'pending' => $pendingCount,
                'approved' => $approvedCount,
                'rejected' => $rejectedCount,
                'cancelled' => $cancelledCount,
            ],
            'lab_usage' => $labUsage,
            // Gunakan map() alih-alih BookingResource::collection() agar data
            // dikembalikan sebagai array plain, bukan dibungkus { data: [...] }.
            'recent_bookings' => $recentBookings->map(fn ($b) => new BookingResource($b)),
            'pending_approvals' => $pendingApprovals->map(fn ($b) => new BookingResource($b)),
            'upcoming_bookings' => $upcomingBookings->map(fn ($b) => new BookingResource($b)),
            'unread_notifications' => $unreadNotifications,
            'mini_chart_data' => $miniChartData,
        ]);
    }
}
