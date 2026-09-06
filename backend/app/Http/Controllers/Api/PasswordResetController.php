<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetEmail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    /**
     * Request password reset.
     *
     * POST /api/forgot-password
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        // Tetap return success jika email tidak ditemukan
        // untuk mencegah email enumeration.
        if (!$user) {
            return response()->json([
                'message' => 'Jika email terdaftar, Anda akan menerima kode reset password.',
            ]);
        }

        // Generate kode reset 6 digit angka.
        $code = (string) random_int(100000, 999999);

        // Simpan kode sementara.
        $user->update([
            'remember_token' => $code,
        ]);

        // Kirim email reset password.
        try {
            Mail::to($user->email)->send(
                new PasswordResetEmail($user, $code)
            );
        } catch (\Throwable $e) {
            \Log::error(
                'Gagal mengirim email reset password: ' . $e->getMessage()
            );

            // Untuk development, tampilkan error supaya mudah diperbaiki.
            if (app()->environment('local')) {
                return response()->json([
                    'message' => 'Gagal mengirim email reset password.',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }

        return response()->json([
            'message' => 'Jika email terdaftar, Anda akan menerima kode reset password.',
        ]);
    }

    /**
     * Verify reset code.
     *
     * POST /api/verify-reset-code
     */
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (
            !$user ||
            !hash_equals(
                (string) ($user->remember_token ?? ''),
                (string) $request->code
            )
        ) {
            throw ValidationException::withMessages([
                'code' => ['Kode reset tidak valid.'],
            ]);
        }

        // Generate token sementara untuk proses reset password.
        $resetToken = Str::random(60);

        $user->update([
            'remember_token' => $resetToken,
        ]);

        return response()->json([
            'message' => 'Kode valid. Silakan masukkan password baru.',
            'reset_token' => $resetToken,
        ]);
    }

    /**
     * Reset password.
     *
     * POST /api/reset-password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'reset_token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::where('email', $request->email)
            ->where('remember_token', $request->reset_token)
            ->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'reset_token' => ['Token reset tidak valid atau sudah kedaluwarsa.'],
            ]);
        }

        // Update password.
        $user->update([
            'password' => Hash::make($request->password),
            'remember_token' => null,
        ]);

        // Hapus semua sesi/token login lama.
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password berhasil direset. Silakan login dengan password baru.',
        ]);
    }
}