<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Queue\SerializesModels;

class AdminMessageCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function broadcastOn(): array
    {
        // Private admin channel (auth required) => 'private-admin.messages'
        return [new PrivateChannel('admin.messages')];
    }

    public function broadcastAs(): string
    {
        return 'admin.message.created';
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}
