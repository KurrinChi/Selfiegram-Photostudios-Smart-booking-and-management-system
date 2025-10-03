<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Models\Notification;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    /**
     * Store a new message from the contact/chat widget
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'message'        => 'required|string',
            'inquiryOptions' => 'required|in:pricing,promotions,account,payment,other',
        ]);

        $payload = [
            'senderID'       => $user->userID,
            'senderName'     => trim(($user->fname ?? '') . ' ' . ($user->lname ?? '')) ?: $user->username,
            'senderEmail'    => $user->email,
            'message'        => $validated['message'],
            'inquiryOptions' => $validated['inquiryOptions'],
            'messageStatus'  => 0,
        ];

        $message = Message::create($payload);

        // Create system notification for the user
        $notificationData = [
            'userID'   => $user->userID,
            'title'    => 'Message Successfully Sent to our Staff!',
            'label'    => 'System',
            'message'  => "Your message has been sent, kindly wait for the staff's response. Please see the operating hours below, thank you!\n\nSELFIEGRAM PHOTOSTUDIOS MALOLOS OPERATING HOURS\nMonday-Friday: 10AM-6:30PM\nSaturday - Sunday: 10AM-6:30PM\n\n— Your Sent Message —\n" . $payload['message'] . "\n#" . $message->messageID . "\n",
            'time'     => now(),
            'starred'  => 0,
            'bookingID'=> null,
            'transID'  => null,
        ];

        $notification = Notification::create($notificationData);

        // Broadcast event via Pusher
        event(new MessageSent($user->userID, [
            'notificationID' => $notification->notificationID,
            'title'          => $notification->title,
            'label'          => $notification->label,
            'message'        => $notification->message,
            'time'           => $notification->time,
            'starred'        => $notification->starred,
        ]));

        return response()->json([
            'status'  => 'success',
            'message' => 'Message submitted successfully.',
            'data'    => [
                'message' => $message,
                'notification' => $notification,
            ],
        ], 201);
    }

    /**
     * List messages (admin/staff) - simple pagination placeholder
     */
    public function index(Request $request)
    {
        $perPage = (int)($request->query('per_page', 20));
        $messages = Message::orderByDesc('messageID')->paginate($perPage);
        return response()->json($messages);
    }

    /**
     * Mark a message as processed/read
     */
    public function updateStatus($id, Request $request)
    {
        $msg = Message::find($id);
        if (!$msg) {
            return response()->json(['status' => 'error', 'message' => 'Message not found'], 404);
        }
        $msg->messageStatus = (int)$request->input('messageStatus', 1); // 1 = processed/read
        $msg->save();
        return response()->json(['status' => 'success', 'data' => $msg]);
    }
}
