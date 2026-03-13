-- Database: ai_for_everybody
-- Run this script to create the database and tables

CREATE DATABASE IF NOT EXISTS ai_for_everybody CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ai_for_everybody;

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM(
        'super_admin',
        'admin',
        'viewer'
    ) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Registrations table
CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    country_code VARCHAR(10) DEFAULT '+237',
    profession ENUM(
        'Student',
        'Graduate',
        'Job Seeker',
        'Public Sector Worker',
        'Private Sector Worker',
        'Entrepreneur',
        'Educator/Lecturer',
        'Faith Leader',
        'Other'
    ) NOT NULL,
    ai_experience ENUM(
        'Complete Beginner',
        'Heard of AI but never used it',
        'Used ChatGPT/Claude a few times',
        'Regular AI user'
    ) NOT NULL,
    learning_goals TEXT,
    referral_source ENUM(
        'WhatsApp',
        'Social Media',
        'Friend/Colleague',
        'Flyer/Poster',
        'Website',
        'Other'
    ),
    status ENUM(
        'pending',
        'confirmed',
        'cancelled'
    ) DEFAULT 'pending',
    confirmation_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    replied_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT,
    download_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES admins (id)
);

-- Download tracking
CREATE TABLE IF NOT EXISTS download_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resource_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources (id)
);

-- Page analytics
CREATE TABLE IF NOT EXISTS page_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_section VARCHAR(100),
    visitor_ip VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500),
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);