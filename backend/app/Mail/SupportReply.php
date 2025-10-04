<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class SupportReply extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $subjectLine;
    public string $bodyMessage;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, string $subjectLine, string $bodyMessage)
    {
        $this->user = $user;
        $this->subjectLine = $subjectLine;
        $this->bodyMessage = $bodyMessage;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('[SelfieGram Support] ' . $this->subjectLine)
            ->view('emails.supportreply')
            ->with([
                'user' => $this->user,
                'subjectLine' => $this->subjectLine,
                'bodyMessage' => $this->bodyMessage,
            ]);
    }
}
