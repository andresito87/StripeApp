<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        // Clave secreta del webhook (configurar en .env)
        $endpoint_secret = env('STRIPE_WEBHOOK_SECRET');
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
        } catch (\Exception $e) {
            Log::error('Error verificando el webhook de Stripe: ' . $e->getMessage());
            return response()->json(['error' => 'Webhook signature invalid'], 400);
        }

        // Identificar el tipo de evento recibido
        switch ($event->type) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                $this->handleSuccessfulPayment($paymentIntent);
                break;

            case 'payment_intent.payment_failed':
                $paymentIntent = $event->data->object;
                $this->handleFailedPayment($paymentIntent);
                break;

            case 'payment_intent.requires_action':
                $paymentIntent = $event->data->object;
                $this->handleIncompletePayment($paymentIntent);
                break;

            case 'review.opened':
                $review = $event->data->object;
                $this->handleSuspiciousPayment($review);
                break;

            default:
                Log::info('Evento de Stripe no manejado: ' . $event->type);
        }

        return response()->json(['status' => 'success']);
    }

    private function handleSuccessfulPayment($paymentIntent)
    {
        Log::info('Pago completado: ' . $paymentIntent->id);
        DB::table('wallet')
            ->where('id_transaction', $paymentIntent->id)
            ->update(['status' => 'completed']);
    }

    private function handleFailedPayment($paymentIntent)
    {
        Log::warning('Pago fallido: ' . $paymentIntent->id);
        DB::table('payments')
            ->where('id_transaction', $paymentIntent->id)
            ->update(['status' => 'failed']);
    }

    private function handleIncompletePayment($paymentIntent)
    {
        Log::warning('Pago incompleto: ' . $paymentIntent->id);
        DB::table('payments')
            ->where('id_transaction', $paymentIntent->id)
            ->update(['status' => 'pending']);
    }

    private function handleSuspiciousPayment($review)
    {
        Log::warning('Pago sospechoso: ' . $review->payment_intent);
        DB::table('payments')
            ->where('id_transaction', $review->payment_intent)
            ->update(['status' => 'review']);
    }
}
