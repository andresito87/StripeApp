<?php

namespace App\Jobs;

use App\Models\DisputedTransaction;
use App\Models\Wallet;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Job para procesar los eventos de webhook de Stripe en segundo plano.
 *
 * Esta clase maneja eventos específicos de Stripe, como pagos exitosos y disputas,
 * actualizando la base de datos en consecuencia.
 */
class ProcessStripeWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @var array $event El evento de Stripe recibido.
     */
    protected $event;

    /**
     * Crea una nueva instancia del job.
     *
     * @param array $event Datos del evento recibido desde Stripe.
     */
    public function __construct($event)
    {
        $this->event = $event;
    }

    /**
     * Ejecuta el procesamiento del evento de Stripe.
     */
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
            $disputeId = $event['data']['object']['dispute'] ?? null; // Suponiendo que el ID de la disputa proviene de `event['data']['object']['id']`
            $reason = $event['data']['object']['outcome']['reason'] ?? 'Not specified'; // La razón puede ser lo que necesites, puedes ajustarlo

            if ($paymentIntent && $disputeId) {

                // Actualiza que es una disputa
                Wallet::where('id_transaction', $paymentIntent)
                    ->update([
                        'status' => 'disputed',
                        'id_wallet_type_error' => 3,
                    ]);

                // Crear una nueva disputa
                DisputedTransaction::create([
                    'dispute_id' => $disputeId,
                    'payment_intent_id' => $paymentIntent,
                    'reason' => $reason,
                    'status' => 'pending'
                ]);

            } else {
                Log::error('No se encontró payment_intent o dispute_id en el evento de disputa.');
            }
        } elseif (
            isset($event['type'])
            && $event['type'] === 'charge.dispute.closed'
            && isset($event['data']['object']['object'])
            && $event['data']['object']['object'] === 'dispute'
        ) {
            $paymentIntent = $event['data']['object']['payment_intent'] ?? null;
            $disputeId = $event['data']['object']['id'] ?? null;
            $reason = $event['data']['object']['reason'] ?? 'Not specified';
            $status = $event['data']['object']['reason'] ?? null;

            if ($paymentIntent && $disputeId) {

                // Finalizar una disputa fraudulenta
                if ($status == 'fraudulent') {
                    Wallet::where('id_transaction', $paymentIntent)
                        ->update([
                            'status' => 'failure',
                            'id_wallet_type_error' => 2,
                        ]);
                }

                // Actualizar el estado y razon de la disputa
                if ($status != null) {
                    DisputedTransaction::where('dispute_id', $disputeId)
                        ->update([
                            'status' => $status,
                            'reason' => $reason
                        ]);
                }

            } else {
                Log::error('No se encontró payment_intent o dispute_id en el evento de disputa.');
            }
        } elseif (
            isset($event['type'])
            && $event['type'] === 'charge.succeeded'
            && isset($event['data']['object']['payment_intent'])
            && isset($event['data']['object']['disputed'])
            && $event['data']['object']['disputed'] === false
        ) {
            $paymentIntent = $event['data']['object']['payment_intent'];

            Wallet::where('id_transaction', $paymentIntent)
                ->update(
                    [
                        'status' => 'succeeded',
                        'id_wallet_type_error' => 1,
                    ]
                );
        } //No se realizan cambios en la BD porque no se estan almacenando las bloqueadas
        elseif (
            isset($event['type'])
            && $event['type'] === 'charge.failed'
            && isset($event['data']['object']['payment_intent'])
            && isset($event['data']['object']['outcome'])
            && $event['data']['object']['outcome']['type'] === 'blocked'
        ) {
            $paymentIntent = $event['data']['object']['payment_intent'];

            Wallet::where('id_transaction', $paymentIntent)
                ->update([
                    'status' => 'blocked',
                    'id_wallet_type_error' => 5,
                ]);
        } elseif (
            isset($event['type'])
            && $event['type'] === 'charge.dispute.created'
            && isset($event['data']['object']['object'])
            && $event['data']['object']['object'] === 'dispute'
        ) {
            $paymentIntent = $event['data']['object']['payment_intent'] ?? null;
            $disputeId = $event['data']['object']['id'] ?? null;
            $reason = $event['data']['object']['reason'] ?? 'Not specified';

            if ($paymentIntent && $disputeId) {

                // Actualiza que es una disputa
                Wallet::where('id_transaction', $paymentIntent)
                    ->update([
                        'status' => 'disputed',
                        'id_wallet_type_error' => 3,
                    ]);

                // Crear una nueva disputa
                DisputedTransaction::where('dispute_id', $disputeId)
                    ->update([
                        'status' => 'pending',
                        'reason' => $reason
                    ]);
                if (DisputedTransaction::where('dispute_id', $disputeId)->count() == 0) {
                    DisputedTransaction::create([
                        'dispute_id' => $disputeId,
                        'payment_intent_id' => $paymentIntent,
                        'reason' => $reason,
                        'status' => 'pending'
                    ]);
                }
                Log::error('Disputa creada', [
                    'dispute_id' => $disputeId,
                    'payment_intent_id' => $paymentIntent,
                    'reason' => $reason,
                    'status' => 'pending'
                ]);
            } else {
                Log::error('No se encontró payment_intent o dispute_id en el evento de disputa.');
            }
        } elseif (
            isset($event['type'])
            && $event['type'] === 'payment_intent.requires_action'
            && isset($event['data']['object']['id'])
        ) {
            $paymentIntent = $event['data']['object']['id'];

            Wallet::where('id_transaction', $paymentIntent)
                ->update(['status' => 'requires_action']);
        } else {
            Log::info('Evento de Stripe no manejado', ['type' => $event['type'], 'event' => $event]);
        }

    }
}
