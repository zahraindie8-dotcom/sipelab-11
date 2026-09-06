<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CacheResponse
{
    /**
     * Handle an incoming request.
     *
     * Cache GET responses for specified duration.
     */
    public function handle(Request $request, Closure $next, int $minutes = 5): Response
    {
        // Only cache GET requests
        if ($request->method() !== 'GET') {
            return $next($request);
        }

        // Don't cache if user is not authenticated
        if (! $request->user()) {
            return $next($request);
        }

        // Generate cache key
        $key = $this->generateKey($request);

        // Check cache
        if (Cache::has($key)) {
            $response = Cache::get($key);
            $response->headers->set('X-Cache', 'HIT');
            return $response;
        }

        // Execute request
        $response = $next($request);

        // Cache successful responses
        if ($response->getStatusCode() === 200) {
            Cache::put($key, $response, now()->addMinutes($minutes));
            $response->headers->set('X-Cache', 'MISS');
        }

        return $response;
    }

    /**
     * Generate cache key based on request.
     */
    private function generateKey(Request $request): string
    {
        $userId = $request->user()?->id ?? 'guest';
        $path = $request->path();
        $query = md5(serialize($request->query()));
        $role = $request->user()?->role ?? 'none';

        return "response:{$role}:{$userId}:{$path}:{$query}";
    }

    /**
     * Clear response cache.
     */
    public static function clearCache(): void
    {
        $keys = Cache::getKeys();
        foreach ($keys as $key) {
            if (str_starts_with($key, 'response:')) {
                Cache::forget($key);
            }
        }
    }
}
