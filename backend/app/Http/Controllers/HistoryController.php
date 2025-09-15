<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HistoryController extends Controller
{
    public function getHistory($userID)
    {
        try {
            \Log::info("Fetching booking history for user ID: " . $userID);

            $bookings = DB::select("
                SELECT booking.bookingID, 
                packages.name AS packageName, 
                booking.date AS dateTime, 
                packages.price,
                booking.rating
                FROM booking 
                JOIN packages ON booking.packageID = packages.packageID 
                WHERE booking.userID = ? AND booking.status = 1
            ", [$userID]);

            \Log::info("Booking data fetched:", ['data' => $bookings]);

            return response()->json($bookings);
        } catch (\Exception $e) {
            \Log::error('Booking history fetch failed: ' . $e->getMessage());
            return response()->json([
                'error' => 'Server Error',
                'message' => $e->getMessage()
            ], 500);
        }

    }
public function deleteBooking($id)
{
    try {
        DB::transaction(function () use ($id) {
            // Delete related add-ons
            DB::table('booking_add_ons')->where('bookingID', $id)->delete();

            // Delete related concepts
            DB::table('booking_concepts')->where('bookingID', $id)->delete();

            // Delete related transactions
            DB::table('transaction')->where('bookingID', $id)->delete();

            // Delete the main booking
            DB::table('booking')->where('bookingID', $id)->delete();
        });

        return response()->json(['message' => 'Booking and all related data deleted successfully.']);
    } catch (\Exception $e) {
        \Log::error('Failed to delete booking: ' . $e->getMessage());
        return response()->json(['error' => 'Server error', 'message' => $e->getMessage()], 500);
    }
}
    public function getTransactionDetails($bookingID)
    {
        return DB::selectOne("
           SELECT 
            b.bookingID,
            p.name AS packageName,
            b.customerName,
            b.customerEmail,
            b.customerAddress,
            b.customerContactNo,
            b.bookingDate,
            b.bookingStartTime,
            b.bookingEndTime,
            b.subTotal,
            b.total,
            b.rem,
            b.receivedAmount,
            b.feedback,
            b.rating,
            b.status,
            b.paymentStatus,
            COALESCE(
                GROUP_CONCAT(DISTINCT CONCAT(ao.addOn, ' x', ba.quantity, ' (₱', FORMAT(ba.quantity * ba.price, 2), ')') SEPARATOR ', '),
                ''
            ) AS selectedAddOns,
            COALESCE(
                GROUP_CONCAT(DISTINCT pc.backdrop SEPARATOR ', '),
                ''
            ) AS selectedConcepts
        FROM booking AS b
        JOIN packages AS p ON b.packageID = p.packageID
        LEFT JOIN booking_add_ons AS ba ON b.bookingID = ba.bookingID
        LEFT JOIN package_add_ons AS ao ON ba.addOnID = ao.addOnID
        LEFT JOIN booking_concepts AS bc ON b.bookingID = bc.bookingID
        LEFT JOIN package_concept AS pc ON bc.conceptID = pc.conceptID
        WHERE b.bookingID = ? AND b.status = 1
        GROUP BY 
            b.bookingID, p.name, b.customerName, b.customerEmail, b.customerAddress, b.customerContactNo,
            b.bookingDate, b.bookingStartTime, b.bookingEndTime, b.subTotal, b.rem, b.receivedAmount,
            b.feedback, b.rating, b.status, b.paymentStatus, b.total
        ", [$bookingID]);
    }
    public function updateFeedback(Request $request, $id)
    {
         try {
        // Validate input
        $request->validate([
            'feedback' => 'nullable|string',
            'rating' => 'nullable|integer|min:1|max:5', // assuming 0 is not allowed
        ]);

        // Safely get inputs, allowing null
        $feedback = $request->input('feedback'); // could be null or string
        $rating = $request->input('rating');     // could be null or integer

        DB::table('booking')
            ->where('bookingID', $id)
            ->update([
                'feedback' => $feedback,
                'rating' => $rating, // leave as-is; null will be accepted by DB
            ]);

        return response()->json(['message' => 'Feedback and rating updated successfully']);
    } catch (\Exception $e) {
        \Log::error('Feedback update error: ' . $e->getMessage());
        return response()->json(['error' => 'Server error'], 500);
    }
    }
}