<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingRequestSubmitted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @var array<int,int> List of admin user IDs to notify
     */
    public array $adminIds;

    /**
     * @var array Payload to send to clients (e.g., notification object)
     */
    public array $payload;

    /**
     * Create a new event instance.
     *
     * @param array<int,int> $adminIds
     * @param array $payload
     */
    public function __construct(array $adminIds, array $payload)
    {
        $this->adminIds = $adminIds;
        $this->payload = $payload;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        // Broadcast to each admin's private channel (private-user.{id})
        return array_map(fn ($id) => new PrivateChannel('user.' . $id), $this->adminIds);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'booking.request.submitted';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return $this->payload;
    }
}
