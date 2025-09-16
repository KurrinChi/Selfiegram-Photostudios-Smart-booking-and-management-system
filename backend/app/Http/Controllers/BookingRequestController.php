<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BookingRequest;
use Illuminate\Support\Facades\DB;
class BookingRequestController extends Controller
{
    public function storeCancelRequest(Request $request)
        {
            // Validate input
            $validated = $request->validate([
                'bookingID' => 'required|integer',
                'userID' => 'required|integer',
                'reason' => 'required|string|max:1000',
            ]);

            // Wrap in transaction to keep both queries consistent
            DB::beginTransaction();

            try {
                // Insert into booking_request
                $cancelRequest = BookingRequest::create([
                    'bookingID'   => $validated['bookingID'],
                    'userID'      => $validated['userID'],
                    'requestType' => 'cancel',
                    'reason'      => $validated['reason'],
                    'status'      => 'pending',
                    'requestDate' => now(),
                ]);

                // Update booking status = 3 (cancelled)
                DB::table('booking')
                    ->where('bookingID', $validated['bookingID'])
                    ->update(['status' => 3]);

                DB::commit();

                return response()->json([
                    'message' => 'Cancel request submitted and booking updated successfully.',
                    'data'    => $cancelRequest
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();

                return response()->json([
                    'message' => 'Error submitting cancel request.',
                    'error'   => $e->getMessage()
                ], 500);
            }
        }
        public function getCancelRequest($bookingID)
    {
        try {
            // Get the latest cancel request for the booking
            $cancelRequest = BookingRequest::where('bookingID', $bookingID)
                ->where('requestType', 'cancel')
                ->latest('requestDate')
                ->first();

            if (!$cancelRequest) {
                return response()->json([
                    'message' => 'No cancel request found for this booking.',
                    'data'    => null
                ], 404);
            }

            return response()->json([
                'message' => 'Cancel request fetched successfully.',
                'data'    => [
                    'status'      => $cancelRequest->status,
                    'requestDate' => $cancelRequest->requestDate,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching cancel request.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

}
