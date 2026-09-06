<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetEmail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $code;

    public function __construct(User $user, string $code)
    {
        $this->user = $user;
        $this->code = $code;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset Password - SiLab',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    private function buildHtml(): string
    {
        $name = htmlspecialchars($this->user->name, ENT_QUOTES, 'UTF-8');
        $code = htmlspecialchars($this->code, ENT_QUOTES, 'UTF-8');

        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">SiLab</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 14px;">Smart Lab Management</p>
                </div>

                <div style="padding: 30px;">
                    <h2 style="color: #1e293b; margin: 0 0 15px; font-size: 20px;">Reset Password</h2>

                    <p style="color: #475569; line-height: 1.6; margin: 0 0 20px;">
                        Halo <strong>{$name}</strong>,
                    </p>

                    <p style="color: #475569; line-height: 1.6; margin: 0 0 20px;">
                        Anda meminta reset password. Gunakan kode berikut untuk melanjutkan:
                    </p>

                    <div style="background-color: #fef2f2; border: 2px dashed #fca5a5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                        <p style="color: #991b1b; margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Kode Reset Password</p>
                        <p style="color: #dc2626; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 8px;">{$code}</p>
                    </div>

                    <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 12px; margin: 20px 0; border-radius: 0 4px 4px 0;">
                        <p style="color: #9a3412; margin: 0; font-size: 13px;">
                            ⚠️ Kode ini berlaku selama 15 menit. Jika Anda tidak melakukan permintaan reset, abaikan email ini.
                        </p>
                    </div>
                </div>

                <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        &copy; " . date('Y') . " SiLab - Smart Lab Management System
                    </p>
                </div>
            </div>
        </body>
        </html>
        HTML;
    }

    public function attachments(): array
    {
        return [];
    }
}
