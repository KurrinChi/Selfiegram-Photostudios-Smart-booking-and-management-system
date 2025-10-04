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
            DB::raw('COALESCE(ROUND(AVG(booking.rating), 1), 0) as rating'),
            DB::raw('MIN(package_images.imagePath) as image') // get one image per package
        )
        ->groupBy('packages.packageID', 'packages.name', 'packages.price')
        ->orderByDesc('total_orders')
        ->limit(3)
        ->get();

    return response()->json($packages);
}
public function getFeedbacks()
    {
       $feedbacks = DB::table('booking')
            ->join('users', 'booking.userID', '=', 'users.userID') // adjust if PK is different
            ->join('packages', 'booking.packageID', '=', 'packages.packageID')
            ->select(
                'users.username as username',
                 DB::raw("IFNULL(users.profilePicture, 'storage/profile_photos/default.png') as user_image"), // Fallback to default image
                'packages.name as package_name',
                'booking.feedback',
                'booking.rating',
                'booking.bookingDate',
                DB::raw("CONCAT(DATE_FORMAT(booking.bookingStartTime, '%h:%i %p'), ' - ', DATE_FORMAT(booking.bookingEndTime, '%h:%i %p')) as booking_time")
            )
            ->whereNotNull('booking.feedback')
            ->orderBy('booking.bookingID', 'desc')
            ->limit(3) // reduced from 10 to 3 per requirement
            ->get();

        return response()->json($feedbacks);
    }
}