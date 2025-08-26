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

    // Just for testing
    Route::middleware('api')->get('/test', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'message' => 'API is working!',
        ]);
    });

    // Public routes (no login required)
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/check-username', function (Request $request) {
        $username = $request->query('username');
        $exists = DB::table('users')->where('username', $username)->exists();
        return response()->json(['exists' => $exists]);
    });
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
    });

    // Protected routes (user must be logged in) CUSTOMER
    Route::middleware(['auth:sanctum', 'role:Customer'])->group(function () {

        //Client Package
        Route::get('/packages', [PackageController::class, 'index']);
        Route::get('/packages/{id}', [PackageController::class, 'show']);

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
    });

    //receipt
    Route::get('/receipt/{id}', [ReceiptController::class, 'show']);

?>