<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Email Verification</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f5f5; color:#333;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px; background:#f5f5f5;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1); overflow:hidden;">
                    
                    
                    <tr>
                        <td style="background:#000; padding:20px; text-align:center;">
                            <h1 style="margin:0; font-size:22px; color:#fff; font-weight:bold;">
                                SelfieGram Photostudios
                            </h1>
                        </td>
                    </tr>

                    
                    <tr>
                        <td style="padding:30px;">
                            <h2 style="margin-top:0; font-size:20px; color:#333;">
                                Hello {{ $user->fname }} {{ $user->lname }},
                            </h2>

                            <p style="line-height:1.6; font-size:15px; color:#555;">
                                Thank you for registering with <strong>SelfieGram Photostudios Malolos</strong>!  
                                To complete your registration and activate your account, please verify your email by clicking the button below.
                            </p>

                            
                            <p style="text-align:center; margin:30px 0;">
                                <a href="{{ config('app.url') }}/api/verify-email/{{ $user->email_verification }}"
                                   style="display:inline-block; background:#000; color:#fff; text-decoration:none; 
                                          padding:12px 24px; border-radius:6px; font-weight:bold; font-size:14px;">
                                    Verify My Email
                                </a>
                            </p>

                            <p style="line-height:1.6; font-size:14px; color:#777;">
                                If you did not register, you can safely ignore this email.
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
