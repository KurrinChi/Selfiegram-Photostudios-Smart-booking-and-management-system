<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
class NotificationController extends Controller
{
     public function getUserNotifications($userID)
    {
        $notifications = Notification::where(function ($query) use ($userID) {
                $query->where('userID', $userID)
                      ->orWhereNull('userID')
                      ->orWhere('userID', 0); // global notifications
            })
            ->orderBy('time', 'desc')
            ->get();

        return response()->json($notifications);
    }
}
