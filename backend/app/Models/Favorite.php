<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    // Table name (optional if it follows Laravel convention)
    protected $table = 'favorites';

    // Primary key
    protected $primaryKey = 'favoriteID';

    // Disable updated_at and created_at (since you're only using createdAt)
    public $timestamps = false;

    // Allow mass assignment
    protected $fillable = [
        'userID',
        'packageID',
        'createdAt',
    ];

    // If you want to cast createdAt to Carbon instance
    protected $casts = [
        'createdAt' => 'datetime',
    ];

    // Relationships (optional but useful)
    public function user()
    {
        return $this->belongsTo(User::class, 'userID');
    }

    public function package()
    {
        return $this->belongsTo(Package::class, 'packageID');
    }
}
