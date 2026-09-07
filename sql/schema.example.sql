-- Database structure only. No existing accounts or patient data are included.
-- Create an admin separately using a unique password and PHP password_hash().
CREATE DATABASE IF NOT EXISTS alphastar_clinic
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE alphastar_clinic;

CREATE TABLE IF NOT EXISTS bookings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(150) DEFAULT NULL,
  service VARCHAR(100) NOT NULL,
  message TEXT DEFAULT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'done') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_bookings_status (status),
  KEY idx_bookings_created (created_at),
  KEY idx_bookings_service (service)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS heart_reactions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  visitor_token VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_heart_reactions_created (created_at)
) ENGINE=InnoDB;
