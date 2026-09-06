<?php

// Production: jangan tampilkan error ke browser (bisa bocorkan info server)
if (getenv('APP_ENV') === 'production' || getenv('APP_DEBUG') === 'false') {
    error_reporting(E_ALL);
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
}

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

require __DIR__ . '/hosting/vendor/autoload.php';

$app = require_once __DIR__ . '/hosting/bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);