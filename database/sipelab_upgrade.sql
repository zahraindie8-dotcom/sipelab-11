-- ============================================================
-- SiLab Smart Booking Lab — SQL Upgrade Script
-- Jalankan SETELAH import sipelab.sql via phpMyAdmin
-- ============================================================

-- 1. Tambah kolom baru ke tabel `labs`
ALTER TABLE `labs`
  ADD COLUMN `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' AFTER `name`,
  ADD COLUMN `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `capacity`,
  ADD COLUMN `status` enum('active','maintenance','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' AFTER `location`;

-- Update code untuk data labs yang sudah ada
UPDATE `labs` SET `code` = 'KOM-01', `location` = 'Gedung A, Lantai 1' WHERE `id` = 1;
UPDATE `labs` SET `code` = 'KOM-02', `location` = 'Gedung A, Lantai 1' WHERE `id` = 2;
UPDATE `labs` SET `code` = 'IPA-01', `location` = 'Gedung B, Lantai 2' WHERE `id` = 3;
UPDATE `labs` SET `code` = 'BHS-01', `location` = 'Gedung C, Lantai 1' WHERE `id` = 4;
UPDATE `labs` SET `code` = 'MUL-01', `location` = 'Gedung B, Lantai 3' WHERE `id` = 5;

-- Unique index untuk kode lab
ALTER TABLE `labs` ADD UNIQUE KEY `labs_code_unique` (`code`);

-- 2. Tambah kolom baru ke tabel `bookings`
ALTER TABLE `bookings`
  ADD COLUMN `purpose` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `notes`,
  ADD COLUMN `participant_count` int unsigned NOT NULL DEFAULT 0 AFTER `purpose`,
  ADD COLUMN `approved_by` bigint unsigned DEFAULT NULL AFTER `participant_count`,
  ADD COLUMN `approved_at` timestamp NULL DEFAULT NULL AFTER `approved_by`,
  ADD COLUMN `rejection_reason` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `approved_at`;

-- Ubah enum status untuk menambahkan 'cancelled' dan 'completed'
ALTER TABLE `bookings`
  MODIFY COLUMN `status` enum('pending','approved','rejected','cancelled','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending';

-- Update existing booking data with new fields
UPDATE `bookings` SET `purpose` = 'Praktikum pemrograman dasar', `participant_count` = 20 WHERE `id` = 1;
UPDATE `bookings` SET `purpose` = 'Latihan ujian CBT', `participant_count` = 25 WHERE `id` = 2;
UPDATE `bookings` SET `purpose` = 'Praktikum IPA', `participant_count` = 15 WHERE `id` = 3;
UPDATE `bookings` SET `purpose` = 'Praktikum TIK', `participant_count` = 30 WHERE `id` = 4;
UPDATE `bookings` SET `purpose` = 'Belajar mandiri', `participant_count` = 5 WHERE `id` = 5;
UPDATE `bookings` SET `purpose` = 'Belajar mandiri', `participant_count` = 5 WHERE `id` = 6;
UPDATE `bookings` SET `purpose` = 'Project mandiri', `participant_count` = 2 WHERE `id` = 7;

-- Update approved bookings dengan approved_by
UPDATE `bookings` SET `approved_by` = 1, `approved_at` = '2026-08-10 04:40:00' WHERE `id` = 2;
UPDATE `bookings` SET `approved_by` = 1, `approved_at` = '2026-08-10 04:40:18' WHERE `id` = 4;
UPDATE `bookings` SET `approved_by` = 1, `approved_at` = '2026-08-10 05:11:17' WHERE `id` = 7;

-- Update rejected booking dengan rejection_reason
UPDATE `bookings` SET `rejection_reason` = 'Jadwal bertabrakan dengan kegiatan sekolah.' WHERE `id` = 3;

-- 3. Buat tabel `notifications`
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` bigint unsigned DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_foreign` (`user_id`),
  KEY `notifications_booking_id_foreign` (`booking_id`),
  CONSTRAINT `notifications_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Buat tabel `sessions` untuk SESSION_DRIVER=database
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Update migration records
INSERT INTO `migrations` (`migration`, `batch`) VALUES
  ('2023_06_01_000004_add_smart_booking_fields_to_labs_table', 2),
  ('2023_06_01_000005_add_smart_booking_fields_to_bookings_table', 2),
  ('2023_06_01_000006_create_notifications_table', 2);

-- 6. Insert sample notifications
INSERT INTO `notifications` (`user_id`, `type`, `title`, `message`, `booking_id`, `is_read`, `created_at`, `updated_at`) VALUES
  (1, 'booking_created', 'Booking Lab Dibuat', 'Booking lab Lab Komputer 1 oleh Siswa Contoh pada 2026-08-11 (07:00-09:00) menunggu persetujuan.', 1, 0, '2026-08-10 04:38:43', '2026-08-10 04:38:43'),
  (2, 'booking_created', 'Booking Lab Dibuat', 'Booking lab Lab Komputer 2 oleh Siswa Contoh pada 2026-08-12 (10:00-12:00) menunggu persetujuan.', 2, 0, '2026-08-10 04:38:43', '2026-08-10 04:38:43'),
  (3, 'booking_approved', 'Booking Disetujui', 'Booking lab Lab Komputer 2 pada 2026-08-12 (10:00-12:00) telah disetujui oleh Admin Lab.', 2, 1, '2026-08-10 04:40:00', '2026-08-10 04:40:00');

-- ============================================================
-- Selesai! Database sekarang memiliki semua kolom baru
-- untuk fitur Smart Booking Lab.
-- ============================================================
