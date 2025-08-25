<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$userTypes)
    {
        if (!auth('sanctum')->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = auth('sanctum')->user();

        if (!in_array($user->userType, $userTypes)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
