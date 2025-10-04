<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Models\Notification;
use App\Events\MessageSent;
use App\Events\AdminMessageCreated;
use Illuminate\Support\Facades\Broadcast;
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

        // Broadcast event via Pusher to user (confirmation)
        event(new MessageSent($user->userID, [
            'notificationID' => $notification->notificationID,
            'title'          => $notification->title,
            'label'          => $notification->label,
            'message'        => $notification->message,
            'time'           => $notification->time,
            'starred'        => $notification->starred,
        ]));

        // Broadcast admin-facing event on private-admin.messages (authorized admins only)
        try {
            broadcast(new AdminMessageCreated([
                'messageID'      => $message->messageID,
                'senderName'     => $message->senderName,
                'senderEmail'    => $message->senderEmail,
                'inquiryOptions' => $message->inquiryOptions,
                'message'        => $message->message,
                'messageStatus'  => $message->messageStatus,
                'createdAt'      => $message->createdAt ?? now(),
                'profilePicture' => $user->profilePicture ?? null,
            ]));
        } catch (\Throwable $e) {
            \Log::warning('Admin public broadcast failed', ['error' => $e->getMessage()]);
        }

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
        // Eager load related user limited columns for profile picture
        $messages = Message::with(['user:userID,profilePicture'])
            ->orderByDesc('messageID')
            ->paginate($perPage);

        // Transform to include a top-level profilePicture key for convenience
        $messages->getCollection()->transform(function ($m) {
            $m->profilePicture = $m->user ? $m->user->profilePicture : null; // attach virtual field
            return $m;
        });

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

    /**
     * Toggle / set starred flag
     */
    public function updateStarred($id, Request $request)
    {
        $msg = Message::find($id);
        if (!$msg) {
            return response()->json(['status' => 'error', 'message' => 'Message not found'], 404);
        }
        $val = (int)$request->input('starred', 0) === 1 ? 1 : 0;
        $msg->starred = $val;
        $msg->save();
        return response()->json(['status' => 'success', 'data' => $msg]);
    }

    /**
     * Archive (move to trash) or restore (archived=0)
     */
    public function updateArchived($id, Request $request)
    {
        $msg = Message::find($id);
        if (!$msg) {
            return response()->json(['status' => 'error', 'message' => 'Message not found'], 404);
        }
        $val = (int)$request->input('archived', 0) === 1 ? 1 : 0;
        $msg->archived = $val;
        $msg->save();
        return response()->json(['status' => 'success', 'data' => $msg]);
    }

    /**
     * Permanently delete all archived (trash) messages
     */
    public function emptyTrash()
    {
        $count = Message::where('archived', 1)->count();
        Message::where('archived', 1)->delete();
        return response()->json([
            'status' => 'success',
            'deleted' => $count,
            'message' => $count . ' trashed message(s) permanently deleted.'
        ]);
    }
}
