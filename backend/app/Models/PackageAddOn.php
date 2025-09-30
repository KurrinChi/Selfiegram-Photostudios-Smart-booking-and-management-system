<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackageAddOn extends Model
{
    use HasFactory;

    protected $table = 'package_add_ons';  
    protected $primaryKey = 'addOnID';  
    public $incrementing = false;
    public $timestamps = false;    

    protected $fillable = [
        'addOnID',
        'addOn',
        'addOnPrice',
        'type',
        'min_quantity',
        'max_quantity'
    ];

    
}
