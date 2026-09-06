<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

/**
 * Base controller with caching methods.
 * Extend this controller for cached responses.
 */
class CachedController extends Controller
{
    /**
     * Get cached response or execute callback.
     *
     * @param  string  $key  Cache key
     * @param  int  $minutes  Cache duration in minutes
     * @param  callable  $callback  Callback to execute if cache miss
     * @return mixed
     */
    protected function cacheResponse(string $key, int $minutes, callable $callback)
    {
        return Cache::remember($key, now()->addMinutes($minutes), $callback);
    }

    /**
     * Generate cache key based on request.
     *
     * @param  string  $prefix  Key prefix
     * @return string
     */
    protected function cacheKey(string $prefix): string
    {
        $userId = request()->user()?->id ?? 'guest';
        $query = md5(serialize(request()->query()));
        
        return "{$prefix}:user:{$userId}:query:{$query}";
    }

    /**
     * Clear cache by prefix.
     *
     * @param  string  $prefix  Key prefix to clear
     * @return void
     */
    protected function clearCache(string $prefix): void
    {
        $keys = Cache::getKeys();
        foreach ($keys as $key) {
            if (str_starts_with($key, $prefix)) {
                Cache::forget($key);
            }
        }
    }

    /**
     * Clear all user-related cache.
     *
     * @param  int  $userId  User ID
     * @return void
     */
    protected function clearUserCache(int $userId): void
    {
        $this->clearCache("user:{$userId}");
    }

    /**
     * Clear dashboard cache.
     *
     * @return void
     */
    protected function clearDashboardCache(): void
    {
        $this->clearCache('dashboard');
    }

    /**
     * Clear bookings cache.
     *
     * @return void
     */
    protected function clearBookingsCache(): void
    {
        $this->clearCache('bookings');
        $this->clearCache('dashboard');
    }

    /**
     * Clear labs cache.
     *
     * @return void
     */
    protected function clearLabsCache(): void
    {
        $this->clearCache('labs');
    }

    /**
     * Get cache statistics.
     *
     * @return array
     */
    protected function getCacheStats(): array
    {
        $keys = Cache::getKeys();
        $stats = [
            'total_keys' => count($keys),
            'prefixes' => [],
        ];

        foreach ($keys as $key) {
            $prefix = explode(':', $key)[0] ?? 'unknown';
            $stats['prefixes'][$prefix] = ($stats['prefixes'][$prefix] ?? 0) + 1;
        }

        return $stats;
    }
}
