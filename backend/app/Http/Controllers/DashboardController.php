<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
       public function getSummary(Request $request)
            {
                // 1) Determine raw inputs (YYYY-MM-DD) or fall back
                if ($request->has(['startDate','endDate'])) {
                    $rawStart = $request->query('startDate');
                    $rawEnd   = $request->query('endDate');
                } else {
                // Default: last 7 days ago through today 
                    $rawEnd   = Carbon::today()->toDateString();              
                    $rawStart = Carbon::today()->subDays(7)->toDateString();   
                }


                // 2) Parse into Carbon + force start/end of day
                $start = Carbon::parse($rawStart)->startOfDay();  // 00:00:00
                $end   = Carbon::parse($rawEnd)  ->endOfDay();    // 23:59:59

                // 3) Sum current sales
                $sales = DB::table('transaction')
                    ->whereBetween('date', [
                        $start->toDateTimeString(),
                        $end->toDateTimeString(),
                    ])
                    ->sum('receivedAmount');

                // 4) Figure out how many days (inclusive)
                $daysInWindow = $end->diffInDays($start) + 1;

                // 5) Build previous window (FULL days)
                $prevEnd   = $start
                                ->copy()            // e.g. 2025-07-22 00:00:00
                                ->subDay() // → 2025-07-21 00:00:00
                                ->endOfDay();       // → 2025-07-21 23:59:59

                $prevStart = $prevEnd
                                ->copy()            // 2025‑07‑20 23:59:59
                                ->subDays($daysInWindow + 14)
                                ->startOfDay();     // → 00:00

                // 6) Sum previous sales
                $salesPrev = DB::table('transaction')
                    ->whereBetween('date', [
                        $prevStart->toDateTimeString(),
                        $prevEnd->toDateTimeString(),
                    ])
                    ->sum('receivedAmount');

                // 7) Compute trend
                if ($salesPrev > 0) {
                    $pct      = round((($sales - $salesPrev) / $salesPrev) * 100, 2);
                    $trendVal = "{$pct}%";
                    $trendUp  = $pct >= 0;
                } else {
                    $trendVal = '0%';
                    $trendUp  = true;
                }

                // 8) Return JSON (debug fields retained)
                return response()->json([
                    'totalUsers'    => DB::table('users')->where('archive', 1)->count(),
                    'totalBookings' => DB::table('booking')->count(),
                    'totalSales'    => $sales,
                    'prevSales'     => $salesPrev,
                    'totalAppointments' => DB::table('booking')->count(),
                    'start'         => $start->toDateString(),
                    'end'           => $end->toDateString(),
                    'prevStart'     => $prevStart->toDateString(),
                    'prevEnd'       => $prevEnd->toDateString(),
                    'salesTrend'    => [
                        'value' => $trendVal,
                        'up'    => $trendUp,
                    ],
                ]);
        }

            public function getWeeklyGrossIncome()
            {
                $today   = Carbon::today();
                $thisMon = $today->copy()->startOfWeek();

                $weeks = [];
                for ($i = 15; $i >= 0; $i--) {
                    $start = $thisMon->copy()->subWeeks($i)->startOfDay();
                    $end   = $start->copy()->endOfWeek();

                    $weeks[] = [
                        'week'   => $start->format('M j Y'),
                        'income' => (float) DB::table('transaction')
                            ->whereBetween('date', [
                                $start->toDateTimeString(),
                                $end  ->toDateTimeString(),
                            ])->sum('receivedAmount'),
                    ];
                }

                return response()->json($weeks);
            }
        
        public function getPackageDetails(Request $request)
        {

            // 2) Total bookings in the overall data (for booking %)
            $totalBookings = DB::table('transaction')
                ->where('transaction.paymentStatus', 1) // Only successful transactions
                ->count();

            // 3) Current data: group by packageID from transaction (overall data)
            $current = DB::table('transaction')
                ->join('booking', 'transaction.bookingId', '=', 'booking.bookingID')
                ->join('packages', 'booking.packageID', '=', 'packages.packageID')
                ->select(
                    'packages.packageID',
                    'packages.name',
                    DB::raw('COUNT(*) as totalBooking'),
                    DB::raw('COALESCE(SUM(transaction.receivedAmount), 0) as revenue'),  // Summing `DOUBLE` and using `COALESCE`
                    DB::raw('NULL as avgRating') // Temporarily set to NULL for avgRating (no rating in current schema)
                )
                ->where('transaction.paymentStatus', 1) // Only successful transactions
                ->groupBy('packages.packageID', 'packages.name')
                ->get();

            // 4) Build response rows
            $rows = [];
            foreach ($current as $pkg) {
                // Calculate trend (since there's no "previous window" anymore, we just set trend to 0 for all-time data)
                $trendPct = 0;

                // Add the row data
                $rows[] = [
                    'name' => $pkg->name,
                    'totalBooking' => (int) $pkg->totalBooking,
                    'revenue' => '₱' . number_format((float)$pkg->revenue, 2), // Ensure float and correct formatting
                    'bookingPct' => $totalBookings
                        ? round($pkg->totalBooking / $totalBookings * 100, 2) . "% of the total {$totalBookings}"
                        : "0% of the total 0",
                    'rating' => null,  // No rating in the current schema, so set to null
                    'trend' => "{$trendPct}% all-time", // Trend is always 0 for overall data
                    'trendPositive' => true, // As we have no trend calculation, we can set it to true for all-time data
                ];
            }

            // Return the response with proper JSON encoding to avoid Unicode escape issues
            return response()->json($rows, 200, [], JSON_UNESCAPED_UNICODE);
        }

}

