<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Email Verification</title>
</head>
<body>
    <h2>Hello {{ $user->fname }} {{ $user->lname }},</h2>
    <p>Thank you for registering. Please verify your email by clicking below:</p>

    <a href="{{ config('app.url') }}/api/verify-email/{{ $user->email_verification }}">
        Verify Email
    </a>

    <p>If you did not register, ignore this email.</p>
</body>
</html>
