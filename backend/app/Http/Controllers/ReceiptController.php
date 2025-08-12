<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReceiptController extends Controller
{
   public function show($id)
    {
      $receipt = DB::selectOne("
        SELECT booking.*,
               packages.name AS packageName,
               packages.description,
               users.fname,
               users.lname,
               users.email,
               package_images.imagePath
        FROM booking
        INNER JOIN packages ON booking.packageID = packages.packageID
        INNER JOIN users ON booking.userID = users.userID
        LEFT JOIN package_images ON packages.packageID = package_images.packageID
        WHERE booking.bookingID = ?
        LIMIT 1
    ", [$id]);

    if (!$receipt) {
        return response()->json(['error' => 'Receipt not found'], 404);
    }

    return response()->json($receipt);
  }
}