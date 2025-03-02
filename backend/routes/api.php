<?php

use App\Http\Controllers\AuthController;
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

// Rutas protegidas (requieren token final) para gestionar la activación de 2FA en la cuenta
Route::middleware(['jwt'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);

    // Rutas para el Wallet
    Route::get('/wallet/balance', [WalletController::class, 'getBalance']);
    Route::post('/wallet/put', [WalletController::class, 'put']);
    Route::post('/wallet/popFromRecharge', [WalletController::class, 'popFromRecharge']);
    Route::post('/wallet/popFromBalance', [WalletController::class, 'popFromBalance']);
    Route::get('/wallet/transactions', [WalletController::class, 'getTransactions']);

    // Rutas para habilitar 2FA en la cuenta
    Route::post('/2fa/generate-secret', [TwoFactorController::class, 'generateSecret']);
    Route::post('/2fa/verify-enablement', [TwoFactorController::class, 'verifyEnablement']);
});
