-- Migration V2: Add FAQ, Announcement, Feedback, Notification, and AI Log tables

-- Create faqs table
CREATE TABLE IF NOT EXISTS faqs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_faq_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- e.g., 'NOTICE', 'EXAM', 'PLACEMENT', 'EVENT', 'HOLIDAY', 'WORKSHOP'
    created_by_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_announcement_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    ai_rating INT NULL CHECK (ai_rating >= 1 AND ai_rating <= 5),
    staff_rating INT NULL CHECK (staff_rating >= 1 AND staff_rating <= 5),
    overall_rating INT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    comment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_feedback_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ai_logs table
CREATE TABLE IF NOT EXISTS ai_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    session_id VARCHAR(100) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    confidence_score DECIMAL(4,3) NOT NULL,
    intent VARCHAR(100) NULL,
    sentiment VARCHAR(50) NULL,
    ticket_created BOOLEAN DEFAULT FALSE,
    ticket_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL,
    INDEX idx_ai_logs_session (session_id),
    INDEX idx_ai_logs_user (user_id),
    INDEX idx_ai_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'ANNOUNCEMENT', 'TICKET_UPDATE', 'REMINDER'
    reference_id BIGINT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some default sample FAQs
INSERT INTO faqs (question, answer, category) VALUES
('What is the grading system for the courses?', 'Courses are graded on a 10-point scale: O (Outstanding, 10), A+ (Excellent, 9), A (Very Good, 8), B+ (Good, 7), B (Above Average, 6), C (Average, 5), P (Pass, 4), and F (Fail, 0). A minimum grade of P is required to pass a course.', 'Academic queries'),
('How can I apply for a Bus Pass?', 'To apply for a bus pass, students need to fill out the form under Student Services on the transport portal, upload a passport-size photo, pay the bus fee online, and collect the physical pass from the Office of Transportation inside the Admin Building within 3 working days.', 'Administrative queries'),
('Where can I find the exam timetable?', 'The mid-semester and end-semester timetables are published on the academic calendar and announcement page 2 weeks before exams begin. You can also download the PDF schedule under Exam Updates.', 'Academic queries'),
('What is the minimum attendance requirement?', 'Students must maintain a minimum of 75% attendance in each course to be eligible to sit for the semester end examinations. A condonation of up to 10% may be granted for medical reasons upon submitting valid documents.', 'Academic queries'),
('How do I submit my semester fees?', 'Fees can be paid online via the Student Portal under the "Finance" section using Net Banking, UPI, Credit, or Debit cards. Installment options are available upon written request to the Finance Department.', 'Administrative queries'),
('Where is the placement cell located?', 'The Placement & Career Development Cell is located on the Ground Floor of the Block-C Admin building. Office timings are 9:30 AM to 5:30 PM, Monday through Friday.', 'Academic queries');
