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
        // Payment sessions table for tracking PayMongo checkout sessions
        Schema::create('payment_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('booking_id');
            $table->string('checkout_session_id');
            $table->enum('payment_type', ['deposit', 'full', 'remaining']);
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'completed', 'failed', 'expired'])->default('pending');
            $table->string('paymongo_payment_id')->nullable();
            $table->timestamps();

            $table->index(['booking_id', 'payment_type']);
        });

        // Payment transactions table for detailed payment history
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('booking_id');
            $table->enum('payment_type', ['deposit', 'full', 'remaining']);
            $table->decimal('amount', 10, 2);
            $table->string('payment_method', 50);
            $table->enum('status', ['completed', 'failed', 'pending', 'refunded'])->default('completed');
            $table->timestamp('transaction_date');
            $table->json('payment_details')->nullable(); // Store PayMongo response details
            $table->timestamps();

            $table->index(['booking_id']);
            $table->index(['payment_type']);
            $table->index(['transaction_date']);
        });

        // Add payment tracking columns to existing booking table if they don't exist
        if (!Schema::hasColumn('booking', 'payment_updated_at')) {
            Schema::table('booking', function (Blueprint $table) {
                $table->timestamp('payment_updated_at')->nullable()->after('paymentStatus');
                $table->text('payment_notes')->nullable()->after('payment_updated_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('payment_sessions');
        
        if (Schema::hasColumn('booking', 'payment_updated_at')) {
            Schema::table('booking', function (Blueprint $table) {
                $table->dropColumn(['payment_updated_at', 'payment_notes']);
            });
        }
    }
};
