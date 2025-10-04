<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Email Verification</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f9f9f9; color:#333;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9; padding:20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:8px; box-shadow:0 4px 8px rgba(0,0,0,0.05); overflow:hidden;">
                    <tr>
                        <td style="background:#212121; padding:32px 28px; text-align:center;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0; padding:0; border:0;">
                                <tr>
                                    <td align="center" style="font-size:0; line-height:0;">
                                        <h1 style="color:#fff; margin:0; font-size:22px; font-family:Arial, sans-serif;">SelfieGram Photostudios Malolos</h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    
                    <tr>
                        <td style="padding:30px;">
                            <h2 style="margin-top:0; color:#333;">Hello {{ $user->fname }} {{ $user->lname }},</h2>
                            
                            <p style="line-height:1.6; font-size:15px; color:#555;">
                                Welcome aboard! You’ve been added as a <strong>staff member</strong> of <em>SelfieGram Photostudios Malolos</em>.  
                                As part of our team, you’ll play an important role in helping customers capture their special moments with a smile.  
                            </p>

                            <P style="line-height:1.6; font-size:15px; color:#555;">
                                 Here is the temporary password for your account: <strong>{{ $password }}</strong>, which you can change after logging in.
                            </P>

                            <p style="line-height:1.6; font-size:15px; color:#555;">
                                Before you can access your staff account, please verify your email by clicking the button below:
                            </p>

                            
                            <p style="text-align:center; margin:30px 0;">
                                <a href="{{ config('app.url') }}/api/verify-email/{{ $user->email_verification }}"
                                   style="display:inline-block; background:#212121; color:#fff; text-decoration:none; 
                                          padding:12px 24px; border-radius:6px; font-weight:bold; font-size:14px;">
                                    Verify My Email
                                </a>
                            </p>
                            <p style="line-height:1.6; font-size:15px; color:#555;">
                                If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:support@selfiegram.com">demoprojectsystemuse@gmail.com</a>.
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
