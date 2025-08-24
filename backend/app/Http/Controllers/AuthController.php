<?php

    namespace App\Http\Controllers;

    use App\Models\User;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\Facades\Hash;

    class AuthController extends Controller
    {
        public function login(Request $request)
        {
            $email = $request->input('email');
            $password = $request->input('password');

            if (empty($email) || empty($password)) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Enter your Email and Password.'
                ], 400);
            }

            // Retrieve user by email
            $user = User::where('email', $email)->first();

            if ($user && Hash::check($password, $user->password)) {
                $token = $user->createToken('auth_token')->plainTextToken;

                return response()->json([
                    'status' => 'success',
                    'user' => $user,
                    'token' => $token
                ]);
            } else {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Invalid email or password'
                ], 401);
            }
        }


        public function register(Request $request){
            $registerFields = $request->validate([
                'username' => 'required|string|max:50|unique:users,username',
                'password' => 'required|string|min:8|confirmed',
                'fname' => 'required|string|max:255',
                'lname' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'address' => 'required|string|max:255',
                'contactNo' => 'required|string|max:20',
                'gender' => 'required|string|max:20',
                'birthday' => 'required|string|max:40'
            ]);

            // Hash the password
            $registerFields['password'] = bcrypt($registerFields['password']);

            // Create the user directly with provided fname and lname
            $user = User::create([
                'username' => $registerFields['username'],
                'password' => $registerFields['password'],
                'fname' => $registerFields['fname'],
                'lname' => $registerFields['lname'],
                'email' => $registerFields['email'],
                'address' => $registerFields['address'],
                'contactNo' => $registerFields['contactNo'],
                'usertype' => 'Customer',
                'status' => '0',
                'profilePicture' => '',
                'archive' => '1',
                'gender' => $registerFields['gender'],
                'birthday' => $registerFields['birthday']
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'User registered successfully!',
                'user' => $user
            ], 201);
        }

        public function logout(Request $request)
        {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Logged out successfully'
            ]);
        }

    }
