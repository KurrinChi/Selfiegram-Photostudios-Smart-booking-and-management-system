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
            ->select(
                'booking.bookingID as id',
                'booking.customerName',
                'users.email',
                'users.address',
                'users.contactNo',
                'packages.name as package',
                'packages.price',
                'booking.bookingDate',
                'transaction.date as transactionDate',
                'booking.status',
                'booking.receivedAmount as payment',
                'booking.rem as balance',
                'booking.total as subtotal',
                'booking.bookingStartTime',
                'booking.bookingEndTime',
                'booking.feedback',
                'booking.rating',
                DB::raw("CONCAT(booking.bookingStartTime, ' - ', booking.bookingEndTime) as time"),
                DB::raw("IF(booking.status = 1, 'Done', IF(booking.status = 2, 'Pending', 'Cancelled')) as status")
            )
            ->where('booking.status', '<>', 0)
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
            ->update(['status' => 0]);

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


}
