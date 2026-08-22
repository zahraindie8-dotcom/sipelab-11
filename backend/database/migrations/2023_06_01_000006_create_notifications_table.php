<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->comment('User yang menerima notifikasi');
            $table->string('type', 50)->comment('Jenis notifikasi: booking_created, booking_approved, booking_rejected, booking_cancelled');
            $table->string('title')->comment('Judul notifikasi');
            $table->text('message')->comment('Isi pesan notifikasi');
            $table->unsignedBigInteger('booking_id')->nullable()->comment('Booking terkait');
            $table->boolean('is_read')->default(false)->comment('Sudah dibaca atau belum');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
            $table->index(['user_id', 'is_read']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
