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
        $bookingId = $request->input('id');
        $bookingDate = $request->input('bookingDate');
        $startTime = $request->input('startTime');
        $endTime = $request->input('endTime');

        $updated = DB::table('booking')
            ->where('bookingID', $bookingId)
            ->update([
                'bookingDate' => $bookingDate,
                'bookingStartTime' => $startTime,
                'bookingEndTime' => $endTime,
                'status' => 2, // Optional: reset to Pending on reschedule
            ]);

        if ($updated) {
            return response()->json(['message' => 'Appointment rescheduled successfully'], 200);
        } else {
            return response()->json(['message' => 'Failed to reschedule appointment'], 400);
        }
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
