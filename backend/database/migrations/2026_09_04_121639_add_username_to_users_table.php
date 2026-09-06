<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tambahkan kolom username terlebih dahulu sebagai nullable
        // karena tabel users sudah memiliki data.
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->nullable()->after('name');
        });

        // Isi username untuk user yang sudah ada.
        $users = DB::table('users')
            ->select('id', 'name')
            ->orderBy('id')
            ->get();

        foreach ($users as $user) {
            $baseUsername = Str::lower(
                Str::slug($user->name ?: 'user', '')
            );

            if ($baseUsername === '') {
                $baseUsername = 'user';
            }

            // Batasi panjang username agar maksimal 50 karakter.
            $baseUsername = substr($baseUsername, 0, 45);

            $username = $baseUsername;
            $counter = 1;

            // Pastikan username tidak bentrok dengan user lain.
            while (
                DB::table('users')
                    ->where('username', $username)
                    ->where('id', '!=', $user->id)
                    ->exists()
            ) {
                $username = substr($baseUsername, 0, 43) . '_' . $counter;
                $counter++;
            }

            DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'username' => $username,
                ]);
        }

        // Setelah semua user lama memiliki username,
        // tambahkan unique index.
        Schema::table('users', function (Blueprint $table) {
            $table->unique('username');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropColumn('username');
        });
    }
};