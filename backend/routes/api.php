<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\TwoFactorController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;


// Rutas de autenticación
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('jwt');

// Rutas públicas para 2FA en el login
// Usan tokens temporales para 2FA
Route::post('/2fa/verifyOtp', [TwoFactorController::class, 'verifyOtp']);
Route::get('/2fa/qr-image', [TwoFactorController::class, 'getQRCode']); // no usado por ahora

// Rutas para el webhook de Stripe
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook'])
    ->middleware('verify.stripe');

// Rutas protegidas (requieren token final) para gestionar la activación de 2FA en la cuenta
Route::middleware(['jwt'])->group(function () {
    // Ruta del usuario logueado
    Route::get('/user', [AuthController::class, 'user']);

    // Rutas para el Wallet
    Route::get('/wallet/balance', [WalletController::class, 'getBalance']);
    Route::post('/wallet/push', [WalletController::class, 'push']);

    // Reembolso de una transaccion
    Route::put('/wallet/refund/{payment_intent_id}', [WalletController::class, 'popFromRecharge']);

    // Reembolso de una cantidad
    Route::patch('/wallet/refund', [WalletController::class, 'popFromBalance']);
    Route::get('/wallet/transactions', [WalletController::class, 'getTransactions']);

    // Rutas para habilitar 2FA en la cuenta
    Route::post('/2fa/generate-secret', [TwoFactorController::class, 'generateSecret']);
    Route::post('/2fa/verify-enablement', [TwoFactorController::class, 'verifyEnablement']);

});
