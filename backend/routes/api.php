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

    // Just for testing
    Route::middleware('api')->get('/test', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'message' => 'API is working!',
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
        Route::post('/admin/packages/{id}/archive', [PackageController::class, 'archivePackage']);
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

        //Client Booking/Transaction
        Route::post('/bookings', [TransactionController::class, 'createBooking']);
        Route::get('/bookings/{id}', [TransactionController::class, 'showBooking']);
        Route::get('/booked-slots', [TransactionController::class, 'getBookedTimeSlots']);
    });

    //receipt
    Route::get('/receipt/{id}', [ReceiptController::class, 'show']);

?>