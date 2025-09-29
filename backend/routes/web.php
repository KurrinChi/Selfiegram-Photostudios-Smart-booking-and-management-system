<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;

// Payment routes
Route::get('/payment/cancel', function () {
    return view('payment.cancel'); // You can create a simple cancel page
})->name('payment.cancel');

Route::get('/payment/success', function () {
    return view('payment.success'); // You can create a simple success page
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