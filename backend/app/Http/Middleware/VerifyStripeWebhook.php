<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;

/**
 * Middleware para verificar la firma de los webhooks de Stripe.
 *
 * Este middleware intercepta las solicitudes entrantes de Stripe y valida
 * su autenticidad verificando la firma incluida en los encabezados.
 */
class VerifyStripeWebhook
{
    /**
     * Maneja la verificación de la firma del webhook de Stripe.
     *
     * @param Request $request La solicitud entrante.
     * @param Closure $next    La siguiente acción en la cadena de middleware.
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\Response
     */
    public function handle(Request $request, Closure $next)
    {
        $endpointSecret = env('STRIPE_WEBHOOK_SECRET');

        // Obtiene la firma del encabezado de la solicitud
        $sigHeader = $request->header('Stripe-Signature');

        // Obtiene el contenido de la solicitud
        $payload = $request->getContent();

        Log::info('Verificando firma');

        try {
            // Intenta validar la firma de la solicitud
            Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\Exception $e) {
            // Si la validación falla, registra el error y devuelve una respuesta de error
            Log::error('Firma de webhook inválida: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Si la firma es válida, continúa con la siguiente acción en la cadena de middleware
        return $next($request);
    }
}
