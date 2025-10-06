<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayMongoService
{
    private $secretKey;
    private $publicKey;
    private $baseUrl;

    public function __construct()
    {
        $this->secretKey = env('PAYMONGO_SECRET_KEY', 'sk_test_gwwBqSApZaykM7CvivRcaWeS');
        $this->publicKey = env('PAYMONGO_PUBLIC_KEY', 'pk_test_ELNSWEx92VGt8TUBFm5hEYdr');
        $this->baseUrl = 'https://api.paymongo.com/v1';
    }

    /**
     * Create a payment intent for the booking
     */
    public function createPaymentIntent($amount, $currency = 'PHP', $description = null, $metadata = [])
    {
        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->post($this->baseUrl . '/payment_intents', [
                    'data' => [
                        'attributes' => [
                            'amount' => $amount * 100, // Convert to centavos
                            'payment_method_allowed' => [
                                'gcash',
                                'grab_pay',
                                'paymaya',
                                'card'
                            ],
                            'payment_method_options' => [
                                'card' => [
                                    'request_three_d_secure' => 'automatic'
                                ]
                            ],
                            'currency' => $currency,
                            'capture_type' => 'automatic',
                            'description' => $description,
                            'metadata' => $metadata
                        ]
                    ]
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            Log::error('PayMongo Payment Intent Error', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => $response->json()['errors'][0]['detail'] ?? 'Payment intent creation failed'
            ];

        } catch (\Exception $e) {
            Log::error('PayMongo Service Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'Payment service temporarily unavailable'
            ];
        }
    }

    /**
     * Retrieve payment intent status
     */
    public function getPaymentIntent($paymentIntentId)
    {
        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->get($this->baseUrl . '/payment_intents/' . $paymentIntentId);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'error' => 'Payment intent not found'
            ];

        } catch (\Exception $e) {
            Log::error('PayMongo Get Payment Intent Exception', [
                'payment_intent_id' => $paymentIntentId,
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Unable to retrieve payment status'
            ];
        }
    }

    /**
     * Create a checkout session for easier payment processing
     */
    public function createCheckoutSession($amount, $description, $successUrl, $cancelUrl, $metadata = [])
    {
        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->post($this->baseUrl . '/checkout_sessions', [
                    'data' => [
                        'attributes' => [
                            'send_email_receipt' => false,
                            'show_description' => true,
                            'show_line_items' => true,
                            'cancel_url' => $cancelUrl,
                            'success_url' => $successUrl,
                            'line_items' => [
                                [
                                    'currency' => 'PHP',
                                    'amount' => $amount * 100, // Convert to centavos
                                    'description' => $description,
                                    'name' => 'Selfiegram Booking Payment',
                                    'quantity' => 1
                                ]
                            ],
                            'payment_method_types' => [
                                'gcash',
                                'grab_pay', 
                                'paymaya',
                                'card'
                            ],
                            'description' => $description,
                            'metadata' => $metadata
                        ]
                    ]
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            Log::error('PayMongo Checkout Session Error', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => $response->json()['errors'][0]['detail'] ?? 'Checkout session creation failed'
            ];

        } catch (\Exception $e) {
            Log::error('PayMongo Checkout Session Exception', [
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Payment checkout temporarily unavailable'
            ];
        }
    }

    /**
     * Retrieve checkout session
     */
    public function getCheckoutSession($checkoutSessionId)
    {
        try {
            // Expand payments to get the actual payment method used
            $response = Http::withBasicAuth($this->secretKey, '')
                ->get($this->baseUrl . '/checkout_sessions/' . $checkoutSessionId . '?expand[]=payments');

            if ($response->successful()) {
                $data = $response->json();
                
                // Log the response to help debug payment method detection
                Log::info('PayMongo Checkout Session Retrieved', [
                    'checkout_session_id' => $checkoutSessionId,
                    'has_payments' => isset($data['data']['attributes']['payments']),
                    'payment_status' => $data['data']['attributes']['payment_status'] ?? 'unknown'
                ]);

                return [
                    'success' => true,
                    'data' => $data
                ];
            }

            return [
                'success' => false,
                'error' => 'Checkout session not found'
            ];

        } catch (\Exception $e) {
            Log::error('PayMongo Get Checkout Session Exception', [
                'checkout_session_id' => $checkoutSessionId,
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Unable to retrieve checkout session'
            ];
        }
    }
}