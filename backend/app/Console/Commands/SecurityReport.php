<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;

class SecurityReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'security:report 
                            {--period=24h : Report period (24h, 7d, 30d)} 
                            {--format=table : Output format (table, json, text)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate security monitoring report';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $period = $this->option('period');
        $format = $this->option('format');

        $this->info('');
        $this->info('╔════════════════════════════════════════════════════════════╗');
        $this->info('║           SiLab Security Monitoring Report                ║');
        $this->info('╚════════════════════════════════════════════════════════════╝');
        $this->info('');
        $this->info("Report Period: {$period}");
        $this->info("Generated: " . now()->format('Y-m-d H:i:s'));
        $this->info('');

        $since = $this->getSinceDate($period);

        // Authentication Stats
        $this->printSection('Authentication Statistics');
        $this->printAuthStats($since);

        // Failed Login Attempts
        $this->printSection('Failed Login Attempts');
        $this->printFailedLogins($since);

        // Rate Limiting Events
        $this->printSection('Rate Limiting Events');
        $this->printRateLimitEvents($since);

        // File Upload Activity
        $this->printSection('File Upload Activity');
        $this->printFileUploads($since);

        // Admin Actions
        $this->printSection('Admin Actions');
        $this->printAdminActions($since);

        // Security Log Summary
        $this->printSection('Security Log Summary');
        $this->printSecurityLogSummary($since);

        // Recommendations
        $this->printSection('Security Recommendations');
        $this->printRecommendations($since);

        return 0;
    }

    /**
     * Get the "since" date based on period.
     */
    private function getSinceDate(string $period): Carbon
    {
        return match ($period) {
            '24h' => now()->subHours(24),
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            default => now()->subHours(24),
        };
    }

    /**
     * Print section header.
     */
    private function printSection(string $title): void
    {
        $this->info('┌────────────────────────────────────────────────────────────┐');
        $this->info("│ {$title}");
        $this->info('└────────────────────────────────────────────────────────────┘');
    }

    /**
     * Print authentication statistics.
     */
    private function printAuthStats(Carbon $since): void
    {
        $logPath = storage_path('logs/auth.log');

        if (!File::exists($logPath)) {
            $this->warn('  No auth log found. Authentication logging may not be enabled.');
            $this->info('');
            return;
        }

        $content = File::get($logPath);
        $lines = explode("\n", $content);

        $successCount = 0;
        $failureCount = 0;
        $uniqueIPs = [];

        foreach ($lines as $line) {
            if (empty($line)) continue;

            // Parse log entry
            if (str_contains($line, 'Auth success')) {
                $successCount++;
                if (preg_match('/ip.*?(\d+\.\d+\.\d+\.\d+)/', $line, $matches)) {
                    $uniqueIPs[$matches[1]] = true;
                }
            } elseif (str_contains($line, 'Auth failure')) {
                $failureCount++;
            }
        }

        $this->info("  Total Login Success: {$successCount}");
        $this->info("  Total Login Failures: {$failureCount}");

        if ($failureCount > 0) {
            $failureRate = round(($failureCount / max($successCount + $failureCount, 1)) * 100, 2);
            $this->warn("  Failure Rate: {$failureRate}%");

            if ($failureRate > 20) {
                $this->error("  ⚠ WARNING: High failure rate detected! Possible brute force attack.");
            }
        }

        $this->info("  Unique IPs: " . count($uniqueIPs));
        $this->info('');
    }

    /**
     * Print failed login attempts.
     */
    private function printFailedLogins(Carbon $since): void
    {
        $logPath = storage_path('logs/security.log');

        if (!File::exists($logPath)) {
            $this->warn('  No security log found.');
            $this->info('');
            return;
        }

        $content = File::get($logPath);
        $lines = explode("\n", $content);

        $failedAttempts = [];
        $suspiciousIPs = [];

        foreach ($lines as $line) {
            if (str_contains($line, 'Auth failure') || str_contains($line, 'Access denied')) {
                $failedAttempts[] = $line;

                // Track suspicious IPs
                if (preg_match('/ip.*?(\d+\.\d+\.\d+\.\d+)/', $line, $matches)) {
                    $ip = $matches[1];
                    $suspiciousIPs[$ip] = ($suspiciousIPs[$ip] ?? 0) + 1;
                }
            }
        }

        $this->info("  Failed Attempts Found: " . count($failedAttempts));

        if (!empty($suspiciousIPs)) {
            arsort($suspiciousIPs);
            $topSuspicious = array_slice($suspiciousIPs, 0, 5, true);

            $this->warn('  Top Suspicious IPs:');
            foreach ($topSuspicious as $ip => $count) {
                $this->warn("    {$ip}: {$count} attempts");
            }
        }

        $this->info('');
    }

    /**
     * Print rate limiting events.
     */
    private function printRateLimitEvents(Carbon $since): void
    {
        $logPath = storage_path('logs/security.log');

        if (!File::exists($logPath)) {
            $this->warn('  No security log found.');
            $this->info('');
            return;
        }

        $content = File::get($logPath);
        $lines = explode("\n", $content);

        $rateLimitCount = 0;

        foreach ($lines as $line) {
            if (str_contains($line, 'Rate limit exceeded')) {
                $rateLimitCount++;
            }
        }

        $this->info("  Rate Limit Events: {$rateLimitCount}");

        if ($rateLimitCount > 100) {
            $this->error("  ⚠ WARNING: High rate limiting activity! Possible DDoS attempt.");
        } elseif ($rateLimitCount > 50) {
            $this->warn("  ⚠ Elevated rate limiting activity detected.");
        }

        $this->info('');
    }

    /**
     * Print file upload activity.
     */
    private function printFileUploads(Carbon $since): void
    {
        $logPath = storage_path('logs/security.log');

        if (!File::exists($logPath)) {
            $this->warn('  No security log found.');
            $this->info('');
            return;
        }

        $content = File::get($logPath);
        $lines = explode("\n", $content);

        $uploadCount = 0;

        foreach ($lines as $line) {
            if (str_contains($line, 'File upload')) {
                $uploadCount++;
            }
        }

        $this->info("  File Uploads: {$uploadCount}");

        // Check storage usage
        $storagePath = storage_path('app/private/reports');
        if (File::isDirectory($storagePath)) {
            $files = File::files($storagePath);
            $totalSize = 0;
            foreach ($files as $file) {
                $totalSize += $file->getSize();
            }
            $this->info("  Private Storage Files: " . count($files));
            $this->info("  Storage Used: " . $this->formatBytes($totalSize));
        }

        $this->info('');
    }

    /**
     * Print admin actions.
     */
    private function printAdminActions(Carbon $since): void
    {
        $logPath = storage_path('logs/security.log');

        if (!File::exists($logPath)) {
            $this->warn('  No security log found.');
            $this->info('');
            return;
        }

        $content = File::get($logPath);
        $lines = explode("\n", $content);

        $adminActions = [];

        foreach ($lines as $line) {
            if (str_contains($line, 'Admin action')) {
                $adminActions[] = $line;
            }
        }

        $this->info("  Admin Actions: " . count($adminActions));

        if (!empty($adminActions)) {
            $this->info('  Recent Admin Actions (last 5):');
            $recent = array_slice($adminActions, -5);
            foreach ($recent as $action) {
                $this->info("    • " . substr($action, 0, 100));
            }
        }

        $this->info('');
    }

    /**
     * Print security log summary.
     */
    private function printSecurityLogSummary(Carbon $since): void
    {
        $logPath = storage_path('logs/security.log');

        if (!File::exists($logPath)) {
            $this->warn('  No security log found.');
            $this->info('');
            return;
        }

        $logSize = File::size($logPath);
        $content = File::get($logPath);
        $lines = array_filter(explode("\n", $content));

        $warningCount = substr_count($content, '"level":"warning"');
        $errorCount = substr_count($content, '"level":"error"');

        $this->info("  Log File Size: " . $this->formatBytes($logSize));
        $this->info("  Total Log Entries: " . count($lines));
        $this->warn("  Warning Events: {$warningCount}");
        $this->error("  Error Events: {$errorCount}");

        $this->info('');
    }

    /**
     * Print security recommendations.
     */
    private function printRecommendations(Carbon $since): void
    {
        $recommendations = [];

        // Check if APP_DEBUG is enabled
        if (config('app.debug')) {
            $recommendations[] = [
                'HIGH',
                'APP_DEBUG is enabled. Disable in production to prevent information leakage.',
            ];
        }

        // Check session lifetime
        if (config('session.lifetime') > 120) {
            $recommendations[] = [
                'MEDIUM',
                'Session lifetime is greater than 2 hours. Consider reducing for better security.',
            ];
        }

        // Check Sanctum token expiry
        $sanctumExpiry = config('sanctum.expiration');
        if ($sanctumExpiry === null || $sanctumExpiry > 1440) {
            $recommendations[] = [
                'MEDIUM',
                'Sanctum token expiry is not set or too long. Recommended: 1440 minutes (24h).',
            ];
        }

        // Check private storage exists
        $privatePath = storage_path('app/private');
        if (!File::isDirectory($privatePath)) {
            $recommendations[] = [
                'HIGH',
                'Private storage directory does not exist. Create: storage/app/private/',
            ];
        }

        if (empty($recommendations)) {
            $this->info('  ✅ No security issues found. All checks passed!');
        } else {
            foreach ($recommendations as [$severity, $message]) {
                $icon = match ($severity) {
                    'HIGH' => '🔴',
                    'MEDIUM' => '🟡',
                    'LOW' => '🟢',
                    default => '⚪',
                };
                $this->info("  {$icon} [{$severity}] {$message}");
            }
        }

        $this->info('');
    }

    /**
     * Format bytes to human readable.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
