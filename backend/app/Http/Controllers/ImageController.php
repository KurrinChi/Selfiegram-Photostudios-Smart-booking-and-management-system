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
        // Fetch all images for the given userID
        $images = UserImage::where('userID', $userID)->get();

        // Return the images as JSON
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
        // Validate the request to ensure the `path` parameter is provided
        $request->validate([
            'path' => 'required|string',
        ]);

        // Get the image path from the query parameter
        $path = $request->query('path');

        // Check if the file exists in storage
        if (!Storage::exists($path)) {
            return response()->json(['error' => 'Image not found'], Response::HTTP_NOT_FOUND);
        }

        // Serve the file as a response
        $file = Storage::get($path);
        $mimeType = Storage::mimeType($path);

        return response($file, Response::HTTP_OK)->header('Content-Type', $mimeType);
    }
}
