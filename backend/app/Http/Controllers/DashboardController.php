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
                $hasDateRange = $request->has(['startDate','endDate']);
                
                // 1) Determine raw inputs (YYYY-MM-DD) or fall back
                if ($hasDateRange) {
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

                // 3) Sum current sales for selected date range
                // Use date comparison since transaction.date is stored as DATE not DATETIME
                $sales = DB::table('transaction')
                    ->whereBetween('date', [
                        $start->toDateString(),
                        $end->toDateString(),
                    ])
                    ->sum('receivedAmount');

                // 4) Calculate trend only when NO date range is selected (default behavior)
                $salesTrend = ['value' => '0%', 'up' => true];
                
                if (!$hasDateRange) {
                    // Get current week (Monday to Sunday)
                    $currentWeekStart = Carbon::now()->startOfWeek()->startOfDay();
                    $currentWeekEnd = Carbon::now()->endOfWeek()->endOfDay();
                    
                    // Get last week (Monday to Sunday)
                    $lastWeekStart = $currentWeekStart->copy()->subWeek()->startOfDay();
                    $lastWeekEnd = $currentWeekStart->copy()->subDay()->endOfDay();
                    
                    // Current week sales
                    $currentWeekSales = DB::table('transaction')
                        ->whereBetween('date', [
                            $currentWeekStart->toDateString(),
                            $currentWeekEnd->toDateString(),
                        ])
                        ->sum('receivedAmount');
                    
                    // Last week sales
                    $lastWeekSales = DB::table('transaction')
                        ->whereBetween('date', [
                            $lastWeekStart->toDateString(),
                            $lastWeekEnd->toDateString(),
                        ])
                        ->sum('receivedAmount');
                    
                    // Calculate trend percentage
                    if ($lastWeekSales > 0) {
                        $pct = round((($currentWeekSales - $lastWeekSales) / $lastWeekSales) * 100, 2);
                        $salesTrend = [
                            'value' => abs($pct) . '%',
                            'up' => $pct >= 0,
                        ];
                    }
                }

                // Total Users (active users)
                $totalUsers = DB::table('users')->where('archive', 1)->count();
                
                // Total Appointments (all bookings)
                $totalAppointments = DB::table('booking')->count();
                
                // Total Schedule (bookings from today onwards only)
                $totalSchedule = DB::table('booking')
                    ->where('bookingDate', '>=', Carbon::today()->toDateString())
                    ->count();

                // Calculate trends for users, schedule, and appointments (only when no date range selected)
                $userTrend = ['value' => '0%', 'up' => true];
                $scheduleTrend = ['value' => '0%', 'up' => true];
                $appointmentsTrend = ['value' => '0%', 'up' => true];

                if (!$hasDateRange) {
                    // User Trend: Compare this week vs last week registrations using created_at
                    $currentWeekStart = Carbon::now()->startOfWeek()->startOfDay();
                    $currentWeekEnd = Carbon::now()->endOfWeek()->endOfDay();
                    $lastWeekStart = $currentWeekStart->copy()->subWeek()->startOfDay();
                    $lastWeekEnd = $currentWeekStart->copy()->subDay()->endOfDay();

                    // Current week user registrations
                    $currentWeekUsers = DB::table('users')
                        ->where('archive', 1)
                        ->whereBetween('created_at', [
                            $currentWeekStart->toDateTimeString(),
                            $currentWeekEnd->toDateTimeString()
                        ])
                        ->count();
                    
                    // Last week user registrations  
                    $lastWeekUsers = DB::table('users')
                        ->where('archive', 1)
                        ->whereBetween('created_at', [
                            $lastWeekStart->toDateTimeString(),
                            $lastWeekEnd->toDateTimeString()
                        ])
                        ->count();

                    // Calculate user trend percentage
                    if ($lastWeekUsers > 0) {
                        $userPct = round((($currentWeekUsers - $lastWeekUsers) / $lastWeekUsers) * 100, 2);
                        $userTrend = [
                            'value' => abs($userPct) . '%',
                            'up' => $userPct >= 0,
                        ];
                    } elseif ($currentWeekUsers > 0) {
                        // If no users last week but some this week, it's 100% increase
                        $userTrend = [
                            'value' => '100%',
                            'up' => true,
                        ];
                    }

                    // Schedule Trend: Compare this week vs last week future bookings made
                    $currentWeekSchedule = DB::table('booking')
                        ->where('bookingDate', '>=', Carbon::today()->toDateString())
                        ->whereBetween('date', [
                            $currentWeekStart->toDateString(),
                            $currentWeekEnd->toDateString()
                        ])
                        ->count();

                    $lastWeekSchedule = DB::table('booking')
                        ->where('bookingDate', '>=', $lastWeekStart->toDateString())
                        ->whereBetween('date', [
                            $lastWeekStart->toDateString(),
                            $lastWeekEnd->toDateString()
                        ])
                        ->count();

                    // Calculate schedule trend percentage
                    if ($lastWeekSchedule > 0) {
                        $schedulePct = round((($currentWeekSchedule - $lastWeekSchedule) / $lastWeekSchedule) * 100, 2);
                        $scheduleTrend = [
                            'value' => abs($schedulePct) . '%',
                            'up' => $schedulePct >= 0,
                        ];
                    } elseif ($currentWeekSchedule > 0) {
                        // If no schedule last week but some this week, it's 100% increase
                        $scheduleTrend = [
                            'value' => '100%',
                            'up' => true,
                        ];
                    }

                    // Appointments Trend: Compare this week vs last week total bookings created
                    $currentWeekAppointments = DB::table('booking')
                        ->whereBetween('date', [
                            $currentWeekStart->toDateString(),
                            Carbon::now()->endOfWeek()->toDateString()
                        ])
                        ->count();

                    $lastWeekAppointments = DB::table('booking')
                        ->whereBetween('date', [
                            $lastWeekStart->toDateString(),
                            $lastWeekEnd->toDateString()
                        ])
                        ->count();

                    // Calculate appointments trend percentage
                    if ($lastWeekAppointments > 0) {
                        $appointmentsPct = round((($currentWeekAppointments - $lastWeekAppointments) / $lastWeekAppointments) * 100, 2);
                        $appointmentsTrend = [
                            'value' => abs($appointmentsPct) . '%',
                            'up' => $appointmentsPct >= 0,
                        ];
                    } elseif ($currentWeekAppointments > 0) {
                        // If no appointments last week but some this week, it's 100% increase
                        $appointmentsTrend = [
                            'value' => '100%',
                            'up' => true,
                        ];
                    }
                }

                // Return JSON
                return response()->json([
                    'totalUsers'        => $totalUsers,
                    'totalBookings'     => $totalSchedule, // This is used for "Total Schedule" in frontend
                    'totalSales'        => (float) $sales, // Ensure it's a float
                    'totalAppointments' => $totalAppointments,
                    'hasDateRange'      => $hasDateRange,
                    'start'            => $start->toDateString(),
                    'end'              => $end->toDateString(),
                    'salesTrend'       => $salesTrend,
                    'userTrend'        => $userTrend,
                    'scheduleTrend'    => $scheduleTrend,  
                    'appointmentsTrend' => $appointmentsTrend,
                    // Debug info (can be removed later)
                    'debug' => [
                        'dateRangeQuery' => "SELECT SUM(receivedAmount) FROM transaction WHERE date BETWEEN '{$start->toDateString()}' AND '{$end->toDateString()}'",
                        'hasDateRangeFlag' => $hasDateRange,
                        'rawStart' => $hasDateRange ? $rawStart : 'not provided',
                        'rawEnd' => $hasDateRange ? $rawEnd : 'not provided',
                        'currentWeekStart' => !$hasDateRange ? Carbon::now()->startOfWeek()->toDateTimeString() : null,
                        'currentWeekEnd' => !$hasDateRange ? Carbon::now()->endOfWeek()->toDateTimeString() : null,
                        'lastWeekStart' => !$hasDateRange ? Carbon::now()->startOfWeek()->subWeek()->toDateTimeString() : null,
                        'lastWeekEnd' => !$hasDateRange ? Carbon::now()->startOfWeek()->subDay()->toDateTimeString() : null,
                    ]
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
                                $start->toDateString(),
                                $end->toDateString(),
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

        public function getReportData(Request $request)
        {
            try {
                $hasDateRange = $request->has(['startDate','endDate']);
                
                // 1) Determine raw inputs (YYYY-MM-DD) or fall back
                if ($hasDateRange) {
                    $rawStart = $request->query('startDate');
                    $rawEnd   = $request->query('endDate');
                } else {
                    // Default: last 7 days ago through today 
                    $rawEnd   = Carbon::today()->toDateString();              
                    $rawStart = Carbon::today()->subDays(7)->toDateString();   
                }

                // 2) Parse into Carbon + force start/end of day
                $start = Carbon::parse($rawStart)->startOfDay();
                $end   = Carbon::parse($rawEnd)->endOfDay();

                // Get all the summary data (reuse existing logic)
                $summaryResponse = $this->getSummary($request);
                $summaryData = $summaryResponse->getData(true);
                
                if (!$summaryData) {
                    throw new \Exception('Failed to retrieve summary data');
                }

                // Get weekly income data
                $weeklyResponse = $this->getWeeklyGrossIncome();
                $weeklyData = $weeklyResponse->getData(true);
                
                if (!$weeklyData) {
                    $weeklyData = []; // Default empty array
                }

                // Get package details
                $packageResponse = $this->getPackageDetails($request);
                $packageData = $packageResponse->getData(true);
                
                if (!$packageData) {
                    $packageData = []; // Default empty array
                }

            // Additional report metadata
            $reportData = [
                'reportGenerated' => Carbon::now()->toDateTimeString(),
                'dateRange' => [
                    'start' => $start->toDateString(),
                    'end' => $end->toDateString(),
                    'hasCustomRange' => $hasDateRange,
                    'formattedRange' => $start->format('M j, Y') . ' - ' . $end->format('M j, Y')
                ],
                'summary' => $summaryData,
                'weeklyIncome' => $weeklyData,
                'packages' => $packageData,
                'companyInfo' => [
                    'name' => 'Selfiegram Photo Studios',
                    'address' => 'Your Studio Address',
                    'phone' => 'Your Phone Number',
                    'email' => 'info@selfiegram.com'
                ]
            ];

                return response()->json($reportData, 200, [], JSON_UNESCAPED_UNICODE);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => 'Failed to generate report data',
                    'message' => $e->getMessage(),
                    'debug' => [
                        'file' => $e->getFile(),
                        'line' => $e->getLine()
                    ]
                ], 500);
            }
        }

}

