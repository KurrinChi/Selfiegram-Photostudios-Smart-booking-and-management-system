<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesController extends Controller
{
    public function getSales()
    {
        $results = DB::table('transaction')
        ->join('booking', 'transaction.bookingId', '=', 'booking.bookingID')
        ->join('packages', 'booking.packageID', '=', 'packages.packageID')
        ->join('users', 'booking.userID', '=', 'users.userID') // Join users table to get customer details
        ->select(
            'booking.bookingID as transactionID',
            'booking.customerName as customerName',
            'packages.name as package',
            'packages.price',
            'booking.bookingDate',
            'booking.date as transactionDate',
            'booking.feedback',
            'booking.rating',
            DB::raw("CONCAT(booking.bookingStartTime, ' - ', booking.bookingEndTime) as time"),
            DB::raw('booking.receivedAmount as downPayment'),
            'booking.rem as balance',
            'transaction.total as totalAmount',
            DB::raw("
                CASE
                    WHEN booking.status = 0 THEN 'Cancelled'
                    WHEN transaction.paymentStatus = 1 THEN 'Completed'
                    ELSE 'Pending'
                END as paymentStatus
            "),
            'users.email as customerEmail',
            'users.address as customerAddress',
            'users.contactNo as customerContactNo'
        )
        ->orderByRaw('transactionID')
        ->get();

        return response()->json($results);
    }


}

?>
