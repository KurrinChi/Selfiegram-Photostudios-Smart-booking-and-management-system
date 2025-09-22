<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
     public function getUserNotifications($userID)
    {
        $notifications = Notification::where(function ($query) use ($userID) {
                $query->where('userID', $userID)
                      ->orWhereNull('userID')
                      ->orWhere('userID', 0); // global notifications
            })
            ->orderBy('time', 'desc')
            ->get();

        return response()->json($notifications);
    }


    public function getBookingDetails(Request $request)
    {
        $bookingID = $request->query('bookingID'); // Get bookingID from query parameters

        if (!$bookingID) {
            return response()->json(['error' => 'Booking ID is required'], 400);
        }

        $bookingDetails = DB::table('booking')
            ->join('packages', 'booking.packageID', '=', 'packages.packageID')
            ->leftJoin('transaction', 'transaction.bookingID', '=', 'booking.bookingID')
            ->select(
                'booking.bookingID as id',
                'booking.customerName',
                'booking.customerEmail as email',
                'booking.customerContactNo as contact',
                'booking.customerAddress as address',
                'booking.bookingDate',
                'booking.bookingStartTime',
                'booking.bookingEndTime',
                'packages.name as packageName',
                'packages.description as packageDescription',
                'packages.price as basePrice',
                'booking.subTotal',
                'booking.total',
                'booking.rem as balance',
                'booking.receivedAmount as payment',
                'booking.status',
                'booking.paymentStatus',
                'booking.feedback',
                'booking.rating',
                'transaction.date as transactionDate'
            )
            ->where('booking.bookingID', $bookingID)
            ->first();

        if (!$bookingDetails) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        return response()->json($bookingDetails);
    }
     public function getRescheduleDetails(Request $request)
    {
        $bookingID = $request->query('bookingID');

        if (!$bookingID) {
            return response()->json(['error' => 'Booking ID is required'], 400);
        }

        $rescheduleDetails = DB::table('booking_request')
            ->where('bookingID', $bookingID)
            ->where('requestType', 'reschedule')
            ->where('status', 'approved')
            ->select(
                'requestID',
                'bookingID',
                'userID',
                'requestedDate',
                'requestedStartTime',
                'requestedEndTime',
                'reason',
                'status',
                'requestDate'
            )
            ->first();

        if (!$rescheduleDetails) {
            return response()->json(['error' => 'Reschedule request not found'], 404);
        }

        return response()->json($rescheduleDetails);
    }
    public function markAsRead($id)
        {
            $notification = Notification::findOrFail($id);
            $notification->starred = 1;
            $notification->save();

            return response()->json(['success' => true]);
        }
}
