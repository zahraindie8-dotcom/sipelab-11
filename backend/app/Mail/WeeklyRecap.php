<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\Lab;
use App\Models\Report;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class WeeklyRecap extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public array $stats,
        public array $pendingBookings,
        public array $topLabs,
        public array $recentReports,
        public string $weekLabel,
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Rekap Mingguan SiLab — {$this->weekLabel}",
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
     * Build the HTML content for the weekly recap email.
     */
    private function buildHtml(): string
    {
        $stats = $this->stats;
        $pending = $this->pendingBookings;
        $topLabs = $this->topLabs;
        $reports = $this->recentReports;

        $pendingRows = '';
        foreach ($pending as $b) {
            $pendingRows .= <<<HTML
            <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 13px;">{$b['lab_name']}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">{$b['user_name']}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">{$b['date']}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">{$b['time']}</td>
            </tr>
HTML;
        }

        $labRows = '';
        foreach ($topLabs as $lab) {
            $width = max(($lab['count'] / max(array_column($topLabs, 'count'), 1)) * 100, 5);
            $labRows .= <<<HTML
            <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 13px; font-weight: 600;">{$lab['name']}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; width: 60%;">
                    <div style="background: #e2e8f0; border-radius: 6px; height: 8px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #6366f1, #818cf8); height: 100%; width: {$width}%; border-radius: 6px;"></div>
                    </div>
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #6366f1; font-size: 13px; font-weight: 700; text-align: right;">{$lab['count']}</td>
            </tr>
HTML;
        }

        $reportRows = '';
        foreach ($reports as $r) {
            $reportRows .= <<<HTML
            <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 13px;">{$r['lab_name']}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">{$r['user_name']}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">{$r['date']}</td>
            </tr>
HTML;
        }

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
                <table width="640" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3730a3 100%); padding: 32px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">📊 Rekap Mingguan</h1>
                            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">{$this->weekLabel}</p>
                            <p style="margin: 4px 0 0; color: rgba(255,255,255,0.7); font-size: 12px;">SiLab — Smart Lab Management System</p>
                        </td>
                    </tr>

                    <!-- Summary Cards -->
                    <tr>
                        <td style="padding: 28px 24px 0;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="25%" style="padding: 0 4px;">
                                        <div style="background: #eff6ff; border-radius: 10px; padding: 16px; text-align: center;">
                                            <p style="margin: 0; color: #3b82f6; font-size: 24px; font-weight: 800;">{$stats['total_bookings']}</p>
                                            <p style="margin: 4px 0 0; color: #64748b; font-size: 11px;">Booking Minggu Ini</p>
                                        </div>
                                    </td>
                                    <td width="25%" style="padding: 0 4px;">
                                        <div style="background: #ecfdf5; border-radius: 10px; padding: 16px; text-align: center;">
                                            <p style="margin: 0; color: #10b981; font-size: 24px; font-weight: 800;">{$stats['approved']}</p>
                                            <p style="margin: 4px 0 0; color: #64748b; font-size: 11px;">Disetujui</p>
                                        </div>
                                    </td>
                                    <td width="25%" style="padding: 0 4px;">
                                        <div style="background: #fef3c7; border-radius: 10px; padding: 16px; text-align: center;">
                                            <p style="margin: 0; color: #f59e0b; font-size: 24px; font-weight: 800;">{$stats['pending']}</p>
                                            <p style="margin: 4px 0 0; color: #64748b; font-size: 11px;">Menunggu</p>
                                        </div>
                                    </td>
                                    <td width="25%" style="padding: 0 4px;">
                                        <div style="background: #fdf2f8; border-radius: 10px; padding: 16px; text-align: center;">
                                            <p style="margin: 0; color: #ec4899; font-size: 24px; font-weight: 800;">{$stats['reports']}</p>
                                            <p style="margin: 4px 0 0; color: #64748b; font-size: 11px;">Laporan</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Pending Approvals -->
HTML;

        if (count($pending) > 0) {
            $html .= <<<HTML
                    <tr>
                        <td style="padding: 28px 24px 0;">
                            <h2 style="margin: 0 0 12px; color: #1e293b; font-size: 16px; font-weight: 700;">⏳ Menunggu Persetujuan ({$stats['pending']})</h2>
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                                <thead>
                                    <tr style="background-color: #f8fafc;">
                                        <th style="padding: 10px 12px; text-align: left; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Lab</th>
                                        <th style="padding: 10px 12px; text-align: left; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Pemesan</th>
                                        <th style="padding: 10px 12px; text-align: left; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Tanggal</th>
                                        <th style="padding: 10px 12px; text-align: left; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Jam</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {$pendingRows}
                                </tbody>
                            </table>
                        </td>
                    </tr>
HTML;
        }

        $html .= <<<HTML

                    <!-- Top Labs -->
                    <tr>
                        <td style="padding: 28px 24px 0;">
                            <h2 style="margin: 0 0 12px; color: #1e293b; font-size: 16px; font-weight: 700;">🏆 Lab Terpopuler</h2>
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                                <thead>
                                    <tr style="background-color: #f8fafc;">
                                        <th style="padding: 10px 12px; text-align: left; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Lab</th>
                                        <th style="padding: 10px 12px; text-align: left; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Penggunaan</th>
                                        <th style="padding: 10px 12px; text-align: right; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Booking</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {$labRows}
                                </tbody>
                            </table>
                        </td>
                    </tr>
HTML;

        if (count($reports) > 0) {
            $html .= <<<HTML

                    <!-- Recent Reports -->
                    <tr>
                        <td style="padding: 28px 24px 0;">
                            <h2 style="margin: 0 0 12px; color: #1e293b; font-size: 16px; font-weight: 700;">📸 Laporan Terbaru</h2>
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                                <thead>
                                    <tr style="background-color: #f8fafc;">
                                        <th style="padding: 10px 12px; text-align: left; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Lab</th>
                                        <th style="padding: 10px 12px; text-align: left; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Pelapor</th>
                                        <th style="padding: 10px 12px; text-align: left; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {$reportRows}
                                </tbody>
                            </table>
                        </td>
                    </tr>
HTML;
        }

        $html .= <<<HTML

                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 28px 24px; text-align: center;">
                            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; box-shadow: 0 4px 12px rgba(99,102,241,0.3);">Lihat Dashboard →</a>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0 0 4px; color: #94a3b8; font-size: 12px;">
                                Email rekap mingguan ini dikirim otomatis oleh SiLab.
                            </p>
                            <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                                Smart Lab Management System · © {$_SERVER['SERVER_NAME'] ?? 'SiLab'}
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
