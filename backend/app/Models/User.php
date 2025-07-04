<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasFactory;

    public $timestamps = false; // ✅ Disable automatic timestamps

    protected $fillable = [
        'username',
        'fname',
        'lname',
        'email',
        'address',
        'contactNo',
        'password',
        'usertype',
        'status',
        'profilePicture',
        'archive',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}
