<?php

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Route;
    use App\Http\Controllers\AuthController;
    use App\Http\Controllers\UserController;
    use App\Http\Controllers\DashboardController;
    use App\Http\Controllers\PackageController;

    Route::get('/users', [UserController::class, 'users']);


    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('api')->get('/test', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'message' => 'API is working!',
        ]);
    });

    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/packages', [PackageController::class, 'index']);
    Route::get('/packages/{id}', [PackageController::class, 'show']);
    Route::get('/admin/summary', [DashboardController::class, 'getSummary']);