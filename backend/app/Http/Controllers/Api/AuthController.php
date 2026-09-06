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

        // Cek apakah email sudah diverifikasi
        if (! $user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => ['Email belum diverifikasi. Silakan cek inbox Anda untuk kode verifikasi.'],
            ]);
        }

        // Hapus seluruh token lama agar satu akun hanya memiliki
        // satu sesi aktif pada satu waktu.
        $remember = $validated['remember'] ?? false;
        $user->tokens()->delete();
        // Buat token API menggunakan Sanctum.
        $newToken = $user->createToken('api-token');
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
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $validated['role'],
        ]);

        // Kirim email verifikasi
        try {
            $token = \Illuminate\Support\Str::random(6);
            $user->update(['remember_token' => $token]);
            \Mail::to($user->email)->send(new \App\Mail\VerifyEmail($user, $token));
        } catch (\Exception $e) {
            \Log::warning('Gagal mengirim email verifikasi: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Registrasi berhasil. Silakan cek email Anda untuk kode verifikasi.',
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
