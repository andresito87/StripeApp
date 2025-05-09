-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: backend_stripe
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disputed_transactions`
--

DROP TABLE IF EXISTS `disputed_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disputed_transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `dispute_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_intent_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `disputed_transactions_dispute_id_unique` (`dispute_id`),
  KEY `disputed_transactions_payment_intent_id_index` (`payment_intent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disputed_transactions`
--

LOCK TABLES `disputed_transactions` WRITE;
/*!40000 ALTER TABLE `disputed_transactions` DISABLE KEYS */;
INSERT INTO `disputed_transactions` VALUES (3,'dp_1RJw6XRx1C5CFKRj7sx71GS1','pi_3RJw6WRx1C5CFKRj0VErOiug','pending','Not specified','2025-05-01 10:20:44','2025-05-01 10:20:44'),(4,'dp_1RJxGzRx1C5CFKRjyJToGPvi','pi_3RJxGyRx1C5CFKRj1zfshYVd','pending','Not specified','2025-05-01 11:35:37','2025-05-01 11:35:37'),(5,'dp_1RJxHGRx1C5CFKRjeJIqIOFR','pi_3RJxHGRx1C5CFKRj1zbj5HqO','product_not_received','product_not_received','2025-05-01 11:35:52','2025-05-01 11:40:38');
/*!40000 ALTER TABLE `disputed_transactions` ENABLE KEYS */;
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
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2025_02_10_000001_create_wallet_type_table',1),(5,'2025_02_10_000002_create_wallet_type_error_table',1),(6,'2025_02_10_000003_create_wallet_table',1),(7,'2025_02_10_152012_create_personal_access_tokens_table',1),(8,'2025_02_17_175529_add_twofa_columns_to_users_table',1),(9,'2025_03_02_064200_add_stripe_customer_id_to_users_table',1),(10,'2025_03_11_180933_add_dates_to_wallet_table',1),(11,'2025_03_19_085633_create_disputed_transactions_table',1);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_user` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_id_user_index` (`id_user`),
  KEY `sessions_last_activity_index` (`last_activity`),
  CONSTRAINT `sessions_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id_user` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stripe_customer_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `api_token` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `google2fa_secret` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google2fa_enabled` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'andres','andrespoda@gmail.com','cus_S9EXHyUFBu4JcY',NULL,'$2y$12$ZTVVl0L26M3TmxAaGooj8uHPyY696J6GhBLquIC9.cnE7MXrvWZg6','eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJtaWFwaWxhcmF2ZWwiLCJzdWIiOjEsImlhdCI6MTc0NjgxNjcyMiwiZXhwIjoxNzQ2ODIwMzIyfQ.KSvcTStVyeD3GTp8n9AVcIq_MPyYonMSFHZNsPqwnXU',NULL,'2025-04-17 15:17:24','2025-05-09 16:52:02',NULL,0),(2,'ana','ana@example.com','cus_SAfcEuV4w3QCZd',NULL,'$2y$12$BwWAYltERQfDYUDnG/3IjOssL/t2fKIo.dqgxIWOV88v7U6A9UssK','eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJtaWFwaWxhcmF2ZWwiLCJzdWIiOjIsImlhdCI6MTc0NTI0MTY1OCwiZXhwIjoxNzQ1MjQ1MjU4fQ.Cy-MA1SMDzx_RNSrfsOsI_rF9zPqTreJK0ZYKGf74hY',NULL,'2025-04-21 11:20:47','2025-04-21 11:20:58',NULL,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallet`
--

DROP TABLE IF EXISTS `wallet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet` (
  `id_wallet` bigint unsigned NOT NULL AUTO_INCREMENT,
  `description` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` double NOT NULL,
  `date_created` datetime NOT NULL DEFAULT '2025-04-17 17:16:23',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_transaction` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_wallet_type` bigint unsigned NOT NULL,
  `id_user` bigint unsigned NOT NULL,
  `id_refund` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_verified` timestamp NULL DEFAULT NULL,
  `date_refunded` timestamp NULL DEFAULT NULL,
  `id_wallet_type_error` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id_wallet`),
  KEY `wallet_id_user_foreign` (`id_user`),
  KEY `wallet_id_wallet_type_foreign` (`id_wallet_type`),
  KEY `wallet_id_wallet_type_error_foreign` (`id_wallet_type_error`),
  CONSTRAINT `wallet_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `wallet_id_wallet_type_error_foreign` FOREIGN KEY (`id_wallet_type_error`) REFERENCES `wallet_type_error` (`id_wallet_type_error`) ON DELETE SET NULL,
  CONSTRAINT `wallet_id_wallet_type_foreign` FOREIGN KEY (`id_wallet_type`) REFERENCES `wallet_type` (`id_wallet_type`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallet`
--

LOCK TABLES `wallet` WRITE;
/*!40000 ALTER TABLE `wallet` DISABLE KEYS */;
INSERT INTO `wallet` VALUES (25,'Recarga de saldo',22,'2025-05-01 12:18:53','succeeded','pi_3RJw4nRx1C5CFKRj1ulsd8gi',1,1,NULL,'2025-05-01 10:18:53',NULL,1),(26,'Recarga de saldo',21,'2025-05-01 12:20:16','succeeded','pi_3RJw68Rx1C5CFKRj1jX54Ypu',2,1,'re_3RJw68Rx1C5CFKRj15BX68ia','2025-05-01 10:20:16','2025-05-01 12:18:39',1),(27,'Recarga de saldo',24,'2025-05-01 12:20:41','disputed','pi_3RJw6WRx1C5CFKRj0VErOiug',1,1,NULL,'2025-05-01 10:20:41',NULL,3),(28,'Recarga de saldo',22,'2025-05-01 13:35:33','disputed','pi_3RJxGyRx1C5CFKRj1zfshYVd',1,1,NULL,'2025-05-01 11:35:33',NULL,3),(29,'Recarga de saldo',23,'2025-05-01 13:35:51','disputed','pi_3RJxHGRx1C5CFKRj1zbj5HqO',1,1,NULL,'2025-05-01 11:35:51',NULL,3),(30,'Recarga de saldo',23,'2025-05-01 13:36:21','succeeded','pi_3RJxHlRx1C5CFKRj15PNcnfN',1,1,NULL,'2025-05-01 11:36:21',NULL,1),(31,'Recarga de saldo',23,'2025-05-01 13:36:37','succeeded','pi_3RJxI1Rx1C5CFKRj0wyFQZJk',1,1,NULL,'2025-05-01 11:36:37',NULL,1),(32,'Recarga de saldo',33,'2025-05-01 13:38:10','succeeded','pi_3RJxJWRx1C5CFKRj1ym7E8dh',1,1,NULL,'2025-05-01 11:38:10',NULL,1),(40,'Reembolso a cuenta bancaria',-22,'2025-04-17 17:16:23','succeeded','pi_3RMv6rRx1C5CFKRj0ao8q4OW',2,1,'pi_3RMv6rRx1C5CFKRj0ao8q4OW',NULL,'2025-05-09 15:53:21',1),(41,'Reembolso a cuenta bancaria',-23,'2025-04-17 17:16:23','succeeded','pi_3RMv91Rx1C5CFKRj0fJjvz7B',2,1,'pi_3RMv91Rx1C5CFKRj0fJjvz7B',NULL,'2025-05-09 15:55:35',1),(42,'Reembolso a cuenta bancaria',-13,'2025-04-17 17:16:23','succeeded','pi_3RMvD6Rx1C5CFKRj0H4qNzmo',2,1,'pi_3RMvD6Rx1C5CFKRj0H4qNzmo',NULL,'2025-05-09 15:59:48',1),(43,'Reembolso a cuenta bancaria',-5,'2025-04-17 17:16:23','succeeded','pi_3RMvleRx1C5CFKRj1dyOOgqP',2,1,'pi_3RMvleRx1C5CFKRj1dyOOgqP',NULL,'2025-05-09 16:35:31',1);
/*!40000 ALTER TABLE `wallet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallet_type`
--

DROP TABLE IF EXISTS `wallet_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet_type` (
  `id_wallet_type` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type_name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_wallet_type`),
  UNIQUE KEY `wallet_type_type_name_unique` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallet_type`
--

LOCK TABLES `wallet_type` WRITE;
/*!40000 ALTER TABLE `wallet_type` DISABLE KEYS */;
INSERT INTO `wallet_type` VALUES (2,'CHARGE'),(1,'PUSH'),(3,'REFUND');
/*!40000 ALTER TABLE `wallet_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallet_type_error`
--

DROP TABLE IF EXISTS `wallet_type_error`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet_type_error` (
  `id_wallet_type_error` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_wallet_type_error`),
  UNIQUE KEY `wallet_type_error_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallet_type_error`
--

LOCK TABLES `wallet_type_error` WRITE;
/*!40000 ALTER TABLE `wallet_type_error` DISABLE KEYS */;
INSERT INTO `wallet_type_error` VALUES (1,'succeeded','Transacción exitosa'),(2,'failure','Transacción fallida'),(3,'disputed','Transacción en disputa'),(4,'requires_action','Transacción que requiere acción'),(5,'blocked','Transacción bloqueada');
/*!40000 ALTER TABLE `wallet_type_error` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-09 21:40:00
