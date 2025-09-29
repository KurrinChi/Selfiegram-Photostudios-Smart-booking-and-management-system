<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add 'Gallery' to the existing enum values
        DB::statement("ALTER TABLE notifications MODIFY COLUMN label ENUM('Booking','Payment','Reschedule','Cancellation','Reminder','Promotion','System','Gallery') DEFAULT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'Gallery' from enum values
        DB::statement("ALTER TABLE notifications MODIFY COLUMN label ENUM('Booking','Payment','Reschedule','Cancellation','Reminder','Promotion','System') DEFAULT NULL");
    }
};