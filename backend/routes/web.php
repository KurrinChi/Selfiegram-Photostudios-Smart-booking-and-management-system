<?php

use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/db-test', function () {
    try {
        DB::connection()->getPdo();
        return 'Database connection successful!';
    } catch (\Exception $e) {
        return 'Could not connect to the database. Error: ' . $e->getMessage();
    }
});

Route::get('/test-upload', function () {
    $contents = 'Test File';
    $filename = 'test.txt';

    $stored = Storage::disk('public')->put('profile_photos/' . $filename, $contents);

    return $stored ? 'Stored successfully' : 'Failed to store';
});


use Illuminate\Support\Facades\Mail;
use App\Mail\ForgotPassword;
use App\Models\User;

//test
Route::get('/test-mail', function () {
    $otp = 1234;

    // Example: get a user (replace with actual logged-in user if needed)
    $user = User::first();

    Mail::to('demoprojectsystemuse@gmail.com')->send(new ForgotPassword($otp, $user));

    return 'Mail sent!';
});
