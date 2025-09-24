<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserImage extends Model
{
    use HasFactory;

    protected $table = 'user_images';

    protected $primaryKey = 'imageID';
    public $timestamps = false; 
    protected $fillable = [
        'userID',
        'packageID',
        'fileName',
        'filePath',
        'uploadDate',
        'isPrivate',
        'tag',
        'isFavorite',
    ];
}