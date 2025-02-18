<?php

use App\Http\Middleware\JwtMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Session\Middleware\StartSession;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )->withProviders(

    )->withMiddleware(function (Middleware $middleware) {
        //Registrar middlewares como alias
        $middleware->alias(
            [
                'jwt' => JwtMiddleware::class,
                'session' => StartSession::class,
            ]
        );

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
