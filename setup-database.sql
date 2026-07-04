-- Quick Database Setup for Smart Helpdesk Ticketing System
-- Run this file to create the database and tables

CREATE DATABASE IF NOT EXISTS helpdesk_db;
USE helpdesk_db;

-- Note: Tables will be automatically created by Spring Boot JPA
-- when you run the application with spring.jpa.hibernate.ddl-auto=update

-- This file just creates the database
-- The application will handle table creation and initial data seeding

SELECT 'Database helpdesk_db created successfully!' AS Status;
SELECT 'Run the Spring Boot application to create tables automatically.' AS NextStep;
