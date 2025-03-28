<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Jobs\ProcessStripeWebhook;

/**
 * Controlador para manejar los webhooks de Stripe.
 *
 * Este controlador recibe los eventos enviados por Stripe y los envía
 * a una tarea en segundo plano para su procesamiento.
 */
class StripeWebhookController extends Controller
{
    /**
     * Maneja los eventos de webhook de Stripe.
     *
     * @param Request $request La solicitud entrante que contiene el evento de Stripe.
     * @return \Illuminate\Http\JsonResponse Respuesta JSON indicando que el evento ha sido encolado.
     */
    public function handleWebhook(Request $request)
    {
        Log::info('Evento de Stripe recibido.');

        // Decodifica el contenido JSON del evento recibido
        $event = json_decode($request->getContent(), true);

        // Despacha un job para procesar el evento en segundo plano
        ProcessStripeWebhook::dispatch($event);

        return response()->json(['status' => 'queued']);
    }

}
