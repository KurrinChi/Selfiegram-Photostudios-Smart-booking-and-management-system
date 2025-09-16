<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$userTypes)
    {
        // Check if user is authenticated with Sanctum
        if (!auth('sanctum')->check()) {
            return response()->json([
                'message' => 'Unauthenticated. Please login first.',
                'error' => 'unauthorized'
            ], 401);
        }

        $user = auth('sanctum')->user();

        // Check if user has the required role
        if (!in_array($user->userType, $userTypes)) {
            return response()->json([
                'message' => 'Access denied. Insufficient privileges.',
                'error' => 'forbidden',
                'required_roles' => $userTypes,
                'user_role' => $user->userType
            ], 403);
        }

        return $next($request);
    }
}
