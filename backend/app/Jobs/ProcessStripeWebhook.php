<?php

namespace App\Jobs;

use App\Models\Wallet;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessStripeWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $event;

    public function __construct($event)
    {
        $this->event = $event;
    }

    public function handle()
    {
        $event = $this->event;

        if (
            isset($event['type'])
            && $event['type'] === 'charge.succeeded'
            && isset($event['data']['object']['disputed'])
            && $event['data']['object']['disputed'] === true
        ) {
            $paymentIntent = $event['data']['object']['payment_intent'] ?? null;

            if ($paymentIntent) {
                Log::warning('Procesando disputa', ['payment_intent' => $paymentIntent]);

                Wallet::where('id_transaction', $paymentIntent)
                    ->update(['status' => 'disputed']);
            } else {
                Log::error('No se encontró payment_intent en el evento de disputa.');
            }
        } elseif (
            isset($event['type'])
            && $event['type'] === 'charge.succeeded'
            && isset($event['data']['object']['payment_intent'])
            && isset($event['data']['object']['disputed'])
            && $event['data']['object']['disputed'] === false
        ) {
            $paymentIntent = $event['data']['object']['payment_intent'];

            Log::info('Procesando pago exitoso', ['payment_intent' => $paymentIntent]);

            Wallet::where('id_transaction', $paymentIntent)
                ->update(['status' => 'succeeded']);
        } else {
            Log::info('Valor del payment_intent ');
            Log::info('Evento de Stripe no manejado', ['type' => $event['type'], 'object' => $event['data']['object']]);
        }

    }
}
