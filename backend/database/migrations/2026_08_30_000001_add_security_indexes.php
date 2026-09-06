<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Users:
        // Index sudah berhasil dibuat sebelum migration sebelumnya gagal.
        // Tidak perlu dibuat ulang.

        // Bookings:
        // Index sudah berhasil dibuat sebelum migration sebelumnya gagal.
        // Tidak perlu dibuat ulang.

        // Labs:
        // Tidak membuat index karena tabel labs tidak memiliki
        // kolom status maupun code.

        // Reports
        Schema::table('reports', function (Blueprint $table) {
            $table->index('user_id', 'idx_reports_user_id');
            $table->index('booking_id', 'idx_reports_booking_id');
        });

        // Notifications
        Schema::table('notifications', function (Blueprint $table) {
            $table->index('user_id', 'idx_notifications_user_id');
            $table->index(['user_id', 'is_read'], 'idx_notifications_unread');
            $table->index('type', 'idx_notifications_type');
        });

        // Personal access tokens
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->index('token', 'idx_personal_access_tokens_token');
            $table->index('expires_at', 'idx_personal_access_tokens_expires');
            $table->index(
                ['token', 'expires_at'],
                'idx_personal_access_tokens_cleanup'
            );
        });
    }

    public function down(): void
    {
        // Users dan Bookings tidak dihapus di sini karena
        // index tersebut dibuat sebelum migration gagal.

        // Reports
        Schema::table('reports', function (Blueprint $table) {
            $table->dropIndex('idx_reports_user_id');
            $table->dropIndex('idx_reports_booking_id');
        });

        // Notifications
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('idx_notifications_user_id');
            $table->dropIndex('idx_notifications_unread');
            $table->dropIndex('idx_notifications_type');
        });

        // Personal access tokens
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropIndex('idx_personal_access_tokens_token');
            $table->dropIndex('idx_personal_access_tokens_expires');
            $table->dropIndex('idx_personal_access_tokens_cleanup');
        });
    }
};