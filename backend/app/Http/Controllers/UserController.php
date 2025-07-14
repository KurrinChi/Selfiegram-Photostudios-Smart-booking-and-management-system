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
                    'username' => $user->username,
                    'fname' => $user->fname,
                    'lname' => $user->lname,
                    'email' => $user->email,
                    'contactNo' => $user->contactNo,
                    //'birthdate' => $user->birthdate,
                    //'gender' => $user->gender,
                    //'photoUrl' => $user->photoUrl ?? null 
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => 'Server Error',
                    'message' => $e->getMessage()
                ], 500);
            }   
            return response()->json($user)->header('Access-Control-Allow-Origin', '*');

    }
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Validate fields (you can customize this)
        $validated = $request->validate([
            'fname' => 'nullable|string|max:255',
            'lname' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'contactNo' => 'nullable|string|max:20',
            //'birthdate' => 'nullable|date',
            //'gender' => 'nullable|string|in:Male,Female,Non-binary,Other',
        ]);

        // Update user info
        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

}
