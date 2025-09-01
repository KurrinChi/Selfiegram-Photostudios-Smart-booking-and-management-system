<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset OTP</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 0 5px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Hello {{ $user->fname }} {{ $user->lname }},</h2>
        <p>You have requested to reset your account password. Use the following OTP to proceed:</p>
        
        <div>
            <h3 style="font-size: 38px; font-weight: bold; text-align: center; margin: 20px 0; color: #000000ff;">{{ $otp }}</h3>
        </div>

        <p>This OTP is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
        <br>
        <p>Regards,<br><strong>SelfieGram</strong></p>
    </div>
</body>
</html>
