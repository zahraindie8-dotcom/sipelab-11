<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Cache;

class HealthController extends Controller
{
    /**
     * Basic health check endpoint.
     * 
     * GET /api/health
     */
    public function index()
    {
        $checks = [
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'version' => config('app.version', '1.0.0'),
            'environment' => app()->environment(),
            'php_version' => phpversion(),
            'laravel_version' => app()->version(),
        ];

        return response()->json($checks, 200);
    }

    /**
     * Detailed health check with dependencies.
     * 
     * GET /api/health/detailed
     */
    public function detailed()
    {
        $checks = [
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'checks' => [],
        ];

        // Database check
        $checks['checks']['database'] = $this->checkDatabase();
        
        // Cache check
        $checks['checks']['cache'] = $this->checkCache();
        
        // Storage check
        $checks['checks']['storage'] = $this->checkStorage();
        
        // Mail check
        $checks['checks']['mail'] = $this->checkMail();

        // Determine overall status
        foreach ($checks['checks'] as $check) {
            if ($check['status'] !== 'healthy') {
                $checks['status'] = 'degraded';
                break;
            }
        }

        $statusCode = $checks['status'] === 'healthy' ? 200 : 503;
        return response()->json($checks, $statusCode);
    }

    /**
     * Readiness check (ready to accept traffic).
     * 
     * GET /api/health/ready
     */
    public function ready()
    {
        $ready = true;
        $checks = [];

        // Database
        try {
            DB::connection()->getPdo();
            $checks['database'] = 'ok';
        } catch (\Exception $e) {
            $checks['database'] = 'error';
            $ready = false;
        }

        // Cache
        try {
            Cache::put('health_check', true, 10);
            if (Cache::get('health_check')) {
                $checks['cache'] = 'ok';
            } else {
                $checks['cache'] = 'error';
                $ready = false;
            }
        } catch (\Exception $e) {
            $checks['cache'] = 'error';
            $ready = false;
        }

        $statusCode = $ready ? 200 : 503;
        return response()->json([
            'ready' => $ready,
            'checks' => $checks,
        ], $statusCode);
    }

    /**
     * Liveness check (is the app alive?).
     * 
     * GET /api/health/live
     */
    public function live()
    {
        return response()->json([
            'alive' => true,
            'timestamp' => now()->toIso8601String(),
        ], 200);
    }

    /**
     * Check database connectivity.
     */
    private function checkDatabase(): array
    {
        try {
            $start = microtime(true);
            DB::connection()->getPdo();
            $time = round((microtime(true) - $start) * 1000, 2);
            
            return [
                'status' => 'healthy',
                'message' => 'Database connected',
                'response_time_ms' => $time,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Database connection failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check cache connectivity.
     */
    private function checkCache(): array
    {
        try {
            $start = microtime(true);
            Cache::put('health_check', true, 10);
            $result = Cache::get('health_check');
            Cache::forget('health_check');
            $time = round((microtime(true) - $start) * 1000, 2);
            
            if ($result) {
                return [
                    'status' => 'healthy',
                    'message' => 'Cache working',
                    'driver' => config('cache.default'),
                    'response_time_ms' => $time,
                ];
            }
            
            return [
                'status' => 'unhealthy',
                'message' => 'Cache read/write failed',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Cache error: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check storage (private).
     */
    private function checkStorage(): array
    {
        $privatePath = storage_path('app/private');
        $writable = is_writable($privatePath);
        
        if ($writable) {
            return [
                'status' => 'healthy',
                'message' => 'Private storage accessible and writable',
                'path' => $privatePath,
            ];
        }
        
        return [
            'status' => 'degraded',
            'message' => 'Private storage not writable',
            'path' => $privatePath,
        ];
    }

    /**
     * Check mail configuration.
     */
    private function checkMail(): array
    {
        $driver = config('mail.default');
        
        if ($driver === 'log' || $driver === 'array') {
            return [
                'status' => 'healthy',
                'message' => 'Mail driver: ' . $driver . ' (development mode)',
            ];
        }
        
        return [
            'status' => 'healthy',
            'message' => 'Mail driver configured: ' . $driver,
        ];
    }
}
