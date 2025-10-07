<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Events\PaymentStatusUpdated;
use App\Models\Notification;

class PayMongoWebhookController extends Controller
{
    /**
     * Handle PayMongo webhook events
     */
    public function handleWebhook(Request $request)
    {
        try {
            // Verify webhook signature (recommended for production)
            // $this->verifyWebhookSignature($request);
            
            $payload = $request->all();
            Log::info('PayMongo Webhook Received', $payload);
            
            $eventType = $payload['data']['attributes']['type'] ?? null;
            $eventData = $payload['data']['attributes']['data'] ?? null;
            
            if (!$eventType || !$eventData) {
                Log::warning('Invalid webhook payload structure');
                return response()->json(['status' => 'error', 'message' => 'Invalid payload'], 400);
            }
            
            switch ($eventType) {
                case 'checkout_session.payment.paid':
                    $this->handlePaymentPaid($eventData);
                    break;
                    
                case 'checkout_session.payment.failed':
                    $this->handlePaymentFailed($eventData);
                    break;
                    
                case 'checkout_session.expired':
                    $this->handleSessionExpired($eventData);
                    break;
                    
                default:
                    Log::info('Unhandled webhook event type: ' . $eventType);
                    break;
            }
            
            return response()->json(['status' => 'success']);
            
        } catch (\Exception $e) {
            Log::error('Webhook processing failed', [
                'error' => $e->getMessage(),
                'payload' => $request->all()
            ]);
            
            return response()->json(['status' => 'error'], 500);
        }
    }
    
    /**
     * Handle successful payment
     */
    private function handlePaymentPaid($eventData)
    {
        $sessionId = $eventData['id'] ?? null;
        $paymentId = $eventData['attributes']['payment_intent']['id'] ?? null;
        $amount = $eventData['attributes']['line_items'][0]['amount'] ?? null;
        
        // Extract payment method information
        $paymentMethod = $this->extractPaymentMethod($eventData);
        
        if (!$sessionId) {
            Log::warning('Payment paid event missing session ID');
            return;
        }
        
        DB::transaction(function () use ($sessionId, $paymentId, $amount, $eventData, $paymentMethod) {
            // Find the payment session
            $paymentSession = DB::table('payment_sessions')
                ->where('checkout_session_id', $sessionId)
                ->first();
                
            if (!$paymentSession) {
                Log::warning('Payment session not found for PayMongo session: ' . $sessionId);
                return;
            }
            
            // Update payment session status
            DB::table('payment_sessions')
                ->where('id', $paymentSession->id)
                ->update([
                    'status' => 'completed',
                    'paymongo_payment_id' => $paymentId,
                    'payment_method_used' => $paymentMethod,
                    'updated_at' => now()
                ]);
            
            // Check if this is a NEW booking (booking_id is null)
            if ($paymentSession->booking_id === null) {
                Log::info('Creating NEW booking from payment session', ['payment_session_id' => $paymentSession->id]);
                
                // Decode booking data from payment session
                $bookingData = json_decode($paymentSession->booking_data, true);
                
                if (!$bookingData) {
                    Log::error('No booking data found in payment session', ['payment_session_id' => $paymentSession->id]);
                    return;
                }
                
                // Create the booking NOW (after payment confirmed)
                $bookingId = $this->createBookingFromPaymentSession($bookingData, $paymentMethod, $amount / 100);
                
                // Update payment session with the new booking_id
                DB::table('payment_sessions')
                    ->where('id', $paymentSession->id)
                    ->update(['booking_id' => $bookingId]);
                
                // Update the local variable
                $paymentSession->booking_id = $bookingId;
                
                Log::info('Booking created successfully after payment', [
                    'booking_id' => $bookingId,
                    'payment_session_id' => $paymentSession->id
                ]);
            } else {
                Log::info('Updating EXISTING booking payment', ['booking_id' => $paymentSession->booking_id]);
                
                // Update existing booking payment status
                $this->updateBookingPaymentStatus($paymentSession->booking_id, $paymentSession->payment_type, $amount / 100, $paymentMethod);
            }
                
            // Create payment transaction record
            DB::table('payment_transactions')->insert([
                'booking_id' => $paymentSession->booking_id,
                'payment_type' => $paymentSession->payment_type,
                'amount' => $amount / 100, // Convert from centavos
                'payment_method' => $paymentMethod,
                'status' => 'completed',
                'payment_details' => json_encode([
                    'paymongo_payment_id' => $paymentId,
                    'checkout_session_id' => $sessionId,
                    'payment_session_id' => $paymentSession->id,
                    'webhook_data' => $eventData
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            // Create payment notification
            $this->createPaymentNotification($paymentSession->booking_id, $paymentSession->payment_type, $amount / 100, $paymentMethod);
            
            Log::info('Payment completed successfully', [
                'payment_session_id' => $paymentSession->id,
                'booking_id' => $paymentSession->booking_id,
                'paymongo_payment_id' => $paymentId,
                'amount' => $amount / 100
            ]);
        });
    }
    
    /**
     * Create booking from payment session data (after payment confirmed)
     */
    private function createBookingFromPaymentSession($bookingData, $paymentMethod, $paidAmount)
    {
        /************************************
         * TIME PARSING & END TIME RESOLUTION
         ************************************/
        $rawStart = $bookingData['time_slot'] ?? null;
        $rawEnd = $bookingData['end_time_slot'] ?? null; // newly stored from frontend

        // Normalize helper
        $normalize = function($label) {
            if (!$label || !is_string($label)) return null;
            return preg_replace('/\s+/', ' ', strtoupper(trim($label)));
        };

        $normalizedStart = $normalize($rawStart);
        $normalizedEnd = $normalize($rawEnd);

        $parseFormats = ['h:i A','g:i A','h:iA','g:iA'];
        $parse = function($label) use ($parseFormats) {
            if (!$label) return null;
            foreach ($parseFormats as $fmt) {
                $dt = \DateTime::createFromFormat($fmt, $label);
                if ($dt instanceof \DateTime) {
                    return $dt->format('H:i:s');
                }
            }
            try {
                $carbon = \Carbon\Carbon::parse($label);
                return $carbon->format('H:i:s');
            } catch (\Exception $e) {
                return null;
            }
        };

        $startTime = $parse($normalizedStart) ?? '09:00:00';
        $endTime = $parse($normalizedEnd); // may be null
        $endParseFailedInitial = $endTime === null && $normalizedEnd !== null;

        // Loose parse as final salvage (e.g., "2:5 PM", "2 PM")
        if (!$endTime && $normalizedEnd) {
            if (preg_match('/^(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)$/', $normalizedEnd, $m)) {
                $h = (int)$m[1];
                $min = isset($m[2]) ? (int)$m[2] : 0;
                if ($h >=1 && $h <=12 && $min>=0 && $min<=59) {
                    if ($m[3]==='PM' && $h!=12) $h+=12; if ($m[3]==='AM' && $h===12) $h=0;
                    $endTime = sprintf('%02d:%02d:00',$h,$min);
                }
            }
        }

        $endNeedsFallback = false;
        if (!$endTime) {
            $endNeedsFallback = true; // no parse
        } elseif (strtotime($endTime) <= strtotime($startTime)) {
            $endNeedsFallback = true; // non-positive interval
        }

        if ($endNeedsFallback) {
            // If we had an end label that differs from start, prefer a minimal +5m buffer
            if ($normalizedEnd && strcasecmp($normalizedEnd, $normalizedStart) !== 0) {
                $dt = \DateTime::createFromFormat('H:i:s', $startTime) ?: new \DateTime('09:00:00');
                $dt->add(new \DateInterval('PT5M'));
                $endTime = $dt->format('H:i:s');
                Log::warning('Webhook booking end time recovered with +5m minimal buffer (avoided +1h)', [
                    'raw_start' => $rawStart,
                    'raw_end' => $rawEnd,
                    'startTime' => $startTime,
                    'endTime' => $endTime,
                    'end_parse_failed_initially' => $endParseFailedInitial
                ]);
            } else {
                // Last resort: +60m
                $dt = \DateTime::createFromFormat('H:i:s', $startTime) ?: new \DateTime('09:00:00');
                $dt->add(new \DateInterval('PT1H'));
                $endTime = $dt->format('H:i:s');
                Log::warning('Webhook booking end time defaulting to +60m fallback', [
                    'raw_start' => $rawStart,
                    'raw_end' => $rawEnd,
                    'startTime' => $startTime,
                    'endTime' => $endTime,
                    'end_parse_failed_initially' => $endParseFailedInitial
                ]);
            }
        } else {
            Log::info('Webhook booking times parsed successfully', [
                'raw_start' => $rawStart,
                'raw_end' => $rawEnd,
                'startTime' => $startTime,
                'endTime' => $endTime
            ]);
        }
        
        // Get next booking ID
        $maxBookingId = DB::table('booking')->max('bookingID') ?? 0;
        $newBookingId = $maxBookingId + 1;
        
        // Calculate payment fields
        $total = $bookingData['total'];
        $paymentType = $bookingData['payment_type'];
        $receivedAmount = $paidAmount; // Amount just paid
        $remainingBalance = $total - $receivedAmount;
        $paymentStatus = $remainingBalance <= 0 ? 1 : 0; // 1 = fully paid, 0 = pending
        $bookingStatus = 2; // 2 = confirmed (payment received)
        
        // Create booking
        DB::table('booking')->insert([
            'bookingID' => $newBookingId,
            'userID' => $bookingData['user_id'],
            'packageID' => $bookingData['package_id'],
            'customerName' => $bookingData['customer_name'],
            'customerEmail' => $bookingData['customer_email'],
            'customerAddress' => $bookingData['customer_address'],
            'customerContactNo' => $bookingData['customer_contact'],
            'bookingDate' => $bookingData['booking_date'],
            'bookingStartTime' => $startTime,
            'bookingEndTime' => $endTime,
            'subTotal' => $bookingData['package_price'],
            'total' => $total,
            'receivedAmount' => $receivedAmount,
            'rem' => $remainingBalance,
            'paymentMethod' => $paymentMethod,
            'paymentStatus' => $paymentStatus,
            'status' => $bookingStatus,
            'date' => now()->toDateString(),
            'studio_selection' => null,
            'addons_total' => $bookingData['addons_total']
        ]);
        
        // Store studio selection (plain backdrop or concept) in booking_concepts table
        if (isset($bookingData['studio_selection'])) {
            $studioSelection = $bookingData['studio_selection'];
            
            // Determine conceptID based on studio selection
            $conceptID = null;
            
            if (isset($studioSelection['type'])) {
                if ($studioSelection['type'] === 'studioA') {
                    // Plain backdrop - map color label to conceptID
                    $colorMap = [
                        'WHITE' => 104,
                        'GRAY' => 105,
                        'BLACK' => 106,
                        'PINK' => 107,
                        'BEIGE' => 108,
                        'LAVENDER' => 109
                    ];
                    $label = strtoupper($studioSelection['label'] ?? '');
                    $conceptID = $colorMap[$label] ?? null;
                } elseif ($studioSelection['type'] === 'studioB') {
                    // Concept studio - map concept label to conceptID
                    $conceptMap = [
                        'CHINGU PINK' => 100,
                        'BOHEMIAN DREAM' => 101,
                        'SPOTLIGHT' => 102
                    ];
                    $label = strtoupper($studioSelection['label'] ?? '');
                    $conceptID = $conceptMap[$label] ?? null;
                }
            }
            
            // Insert into booking_concepts if we have a valid conceptID
            if ($conceptID) {
                DB::table('booking_concepts')->insert([
                    'bookingID' => $newBookingId,
                    'conceptID' => $conceptID
                ]);
            }
        }
        
        // Store add-ons if any
        if (isset($bookingData['addons']) && is_array($bookingData['addons'])) {
            foreach ($bookingData['addons'] as $addon) {
                if (isset($addon['value']) && $addon['value'] > 0) {
                    $addonPrice = isset($addon['price']) ? (float)$addon['price'] : 0;
                    $quantity = (int)$addon['value'];
                    
                    DB::table('booking_add_ons')->insert([
                        'bookingID' => $newBookingId,
                        'addOnID' => $addon['id'],
                        'quantity' => $quantity,
                        'price' => $addonPrice
                    ]);
                }
            }
        }
        
        // Create transaction record
        $maxTransId = DB::table('transaction')->max('transId') ?? 0;
        $newTransId = $maxTransId + 1;
        
        DB::table('transaction')->insert([
            'transId' => $newTransId,
            'bookingId' => $newBookingId,
            'total' => $total,
            'paymentStatus' => $paymentStatus,
            'date' => now()->toDateString(),
            'receivedAmount' => $receivedAmount,
            'paymentMethod' => $paymentMethod,
            'rem' => $remainingBalance
        ]);
        
        // Create booking notification
        $notification = Notification::create([
            'userID' => $bookingData['user_id'],
            'title' => 'Booking Confirmed',
            'label' => 'Booking',
            'message' => "Your booking for SFO#{$newBookingId} {$bookingData['package_name']} has been confirmed for " . \Carbon\Carbon::parse($bookingData['booking_date'])->format('F j, Y'),
            'time' => now(),
            'starred' => 0,
            'bookingID' => $newBookingId,
            'transID' => 0,
        ]);
        
        // Broadcast the event
        broadcast(new \App\Events\BookingStatusUpdated($bookingData['user_id'], $newBookingId, $notification));
        
        Log::info('Booking created from payment session', [
            'booking_id' => $newBookingId,
            'customer' => $bookingData['customer_name'],
            'total' => $total,
            'paid' => $receivedAmount
        ]);
        
        return $newBookingId;
    }
    
    /**
     * Handle failed payment
     */
    private function handlePaymentFailed($eventData)
    {
        $sessionId = $eventData['id'] ?? null;
        
        if (!$sessionId) {
            Log::warning('Payment failed event missing session ID');
            return;
        }
        
        // Update payment session status
        DB::table('payment_sessions')
            ->where('checkout_session_id', $sessionId)
            ->update([
                'status' => 'failed',
                'updated_at' => now()
            ]);
            
        Log::info('Payment failed', ['session_id' => $sessionId]);
    }
    
    /**
     * Handle expired session
     */
    private function handleSessionExpired($eventData)
    {
        $sessionId = $eventData['id'] ?? null;
        
        if (!$sessionId) {
            Log::warning('Session expired event missing session ID');
            return;
        }
        
        // Update payment session status
        DB::table('payment_sessions')
            ->where('checkout_session_id', $sessionId)
            ->update([
                'status' => 'expired',
                'updated_at' => now()
            ]);
            
        Log::info('Session expired', ['session_id' => $sessionId]);
    }
    
    /**
     * Update booking payment status based on payment completion
     */
    private function updateBookingPaymentStatus($bookingId, $paymentType, $paidAmount, $paymentMethod = 'PayMongo')
    {
        $booking = DB::table('booking')->where('bookingID', $bookingId)->first();
        
        if (!$booking) {
            Log::warning('Booking not found for payment update: ' . $bookingId);
            return;
        }
        
        $newReceivedAmount = $booking->receivedAmount + $paidAmount;
        $newRemainingBalance = $booking->total - $newReceivedAmount;
        
        // Determine payment status
        $paymentStatus = $newRemainingBalance <= 0 ? 1 : 0; // 1 = fully paid, 0 = partially paid
        
        // Determine booking status
        $bookingStatus = 2; // 2 = confirmed (payment received)
        
        // Use extracted payment method, fallback to 'PayMongo' for local development
        $finalPaymentMethod = $paymentMethod ?: 'PayMongo';
        
        // Update booking table
        DB::table('booking')
            ->where('bookingID', $bookingId)
            ->update([
                'receivedAmount' => $newReceivedAmount,
                'rem' => max(0, $newRemainingBalance),
                'paymentStatus' => $paymentStatus,
                'status' => $bookingStatus,
                'paymentMethod' => $finalPaymentMethod
            ]);
        
        // Update transaction table as well
        DB::table('transaction')
            ->where('bookingId', $bookingId)
            ->update([
                'receivedAmount' => $newReceivedAmount,
                'rem' => max(0, $newRemainingBalance),
                'paymentStatus' => $paymentStatus,
                'paymentMethod' => $finalPaymentMethod
            ]);
            
        Log::info('Booking and transaction payment status updated', [
            'booking_id' => $bookingId,
            'received_amount' => $newReceivedAmount,
            'remaining_balance' => $newRemainingBalance,
            'payment_status' => $paymentStatus,
            'booking_status' => $bookingStatus,
            'payment_method' => $paymentMethod
        ]);
    }
    
    /**
     * Extract payment method from PayMongo webhook data
     */
    private function extractPaymentMethod($eventData)
    {
        // PayMongo webhook structure varies, check multiple possible locations
        $paymentMethod = 'PayMongo'; // Default fallback
        
        try {
            // Check payment intent for payment method
            if (isset($eventData['attributes']['payment_intent']['attributes']['payment_method']['type'])) {
                $methodType = $eventData['attributes']['payment_intent']['attributes']['payment_method']['type'];
                $paymentMethod = $this->formatPaymentMethodName($methodType);
            }
            // Alternative location for payment method
            elseif (isset($eventData['attributes']['payment_method']['type'])) {
                $methodType = $eventData['attributes']['payment_method']['type'];
                $paymentMethod = $this->formatPaymentMethodName($methodType);
            }
            // Check in payments array
            elseif (isset($eventData['attributes']['payments'][0]['attributes']['source']['type'])) {
                $methodType = $eventData['attributes']['payments'][0]['attributes']['source']['type'];
                $paymentMethod = $this->formatPaymentMethodName($methodType);
            }
            // Check line items for payment method info
            elseif (isset($eventData['attributes']['line_items'][0]['payment_method_used'])) {
                $methodType = $eventData['attributes']['line_items'][0]['payment_method_used'];
                $paymentMethod = $this->formatPaymentMethodName($methodType);
            }
            
        } catch (\Exception $e) {
            Log::warning('Could not extract payment method from webhook', [
                'error' => $e->getMessage(),
                'event_data' => $eventData
            ]);
        }
        
        return $paymentMethod;
    }
    
    /**
     * Create payment notification and broadcast it
     */
    private function createPaymentNotification($bookingId, $paymentType, $amount, $paymentMethod)
    {
        try {
            // Get booking and user details
            $booking = DB::table('booking')
                ->join('packages', 'booking.packageID', '=', 'packages.packageID')
                ->where('booking.bookingID', $bookingId)
                ->select(
                    'booking.bookingID',
                    'booking.userID',
                    'booking.bookingDate',
                    'booking.bookingStartTime',
                    'booking.paymentStatus',
                    'packages.name as packageName'
                )
                ->first();

            if (!$booking) {
                Log::warning('Booking not found for payment notification: ' . $bookingId);
                return;
            }

            // Format the booking date and time
            $bookingDate = \Carbon\Carbon::parse($booking->bookingDate)->format('F j, Y');
            $bookingTime = \Carbon\Carbon::parse($booking->bookingStartTime)->format('g:i A');
            
            // Create dynamic message based on payment type
            $paymentTypeText = '';
            switch ($paymentType) {
                case 'deposit':
                    $paymentTypeText = 'deposit payment';
                    break;
                case 'full':
                    $paymentTypeText = 'full payment';
                    break;
                case 'remaining':
                    $paymentTypeText = 'remaining balance payment';
                    break;
                default:
                    $paymentTypeText = 'payment';
            }

            $dynamicMessage = "Your {$paymentTypeText} of ₱" . number_format($amount, 2) . " for SFO#{$booking->bookingID} {$booking->packageName} (Booking Date: {$bookingDate} at {$bookingTime}) has been successfully processed.";

            // Get payment transaction ID
            $transactionId = DB::table('payment_transactions')->where('booking_id', $bookingId)->latest('created_at')->value('id') ?? 0;

            // Create notification
            $notification = Notification::create([
                'userID' => $booking->userID,
                'title' => 'Payment Successful!',
                'label' => 'Payment',
                'message' => $dynamicMessage,
                'time' => now(),
                'starred' => 0,
                'bookingID' => $bookingId,
                'transID' => $transactionId,
            ]);

            // Broadcast the event via Pusher
            broadcast(new PaymentStatusUpdated($booking->userID, $bookingId, $transactionId, $notification));

            Log::info('Payment notification created and broadcasted', [
                'booking_id' => $bookingId,
                'user_id' => $booking->userID,
                'payment_type' => $paymentType,
                'amount' => $amount
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create payment notification', [
                'booking_id' => $bookingId,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Format payment method name for display
     */
    private function formatPaymentMethodName($methodType)
    {
        $methodMap = [
            'gcash' => 'GCash',
            'grab_pay' => 'GrabPay', 
            'paymaya' => 'Maya',
            'card' => 'Credit/Debit Card',
            'bank_transfer' => 'Bank Transfer',
            'over_the_counter' => 'Over the Counter',
            'online_banking' => 'Online Banking'
        ];
        
        return $methodMap[strtolower($methodType)] ?? 'PayMongo - ' . ucfirst($methodType);
    }
    
    /**
     * Verify webhook signature (implement for production)
     */
    private function verifyWebhookSignature(Request $request)
    {
        // Implement PayMongo webhook signature verification
        // This is important for production to ensure webhooks are from PayMongo
        
        $signature = $request->header('Paymongo-Signature');
        $payload = $request->getContent();
        $webhookSecret = env('PAYMONGO_WEBHOOK_SECRET');
        
        // Add signature verification logic here
        // See PayMongo documentation for implementation details
    }
}