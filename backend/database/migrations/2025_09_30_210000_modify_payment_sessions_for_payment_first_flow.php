<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payment_sessions', function (Blueprint $table) {
            // Make booking_id nullable since booking doesn't exist yet when checkout session is created
            $table->bigInteger('booking_id')->unsigned()->nullable()->change();
            
            // Add column to store booking data temporarily until payment is confirmed
            $table->longText('booking_data')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_sessions', function (Blueprint $table) {
            $table->bigInteger('booking_id')->unsigned()->nullable(false)->change();
            $table->dropColumn('booking_data');
        });
    }
};