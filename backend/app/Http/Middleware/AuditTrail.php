<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AuditTrail
{
    /**
     * Handle an incoming request.
     *
     * Log significant actions for audit trail.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log mutating operations
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $this->logAction($request, $response);
        }

        return $response;
    }

    /**
     * Log the action based on request/response.
     */
    private function logAction(Request $request, Response $response): void
    {
        $user = $request->user();
        $path = $request->path();
        $method = $request->method();
        $statusCode = $response->getStatusCode();

        // Only log successful mutations
        if ($statusCode < 200 || $statusCode >= 300) {
            return;
        }

        $action = $this->determineAction($method, $path);
        $entity = $this->extractEntity($request);

        if ($action) {
            AuditLog::log(
                $action,
                $entity,
                [],
                $request->except(['password', 'password_confirmation']),
                [
                    'endpoint' => $path,
                    'method' => $method,
                    'status_code' => $statusCode,
                ]
            );
        }
    }

    /**
     * Determine the action based on method and path.
     */
    private function determineAction(string $method, string $path): ?string
    {
        // Login
        if (str_contains($path, '/login') && $method === 'POST') {
            return AuditLog::ACTION_LOGIN;
        }

        // Logout
        if (str_contains($path, '/logout') && $method === 'POST') {
            return AuditLog::ACTION_LOGOUT;
        }

        // Register
        if (str_contains($path, '/register') && $method === 'POST') {
            return AuditLog::ACTION_REGISTER;
        }

        // Approve/Reject
        if (str_contains($path, '/approve')) {
            return AuditLog::ACTION_APPROVE;
        }
        if (str_contains($path, '/reject')) {
            return AuditLog::ACTION_REJECT;
        }

        // Cancel
        if (str_contains($path, '/cancel')) {
            return AuditLog::ACTION_CANCEL;
        }

        // Upload
        if ($request->hasFile('photo')) {
            return AuditLog::ACTION_UPLOAD;
        }

        // Export
        if (str_contains($path, '/export')) {
            return AuditLog::ACTION_EXPORT;
        }

        // CRUD operations
        return match($method) {
            'POST' => AuditLog::ACTION_CREATE,
            'PUT', 'PATCH' => AuditLog::ACTION_UPDATE,
            'DELETE' => AuditLog::ACTION_DELETE,
            default => null,
        };
    }

    /**
     * Extract entity from request.
     */
    private function extractEntity(Request $request): ?object
    {
        $route = $request->route();

        if (!$route) {
            return null;
        }

        // Get route parameters
        $parameters = $route->parameters();

        // Return the first model parameter found
        foreach ($parameters as $param) {
            if (is_object($param) && method_exists($param, 'getKey')) {
                return $param;
            }
        }

        return null;
    }
}
