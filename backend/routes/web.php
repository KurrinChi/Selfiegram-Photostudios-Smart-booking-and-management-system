<?php

use Illuminate\Support\Facades\Route;

use Illuminate\Support\Facades\DB;

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