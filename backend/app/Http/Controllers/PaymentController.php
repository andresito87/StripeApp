<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Refund;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class PaymentController extends Controller
{
    public function createPaymentIntent(Request $request)
    {
        try {
            // Configura la clave secreta de Stripe
            Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

            // Crea el PaymentIntent
            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount, //Cantidad en céntimos
                'currency' => 'usd',
                'payment_method_types' => ['card'], // Tipos de pago admitidos
            ]);

            // Retorna el client_secret
            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function refundPayment(Request $request)
    {
        try {
            // Valida que el ID del PaymentIntent se envíe en la solicitud
            $request->validate([
                'paymentIntentId' => 'required|string',
            ]);

            // Configura la clave secreta de Stripe
            Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

            // Obtiene el PaymentIntent desde Stripe
            $paymentIntent = PaymentIntent::retrieve($request->paymentIntentId);

            // Verifica si ya está reembolsado
            if ($paymentIntent->status === 'succeeded' && $paymentIntent->amount_received === $paymentIntent->amount_refunded) {
                return response()->json([
                    'success' => false,
                    'message' => 'This payment has already been refunded.',
                ]);
            }

            // Crea un reembolso si no ha sido completamente reembolsado
            $refund = Refund::create([
                'payment_intent' => $request->paymentIntentId,
            ]);

            // Devuelve la respuesta
            return response()->json([
                'success' => true,
                'refund' => $refund,
            ]);
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();

            if (str_contains($errorMessage, 'has already been refunded')) {
                return response()->json([
                    'success' => false,
                    'message' => 'This payment has already been refunded.',
                ]);
            }

            return response()->json([
                'error' => $errorMessage,
            ], 500);
        }

    }

}

