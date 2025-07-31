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

}
