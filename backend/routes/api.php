<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\WalletController;
use App\Http\Middleware\JwtMiddleware;
use Illuminate\Support\Facades\Route;

// 🔹 Rutas de autenticación
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// 🔹 Rutas protegidas con JWT
Route::middleware([JwtMiddleware::class])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/wallet/balance', [WalletController::class, 'getBalance']);
    Route::post('/wallet/put', [WalletController::class, 'put']);
    Route::post('/wallet/pop', [WalletController::class, 'pop']);
    Route::get('/wallet/transactions', [WalletController::class, 'getTransactions']);
});
