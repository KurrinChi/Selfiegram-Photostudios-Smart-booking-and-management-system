<?php

use Illuminate\Support\Facades\Route;
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