<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful - Selfiegram</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
        }
        .icon {
            font-size: 48px;
            color: #4CAF50;
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        p {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .btn {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 5px;
            transition: background-color 0.3s;
        }
        .btn:hover {
            background-color: #45a049;
        }
        .btn-secondary {
            background-color: #007bff;
        }
        .btn-secondary:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">✅</div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your payment! Your booking has been confirmed and you will receive a confirmation email shortly.</p>
        <p>We look forward to seeing you at your photo session!</p>
        
        <div>
            <a href="javascript:window.close()" class="btn btn-secondary">Close Window</a>
            <a href="#" onclick="window.history.back()" class="btn">Back to Site</a>
        </div>
    </div>
    
    <script>
        // Auto-close window after 5 seconds if opened in popup
        if (window.opener) {
            setTimeout(() => {
                window.close();
            }, 5000);
        }
    </script>
</body>
</html>