<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Security Configuration
    |--------------------------------------------------------------------------
    |
    | Configure security settings for SiLab.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | IP Blocking
    |--------------------------------------------------------------------------
    |
    | IPs that are completely blocked from accessing the application.
    |
    */
    'blocked_ips' => [
        // Add IPs to block, e.g.:
        // '192.168.1.100',
        // '10.0.0.50',
    ],

    /*
    |--------------------------------------------------------------------------
    | IP Whitelisting
    |--------------------------------------------------------------------------
    |
    | IPs that bypass all security checks (use for admin IPs).
    |
    */
    'whitelisted_ips' => [
        // Add trusted IPs, e.g.:
        // '127.0.0.1',
        // '::1',
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    |
    | Configure rate limits for different endpoints.
    |
    */
    'rate_limits' => [
        'login' => [
            'max_attempts' => 5,
            'decay_minutes' => 1,
        ],
        'register' => [
            'max_attempts' => 3,
            'decay_minutes' => 60,
        ],
        'api' => [
            'max_attempts' => 60,
            'decay_minutes' => 1,
        ],
        'password_reset' => [
            'max_attempts' => 3,
            'decay_minutes' => 60,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Token Expiry
    |--------------------------------------------------------------------------
    |
    | Configure token expiry times.
    |
    */
    'token_expiry' => [
        'sanctum' => 1440, // 24 hours in minutes
        'remember_me' => 43200, // 30 days in minutes
        'email_verification' => 1440, // 24 hours in minutes
    ],

    /*
    |--------------------------------------------------------------------------
    | Session Configuration
    |--------------------------------------------------------------------------
    |
    | Security settings for sessions.
    |
    */
    'session' => [
        'lifetime' => 60, // minutes
        'secure_cookie' => true,
        'http_only' => true,
        'same_site' => 'lax',
    ],

    /*
    |--------------------------------------------------------------------------
    | File Upload Security
    |--------------------------------------------------------------------------
    |
    | Configure file upload restrictions.
    |
    */
    'file_upload' => [
        'max_size' => 5120, // 5MB in KB
        'allowed_types' => ['image/jpeg', 'image/png', 'image/jpg'],
        'allowed_extensions' => ['jpg', 'jpeg', 'png'],
        'private_disk' => 'private',
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Policy
    |--------------------------------------------------------------------------
    |
    | Configure password requirements.
    |
    */
    'password' => [
        'min_length' => 8,
        'require_uppercase' => false,
        'require_lowercase' => false,
        'require_numbers' => false,
        'require_symbols' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Account Lockout
    |--------------------------------------------------------------------------
    |
    | Configure account lockout after failed attempts.
    |
    */
    'lockout' => [
        'max_attempts' => 5,
        'lockout_duration' => 15, // minutes
        'reset_attempts' => 60, // minutes
    ],

    /*
    |--------------------------------------------------------------------------
    | Audit Logging
    |--------------------------------------------------------------------------
    |
    | Configure what actions are logged.
    |
    */
    'audit_log' => [
        'enabled' => true,
        'log_auth_events' => true,
        'log_admin_actions' => true,
        'log_file_uploads' => true,
        'retention_days' => 90,
    ],

];
