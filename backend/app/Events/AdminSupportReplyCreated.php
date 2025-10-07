<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Queue\SerializesModels;

class AdminSupportReplyCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $notification;
    public ?int $targetMessageID;

    public function __construct(array $notification, ?int $targetMessageID = null)
    {
        $this->notification = $notification;
        $this->targetMessageID = $targetMessageID;
    }

    public function broadcastOn(): array
    {
        // Same private admin channel used for inbound messages
        return [new PrivateChannel('admin.messages')];
    }

    public function broadcastAs(): string
    {
        // Reuse event name so frontend can listen uniformly on admin channel
        return 'support.reply.created';
    }

    public function broadcastWith(): array
    {
        return [
            'notification' => $this->notification,
            'targetMessageID' => $this->targetMessageID,
        ];
    }
}
