<?php

namespace App\Http\Controllers;

use App\Models\User;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PragmaRX\Google2FA\Google2FA;
use Illuminate\Support\Facades\Validator;
use Firebase\JWT\JWT;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class TwoFactorController extends Controller
{
    private $google2fa;
    private $jwt_secret;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
        $this->jwt_secret = env('JWT_SECRET', 'tu_clave_secreta');
    }

    /**
     * Genera un secreto y retorna el QR code (en base64) para habilitar 2FA.
     * Este endpoint requiere que el usuario ya esté autenticado (token final).
     */
    public function generateSecret(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // Genera un nuevo secreto
        $secret = $this->google2fa->generateSecretKey();

        // Guarda el secreto en el usuario (sin habilitar 2FA todavía)
        $user->google2fa_secret = $secret;
        if ($user instanceof User) {
            $user->save();
        } else {
            // no hay un usuario logueado
            return response()->json(['message' => 'El usuario logueado no es válido'], 500);
        }

        // Genera el URI otpauth
        $otpauthUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        // Genera el QR code en formato PNG y lo codifica en base64
        $qrImage = QrCode::format('png')->size(300)->generate($otpauthUrl);
        $qrBase64 = base64_encode($qrImage);

        return response()->json([
            'qr_image' => $qrBase64,
            'message' => 'Secret generado correctamente. Escanea el QR para habilitar 2FA.'
        ], 200);
    }


    /**
     * Verifica el OTP ingresado para habilitar 2FA desde el panel de usuario.
     * Si es correcto, se activa 2FA en la cuenta.
     */
    public function verifyEnablement(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'otp' => 'required|digits:6'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $secret = $user->google2fa_secret;
        if (!$this->google2fa->verifyKey($secret, $request->otp)) {
            return response()->json(['message' => 'Código OTP inválido'], 400);
        }

        // Marca 2FA como habilitado
        $user->google2fa_enabled = true;
        if ($user instanceof User) {
            $user->save();
        } else {
            // no hay un usuario logueado
            return response()->json(['message' => 'El usuario logueado no es válido'], 500);
        }

        return response()->json(['message' => '2FA habilitado correctamente'], 200);
    }

    /**
     * Verifica el OTP durante el login utilizando un token temporal.
     * Si es correcto, emite el token final de autenticación.
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|digits:6'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        if (!$user->google2fa_enabled) {
            return response()->json(['message' => 'Este usuario no tiene 2FA activado'], 400);
        }

        // Verificar OTP
        if (!$this->google2fa->verifyKey($user->google2fa_secret, $request->otp)) {
            return response()->json(['message' => 'Código OTP inválido'], 401);
        }

        // Generar token JWT final tras verificar el OTP
        $payload = [
            'iss' => "miapilaravel",
            'sub' => $user->id_user,
            'iat' => time(),
            'exp' => time() + 3600
        ];

        $token = JWT::encode($payload, $this->jwt_secret, 'HS256');

        $user->api_token = $token;
        $user->save();

        return response()->json(['token' => $token], 200);
    }


    /**
     * Retorna el QR code (en formato PNG) a partir del token temporal.
     * Útil si el usuario necesita visualizar nuevamente el código en el flujo de login.
     */
    public function getQRCode(Request $request)
    {
        $tempToken = $request->bearerToken();
        if (!$tempToken) {
            return response()->json(['message' => 'Token no proporcionado'], 401);
        }

        try {
            $decoded = JWT::decode($tempToken, new Key($this->jwt_secret, 'HS256'));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Token inválido'], 401);
        }

        if (empty($decoded->{'2fa'})) {
            return response()->json(['message' => 'Token no válido para 2FA'], 401);
        }

        $user = User::find($decoded->sub);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        if (!$user->google2fa_secret) {
            return response()->json(['message' => '2FA no configurado'], 400);
        }

        $otpauthUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $user->google2fa_secret
        );

        $qrImage = QrCode::format('png')->size(300)->generate($otpauthUrl);

        return response($qrImage, 200)->header('Content-Type', 'image/png');
    }
}
