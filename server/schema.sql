-- Create Database
CREATE DATABASE IF NOT EXISTS disaster_db;
USE disaster_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Storing plain text for demo as requested, ideally should be hashed
    name VARCHAR(100) NOT NULL,
    role ENUM('ADMIN', 'OFFICER', 'CITIZEN') NOT NULL,
    dsd VARCHAR(50), -- Nullable, only for officers
    phone VARCHAR(20)
);

-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    dsd VARCHAR(50) NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    status ENUM('New', 'In Progress', 'Resolved', 'Rejected') DEFAULT 'New',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    remarks JSON, -- Stores array of remark strings
    ai_analysis TEXT
);

-- Seed Users
INSERT INTO users (username, password, name, role, dsd, phone) VALUES 
('admin', 'admin123', 'System Administrator', 'ADMIN', NULL, '+94770346212'),
('officer_colombo', 'pass123', 'Officer Colombo', 'OFFICER', 'Colombo', '+94770346212'),
('officer_gampaha', 'pass123', 'Officer Gampaha', 'OFFICER', 'Gampaha', '+94770346212'),
('officer_kandy', 'pass123', 'Officer Kandy', 'OFFICER', 'Kandy', '+94770346212'),
('officer_galle', 'pass123', 'Officer Galle', 'OFFICER', 'Galle', '+94770346212'),
('officer_badulla', 'pass123', 'Officer Badulla', 'OFFICER', 'Badulla', '+94770346212')
ON DUPLICATE KEY UPDATE name=name;

-- Seed Complaints (Sample Data)
INSERT INTO complaints (id, title, description, category, location, latitude, longitude, dsd, priority, status, created_at, contact_name, contact_phone, remarks) VALUES
('CMP-2023-001', 'Bridge Collapse on Main St', 'The small bridge connecting the village to the main road has collapsed.', 'Infrastructure Damage', 'Gampaha - Division A', 7.0917, 80.0152, 'Gampaha', 'Critical', 'New', DATE_SUB(NOW(), INTERVAL 2 DAY), 'Saman Perera', '0771234567', '[]'),
('CMP-2023-002', 'Flood water entering houses', 'Water levels are rising rapidly in the low-lying areas.', 'Safety & Security', 'Colombo - Zone 4', 6.9271, 79.8612, 'Colombo', 'High', 'In Progress', DATE_SUB(NOW(), INTERVAL 5 HOUR), 'Nimali Silva', '0719876543', '["Officer dispatched at 14:00", "Evacuation team requested"]'),
('CMP-2023-003', 'Power outage for 48 hours', 'No electricity in the entire neighborhood since the storm started.', 'General/Other', 'Kandy - Hill Side', 7.2906, 80.6337, 'Kandy', 'Medium', 'New', DATE_SUB(NOW(), INTERVAL 1 DAY), 'John Doe', '0765554444', '[]'),
('CMP-2023-004', 'Shortage of drinking water', 'The local relief center has run out of clean drinking water.', 'Food & Supplies', 'Galle - Relief Camp 1', 6.0535, 80.2210, 'Galle', 'High', 'Resolved', DATE_SUB(NOW(), INTERVAL 5 DAY), NULL, NULL, '["Water truck delivered at 10:00 AM"]'),
('CMP-2023-005', 'Landslide warning signs', 'Cracks appearing on the retaining wall near the school.', 'Safety & Security', 'Badulla - School Ln', 6.9934, 81.0550, 'Badulla', 'Critical', 'New', NOW(), 'Principal Kamal', '0701112222', '[]');
