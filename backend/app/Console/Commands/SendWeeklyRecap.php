<?php

namespace App\Console\Commands;

use App\Mail\WeeklyRecap;
use App\Models\Booking;
use App\Models\Lab;
use App\Models\Report;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class SendWeeklyRecap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'recap:weekly';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kirim email rekap mingguan ke semua admin';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Mengumpulkan data rekap mingguan...');

        $data = $this->gatherWeeklyData();

        $admins = User::where('role', 'admin')->get();

        if ($admins->isEmpty()) {
            $this->error('Tidak ada admin yang ditemukan.');
            return Command::FAILURE;
        }

        $this->info("Mengirim email ke {$admins->count()} admin...");

        $sentCount = 0;
        foreach ($admins as $admin) {
            try {
                Mail::to($admin->email)->send(new WeeklyRecap(
                    stats: $data['stats'],
                    pendingBookings: $data['pendingBookings'],
                    topLabs: $data['topLabs'],
                    recentReports: $data['recentReports'],
                    weekLabel: $data['weekLabel'],
                ));
                $sentCount++;
                $this->line("  ✓ {$admin->email}");
            } catch (\Exception $e) {
                $this->error("  ✗ {$admin->email}: {$e->getMessage()}");
                \Log::warning("Gagal mengirim rekap mingguan ke {$admin->email}: " . $e->getMessage());
            }
        }

        $this->info("Selesai! Email terkirim ke {$sentCount} admin.");
        return Command::SUCCESS;
    }

    /**
     * Kumpulkan data untuk rekap mingguan.
     */
    private function gatherWeeklyData(): array
    {
        $weekStart = now()->startOfWeek();
        $weekEnd = now()->endOfWeek();

        // Booking minggu ini
        $weekBookings = Booking::whereBetween('date', [
            $weekStart->toDateString(),
            $weekEnd->toDateString(),
        ]);

        $totalBookings = (clone $weekBookings)->count();
        $approved = (clone $weekBookings)->where('status', Booking::STATUS_APPROVED)->count();
        $pending = (clone $weekBookings)->where('status', Booking::STATUS_PENDING)->count();
        $rejected = (clone $weekBookings)->where('status', Booking::STATUS_REJECTED)->count();

        // Pending bookings
        $pendingBookings = Booking::with(['user', 'lab'])
            ->where('status', Booking::STATUS_PENDING)
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($b) => [
                'lab_name' => $b->lab?->name ?? '-',
                'user_name' => $b->user?->name ?? '-',
                'date' => $b->date,
                'time' => "{$b->start_time} - {$b->end_time}",
            ])
            ->toArray();

        // Top labs minggu ini
        $topLabs = Lab::withCount([
            'bookings as week_count' => fn ($q) => $q->whereBetween('date', [
                $weekStart->toDateString(),
                $weekEnd->toDateString(),
            ]),
        ])
            ->orderByDesc('week_count')
            ->limit(5)
            ->get()
            ->map(fn ($lab) => [
                'name' => $lab->name,
                'count' => (int) $lab->week_count,
            ])
            ->toArray();

        // Laporan minggu ini
        $weekReports = Report::whereBetween('created_at', [
            $weekStart->toDateTimeString(),
            $weekEnd->toDateTimeString(),
        ])->count();

        $recentReports = Report::with(['booking.lab', 'user'])
            ->whereBetween('created_at', [
                $weekStart->toDateTimeString(),
                $weekEnd->toDateTimeString(),
            ])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($r) => [
                'lab_name' => $r->booking?->lab?->name ?? '-',
                'user_name' => $r->user?->name ?? '-',
                'date' => $r->created_at->format('d/m/Y'),
            ])
            ->toArray();

        // Week label
        $weekLabel = $weekStart->locale('id')->isoFormat('D MMMM') . ' — ' . $weekEnd->locale('id')->isoFormat('D MMMM YYYY');

        return [
            'stats' => [
                'total_bookings' => $totalBookings,
                'approved' => $approved,
                'pending' => $pending,
                'rejected' => $rejected,
                'reports' => $weekReports,
            ],
            'pendingBookings' => $pendingBookings,
            'topLabs' => $topLabs,
            'recentReports' => $recentReports,
            'weekLabel' => $weekLabel,
        ];
    }
}
