# Quick Webhook Test Script for Selfiegram Payment Flow
# Usage: .\test-webhook.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Selfiegram Payment Webhook Test" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location backend

# Get the latest payment session
Write-Host "Getting latest payment session..." -ForegroundColor Yellow
$sessionId = php artisan tinker --execute="echo \DB::table('payment_sessions')->orderBy('id', 'desc')->first()->checkout_session_id;"

if ([string]::IsNullOrWhiteSpace($sessionId)) {
    Write-Host ""
    Write-Host "ERROR: No payment session found!" -ForegroundColor Red
    Write-Host "Please create a booking first." -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

Write-Host "Latest Session ID: $sessionId" -ForegroundColor Green
Write-Host ""
Write-Host "Triggering webhook for session: $sessionId" -ForegroundColor Yellow
Write-Host ""

# Trigger webhook
$response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/test-complete-payment?session_id=$sessionId" -Method Get
$result = $response.Content | ConvertFrom-Json

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Webhook Response:" -ForegroundColor Green
Write-Host ""
Write-Host "Message: $($result.message)" -ForegroundColor White
Write-Host "Session ID: $($result.session_id)" -ForegroundColor White
Write-Host "Booking ID: $($result.booking_id)" -ForegroundColor White
Write-Host "Amount Paid: PHP $($result.amount_paid)" -ForegroundColor White
Write-Host ""

# Check if booking was created
if ($result.booking_id) {
    Write-Host "Fetching booking details..." -ForegroundColor Yellow
    Write-Host ""
    
    $bookingJson = php artisan tinker --execute="echo json_encode(\DB::table('booking')->where('bookingID', $($result.booking_id))->first());"
    $booking = $bookingJson | ConvertFrom-Json
    
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Booking Details:" -ForegroundColor Green
    Write-Host ""
    Write-Host "Booking ID: $($booking.bookingID)" -ForegroundColor White
    Write-Host "Customer: $($booking.customerName)" -ForegroundColor White
    Write-Host "Email: $($booking.customerEmail)" -ForegroundColor White
    Write-Host "Date: $($booking.bookingDate)" -ForegroundColor White
    Write-Host "Time: $($booking.bookingStartTime)" -ForegroundColor White
    Write-Host "Total: PHP $($booking.total)" -ForegroundColor White
    Write-Host "Paid: PHP $($booking.receivedAmount)" -ForegroundColor White
    Write-Host "Remaining: PHP $($booking.rem)" -ForegroundColor White
    
    $statusText = switch ($booking.status) {
        0 { "Pending" }
        1 { "Pending Approval" }
        2 { "Confirmed" }
        3 { "Cancelled" }
        default { "Unknown" }
    }
    Write-Host "Status: $statusText" -ForegroundColor White
    
    $paymentStatusText = if ($booking.paymentStatus -eq 1) { "Fully Paid" } else { "Pending Payment" }
    Write-Host "Payment Status: $paymentStatusText" -ForegroundColor White
    Write-Host ""
    Write-Host "SUCCESS! Booking created successfully!" -ForegroundColor Green
} else {
    Write-Host "WARNING: No booking ID returned. Check if this was an existing booking payment." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
