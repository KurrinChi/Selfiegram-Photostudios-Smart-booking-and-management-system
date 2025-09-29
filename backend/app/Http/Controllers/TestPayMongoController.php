<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TestPayMongoController extends Controller
{
    /**
     * Test endpoint to simulate PayMongo webhook with different payment methods
     */
    public function testWebhook(Request $request)
    {
        $paymentMethod = $request->input('payment_method', 'gcash');
        
        // Simulate PayMongo webhook payload structure
        $testPayload = [
            'data' => [
                'attributes' => [
                    'type' => 'checkout_session.payment.paid',
                    'data' => [
                        'id' => 'cs_test_12345',
                        'attributes' => [
                            'payment_intent' => [
                                'id' => 'pi_test_67890',
                                'attributes' => [
                                    'payment_method' => [
                                        'type' => $paymentMethod
                                    ]
                                ]
                            ],
                            'line_items' => [
                                [
                                    'amount' => 20000 // 200.00 PHP in centavos
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];
        
        // Test the payment method extraction
        $webhook = new PayMongoWebhookController();
        $extractedMethod = $this->extractPaymentMethodTest($testPayload['data']['attributes']['data']);
        
        return response()->json([
            'message' => 'Test webhook payload',
            'input_payment_method' => $paymentMethod,
            'extracted_payment_method' => $extractedMethod,
            'formatted_name' => $this->formatPaymentMethodNameTest($paymentMethod),
            'test_payload' => $testPayload
        ]);
    }
    
    /**
     * Test version of extractPaymentMethod
     */
    private function extractPaymentMethodTest($eventData)
    {
        $paymentMethod = 'PayMongo';
        
        try {
            if (isset($eventData['attributes']['payment_intent']['attributes']['payment_method']['type'])) {
                $methodType = $eventData['attributes']['payment_intent']['attributes']['payment_method']['type'];
                $paymentMethod = $this->formatPaymentMethodNameTest($methodType);
            }
        } catch (\Exception $e) {
            Log::warning('Could not extract payment method from test webhook', [
                'error' => $e->getMessage(),
                'event_data' => $eventData
            ]);
        }
        
        return $paymentMethod;
    }
    
    /**
     * Test version of formatPaymentMethodName
     */
    private function formatPaymentMethodNameTest($methodType)
    {
        $methodMap = [
            'gcash' => 'GCash',
            'grab_pay' => 'GrabPay', 
            'paymaya' => 'Maya',
            'card' => 'Credit/Debit Card',
            'bank_transfer' => 'Bank Transfer',
            'over_the_counter' => 'Over the Counter',
            'online_banking' => 'Online Banking'
        ];
        
        return $methodMap[strtolower($methodType)] ?? 'PayMongo - ' . ucfirst($methodType);
    }
}