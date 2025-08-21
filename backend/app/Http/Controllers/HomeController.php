<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class HomeController extends Controller
{
public function getTopSellingPackages()
{
    $packages = DB::table('booking')
        ->join('packages', 'booking.packageID', '=', 'packages.packageID')
        ->leftJoin('package_images', 'packages.packageID', '=', 'package_images.packageID')
        ->select(
            'packages.packageID as id',
            'packages.name as title',
            'packages.price',
            DB::raw('COUNT(booking.bookingID) as total_orders'),
            DB::raw('AVG(booking.rating) as rating'),
            DB::raw('MIN(package_images.imagePath) as image') // get one image per package
        )
        ->groupBy('packages.packageID', 'packages.name', 'packages.price')
        ->orderByDesc('total_orders')
        ->limit(3)
        ->get();

    return response()->json($packages);
}
}