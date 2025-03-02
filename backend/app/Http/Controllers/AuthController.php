<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use PragmaRX\Google2FA\Google2FA;
use Stripe\Stripe;
use Stripe\Customer;

/**
 * Controlador para gestionar la autenticacion de la api
 */
class AuthController extends Controller
{
    private $google2fa;
    private $jwt_secret;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
        $this->jwt_secret = env('JWT_SECRET', 'tu_clave_secreta');
    }

    /**
     * Registro de un usuario
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // Crear el usuario en la base de datos
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Registrar el usuario en Stripe
        try {
            Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

            $customer = Customer::create([
                'name' => $user->name,
                'email' => $user->email,
            ]);

            // Guardar el ID del cliente de Stripe en la base de datos
            $user->stripe_customer_id = $customer->id;
            $user->save();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al crear el cliente en Stripe: ' . $e->getMessage()], 500);
        }

        return response()->json([
            'message' => 'Usuario registrado con éxito y vinculado a Stripe',
            'stripe_customer_id' => $user->stripe_customer_id
        ], 201);
    }


    /**
     * Acceso mediante jwt Token
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
            'otp' => 'nullable|digits:6' // Se envía solo si 2FA está activado
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        // Si el usuario tiene 2FA activado, verifica el OTP
        if ($user->google2fa_enabled) {
            if (!$request->has('otp') || empty($request->otp)) {
                return response()->json([
                    '2fa_required' => true,
                    'message' => 'Se requiere autenticación de dos factores'
                ], 200);
            }

            // Verificar OTP
            if (!$this->google2fa->verifyKey($user->google2fa_secret, $request->otp)) {
                return response()->json(['message' => 'Código OTP inválido'], 401);
            }
        }

        // Generar token JWT final (válido 1 hora)
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
     * Cerrar sesión eliminando el token del usuario
     */
    public function logout(Request $request)
    {
        // Obtiene el ID del Middleware
        $userId = $request->get('id_user');

        if (!$userId) {
            return response()->json(['message' => 'Usuario no autenticado'], 401);
        }

        // Busca al usuario por su ID
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        // Elimina el token
        $user->api_token = null;
        $user->save();

        return response()->json(['message' => 'Sesión cerrada correctamente']);
    }

    /**
     * Obtener el usuario autenticado
     */
    public function user(Request $request)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Token no proporcionado'], 401);
        }

        try {
            $decoded = JWT::decode($token, new Key($this->jwt_secret, 'HS256'));
            $user = User::find($decoded->sub);

            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Token inválido'], 401);
        }
    }
}

