CREATE TABLE `configurations` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `scale_down` decimal(4,3) DEFAULT NULL,
  `logo_position` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'top-left',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `logo_data` longblob,
  `logo_mime_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_configurations_user_id` (`user_id`),
  CONSTRAINT `configurations_chk_1` CHECK (((`scale_down` <= 0.250) and (`scale_down` > 0))),
  CONSTRAINT `configurations_chk_2` CHECK ((`logo_position` in (_utf8mb4'top-left',_utf8mb4'top-right',_utf8mb4'bottom-left',_utf8mb4'bottom-right',_utf8mb4'center')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;