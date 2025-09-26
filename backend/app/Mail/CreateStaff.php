<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class CreateStaff extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $randomPassword;

    public function __construct(User $user, $randomPassword)
    {
        $this->user = $user;
        $this->randomPassword = $randomPassword;
    }

    public function build()
    {
        return $this->subject('Welcome to SelfieGram - Verify Your Email Address')
            ->view('emails.newstaff')
            ->with([
                'user' => $this->user,
                'password' => $this->randomPassword,
            ]);
    }
}
