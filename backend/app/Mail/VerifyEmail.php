<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyEmail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * User yang akan diverifikasi.
     */
    public User $user;

    /**
     * Token verifikasi.
     */
    public string $token;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, string $token)
    {
        $this->user = $user;
        $this->token = $token;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verifikasi Email - SiLab',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    /**
     * Build the HTML email content.
     */
    private function buildHtml(): string
    {
        $name = htmlspecialchars($this->user->name, ENT_QUOTES, 'UTF-8');
        $token = htmlspecialchars($this->token, ENT_QUOTES, 'UTF-8');
        $email = htmlspecialchars($this->user->email, ENT_QUOTES, 'UTF-8');

        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">SiLab</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 14px;">Smart Lab Management</p>
                </div>

                <div style="padding: 30px;">
                    <h2 style="color: #1e293b; margin: 0 0 15px; font-size: 20px;">Verifikasi Email Anda</h2>

                    <p style="color: #475569; line-height: 1.6; margin: 0 0 20px;">
                        Halo <strong>{$name}</strong>,
                    </p>

                    <p style="color: #475569; line-height: 1.6; margin: 0 0 20px;">
                        Terima kasih telah mendaftar di SiLab. Untuk mengaktifkan akun Anda, silakan gunakan kode verifikasi berikut:
                    </p>

                    <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                        <p style="color: #64748b; margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Kode Verifikasi</p>
                        <p style="color: #4f46e5; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 8px;">{$token}</p>
                    </div>

                    <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 20px 0 0;">
                        Kode ini berlaku selama 24 jam. Jika Anda tidak melakukan pendaftaran, abaikan email ini.
                    </p>
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

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
