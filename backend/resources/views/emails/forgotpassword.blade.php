<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset OTP</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f5f5; color:#333;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px; background:#f5f5f5;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1); overflow:hidden;">
                    <tr>
                        <td style="background:#212121; padding:32px 28px; text-align:center;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0; padding:0; border:0;">
                                <tr>
                                    <td align="center" style="font-size:0; line-height:0;">
                                        <h1 style="margin:0; font-size:22px; color:#ffffff; font-weight:bold; font-family:Arial, sans-serif;">
                                            SelfieGram Photostudios
                                        </h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:30px;">
                            <h2 style="margin-top:0; font-size:20px; color:#333;">
                                Hello {{ $user->fname }} {{ $user->lname }},
                            </h2>

                            <p style="line-height:1.6; font-size:15px; color:#555;">
                                We received a request to reset your account password. Please use the OTP below to continue with the process.
                            </p>

                            <div style="margin:30px 0; text-align:center;">
                                <h3 style="font-size:38px; font-weight:bold; margin:0; color:#212121; letter-spacing:2px;">
                                    {{ $otp }}
                                </h3>
                            </div>

                            <p style="line-height:1.6; font-size:14px; color:#777;">
                                This OTP is valid for <strong>5 minutes</strong>.  
                                If you did not request a password reset, you can safely ignore this email.
                            </p>

                            <p style="margin-top:25px; font-size:14px; color:#555;">
                                Regards,<br>
                                <strong>SelfieGram Photostudios</strong>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#888;">
                            © {{ date('Y') }} SelfieGram Photostudios Malolos. All rights reserved.
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
