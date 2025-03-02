<?php

namespace App\Http\Controllers;


use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use App\Models\Wallet;
use Stripe\Customer;
use Stripe\PaymentMethod;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Refund;
use Illuminate\Support\Facades\Auth;

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
            $user = User::find($request->id_user);
            if (!$user || !$user->stripe_customer_id) {
                return response()->json(['error' => 'El usuario no tiene cuenta en Stripe'], 400);
            }

            // Asociar el método de pago al cliente en Stripe
            PaymentMethod::retrieve($request->payment_method_id)
                ->attach(['customer' => $user->stripe_customer_id]);

            // Establecer el método de pago como predeterminado (opcional)
            Customer::update($user->stripe_customer_id, [
                'invoice_settings' => [
                    'default_payment_method' => $request->payment_method_id
                ]
            ]);

            // Crear PaymentIntent en Stripe
            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount * 100, // Convertir a centavos
                'currency' => 'eur',
                'customer' => $user->stripe_customer_id,
                'payment_method' => $request->payment_method_id,
                'confirm' => true, // Confirma automáticamente el pago
                'payment_method_types' => ['card']
            ]);

            // Registrar la transacción en la base de datos (PUSH)
            $transaction = Wallet::create([
                'id_user' => $request->id_user,
                'description' => 'Recarga de saldo',
                'amount' => $request->amount,
                'id_wallet_type' => 1, // 1 = Recarga (PUSH)
                'id_transaction' => $paymentIntent->id
            ]);

            // Obtener el saldo actualizado del usuario
            $saldoTotal = Wallet::where('id_user', $request->id_user)->sum('amount');

            return response()->json([
                'message' => 'Saldo añadido con éxito',
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
     * POP (POP): Retirar saldo y hacer un reembolso de una recarga
     * @param \Illuminate\Http\Request $request
     * @return mixed|\Illuminate\Http\JsonResponse
     */
    public function popFromRecharge(Request $request)
    {
        $request->validate([
            'id_user' => 'required|exists:users,id_user',
            'amount' => 'required|numeric|min:1',
            'payment_intent_id' => 'required|string'
        ]);

        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

        try {
            // Obtener el saldo actual del usuario sumando todas sus transacciones
            $availableBalance = Wallet::where('id_user', $request->id_user)->sum('amount');

            if ($availableBalance < $request->amount) {
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
            $totalBalance = Wallet::where('id_user', $request->id_user)->sum('amount');

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
                    'amount' => $totalBalance
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
     * POP (POP): Retirar saldo y hacer un reembolso directamente del saldo
     * @param \Illuminate\Http\Request $request
     * @return mixed|\Illuminate\Http\JsonResponse
     */
    public function popFromBalance(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        // Obtener el usuario autenticado
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

        try {
            // Obtener el saldo del usuario autenticado
            $availableBalance = Wallet::where('id_user', $user->id_user)->sum('amount');

            if ($availableBalance < $request->amount) {
                return response()->json(['error' => 'Fondos insuficientes en el monedero'], 400);
            }

            // Verificar que el usuario tiene un cliente en Stripe
            if (!$user->stripe_customer_id) {
                return response()->json(['error' => 'El usuario no tiene cuenta en Stripe'], 400);
            }

            // Obtener el método de pago predeterminado
            $customer = Customer::retrieve($user->stripe_customer_id);
            if (!$customer->invoice_settings || !$customer->invoice_settings->default_payment_method) {
                return response()->json(['error' => 'No hay método de pago predeterminado en Stripe'], 400);
            }

            $defaultPaymentMethod = $customer->invoice_settings->default_payment_method;
            $paymentMethod = PaymentMethod::retrieve($defaultPaymentMethod);
            $paymentType = $paymentMethod->type;

            if ($paymentType === 'card') {
                $refundPayment = PaymentIntent::create([
                    'amount' => $request->amount * 100, // Convertir a céntimos
                    'currency' => 'eur',
                    'customer' => $user->stripe_customer_id,
                    'payment_method' => $defaultPaymentMethod,
                    'confirm' => true,
                    'capture_method' => 'automatic',
                    'automatic_payment_methods' => [
                        'enabled' => true,
                        'allow_redirects' => 'never',
                    ],
                ]);
            } elseif (in_array($paymentType, ['sepa_debit', 'ach_debit'])) {
                $refundPayment = PaymentIntent::create([
                    'amount' => $request->amount * 100,
                    'currency' => 'eur',
                    'customer' => $user->stripe_customer_id,
                    'payment_method' => $defaultPaymentMethod,
                    'confirm' => true,
                    'capture_method' => 'automatic',
                    'return_url' => 'https://tusitio.com/confirmacion-reembolso',
                ]);
            } else {
                return response()->json(['error' => 'Tipo de pago no compatible para reembolsos'], 400);
            }

            // Registrar el reembolso en la base de datos
            $transaction = Wallet::create([
                'id_user' => $user->id_user,
                'description' => 'Reembolso desde saldo',
                'amount' => -$request->amount,
                'id_wallet_type' => 3,
                'id_transaction' => $refundPayment->id
            ]);

            // Obtener el saldo actualizado
            $totalBalance = Wallet::where('id_user', $user->id_user)->sum('amount');

            return response()->json([
                'message' => 'Reembolso desde saldo exitoso',
                'refund' => [
                    'id' => $refundPayment->id,
                    'amount' => $refundPayment->amount / 100,
                    'status' => $refundPayment->status
                ],
                'wallet' => [
                    'id_wallet' => $transaction->id_wallet,
                    'id_user' => $transaction->id_user,
                    'amount' => $totalBalance
                ],
                'transaction' => [
                    'id_wallet' => $transaction->id_wallet,
                    'amount' => $transaction->amount,
                    'id_transaction' => $transaction->id_transaction
                ]
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error en el reembolso desde saldo: ' . $e->getMessage()
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
        $totalBalance = Wallet::where('id_user', $user->id_user)->sum('amount');

        return response()->json([
            'balance' => $totalBalance
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
