<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
     use HasFactory;

    protected $table = 'notifications';
    protected $primaryKey = 'notificationID';
    public $timestamps = false; // since your table uses `time` not created_at/updated_at

    protected $fillable = [
        'userID',
        'title',
        'label',
        'message',
        'time',
        'starred',
        'bookingID',
        'transID',
    ];
}
