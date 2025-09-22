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
    // Just for testing
    Route::middleware('api')->get('/test', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'message' => 'API is working!',
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
        ]);
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

    // Protected routes (user must be logged in) ADMIN
    Route::middleware(['auth:sanctum', 'role:Admin'])->group(function () {

        //admin user management
        Route::get('/admin/users', [UserController::class, 'users']);
        Route::get('/user-appointments/{userId}', [AppointmentController::class, 'getAppointmentsByUser']);

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

        //admin package management
        Route::get('/admin/packages-all', [PackageController::class, 'adminShowAll']);
        Route::get('/admin/packages/{id}', [PackageController::class, 'adminShow']);
        Route::get('/admin/package-types', [PackageController::class, 'packageType']);
        Route::get('/admin/addons', [PackageController::class, 'getAllAddOns']);
        Route::get('/admin/package-sets', [PackageController::class, 'getAllBackgrounds']);
        Route::post('/admin/packages/{id}/archive', [PackageController::class, 'archivePackage']);
        Route::post('/admin/update-package/{id}', [PackageController::class, 'updatePackage']);

        //admin gallery page
        Route::get('/admin/completed-appointments', [GalleryController::class, 'completedAppointments']);
        Route::post('/admin/upload', [GalleryController::class, 'uploadImage']);
        Route::get('/admin/images/{userID}', [GalleryController::class, 'getImagesByUser']);
        Route::delete('/admin/images/delete', [GalleryController::class, 'deleteImages']);
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

        //Client Home Page
        Route::get('/top-selling-packages', [HomeController::class, 'getTopSellingPackages']);
        Route::get('/feedbacks', [HomeController::class, 'getFeedbacks']);

        //Client Booking/Transaction
        Route::post('/bookings', [TransactionController::class, 'createBooking']);
        Route::get('/bookings/{id}', [TransactionController::class, 'showBooking']);
        Route::get('/booked-slots', [TransactionController::class, 'getBookedTimeSlots']);


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
    });

    //receipt
    Route::get('/receipt/{id}', [ReceiptController::class, 'show']);

?>