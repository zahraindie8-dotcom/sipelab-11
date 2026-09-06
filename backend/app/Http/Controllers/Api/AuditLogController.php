<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Daftar audit logs (admin only).
     * 
     * GET /api/audit-logs
     */
    public function index(Request $request)
    {
        $query = AuditLog::with('user');

        // Filter by user
        if ($request->has('user_id')) {
            $query->forUser($request->user_id);
        }

        // Filter by action
        if ($request->has('action')) {
            $query->forAction($request->action);
        }

        // Filter by entity type
        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->where('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('created_at', '<=', $request->to_date . ' 23:59:59');
        }

        // Filter by IP
        if ($request->has('ip_address')) {
            $query->where('ip_address', $request->ip_address);
        }

        // Search in metadata
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('entity_type', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        // Order and paginate
        $logs = $query->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
            'filters' => [
                'actions' => AuditLog::pluck('action')->unique()->values(),
                'entity_types' => AuditLog::pluck('entity_type')->filter()->unique()->values(),
            ],
        ]);
    }

    /**
     * Detail audit log.
     * 
     * GET /api/audit-logs/{id}
     */
    public function show(AuditLog $auditLog)
    {
        return response()->json([
            'data' => $auditLog->load('user'),
        ]);
    }

    /**
     * Statistik audit logs.
     * 
     * GET /api/audit-logs/stats
     */
    public function stats(Request $request)
    {
        $period = $request->integer('period', 24); // hours
        $since = now()->subHours($period);

        $stats = [
            'total_actions' => AuditLog::where('created_at', '>=', $since)->count(),
            'by_action' => AuditLog::where('created_at', '>=', $since)
                ->selectRaw('action, COUNT(*) as count')
                ->groupBy('action')
                ->pluck('count', 'action'),
            'by_entity' => AuditLog::where('created_at', '>=', $since)
                ->selectRaw('entity_type, COUNT(*) as count')
                ->groupBy('entity_type')
                ->pluck('count', 'entity_type'),
            'by_user' => AuditLog::where('created_at', '>=', $since)
                ->selectRaw('user_id, COUNT(*) as count')
                ->groupBy('user_id')
                ->with('user:id,name,email')
                ->pluck('count', 'user_id'),
            'top_ips' => AuditLog::where('created_at', '>=', $since)
                ->selectRaw('ip_address, COUNT(*) as count')
                ->groupBy('ip_address')
                ->orderByDesc('count')
                ->limit(10)
                ->pluck('count', 'ip_address'),
            'hourly_distribution' => AuditLog::where('created_at', '>=', $since)
                ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
                ->groupBy('hour')
                ->orderBy('hour')
                ->pluck('count', 'hour'),
        ];

        return response()->json([
            'period_hours' => $period,
            'since' => $since->toIso8601String(),
            'stats' => $stats,
        ]);
    }

    /**
     * Export audit logs ke CSV.
     * 
     * GET /api/audit-logs/export
     */
    public function export(Request $request)
    {
        $query = AuditLog::with('user');

        // Apply filters
        if ($request->has('from_date')) {
            $query->where('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('created_at', '<=', $request->to_date . ' 23:59:59');
        }
        if ($request->has('action')) {
            $query->forAction($request->action);
        }

        $logs = $query->latest()->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="audit_logs_' . now()->format('Y-m-d_H-i-s') . '.csv"',
        ];

        $callback = function () use ($logs) {
            $file = fopen('php://output', 'w');

            // Header CSV
            fputcsv($file, [
                'ID',
                'Waktu',
                'User',
                'Email',
                'Action',
                'Entity Type',
                'Entity ID',
                'IP Address',
                'User Agent',
            ]);

            // Data CSV
            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->created_at->format('d/m/Y H:i:s'),
                    $log->user?->name ?? '-',
                    $log->user?->email ?? '-',
                    $log->action_label,
                    $log->entity_name,
                    $log->entity_id ?? '-',
                    $log->ip_address ?? '-',
                    $log->user_agent ?? '-',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
