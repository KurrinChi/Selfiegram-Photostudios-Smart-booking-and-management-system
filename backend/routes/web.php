<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;

// Payment routes
Route::get('/payment/cancel', function () {
    return view('payment.cancel');
})->name('payment.cancel');

Route::get('/payment-success', function () {
    // AUTOMATIC BOOKING CREATION: When user returns from PayMongo, create the booking immediately
    
    // Get the latest pending payment session
    $paymentSession = \DB::table('payment_sessions')
        ->where('status', 'pending')
        ->orderBy('created_at', 'desc')
        ->first();
    
    if ($paymentSession) {
        \Log::info('🎯 User returned from PayMongo - Creating booking automatically', [
            'session_id' => $paymentSession->checkout_session_id
        ]);
        
        // Simulate webhook payload
        $testPayload = [
            'data' => [
                'attributes' => [
                    'type' => 'checkout_session.payment.paid',
                    'data' => [
                        'id' => $paymentSession->checkout_session_id,
                        'attributes' => [
                            'payment_intent' => [
                                'id' => 'pi_auto_' . uniqid(),
                                'attributes' => [
                                    'payment_method' => [
                                        'type' => 'card'
                                    ]
                                ]
                            ],
                            'line_items' => [
                                [
                                    'amount' => $paymentSession->amount * 100
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];
        
        // Call webhook handler to create booking
        $webhookController = new \App\Http\Controllers\PayMongoWebhookController();
        $webhookRequest = \Illuminate\Http\Request::create('/api/paymongo/webhook', 'POST', $testPayload);
        $webhookController->handleWebhook($webhookRequest);
        
        \Log::info('✅ Booking created automatically!');
    }
    
    // Redirect to frontend
    $frontendUrl = env('FRONTEND_URL', 'http://127.0.0.1:5173');
    $returnPath = request('return', '/client/packages');
    
    return redirect($frontendUrl . $returnPath . '?payment=success');
})->name('payment.success');

Route::get('/api-status', function () {
    return response()->json([
        'status' => 'Laravel server is running',
        'time' => now(),
        'pusher_configured' => config('broadcasting.default') === 'pusher',
        'auth_check' => auth('sanctum')->check(),
        'user' => auth('sanctum')->user() ? auth('sanctum')->user()->userID : null
    ]);
});

Route::get('/db-test', function () {
    try {
        DB::connection()->getPdo();
        return 'Database connection successful!';
    } catch (\Exception $e) {
        return 'Could not connect to the database. Error: ' . $e->getMessage();
    }
});

Route::get('/test-upload', function () {
    $contents = 'Test File';
    $filename = 'test.txt';

    $stored = Storage::disk('public')->put('profile_photos/' . $filename, $contents);

    return $stored ? 'Stored successfully' : 'Failed to store';
});


use Illuminate\Support\Facades\Mail;
use App\Mail\ForgotPassword;
use App\Models\User;
use App\Events\GalleryImagesConfirmed;
use App\Events\BookingStatusUpdated;
use App\Events\PaymentStatusUpdated;
use App\Models\Notification;

//test pusher
Route::get('/test-pusher', function () {
    try {
        // Get booking and package details for test
        $bookingDetails = DB::table('booking')
            ->join('packages', 'booking.packageID', '=', 'packages.packageID')
            ->where('booking.bookingID', 1) // Using bookingID 1 for test
            ->select(
                'booking.bookingID',
                'booking.bookingDate',
                'booking.bookingStartTime',
                'packages.name as packageName'
            )
            ->first();

        $dynamicMessage = '---'; // Default message
        if ($bookingDetails) {
            // Format the booking date and time
            $bookingDate = \Carbon\Carbon::parse($bookingDetails->bookingDate)->format('F j, Y');
            $bookingTime = \Carbon\Carbon::parse($bookingDetails->bookingStartTime)->format('g:i A');
            
            // Create dynamic message
            $dynamicMessage = "Your digital copies from SFO#{$bookingDetails->bookingID} {$bookingDetails->packageName} (Booking Date: {$bookingDate} at {$bookingTime}) have been added to your gallery available for download.";
        }

        // Create a test notification
        $notification = Notification::create([
            'userID' => 3, // Change this to an actual user ID
            'title' => 'Your photos are ready! 📸',
            'label' => 'Gallery',
            'message' => $dynamicMessage,
            'time' => now(),
            'starred' => 0,
            'bookingID' => 1, // Change this to an actual booking ID
            'transID' => 0,
        ]);

        // Log the notification
        \Log::info('Created notification: ', $notification->toArray());

        // Broadcast the event
        $event = new GalleryImagesConfirmed(3, 1, 5, $notification);
        broadcast($event);
        
        \Log::info('Event broadcasted successfully');

        return response()->json([
            'message' => 'Test event broadcasted successfully!',
            'notification' => $notification,
            'pusher_config' => [
                'driver' => config('broadcasting.default'),
                'app_id' => config('broadcasting.connections.pusher.app_id'),
                'key' => config('broadcasting.connections.pusher.key'),
                'cluster' => config('broadcasting.connections.pusher.options.cluster')
            ]
        ]);
    } catch (\Exception $e) {
        \Log::error('Pusher test error: ' . $e->getMessage());
        return response()->json([
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => $e->getFile()
        ], 500);
    }
});

// Test route with public channel
Route::get('/test-pusher-public', function () {
    try {
        \Log::info('Testing public broadcast');
        
        // Broadcast to a public channel
        broadcast(new \Illuminate\Broadcasting\Channel('test-channel'), 'test-event', [
            'message' => 'Hello from public channel!',
            'time' => now()
        ]);
        
        \Log::info('Public broadcast sent');
        
        return response()->json([
            'message' => 'Public test event broadcasted successfully!'
        ]);
    } catch (\Exception $e) {
        \Log::error('Public pusher test error: ' . $e->getMessage());
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
});

// Test booking notification
Route::get('/test-booking-notification', function () {
    try {
        // Get booking and package details for test
        $bookingDetails = DB::table('booking')
            ->join('packages', 'booking.packageID', '=', 'packages.packageID')
            ->where('booking.bookingID', 1) // Using bookingID 1 for test
            ->select(
                'booking.bookingID',
                'booking.userID',
                'booking.bookingDate',
                'booking.bookingStartTime',
                'packages.name as packageName'
            )
            ->first();

        $dynamicMessage = 'Test booking notification'; // Default message
        $userID = 3; // Default test user ID
        
        if ($bookingDetails) {
            $userID = $bookingDetails->userID;
            // Format the booking date and time
            $bookingDate = \Carbon\Carbon::parse($bookingDetails->bookingDate)->format('F j, Y');
            $bookingTime = \Carbon\Carbon::parse($bookingDetails->bookingStartTime)->format('g:i A');
            
            // Create dynamic message
            $dynamicMessage = "Your booking for SFO#{$bookingDetails->bookingID} {$bookingDetails->packageName} has been confirmed for {$bookingDate} at {$bookingTime}.";
        }

        // Create a test notification
        $notification = Notification::create([
            'userID' => $userID,
            'title' => 'Booking Confirmed! 📅',
            'label' => 'Booking',
            'message' => $dynamicMessage,
            'time' => now(),
            'starred' => 0,
            'bookingID' => 1,
            'transID' => 0,
        ]);

        // Log the notification
        \Log::info('Created booking notification: ', $notification->toArray());

        // Broadcast the event
        $event = new BookingStatusUpdated($userID, 1, $notification);
        broadcast($event);
        
        \Log::info('Booking event broadcasted successfully');

        return response()->json([
            'message' => 'Test booking notification broadcasted successfully!',
            'notification' => $notification,
        ]);
    } catch (\Exception $e) {
        \Log::error('Booking notification test error: ' . $e->getMessage());
        return response()->json([
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => $e->getFile()
        ], 500);
    }
});

// Test payment notification
Route::get('/test-payment-notification', function () {
    try {
        // Get the current authenticated user ID (works for any logged-in user)
        $currentUser = auth('sanctum')->user();
        $userID = $currentUser ? $currentUser->userID : 3; // Fallback to 3 if not authenticated
        
        // Get booking and package details for the current user
        $bookingDetails = DB::table('booking')
            ->join('packages', 'booking.packageID', '=', 'packages.packageID')
            ->where('booking.userID', $userID) // Use current user's ID
            ->orderBy('booking.bookingID', 'desc')
            ->select(
                'booking.bookingID',
                'booking.userID',
                'booking.bookingDate',
                'booking.bookingStartTime',
                'packages.name as packageName'
            )
            ->first();

        $dynamicMessage = 'Test payment notification'; // Default message
        
        if ($bookingDetails) {
            $userID = $bookingDetails->userID;
            $bookingID = $bookingDetails->bookingID;
            // Format the booking date and time
            $bookingDate = \Carbon\Carbon::parse($bookingDetails->bookingDate)->format('F j, Y');
            $bookingTime = \Carbon\Carbon::parse($bookingDetails->bookingStartTime)->format('g:i A');
            
            // Create dynamic message
            $dynamicMessage = "Your payment of ₱200.00 for SFO#{$bookingDetails->bookingID} {$bookingDetails->packageName} (Booking Date: {$bookingDate} at {$bookingTime}) has been successfully processed via PayMongo.";
        } else {
            // If user has no bookings, create a generic test notification
            $bookingID = 0;
            $dynamicMessage = "Test payment notification for user {$userID} - No bookings found, using generic message.";
        }

        // Create a test notification
        $notification = Notification::create([
            'userID' => $userID,
            'title' => 'Payment Successful! 💳',
            'label' => 'Payment',
            'message' => $dynamicMessage,
            'time' => now(),
            'starred' => 0,
            'bookingID' => $bookingID,
            'transID' => 1,
        ]);

        // Log the notification
        \Log::info('Created payment notification: ', $notification->toArray());

        // Broadcast the event
        $event = new PaymentStatusUpdated($userID, $bookingID, 1, $notification);
        broadcast($event);
        
        \Log::info('Payment event broadcasted successfully');

        return response()->json([
            'message' => 'Test payment notification broadcasted successfully!',
            'notification' => $notification,
            'booking_details' => $bookingDetails,
            'user_id' => $userID,
            'booking_id_used' => $bookingDetails ? $bookingDetails->bookingID : 3,
        ]);
    } catch (\Exception $e) {
        \Log::error('Payment notification test error: ' . $e->getMessage());
        return response()->json([
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => $e->getFile()
        ], 500);
    }
});

//test
Route::get('/test-mail', function () {
    $otp = 1234;

    // Example: get a user (replace with actual logged-in user if needed)
    $user = User::first();

    Mail::to('demoprojectsystemuse@gmail.com')->send(new ForgotPassword($otp, $user));

    return 'Mail sent!';
});

//proxy for passing image url to editor
Route::get('/api/proxy-image', function (\Illuminate\Http\Request $request) {
    $path = $request->query('path'); 

    // Full path to storage
    $fullPath = storage_path('app/public/' . $path);

    if (!file_exists($fullPath)) {
        abort(404, 'Image not found');
    }

    return Response::file($fullPath, [
        'Access-Control-Allow-Origin' => '*', // Allow frontend access
    ]);
});