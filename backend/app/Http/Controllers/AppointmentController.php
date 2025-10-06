<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    public function getAppointmentsByUser($userId)
    {
        $appointments = DB::table('booking')
            ->join('packages', 'booking.packageID', '=', 'packages.packageID')
            ->leftJoin('transaction', 'transaction.bookingId', '=', 'booking.bookingID')
            ->select(
                'booking.customerName',
                'booking.bookingID as id',
                'packages.name as package',
                'packages.price',
                'booking.bookingDate',
                'transaction.date as transactionDate',
                'booking.status',
                'booking.receivedAmount as payment',
                'booking.rem as balance',
                'booking.total as subtotal',
                'booking.feedback',
                'booking.rating',
                DB::raw("CONCAT(booking.bookingStartTime, ' - ', booking.bookingEndTime) as time"),
                DB::raw("IF(booking.status = 1, 'Done', IF(booking.status = 2, 'Pending', 'Cancelled')) as status")
            )
            ->where('booking.userID', $userId)
            ->get();

        return response()->json($appointments);
    }

    public function getAllAppointments()
    {
        $appointments = DB::table('booking')
            ->join('packages', 'booking.packageID', '=', 'packages.packageID')
            ->join('users', 'booking.userID', '=', 'users.userID')
            ->leftJoin('transaction', 'transaction.bookingId', '=', 'booking.bookingID')
            ->leftJoin('booking_add_ons as ba', 'booking.bookingID', '=', 'ba.bookingID')
            ->leftJoin('package_add_ons as ao', 'ba.addOnID', '=', 'ao.addOnID')
            ->leftJoin('booking_concepts as bc', 'booking.bookingID', '=', 'bc.bookingID')
            ->leftJoin('package_concept as pc', 'bc.conceptID', '=', 'pc.conceptID')
            ->select(
                'booking.bookingID as id',
                'booking.customerName',
                'users.email',
                'users.address',
                'users.contactNo',
                'packages.name as package',
                'packages.price',
                'packages.duration',
                'booking.bookingDate',
                'transaction.date as transactionDate',
                'booking.status',
                'booking.paymentStatus',
                'booking.receivedAmount as payment',
                'booking.rem as balance',
                'booking.total as subtotal',
                'booking.bookingStartTime',
                'booking.bookingEndTime',
                'booking.feedback',
                'booking.rating',
                DB::raw("CONCAT(booking.bookingStartTime, ' - ', booking.bookingEndTime) as time"),
                DB::raw("IF(booking.status = 1, 'Done', IF(booking.status = 2, 'Pending', 'Cancelled')) as statusLabel"),
                DB::raw("COALESCE(
                    GROUP_CONCAT(DISTINCT CONCAT(ao.addOn, ' x', ba.quantity, ' (₱', FORMAT(ba.quantity * ba.price, 2), ')') SEPARATOR ', '),
                    ''
                ) AS selectedAddOns"),
                DB::raw("COALESCE(
                    GROUP_CONCAT(DISTINCT pc.backdrop SEPARATOR ', '),
                    ''
                ) AS selectedConcepts")
            )
            ->where('booking.status', '<>', 0)
            ->groupBy(
                'booking.bookingID',
                'booking.customerName',
                'users.email',
                'users.address',
                'users.contactNo',
                'packages.name',
                'packages.price',
                'packages.duration',
                'booking.bookingDate',
                'transaction.date',
                'booking.status',
                'booking.paymentStatus',
                'booking.receivedAmount',
                'booking.rem',
                'booking.total',
                'booking.bookingStartTime',
                'booking.bookingEndTime',
                'booking.feedback',
                'booking.rating'
            )
            ->get();

        return response()->json($appointments);
    }

    public function rescheduleAppointment(Request $request)
    {
        // --- Simplified implementation ---
        $bookingId   = $request->input('id');
        $bookingDate = $request->input('bookingDate');
        $startInput  = $request->input('startTime');
        $previousTimeRange = $request->input('previousTimeRange'); // e.g. "1:00 PM - 1:15 PM"
        $previousStart     = $request->input('previousStartTime');
        $previousEnd       = $request->input('previousEndTime');
        $explicitMinutes   = $request->input('originalDurationMinutes') ?? $request->input('desiredDurationMinutes') ?? $request->input('intendedDurationMinutes');
        $directDuration    = $request->input('durationMinutes'); // new explicit override
        $returnDebug       = filter_var($request->input('debugDuration'), FILTER_VALIDATE_BOOL);
        $reasons = [];

        if (!$bookingId || !$bookingDate || !$startInput) {
            return response()->json(['message' => 'Missing required fields (id, bookingDate, startTime)'], 422);
        }

        $booking = DB::table('booking')->where('bookingID', $bookingId)->first();
        if (!$booking) return response()->json(['message' => 'Booking not found'], 404);
        $package = DB::table('packages')->where('packageID', $booking->packageID)->first();

        $parsedStart = $this->normalizeAndParseTime($startInput);
        if (!$parsedStart) return response()->json(['message' => 'Invalid start time format'], 422);

        // Helper closure to compute duration (seconds) from 2 labels
        $compute = function($a,$b) use (&$reasons){
            if(!$a || !$b){ $reasons[] = 'compute: missing one endpoint'; return 0; }
            $pa = $this->normalizeAndParseTime($a); $pb = $this->normalizeAndParseTime($b);
            if (!$pa || !$pb) { $reasons[] = 'compute: parse failed '.$a.' '.$b; return 0; }
            $sa=strtotime($pa); $sb=strtotime($pb);
            if ($sa===false||$sb===false){ $reasons[]='compute: strtotime false'; return 0; }
            if ($sb<=$sa){ $reasons[]='compute: non-positive interval'; return 0; }
            return $sb-$sa;
        };

        $durationSeconds = 0; $durationSource = null;

        // Priority 0: directDuration override (highest authority)
        if (is_numeric($directDuration)) {
            $dd = (int)$directDuration;
            if ($dd>0 && $dd<=8*60) {
                $durationSeconds = $dd*60; $durationSource='durationMinutes_param';
                $reasons[]='Used durationMinutes direct override';
            } else {
                $reasons[]='durationMinutes invalid range';
            }
        }

        // Priority 1: previousTimeRange
        if (!$durationSeconds && $previousTimeRange && is_string($previousTimeRange)) {
            $norm = trim(str_replace(["–","—","−"],'-',$previousTimeRange));
            // Collapse multiple spaces
            $norm = preg_replace('/\s+/', ' ', $norm);
            // Ensure spaces around dash for consistent split
            $norm = preg_replace('/\s?-\s?/', ' - ', $norm);
            $parts = explode(' - ', $norm);
            if (count($parts)===2) {
                $tmp = $compute($parts[0], $parts[1]);
                if ($tmp>0) { $durationSeconds=$tmp; $durationSource='previousTimeRange'; $reasons[]='Derived from previousTimeRange'; }
                else $reasons[]='previousTimeRange produced non-positive';
            } else {
                $reasons[]='previousTimeRange split parts != 2 (norm: '.$norm.')';
            }
        }
        // Priority 2: previousStartTime + previousEndTime
        if (!$durationSeconds && ($previousStart||$previousEnd)) {
            $tmp = $compute($previousStart,$previousEnd);
            if ($tmp>0) { $durationSeconds=$tmp; $durationSource='previousStartEnd'; $reasons[]='Derived from previousStart/End'; }
            else $reasons[]='previousStart/End failed to derive duration';
        }
        // Priority 3: explicit minutes field provided
        if (!$durationSeconds && is_numeric($explicitMinutes)) {
            $m = (int)$explicitMinutes; if ($m>0 && $m<=8*60) { $durationSeconds = $m*60; $durationSource='explicitMinutes'; }
            else $reasons[]='explicitMinutes invalid';
        }
        // Priority 4: stored booking duration
        if (!$durationSeconds && $booking->bookingStartTime && $booking->bookingEndTime) {
            $s = strtotime($booking->bookingStartTime); $e=strtotime($booking->bookingEndTime);
            if ($s!==false && $e!==false && $e>$s) { $durationSeconds=$e-$s; $durationSource='storedBooking'; $reasons[]='Used stored booking duration'; }
            else $reasons[]='stored booking duration invalid';
        }
        // Priority 5: package duration
        if (!$durationSeconds) {
            $pm = $this->parseDurationToMinutes($package->duration ?? '') ?: 60; // fallback 60
            $durationSeconds = $pm*60; $durationSource='packageFallback'; $reasons[]='Fallback to package duration';
        }
        // Safety minimum 5 min
        if ($durationSeconds < 300) { $durationSeconds = 300; $reasons[]='Raised to 5min minimum'; if(!$durationSource) $durationSource='minFallback'; }

        $parsedEnd = date('H:i:s', strtotime($parsedStart) + $durationSeconds);

        // Basic overlap check
        $overlap = DB::table('booking')
            ->where('bookingDate', $bookingDate)
            ->where('bookingID','<>',$bookingId)
            ->where(function($q) use ($parsedStart,$parsedEnd){
                $q->whereBetween('bookingStartTime',[$parsedStart,$parsedEnd])
                  ->orWhereBetween('bookingEndTime',[$parsedStart,$parsedEnd])
                  ->orWhere(function($q2) use ($parsedStart,$parsedEnd){
                      $q2->where('bookingStartTime','<=',$parsedStart)
                          ->where('bookingEndTime','>=',$parsedEnd);
                  });
            })
            ->exists();
    if ($overlap) return response()->json(['message'=>'Selected time range overlaps with another booking'],409);

        $updated = DB::table('booking')
            ->where('bookingID',$bookingId)
            ->update([
                'bookingDate' => $bookingDate,
                'bookingStartTime' => $parsedStart,
                'bookingEndTime' => $parsedEnd,
                'status' => 2,
            ]);

        $resp = [
            'message' => $updated ? 'Rescheduled with preserved duration' : 'No change (values identical) - duration applied',
            'data' => [
                'id' => $bookingId,
                'bookingDate' => $bookingDate,
                'startTime' => $parsedStart,
                'endTime' => $parsedEnd,
                'durationMinutes' => round($durationSeconds/60,2),
                'durationSource' => $durationSource,
            ]
        ];
        if ($returnDebug) { $resp['data']['reasons'] = $reasons; }
        return response()->json($resp, 200);
    }


    public function cancelAppointment(Request $request)
    {
        $bookingId = $request->input('id'); // Expecting the booking ID

        $updated = DB::table('booking')
            ->where('bookingID', $bookingId)
            ->update(['status' => 3]);

        if ($updated) {
            return response()->json(['message' => 'Appointment cancelled successfully'], 200);
        } else {
            return response()->json(['message' => 'Failed to cancel appointment'], 400);
        }
    }

    public function markAsCompleted(Request $request)
    {
        $bookingId = $request->input('id'); // Expecting the booking ID

        $updated = DB::table('booking')
            ->where('bookingID', $bookingId)
            ->update(['status' => 1]);

        if ($updated) {
            return response()->json(['message' => 'Appointment marked as done'], 200);
        } else {
            return response()->json(['message' => 'Failed to mark appointment as done'], 400);
        }
    }
   public function getAppointments($userID)
{
    if (!$userID) {
        return response()->json(['error' => 'User ID is required'], 400);
    }

    $appointments = DB::select("
        SELECT 
            b.bookingID AS id,
            b.customerName,
            b.customerEmail AS email,
            b.customerContactNo AS contact,
            b.customerAddress AS address,
            b.bookingDate,
            b.bookingStartTime,
            b.bookingEndTime,
            p.packageID,
            p.name AS packageName,
            p.description AS packageDescription,
            p.price AS basePrice,
            COALESCE(
                GROUP_CONCAT(DISTINCT CONCAT(ao.addOn, ' x', ba.quantity, ' (₱', FORMAT(ba.quantity * ba.price, 2), ')') SEPARATOR ', '),
                ''
            ) AS selectedAddOns,
            COALESCE(
                GROUP_CONCAT(DISTINCT pc.backdrop SEPARATOR ', '),
                ''
            ) AS selectedConcepts,
            b.subTotal,
            b.total,
            b.rem,
            b.receivedAmount, 
            b.status,
            b.paymentStatus,
            b.feedback,
            b.rating,
            t.date AS transactionDate,
            (
                SELECT pi.imagePath
                FROM package_images pi
                WHERE pi.packageID = p.packageID
                LIMIT 1
            ) AS imagePath
        FROM booking AS b
        JOIN packages AS p ON b.packageID = p.packageID
        LEFT JOIN booking_add_ons AS ba ON b.bookingID = ba.bookingID
        LEFT JOIN package_add_ons AS ao ON ba.addOnID = ao.addOnID
        LEFT JOIN booking_concepts AS bc ON b.bookingID = bc.bookingID
        LEFT JOIN package_concept AS pc ON bc.conceptID = pc.conceptID
        LEFT JOIN transaction AS t ON b.bookingID = t.bookingID
        WHERE b.userID = ?
        AND b.status IN (2, 3, 4)
        GROUP BY 
            b.bookingID, b.customerName, b.customerEmail, b.customerContactNo, b.customerAddress, 
            b.bookingDate, b.bookingStartTime, b.bookingEndTime, 
            p.packageID, p.name, p.description, p.price, 
            b.subTotal, b.total, b.rem, b.receivedAmount, b.status, b.paymentStatus, b.feedback, b.rating, t.date;
    ", [$userID]);

    return response()->json($appointments);
}

    /* -----------------------------------------
       Helper: parse flexible 12h/24h time labels
       ----------------------------------------- */
    private function normalizeAndParseTime(?string $label): ?string
    {
        if (!$label) return null;
        $label = trim($label);

        // If already looks like 24h HH:MM(:SS)
        if (preg_match('/^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/', $label)) {
            // Ensure HH:MM:SS
            if (strlen($label) === 5) $label .= ':00';
            return $label;
        }

        $normalized = strtoupper(preg_replace('/\s+/', ' ', $label));
        $formats = ['h:i A','g:i A','h:iA','g:iA'];
        foreach ($formats as $fmt) {
            $dt = \DateTime::createFromFormat($fmt, $normalized);
            if ($dt instanceof \DateTime) {
                return $dt->format('H:i:s');
            }
        }
        // Loose parse like "2 PM" or "2:5 PM"
        if (preg_match('/^(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)$/i', $normalized, $m)) {
            $h = (int)$m[1]; $min = isset($m[2]) ? (int)$m[2] : 0; $ampm = strtoupper($m[3]);
            if ($h>=1 && $h<=12 && $min>=0 && $min<=59) {
                if ($ampm==='PM' && $h!==12) $h += 12; if ($ampm==='AM' && $h===12) $h = 0;
                return sprintf('%02d:%02d:00',$h,$min);
            }
        }
        return null;
    }

    private function parseDurationToMinutes(?string $raw): int
    {
        if (!$raw) return 0;
        $s = strtolower(trim($raw));
        if (preg_match('/^\d+$/', $s)) return (int)$s; // pure minutes
        $total = 0;
        if (preg_match('/(\d+)\s*(hour|hr|hrs|h)/', $s, $m)) { $total += ((int)$m[1])*60; }
        if (preg_match('/(\d+)\s*(minute|min|mins|m)/', $s, $m2)) { $total += (int)$m2[1]; }
        if ($total === 0) {
            // Fallback: capture first two numbers
            if (preg_match_all('/(\d+)/', $s, $nums) && isset($nums[1])) {
                $ints = $nums[1];
                if (str_contains($s,'hour') || str_contains($s,'hr') || str_contains($s,'h')) {
                    $total += ((int)$ints[0]) * 60;
                    if (isset($ints[1])) $total += (int)$ints[1];
                } else {
                    $total = (int)$ints[0];
                }
            }
        }
        return $total;
    }


    /**
     * Get unavailable dates for booking
     * Returns dates that are fully booked or marked as unavailable
     */
    public function getUnavailableDates()
    {
        try {
            // Get dates that are fully booked (assuming max 5 bookings per day)
            $fullyBookedDates = DB::table('booking')
                ->select('bookingDate')
                ->where('status', '!=', 0) // Exclude cancelled bookings
                ->groupBy('bookingDate')
                ->havingRaw('COUNT(*) >= 5') // Adjust this number based on your capacity
                ->pluck('bookingDate')
                ->toArray();

            // Get all existing booking dates (since you want ALL booking dates to be unavailable)
            $existingBookingDates = DB::table('booking')
                ->select('bookingDate')
                ->where('status', '!=', 0) // Exclude cancelled bookings (status = 0)
                ->distinct()
                ->pluck('bookingDate')
                ->toArray();

            // Get dates where there are pending reschedule requests
            $pendingRescheduleDates = DB::table('booking_request')
                ->select('requestedDate as bookingDate')
                ->where('status', 'pending')
                ->where('requestType', 'reschedule')
                ->whereNotNull('requestedDate')
                ->pluck('bookingDate')
                ->toArray();

            // Get manually blocked dates (you can create a separate table for this)
            // For now, we'll use a simple array or you can add a 'blocked_dates' table
            $blockedDates = [
                // Add any manually blocked dates here
                // '2025-12-25', // Christmas
                // '2025-01-01', // New Year
            ];

            // Combine all unavailable dates
            $unavailableDates = array_unique(array_merge(
                $existingBookingDates, // All existing booking dates
                $pendingRescheduleDates,
                $blockedDates
            ));

            // Remove any null or empty values and convert dates to string format
            $unavailableDates = array_filter($unavailableDates, function($date) {
                return !empty($date);
            });

            // Convert to proper date format if needed
            $unavailableDates = array_map(function($date) {
                return is_string($date) ? $date : $date->format('Y-m-d');
            }, $unavailableDates);

            return response()->json([
                'success' => true,
                'dates' => array_values($unavailableDates), // Re-index array
                'message' => 'Unavailable dates retrieved successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving unavailable dates: ' . $e->getMessage(),
                'dates' => []
            ], 500);
        }
    }


}
