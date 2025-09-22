<?php

    namespace App\Http\Controllers;

    use App\Models\User;
    use App\Models\Notification;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\Facades\Hash;
    use Illuminate\Support\Str;
    use Illuminate\Support\Facades\Mail;
    use App\Mail\VerifyEmail;

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

            if (!$user) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Invalid email or password'
                ], 401);
            }


            if ($user->email_verification !== null) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Please verify your email before logging in.'
                ], 400);
            }
            if ($user->archive === 0) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Your account is inactive. Please contact support.'
                ], 403);
            }

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

            $registerFields['password'] = bcrypt($registerFields['password']);

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
                'birthday' => $registerFields['birthday'],
                'email_verification' => Str::random(64), 
            ]);

            Mail::to($user->email)->send(new VerifyEmail($user));
             
            /*Notification::create([
            'userID' => $user->id, // Address the notification to the new user
            'title' => 'Welcome to SelfieGram!',
            'label' => 'System',
            'message' => 'Welcome to SelfieGram Photostudios! Thank you for choosing our service! Best Regards, SelfieGram Team',
            'time' => now(),
            'starred' => 0,
            'bookingID' => 0, 
              'transID' => 0
        ]);*/
            return response()->json([
                'status' => 'success',
                'message' => 'User registered successfully! Please check your email to verify your account.',
                'user' => $user
            ], 201);
        }

        public function verifyEmail($token)
        {
            $user = User::where('email_verification', $token)->first();

            if (!$user) {
                return response()->json(['status' => 'failed', 'message' => 'Invalid or expired verification link'], 400);
            }

            $user->email_verification = null;
            $user->save();

            return redirect(config('app.frontend_url') . '/')
            ->with('toast', [
                'type' => 'success',
                'message' => 'Your email has been successfully verified. You can now log in.'
            ]);
        }


        public function logout(Request $request)
        {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Logged out successfully'
            ]);
        }

    }
