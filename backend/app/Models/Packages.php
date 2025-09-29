<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Packages extends Model
{
    use HasFactory;

    protected $table = 'packages';
    protected $primaryKey = 'packageID';
    public $timestamps = false;

    protected $fillable = [
        'setID',
        'name',
        'description',
        'duration',
        'price',
        'status',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'packageID', 'packageID');
    }
}
