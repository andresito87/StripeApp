<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

// 🔹 Definir el Rate Limiter API
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by(optional($request->user())->id ?: $request->ip());
});

// 🔹 Rutas de autenticación con Sanctum
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// 🔹 Rutas protegidas con Sanctum y Rate Limiting
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    // 🔹 Obtener datos del usuario autenticado
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    // 🔹 Monedero (Wallet)
    Route::post('/wallet/put', [WalletController::class, 'put']);  // Recargar saldo (PUSH)
    Route::post('/wallet/pop', [WalletController::class, 'pop']);  // Retirar saldo (POP)
    Route::get('/wallet/balance', [WalletController::class, 'getBalance']);  // Consultar saldo
    Route::get('/wallet/transactions', [WalletController::class, 'getTransactions']);  // Obtener todas las transacciones
});

