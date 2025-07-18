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
                'booking.bookingDate',
                'transaction.date as transactionDate',
                'booking.status',
                'booking.receivedAmount as payment',
                'booking.rem as balance',
                'booking.total as subtotal',
                DB::raw("CONCAT(booking.bookingStartTime, ' - ', booking.bookingEndTime) as time"),
                DB::raw("IF(booking.status = 1, 'Done', IF(booking.status = 2, 'Pending', 'Cancelled')) as status")
            )
            ->where('booking.userID', $userId)
            ->get();

        return response()->json($appointments);
    }
}
