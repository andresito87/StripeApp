<?php

namespace App\Http\Controllers;

use App\Models\DisputedTransaction;
use App\Models\User;
use Carbon\Carbon;
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
            'payment_method_id' => 'required_without:payment_intent_id|string|nullable',
            'payment_intent_id' => 'required_without:payment_method_id|string|nullable'
        ]);

        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

        try {
            $user = User::find($request->id_user);
            if (!$user || !$user->stripe_customer_id) {
                return response()->json(['error' => 'El usuario no tiene cuenta en Stripe'], 400);
            }

            if ($request->filled('payment_method_id')) {
                // Asociar método de pago si no lo está
                PaymentMethod::retrieve($request->payment_method_id)
                    ->attach(['customer' => $user->stripe_customer_id]);

                // Crear un nuevo PaymentIntent
                $paymentIntent = PaymentIntent::create([
                    'amount' => $request->amount * 100,
                    'currency' => 'eur',
                    'customer' => $user->stripe_customer_id,
                    'payment_method' => $request->payment_method_id,
                    'confirmation_method' => 'manual',
                    'confirm' => true,
                    'use_stripe_sdk' => true,
                    'payment_method_types' => ['card'],
                ]);

            } else {
                // Confirmar PaymentIntent existente
                $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);
                $paymentIntent->confirm();
            }

            // Manejar estados
            if ($paymentIntent->status === 'requires_action') {
                return response()->json([
                    'requires_action' => true,
                    'payment_intent_client_secret' => $paymentIntent->client_secret
                ]);
            } elseif ($paymentIntent->status === 'succeeded') {
                // Registrar la transacción en base de datos
                $transaction = Wallet::create([
                    'id_user' => $request->id_user,
                    'description' => 'Recarga de saldo',
                    'amount' => $request->amount,
                    'id_wallet_type' => 1,
                    'id_transaction' => $paymentIntent->id,
                    'date_created' => now(),
                    'date_verified' => now(),
                    'status' => 'succeeded'
                ]);

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
            } else {
                return response()->json(['error' => 'Estado inesperado de PaymentIntent'], 400);
            }

        } catch (Exception $e) {
            return response()->json(['error' => 'Error en la transacción: ' . $e->getMessage()], 500);
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
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        // Validar los filtros opcionales
        $request->validate([
            'creation_date' => 'nullable|date',
            'refunded_date' => 'nullable|date',
            'min_amount' => 'nullable|numeric',
            'max_amount' => 'nullable|numeric|gte:min_amount',
            'id_wallet_type' => 'nullable|integer',
            'description' => 'nullable|string',
            'reason' => 'nullable|string',
            'status' => 'nullable|string|in:succeeded,disputed,failure,refunded',
        ]);

        // Construir la consulta con filtros dinámicos
        $query = Wallet::where('id_user', $user->id_user);

        if ($request->filled('creation_date')) {
            $query->whereDate('date_created', $request->input('creation_date'));
        }

        if ($request->filled('refunded_date')) {
            $query->whereDate('date_refunded', $request->input('refunded_date'));
        }

        if ($request->filled('min_amount')) {
            $query->where('amount', '>=', $request->input('min_amount'));
        }

        if ($request->filled('max_amount')) {
            $query->where('amount', '<=', $request->input('max_amount'));
        }

        if ($request->filled('id_wallet_type')) {
            $query->where('id_wallet_type', $request->input('id_wallet_type'));
        }

        if ($request->filled('status')) {
            if ($request->input('status') === 'refunded') {
                $query->whereNotNull('id_refund');
            } else {
                $query->where('status', $request->input('status'));
            }
        }

        if ($request->filled('description')) {
            $query->where('description', 'like', '%' . $request->input('description') . '%');
        }

        if ($request->filled('reason')) {
            // Buscar transacciones con disputa que coincidan con el reason
            $disputedIds = DisputedTransaction::where('reason', 'like', '%' . $request->input('reason') . '%')
                ->pluck('payment_intent_id');

            $query->whereIn('id_transaction', $disputedIds);
        }

        // Cargar también los datos de la disputa relacionada si existe
        $transactions = $query
            ->with('dispute')
            ->with('walletTypeError')
            ->orderBy('date_created', 'asc')
            ->paginate(5, [
                'id_wallet', // lo uso como key del map() para recorrer la lista en el front
                'description',
                'amount',
                'status',
                'date_created',
                'id_wallet_type',
                'id_wallet_type_error',
                'id_transaction', // lo utilizo para localizar la disputa asociada este pago
                'id_refund', // lo utilizo para comprobar si ha sido reembolsado
                'date_verified',
                'date_refunded'
            ]);

        // Transformar resultados para incluir 'reason' si existe disputa
        $transactions->getCollection()->transform(function ($transaction) {
            $transactionArray = $transaction->toArray();
            $transactionArray['reason'] = optional($transaction->dispute)->reason;
            $transactionArray['status'] = optional($transaction->walletTypeError)->description;
            return $transactionArray;
        });

        return response()->json([
            'user' => [
                'id_user' => $user->id_user,
                'name' => $user->name,
                'email' => $user->email
            ],
            'transactions' => $transactions
        ], 200);

    }

    /**
     * Obtener el listado de transacciones del usuario
     * @param \Illuminate\Http\Request $request
     * @return mixed|\Illuminate\Http\JsonResponse
     */
    public function getGraphicsData(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        // Cargar transacciones con relaciones
        $transactions = Wallet::with('walletTypeError')
            ->where('id_user', $user->id_user)
            ->get();

        // Inicializar resumen
        $resumen_tipo_transacciones = [
            'succeeded' => 0,
            'failed' => 0,
            'disputed' => 0,
            'requires_action' => 0,
            'blocked' => 0
        ];

        // Para agrupar por mes
        $succeededPerMonth = [];
        $dsiputedPerMonth = [];

        $transactions->each(function ($transaction) use (&$resumen_tipo_transacciones, &$succeededPerMonth, &$dsiputedPerMonth) {
            $typeId = optional($transaction->walletTypeError)->id_wallet_type_error;
            $mes = Carbon::parse($transaction->created_at)->month;

            switch ($typeId) {
                case 1:
                    $resumen_tipo_transacciones['succeeded']++;
                    $succeededPerMonth[$mes] = ($succeededPerMonth[$mes] ?? 0) + 1;
                    break;
                case 2:
                    $resumen_tipo_transacciones['failed']++;
                    break;
                case 3:
                    $resumen_tipo_transacciones['disputed']++;
                    $dsiputedPerMonth[$mes] = ($dsiputedPerMonth[$mes] ?? 0) + 1;
                    break;
                case 4:
                    $resumen_tipo_transacciones['requires_action']++;
                    break;
                default:
                    $resumen_tipo_transacciones['blocked']++;
            }
        });


        // Nombres de los meses en español
        $meses = [
            1 => 'Enero',
            2 => 'Febrero',
            3 => 'Marzo',
            4 => 'Abril',
            5 => 'Mayo',
            6 => 'Junio',
            7 => 'Julio',
            8 => 'Agosto',
            9 => 'Septiembre',
            10 => 'Octubre',
            11 => 'Noviembre',
            12 => 'Diciembre'
        ];

        $transaccionesMensuales = [];

        // Construir el array final con todos los meses
        for ($i = 1; $i <= 12; $i++) {
            $transaccionesMensuales[] = [
                'mes' => $meses[$i],
                'exitosas' => $succeededPerMonth[$i] ?? 0,
                'disputadas' => $dsiputedPerMonth[$i] ?? 0
            ];
        }

        // Convertir el resumen a formato para gráfico
        $resumen_data_tipos = [
            ['id' => 'Éxito', 'label' => 'Éxito', 'value' => $resumen_tipo_transacciones['succeeded']],
            ['id' => 'Fallido', 'label' => 'Fallido', 'value' => $resumen_tipo_transacciones['failed']],
            ['id' => 'En disputa', 'label' => 'En disputa', 'value' => $resumen_tipo_transacciones['disputed']],
            ['id' => 'Acción requerida', 'label' => 'Acción requerida', 'value' => $resumen_tipo_transacciones['requires_action']],
            ['id' => 'Bloqueado', 'label' => 'Bloqueado', 'value' => $resumen_tipo_transacciones['blocked']],
        ];

        return response()->json([
            'user' => [
                'id_user' => $user->id_user,
                'name' => $user->name,
                'email' => $user->email
            ],
            'resumen_tipo_transacciones' => $resumen_data_tipos,
            'transacciones_mensuales' => $transaccionesMensuales
        ], 200);
    }


}
