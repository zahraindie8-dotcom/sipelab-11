<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class SystemStatusController extends Controller
{
    /**
     * System status (admin only).
     * 
     * GET /api/system/status
     */
    public function index()
    {
        $status = [
            'app' => $this->getAppStatus(),
            'database' => $this->getDatabaseStatus(),
            'cache' => $this->getCacheStatus(),
            'storage' => $this->getStorageStatus(),
            'queue' => $this->getQueueStatus(),
            'mail' => $this->getMailStatus(),
            'server' => $this->getServerStatus(),
        ];

        return response()->json([
            'status' => collect($status)->every(fn($s) => $s['status'] === 'healthy') ? 'healthy' : 'degraded',
            'timestamp' => now()->toIso8601String(),
            'checks' => $status,
        ]);
    }

    /**
     * Application information.
     */
    private function getAppStatus(): array
    {
        return [
            'status' => 'healthy',
            'name' => config('app.name'),
            'version' => '1.1.0',
            'environment' => app()->environment(),
            'debug' => config('app.debug'),
            'url' => config('app.url'),
            'timezone' => config('app.timezone'),
        ];
    }

    /**
     * Database status.
     */
    private function getDatabaseStatus(): array
    {
        try {
            $start = microtime(true);
            $connection = DB::connection();
            $connection->getPdo();
            $time = round((microtime(true) - $start) * 1000, 2);

            $tableStats = [];
            $tables = ['users', 'labs', 'bookings', 'reports', 'notifications'];
            
            foreach ($tables as $table) {
                try {
                    $count = DB::table($table)->count();
                    $tableStats[$table] = $count;
                } catch (\Exception $e) {
                    $tableStats[$table] = 'error';
                }
            }

            return [
                'status' => 'healthy',
                'driver' => config('database.default'),
                'response_time_ms' => $time,
                'tables' => $tableStats,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Cache status.
     */
    private function getCacheStatus(): array
    {
        try {
            $start = microtime(true);
            Cache::put('system_status_test', true, 60);
            $result = Cache::get('system_status_test');
            Cache::forget('system_status_test');
            $time = round((microtime(true) - $start) * 1000, 2);

            return [
                'status' => $result ? 'healthy' : 'unhealthy',
                'driver' => config('cache.default'),
                'response_time_ms' => $time,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Storage status.
     */
    private function getStorageStatus(): array
    {
        $disks = ['local', 'public', 'private'];
        $status = [];

        foreach ($disks as $disk) {
            try {
                $root = config("filesystems.disks.{$disk}.root");
                $exists = File::isDirectory($root);
                $writable = $exists ? is_writable($root) : false;
                
                $status[$disk] = [
                    'exists' => $exists,
                    'writable' => $writable,
                    'path' => $root,
                ];
            } catch (\Exception $e) {
                $status[$disk] = [
                    'exists' => false,
                    'writable' => false,
                    'error' => $e->getMessage(),
                ];
            }
        }

        $allHealthy = collect($status)->every(fn($s) => $s['writable']);

        return [
            'status' => $allHealthy ? 'healthy' : 'degraded',
            'disks' => $status,
        ];
    }

    /**
     * Queue status.
     */
    private function getQueueStatus(): array
    {
        $driver = config('queue.default');
        
        return [
            'status' => 'healthy',
            'driver' => $driver,
            'message' => $driver === 'sync' ? 'Using sync driver (no queue)' : 'Queue active',
        ];
    }

    /**
     * Mail status.
     */
    private function getMailStatus(): array
    {
        $driver = config('mail.default');
        
        return [
            'status' => 'healthy',
            'driver' => $driver,
            'from' => config('mail.from.address'),
        ];
    }

    /**
     * Server status.
     */
    private function getServerStatus(): array
    {
        return [
            'status' => 'healthy',
            'php_version' => phpversion(),
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'CLI',
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time'),
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'post_max_size' => ini_get('post_max_size'),
            'disk_free_space' => $this->formatBytes(disk_free_space('/')),
            'disk_total_space' => $this->formatBytes(disk_total_space('/')),
        ];
    }

    /**
     * Format bytes to human readable.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
