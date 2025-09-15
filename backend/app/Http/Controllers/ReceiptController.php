<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReceiptController extends Controller
{
    public function show($id)
    {
        $receipt = DB::selectOne("
        SELECT 
    b.bookingID,
    b.customerName,
    b.customerEmail,
    b.customerAddress,
    b.customerContactNo,
    b.bookingDate,
    b.bookingStartTime,
    b.bookingEndTime,
    b.subTotal,
    b.rem AS bookingRem,
    b.receivedAmount AS bookingReceived,
    b.status,
    b.paymentStatus,
    p.name AS packageName,
    p.description,
    u.fname,
    u.lname,
    u.email,
    pi.imagePath,
    -- aggregated add-ons & concepts
    COALESCE(
      GROUP_CONCAT(DISTINCT CONCAT(ao.addOn, ' x', ba.quantity, ' (₱', FORMAT(ba.quantity * ba.price, 2), ')') SEPARATOR ', '),
      ''
    ) AS selectedAddOns,
    COALESCE(
      GROUP_CONCAT(DISTINCT pc.backdrop SEPARATOR ', '),
      ''
    ) AS selectedConcepts,
    -- latest transaction fields
    (SELECT t.date 
     FROM `transaction` t 
     WHERE t.bookingId = b.bookingID 
     ORDER BY t.date DESC, t.transId DESC 
     LIMIT 1
    ) AS transactionDate,
    (SELECT t.total 
     FROM `transaction` t 
     WHERE t.bookingId = b.bookingID 
     ORDER BY t.date DESC, t.transId DESC 
     LIMIT 1
    ) AS transactionTotal,
    (SELECT t.rem 
     FROM `transaction` t 
     WHERE t.bookingId = b.bookingID 
     ORDER BY t.date DESC, t.transId DESC 
     LIMIT 1
    ) AS transactionRem,
    (SELECT t.receivedAmount 
     FROM `transaction` t 
     WHERE t.bookingId = b.bookingID 
     ORDER BY t.date DESC, t.transId DESC 
     LIMIT 1
    ) AS transactionReceivedAmount,
    (SELECT t.paymentMethod
     FROM `transaction` t 
     WHERE t.bookingId = b.bookingID 
     ORDER BY t.date DESC, t.transId DESC 
     LIMIT 1
    ) AS transactionPaymentMethod,
    (SELECT t.paymentStatus
     FROM `transaction` t 
     WHERE t.bookingId = b.bookingID 
     ORDER BY t.date DESC, t.transId DESC 
     LIMIT 1
    ) AS transactionPaymentStatus
FROM booking b
INNER JOIN packages p ON b.packageID = p.packageID
INNER JOIN users u ON b.userID = u.userID
LEFT JOIN package_images pi ON p.packageID = pi.packageID
LEFT JOIN booking_add_ons ba ON b.bookingID = ba.bookingID
LEFT JOIN package_add_ons ao ON ba.addOnID = ao.addOnID
LEFT JOIN booking_concepts bc ON b.bookingID = bc.bookingID
LEFT JOIN package_concept pc ON bc.conceptID = pc.conceptID
WHERE b.bookingID = ?
GROUP BY 
    b.bookingID,
    b.customerName,
    b.customerEmail,
    b.customerAddress,
    b.customerContactNo,
    b.bookingDate,
    b.bookingStartTime,
    b.bookingEndTime,
    b.subTotal,
    b.rem,
    b.receivedAmount,
    b.status,
    b.paymentStatus,
    p.name,
    p.description,
    u.fname,
    u.lname,
    u.email,
    pi.imagePath
LIMIT 1;

        ", [$id]);

        if (!$receipt) {
            return response()->json(['error' => 'Receipt not found'], 404);
        }

        return response()->json($receipt);
    }
}
