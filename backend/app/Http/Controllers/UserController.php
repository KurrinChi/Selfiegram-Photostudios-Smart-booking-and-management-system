<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    
    public function users(){
        $users = User::select('userID', 'username', 'fname', 'lname', 'email', 'address', 'contactNo', 'userType')->get();
        
        // Optionally merge fname + lname into 'name'
        $users->transform(function ($user) {
            $user->name = $user->fname . ' ' . $user->lname;
            unset($user->fname, $user->lname);
            return $user;
        });

        return response()->json($users);
    }
    public function show($id)
    {
        try {
                $user = User::find($id); // Now uses `userID` instead of `id`

                if (!$user) {
                    return response()->json(['message' => 'User not found'], 404);
                }

                return response()->json([
                    'userID' => $user->userID,
                    'username' => $user->username, // change if needed
                    'email' => $user->email
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => 'Server Error',
                    'message' => $e->getMessage()
                ], 500);
            }   
            return response()->json($user)->header('Access-Control-Allow-Origin', '*');

    }
}
