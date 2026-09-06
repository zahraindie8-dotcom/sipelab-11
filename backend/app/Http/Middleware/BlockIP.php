<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class BlockIP
{
    /**
     * Blocked IPs (from config or database).
     */
    private array $blockedIPs = [];

    /**
     * Whitelisted IPs (bypass all checks).
     */
    private array $whitelistedIPs = [];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();

        // Load blocked IPs from config/cache
        $this->loadIPLists();

        // Check if IP is whitelisted (bypass blocking)
        if ($this->isWhitelisted($ip)) {
            return $next($request);
        }

        // Check if IP is blocked
        if ($this->isBlocked($ip)) {
            Log::warning("Blocked IP attempted access", [
                'ip' => $ip,
                'path' => $request->path(),
                'method' => $request->method(),
            ]);

            return response()->json([
                'message' => 'Akses ditolak. IP Anda telah diblokir.',
            ], 403);
        }

        // Check for suspicious activity
        if ($this->isSuspicious($ip)) {
            Log::warning("Suspicious activity detected", [
                'ip' => $ip,
                'path' => $request->path(),
                'method' => $request->method(),
            ]);

            // Block IP after repeated suspicious activity
            $this->blockIP($ip, 3600); // Block for 1 hour
        }

        $response = $next($request);

        // Log failed authentication attempts
        if ($response->getStatusCode() === 401 || $response->getStatusCode() === 422) {
            $this->trackFailedAttempt($ip);
        }

        return $response;
    }

    /**
     * Load IP lists from config/cache.
     */
    private function loadIPLists(): void
    {
        // Blocked IPs from config
        $this->blockedIPs = config('security.blocked_ips', []);
        
        // Whitelisted IPs from config
        $this->whitelistedIPs = config('security.whitelisted_ips', []);

        // Load dynamically blocked IPs from cache
        $dynamicBlocked = Cache::get('blocked_ips', []);
        $this->blockedIPs = array_merge($this->blockedIPs, $dynamicBlocked);
    }

    /**
     * Check if IP is whitelisted.
     */
    private function isWhitelisted(string $ip): bool
    {
        return in_array($ip, $this->whitelistedIPs);
    }

    /**
     * Check if IP is blocked.
     */
    private function isBlocked(string $ip): bool
    {
        return in_array($ip, $this->blockedIPs);
    }

    /**
     * Check for suspicious activity.
     */
    private function isSuspicious(string $ip): bool
    {
        $key = "suspicious:{$ip}";
        $attempts = Cache::get($key, 0);
        
        // Block after 20 failed attempts in 10 minutes
        return $attempts >= 20;
    }

    /**
     * Track failed authentication attempt.
     */
    private function trackFailedAttempt(string $ip): void
    {
        $key = "suspicious:{$ip}";
        $attempts = Cache::get($key, 0);
        
        Cache::put($key, $attempts + 1, now()->addMinutes(10));
    }

    /**
     * Block IP dynamically.
     */
    private function blockIP(string $ip, int $seconds = 3600): void
    {
        $blocked = Cache::get('blocked_ips', []);
        $blocked[] = $ip;
        Cache::put('blocked_ips', $blocked, $seconds);
        
        Log::warning("IP blocked dynamically", [
            'ip' => $ip,
            'duration_seconds' => $seconds,
        ]);
    }

    /**
     * Unblock IP (admin only).
     */
    public static function unblockIP(string $ip): void
    {
        $blocked = Cache::get('blocked_ips', []);
        $blocked = array_filter($blocked, fn($banned) => $banned !== $ip);
        Cache::put('blocked_ips', array_values($blocked), now()->addHours(24));
    }

    /**
     * Get all blocked IPs.
     */
    public static function getBlockedIPs(): array
    {
        return Cache::get('blocked_ips', []);
    }
}
