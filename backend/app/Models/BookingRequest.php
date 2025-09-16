<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingRequest extends Model
{
    protected $table = 'booking_request';
    protected $primaryKey = 'requestID';
    public $timestamps = false; // since you don’t have created_at/updated_at

    protected $fillable = [
        'bookingID',
        'userID',
        'requestType',
        'requestedDate',
        'requestedStartTime',
        'requestedEndTime',
        'reason',
        'status',
        'requestDate',
    ];
}
