<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\CreateStaff;

class UserController extends Controller
{
    public function users() {
        $users = User::select('userID', 'username', 'fname', 'lname', 'email', 'address', 'contactNo', 'userType', 'birthday', 'profilePicture', 'archive')->get();

        $users->transform(function ($user) {
            $user->name = $user->fname . ' ' . $user->lname;
            unset($user->fname, $user->lname);

            // AGE
            if ($user->birthday) {
                $birthDate = new \DateTime($user->birthday);
                $today = new \DateTime();
                $age = $today->diff($birthDate)->y;
                $user->age = $age;
            } else {
                $user->age = 0;
            }

            return $user;
        });

        return response()->json($users);
    }

    public function show($id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            return response()->json([
                'userID' => $user->userID,
                'username' => $user->username,
                'fname' => $user->fname,
                'lname' => $user->lname,
                'email' => $user->email,
                'address' => $user->address,
                'contactNo' => $user->contactNo,
                'birthday' => $user->birthday, // ✅ corrected from 'birthdate'
                'gender' => $user->gender,
                'profilePicture' => $user->profilePicture ?? null, // ✅ corrected key
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server Error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'fname' => 'nullable|string|max:255',
            'lname' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'contactNo' => 'nullable|string|max:20',
            'birthday' => 'nullable|date', 
            'gender' => 'nullable|string|in:Male,Female,Prefer not to say',
        ]);

        $user->update($validated);

      
      if ($request->hasFile('photo')) {
        try {
            $file = $request->file('photo');
            $filename = time() . '_' . $file->getClientOriginalName();

            \Log::info('Original file name: ' . $file->getClientOriginalName());
            \Log::info('Storing as: ' . $filename);

            
            $path = $file->storeAs('profile_photos', $filename, 'public');

            if (!$path) {
                \Log::error('File storage failed');
            }

            \Log::info('File stored at: ' . $path);

            $user->profilePicture = asset('storage/profile_photos/' . $filename);
            $user->save();

            } catch (\Exception $e) {
                \Log::error('Photo upload error: ' . $e->getMessage());
            }
        }

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $user,
            ]);
    }

    public function createUser(Request $request)
    {
        $profile = $request->validate([
            'username'   => 'required|string|max:50|unique:users,username',
            'fname'      => 'required|string|max:255',
            'lname'      => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email',
            'address'    => 'required|string|max:255',
            'contactNo'  => ['required','regex:/^09\d{9}$/'],
            'gender'     => 'required|string|max:20',
            'birthday'   => 'required|string|max:40'
        ]);

        // Generate random password for new users
        $randomPassword = Str::random(10);

        $user = User::create([
            'username'           => $profile['username'],
            'password'           => bcrypt($randomPassword),
            'fname'              => $profile['fname'],
            'lname'              => $profile['lname'],
            'email'              => $profile['email'],
            'address'            => $profile['address'],
            'contactNo'          => $profile['contactNo'],
            'usertype'           => 'Staff',
            'status'             => '0',
            'profilePicture'     => url('/storage/profile_photos/DefaultImage.png'),
            'archive'            => '1',
            'gender'             => $profile['gender'],
            'birthday'           => $profile['birthday'],
            'email_verification' => Str::random(64),
        ]);

        try {
            Mail::to($user->email)->send(new CreateStaff($user, $randomPassword));
        } catch (\Exception $e) {
            \Log::error('Email sending failed: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'User created successfully',
            'user'    => $user
        ]);
    }

    public function archiveUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Toggle archive: 0 = active, 1 = archived
        $user->archive = $user->archive == 1 ? 0 : 1;
        $user->save();

        $status = $user->archive == 1 ? 'archived' : 'unarchived';

        return response()->json([
            'message' => "User {$status} successfully",
            'archive' => $user->archive
        ]);
    }


}
