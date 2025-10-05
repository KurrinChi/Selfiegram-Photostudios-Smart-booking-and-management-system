<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Events\GalleryImagesConfirmed;
use App\Models\Notification;

Route::get('/test-pusher', function () {
    // Create a test notification
    $notification = Notification::create([
        'userID' => 3, // Change this to an actual user ID
        'title' => 'Digital Copies successfully added to your gallery.',
        'label' => 'Gallery',
        'message' => '---',
        'time' => now(),
        'starred' => 0,
        'bookingID' => 1, // Change this to an actual booking ID
        'transID' => 0,
    ]);

    // Broadcast the event
    broadcast(new GalleryImagesConfirmed(3, 1, 5, $notification));

    return response()->json([
        'message' => 'Test event broadcasted successfully!',
        'notification' => $notification
    ]);
});

/**
 * TEST ROUTE: Simulate webhook payment completion
 * Use this for local testing since PayMongo webhooks can't reach localhost
 * 
 * Usage: GET /test/complete-payment?session_id=cs_xxx
 */
Route::get('/test/complete-payment', function (Illuminate\Http\Request $request) {
    $sessionId = $request->query('session_id');
    
    if (!$sessionId) {
        return response()->json(['error' => 'session_id required'], 400);
    }
    
    // Find payment session
    $paymentSession = DB::table('payment_sessions')
        ->where('checkout_session_id', $sessionId)
        ->first();
        
    if (!$paymentSession) {
        return response()->json(['error' => 'Payment session not found'], 404);
    }
    
    if ($paymentSession->status === 'paid') {
        return response()->json(['message' => 'Already paid'], 200);
    }
    
    // Simulate webhook payload
    $testPayload = [
        'data' => [
            'attributes' => [
                'type' => 'checkout_session.payment.paid',
                'data' => [
                    'id' => $sessionId,
                    'attributes' => [
                        'payment_intent' => [
                            'id' => 'pi_test_' . uniqid(),
                            'attributes' => [
                                'payment_method' => [
                                    'type' => 'card'
                                ]
                            ]
                        ],
                        'line_items' => [
                            [
                                'amount' => $paymentSession->amount * 100 // Convert to centavos
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ];
    
    // Call webhook handler
    $webhookController = new \App\Http\Controllers\PayMongoWebhookController();
    $webhookRequest = new \Illuminate\Http\Request($testPayload);
    $response = $webhookController->handleWebhook($webhookRequest);
    
    // Get updated booking
    $booking = DB::table('booking')->where('bookingID', $paymentSession->booking_id)->first();
    $transaction = DB::table('transaction')->where('bookingId', $paymentSession->booking_id)->first();
    
    return response()->json([
        'message' => 'Payment simulated successfully!',
        'session_id' => $sessionId,
        'booking_id' => $paymentSession->booking_id,
        'amount_paid' => $paymentSession->amount,
        'booking' => [
            'receivedAmount' => $booking->receivedAmount ?? null,
            'rem' => $booking->rem ?? null,
            'paymentStatus' => $booking->paymentStatus ?? null,
            'status' => $booking->status ?? null
        ],
        'transaction' => [
            'receivedAmount' => $transaction->receivedAmount ?? null,
            'rem' => $transaction->rem ?? null,
            'paymentStatus' => $transaction->paymentStatus ?? null
        ]
    ]);
});