<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\VerifyEmail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class EmailVerificationController extends Controller
{
    /**
     * Kirim email verifikasi ke user yang sedang login.
     */
    public function send(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email sudah terverifikasi.',
            ], 422);
        }

        $this->sendVerificationEmail($user);

        return response()->json([
            'message' => 'Email verifikasi telah dikirim. Silakan cek inbox Anda.',
        ]);
    }

    /**
     * Verifikasi email berdasarkan token.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User tidak ditemukan.',
            ], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email sudah terverifikasi.',
            ], 422);
        }

        if (!hash_equals($user->remember_token ?? '', $request->token)) {
            return response()->json([
                'message' => 'Token verifikasi tidak valid.',
            ], 422);
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'remember_token' => null,
        ])->save();

        return response()->json([
            'message' => 'Email berhasil diverifikasi. Anda sekarang bisa menggunakan semua fitur.',
        ]);
    }

    /**
     * Kirim ulang email verifikasi.
     */
    public function resend(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email tidak ditemukan.',
            ], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email sudah terverifikasi.',
            ], 422);
        }

        $this->sendVerificationEmail($user);

        return response()->json([
            'message' => 'Kode verifikasi baru telah dikirim. Silakan cek inbox email Anda.',
        ]);
    }

    /**
     * Generate dan kirim email verifikasi.
     */
    private function sendVerificationEmail(User $user): void
    {
        $token = Str::random(6);

        $user->update([
            'remember_token' => $token,
        ]);

        try {
            Mail::to($user->email)->send(
                new VerifyEmail($user, $token)
            );
        } catch (\Exception $e) {
            \Log::warning(
                'Gagal mengirim email verifikasi: ' . $e->getMessage()
            );
        }
    }
}