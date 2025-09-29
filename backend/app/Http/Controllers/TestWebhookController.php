<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TestWebhookController extends Controller
{
    /**
     * Simulate webhook for testing payment method capture
     */
    public function simulateWebhook(Request $request)
    {
        $bookingId = $request->input('booking_id');
        $paymentMethod = $request->input('payment_method', 'gcash');
        
        if (!$bookingId) {
            return response()->json(['error' => 'booking_id required'], 400);
        }
        
        // Find a pending payment session for this booking
        $paymentSession = DB::table('payment_sessions')
            ->where('booking_id', $bookingId)
            ->where('status', 'pending')
            ->first();
            
        if (!$paymentSession) {
            return response()->json(['error' => 'No pending payment session found'], 404);
        }
        
        // Map test payment methods
        $methodMap = [
            'gcash' => 'GCash',
            'paymaya' => 'Maya',
            'grab_pay' => 'GrabPay',
            'card' => 'Credit/Debit Card'
        ];
        
        $formattedMethod = $methodMap[$paymentMethod] ?? 'PayMongo';
        
        // Update payment session
        DB::table('payment_sessions')
            ->where('id', $paymentSession->id)
            ->update([
                'status' => 'paid',
                'payment_method_used' => $formattedMethod,
                'paid_at' => now(),
                'updated_at' => now()
            ]);
            
        // Update booking
        DB::table('booking')
            ->where('bookingID', $bookingId)
            ->update([
                'paymentMethod' => $formattedMethod,
                'paymentStatus' => 1,
                'status' => 2
            ]);
            
        return response()->json([
            'success' => true,
            'message' => 'Payment method updated successfully',
            'booking_id' => $bookingId,
            'payment_method' => $formattedMethod,
            'payment_session_id' => $paymentSession->id
        ]);
    }
}