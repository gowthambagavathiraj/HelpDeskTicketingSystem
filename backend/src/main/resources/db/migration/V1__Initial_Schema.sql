-- Initial Schema Migration
-- This creates the refresh_tokens table and adds phone_number to users

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expiry (expiry_date),
    INDEX idx_revoked (is_revoked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add phone_number to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15) UNIQUE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS country_code VARCHAR(5);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_tickets_status_priority ON tickets(status, priority);
CREATE INDEX IF NOT EXISTS idx_tickets_dept_status ON tickets(department_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_ticket_created ON messages(ticket_id, created_at);
