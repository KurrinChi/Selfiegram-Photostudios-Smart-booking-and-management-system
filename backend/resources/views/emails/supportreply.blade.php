<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Support Reply</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f5f5; color:#333;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:20px; background:#f5f5f5;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1); overflow:hidden;">
                <tr>
                    <td style="background:#212121; padding:28px 24px; text-align:center;">
                        <h1 style="margin:0; font-size:20px; color:#ffffff; font-weight:bold; font-family:Arial, sans-serif;">
                            SelfieGram Photostudios
                        </h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding:30px;">
                        <h2 style="margin-top:0; font-size:18px; color:#333;">Hello {{ $user->fname }} {{ $user->lname }},</h2>
@php
    // Heuristic: treat as a reply only if the composed body contains a hash reference (#<id>)
    $isReply = preg_match('/#\d{1,10}\b/', $bodyMessage) === 1;
@endphp
@if($isReply)
                        <p style="line-height:1.55; font-size:14px; color:#555; margin:0 0 16px;">
                            We are responding to your recent inquiry.
                        </p>
@endif
                        <p style="line-height:1.55; font-size:15px; color:#111; font-weight:bold; margin:0 0 16px;">
                            Subject: {{ $subjectLine }}
                        </p>
                        <div style="background:#fafafa; border:1px solid #eee; padding:18px 16px; border-radius:6px; font-size:14px; line-height:1.55; color:#333; white-space:pre-line;">
                            {!! nl2br(e(ltrim($bodyMessage))) !!}
                        </div>
                        <p style="line-height:1.55; font-size:13px; color:#777; margin:24px 0 0;">If you have more questions, kindly reach us at [support email/phone] as this is an unmonitored email.</p>
                        <p style="line-height:1.55; font-size:13px; color:#777; margin:12px 0 0;">Regards,<br><strong>SelfieGram Support Team</strong></p>
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
