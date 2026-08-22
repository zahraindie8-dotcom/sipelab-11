<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | 'paths' diisi dengan pola URL yang boleh diakses lintas origin.
    | FRONTEND_URL diisi di .env dengan alamat frontend (mis. http://localhost:5173
    | di development, atau https://lab.sekolah.sch.id di production).
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

    // Default only allows explicit FRONTEND_URL. In production set e.g.
    // FRONTEND_URL=https://lab.sekolah.sch.id
    'allowed_origins' => array_filter(array_map('trim', explode(',', env('FRONTEND_URL', 'http://localhost:5173')))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],

    'exposed_headers' => [],

    'max_age' => 86400,

    // Only allow credentials if frontend and backend share a trusted origin.
    'supports_credentials' => env('CORS_SUPPORTS_CREDENTIALS', false),

];
