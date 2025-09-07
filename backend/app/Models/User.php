<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens; 
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;

    public $timestamps = false; // ✅ Disable automatic timestamps
    protected $primaryKey = 'userID'; 
    protected $fillable = [
        'username',
        'fname',
        'lname',
        'email',
        'address',
        'contactNo',
        'birthday',
        'gender',
        'password',
        'usertype',
        'status',
        'profilePicture',
        'archive',
        'reset_otp',
        'email_verification',
    ];

    protected $hidden = [
        'password',
        'reset_otp',
        'verify_email',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}
