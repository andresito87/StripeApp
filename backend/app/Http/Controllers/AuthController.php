<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    private $jwt_secret;

    public function __construct()
    {
        $this->jwt_secret = env('JWT_SECRET', 'tu_clave_secreta'); // Define la clave secreta
    }

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

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Usuario registrado con éxito'], 201);
    }

    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        $payload = [
            'iss' => "miapilaravel", // Identificador del emisor
            'sub' => $user->id_user, // ID del usuario
            'iat' => time(), // Fecha de emisión
            'exp' => time() + 60 * 60 // Expira en 1 hora
        ];

        $token = JWT::encode($payload, $this->jwt_secret, 'HS256');

        $user->api_token = $token;
        $user->save();

        return response()->json(['token' => $token]);
    }

    /**
     * Cerrar sesión eliminando el token del usuario
     */
    public function logout(Request $request)
    {
        // 🔹 Eliminar el token del usuario autenticado
        $request->user()->tokens()->delete();

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

