<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use App\Services\PayMongoService;
use App\Events\BookingStatusUpdated;
use App\Models\Notification;

class TransactionController extends Controller
{
    protected $payMongoService;

    public function __construct(PayMongoService $payMongoService)
    {
        $this->payMongoService = $payMongoService;
    }
    public function createBooking(Request $request)
    {
        try {
            $request->validate([
                'package_id' => 'required|integer',
                'booking_date' => 'required|date',  // Removed after_or_equal:today temporarily
                'time_slot' => 'required|string',
                'name' => 'required|string|max:255',
                'contact' => 'required|string|max:20',
                'email' => 'required|email|max:255',
                'address' => 'required|string|max:500',
                'payment_mode' => 'nullable|string',
                'payment_type' => 'nullable|string|in:deposit,full',
                'addons.*.id' => 'required_with:addons|string',
                'addons.*.value' => 'required_with:addons|numeric|min:0',
                'studio_selection' => 'nullable'  // Removed object type temporarily
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $e->errors(),
                'received_data' => $request->all()
            ], 422);
        }

        \Log::info('Creating booking with payload:', $request->all());

        try {
            DB::beginTransaction();

            // Get package details
            $package = DB::table('packages')->where('packageID', $request->package_id)->first();
            
            if (!$package) {
                return response()->json(['error' => 'Package not found'], 404);
            }

            $userId = Auth::id();
            if (!$userId) {
                // For testing: use a default user ID when not authenticated
                $userId = 1; // Assuming user ID 1 exists
                \Log::info('Using default user ID for testing: ' . $userId);
            }

            $packagePrice = (float)$package->price;
            
            // Calculate add-ons total
            $addonsTotal = 0;
            $addonsData = [];
            
            if ($request->has('addons') && is_array($request->addons)) {
                foreach ($request->addons as $addon) {
                    if (isset($addon['id']) && isset($addon['value']) && $addon['value'] > 0) {
                        // Use addon details from frontend if available, otherwise get from database
                        $addonPrice = isset($addon['price']) ? (float)$addon['price'] : null;
                        $addonType = isset($addon['type']) ? $addon['type'] : 'spinner';
                        
                        if (!$addonPrice) {
                            $addonDetails = $this->getAddonDetails($addon['id']);
                            if ($addonDetails) {
                                $addonPrice = $addonDetails['price'];
                                $addonType = $addonDetails['type'];
                            }
                        }
                        
                        if ($addonPrice) {
                            $quantity = (int)$addon['value'];
                            $addonTotal = $addonType === 'spinner' ? $addonPrice * $quantity : $addonPrice;
                            $addonsTotal += $addonTotal;
                            
                            $addonsData[] = [
                                'addon_id' => $addon['id'],
                                'quantity' => $quantity,
                                'price' => $addonPrice,
                                'total' => $addonTotal,
                                'type' => $addonType,
                                'option' => isset($addon['option']) ? $addon['option'] : null
                            ];
                        }
                    }
                }
            }
            
            $subtotal = $packagePrice + $addonsTotal;
            
            // Set defaults for payment fields if not provided
            $paymentType = $request->payment_type ?? 'deposit';
            $paymentMode = $request->payment_mode ?? 'Pending';
            
            $paidAmount = $paymentType === 'full' ? $subtotal : 200.00; // 200 for deposit
            $remainingBalance = $subtotal - $paidAmount;
            $paymentStatus = ($paymentMode !== 'Pending' && $paymentType === 'full') ? 1 : 0; // 1 = fully paid, 0 = pending
            
            // Determine booking status based on payment method
            $bookingStatus = 1; // 1 = pending approval (default for no payment)
            if ($paymentMode !== 'Pending') {
                $bookingStatus = 2; // 2 = confirmed (when payment is made)
            }

            // Parse the time slot to create start and end times
            $timeSlot = $request->time_slot;
            $startTime = $this->parseTimeSlot($timeSlot);
            $endTime = $this->addHourToTime($startTime); // Assuming 1-hour duration

                        // Get the next bookingID since auto-increment is not working
            $maxBookingId = DB::table('booking')->max('bookingID') ?? 0;
            $newBookingId = $maxBookingId + 1;

            // Prepare studio selection data
            $studioSelection = null;
            if ($request->has('studio_selection') && $request->studio_selection) {
                $studioSelection = json_encode($request->studio_selection);
            }

            // Create booking record (manually setting bookingID)
            DB::table('booking')->insert([
                'bookingID' => $newBookingId,
                'userID' => $userId,
                'packageID' => (int)$request->package_id,
                'customerName' => $request->name,
                'customerEmail' => $request->email,
                'customerAddress' => $request->address,
                'customerContactNo' => $request->contact,
                'bookingDate' => $request->booking_date,
                'bookingStartTime' => $startTime,
                'bookingEndTime' => $endTime,
                'subTotal' => $packagePrice,
                'total' => $subtotal,
                'receivedAmount' => $paidAmount,
                'rem' => $remainingBalance,
                'paymentMethod' => $paymentMode,
                'paymentStatus' => $paymentStatus,
                'status' => $bookingStatus, // Use calculated status: 1 = pending approval (no payment), 2 = confirmed (with payment)
                'date' => Carbon::now()->toDateString(),
                'studio_selection' => $studioSelection,
                'addons_total' => $addonsTotal
            ]);

            // Store add-ons data if any
            if (!empty($addonsData)) {
                foreach ($addonsData as $addon) {
                    DB::table('booking_addons')->insert([
                        'booking_id' => $newBookingId,
                        'addon_id' => $addon['addon_id'],
                        'quantity' => $addon['quantity'],
                        'price' => $addon['price'],
                        'total' => $addon['total'],
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now()
                    ]);
                }
            }

            $bookingId = $newBookingId;

            // Get the next transId since auto-increment might not be working
            $maxTransId = DB::table('transaction')->max('transId') ?? 0;
            $newTransId = $maxTransId + 1;

            // Create transaction record
            DB::table('transaction')->insert([
                'transId' => $newTransId,
                'bookingId' => $bookingId,
                'total' => $subtotal,
                'paymentStatus' => $paymentStatus,
                'date' => Carbon::now()->toDateString(),
                'receivedAmount' => $paidAmount,
                'paymentMethod' => $paymentMode,
                'rem' => $remainingBalance
            ]);

            DB::commit();

            // Create booking notification
            $bookingDetails = DB::table('booking')
                ->join('packages', 'booking.packageID', '=', 'packages.packageID')
                ->where('booking.bookingID', $bookingId)
                ->select(
                    'booking.bookingID',
                    'booking.bookingDate',
                    'booking.bookingStartTime',
                    'packages.name as packageName'
                )
                ->first();

            if ($bookingDetails) {
                // Format the booking date and time
                $bookingDate = \Carbon\Carbon::parse($bookingDetails->bookingDate)->format('F j, Y');
                $bookingTime = \Carbon\Carbon::parse($bookingDetails->bookingStartTime)->format('g:i A');
                
                // Create dynamic message
                $dynamicMessage = "Your booking for SFO#{$bookingDetails->bookingID} {$bookingDetails->packageName} has been confirmed for {$bookingDate} at {$bookingTime}.";

                // Create notification
                $notification = Notification::create([
                    'userID' => $userId,
                    'title' => 'Booking Confirmed',
                    'label' => 'Booking',
                    'message' => $dynamicMessage,
                    'time' => now(),
                    'starred' => 0,
                    'bookingID' => $bookingId,
                    'transID' => 0,
                ]);

                // Broadcast the event via Pusher
                broadcast(new BookingStatusUpdated($userId, $bookingId, $notification));
            }

            // Return booking details for the modal
            $booking = $this->getBookingDetails($bookingId);
            
            return response()->json([
                'success' => true,
                'message' => 'Booking created successfully',
                'booking' => $booking
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to create booking',
                'message' => $e->getMessage(),
                'debug' => [
                    'package_id' => $request->package_id,
                    'user_id' => Auth::id(),
                    'error_line' => $e->getLine(),
                    'error_file' => $e->getFile()
                ]
            ], 500);
        }
    }

    private function parseTimeSlot($timeSlot)
    {
        // Convert "09:00 AM" format to "09:00:00" format
        $time = \DateTime::createFromFormat('h:i A', $timeSlot);
        return $time ? $time->format('H:i:s') : '09:00:00';
    }

    private function addHourToTime($timeString)
    {
        // Add 1 hour to the start time
        $time = \DateTime::createFromFormat('H:i:s', $timeString);
        if ($time) {
            $time->add(new \DateInterval('PT1H'));
            return $time->format('H:i:s');
        }
        return '10:00:00';
    }

    public function getBookingDetails($bookingId)
    {
        $booking = DB::table('booking')
            ->join('packages', 'booking.packageID', '=', 'packages.packageID')
            ->select(
                'booking.bookingID as id',
                'booking.customerName',
                'booking.customerEmail as email',
                'booking.customerAddress as address',
                'booking.customerContactNo as contact',
                'packages.name as package',
                'booking.bookingDate',
                'booking.date as transactionDate',
                'booking.bookingStartTime as time',
                'booking.subTotal as subtotal',
                'booking.total',
                'booking.receivedAmount as paidAmount',
                'booking.rem as pendingBalance',
                'booking.status',
                'booking.paymentStatus',
                'booking.studio_selection',
                'booking.addons_total'
            )
            ->where('booking.bookingID', $bookingId)
            ->first();

        if (!$booking) {
            return null;
        }

        // Format time from 24-hour to 12-hour format
        $formattedTime = $this->formatTimeTo12Hour($booking->time);

        // Get booking addons
        $addons = DB::table('booking_addons')
            ->where('booking_id', $bookingId)
            ->get()
            ->toArray();

        // Convert to array and ensure proper data types
        return [
            'id' => (string)$booking->id,
            'customerName' => $booking->customerName,
            'email' => $booking->email,
            'address' => $booking->address,
            'contact' => $booking->contact,
            'package' => $booking->package,
            'bookingDate' => $booking->bookingDate,
            'transactionDate' => $booking->transactionDate,
            'time' => $formattedTime,
            'subtotal' => (float)$booking->subtotal,
            'total' => (float)$booking->total,
            'paidAmount' => (float)$booking->paidAmount,
            'pendingBalance' => (float)$booking->pendingBalance,
            'feedback' => '', // Default empty since column doesn't exist
            'rating' => 0,   // Default 0 since column doesn't exist
            'status' => (int)$booking->status,
            'paymentStatus' => (int)$booking->paymentStatus,
            'studio_selection' => $booking->studio_selection ? json_decode($booking->studio_selection, true) : null,
            'addons_total' => (float)($booking->addons_total ?? 0),
            'addons' => $addons
        ];
    }

    private function formatTimeTo12Hour($time24)
    {
        $time = \DateTime::createFromFormat('H:i:s', $time24);
        return $time ? $time->format('h:i A') : $time24;
    }

    public function getBookedTimeSlots(Request $request)
    {
        try {
            $date = $request->query('date');
            
            if (!$date) {
                return response()->json(['error' => 'Date parameter is required'], 400);
            }
            
            // Get all booked time slots for the given date
            $bookedSlots = DB::table('booking')
                ->where('bookingDate', $date)
                ->whereIn('status', [0, 2]) // 0 = pending, 2 = confirmed (exclude cancelled)
                ->pluck('bookingStartTime')
                ->map(function ($time) {
                    // Convert 24-hour format to 12-hour format
                    return $this->formatTimeTo12Hour($time);
                })
                ->toArray();
            
            return response()->json([
                'success' => true,
                'bookedSlots' => $bookedSlots
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch booked time slots',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function showBooking($id)
    {
        $booking = $this->getBookingDetails($id);
        
        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        return response()->json($booking);
    }

    private function getAddonDetails($addonId)
    {
        // Match the frontend addon mapping from select.tsx
        $addons = [
            'pax' => [
                'id' => 'pax',
                'label' => 'Addl pax',
                'price' => 129,
                'type' => 'spinner'
            ],
            'portrait' => [
                'id' => 'portrait', 
                'label' => 'Addl Portrait Picture',
                'price' => 49,
                'type' => 'spinner'
            ],
            'grid' => [
                'id' => 'grid',
                'label' => 'Addl Grid Picture',
                'price' => 69,
                'type' => 'spinner'
            ],
            'a4' => [
                'id' => 'a4',
                'label' => 'Addl A4 Picture',
                'price' => 129,
                'type' => 'spinner'
            ],
            'backdrop' => [
                'id' => 'backdrop',
                'label' => 'Addl Backdrop',
                'price' => 129,
                'type' => 'dropdown'
            ],
            'digital' => [
                'id' => 'digital',
                'label' => 'All digital copies',
                'price' => 199,
                'type' => 'checkbox'
            ],
            'extra5' => [
                'id' => 'extra5',
                'label' => 'Addl 5 mins',
                'price' => 129,
                'type' => 'checkbox'
            ]
        ];

        return $addons[$addonId] ?? null;
    }

    /**
     * Create PayMongo Checkout Session for booking payment
     */
    public function createPaymentCheckout(Request $request)
    {
        try {
            $bookingId = $request->booking_id;
            
            // Get booking details
            $booking = DB::table('booking')
                ->join('packages', 'booking.packageID', '=', 'packages.packageID')
                ->select('booking.*', 'packages.name as packageName', 'packages.price as package_price')
                ->where('booking.bookingID', $bookingId)
                ->first();

            if (!$booking) {
                return response()->json(['error' => 'Booking not found'], 404);
            }

            $paymentType = $request->payment_type ?? 'deposit';
            $amount = $paymentType === 'full' ? $booking->total : 200.00; // 200 for deposit
            
            // Convert to centavos (PayMongo expects amount in centavos)
            $amountInCentavos = (int)($amount * 100);
            
            // Create description
            $description = 'Selfiegram Booking Payment - ' . $booking->packageName;

            // Create Checkout Session using PayMongo API
            $checkoutSession = $this->createPayMongoCheckoutSession(
                $amountInCentavos,
                $description,
                [
                    'booking_id' => $bookingId,
                    'payment_type' => $paymentType,
                    'customer_name' => $booking->customerName,
                    'customer_email' => $booking->customerEmail
                ]
            );

            if ($checkoutSession['success']) {
                // INDUSTRY STANDARD: Save pending transaction BEFORE redirect
                $paymentSessionId = DB::table('payment_sessions')->insertGetId([
                    'booking_id' => $bookingId,
                    'checkout_session_id' => $checkoutSession['session_id'],
                    'amount' => $amount,
                    'payment_type' => $paymentType,
                    'status' => 'pending',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                \Log::info('Payment session created', [
                    'payment_session_id' => $paymentSessionId,
                    'booking_id' => $bookingId,
                    'checkout_session_id' => $checkoutSession['session_id'],
                    'amount' => $amount
                ]);

                return response()->json([
                    'success' => true,
                    'checkout_url' => $checkoutSession['checkout_url'],
                    'session_id' => $checkoutSession['session_id'],
                    'payment_session_id' => $paymentSessionId
                ]);
            } else {
                return response()->json([
                    'error' => 'Failed to create checkout session',
                    'message' => $checkoutSession['error']
                ], 400);
            }

        } catch (\Exception $e) {
            \Log::error('Checkout session creation failed', [
                'error' => $e->getMessage(),
                'booking_id' => $request->booking_id ?? 'unknown'
            ]);
            
            return response()->json([
                'error' => 'Checkout session creation failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Create PayMongo Checkout Session using REST API
     */
    private function createPayMongoCheckoutSession($amount, $description, $metadata = [])
    {
        try {
            $secretKey = env('PAYMONGO_SECRET_KEY');
            
            // Use frontend URL for success and cancel redirects
            $frontendUrl = env('FRONTEND_URL', env('APP_URL'));
            $cancelUrl = $frontendUrl . '/payment-cancelled';
            $successUrl = $frontendUrl . '/payment-success';
            
            // Log checkout session configuration
            \Log::info('PayMongo Checkout Session URLs', [
                'frontend_url' => $frontendUrl,
                'cancel_url' => $cancelUrl,
                'success_url' => $successUrl,
                'webhook_endpoint' => env('APP_URL') . '/api/paymongo/webhook'
            ]);
            
            $payload = [
                'data' => [
                    'attributes' => [
                        'send_email_receipt' => false,
                        'show_description' => false,
                        'show_line_items' => true,
                        'cancel_url' => $cancelUrl,
                        'success_url' => $successUrl,
                        'line_items' => [
                            [
                                'currency' => 'PHP',
                                'amount' => $amount,
                                'description' => $description,
                                'name' => 'Selfiegram Photo Package',
                                'quantity' => 1
                            ]
                        ],
                        'payment_method_types' => ['card', 'gcash', 'grab_pay', 'paymaya'],
                        'metadata' => $metadata
                    ]
                ]
            ];
            
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($secretKey . ':'),
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->post('https://api.paymongo.com/v1/checkout_sessions', $payload);
            
            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'checkout_url' => $data['data']['attributes']['checkout_url'],
                    'session_id' => $data['data']['id']
                ];
            } else {
                \Log::error('PayMongo Checkout Session Error:', $response->json());
                return [
                    'success' => false,
                    'error' => 'Checkout session creation failed: ' . $response->body()
                ];
            }
            
        } catch (\Exception $e) {
            \Log::error('PayMongo API Exception:', ['message' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
?>