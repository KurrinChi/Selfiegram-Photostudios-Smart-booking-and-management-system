<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SetupNgrokWebhook extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ngrok:setup {url?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set up ngrok URL for PayMongo webhook testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ngrokUrl = $this->argument('url');
        
        if (!$ngrokUrl) {
            $this->info('🚀 Setting up ngrok for PayMongo webhook testing...');
            $this->newLine();
            
            $this->info('Step 1: Install ngrok if you haven\'t already:');
            $this->line('   Download from: https://ngrok.com/download');
            $this->newLine();
            
            $this->info('Step 2: Start ngrok tunnel:');
            $this->line('   ngrok http 8000');
            $this->newLine();
            
            $this->info('Step 3: Copy the HTTPS URL from ngrok (e.g., https://abc123.ngrok.io)');
            $ngrokUrl = $this->ask('Enter your ngrok HTTPS URL');
        }
        
        if (!$ngrokUrl || !filter_var($ngrokUrl, FILTER_VALIDATE_URL)) {
            $this->error('❌ Invalid URL provided. Please provide a valid ngrok HTTPS URL.');
            return 1;
        }
        
        // Remove trailing slash
        $ngrokUrl = rtrim($ngrokUrl, '/');
        
        // Update .env file
        $envFile = base_path('.env');
        $envContent = file_get_contents($envFile);
        
        if (strpos($envContent, 'NGROK_URL=') !== false) {
            $envContent = preg_replace('/NGROK_URL=.*/', 'NGROK_URL=' . $ngrokUrl, $envContent);
        } else {
            $envContent .= "\nNGROK_URL=" . $ngrokUrl;
        }
        
        file_put_contents($envFile, $envContent);
        
        $this->info('✅ Updated NGROK_URL in .env file');
        $this->newLine();
        
        $webhookUrl = $ngrokUrl . '/api/paymongo/webhook';
        
        $this->info('🎯 Next steps:');
        $this->line('1. Go to PayMongo Dashboard: https://dashboard.paymongo.com/');
        $this->line('2. Navigate to: Developers → Webhooks');
        $this->line('3. Create/Update webhook with this URL:');
        $this->line('   ' . $webhookUrl);
        $this->line('4. Select events: checkout_session.payment.paid, checkout_session.payment.failed');
        $this->newLine();
        
        $this->info('🧪 Test your setup:');
        $this->line('1. Make a booking and click "Complete Payment"');
        $this->line('2. Pay with GCash/Maya in the PayMongo checkout');
        $this->line('3. Check if the paymentMethod shows "GCash" or "Maya" instead of "PayMongo"');
        $this->newLine();
        
        $this->info('🔄 To disable ngrok (for production):');
        $this->line('   php artisan ngrok:disable');
        
        return 0;
    }
}
