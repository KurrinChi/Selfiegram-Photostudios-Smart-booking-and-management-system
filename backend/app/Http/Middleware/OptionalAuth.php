<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class OptionalAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Skip authentication for OPTIONS requests (CORS preflight)
        if ($request->isMethod('OPTIONS')) {
            return $next($request);
        }

        // For all other requests, require authentication
        $sanctum = app(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class);
        $auth = app(\Illuminate\Auth\Middleware\Authenticate::class);

        return $auth->handle($request, $next, 'sanctum');
    }
}