<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TransactionController extends Controller
{
    public function createBooking(Request $request)
    {
        $request->validate([
            'package_id' => 'required|integer',
            'booking_date' => 'required|date|after_or_equal:today',
            'time_slot' => 'required|string',
            'name' => 'required|string|max:255',
            'contact' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'address' => 'required|string|max:500',
            'payment_mode' => 'required|in:GCash,Cash',
            'payment_type' => 'required|in:deposit,full'
        ]);

        try {
            DB::beginTransaction();

            // Get package details
            $package = DB::table('packages')->where('packageID', $request->package_id)->first();
            
            if (!$package) {
                return response()->json(['error' => 'Package not found'], 404);
            }

            $userId = Auth::id();
            if (!$userId) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            $subtotal = (float)$package->price;
            $paidAmount = $request->payment_type === 'full' ? $subtotal : 200.00; // 200 for deposit
            $remainingBalance = $subtotal - $paidAmount;
            $paymentStatus = $request->payment_type === 'full' ? 1 : 0; // 1 = fully paid, 0 = pending

            // Parse the time slot to create start and end times
            $timeSlot = $request->time_slot;
            $startTime = $this->parseTimeSlot($timeSlot);
            $endTime = $this->addHourToTime($startTime); // Assuming 1-hour duration

                        // Get the next bookingID since auto-increment is not working
            $maxBookingId = DB::table('booking')->max('bookingID') ?? 0;
            $newBookingId = $maxBookingId + 1;

            // Create booking record (manually setting bookingID)
            DB::table('booking')->insert([
                'bookingID' => $newBookingId,
                'userID' => $userId,
                'packageID' => (int)$request->package_id,
                'customerName' => $request->name,
                'customerEmail' => $request->email,
                'customerAddress' => $request->address,
                'customerContactNo' => $request->contact,
                'bookingDate' => $request->booking_date,
                'bookingStartTime' => $startTime,
                'bookingEndTime' => $endTime,
                'subTotal' => $subtotal,
                'total' => $subtotal,
                'receivedAmount' => $paidAmount,
                'rem' => $remainingBalance,
                'paymentMethod' => $request->payment_mode,
                'paymentStatus' => $paymentStatus,
                'status' => 2, // 2 = pending (0 = cancelled, 1 = done, 2 = pending)
                'date' => Carbon::now()->toDateString()
            ]);

            $bookingId = $newBookingId;

            // Get the next transId since auto-increment might not be working
            $maxTransId = DB::table('transaction')->max('transId') ?? 0;
            $newTransId = $maxTransId + 1;

            // Create transaction record
            DB::table('transaction')->insert([
                'transId' => $newTransId,
                'bookingId' => $bookingId,
                'total' => $subtotal,
                'paymentStatus' => $paymentStatus,
                'date' => Carbon::now()->toDateString(),
                'receivedAmount' => $paidAmount,
                'paymentMethod' => $request->payment_mode,
                'rem' => $remainingBalance
            ]);

            DB::commit();

            // Return booking details for the modal
            $booking = $this->getBookingDetails($bookingId);
            
            return response()->json([
                'success' => true,
                'message' => 'Booking created successfully',
                'booking' => $booking
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to create booking',
                'message' => $e->getMessage(),
                'debug' => [
                    'package_id' => $request->package_id,
                    'user_id' => Auth::id(),
                    'error_line' => $e->getLine(),
                    'error_file' => $e->getFile()
                ]
            ], 500);
        }
    }

    private function parseTimeSlot($timeSlot)
    {
        // Convert "09:00 AM" format to "09:00:00" format
        $time = \DateTime::createFromFormat('h:i A', $timeSlot);
        return $time ? $time->format('H:i:s') : '09:00:00';
    }

    private function addHourToTime($timeString)
    {
        // Add 1 hour to the start time
        $time = \DateTime::createFromFormat('H:i:s', $timeString);
        if ($time) {
            $time->add(new \DateInterval('PT1H'));
            return $time->format('H:i:s');
        }
        return '10:00:00';
    }

    public function getBookingDetails($bookingId)
    {
        $booking = DB::table('booking')
            ->join('packages', 'booking.packageID', '=', 'packages.packageID')
            ->select(
                'booking.bookingID as id',
                'booking.customerName',
                'booking.customerEmail as email',
                'booking.customerAddress as address',
                'booking.customerContactNo as contact',
                'packages.name as package',
                'booking.bookingDate',
                'booking.date as transactionDate',
                'booking.bookingStartTime as time',
                'booking.subTotal as subtotal',
                'booking.receivedAmount as paidAmount',
                'booking.rem as pendingBalance',
                'booking.status',
                'booking.paymentStatus'
            )
            ->where('booking.bookingID', $bookingId)
            ->first();

        if (!$booking) {
            return null;
        }

        // Format time from 24-hour to 12-hour format
        $formattedTime = $this->formatTimeTo12Hour($booking->time);

        // Convert to array and ensure proper data types
        return [
            'id' => (string)$booking->id,
            'customerName' => $booking->customerName,
            'email' => $booking->email,
            'address' => $booking->address,
            'contact' => $booking->contact,
            'package' => $booking->package,
            'bookingDate' => $booking->bookingDate,
            'transactionDate' => $booking->transactionDate,
            'time' => $formattedTime,
            'subtotal' => (float)$booking->subtotal,
            'paidAmount' => (float)$booking->paidAmount,
            'pendingBalance' => (float)$booking->pendingBalance,
            'feedback' => '', // Default empty since column doesn't exist
            'rating' => 0,   // Default 0 since column doesn't exist
            'status' => (int)$booking->status,
            'paymentStatus' => (int)$booking->paymentStatus
        ];
    }

    private function formatTimeTo12Hour($time24)
    {
        $time = \DateTime::createFromFormat('H:i:s', $time24);
        return $time ? $time->format('h:i A') : $time24;
    }

    public function getBookedTimeSlots(Request $request)
    {
        try {
            $date = $request->query('date');
            
            if (!$date) {
                return response()->json(['error' => 'Date parameter is required'], 400);
            }
            
            // Get all booked time slots for the given date
            $bookedSlots = DB::table('booking')
                ->where('bookingDate', $date)
                ->whereIn('status', [0, 2]) // 0 = pending, 2 = confirmed (exclude cancelled)
                ->pluck('bookingStartTime')
                ->map(function ($time) {
                    // Convert 24-hour format to 12-hour format
                    return $this->formatTimeTo12Hour($time);
                })
                ->toArray();
            
            return response()->json([
                'success' => true,
                'bookedSlots' => $bookedSlots
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch booked time slots',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function showBooking($id)
    {
        $booking = $this->getBookingDetails($id);
        
        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        return response()->json($booking);
    }
}
?>