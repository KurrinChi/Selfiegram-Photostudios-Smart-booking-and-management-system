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
        ->join('users', 'booking.userID', '=', 'users.userID')
        ->leftJoin('booking_add_ons as ba', 'booking.bookingID', '=', 'ba.bookingID')
        ->leftJoin('package_add_ons as ao', 'ba.addOnID', '=', 'ao.addOnID')
        ->leftJoin('booking_concepts as bc', 'booking.bookingID', '=', 'bc.bookingID')
        ->leftJoin('package_concept as pc', 'bc.conceptID', '=', 'pc.conceptID')
        ->select(
            'booking.bookingID as transactionID',
            'booking.customerName as customerName',
            'packages.name as package',
            'packages.price',
            'booking.bookingDate',
            'booking.date as transactionDate',
            'booking.feedback',
            'booking.rating',
            'booking.status',
            DB::raw("CONCAT(booking.bookingStartTime, ' - ', booking.bookingEndTime) as time"),
            DB::raw('booking.receivedAmount as downPayment'),
            'booking.rem as balance',
            'transaction.total as totalAmount',
            'transaction.paymentStatus',
            DB::raw("
                CASE
                    WHEN booking.status IN (3) THEN 'Cancelled'
                    WHEN transaction.paymentStatus = 1 THEN 'Completed'
                    ELSE 'Pending'
                END as paymentStatusLabel
            "),
            'users.email as customerEmail',
            'users.address as customerAddress',
            'users.contactNo as customerContactNo',
            DB::raw("COALESCE(
                GROUP_CONCAT(DISTINCT CONCAT(ao.addOn, ' x', ba.quantity, ' (₱', FORMAT(ba.quantity * ba.price, 2), ')') SEPARATOR ', '),
                ''
            ) AS selectedAddOns"),
            DB::raw("COALESCE(
                GROUP_CONCAT(DISTINCT pc.backdrop SEPARATOR ', '),
                ''
            ) AS selectedConcepts")
        )
        ->groupBy(
            'booking.bookingID',
            'booking.customerName',
            'packages.name',
            'packages.price',
            'booking.bookingDate',
            'booking.date',
            'booking.feedback',
            'booking.rating',
            'booking.status',
            'booking.bookingStartTime',
            'booking.bookingEndTime',
            'booking.receivedAmount',
            'booking.rem',
            'transaction.total',
            'transaction.paymentStatus',
            'users.email',
            'users.address',
            'users.contactNo'
        )
        ->orderByRaw('transactionID')
        ->get();

        // Debug: Log first 3 results to see add-ons and concepts
        \Log::info('🔍 SalesController - First 3 results:', [
            'results' => $results->take(3)->map(function($r) {
                return [
                    'transactionID' => $r->transactionID,
                    'selectedAddOns' => $r->selectedAddOns,
                    'selectedConcepts' => $r->selectedConcepts,
                ];
            })->toArray()
        ]);

        return response()->json($results);
    }


}

?>
