<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Log;
use App\Jobs\ProcessStripeWebhook;

class StripeWebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        Log::info('Evento de Stripe recibido.');
        $event = json_decode($request->getContent(), true);

        ProcessStripeWebhook::dispatch($event);

        return response()->json(['status' => 'queued']);
    }

}
