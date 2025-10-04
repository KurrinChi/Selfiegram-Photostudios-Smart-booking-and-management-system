<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\User;
use App\Mail\SupportReply;
use Illuminate\Support\Facades\Mail;
use App\Events\SupportReplyCreated;

class SupportReplyController extends Controller
{
    /**
     * Store a support/staff reply as a notification for a specific user.
     * Expected payload: userID, subject (title), body (message)
     */
    public function store(Request $request)
    {
        $request->validate([
            'userID'  => 'required|integer|exists:users,userID',
            'subject' => 'required|string|max:255',
            'body'    => 'required|string',
        ]);

        $userID = (int)$request->input('userID');
        $title = $request->input('subject');
        $body = $request->input('body');

        $notificationData = [
            'userID'   => $userID,
            'title'    => $title,
            'label'    => 'Support', // new label
            'message'  => $body,
            'time'     => now(),
            'starred'  => 0,
            'bookingID'=> null,
            'transID'  => null,
        ];

        $notification = Notification::create($notificationData);

        // Send mail to user (if email exists)
        $user = User::where('userID', $userID)->first();
        if ($user && $user->email) {
            try {
                Mail::to($user->email)->send(new SupportReply($user, $title, $body));
            } catch (\Throwable $ex) {
                // Log but don't fail the API response
                \Log::warning('Support reply mail failed: '.$ex->getMessage());
            }
        }

        // Broadcast to the user's private channel
        event(new SupportReplyCreated($userID, [
            'notificationID' => $notification->notificationID,
            'title'          => $notification->title,
            'label'          => $notification->label,
            'message'        => $notification->message,
            'time'           => $notification->time,
            'starred'        => $notification->starred,
        ]));

        return response()->json([
            'status' => 'success',
            'notification' => $notification,
        ], 201);
    }
}
