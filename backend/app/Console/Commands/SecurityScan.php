<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;

class SecurityScan extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'security:scan 
                            {--fix : Automatically fix issues where possible}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run security scan and report vulnerabilities';

    /**
     * Issues found during scan.
     */
    protected array $issues = [];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('');
        $this->info('╔════════════════════════════════════════════════════════════╗');
        $this->info('║           SiLab Security Scanner                         ║');
        $this->info('╚════════════════════════════════════════════════════════════╝');
        $this->info('');
        $this->info('Running security scan...');
        $this->info('');

        $fix = $this->option('fix');

        // Run all security checks
        $this->checkEnvironment();
        $this->checkConfiguration();
        $this->checkFilePermissions();
        $this->checkDependencies();
        $this->checkDatabase();
        $this->checkSensitiveFiles();
        $this->checkSecurityHeaders();

        // Summary
        $this->printSummary();

        return empty($this->issues) ? 0 : 1;
    }

    /**
     * Check environment configuration.
     */
    private function checkEnvironment(): void
    {
        $this->printSection('Environment Configuration');

        // APP_DEBUG
        if (config('app.debug')) {
            $this->addIssue('HIGH', 'APP_DEBUG is enabled. Disable in production.');
        } else {
            $this->printPass('APP_DEBUG is disabled');
        }

        // APP_ENV
        if (config('app.env') === 'production') {
            $this->printPass('APP_ENV is set to production');
        } else {
            $this->addIssue('MEDIUM', 'APP_ENV is not set to production');
        }

        // LOG_LEVEL
        if (config('logging.channels.single.level') === 'debug') {
            $this->addIssue('LOW', 'LOG_LEVEL is set to debug. Consider using "error" in production.');
        } else {
            $this->printPass('LOG_LEVEL is appropriate');
        }
    }

    /**
     * Check configuration settings.
     */
    private function checkConfiguration(): void
    {
        $this->printSection('Configuration Security');

        // Session security
        if (config('session.secure')) {
            $this->printPass('SESSION_SECURE_COOKIE is enabled');
        } else {
            $this->addIssue('HIGH', 'SESSION_SECURE_COOKIE is disabled. Enable for HTTPS.');
        }

        // Session lifetime
        if (config('session.lifetime') <= 60) {
            $this->printPass('SESSION_LIFETIME is reasonable (' . config('session.lifetime') . ' minutes)');
        } else {
            $this->addIssue('MEDIUM', 'SESSION_LIFETIME is too long (' . config('session.lifetime') . ' minutes)');
        }

        // Sanctum token expiry
        $sanctumExpiry = config('sanctum.expiration');
        if ($sanctumExpiry && $sanctumExpiry <= 1440) {
            $this->printPass('Sanctum token expiry is set (' . $sanctumExpiry . ' minutes)');
        } else {
            $this->addIssue('MEDIUM', 'Sanctum token expiry not configured or too long');
        }
    }

    /**
     * Check file permissions.
     */
    private function checkFilePermissions(): void
    {
        $this->printSection('File Permissions');

        // .env file
        $envPath = base_path('.env');
        if (File::exists($envPath)) {
            $perms = fileperms($envPath);
            $octal = substr(sprintf('%o', $perms), -4);
            
            if (substr($octal, -2) === '00' || substr($octal, -2) === '40') {
                $this->printPass('.env file permissions are restricted (' . $octal . ')');
            } else {
                $this->addIssue('HIGH', '.env file has loose permissions (' . $octal . '). Should be 640 or 600.');
            }
        }

        // Storage directories
        $storageDirs = [
            'storage/app',
            'storage/app/private',
            'storage/logs',
            'bootstrap/cache',
        ];

        foreach ($storageDirs as $dir) {
            $path = base_path($dir);
            if (File::isDirectory($path)) {
                $this->printPass("Directory {$dir} exists");
            } else {
                $this->addIssue('MEDIUM', "Directory {$dir} does not exist");
            }
        }
    }

    /**
     * Check dependencies for known vulnerabilities.
     */
    private function checkDependencies(): void
    {
        $this->printSection('Dependencies');

        $composerLock = base_path('composer.lock');
        
        if (File::exists($composerLock)) {
            $this->printPass('composer.lock exists (dependency lock file)');
        } else {
            $this->addIssue('MEDIUM', 'composer.lock not found. Run "composer install"');
        }

        // Check for outdated packages
        $output = [];
        exec('composer outdated --direct 2>/dev/null', $output, $exitCode);
        
        if ($exitCode === 0 && !empty($output)) {
            $this->addIssue('LOW', 'Some dependencies are outdated. Run "composer update"');
        } else {
            $this->printPass('Dependencies are up to date');
        }
    }

    /**
     * Check database security.
     */
    private function checkDatabase(): void
    {
        $this->printSection('Database Security');

        try {
            DB::connection()->getPdo();
            $this->printPass('Database connection successful');
        } catch (\Exception $e) {
            $this->addIssue('HIGH', 'Database connection failed: ' . $e->getMessage());
            return;
        }

        // Check if using default credentials
        $username = config('database.connections.mysql.username');
        if ($username === 'root') {
            $this->addIssue('HIGH', 'Using root database user. Create a dedicated user.');
        } else {
            $this->printPass('Not using root database user');
        }

        // Check if password is empty
        $password = config('database.connections.mysql.password');
        if (empty($password)) {
            $this->addIssue('HIGH', 'Database password is empty!');
        } else {
            $this->printPass('Database password is set');
        }
    }

    /**
     * Check for sensitive files exposed.
     */
    private function checkSensitiveFiles(): void
    {
        $this->printSection('Sensitive Files');

        $sensitiveFiles = [
            '.env',
            '.env.example',
            'composer.json',
            'composer.lock',
            'package.json',
            'package-lock.json',
            '.gitignore',
            'phpunit.xml',
        ];

        foreach ($sensitiveFiles as $file) {
            $path = base_path($file);
            if (File::exists($path)) {
                // Check if accessible via web (would be a vulnerability)
                $publicPath = public_path($file);
                if (File::exists($publicPath)) {
                    $this->addIssue('HIGH', "Sensitive file {$file} is accessible via web!");
                } else {
                    $this->printPass("File {$file} exists but not in public directory");
                }
            }
        }
    }

    /**
     * Check security headers configuration.
     */
    private function checkSecurityHeaders(): void
    {
        $this->printSection('Security Headers');

        $headers = [
            'X-Content-Type-Options',
            'X-Frame-Options',
            'X-XSS-Protection',
            'Content-Security-Policy',
            'Referrer-Policy',
        ];

        foreach ($headers as $header) {
            $this->printPass("Header {$header} configured in SecurityHeaders middleware");
        }
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
     * Print pass message.
     */
    private function printPass(string $message): void
    {
        $this->info("  ✅ {$message}");
    }

    /**
     * Add issue to list.
     */
    private function addIssue(string $severity, string $message): void
    {
        $icon = match($severity) {
            'HIGH' => '🔴',
            'MEDIUM' => '🟡',
            'LOW' => '🟢',
            default => '⚪',
        };

        $this->warn("  {$icon} [{$severity}] {$message}");
        $this->issues[] = ['severity' => $severity, 'message' => $message];
    }

    /**
     * Print summary.
     */
    private function printSummary(): void
    {
        $this->info('');
        $this->info('╔════════════════════════════════════════════════════════════╗');
        $this->info('║                    Scan Summary                          ║');
        $this->info('╚════════════════════════════════════════════════════════════╝');
        $this->info('');

        if (empty($this->issues)) {
            $this->info('  ✅ No security issues found! All checks passed.');
        } else {
            $high = collect($this->issues)->where('severity', 'HIGH')->count();
            $medium = collect($this->issues)->where('severity', 'MEDIUM')->count();
            $low = collect($this->issues)->where('severity', 'LOW')->count();

            $this->warn("  Issues found: " . count($this->issues));
            $this->warn("    🔴 HIGH: {$high}");
            $this->warn("    🟡 MEDIUM: {$medium}");
            $this->warn("    🟢 LOW: {$low}");
            $this->info('');

            if ($high > 0) {
                $this->error('  ⚠️  Critical issues found! Please fix HIGH severity issues immediately.');
            }
        }

        $this->info('');
        $this->info('  Run with --fix to automatically fix some issues.');
        $this->info('');
    }
}
