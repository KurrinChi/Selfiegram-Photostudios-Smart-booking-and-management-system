<?php

use Illuminate\Support\Facades\Route;
use App\Events\GalleryImagesConfirmed;
use App\Models\Notification;
use App\Http\Controllers\PayMongoWebhookController;

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

// Test webhook simulation for local development
Route::post('/webhook-simulate/{sessionId}', function ($sessionId) {
    // Simulate PayMongo webhook payload
    $webhookPayload = [
        'data' => [
            'id' => 'evt_test_' . uniqid(),
            'type' => 'event',
            'attributes' => [
                'type' => 'checkout_session.payment.paid',
                'data' => [
                    'id' => $sessionId,
                    'type' => 'checkout_session',
                    'attributes' => [
                        'payment_intent' => [
                            'id' => 'pi_test_' . uniqid()
                        ],
                        'line_items' => [
                            [
                                'amount' => 95700, // Will be divided by 100 in webhook
                                'payment_method_used' => 'gcash'
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ];

    // Create request with simulated webhook data
    $request = new \Illuminate\Http\Request();
    $request->merge($webhookPayload);

    // Call the webhook controller
    $webhookController = new PayMongoWebhookController();
    $response = $webhookController->handleWebhook($request);

    return response()->json([
        'message' => 'Webhook simulation completed',
        'webhook_response' => $response->getData(),
        'session_id' => $sessionId
    ]);
});

// Check payment session status
Route::get('/payment-session/{sessionId}', function ($sessionId) {
    $paymentSession = \DB::table('payment_sessions')
        ->where('checkout_session_id', $sessionId)
        ->first();

    if (!$paymentSession) {
        return response()->json(['error' => 'Payment session not found'], 404);
    }

    $booking = null;
    if ($paymentSession->booking_id) {
        $booking = \DB::table('booking')
            ->where('bookingID', $paymentSession->booking_id)
            ->first();
    }

    return response()->json([
        'payment_session' => $paymentSession,
        'booking' => $booking,
        'booking_data' => $paymentSession->booking_data ? json_decode($paymentSession->booking_data, true) : null
    ]);
});