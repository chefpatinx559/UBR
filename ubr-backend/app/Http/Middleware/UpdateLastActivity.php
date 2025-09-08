<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class UpdateLastActivity
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user()) {
            $request->user()->updateLastActive();
        }

        return $next($request);
    }
}