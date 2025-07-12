<?php

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Route;
    use App\Http\Controllers\AuthController;
    use App\Http\Controllers\UserController;
    use App\Http\Controllers\DashboardController;
    use App\Http\Controllers\PackageController;
    use App\Http\Controllers\FavoriteController;

    Route::get('/users', [UserController::class, 'users']);


    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('api')->get('/test', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'message' => 'API is working!',
        ]);
    });

    Route::post('/register', [AuthController::class, 'register']);
    //Client Package
    Route::get('/packages', [PackageController::class, 'index']);
    Route::get('/packages/{id}', [PackageController::class, 'show']);


    Route::get('/admin/summary', [DashboardController::class, 'getSummary']);

    //Client Favorite Page
    Route::post('/favorites/add', [FavoriteController::class, 'add']);
    Route::post('/favorites/remove', [FavoriteController::class, 'remove']);
      Route::post('/favorites/remove', [FavoriteController::class, 'removeFavorite']);
    Route::get('/favorites/{userID}', [FavoriteController::class, 'getByUser']);
    Route::get('/favorites/{userID}', [FavoriteController::class, 'getFavoritesWithPackages']);
    Route::get('/favorites/user/{id}', [FavoriteController::class, 'getFavorites']);

    //Client Header
    Route::get('/user/{id}', [UserController::class, 'show']);
