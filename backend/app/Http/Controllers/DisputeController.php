<?php

namespace App\Http\Controllers;

use App\Models\DisputedTransaction;
use Illuminate\Http\Request;

class DisputeController extends Controller
{
    public function getReason($paymentIntent)
    {
        $dispute = DisputedTransaction::where('payment_intent_id', $paymentIntent)->first();

        if (!$dispute) {
            return response()->json(['message' => 'Disputa no encontrada'], 404);
        }

        return response()->json(['reason' => $dispute->reason]);
    }
}
