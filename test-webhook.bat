@echo off
REM Quick Webhook Test Script for Selfiegram Payment Flow
REM Usage: test-webhook.bat

echo ==========================================
echo Selfiegram Payment Webhook Test
echo ==========================================
echo.

REM Get the latest payment session
cd backend
echo Getting latest payment session...
for /f "delims=" %%i in ('php artisan tinker --execute="echo \DB::table('payment_sessions')->orderBy('id', 'desc')->first()->checkout_session_id;"') do set SESSION_ID=%%i

echo Latest Session ID: %SESSION_ID%
echo.

REM Check if session exists
if "%SESSION_ID%"=="" (
    echo ERROR: No payment session found!
    echo Please create a booking first.
    pause
    exit /b 1
)

echo Triggering webhook for session: %SESSION_ID%
echo.

REM Trigger webhook
curl "http://127.0.0.1:8000/api/test-complete-payment?session_id=%SESSION_ID%"

echo.
echo.
echo ==========================================
echo Webhook triggered successfully!
echo.
echo Checking result...
echo.

REM Show the latest booking
php artisan tinker --execute="$booking = \DB::table('booking')->orderBy('bookingID', 'desc')->first(); echo 'Booking ID: ' . $booking->bookingID . PHP_EOL . 'Customer: ' . $booking->customerName . PHP_EOL . 'Total: PHP ' . $booking->total . PHP_EOL . 'Paid: PHP ' . $booking->receivedAmount . PHP_EOL . 'Status: ' . ($booking->status == 2 ? 'Confirmed' : 'Pending');"

echo.
echo ==========================================
pause
