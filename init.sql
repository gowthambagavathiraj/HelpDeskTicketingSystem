-- Smart Helpdesk System - Database Initialization Script
-- This script is optional - Spring Boot will create tables automatically
-- Use this only if you want to pre-populate data or customize schema

-- Create database (already done by docker-compose)
-- CREATE DATABASE IF NOT EXISTS helpdesk_db;
-- USE helpdesk_db;

-- Note: Tables will be created automatically by Spring Boot JPA
-- with spring.jpa.hibernate.ddl-auto=update

-- Optional: Add custom indexes for performance
-- Uncomment these after first run when tables exist

-- CREATE INDEX idx_ticket_status ON tickets(status);
-- CREATE INDEX idx_ticket_priority ON tickets(priority);
-- CREATE INDEX idx_ticket_created_by ON tickets(created_by);
-- CREATE INDEX idx_ticket_assigned_to ON tickets(assigned_to);
-- CREATE INDEX idx_ticket_department ON tickets(department_id);
-- CREATE INDEX idx_message_ticket ON messages(ticket_id);
-- CREATE INDEX idx_message_sender ON messages(sender_id);

-- Optional: Add full-text search indexes
-- CREATE FULLTEXT INDEX idx_ticket_search ON tickets(title, description);

-- The application will automatically create:
-- 1. Default admin user (admin@helpdesk.com / admin123)
-- 2. Default support user (support@helpdesk.com / support123)
-- 3. Default regular user (user@helpdesk.com / user123)
-- 4. Default departments (IT Support, Maintenance, HR, Administration)

-- This is done by DataInitializer.java on application startup
