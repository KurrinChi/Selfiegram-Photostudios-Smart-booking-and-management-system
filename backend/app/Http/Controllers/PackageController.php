<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PackageController extends Controller
{
    public function index()
    {
            $raw = DB::table('packages')
        ->where('packages.status', 1)
        ->leftJoin('package_images', 'packages.packageID', '=', 'package_images.packageID')
        ->select(
            'packages.packageID as id',
            'packages.name as title',
            'packages.price',
            'package_images.imagePath'
        )
        ->get();

        $grouped = $raw->groupBy('id');

        $packages = $grouped->map(function ($items, $id) {
            $first = $items->first();
            return [
                'id' => $id,
                'title' => $first->title,
                'price' => (float) $first->price,
                'images' =>$items->pluck('imagePath')->map(function ($path) {
                return url($path); 
                })
            ];
        })->values();

        return response()->json($packages);

    }
}

?>