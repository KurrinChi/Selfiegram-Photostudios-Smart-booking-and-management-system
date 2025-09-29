<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BookingRequest;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Booking;
use App\Models\Packages;

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

    public function createRescheduleRequest(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'bookingID' => 'required|integer|exists:booking,bookingID',
            'userID' => 'required|integer|exists:users,userID',
            'requestedDate' => 'required|date',
            'requestedStartTime' => 'required|date_format:H:i',
            'reason' => 'nullable|string|max:1000',
        ]);

        // Wrap in transaction to ensure both queries succeed
        DB::beginTransaction();

        try {
            // Insert into booking_request
            $rescheduleRequest = BookingRequest::create([
                'bookingID' => $validated['bookingID'],
                'userID' => $validated['userID'],
                'requestType' => 'reschedule',
                'requestedDate' => $validated['requestedDate'],
                'requestedStartTime' => $validated['requestedStartTime'],
                'requestedEndTime' => date("H:i:s", strtotime($validated['requestedStartTime'] . " +30 minutes")),
                'reason' => $validated['reason'],
                'status' => 'pending',
                'requestDate' => now(),
            ]);

            // Update booking status = 4 (rescheduled)
            DB::table('booking')
                ->where('bookingID', $validated['bookingID'])
                ->update(['status' => 4]);

            DB::commit();

            return response()->json([
                'message' => 'Reschedule request submitted and booking updated successfully.',
                'data' => $rescheduleRequest,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Error submitting reschedule request.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function markBookingAsRescheduled($bookingID)
    {
        $updated = DB::table('booking')
            ->where('bookingID', $bookingID)
            ->update(['status' => 4]);

        if ($updated) {
            return response()->json([
                'success' => true,
                'message' => 'Booking status updated to Reschedule.'
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found or status not updated.'
            ], 404);
        }
    }

    public function rescheduleBooking(Request $request)
    {
        \Log::info('Reschedule request payload', $request->all());
        $request->validate([
            'bookingID' => 'required|integer|exists:booking,bookingID',
            'userID' => 'required|integer|exists:users,userID',
            'requestedDate' => 'required|date',
            'requestedStartTime' => 'required|date_format:H:i',
            'reason' => 'nullable|string|max:1000',
        ]);
        \Log::info('Updating booking status', ['bookingID' => $request->bookingID]);

        // Calculate requestedEndTime as 30 minutes after requestedStartTime
        $startTime = $request->requestedStartTime;
        $endTime = date("H:i:s", strtotime($startTime . " +30 minutes"));

        // Wrap in transaction to ensure both succeed
        DB::beginTransaction();
        try {
            // 1️⃣ Insert booking request
            $bookingRequestID = DB::table('booking_request')->insertGetId([
                'bookingID' => $request->bookingID,
                'userID' => $request->userID,
                'requestType' => 'reschedule',
                'requestedDate' => $request->requestedDate,
                'requestedStartTime' => $startTime,
                'requestedEndTime' => $endTime,
                'reason' => $request->reason,
                'status' => 'pending',
                'requestDate' => now(),
            ]);

            // 2️⃣ Update booking status
            DB::table('booking')
                ->where('bookingID', $request->bookingID)
                ->update(['status' => 4]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Reschedule request submitted and booking status updated.',
                'requestID' => $bookingRequestID
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reschedule booking: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getRescheduleRequest($bookingId)
    {
    
        try {
                // Get the latest reschedule request for the booking
                $rescheduleRequest = BookingRequest::where('bookingID',$bookingId)
                    ->where('requestType', 'reschedule')
                    ->latest('requestDate')
                    ->first();

                if (!$rescheduleRequest) {
                    return response()->json([
                        'message' => 'No reschedule request found for this booking.',
                        'data'    => null
                    ], 404);
                }

                return response()->json([
                    'message' => 'Reschedule request fetched successfully.',
                    'data'    => [
                        'status'           => $rescheduleRequest->status,
                        'requestDate'      => $rescheduleRequest->requestDate,
                        'requestedDate'    => $rescheduleRequest->requestedDate,
                        'requestedStartTime' => $rescheduleRequest->requestedStartTime,
                        'requestedEndTime' => $rescheduleRequest->requestedEndTime,
                        'reason'           => $rescheduleRequest->reason,
                    ]
                ], 200);

            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Error fetching cancel request.',
                    'error'   => $e->getMessage()
                ], 500);
            }
    }

    public function adminGetAllRequests()
    {
        try {
            $requests = BookingRequest::with('user:userID,fname,lname',
                                            'booking:bookingID,bookingDate,bookingStartTime,bookingEndTime,packageID', 
                                            'booking.packages:packageID,name')
                ->where('status', 'pending')
                ->orderBy('requestDate', 'desc')
                ->get();

            return response()->json([
                'message' => 'All booking requests fetched successfully.',
                'data'    => $requests
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching booking requests.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function confirmReschedule($id)
    {
        try {
            $request = BookingRequest::findOrFail($id);
            $booking = Booking::findOrFail($request->bookingID);

            // Update booking_request status to "approved"
            $request->status = 'approved'; // or numeric value if you use 1
            $request->save();

            // Update booking details
            $booking->bookingDate = $request->requestedDate;
            $booking->bookingStartTime = $request->requestedStartTime;
            $booking->bookingEndTime = $request->requestedEndTime;
            $booking->save();

            return response()->json([
                'message' => 'Reschedule confirmed successfully.',
                'data' => $request
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error confirming reschedule.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function confirmCancellation($id)
    {
        try {
            $request = BookingRequest::findOrFail($id);
            $booking = Booking::findOrFail($request->bookingID);

            // Update booking_request status to "approved"
            $request->status = 'approved'; // or numeric value if you use 1
            $request->save();

            // Update booking status to 3 (cancelled)
            $booking->status = 3;
            $booking->save();

            return response()->json([
                'message' => 'Cancellation confirmed successfully.',
                'data' => $request
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error confirming cancellation.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function decline($id)
    {
        $request = BookingRequest::find($id);

        if (!$request) {
            return response()->json([
                'message' => 'Booking request not found.'
            ], 404);
        }

        if ($request->status !== 'pending') {
            return response()->json([
                'message' => 'This request has already been processed.'
            ], 400);
        }

        $request->status = 'declined';
        $request->save();

        return response()->json([
            'message' => 'Booking request successfully declined.',
            'data' => $request
        ], 200);
    }


}
