<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;
    
    protected $table = 'booking';
    protected $primaryKey = 'bookingID';
    public $timestamps = false;

    protected $fillable = [
        'userID',
        'packageID',
        'bookingDate',
        'bookingStartTime',
        'bookingEndTime',
        'status',
        'customerName',
        'customerContactNo',
        'customerEmail',
        'customerAddress',
        'date',
        'paymentMethod',
        'paymentStatus',
        'subTotal',
        'total',
        'rem',
        'receivedAmount',
        'feedback',
        'rating'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'userID', 'userID');
    }

    public function packages()
    {
        return $this->belongsTo(Packages::class, 'packageID', 'packageID');
    }
}
