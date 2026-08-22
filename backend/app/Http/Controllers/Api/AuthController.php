<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login dan terbitkan token Sanctum.
     */
    public function login(LoginRequest $request)
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        // Jika pengguna tidak memilih "remember", hapus token lama agar
        // sesi lama tidak tetap aktif. Jika memilih "remember", biarkan
        // token lama ada sehingga user bisa tetap login di perangkat lain.
        $remember = $validated['remember'] ?? false;
        if (! $remember) {
            $user->tokens()->delete();
        }

        // Buat token API menggunakan Sanctum.
        $newToken = $user->createToken('api-token');

        // Jika 'remember' diminta, set expiry token lebih panjang (30 hari).
        // Kolom expires_at mungkin belum ada di beberapa instalasi Sanctum,
        // sehingga kita tangkap error dengan tenang.
        if (! empty($remember)) {
            try {
                $accessToken = $newToken->accessToken;
                if ($accessToken) {
                    $accessToken->expires_at = now()->addDays(30);
                    $accessToken->save();
                }
            } catch (\Throwable $e) {
                // Kolom expires_at tidak ada — lanjutkan tanpa expiry.
            }
        }

        $plain = $newToken->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'token' => $plain,
            'user' => new UserResource($user),
            'remember' => (bool) $remember,
        ]);
    }

    /**
     * Register akun baru (role otomatis: siswa).
     */
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => 'siswa',
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil. Selamat datang!',
            'token' => $token,
            'user' => new UserResource($user),
        ], 201);
    }

    /**
     * Data user yang sedang login.
     */
    public function user(Request $request)
    {
        return new UserResource($request->user());
    }

    /**
     * Logout: hapus token aktif.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }
}
