<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $table = 'messages';
    protected $primaryKey = 'messageID';
    public $timestamps = false; // table uses custom timestamp column name (createdAt)

    protected $fillable = [
        'senderID',
        'senderName',
        'senderEmail',
        'message',
        'inquiryOptions',
        'messageStatus',
        'createdAt',
    ];

    protected $casts = [
        'createdAt' => 'datetime',
        'messageStatus' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'senderID', 'userID');
    }
}
