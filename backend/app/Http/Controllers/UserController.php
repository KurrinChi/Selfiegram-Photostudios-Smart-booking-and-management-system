<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function users(){
        $users = User::select('userID', 'username', 'fname', 'lname', 'email', 'userType')->get();
        
        // Optionally merge fname + lname into 'name'
        $users->transform(function ($user) {
            $user->name = $user->fname . ' ' . $user->lname;
            unset($user->fname, $user->lname);
            return $user;
        });

        return response()->json($users);
    }
}
