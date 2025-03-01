<?php

namespace App\Http\Controllers;


use Exception;
use Illuminate\Http\Request;
use App\Models\Wallet;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Refund;

/**
 * Controlador del monedero, gestiona todas las operaciones que se pueden realizar con este
 */
class WalletController extends Controller
{
    /**
     * PUT (PUSH): Recargar saldo en el monedero mediante Stripe
     * @param \Illuminate\Http\Request $request
     * @return mixed|\Illuminate\Http\JsonResponse
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

            // Registrar la transacción en la tabla wallet (PUSH)
            $transaction = Wallet::create([
                'id_user' => $request->id_user,
                'description' => 'Recarga de saldo',
                'amount' => $request->amount,
                'id_wallet_type' => 1, // PUT
                'id_transaction' => $paymentIntent->id
            ]);

            // Obtenemos todo el saldo del usuario
            $saldoTotal = Wallet::where('id_user', $request->id_user)->sum('amount');

            return response()->json([
                'message' => 'Saldo añadido con éxito',
                'clientSecret' => $paymentIntent->client_secret,
                'wallet' => [
                    'id_wallet' => $transaction->id_wallet,
                    'id_user' => $transaction->id_user,
                    'amount' => $saldoTotal
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
     * @param \Illuminate\Http\Request $request
     * @return mixed|\Illuminate\Http\JsonResponse
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
            // Obtener el saldo actual del usuario sumando todas sus transacciones
            $saldoDisponible = Wallet::where('id_user', $request->id_user)->sum('amount');

            if ($saldoDisponible < $request->amount) {
                return response()->json(['error' => 'Fondos insuficientes'], 400);
            }

            // Obtener la información del PaymentIntent de Stripe
            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);
            $originalAmount = $paymentIntent->amount / 100; // Convertir de centavos a euros

            if ($request->amount > $originalAmount) {
                return response()->json(['error' => 'El monto del reembolso no puede ser mayor que la transacción original'], 400);
            }

            // Verificar si ya se han hecho reembolsos parciales previos
            $existingRefunds = Wallet::where('id_transaction', $request->payment_intent_id)
                ->where('id_wallet_type', 2) // Solo transacciones POP
                ->sum('amount'); // Total de dinero ya reembolsado

            $totalRefunded = abs($existingRefunds) + $request->amount;

            if ($totalRefunded > $originalAmount) {
                return response()->json(['error' => 'El monto total reembolsado supera la transacción original'], 400);
            }

            // Procesar reembolso parcial en Stripe
            $refund = Refund::create([
                'payment_intent' => $request->payment_intent_id,
                'amount' => $request->amount * 100, // Convertir a centavos
            ]);

            // Registrar transacción en la tabla wallet (POP)
            $transaction = Wallet::create([
                'id_user' => $request->id_user,
                'description' => 'Reembolso parcial de saldo',
                'amount' => -$request->amount, // Se almacena como negativo
                'id_wallet_type' => 2, // POP
                'id_transaction' => $refund->id
            ]);

            // Obtener el saldo actualizado del usuario
            $saldoTotal = Wallet::where('id_user', $request->id_user)->sum('amount');

            return response()->json([
                'message' => 'Reembolso parcial exitoso',
                'refund' => [
                    'id' => $refund->id,
                    'amount' => $refund->amount / 100,
                    'status' => $refund->status
                ],
                'wallet' => [
                    'id_wallet' => $transaction->id_wallet,
                    'id_user' => $transaction->id_user,
                    'amount' => $saldoTotal
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
     * @param \Illuminate\Http\Request $request
     * @return mixed|\Illuminate\Http\JsonResponse
     */
    public function getBalance(Request $request)
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        // Obtener el saldo actualizado del usuario
        $saldoTotal = Wallet::where('id_user', $user->id_user)->sum('amount');

        return response()->json([
            'balance' => $saldoTotal
        ], 200);
    }


    /**
     * Obtener el listado de transacciones del usuario
     * @param \Illuminate\Http\Request $request
     * @return mixed|\Illuminate\Http\JsonResponse
     */
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
