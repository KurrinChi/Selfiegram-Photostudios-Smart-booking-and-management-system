<?php

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Route;
    use App\Http\Controllers\AuthController;
    use App\Http\Controllers\UserController;

    Route::get('/users', [UserController::class, 'users']);


    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('api')->get('/test', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'message' => 'API is working!',
        ]);
    });

    Route::post('/register', [AuthController::class, 'register']);
