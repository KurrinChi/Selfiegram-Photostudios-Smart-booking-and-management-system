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

            // Check if booking already exists (in case of duplicate webhook calls)
            if ($paymentSession->booking_id) {
                Log::info('Booking already exists for payment session', [
                    'payment_session_id' => $paymentSession->id,
                    'booking_id' => $paymentSession->booking_id
                ]);
                
                // Update payment session status
                DB::table('payment_sessions')
                    ->where('id', $paymentSession->id)
                    ->update([
                        'status' => 'completed',
                        'paymongo_payment_id' => $paymentId,
                        'payment_method_used' => $paymentMethod,
                        'updated_at' => now()
                    ]);
                return;
            }

            // Decode stored booking data
            $bookingData = json_decode($paymentSession->booking_data, true);
            if (!$bookingData) {
                Log::error('No booking data found in payment session', [
                    'payment_session_id' => $paymentSession->id,
                    'checkout_session_id' => $sessionId
                ]);
                return;
            }

            Log::info('Creating booking from payment confirmation', [
                'payment_session_id' => $paymentSession->id,
                'booking_data' => $bookingData
            ]);

            // Now create the actual booking after payment confirmation
            $bookingId = $this->createBookingFromPaymentData($bookingData, $paymentMethod, $amount / 100);

            if ($bookingId) {
                // Update payment session with the created booking ID
                DB::table('payment_sessions')
                    ->where('id', $paymentSession->id)
                    ->update([
                        'booking_id' => $bookingId,
                        'status' => 'completed',
                        'paymongo_payment_id' => $paymentId,
                        'payment_method_used' => $paymentMethod,
                        'updated_at' => now()
                    ]);

                // Create transaction record
                $this->createTransactionRecord($bookingId, $amount / 100, $paymentMethod);

                // Create payment notification
                $this->createPaymentNotification($bookingId, $paymentSession->payment_type, $amount / 100, $paymentMethod);

                Log::info('Payment and booking completed successfully', [
                    'payment_session_id' => $paymentSession->id,
                    'booking_id' => $bookingId,
                    'paymongo_payment_id' => $paymentId,
                    'amount' => $amount / 100,
                    'payment_method' => $paymentMethod
                ]);
            } else {
                Log::error('Failed to create booking from payment data', [
                    'payment_session_id' => $paymentSession->id,
                    'booking_data' => $bookingData
                ]);
            }
        });
    }
    
    /**
     * Create transaction record for completed payment
     */
    private function createTransactionRecord($bookingId, $amount, $paymentMethod)
    {
        try {
            // Get the next transId since auto-increment might not be working
            $maxTransId = DB::table('transaction')->max('transId') ?? 0;
            $newTransId = $maxTransId + 1;
            
            // Get booking details for transaction record
            $booking = DB::table('booking')->where('bookingID', $bookingId)->first();
            
            if ($booking) {
                DB::table('transaction')->insert([
                    'transId' => $newTransId,
                    'bookingId' => $bookingId,
                    'total' => $booking->total,
                    'paymentStatus' => $booking->paymentStatus,
                    'date' => now()->toDateString(),
                    'receivedAmount' => $amount,
                    'paymentMethod' => $paymentMethod,
                    'rem' => $booking->rem
                ]);
                
                Log::info('Transaction record created', [
                    'transaction_id' => $newTransId,
                    'booking_id' => $bookingId,
                    'amount' => $amount
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to create transaction record', [
                'booking_id' => $bookingId,
                'error' => $e->getMessage()
            ]);
        }
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
        
        DB::table('booking')
            ->where('bookingID', $bookingId)
            ->update([
                'receivedAmount' => $newReceivedAmount,
                'rem' => max(0, $newRemainingBalance),
                'paymentStatus' => $paymentStatus,
                'status' => $bookingStatus,
                'paymentMethod' => $finalPaymentMethod
            ]);
            
        Log::info('Booking payment status updated', [
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

            $dynamicMessage = "Your {$paymentTypeText} of ₱" . number_format($amount, 2) . " for SFO#{$booking->bookingID} {$booking->packageName} (Booking Date: {$bookingDate} at {$bookingTime}) has been successfully processed via {$paymentMethod}.";

            // Get payment transaction ID
            $transactionId = DB::table('payment_transactions')->where('booking_id', $bookingId)->latest('created_at')->value('id') ?? 0;

            // Create notification
            $notification = Notification::create([
                'userID' => $booking->userID,
                'title' => 'Payment Successful! 💳',
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
     * Map frontend addon IDs to database addOnID values
     */
    private function mapAddonIdToDatabase($frontendAddonId)
    {
        // If it's already a numeric ID that exists in our addon mapping, return it directly
        if (is_numeric($frontendAddonId)) {
            $numericId = (int)$frontendAddonId;
            if (in_array($numericId, [10, 20, 30, 40, 50, 60, 70])) {
                return $numericId;
            }
        }
        
        // Mapping for legacy string-based addon IDs (fallback)
        $addonMapping = [
            'pax' => 20,        // Addl Pax
            'portrait' => 10,   // Addl Portrait Picture  
            'grid' => 30,       // Addl Grid Picture
            'a4' => 40,         // Addl A4 Picture
            'backdrop' => 50,   // Addl Backdrop
            'digital' => 60,    // All digital copies
            'extra5' => 70      // Addl 5 mins
        ];

        return $addonMapping[$frontendAddonId] ?? null;
    }
    
    /**
     * Create actual booking from stored booking data after successful payment
     */
    private function createActualBooking($bookingData, $paymentMethod)
    {
        try {
            // Get the next bookingID
            $maxBookingId = DB::table('booking')->max('bookingID') ?? 0;
            $newBookingId = $maxBookingId + 1;
            
            // Calculate payment amounts
            $total = $bookingData['total'];
            $paymentType = $bookingData['payment_type'];
            $paidAmount = $paymentType === 'full' ? $total : 200.00;
            $remainingBalance = $total - $paidAmount;
            $paymentStatus = $remainingBalance <= 0 ? 1 : 0;
            
            // Create booking record
            DB::table('booking')->insert([
                'bookingID' => $newBookingId,
                'userID' => $bookingData['user_id'],
                'packageID' => $bookingData['package_id'],
                'customerName' => $bookingData['customer_name'],
                'customerEmail' => $bookingData['customer_email'],
                'customerAddress' => $bookingData['customer_address'],
                'customerContactNo' => $bookingData['customer_contact'],
                'bookingDate' => $bookingData['booking_date'],
                'bookingStartTime' => $bookingData['start_time'],
                'bookingEndTime' => $bookingData['end_time'],
                'subTotal' => $bookingData['package_price'],
                'total' => $total,
                'receivedAmount' => $paidAmount,
                'rem' => $remainingBalance,
                'paymentMethod' => $paymentMethod, // Use actual payment method from PayMongo
                'paymentStatus' => $paymentStatus,
                'status' => 2, // 2 = confirmed (payment received)
                'date' => now()->toDateString(),
                'studio_selection' => $bookingData['studio_selection'],
                'addons_total' => $bookingData['addons_total']
            ]);
            
            // Store add-ons data if any
            if (isset($bookingData['addons_data']) && $bookingData['addons_data']) {
                $addonsData = json_decode($bookingData['addons_data'], true);
                if ($addonsData) {
                    foreach ($addonsData as $addon) {
                        // Map frontend addon IDs to database addOnID  
                        $addOnID = $this->mapAddonIdToDatabase($addon['addon_id']);
                        if ($addOnID) {
                            // Get the next bookingAddOnID
                            $maxAddOnId = DB::table('booking_add_ons')->max('bookingAddOnID') ?? 0;
                            $newAddOnId = $maxAddOnId + 1;
                            
                            DB::table('booking_add_ons')->insert([
                                'bookingAddOnID' => $newAddOnId,
                                'bookingID' => $newBookingId,
                                'addOnID' => $addOnID,
                                'quantity' => $addon['quantity'],
                                'price' => $addon['price']
                            ]);
                        }
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
                'receivedAmount' => $paidAmount,
                'paymentMethod' => $paymentMethod,
                'rem' => $remainingBalance
            ]);
            
            Log::info('Booking created successfully after payment', [
                'booking_id' => $newBookingId,
                'payment_method' => $paymentMethod,
                'customer_name' => $bookingData['customer_name']
            ]);
            
            return $newBookingId;
            
        } catch (\Exception $e) {
            Log::error('Failed to create booking after payment', [
                'error' => $e->getMessage(),
                'booking_data' => $bookingData
            ]);
            throw $e;
        }
    }
    
    /**
     * Create booking from payment data after payment confirmation
     */
    private function createBookingFromPaymentData($bookingData, $paymentMethod, $paidAmount)
    {
        try {
            // Get user ID from auth or use default
            $userId = 1; // Default user ID for testing
            
            // Parse time slot
            $timeSlot = explode(' - ', $bookingData['time_slot']);
            $startTime = $this->parseTimeSlot($timeSlot[0]);
            $endTime = $this->addHourToTime($startTime);
            
            // Calculate amounts
            $totalAmount = $bookingData['total_amount'];
            $remainingBalance = $totalAmount - $paidAmount;
            $paymentStatus = $remainingBalance <= 0 ? 1 : 0; // 1 = fully paid, 0 = partially paid
            
            // Get the next bookingID
            $maxBookingId = DB::table('booking')->max('bookingID') ?? 0;
            $newBookingId = $maxBookingId + 1;
            
            // Prepare studio selection data
            $studioSelection = null;
            if (isset($bookingData['studio_selection']) && $bookingData['studio_selection']) {
                $studioSelection = json_encode($bookingData['studio_selection']);
            }
            
            // Calculate addons total
            $addonsTotal = 0;
            if (isset($bookingData['addons']) && is_array($bookingData['addons'])) {
                foreach ($bookingData['addons'] as $addon) {
                    if (isset($addon['value']) && $addon['value'] > 0) {
                        $addonTotal = $addon['type'] === 'spinner' ? $addon['price'] * $addon['value'] : $addon['price'];
                        $addonsTotal += $addonTotal;
                    }
                }
            }
            
            // Create booking record
            DB::table('booking')->insert([
                'bookingID' => $newBookingId,
                'userID' => $userId,
                'packageID' => (int)$bookingData['package_id'],
                'customerName' => $bookingData['name'], // Fixed field name
                'customerEmail' => $bookingData['email'], // Fixed field name
                'customerAddress' => $bookingData['address'], // Fixed field name
                'customerContactNo' => $bookingData['contact'], // Fixed field name
                'bookingDate' => $bookingData['booking_date'],
                'bookingStartTime' => $startTime,
                'bookingEndTime' => $endTime,
                'subTotal' => $totalAmount - $addonsTotal,
                'total' => $totalAmount,
                'receivedAmount' => $paidAmount,
                'rem' => $remainingBalance,
                'paymentMethod' => $paymentMethod,
                'paymentStatus' => $paymentStatus,
                'status' => 2, // 2 = confirmed (payment received)
                'date' => now()->toDateString(),
                'studio_selection' => $studioSelection,
                'addons_total' => $addonsTotal
            ]);
            
            // Store add-ons data if any
            if (isset($bookingData['addons']) && is_array($bookingData['addons'])) {
                foreach ($bookingData['addons'] as $addon) {
                    if (isset($addon['value']) && $addon['value'] > 0) {
                        // Map frontend addon IDs to database addOnID
                        $addOnID = $this->mapAddonIdToDatabase($addon['id']);
                        if ($addOnID) {
                            // Get the next bookingAddOnID
                            $maxAddOnId = DB::table('booking_add_ons')->max('bookingAddOnID') ?? 0;
                            $newAddOnId = $maxAddOnId + 1;
                            
                            DB::table('booking_add_ons')->insert([
                                'bookingAddOnID' => $newAddOnId,
                                'bookingID' => $newBookingId,
                                'addOnID' => $addOnID,
                                'quantity' => $addon['value'],
                                'price' => $addon['price']
                            ]);
                        }
                    }
                }
            }
            
            Log::info('Booking created from payment data', [
                'booking_id' => $newBookingId,
                'customer_name' => $bookingData['name'], // Fixed field name
                'payment_method' => $paymentMethod,
                'amount_paid' => $paidAmount
            ]);
            
            return $newBookingId;
            
        } catch (\Exception $e) {
            Log::error('Failed to create booking from payment data', [
                'error' => $e->getMessage(),
                'booking_data' => $bookingData,
                'trace' => $e->getTraceAsString()
            ]);
            
            return null;
        }
    }
    
    /**
     * Parse time slot to 24-hour format
     */
    private function parseTimeSlot($timeSlot)
    {
        $time = \DateTime::createFromFormat('h:i A', $timeSlot);
        return $time ? $time->format('H:i:s') : '09:00:00';
    }
    
    /**
     * Add one hour to time
     */
    private function addHourToTime($timeString)
    {
        $time = \DateTime::createFromFormat('H:i:s', $timeString);
        if ($time) {
            $time->add(new \DateInterval('PT1H'));
            return $time->format('H:i:s');
        }
        return '10:00:00';
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