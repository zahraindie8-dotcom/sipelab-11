<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\LabController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportAnalyticsController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Semua route di bawah otomatis memiliki prefix /api.
|
*/

// ============================================================
// Autentikasi (publik)
// ============================================================
Route::post('/login', [AuthController::class, 'login'])->name('api.login');
Route::post('/register', [AuthController::class, 'register'])->name('api.register');

// ============================================================
// Route yang butuh token Sanctum
// ============================================================
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/user', [AuthController::class, 'user'])->name('api.user');
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('api.dashboard');

    // Labs — semua role login boleh melihat, hanya admin yang menulis
    Route::get('/labs', [LabController::class, 'index'])->name('api.labs.index');
    Route::get('/labs/{lab}', [LabController::class, 'show'])->name('api.labs.show');
    Route::get('/labs/{lab}/availability', [LabController::class, 'availability'])->name('api.labs.availability');
    Route::middleware('role:admin')->group(function () {
        Route::post('/labs', [LabController::class, 'store'])->name('api.labs.store');
        Route::put('/labs/{lab}', [LabController::class, 'update'])->name('api.labs.update');
        Route::delete('/labs/{lab}', [LabController::class, 'destroy'])->name('api.labs.destroy');
    });

    // Bookings — semua role login
    Route::get('/bookings', [BookingController::class, 'index'])->name('api.bookings.index');
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('api.bookings.show');
    Route::post('/bookings', [BookingController::class, 'store'])->name('api.bookings.store');
    Route::put('/bookings/{booking}', [BookingController::class, 'update'])->name('api.bookings.update');
    Route::delete('/bookings/{booking}', [BookingController::class, 'destroy'])->name('api.bookings.destroy');

    // Cancel booking — pemilik atau admin
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('api.bookings.cancel');

    // Approval — hanya admin & guru
    Route::middleware('role:admin,guru')->group(function () {
        Route::post('/bookings/{booking}/approve', [BookingController::class, 'approve'])->name('api.bookings.approve');
        Route::post('/bookings/{booking}/reject', [BookingController::class, 'reject'])->name('api.bookings.reject');
    });

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('api.reports.index');
    Route::get('/reports/analytics', [ReportAnalyticsController::class, 'index'])->name('api.reports.analytics');
    Route::post('/reports', [ReportController::class, 'store'])->name('api.reports.store');
    Route::delete('/reports/{report}', [ReportController::class, 'destroy'])->name('api.reports.destroy');
    Route::middleware('role:admin,guru')->get('/reports/all', [ReportController::class, 'all'])->name('api.reports.all');

    // Analytics — admin, guru, siswa (data di-scoping sesuai role)
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('api.analytics');

    // Users — hanya admin
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('api.users.index');
        Route::get('/users/{user}', [UserController::class, 'show'])->name('api.users.show');
        Route::post('/users', [UserController::class, 'store'])->name('api.users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('api.users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('api.users.destroy');
    });

    // Notifications — semua role login
    Route::get('/notifications', [NotificationController::class, 'index'])->name('api.notifications.index');
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('api.notifications.unread-count');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('api.notifications.mark-as-read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('api.notifications.mark-all-as-read');

    // Export — admin & guru bisa export semua, siswa hanya miliknya
    Route::get('/export/bookings', [ExportController::class, 'bookings'])->name('api.export.bookings');
    Route::get('/export/reports', [ExportController::class, 'reports'])->name('api.export.reports');
});
