<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * Adds security-related HTTP headers to every response.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Prevent MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Prevent clickjacking
        $response->headers->set('X-Frame-Options', 'DENY');

        // XSS Protection (legacy browsers)
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Referrer Policy — send origin only on cross-origin requests
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissions Policy — disable unused browser features
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

        // HSTS — force HTTPS for 1 year (only in production)
        if ($request->secure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Generate nonce untuk CSP (Content Security Policy)
        $nonce = base64_encode(random_bytes(16));
        
        // Store nonce in request for use in views
        $request->attributes->set('csp_nonce', $nonce);

        // Content Security Policy — restrict resource loading dengan nonce
        // Nonce memungkinkan inline script yang diizinkan tanpa 'unsafe-inline'
        $csp = [
            "default-src 'self'",
            "script-src 'self' 'nonce-{$nonce}' 'strict-dynamic'",
            "style-src 'self' 'nonce-{$nonce}' 'unsafe-inline'",
            "img-src 'self' data: blob: http: https:",
            "font-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ];
        $response->headers->set('Content-Security-Policy', implode('; ', $csp));

        // Remove X-Powered-By header
        $response->headers->remove('X-Powered-By');

        // Remove Server header
        $response->headers->remove('Server');

        return $response;
    }
}
