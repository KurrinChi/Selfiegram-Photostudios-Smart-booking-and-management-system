<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Queue\SerializesModels;

class SupportReplyCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $userID;
    public array $notification;

    public function __construct(int $userID, array $notification)
    {
        $this->userID = $userID;
        $this->notification = $notification;
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('user.' . $this->userID)];
    }

    public function broadcastAs(): string
    {
        return 'support.reply.created';
    }

    public function broadcastWith(): array
    {
        return [
            'notification' => $this->notification,
        ];
    }
}
