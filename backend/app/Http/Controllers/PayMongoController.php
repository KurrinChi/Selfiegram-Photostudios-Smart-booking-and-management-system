<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PayMongoService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PayMongoController extends Controller
{
    protected $payMongoService;

    public function __construct(PayMongoService $payMongoService)
    {
        $this->payMongoService = $payMongoService;
    }

    /**
     * Create checkout session for booking payment
     */
    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|integer',
            'payment_type' => 'required|in:deposit,full,remaining'
        ]);

        try {
            // Get booking details
            $booking = DB::table('booking')->where('bookingID', $request->booking_id)->first();
            
            if (!$booking) {
                return response()->json(['error' => 'Booking not found'], 404);
            }

            // Calculate payment amount based on type
            $amount = 0;
            $description = '';
            
            switch ($request->payment_type) {
                case 'deposit':
                    $amount = 200; // Fixed deposit amount
                    $description = "Selfiegram Booking Deposit - Booking #{$booking->bookingID}";
                    break;
                case 'full':
                    $amount = $booking->total;
                    $description = "Selfiegram Full Payment - Booking #{$booking->bookingID}";
                    break;
                case 'remaining':
                    $amount = $booking->rem; // Remaining balance
                    $description = "Selfiegram Remaining Balance - Booking #{$booking->bookingID}";
                    break;
            }

            if ($amount <= 0) {
                return response()->json(['error' => 'Invalid payment amount'], 400);
            }

            // Create success and cancel URLs
            $successUrl = env('FRONTEND_URL', 'http://127.0.0.1:5173') . "/payment/success?booking_id={$booking->bookingID}&payment_type={$request->payment_type}";
            $cancelUrl = env('FRONTEND_URL', 'http://127.0.0.1:5173') . "/payment/cancel?booking_id={$booking->bookingID}";

            // Metadata for tracking
            $metadata = [
                'booking_id' => (string)$booking->bookingID,
                'payment_type' => $request->payment_type,
                'customer_name' => $booking->customerName,
                'customer_email' => $booking->customerEmail
            ];

            // Create checkout session
            $result = $this->payMongoService->createCheckoutSession(
                $amount,
                $description,
                $successUrl,
                $cancelUrl,
                $metadata
            );

            if ($result['success']) {
                // Store payment session info in database
                DB::table('payment_sessions')->insert([
                    'booking_id' => $booking->bookingID,
                    'checkout_session_id' => $result['data']['data']['id'],
                    'payment_type' => $request->payment_type,
                    'amount' => $amount,
                    'status' => 'pending',
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now()
                ]);

                return response()->json([
                    'success' => true,
                    'checkout_url' => $result['data']['data']['attributes']['checkout_url'],
                    'checkout_session_id' => $result['data']['data']['id']
                ]);
            }

            return response()->json([
                'success' => false,
                'error' => $result['error']
            ], 400);

        } catch (\Exception $e) {
            Log::error('Payment Checkout Error', [
                'message' => $e->getMessage(),
                'booking_id' => $request->booking_id
            ]);

            return response()->json([
                'error' => 'Payment processing failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle payment success callback
     */
    public function handlePaymentSuccess(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|integer',
            'payment_type' => 'required|string'
        ]);

        try {
            // Get the latest payment session for this booking
            $paymentSession = DB::table('payment_sessions')
                ->where('booking_id', $request->booking_id)
                ->where('payment_type', $request->payment_type)
                ->latest('created_at')
                ->first();

            if (!$paymentSession) {
                return response()->json(['error' => 'Payment session not found'], 404);
            }

            // Verify payment with PayMongo
            $result = $this->payMongoService->getCheckoutSession($paymentSession->checkout_session_id);
            
            if (!$result['success']) {
                return response()->json(['error' => 'Payment verification failed'], 400);
            }

            $checkoutData = $result['data']['data']['attributes'];
            $paymentStatus = $checkoutData['payment_status'];

            if ($paymentStatus === 'paid') {
                // Update booking and transaction records
                $this->updateBookingPaymentStatus($request->booking_id, $request->payment_type, $paymentSession->amount, $checkoutData);

                // Update payment session status
                DB::table('payment_sessions')
                    ->where('id', $paymentSession->id)
                    ->update([
                        'status' => 'completed',
                        'paymongo_payment_id' => $checkoutData['payments'][0]['id'] ?? null,
                        'updated_at' => Carbon::now()
                    ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment successful',
                    'booking_id' => $request->booking_id,
                    'payment_type' => $request->payment_type
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Payment not completed',
                'payment_status' => $paymentStatus
            ], 400);

        } catch (\Exception $e) {
            Log::error('Payment Success Handler Error', [
                'message' => $e->getMessage(),
                'booking_id' => $request->booking_id
            ]);

            return response()->json([
                'error' => 'Payment verification failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update booking payment status based on payment type
     */
    private function updateBookingPaymentStatus($bookingId, $paymentType, $paidAmount, $checkoutData = null)
    {
        DB::beginTransaction();

        try {
            $booking = DB::table('booking')->where('bookingID', $bookingId)->first();
            
            if (!$booking) {
                throw new \Exception('Booking not found');
            }

            $newReceivedAmount = $booking->receivedAmount + $paidAmount;
            $newRemainingBalance = $booking->total - $newReceivedAmount;
            
            // Determine new payment status
            $newPaymentStatus = ($newRemainingBalance <= 0) ? 1 : 0; // 1 = fully paid, 0 = pending
            
            // Determine new booking status
            $newBookingStatus = $booking->status; // Keep existing status by default
            
            // If this is the first payment (deposit), set status to confirmed
            if ($paymentType === 'deposit' && $booking->paymentStatus == 0) {
                $newBookingStatus = 2; // 2 = confirmed/pending appointment
            }
            
            // If full payment or remaining balance paid, keep confirmed status
            if ($newPaymentStatus == 1) {
                $newBookingStatus = 2; // 2 = confirmed/pending appointment (ready for service)
            }

            // Extract payment method from session data if available
            $paymentMethod = $this->extractPaymentMethodFromCheckoutData($checkoutData) ?? 'PayMongo';
            
            // Update booking record
            DB::table('booking')
                ->where('bookingID', $bookingId)
                ->update([
                    'receivedAmount' => $newReceivedAmount,
                    'rem' => $newRemainingBalance,
                    'paymentStatus' => $newPaymentStatus,
                    'paymentMethod' => $paymentMethod,
                    'status' => $newBookingStatus,
                    'updated_at' => Carbon::now()
                ]);

            // Update or create transaction record
            $existingTransaction = DB::table('transaction')->where('bookingId', $bookingId)->first();
            
            if ($existingTransaction) {
                DB::table('transaction')
                    ->where('bookingId', $bookingId)
                    ->update([
                        'receivedAmount' => $newReceivedAmount,
                        'rem' => $newRemainingBalance,
                        'paymentStatus' => $newPaymentStatus,
                        'paymentMethod' => $paymentMethod,
                        'updated_at' => Carbon::now()
                    ]);
            }

            // Create payment transaction record for tracking
            DB::table('payment_transactions')->insert([
                'booking_id' => $bookingId,
                'payment_type' => $paymentType,
                'amount' => $paidAmount,
                'payment_method' => $paymentMethod,
                'status' => 'completed',
                'transaction_date' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get payment history for a booking
     */
    public function getPaymentHistory($bookingId)
    {
        try {
            $payments = DB::table('payment_transactions')
                ->where('booking_id', $bookingId)
                ->orderBy('transaction_date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'payments' => $payments
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch payment history',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Extract payment method from PayMongo checkout data
     */
    private function extractPaymentMethodFromCheckoutData($checkoutData)
    {
        if (!$checkoutData) {
            return 'PayMongo';
        }
        
        try {
            // Check for payment method in payments array
            if (isset($checkoutData['payments'][0]['attributes']['source']['type'])) {
                $methodType = $checkoutData['payments'][0]['attributes']['source']['type'];
                return $this->formatPaymentMethodName($methodType);
            }
            
            // Check for payment method in other possible locations
            if (isset($checkoutData['payment_method_used'])) {
                return $this->formatPaymentMethodName($checkoutData['payment_method_used']);
            }
            
        } catch (\Exception $e) {
            Log::warning('Could not extract payment method from checkout data', [
                'error' => $e->getMessage(),
                'checkout_data' => $checkoutData
            ]);
        }
        
        return 'PayMongo';
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
}