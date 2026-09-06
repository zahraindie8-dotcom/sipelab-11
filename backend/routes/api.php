<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\LabController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ReportAnalyticsController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SystemStatusController;
use App\Http\Controllers\Api\WeeklyRecapController;
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
// Health Check (publik) — untuk monitoring
// ============================================================
Route::get('/health', [HealthController::class, 'index'])->name('api.health');
Route::get('/health/detailed', [HealthController::class, 'detailed'])->name('api.health.detailed');
Route::get('/health/ready', [HealthController::class, 'ready'])->name('api.health.ready');
Route::get('/health/live', [HealthController::class, 'live'])->name('api.health.live');

// ============================================================
// Autentikasi (publik) — rate limited untuk brute force protection
// ============================================================
Route::middleware('throttle.login')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('api.login');
    Route::post('/register', [AuthController::class, 'register'])->name('api.register');
});

// ============================================================
// Verifikasi Email (publik) — rate limited
// ============================================================
Route::middleware('throttle.login')->group(function () {
    Route::post('/email/verify', [EmailVerificationController::class, 'verify'])->name('api.email.verify');
    Route::post('/email/verification/resend', [EmailVerificationController::class, 'resend'])->name('api.email.verification.resend');
});

// ============================================================
// Password Reset (publik) — rate limited
// ============================================================
Route::middleware('throttle.login')->group(function () {
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])->name('api.forgot-password');
    Route::post('/verify-reset-code', [PasswordResetController::class, 'verifyCode'])->name('api.verify-reset-code');
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])->name('api.reset-password');
});

// ============================================================
// Route yang butuh token Sanctum — rate limited untuk brute force protection
// ============================================================
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {

    // Auth
    Route::get('/user', [AuthController::class, 'user'])->name('api.user');
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');

    // Email Verification
    Route::post('/email/verification/send', [EmailVerificationController::class, 'send'])->name('api.email.verification.send');

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
    
    // Report Photo - serve from private storage securely
    Route::get('/reports/{report}/photo', [ReportController::class, 'showPhoto'])->name('api.reports.photo');

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

    // Weekly Recap — hanya admin
    Route::middleware('role:admin')->group(function () {
        Route::post('/weekly-recap/send', [WeeklyRecapController::class, 'send'])->name('api.weekly-recap.send');
        Route::get('/weekly-recap/preview', [WeeklyRecapController::class, 'preview'])->name('api.weekly-recap.preview');
    });

    // Audit Logs — hanya admin
    Route::middleware('role:admin')->group(function () {
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('api.audit-logs.index');
        Route::get('/audit-logs/stats', [AuditLogController::class, 'stats'])->name('api.audit-logs.stats');
        Route::get('/audit-logs/export', [AuditLogController::class, 'export'])->name('api.audit-logs.export');
        Route::get('/audit-logs/{auditLog}', [AuditLogController::class, 'show'])->name('api.audit-logs.show');
    });

    // System Status — hanya admin
    Route::middleware('role:admin')->group(function () {
        Route::get('/system/status', [SystemStatusController::class, 'index'])->name('api.system.status');
    });
});
