<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('lab_id')->constrained('labs')->cascadeOnDelete();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled', 'completed'])->default('pending');
            $table->string('purpose')->nullable()->comment('Tujuan penggunaan lab');
            $table->unsignedInteger('participant_count')->default(0)->comment('Jumlah peserta');
            $table->unsignedBigInteger('approved_by')->nullable()->comment('ID user yang menyetujui');
            $table->timestamp('approved_at')->nullable()->comment('Waktu persetujuan');
            $table->string('rejection_reason', 1000)->nullable()->comment('Alasan penolakan');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indeks untuk mempercepat validasi bentrok jadwal.
            $table->index(['lab_id', 'date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
