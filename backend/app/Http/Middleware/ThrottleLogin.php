<?php

namespace App\Http\Middleware;

use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter as RateLimiterFacade;
use Closure;

class ThrottleLogin
{
    /**
     * Handle an incoming request.
     *
     * Rate limit: 5 attempts per minute per IP for login/register.
     */
    public function handle(Request $request, Closure $next)
    {
        $key = 'login:' . ($request->ip() ?? 'unknown');

        if (RateLimiterFacade::tooManyAttempts($key, 5)) {
            $seconds = RateLimiterFacade::availableIn($key);

            return response()->json([
                'message' => "Terlalu banyak percobaan. Coba lagi dalam {$seconds} detik.",
            ], 429);
        }

        RateLimiterFacade::hit($key, 60);

        return $next($request);
    }
}
