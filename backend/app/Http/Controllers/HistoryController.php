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
            $deleted = DB::table('booking')->where('bookingID', $id)->delete();

            if ($deleted) {
                return response()->json(['message' => 'Booking deleted successfully.']);
            } else {
                return response()->json(['message' => 'Booking not found.'], 404);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to delete booking: ' . $e->getMessage());
            return response()->json(['error' => 'Server error', 'message' => $e->getMessage()], 500);
        }
    }
    public function getTransactionDetails($bookingID)
    {
        return DB::selectOne("
            SELECT 
                booking.bookingID,
                packages.name AS packageName,
                booking.customerName,
                booking.customerEmail,
                booking.customerAddress,
                booking.customerContactNo,
                booking.bookingDate,
                booking.bookingStartTime,
                booking.bookingEndTime,
                booking.subTotal,
                booking.rem,
                booking.receivedAmount,
                booking.feedback,
                booking.rating,
                booking.status,
                booking.paymentStatus
            FROM booking
            JOIN packages ON booking.packageID = packages.packageID
            WHERE booking.bookingID = ?
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