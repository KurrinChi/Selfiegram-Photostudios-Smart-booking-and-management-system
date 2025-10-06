<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BookingRequest;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Booking;
use App\Models\Packages;
use App\Events\BookingRequestSubmitted;
use App\Models\Notification;
use App\Events\BookingStatusUpdated;

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

            // Broadcast to all admins (after commit)
            $adminIds = User::where('userType', 'Admin')->pluck('userID')->all();
            $payload = [
                'type' => 'Cancellation',
                'requestID' => $cancelRequest->requestID,
                'bookingID' => $cancelRequest->bookingID,
                'userID' => $cancelRequest->userID,
                'status' => $cancelRequest->status,
                'requestDate' => $cancelRequest->requestDate,
                'message' => 'A cancellation request has been submitted.',
            ];
            event(new BookingRequestSubmitted($adminIds, ['notification' => $payload]));

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

            // Broadcast to all admins (after commit)
            $adminIds = User::where('userType', 'Admin')->pluck('userID')->all();
            $payload = [
                'type' => 'Reschedule',
                'requestID' => $rescheduleRequest->requestID,
                'bookingID' => $rescheduleRequest->bookingID,
                'userID' => $rescheduleRequest->userID,
                'requestedDate' => $rescheduleRequest->requestedDate,
                'requestedStartTime' => $rescheduleRequest->requestedStartTime,
                'requestedEndTime' => $rescheduleRequest->requestedEndTime,
                'status' => $rescheduleRequest->status,
                'requestDate' => $rescheduleRequest->requestDate,
                'message' => 'A reschedule request has been submitted.',
            ];
            event(new BookingRequestSubmitted($adminIds, ['notification' => $payload]));

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
            // Optional override for duration in minutes (allows preserving original shorter/longer session)
            'durationMinutes' => 'nullable|integer|min:5|max:480',
        ]);
        \Log::info('Updating booking status', ['bookingID' => $request->bookingID]);

        $startTime = $request->requestedStartTime; // validated H:i

        // --- Determine duration to apply ---
        $explicitDuration = $request->input('durationMinutes');
        $durationToUse = null; // minutes

        if (is_numeric($explicitDuration) && $explicitDuration > 0) {
            $durationToUse = (int) $explicitDuration;
        }

        if ($durationToUse === null) {
            // Fallback 1: derive from existing booking's stored start/end
            $bookingRow = \DB::table('booking')->where('bookingID', $request->bookingID)->first();
            if ($bookingRow && $bookingRow->bookingStartTime && $bookingRow->bookingEndTime) {
                $s = strtotime($bookingRow->bookingStartTime);
                $e = strtotime($bookingRow->bookingEndTime);
                if ($s !== false && $e !== false && $e > $s) {
                    $minutes = (int) ceil(($e - $s) / 60);
                    if ($minutes >= 5 && $minutes <= 480) {
                        $durationToUse = $minutes;
                    }
                }
            }
        }

        if ($durationToUse === null) {
            // Fallback 2: package duration
            $bookingPkg = isset($bookingRow) ? $bookingRow : \DB::table('booking')->where('bookingID', $request->bookingID)->first();
            if ($bookingPkg && $bookingPkg->packageID) {
                $pkgRow = \DB::table('packages')->where('packageID', $bookingPkg->packageID)->first();
                if ($pkgRow && $pkgRow->duration) {
                    $parsed = $this->parseFlexibleDurationToMinutes($pkgRow->duration);
                    if ($parsed >= 5) {
                        $durationToUse = min($parsed, 480); // cap at 8h
                    }
                }
            }
        }

        if ($durationToUse === null) {
            // Fallback 3: preserve legacy behavior (30 minutes)
            $durationToUse = 30;
        }

        // Compute end time from chosen duration
        $endTime = date('H:i:s', strtotime($startTime . " +{$durationToUse} minutes"));

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

            // Broadcast to all admins (after commit)
            $adminIds = User::where('userType', 'Admin')->pluck('userID')->all();
            $payload = [
                'type' => 'Reschedule',
                'requestID' => $bookingRequestID,
                'bookingID' => $request->bookingID,
                'userID' => $request->userID,
                'requestedDate' => $request->requestedDate,
                'requestedStartTime' => $startTime,
                'requestedEndTime' => $endTime,
                'status' => 'pending',
                'requestDate' => now()->toDateTimeString(),
                'message' => 'A reschedule request has been submitted.',
            ];
            event(new BookingRequestSubmitted($adminIds, ['notification' => $payload]));

            return response()->json([
                'success' => true,
                'message' => 'Reschedule request submitted and booking status updated.',
                'requestID' => $bookingRequestID,
                'appliedDurationMinutes' => $durationToUse,
                'requestedEndTime' => $endTime,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reschedule booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lightweight duration parser (e.g. "1 hr 30 mins", "90", "2h").
     */
    private function parseFlexibleDurationToMinutes($raw): int
    {
        if (!$raw || !is_string($raw)) return 0;
        $s = strtolower(trim($raw));
        if (preg_match('/^\d+$/', $s)) return (int) $s;
        $total = 0;
        if (preg_match('/(\d+)\s*(hour|hr|hrs|h)/', $s, $m)) { $total += ((int)$m[1]) * 60; }
        if (preg_match('/(\d+)\s*(minute|min|mins|m)/', $s, $m2)) { $total += (int)$m2[1]; }
        if ($total === 0 && preg_match_all('/(\d+)/', $s, $nums) && isset($nums[1][0])) {
            // If contains hour token, treat first as hours, second as minutes
            if (str_contains($s,'hour') || str_contains($s,'hr') || str_contains($s,'hrs') || str_contains($s,'h ')) {
                $ints = $nums[1];
                $total += ((int)$ints[0]) * 60;
                if (isset($ints[1])) $total += (int)$ints[1];
            } else {
                $total = (int)$nums[1][0];
            }
        }
        return $total;
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

            // Create client notification and broadcast in real-time
            $bookingDate = \Carbon\Carbon::parse($booking->bookingDate)->format('F j, Y');
            // bookingStartTime in DB is H:i:s
            $bookingTime = \DateTime::createFromFormat('H:i:s', $booking->bookingStartTime);
            $formattedTime = $bookingTime ? $bookingTime->format('g:i A') : $booking->bookingStartTime;

            $message = "Your reschedule request for SFO#{$booking->bookingID} has been approved. New schedule: {$bookingDate} at {$formattedTime}.";

            $notification = Notification::create([
                'userID' => $request->userID,
                'title' => 'Reschedule Approved',
                'label' => 'Reschedule',
                'message' => $message,
                'time' => now(),
                'starred' => 0,
                'bookingID' => $booking->bookingID,
                'transID' => 0,
            ]);

            // Push to user's private channel so Notifications.tsx receives it
            broadcast(new BookingStatusUpdated($request->userID, $booking->bookingID, $notification));

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

            // Create client notification and broadcast in real-time
            $bookingDate = \Carbon\Carbon::parse($booking->bookingDate)->format('F j, Y');
            $bookingTimeDT = \DateTime::createFromFormat('H:i:s', $booking->bookingStartTime);
            $bookingTime = $bookingTimeDT ? $bookingTimeDT->format('g:i A') : $booking->bookingStartTime;

            $message = "Your cancellation request for SFO#{$booking->bookingID} has been approved. Your booking on {$bookingDate} at {$bookingTime} is now cancelled.";

            $notification = Notification::create([
                'userID' => $request->userID,
                'title' => 'Cancellation Approved',
                'label' => 'Cancellation',
                'message' => $message,
                'time' => now(),
                'starred' => 0,
                'bookingID' => $booking->bookingID,
                'transID' => 0,
            ]);

            broadcast(new BookingStatusUpdated($request->userID, $booking->bookingID, $notification));

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

        // Notify the user of the decline with appropriate label and message
        $booking = Booking::find($request->bookingID);
        $bookingDate = $booking ? \Carbon\Carbon::parse($booking->bookingDate)->format('F j, Y') : null;
        $bookingTimeDT = ($booking && $booking->bookingStartTime) ? \DateTime::createFromFormat('H:i:s', $booking->bookingStartTime) : null;
        $bookingTime = $bookingTimeDT ? $bookingTimeDT->format('g:i A') : null;

        if ($request->requestType === 'reschedule') {
            $title = 'Reschedule Declined';
            $label = 'Reschedule';
            $message = "Your reschedule request for SFO#{$request->bookingID} has been declined.";
        } else { // cancel
            $title = 'Cancellation Declined';
            $label = 'Cancellation';
            $message = "Your cancellation request for SFO#{$request->bookingID} has been declined.";
        }
        if ($bookingDate && $bookingTime) {
            $message .= " Original schedule remains on {$bookingDate} at {$bookingTime}.";
        }

        $notification = Notification::create([
            'userID' => $request->userID,
            'title' => $title,
            'label' => $label,
            'message' => $message,
            'time' => now(),
            'starred' => 0,
            'bookingID' => $request->bookingID,
            'transID' => 0,
        ]);

        broadcast(new BookingStatusUpdated($request->userID, $request->bookingID, $notification));

        return response()->json([
            'message' => 'Booking request successfully declined.',
            'data' => $request
        ], 200);
    }


}
