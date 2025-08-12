<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ForgotPasswordController extends Controller
{
    public function storeOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string'
        ]);

        // 1️⃣ Check if email exists and is active (archive = 1)
        $user = DB::table('users')->where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Email not found'], 404);
        }

        if ($user->archive != 1) {
            return response()->json(['status' => 'error', 'message' => 'This account is inactive and cannot reset password'], 403);
        }

        // 2️⃣ Delete existing OTPs for this email
        DB::table('password_reset_token')
            ->where('email', $request->email)
            ->delete();

        // 3️⃣ Store new OTP with expiration (5 minutes)
        DB::table('password_reset_token')->insert([
            'email' => $request->email,
            'token' => $request->token,
            'created_at' => Carbon::now(),
            'expire_at' => Carbon::now()->addMinutes(5)
        ]);

        return response()->json(['status' => 'success', 'message' => 'OTP stored successfully']);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string'
        ]);

        $record = DB::table('password_reset_token')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$record) {
            return response()->json(['status' => 'error', 'message' => 'Invalid OTP'], 400);
        }

        if (Carbon::now()->greaterThan(Carbon::parse($record->expire_at))) {
            return response()->json(['status' => 'error', 'message' => 'OTP expired'], 400);
        }

        return response()->json(['status' => 'success', 'message' => 'OTP verified']);
    }
}
