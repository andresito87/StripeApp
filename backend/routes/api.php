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
// Estas endpoints no requieren del middleware 'jwt' final, ya que usan tokens temporales para 2FA
Route::post('/2fa/verify-login', [TwoFactorController::class, 'verifyLogin']);
Route::get('/2fa/qr-image', [TwoFactorController::class, 'getQRCode']);

// Rutas protegidas (requieren token final) para gestionar la activación de 2FA en la cuenta
Route::middleware(['jwt'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);

    // Rutas para el Wallet
    Route::get('/wallet/balance', [WalletController::class, 'getBalance']);
    Route::post('/wallet/put', [WalletController::class, 'put']);
    Route::post('/wallet/pop', [WalletController::class, 'pop']);
    Route::get('/wallet/transactions', [WalletController::class, 'getTransactions']);

    // Rutas para habilitar 2FA en la cuenta
    Route::post('/2fa/generate-secret', [TwoFactorController::class, 'generateSecret']);
    Route::post('/2fa/verify-enablement', [TwoFactorController::class, 'verifyEnablement']);
});
