<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
use App\Events\GalleryImagesConfirmed;
use App\Models\Notification;

class GalleryController extends Controller
{
    public function completedAppointments()
    {
        $appointments = DB::table('booking')
            ->join('packages', 'booking.packageID', '=', 'packages.packageID')
            ->join('users', 'booking.userID', '=', 'users.userID')
            ->leftJoin('transaction', 'transaction.bookingId', '=', 'booking.bookingID')
            ->select(
                'booking.bookingID as id',
                'booking.customerName',
                'users.userID',
                'users.username',
                'packages.name as package',
                'packages.packageID',
                'booking.bookingDate',
                'transaction.date as transactionDate',
                'booking.status',
                'booking.bookingStartTime',
                'booking.bookingEndTime',
                'booking.feedback',
                'booking.rating',
                DB::raw("CONCAT(booking.bookingStartTime, ' - ', booking.bookingEndTime) as time"),
                DB::raw("IF(booking.status = 1, 'Done', IF(booking.status = 2, 'Pending', 'Cancelled')) as status")
            )
            ->where('booking.status', 1) // Only completed appointments
            ->get();

        return response()->json($appointments);
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'file' => 'required|image|max:5120', // 5MB max
            'userID' => 'required|integer',
            'packageID' => 'required|integer',
            'isPrivate' => 'nullable|boolean',
            'tag' => 'nullable|string',
            'isFavorite' => 'nullable|boolean',
            'bookingID' => 'required|integer',
        ]);

        $file = $request->file('file');

        // Get customer using userID
        $customer = DB::table('users')->where('userID', $request->userID)->first();

        if (!$customer) {
            return response()->json(['error' => 'Customer not found'], 404);
        }

        // Use username for folder instead of userID
        $customerFolder = 'uploads/' . str_replace(' ', '_', strtolower($customer->username ?? 'user_' . $request->userID));

        // Define destination folder inside public/storage (make sure public/storage exists and is web-accessible)
        $destination = public_path('storage/' . $customerFolder);

        // Ensure the folder exists, create if not
        if (!File::exists($destination)) {
            File::makeDirectory($destination, 0755, true);
        }

        // Generate unique filename and move uploaded file
        $originalName = $file->getClientOriginalName();
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $file->move($destination, $filename);

        // Construct relative public URL path
        $relativePath = '/storage/' . $customerFolder . '/' . $filename;

        // Insert image record into DB
        $imageID = DB::table('user_images')->insertGetId([
            'userID' => $request->userID,
            'packageID' => $request->packageID,
            'booking_id' => $request->bookingID,
            'fileName' => $originalName,
            'filePath' => $relativePath,
            'uploadDate' => now(),
            'isPrivate' => $request->input('isPrivate', false),
            'tag' => $request->input('tag', null),
            'isFavorite' => $request->input('isFavorite', false),
        ]);

        return response()->json([
            'imageID' => $imageID,
            'fileUrl' => url($relativePath),
        ], 201);
    }


    public function getImagesByUser($userID,$packageID,$bookingID)
    {
        // Fetch images for the user, selecting imageID and filePath
        $images = DB::table('user_images')
            ->where('userID', $userID)
            ->where('packageID', $packageID)
            ->where('booking_id', $bookingID)
            ->select('imageID', 'filePath')
            ->get();

        // Return JSON array with id and url fields expected by frontend
        return response()->json(
            $images->map(function ($img) {
                return [
                    'id' => $img->imageID,
                    'url' => url($img->filePath),
                ];
            })
        );
    }
    
    public function deleteImages(Request $request)
    {
        $request->validate([
            'imageIDs' => 'required|array',
            'imageIDs.*' => 'integer',
        ]);

        $imageIDs = $request->input('imageIDs');

        $images = DB::table('user_images')
            ->whereIn('imageID', $imageIDs)
            ->get();

        foreach ($images as $image) {
            $filePath = public_path('storage/' . ltrim($image->filePath, '/storage/'));
            if (File::exists($filePath)) {
                File::delete($filePath);
            }
        }

        // Delete records from the database
        DB::table('user_images')->whereIn('imageID', $imageIDs)->delete();

        return response()->json(['message' => 'Images deleted successfully']);
    }

    public function confirmImages(Request $request)
    {
        $request->validate([
            'userID' => 'required|integer',
            'bookingID' => 'required|integer',
            'imageIDs' => 'required|array',
            'imageIDs.*' => 'integer',
        ]);

        $userID = $request->input('userID');
        $bookingID = $request->input('bookingID');
        $imageIDs = $request->input('imageIDs');
        $imageCount = count($imageIDs);

        // Verify images belong to the user
        $validImages = DB::table('user_images')
            ->whereIn('imageID', $imageIDs)
            ->where('userID', $userID)
            ->count();

        if ($validImages !== $imageCount) {
            return response()->json(['error' => 'Invalid image selection'], 400);
        }

        // Get booking and package details
        $bookingDetails = DB::table('booking')
            ->join('packages', 'booking.packageID', '=', 'packages.packageID')
            ->where('booking.bookingID', $bookingID)
            ->where('booking.userID', $userID)
            ->select(
                'booking.bookingID',
                'booking.bookingDate',
                'booking.bookingStartTime',
                'packages.name as packageName'
            )
            ->first();

        if (!$bookingDetails) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        // Format the booking date and time
        $bookingDate = \Carbon\Carbon::parse($bookingDetails->bookingDate)->format('F j, Y');
        $bookingTime = \Carbon\Carbon::parse($bookingDetails->bookingStartTime)->format('g:i A');
        
        // Create dynamic message
        $dynamicMessage = "Your digital copies from SFO#{$bookingDetails->bookingID} {$bookingDetails->packageName} (Booking Date: {$bookingDate} at {$bookingTime}) have been added to your gallery available for download.";

        // Create notification
        $notification = Notification::create([
            'userID' => $userID,
            'title' => 'Your photos are ready! 📸',
            'label' => 'Gallery',
            'message' => $dynamicMessage,
            'time' => now(),
            'starred' => 0,
            'bookingID' => $bookingID,
            'transID' => 0,
        ]);

        // Broadcast the event via Pusher
        broadcast(new GalleryImagesConfirmed($userID, $bookingID, $imageCount, $notification));

        return response()->json([
            'success' => true,
            'message' => 'Images confirmed successfully',
            'notification' => $notification,
            'imageCount' => $imageCount
        ]);
    }


}