<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SecurityAuditLog
{
    /**
     * Handle an incoming request.
     *
     * Logs security-relevant events for audit trail.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Log security-relevant events
        $this->logSecurityEvent($request, $response);

        return $response;
    }

    /**
     * Log security event based on request/response.
     */
    private function logSecurityEvent(Request $request, Response $response): void
    {
        $statusCode = $response->getStatusCode();
        $path = $request->path();
        $method = $request->method();
        $ip = $request->ip();
        $userId = $request->user()?->id;
        $userAgent = $request->userAgent();

        // Only log security-relevant events
        $shouldLog = false;
        $level = 'info';
        $message = '';

        // Authentication events
        if (str_contains($path, '/login') || str_contains($path, '/register')) {
            if ($statusCode === 200 || $statusCode === 201) {
                $message = "Auth success: {$method} {$path}";
                $shouldLog = true;
            } elseif ($statusCode === 422 || $statusCode === 401) {
                $message = "Auth failure: {$method} {$path} - Status: {$statusCode}";
                $level = 'warning';
                $shouldLog = true;
            }
        }

        // Rate limiting triggered
        if ($statusCode === 429) {
            $message = "Rate limit exceeded: {$method} {$path}";
            $level = 'warning';
            $shouldLog = true;
        }

        // Forbidden access
        if ($statusCode === 403) {
            $message = "Access denied: {$method} {$path} by user {$userId}";
            $level = 'warning';
            $shouldLog = true;
        }

        // Server errors
        if ($statusCode >= 500) {
            $message = "Server error: {$method} {$path} - Status: {$statusCode}";
            $level = 'error';
            $shouldLog = true;
        }

        // File upload events
        if (str_contains($path, '/reports') && $method === 'POST') {
            $message = "File upload attempt: {$path} by user {$userId}";
            $shouldLog = true;
        }

        // Admin actions
        if (str_contains($path, '/users') || str_contains($path, '/labs')) {
            if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
                $message = "Admin action: {$method} {$path} by user {$userId}";
                $shouldLog = true;
            }
        }

        // Email verification events
        if (str_contains($path, '/email/verify')) {
            $message = "Email verification: {$method} {$path}";
            $shouldLog = true;
        }

        if ($shouldLog) {
            $context = [
                'method' => $method,
                'path' => $path,
                'status' => $statusCode,
                'ip' => $ip,
                'user_id' => $userId,
                'user_agent' => $userAgent,
                'timestamp' => now()->toIso8601String(),
            ];

            // Log to security channel
            Log::channel('security')->$level($message, $context);

            // Also log to main channel for critical events
            if ($level === 'warning' || $level === 'error') {
                Log::warning("SECURITY: {$message}", $context);
            }
        }
    }
}
