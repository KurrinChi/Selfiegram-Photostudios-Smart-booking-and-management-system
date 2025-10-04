<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\User;
use App\Events\SystemNotificationCreated;
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

    /**
     * Delete a notification (user-owned or global) - Admin or owner only ideally.
     * Currently assumes authenticated context & simple ownership check could be added later.
     */
    public function destroy($id, Request $request)
    {
        $notification = Notification::find($id);
        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }
        // Optional ownership check could go here
        $notification->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Broadcast a System notification to all Customer users.
     * Admin-only route. Payload: title, message
     */
    public function broadcastSystem(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string'
        ]);

        $customers = User::where(function($q){
            $q->where('userType', 'Customer')->orWhere('usertype','Customer');
        })->select('userID')->get();

        if ($customers->isEmpty()) {
            return response()->json(['status' => 'no_customers', 'count' => 0]);
        }

        $now = now();
        $title = $request->input('title');
        $message = $request->input('message');

        $created = [];
        foreach ($customers as $cust) {
            $n = Notification::create([
                'userID' => $cust->userID,
                'title' => $title,
                'label' => 'System',
                'message' => $message,
                'time' => $now,
                'starred' => 0,
                'bookingID' => null,
                'transID' => null,
            ]);
            $payload = [
                'notificationID' => $n->notificationID,
                'title' => $n->title,
                'label' => $n->label,
                'message' => $n->message,
                'time' => $n->time,
                'starred' => $n->starred,
            ];
            event(new SystemNotificationCreated($cust->userID, $payload));
            $created[] = $n->notificationID;
        }

        return response()->json([
            'status' => 'success',
            'count' => count($created),
            'notification_ids' => $created,
        ], 201);
    }
}
