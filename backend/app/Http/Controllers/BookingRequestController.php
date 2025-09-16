<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BookingRequest;

class BookingRequestController extends Controller
{
    public function storeCancelRequest(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'bookingID' => 'required|integer',
            'userID' => 'required|integer',
            'reason' => 'required|string|max:1000',
        ]);

        // Insert into DB
        $cancelRequest = BookingRequest::create([
            'bookingID' => $validated['bookingID'],
            'userID' => $validated['userID'],
            'requestType' => 'cancel',
            'reason' => $validated['reason'],
            'status' => 'pending',
            'requestDate' => now(), // auto timestamp
        ]);

        return response()->json([
            'message' => 'Cancel request submitted successfully.',
            'data' => $cancelRequest
        ], 201);
    }
}
