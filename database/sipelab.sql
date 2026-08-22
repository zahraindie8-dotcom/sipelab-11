-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: sipelab
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `lab_id` bigint unsigned NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bookings_user_id_foreign` (`user_id`),
  KEY `bookings_lab_id_date_status_index` (`lab_id`,`date`,`status`),
  CONSTRAINT `bookings_lab_id_foreign` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,2,1,'2026-08-11','07:00:00','09:00:00','pending','Praktikum pemrograman dasar kelas X.','2026-08-10 04:38:43','2026-08-10 04:38:43'),(2,3,2,'2026-08-12','10:00:00','12:00:00','approved','Latihan ujian CBT.','2026-08-10 04:38:43','2026-08-10 04:38:43'),(3,2,3,'2026-08-13','13:00:00','15:00:00','rejected','Jadwal bertabrakan dengan kegiatan sekolah.','2026-08-10 04:38:43','2026-08-10 04:38:43'),(4,3,1,'2026-08-11','08:00:00','10:00:00','approved','Praktikum TIK','2026-08-10 04:39:53','2026-08-10 04:40:18'),(5,3,1,'2026-08-11','09:00:00','11:00:00','pending',NULL,'2026-08-10 04:39:55','2026-08-10 04:39:55'),(6,3,1,'2026-08-11','09:00:00','11:00:00','pending',NULL,'2026-08-10 04:39:56','2026-08-10 04:39:56'),(7,1,1,'2026-08-10','08:00:00','12:45:00','approved','membuat project mandiri','2026-08-10 05:10:50','2026-08-10 05:11:17');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labs`
--

DROP TABLE IF EXISTS `labs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `labs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labs`
--

LOCK TABLES `labs` WRITE;
/*!40000 ALTER TABLE `labs` DISABLE KEYS */;
INSERT INTO `labs` VALUES (1,'Lab Komputer 1',36,'Lab komputer untuk mata pelajaran TIK dan pemrograman.','2026-08-10 04:38:43','2026-08-10 04:38:43'),(2,'Lab Komputer 2',30,'Lab komputer untuk ujian berbasis komputer (CBT).','2026-08-10 04:38:43','2026-08-10 04:38:43'),(3,'Lab IPA',32,'Lab untuk praktikum fisika, kimia, dan biologi.','2026-08-10 04:38:43','2026-08-10 04:38:43'),(4,'Lab Bahasa',28,'Lab bahasa untuk pembelajaran listening dan speaking.','2026-08-10 04:38:43','2026-08-10 04:38:43'),(5,'Lab Multimedia',25,'Lab multimedia untuk desain grafis dan editing video.','2026-08-10 04:38:43','2026-08-10 04:38:43');
/*!40000 ALTER TABLE `labs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2014_10_12_000000_create_users_table',1),(2,'2014_10_12_100000_create_password_reset_tokens_table',1),(3,'2019_08_19_000000_create_failed_jobs_table',1),(4,'2019_12_14_000001_create_personal_access_tokens_table',1),(5,'2023_06_01_000001_create_labs_table',1),(6,'2023_06_01_000002_create_bookings_table',1),(7,'2023_06_01_000003_create_reports_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (6,'App\\Models\\User',3,'api-token','c9f60326cb5af3572ae3324732dfae91b8e23b305880089ed9b45459a0cf8542','[\"*\"]','2026-08-10 04:40:25',NULL,'2026-08-10 04:40:20','2026-08-10 04:40:25');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reports_booking_id_foreign` (`booking_id`),
  KEY `reports_user_id_foreign` (`user_id`),
  CONSTRAINT `reports_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reports_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
INSERT INTO `reports` VALUES (1,4,3,'reports/KfkD5sangfDaL702F2Jt6k62xlAINiM1tpcjmo4p.jpg','Praktikum TIK berjalan lancar','2026-08-10 04:40:25','2026-08-10 04:40:25');
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','guru','siswa') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'siswa',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin Lab','admin@sipelab.test',NULL,'$2y$10$y784nlhArg054EoYDZiQbuV4laS5hznt/kOqUycgc.GimtS.uvYdG','admin',NULL,'2026-08-10 04:38:40','2026-08-10 04:38:40'),(2,'Bapak/Ibu Guru','guru@sipelab.test',NULL,'$2y$10$4RImZm.DXwZ/.5ZkH.Ay4eNiEfNqfaHxoLK6RjhMP/W8Uldr7pk0a','guru',NULL,'2026-08-10 04:38:40','2026-08-10 04:38:40'),(3,'Siswa Contoh','siswa@sipelab.test',NULL,'$2y$10$qWbYk0R90WJq2Dc0igHIyOXNijGDYu2Fw9dr1OKb6nhpytnvyRG3W','siswa',NULL,'2026-08-10 04:38:40','2026-08-10 04:38:40'),(4,'Jaeman Zulkarnain','hkuswandari@example.org','2026-08-10 04:38:41','$2y$10$SlGXqaYyEUYNWVNG7DyTROBG1031IL6azmYD8CID47Sz8zNQ9uDOC','siswa','jPoIBdrSZZ','2026-08-10 04:38:43','2026-08-10 04:38:43'),(5,'Winda Riyanti','among81@example.net','2026-08-10 04:38:41','$2y$10$3I/uvEaLVsy5UTuXgTOGF.Rp/lP5HwaCBSbNETR/mfr2uUQEBpu.C','siswa','6R3EZ5H5oG','2026-08-10 04:38:43','2026-08-10 04:38:43'),(6,'Bahuwirya Dongoran','yuni.saptono@example.net','2026-08-10 04:38:41','$2y$10$NpnbrNdRMqvghYp..c990OEqKZtE1r18Nreg6PDqJ2mtfQy4HWbPm','siswa','bAdgIAwTrz','2026-08-10 04:38:43','2026-08-10 04:38:43'),(7,'Uchita Anggraini S.H.','waskita.lili@example.org','2026-08-10 04:38:41','$2y$10$2enw4PrnWmv9U3i.EpvNpek27KVumr7/YUxnRHYil5KCh2zjO/6yK','siswa','dDDKpa9Fli','2026-08-10 04:38:43','2026-08-10 04:38:43'),(8,'Asmuni Prasasta M.Kom.','hpuspasari@example.org','2026-08-10 04:38:42','$2y$10$XK3mgbTMgi40FdH7Q8WRl.xwWGgfZnPwkoh3UvhoowbrIBMPvj/k.','siswa','Z4hUuGEdIx','2026-08-10 04:38:43','2026-08-10 04:38:43'),(9,'Satya Hidayanto','raisa06@example.org','2026-08-10 04:38:42','$2y$10$Cn3e/XDY5xkz6RuGXTpPpuXDDoImBaaFnTBNxlBASnWT0yzsM5p.a','siswa','HwYToOQ08y','2026-08-10 04:38:43','2026-08-10 04:38:43'),(10,'Rusman Hasta Megantara','anggabaya10@example.com','2026-08-10 04:38:42','$2y$10$A4W2VOvoq/3AUAh4avMOe.vH2dCY/ZccmzqfrLDxJGDr2jzHMj/eu','siswa','OiU35UMZoj','2026-08-10 04:38:43','2026-08-10 04:38:43'),(11,'Galak Cahyo Wijaya','oktaviani.endah@example.net','2026-08-10 04:38:42','$2y$10$vx7as7s1tBuRDhVMxoX9H.mkIVt7375gcWFpp/ovifOFD2Nmli2Na','siswa','dLDrXM1ONz','2026-08-10 04:38:43','2026-08-10 04:38:43');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-10 12:48:30
