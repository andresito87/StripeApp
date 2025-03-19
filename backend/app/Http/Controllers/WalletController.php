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
     * PUSH : Recargar saldo en el monedero mediante Stripe
     * @param \Illuminate\Http\Request $request
     * @return mixed|\Illuminate\Http\JsonResponse
     */
    public function push(Request $request)
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
                'id_transaction' => $paymentIntent->id,
                'date_created' => now(),
                'date_verified' => now()
            ]);

            // Obtener el saldo actualizado del usuario
            $saldoTotal = Wallet::where('id_user', $user->id_user)
                ->whereNull('date_refunded')
                ->where('status', 'succeeded')
                ->sum('amount');

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
     * CHARGE: Retirar saldo y hacer un reembolso de una recarga
     * @param \Illuminate\Http\Request $request
     * @return mixed|\Illuminate\Http\JsonResponse
     */
    public function popFromRecharge(Request $request, $payment_intent_id)
    {
        $request->validate([
            'id_user' => 'required|exists:users,id_user',
            'amount' => 'required|numeric|min:1'
        ]);

        if (empty($payment_intent_id)) {
            return response()->json(['error' => 'El ID del Payment Intent es requerido'], 400);
        }

        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

        try {
            // Verificar si el PaymentIntent existe en Stripe
            try {
                $paymentIntent = PaymentIntent::retrieve($payment_intent_id);
            } catch (Exception $e) {
                return response()->json(['error' => 'El PaymentIntent no es válido o no existe'], 404);
            }

            $originalAmount = $paymentIntent->amount / 100; // Convertir de centimos a euros

            // Verificar si el PaymentIntent existe en la base de datos y pertenece al usuario
            $transaction = Wallet::where('id_transaction', $payment_intent_id)
                ->where('id_user', $request->id_user)
                ->first();

            if (!$transaction) {
                return response()->json(['error' => 'El PaymentIntent no pertenece al usuario o no existe en la base de datos'], 404);
            }

            // Verificar si la cantidad a reembolsar es exactamente igual al original
            if ($request->amount != $originalAmount) {
                return response()->json(['error' => 'Solo se permiten reembolsos de la cantidad total de la transacción'], 400);
            }

            // Procesar reembolso en Stripe
            $refund = Refund::create([
                'payment_intent' => $payment_intent_id,
                'amount' => $request->amount * 100, // Convertir a centimos
            ]);

            // Actualizar transacción en la base de datos
            $transaction->id_refund = $refund->id;
            $transaction->date_refunded = now();
            $transaction->id_wallet_type = 2;
            $transaction->save();

            // Obtener el saldo actualizado
            $totalBalance = Wallet::where('id_user', $request->id_user)
                ->whereNull('date_refunded')
                ->where('status', 'succeeded')
                ->sum('amount');

            return response()->json([
                'message' => 'Reembolso de transacción realizado con éxito',
                'refund' => [
                    'id' => $refund->id,
                    'amount' => $refund->amount / 100,
                    'status' => $refund->status
                ],
                'wallet' => [
                    'id_wallet' => $transaction->id_wallet,
                    'id_user' => $transaction->id_user,
                    'balance' => $totalBalance
                ],
                'transaction' => [
                    'id_refund' => $transaction->id_refund,
                    'amount' => $transaction->amount
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error en el reembolso: ' . $e->getMessage()
            ], 500);
        }
    }



    /**
     * REFUND: Retirar saldo y hacer un reembolso directamente del saldo
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
            $availableBalance = Wallet::where('id_user', $user->id_user)
                ->whereNull('date_refunded')
                ->where('status', 'succeeded')
                ->sum('amount');

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
                    'return_url' => '',
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
                'id_transaction' => $refundPayment->id,
                'id_refund' => $refundPayment->id
            ]);

            // Obtener el saldo actualizado
            $totalBalance = Wallet::where('id_user', $user->id_user)
                ->whereNull('date_refunded')
                ->where('status', 'succeeded')
                ->sum('amount');

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
        $totalBalance = Wallet::where('id_user', $user->id_user)
            ->whereNull('date_refunded')
            ->where('status', 'succeeded')
            ->sum('amount');

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
            ->orderBy('date_created', 'desc')
            ->get(['id_wallet', 'description', 'amount', 'date_created', 'id_wallet_type', 'id_transaction', 'id_refund', 'date_verified', 'date_refunded']);

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
