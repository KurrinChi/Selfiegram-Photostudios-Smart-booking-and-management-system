<?php

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Route;
    use App\Http\Controllers\AuthController;
    use App\Http\Controllers\UserController;
    use App\Http\Controllers\DashboardController;
    use App\Http\Controllers\PackageController;
    use App\Http\Controllers\FavoriteController;
    use App\Http\Controllers\SalesController;
    use App\Http\Controllers\AppointmentController;
    

    //for api testing to see if it worksss
    Route::middleware('api')->get('/test', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'message' => 'API is working!',
        ]);
    });

    //user profile
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);


    //login and register
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    //admin user management
    Route::get('/users', [UserController::class, 'users']);
    Route::get('/user-appointments/{userId}', [AppointmentController::class, 'getAppointmentsByUser']);

    //admin dashboard
    Route::get('/admin/summary', [DashboardController::class, 'getSummary']);

    //admin sales
    Route::get('/sales', [SalesController::class, 'getSales']);

    //admin apointments calendar
    Route::get('/appointments', [AppointmentController::class, 'getAllAppointments']);

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

    //Client Header
    Route::get('/user/{id}', [UserController::class, 'show']);

    //Update Client User Profile
   Route::put('/user/{id}', [UserController::class, 'update']);
