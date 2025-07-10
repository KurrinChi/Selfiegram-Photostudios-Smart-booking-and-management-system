<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
     public function getSummary()
    {
        // General stats 
        // Under maintenance, might return incorrect values due to logic error
        $totalUsers = DB::table('users')->where('archive', 1)->count();
        $totalBookings = DB::table('booking')->count();
        $totalSales = DB::table('transaction')->sum('receivedAmount');
        $totalAppointments = DB::table('booking')->count();

        // Weekly sales calcu
        $now = Carbon::now();
        $startOfThisWeek = $now->copy()->startOfWeek();
        $startOfLastWeek = $now->copy()->subWeek()->startOfWeek();
        $endOfLastWeek = $startOfThisWeek->copy()->subSecond();

        $salesThisWeek = DB::table('transaction')
            ->whereBetween('date', [$startOfThisWeek, $now])
            ->sum('receivedAmount');

        $salesLastWeek = DB::table('transaction')
            ->whereBetween('date', [$startOfLastWeek, $endOfLastWeek])
            ->sum('receivedAmount');

        $salesTrend = $salesLastWeek > 0
            ? round((($salesThisWeek - $salesLastWeek) / $salesLastWeek) * 100, 2)
            : 0;

        return response()->json([
            'totalUsers' => $totalUsers,
            'totalBookings' => $totalBookings,
            'totalSales' => $salesThisWeek, // You can also send both totalSales & this week's sales separately
            'totalAppointments' => $totalAppointments,
            'salesTrend' => [
                'value' => abs($salesTrend) . '%',
                'up' => $salesTrend >= 0
            ]
        ]);
    }
}