<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ForgotPassword extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;
    public $user;

    public function __construct($otp, $user)
    {
        $this->otp = $otp;
        $this->user = $user;
    }

    public function build()
    {
        return $this->subject('SelfieGram Password Reset')
                    ->view('emails.forgotpassword')
                    ->with([
                        'otp' => $this->otp,
                        'user' => $this->user,
                    ]);
    }
}
