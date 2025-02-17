<?php

namespace App\Http\Controllers;


use Exception;
use Illuminate\Http\Request;
use App\Models\Wallet;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Refund;

class WalletController extends Controller
{
    /**
     * PUT (PUSH): Recargar saldo en el monedero mediante Stripe
     */
    public function put(Request $request)
    {
        $request->validate([
            'id_user' => 'required|exists:users,id_user',
            'amount' => 'required|numeric|min:1',
            'payment_method_id' => 'required|string'
        ]);

        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

        try {
            // Crear PaymentIntent en Stripe
            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount * 100, // Convertir a centavos
                'currency' => 'eur',
                'payment_method' => $request->payment_method_id,
                'confirm' => false,
                'payment_method_types' => ['card'] // Asegurar que solo usa tarjetas
            ]);

            // 🔹 Asegurar que el monedero del usuario existe y tiene una descripción
            $wallet = Wallet::firstOrCreate(
                ['id_user' => $request->id_user],
                [
                    'description' => 'Monedero',
                    'amount' => 0,
                    'id_wallet_type' => 1 // 🔹 Agregar valor por defecto (PUT)
                ]
            );

            // 🔹 Registrar la transacción en la tabla wallet (PUSH)
            $transaction = Wallet::create([
                'id_user' => $request->id_user,
                'description' => 'Recarga de saldo',
                'amount' => $request->amount,
                'id_wallet_type' => 1, // PUT
                'id_transaction' => $paymentIntent->id
            ]);

            // Actualizar el saldo del monedero
            $wallet->amount += $request->amount;
            $wallet->save();

            return response()->json([
                'message' => 'Saldo añadido con éxito',
                'clientSecret' => $paymentIntent->client_secret,
                'wallet' => [
                    'id_wallet' => $wallet->id_wallet,
                    'id_user' => $wallet->id_user,
                    'amount' => $wallet->amount
                ],
                'transaction' => [
                    'id_wallet' => $transaction->id_wallet,
                    'amount' => $transaction->amount,
                    'id_transaction' => $transaction->id_transaction
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error en la transacción: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * POP (POP): Retirar saldo y hacer un reembolso mediante Stripe
     */
    public function pop(Request $request)
    {
        $request->validate([
            'id_user' => 'required|exists:users,id_user',
            'amount' => 'required|numeric|min:1',
            'payment_intent_id' => 'required|string'
        ]);

        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

        try {
            // 🔹 Buscar el monedero del usuario
            $wallet = Wallet::where('id_user', $request->id_user)->first();

            if (!$wallet || $wallet->amount < $request->amount) {
                return response()->json(['error' => 'Fondos insuficientes'], 400);
            }

            // 🔹 Obtener la información del PaymentIntent de Stripe
            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);
            $originalAmount = $paymentIntent->amount / 100; // Convertir de centavos a euros

            if ($request->amount > $originalAmount) {
                return response()->json(['error' => 'El monto del reembolso no puede ser mayor que la transacción original'], 400);
            }

            // 🔹 Verificar si ya se han hecho reembolsos parciales previos
            $existingRefunds = Wallet::where('id_transaction', $request->payment_intent_id)
                ->where('id_wallet_type', 2) // Solo transacciones POP
                ->sum('amount'); // Total de dinero ya reembolsado

            $totalRefunded = abs($existingRefunds) + $request->amount;

            if ($totalRefunded > $originalAmount) {
                return response()->json(['error' => 'El monto total reembolsado supera la transacción original'], 400);
            }

            // 🔹 Procesar reembolso parcial en Stripe
            $refund = Refund::create([
                'payment_intent' => $request->payment_intent_id,
                'amount' => $request->amount * 100, // Convertir a centavos
            ]);

            // 🔹 Registrar transacción en la tabla wallet (POP)
            $transaction = Wallet::create([
                'id_user' => $request->id_user,
                'description' => 'Reembolso parcial de saldo',
                'amount' => -$request->amount, // Se almacena como negativo
                'id_wallet_type' => 2, // POP
                'id_transaction' => $refund->id
            ]);

            // 🔹 Actualizar saldo del monedero
            $wallet->amount -= $request->amount;
            $wallet->save();

            return response()->json([
                'message' => 'Reembolso parcial exitoso',
                'refund' => [
                    'id' => $refund->id,
                    'amount' => $refund->amount / 100, // Convertir a euros
                    'status' => $refund->status
                ],
                'wallet' => [
                    'id_wallet' => $wallet->id_wallet,
                    'id_user' => $wallet->id_user,
                    'amount' => $wallet->amount
                ],
                'transaction' => [
                    'id_wallet' => $transaction->id_wallet,
                    'amount' => $transaction->amount,
                    'id_transaction' => $transaction->id_transaction
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error en el reembolso: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener el saldo actual del monedero
     */
    public function getBalance(Request $request)
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        $wallet = Wallet::where('id_user', $user->id_user)->first();

        return response()->json([
            'balance' => $wallet ? $wallet->amount : 0
        ], 200);
    }

    public function getTransactions(Request $request)
    {
        $user = $request->user(); // Obtener usuario autenticado

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        // Obtener todas las transacciones del usuario ordenadas por fecha DESC
        $transactions = Wallet::where('id_user', $user->id_user)
            ->orderBy('date_create', 'desc')
            ->get(['id_wallet', 'description', 'amount', 'date_create', 'id_wallet_type', 'id_transaction']);

        return response()->json([
            'user' => [
                'id_user' => $user->id_user,
                'name' => $user->name,
                'email' => $user->email
            ],
            'transactions' => $transactions
        ], 200);
    }


}
