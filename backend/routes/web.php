<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Backend ini dipakai sebagai REST API saja. Route '/' cukup mengembalikan
| informasi ringkas agar tidak muncul error 404 saat diakses lewat browser.
|
*/

Route::get('/', function () {
    return response()->json([
        'name' => 'Smart Lab Management API',
        'version' => '1.0.0',
        'docs' => url('/api'),
        'status' => 'running',
    ]);
});
