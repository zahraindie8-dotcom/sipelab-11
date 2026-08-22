<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Booking $booking,
        public string $action, // 'approved', 'rejected', 'cancelled', 'created'
        public ?string $additionalMessage = null,
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subjects = [
            'created' => 'Booking Lab Baru - Menunggu Persetujuan',
            'approved' => 'Booking Lab Disetujui',
            'rejected' => 'Booking Lab Ditolak',
            'cancelled' => 'Booking Lab Dibatalkan',
        ];

        return new Envelope(
            subject: $subjects[$this->action] ?? 'Notifikasi Booking Lab',
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
     * Build the HTML content for the email.
     */
    private function buildHtml(): string
    {
        $booking = $this->booking;
        $lab = $booking->lab;
        $user = $booking->user;

        $actionColors = [
            'created' => '#6366f1',
            'approved' => '#10b981',
            'rejected' => '#ef4444',
            'cancelled' => '#6b7280',
        ];

        $actionLabels = [
            'created' => 'Dibuat',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            'cancelled' => 'Dibatalkan',
        ];

        $color = $actionColors[$this->action] ?? '#6366f1';
        $label = $actionLabels[$this->action] ?? 'Diperbarui';

        $dateFormatted = \Carbon\Carbon::parse($booking->date)->locale('id')->isoFormat('dddd, D MMMM YYYY');

        $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, $color 0%, {$color}dd 100%); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">SiLab</h1>
                            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Smart Lab Management System</p>
                        </td>
                    </tr>
                    
                    <!-- Status Badge -->
                    <tr>
                        <td style="padding: 30px 30px 0; text-align: center;">
                            <span style="display: inline-block; background-color: {$color}20; color: $color; padding: 8px 24px; border-radius: 20px; font-size: 14px; font-weight: 600;">Booking $label</span>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 20px 30px;">
                            <p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.6;">
                                Yth. <strong>{$user->name}</strong>,
                            </p>
                            <p style="margin: 0 0 20px; color: #475569; font-size: 14px; line-height: 1.6;">
                                Booking lab Anda telah <strong style="color: $color;">$label</strong>. Berikut detailnya:
                            </p>
                            
                            <!-- Detail Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding: 16px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 120px;">Laboratorium</td>
                                                <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">{$lab->name} ({$lab->code})</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Tanggal</td>
                                                <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">$dateFormatted</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Jam</td>
                                                <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">{$booking->start_time} - {$booking->end_time}</td>
                                            </tr>
HTML;

        if ($booking->purpose) {
            $html .= <<<HTML
                                            <tr>
                                                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Tujuan</td>
                                                <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">{$booking->purpose}</td>
                                            </tr>
HTML;
        }

        if ($booking->participant_count > 0) {
            $html .= <<<HTML
                                            <tr>
                                                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Peserta</td>
                                                <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">{$booking->participant_count} orang</td>
                                            </tr>
HTML;
        }

        if ($booking->rejection_reason) {
            $html .= <<<HTML
                                            <tr>
                                                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Alasan</td>
                                                <td style="padding: 8px 0; color: #ef4444; font-size: 14px;">{$booking->rejection_reason}</td>
                                            </tr>
HTML;
        }

        if ($this->additionalMessage) {
            $html .= <<<HTML
                                            <tr>
                                                <td colspan="2" style="padding: 12px 0 4px; color: #64748b; font-size: 13px;">Pesan:</td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="padding: 0 0 8px; color: #475569; font-size: 14px; line-height: 1.5;">{$this->additionalMessage}</td>
                                            </tr>
HTML;
        }

        $html .= <<<HTML
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Action Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                                <tr>
                                    <td align="center">
                                        <a href="#" style="display: inline-block; background-color: $color; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">Lihat Detail Booking</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                                Email ini dikirim otomatis oleh Sistem Manajemen Penggunaan Lab Sekolah (SiLab).<br>
                                Jika Anda tidak merasa melakukan booking, silakan hubungi administrator.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;

        return $html;
    }
}
