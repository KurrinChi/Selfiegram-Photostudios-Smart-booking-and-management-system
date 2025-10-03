<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserImage;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;
class ImageController extends Controller
{
    public function getUserImages($userID)
    {
        // Fetch images with booking and package info for categorization
        $images = \DB::table('user_images as ui')
            ->leftJoin('booking as b', 'b.bookingID', '=', 'ui.booking_id')
            ->leftJoin('packages as p1', 'p1.packageID', '=', 'ui.packageID')
            ->leftJoin('packages as p2', 'p2.packageID', '=', 'b.packageID')
            ->where('ui.userID', $userID)
            ->select(
                'ui.imageID',
                'ui.userID',
                'ui.packageID',
                'ui.booking_id',
                \DB::raw('b.bookingID as bookingID'),
                'ui.fileName',
                'ui.filePath',
                'ui.uploadDate',
                'ui.isPrivate',
                'ui.tag',
                'ui.isFavorite',
                \DB::raw('COALESCE(p1.name, p2.name) as packageName')
            )
            ->orderByDesc('ui.uploadDate')
            ->get();

        return response()->json($images);
    }

    public function toggleFavorite(Request $request, $imageID)
    {
        // Find the image by ID
        $image = UserImage::find($imageID);

        if (!$image) {
            return response()->json(['error' => 'Image not found'], 404);
        }

        // Toggle the isFavorite field
        $image->isFavorite = $image->isFavorite ? 0 : 1;
        $image->save();

        return response()->json([
            'message' => 'Favorite status updated successfully',
            'isFavorite' => $image->isFavorite,
        ]);
    }

    public function getImageUrl($imageID)
    {
        // Fetch the image record from the database
    $image = UserImage::find($imageID);

    if (!$image) {
        return response()->json(['error' => 'Image not found'], 404);
    }

    // Ensure the filePath does not include `/storage`
    $filePath = ltrim(str_replace('/storage', '', $image->filePath), '/');

    // Generate the URL for the file
    $url = Storage::url($filePath);

    return response()->json(['url' => $url]);
    }

   public function proxyImage(Request $request)
    {
       // Handle preflight OPTIONS request
    if ($request->getMethod() === 'OPTIONS') {
        return response('', 200)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
            ->header('Access-Control-Max-Age', '86400');
    }

    // Validate the request to ensure the path parameter is provided
    $request->validate([
        'path' => 'required|string',
    ]);

    // Get the image path from the query parameter
    $path = $request->query('path');

    // Sanitize the path to prevent directory traversal attacks
    $path = str_replace(['../', '..\\'], '', $path);
    
    // Check if the file exists in storage
    if (!Storage::exists($path)) {
        \Log::error('Image not found: ' . $path);
        return response()->json(['error' => 'Image not found', 'path' => $path], Response::HTTP_NOT_FOUND)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    try {
        // Serve the file as a response
        $file = Storage::get($path);
        $mimeType = Storage::mimeType($path);

        return response($file, Response::HTTP_OK)
            ->header('Content-Type', $mimeType)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            ->header('Cache-Control', 'public, max-age=31536000') // Cache for 1 year
            ->header('Expires', gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
    } catch (\Exception $e) {
        \Log::error('Error serving image: ' . $e->getMessage());
        return response()->json(['error' => 'Error serving image'], Response::HTTP_INTERNAL_SERVER_ERROR)
            ->header('Access-Control-Allow-Origin', '*');
    }
}
}
