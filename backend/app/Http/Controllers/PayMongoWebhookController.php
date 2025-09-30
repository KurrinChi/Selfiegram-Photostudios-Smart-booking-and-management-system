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
                    'status' => 'paid',
                    'paymongo_payment_id' => $paymentId,
                    'payment_method_used' => $paymentMethod,
                    'paid_at' => now(),
                    'updated_at' => now()
                ]);
                
            // Create payment transaction record
            DB::table('payment_transactions')->insert([
                'payment_session_id' => $paymentSession->id,
                'booking_id' => $paymentSession->booking_id,
                'paymongo_payment_id' => $paymentId,
                'amount' => $amount / 100, // Convert from centavos
                'currency' => 'PHP',
                'status' => 'completed',
                'transaction_type' => $paymentSession->payment_type,
                'metadata' => json_encode($eventData),
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            // Update booking payment status
            $this->updateBookingPaymentStatus($paymentSession->booking_id, $paymentSession->payment_type, $amount / 100, $paymentMethod);
            
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