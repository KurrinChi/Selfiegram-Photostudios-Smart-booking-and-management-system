<?php

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Route;
    use App\Http\Controllers\AuthController;
    use App\Http\Controllers\UserController;
    use App\Http\Controllers\DashboardController;
    use App\Http\Controllers\PackageController;
    use App\Http\Controllers\FavoriteController;
    use App\Http\Controllers\SalesController;
    use App\Http\Controllers\HistoryController;
    use App\Http\Controllers\AppointmentController;
    use App\Http\Controllers\ReceiptController;
    use App\Http\Controllers\HomeController;
    use App\Http\Controllers\TransactionController;
    use App\Http\Controllers\ForgotPasswordController;
    use App\Http\Controllers\BookingRequestController;
    use App\Http\Controllers\GalleryController;
    use App\Http\Controllers\NotificationController;
    use App\Http\Controllers\PayMongoController;
    use App\Http\Controllers\PayMongoWebhookController;
    use App\Http\Controllers\TestPayMongoController;
    use App\Http\Controllers\ImageController;
    use App\Http\Controllers\PackageAddOnController;
    use App\Http\Controllers\MessageController; // Message (contact/chat) controller
    use App\Http\Controllers\SupportReplyController;
    
    // Testing routes
    Route::middleware('api')->get('/test', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'message' => 'API is working!',
        ]);
    });
    
    Route::middleware('api')->get('/test-trend-debug', function () {
        $currentWeekStart = \Carbon\Carbon::now()->startOfWeek();
        $currentWeekEnd = \Carbon\Carbon::now()->endOfWeek();
        $lastWeekStart = \Carbon\Carbon::now()->subWeek()->startOfWeek();
        $lastWeekEnd = \Carbon\Carbon::now()->subWeek()->endOfWeek();
        
        // Get booking dates for current week
        $currentBookings = \DB::table('booking')
            ->join('transaction', 'booking.bookingID', '=', 'transaction.bookingId')
            ->join('packages', 'booking.packageID', '=', 'packages.packageID')
            ->where('transaction.paymentStatus', 1)
            ->whereBetween('booking.date', [$currentWeekStart, $currentWeekEnd])
            ->select('packages.name', 'booking.date', 'booking.bookingID')
            ->get();
        
        // Get booking dates for last week
        $lastBookings = \DB::table('booking')
            ->join('transaction', 'booking.bookingID', '=', 'transaction.bookingId')
            ->join('packages', 'booking.packageID', '=', 'packages.packageID')
            ->where('transaction.paymentStatus', 1)
            ->whereBetween('booking.date', [$lastWeekStart, $lastWeekEnd])
            ->select('packages.name', 'booking.date', 'booking.bookingID')
            ->get();
        
        return response()->json([
            'today' => \Carbon\Carbon::now()->toDateString(),
            'current_week' => [
                'start' => $currentWeekStart->toDateString(),
                'end' => $currentWeekEnd->toDateString(),
                'count' => $currentBookings->count(),
                'bookings' => $currentBookings
            ],
            'last_week' => [
                'start' => $lastWeekStart->toDateString(),
                'end' => $lastWeekEnd->toDateString(),
                'count' => $lastBookings->count(),
                'bookings' => $lastBookings
            ]
        ]);
    });
    
    // Test PayMongo payment method extraction (for testing purposes)
    Route::get('/test-paymongo-webhook', [TestPayMongoController::class, 'testWebhook']);
    
    // TEST ROUTE: Simulate PayMongo webhook payment completion (for local testing)
    Route::get('/test-complete-payment', function (Request $request) {
        $sessionId = $request->query('session_id');
        
        if (!$sessionId) {
            return response()->json(['error' => 'session_id required'], 400);
        }
        
        // Find payment session
        $paymentSession = \DB::table('payment_sessions')
            ->where('checkout_session_id', $sessionId)
            ->first();
            
        if (!$paymentSession) {
            return response()->json(['error' => 'Payment session not found'], 404);
        }
        
        if ($paymentSession->status === 'completed') {
            return response()->json(['message' => 'Already completed', 'booking_id' => $paymentSession->booking_id], 200);
        }
        
        // Simulate webhook payload
        $testPayload = [
            'data' => [
                'attributes' => [
                    'type' => 'checkout_session.payment.paid',
                    'data' => [
                        'id' => $sessionId,
                        'attributes' => [
                            'payment_intent' => [
                                'id' => 'pi_test_' . uniqid(),
                                'attributes' => [
                                    'payment_method' => [
                                        'type' => 'card'
                                    ]
                                ]
                            ],
                            'line_items' => [
                                [
                                    'amount' => $paymentSession->amount * 100 // Convert to centavos
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];
        
        // Call webhook handler
        $webhookController = new \App\Http\Controllers\PayMongoWebhookController();
        $webhookRequest = \Illuminate\Http\Request::create('/api/paymongo/webhook', 'POST', $testPayload);
        $response = $webhookController->handleWebhook($webhookRequest);
        
        // Get updated booking
        $booking = \DB::table('booking')->where('bookingID', $paymentSession->booking_id)->first();
        $transaction = \DB::table('transaction')->where('bookingId', $paymentSession->booking_id)->first();
        
        return response()->json([
            'message' => 'Payment simulated successfully!',
            'session_id' => $sessionId,
            'booking_id' => $paymentSession->booking_id,
            'amount_paid' => $paymentSession->amount,
            'booking' => [
                'receivedAmount' => $booking->receivedAmount ?? null,
                'rem' => $booking->rem ?? null,
                'paymentStatus' => $booking->paymentStatus ?? null,
                'status' => $booking->status ?? null
            ],
            'transaction' => [
                'receivedAmount' => $transaction->receivedAmount ?? null,
                'rem' => $transaction->rem ?? null,
                'paymentStatus' => $transaction->paymentStatus ?? null
            ]
        ]);
    });

    // Test auth without role
    Route::middleware(['auth:sanctum'])->get('/test-auth', function (Request $request) {
        $user = auth('sanctum')->user();
        return response()->json([
            'status' => 'success',
            'message' => 'Authentication working!',
            'user' => $user ? $user->username : 'No user',
            'user_type' => $user ? $user->userType : 'No type',
            'user_id' => $user ? $user->userID : 'No ID',
        ]);
    });

    // Simple log test endpoint
    Route::get('/test-logs', function () {
        \Log::info('Test log entry from /test-logs endpoint');
        return response()->json(['message' => 'Log test completed']);
    });

    // Test broadcasting auth specifically
    Route::middleware(['auth:sanctum'])->post('/test-broadcasting-auth', function (Request $request) {
        try {
            $user = auth('sanctum')->user();
            if (!$user) {
                return response()->json(['error' => 'No authenticated user'], 401);
            }

            $channelName = $request->input('channel_name');
            $socketId = $request->input('socket_id');

            \Log::info('Broadcasting auth test', [
                'user_id' => $user->userID,
                'channel' => $channelName,
                'socket_id' => $socketId,
                'user_type' => $user->userType
            ]);

            // Check if the channel matches the user pattern
            if (preg_match('/^private-user\.(\d+)$/', $channelName, $matches)) {
                $requestedUserId = (int)$matches[1];
                $authorized = (int)$user->userID === $requestedUserId;

                return response()->json([
                    'authenticated' => true,
                    'user_id' => $user->userID,
                    'requested_user_id' => $requestedUserId,
                    'authorized' => $authorized,
                    'channel' => $channelName,
                    'socket_id' => $socketId
                ]);
            }

            return response()->json([
                'authenticated' => true,
                'user_id' => $user->userID,
                'channel' => $channelName,
                'socket_id' => $socketId,
                'note' => 'Channel pattern does not match private-user.{id}'
            ]);

        } catch (\Exception $e) {
            \Log::error('Broadcasting auth test error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Main broadcasting auth route for Pusher (moved from web.php to avoid CSRF issues)
    Route::middleware(['auth:sanctum'])->post('/broadcasting/auth', function (Request $request) {
        try {
            // Log incoming request details
            \Log::info('Broadcasting auth request received', [
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'headers' => $request->headers->all(),
                'body' => $request->all(),
                'user_authenticated' => auth('sanctum')->check(),
                'user_id' => auth('sanctum')->user() ? auth('sanctum')->user()->userID : null
            ]);

            // Check if user is authenticated
            $user = $request->user();
            if (!$user) {
                \Log::warning('Broadcasting auth failed: No authenticated user');
                return response()->json(['error' => 'Unauthenticated'], 401);
            }
            
            $channelName = $request->input('channel_name');
            $socketId = $request->input('socket_id');
            
            // Log the auth attempt
            \Log::info('Broadcasting auth attempt', [
                'user_id' => $user->userID,
                'channel' => $channelName,
                'socket_id' => $socketId
            ]);

            // Manual channel authorization for private-user.{id} channels
            if (preg_match('/^private-user\.(\d+)$/', $channelName, $matches)) {
                $requestedUserId = (int)$matches[1];
                $authorized = (int)$user->userID === $requestedUserId;
                if ($authorized) {
                    $authKey = config('broadcasting.connections.pusher.key');
                    $authSecret = config('broadcasting.connections.pusher.secret');
                    $stringToSign = $socketId . ':' . $channelName;
                    $signature = hash_hmac('sha256', $stringToSign, $authSecret);
                    $authString = $authKey . ':' . $signature;
                    \Log::info('Broadcasting auth successful (user channel)', [
                        'user_id' => $user->userID,
                        'channel' => $channelName,
                    ]);
                    return response()->json(['auth' => $authString]);
                }
                \Log::warning('Broadcasting auth failed: User not authorized for channel', [
                    'user_id' => $user->userID,
                    'requested_user_id' => $requestedUserId,
                    'channel' => $channelName
                ]);
                return response()->json(['error' => 'Unauthorized for this channel'], 403);
            }

            // Private admin messages channel authorization
            if ($channelName === 'private-admin.messages') {
                $role = strtolower($user->usertype ?? $user->userType ?? '');
                if (in_array($role, ['admin', 'staff'])) {
                    $authKey = config('broadcasting.connections.pusher.key');
                    $authSecret = config('broadcasting.connections.pusher.secret');
                    $stringToSign = $socketId . ':' . $channelName;
                    $signature = hash_hmac('sha256', $stringToSign, $authSecret);
                    $authString = $authKey . ':' . $signature;
                    \Log::info('Broadcasting auth successful (admin channel)', [
                        'user_id' => $user->userID,
                        'channel' => $channelName,
                    ]);
                    return response()->json(['auth' => $authString]);
                }
                \Log::warning('Broadcasting auth failed: Non-admin tried admin channel', [
                    'user_id' => $user->userID,
                    'channel' => $channelName
                ]);
                return response()->json(['error' => 'Unauthorized for this channel'], 403);
            }
            
            \Log::warning('Broadcasting auth failed: Unknown channel pattern', [
                'channel' => $channelName
            ]);
            return response()->json(['error' => 'Unknown channel pattern'], 403);
            
        } catch (\Exception $e) {
            \Log::error('Broadcasting auth error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json(['error' => 'Auth failed: ' . $e->getMessage()], 403);
        }
    });

    // Test report data endpoint with minimal data
    Route::middleware(['auth:sanctum', 'role:Admin'])->get('/test-report', function (Request $request) {
        return response()->json([
            'summary' => [
                'totalUsers' => 100,
                'totalBookings' => 50,
                'totalSales' => 25000,
                'totalAppointments' => 75,
                'hasDateRange' => false,
                'salesTrend' => ['value' => '10%', 'up' => true],
                'userTrend' => ['value' => '5%', 'up' => true],
                'scheduleTrend' => ['value' => '15%', 'up' => true],
                'appointmentsTrend' => ['value' => '8%', 'up' => true]
            ],
            'weeklyIncome' => [],
            'packages' => [],
            'companyInfo' => [
                'name' => 'Selfiegram Photo Studios',
                'address' => 'Test Address',
                'phone' => '123-456-7890',
                'email' => 'test@selfiegram.com'
            ]
        ]);
    });

    // Debug route for testing booking creation
    Route::middleware(['auth:sanctum'])->post('/test-booking', function (Request $request) {
        $user = auth('sanctum')->user();
        return response()->json([
            'user' => $user,
            'user_type' => $user ? $user->userType : null,
            'request_data' => $request->all(),
            'headers' => $request->headers->all()
        ]);
    });

    // Debug route WITHOUT auth to test basic connectivity
    Route::post('/test-booking-no-auth', function (Request $request) {
        return response()->json([
            'message' => 'Test booking endpoint (no auth) reached successfully',
            'method' => $request->method(),
            'data' => $request->all()
        ]);
    });

    // Test CORS preflight for bookings
    Route::match(['options', 'post'], '/bookings-cors-test', function (Request $request) {
        if ($request->isMethod('options')) {
            return response()->json(['message' => 'CORS preflight successful']);
        }
        return response()->json([
            'message' => 'POST request successful',
            'method' => $request->method(),
            'data' => $request->all()
        ]);
    });

    // Public routes (no login required)
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/verify-email/{token}', [AuthController::class, 'verifyEmail']);
    Route::get('/check-username', function (Request $request) {
        $username = $request->query('username');
        $exists = DB::table('users')->where('username', $username)->exists();
        return response()->json(['exists' => $exists]);
    });
    Route::post('/forgot-password', [ForgotPasswordController::class, 'forgotPassword']);
    Route::post('/verify-otp', [ForgotPasswordController::class, 'verifyOtp']);
    Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);

    //logout
    Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
    
    //user profile settings
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
    });

    // Protected routes (user must be logged in) ADMIN and STAFF same access
    Route::middleware(['auth:sanctum', 'role:Admin,Staff'])->group(function () {

        //admin user management
        Route::get('/admin/users', [UserController::class, 'users']);
        Route::get('/user-appointments/{userId}', [AppointmentController::class, 'getAppointmentsByUser']);
        Route::post('/admin/users/{id}/archive', [UserController::class, 'archiveUser']);
        Route::post('admin/users/create', [UserController::class, 'createUser']);

        //admin dashboard
        Route::get('/admin/summary', [DashboardController::class, 'getSummary']);
        Route::get('/admin/gross-income-weekly',  [DashboardController::class, 'getWeeklyGrossIncome']);
        Route::get('/admin/packages', [DashboardController::class, 'getPackageDetails']);
        Route::get('/admin/report-data', [DashboardController::class, 'getReportData']);

        //admin sales
        Route::get('/sales', [SalesController::class, 'getSales']);

        //admin appointments
        Route::get('/appointments', [AppointmentController::class, 'getAllAppointments']);
        Route::post('/appointments/cancel', [AppointmentController::class, 'cancelAppointment']);
        Route::post('/appointments/reschedule', [AppointmentController::class, 'rescheduleAppointment']);
        Route::post('/appointments/completed', [AppointmentController::class, 'markAsCompleted']);
        Route::get('/appointments/taken-times', [TransactionController::class, 'getBookedTimeSlots']);

        //admin booking requests
        Route::get('/admin/booking-requests', [BookingRequestController::class, 'adminGetAllRequests']);
        Route::post('/admin/booking-requests/{id}/confirm-reschedule', [BookingRequestController::class, 'confirmReschedule']);
        Route::post('/admin/booking-requests/{id}/confirm-cancellation', [BookingRequestController::class, 'confirmCancellation']);
        Route::post('/admin/booking-requests/{id}/decline-request', [BookingRequestController::class, 'decline']);

        // admin support reply -> creates notification + pushes via pusher
        Route::post('/admin/support-replies', [SupportReplyController::class, 'store']);
        // system broadcast notifications
        Route::post('/admin/notifications/broadcast', [NotificationController::class, 'broadcastSystem']);

        //admin package management
        Route::get('/admin/packages-all', [PackageController::class, 'adminShowAll']);
        Route::get('/admin/packages/{id}', [PackageController::class, 'adminShow']);
        Route::get('/admin/package-types', [PackageController::class, 'packageType']);
        Route::get('/admin/addons', [PackageController::class, 'getAllAddOns']);
        Route::get('/admin/package-sets', [PackageController::class, 'getAllBackgrounds']);
        Route::post('/admin/packages/{id}/archive', [PackageController::class, 'archivePackage']);
        Route::post('/admin/update-package/{id}', [PackageController::class, 'updatePackage']);
        Route::post('/admin/add-package', [PackageController::class, 'addPackage']);

        //admin edit extras
        Route::post('/admin/package-add-ons/add', [PackageAddOnController::class, 'store']);
        Route::put('/admin/package-add-ons/{id}', [PackageAddOnController::class, 'update']);
        Route::delete('/admin/package-add-ons/{id}/delete', [PackageAddOnController::class, 'destroy']);
        Route::get('/admin/package-add-ons', [PackageAddOnController::class, 'index']);


        //admin gallery page
        Route::get('/admin/completed-appointments', [GalleryController::class, 'completedAppointments']);
        Route::post('/admin/upload', [GalleryController::class, 'uploadImage']);
        Route::get('/admin/images/{userID}/{packageID}/{bookingID}', [GalleryController::class, 'getImagesByUser']);
        Route::delete('/admin/images/delete', [GalleryController::class, 'deleteImages']);
        Route::post('/admin/images/confirm', [GalleryController::class, 'confirmImages']);
    });

    Route::middleware(['auth:sanctum', 'role:Staff'])->group(function () { //staff only
        
        //Staff Package
        Route::get('/staff/packages', [PackageController::class, 'index']);
        Route::get('/staff/packages/{id}', [PackageController::class, 'show']);
        Route::get('/staff/packages/{id}/set-concepts', [PackageController::class, 'getPackageSetAndConcepts']);
        Route::get('/staff/packages/{id}/addons', [PackageController::class, 'getAddOns']);
    });

    

    // Protected routes (user must be logged in) CUSTOMER
    Route::middleware(['auth:sanctum', 'role:Customer'])->group(function () {

        //Client Package
        Route::get('/packages', [PackageController::class, 'index']);
        Route::get('/packages/{id}', [PackageController::class, 'show']);
        Route::get('/packages/{id}/set-concepts', [PackageController::class, 'getPackageSetAndConcepts']);
        Route::get('/packages/{id}/addons', [PackageController::class, 'getAddOns']);



        //Client Favorite Page
        Route::post('/favorites/add', [FavoriteController::class, 'add']);
        Route::post('/favorites/remove', [FavoriteController::class, 'remove']);
        Route::post('/favorites/remove', [FavoriteController::class, 'removeFavorite']);
        Route::get('/favorites/{userID}', [FavoriteController::class, 'getByUser']);
        Route::get('/favorites/{userID}', [FavoriteController::class, 'getFavoritesWithPackages']);
        Route::get('/favorites/user/{id}', [FavoriteController::class, 'getFavorites']);

        //Client History Page
        Route::get('/booking/history/{userID}', [HistoryController::class, 'getHistory']);
        Route::delete('/booking/{id}', [HistoryController::class, 'deleteBooking']);
        Route::get('/booking/{id}', [HistoryController::class, 'getTransactionDetails']);
        Route::put('/booking/{id}', [HistoryController::class, 'updateFeedback']);

        //Client Appointment Page
        Route::get('/appointments/{userID}', [AppointmentController::class, 'getAppointments']);

        //Client Unavailable Dates (for booking/rescheduling)
        Route::get('/unavailable-dates', [AppointmentController::class, 'getUnavailableDates']);

        //Client Home Page
        Route::get('/top-selling-packages', [HomeController::class, 'getTopSellingPackages']);
        Route::get('/feedbacks', [HomeController::class, 'getFeedbacks']);

        //Client Booking/Transaction (moved out of Customer role temporarily)
        Route::get('/bookings/{id}', [TransactionController::class, 'showBooking']);
        Route::get('/booked-slots', [TransactionController::class, 'getBookedTimeSlots']);
    });

    // Original booking creation with conditional auth (allows OPTIONS, requires auth for POST)
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/bookings', [TransactionController::class, 'createBooking']); // OLD: Should not be used for PayMongo payments
        Route::post('/payment/checkout', [TransactionController::class, 'createPaymentCheckout']); // For EXISTING bookings (appointments)
        Route::post('/payment/checkout-new-booking', [TransactionController::class, 'createPaymentCheckoutNewBooking']); // For NEW bookings

        //Client Cancel and Reschedule Request
        Route::post('/booking-request/cancel', [BookingRequestController::class, 'storeCancelRequest']);
        Route::get('/cancel-request/{bookingID}', [BookingRequestController::class, 'getCancelRequest']);

         //Client Reschedule Request
        Route::post('/reschedule', [BookingRequestController::class, 'createRescheduleRequest']);
       //Route::post('/reschedule', [BookingRequestController::class, 'rescheduleBooking']);
        Route::post('/booking-request/reschedule', [BookingRequestController::class, 'rescheduleBooking']);
        Route::get('/reschedule-request/{bookingId}', [BookingRequestController::class, 'getRescheduleRequest']);

        //Client Notification
        Route::get('/notifications/{userID}', [NotificationController::class, 'getUserNotifications']);
          Route::get('/booking-details', [NotificationController::class, 'getBookingDetails']);
          Route::get('/reschedule-details', [NotificationController::class, 'getRescheduleDetails']);
          Route::post('/notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead']);
                    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

        //Client Gallery Page
        Route::get('/user-images/{userID}', [ImageController::class, 'getUserImages']);
        Route::post('/user-images/favorite/{imageID}', [ImageController::class, 'toggleFavorite']);
       
    });

    //receipt
    Route::get('/receipt/{id}', [ReceiptController::class, 'show']);
     Route::get('/image-url/{imageID}', [ImageController::class, 'getImageUrl']);
        Route::get('/proxy-image', [ImageController::class, 'proxyImage']);

    // PayMongo payment routes  
    Route::post('/payment/create-checkout', [PayMongoController::class, 'createCheckoutSession']);
    Route::post('/payment/success', [PayMongoController::class, 'handlePaymentSuccess']);
    Route::get('/payment/history/{bookingId}', [PayMongoController::class, 'getPaymentHistory']);

    // Contact / Messages (chat widget submissions)
    // Logged-in users submit messages
    Route::middleware(['auth:sanctum'])->post('/messages', [MessageController::class, 'store']);
    // Admin manage messages
    Route::middleware(['auth:sanctum','role:Admin,Staff'])->group(function () {
        Route::get('/messages', [MessageController::class, 'index']);
        Route::post('/messages/{id}/status', [MessageController::class, 'updateStatus']);
        Route::post('/messages/{id}/starred', [MessageController::class, 'updateStarred']);
        Route::post('/messages/{id}/archived', [MessageController::class, 'updateArchived']);
        Route::delete('/messages/trash/empty', [MessageController::class, 'emptyTrash']);
    });

    // PayMongo Webhook (no auth required)
    Route::post('/paymongo/webhook', [PayMongoWebhookController::class, 'handleWebhook']);
?>