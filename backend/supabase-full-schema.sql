-- ========================================================================
-- CAREERCRAFT FULL DATABASE SCHEMA MIGRATION SCRIPT
-- Project Ref: msxafjwdyfnskhnfzzef
-- Target: Supabase Postgres SQL Editor
-- Instructions: Copy this entire script, paste into Supabase SQL Editor, and click "Run".
-- ========================================================================

-- Enable essential cryptographic and UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) DEFAULT 'CareerCraft Member',
    full_name VARCHAR(255) DEFAULT 'CareerCraft Member',
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) DEFAULT 'N/A',
    gender VARCHAR(50) DEFAULT 'other',
    qualification VARCHAR(255) DEFAULT 'N/A',
    experience VARCHAR(255) DEFAULT 'Aspiring Professional',
    skills JSONB DEFAULT '{"skillsList": [], "subscription": "none", "credits": 2, "freeTrialsInitialized": true}'::jsonb,
    last_ip VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure backwards-compatible columns exist if table was already created
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT 'CareerCraft Member';
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) DEFAULT 'CareerCraft Member';
ALTER TABLE users ALTER COLUMN name DROP NOT NULL;
ALTER TABLE users ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50) DEFAULT 'N/A';
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(50) DEFAULT 'other';
ALTER TABLE users ADD COLUMN IF NOT EXISTS qualification VARCHAR(255) DEFAULT 'N/A';
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience VARCHAR(255) DEFAULT 'Aspiring Professional';
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '{"skillsList": [], "subscription": "none", "credits": 2, "freeTrialsInitialized": true}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_ip VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- ------------------------------------------------------------------------
-- 2. ADMINS TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default administrative superuser
INSERT INTO admins (username, password)
VALUES ('harsha8453', '845352')
ON CONFLICT (username) DO NOTHING;

-- ------------------------------------------------------------------------
-- 3. LOGIN DETAILS / AUDIT LOGS TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS login_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Success',
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------
-- 4. CONSULTATION SERVICES TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'INR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------
-- 5. CUSTOMERS TABLE (APPOINTMENTS)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------
-- 6. AVAILABILITY TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL DEFAULT '09:00:00',
    end_time TIME NOT NULL DEFAULT '18:00:00',
    break_start TIME DEFAULT '13:00:00',
    break_end TIME DEFAULT '14:00:00',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------
-- 7. APPOINTMENTS TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed' 
        CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show')),
    notes TEXT,
    cancelled_reason TEXT,
    meet_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_booking_slot UNIQUE (appointment_date, start_time, service_id)
);

-- ------------------------------------------------------------------------
-- 8. CONVERSATION SESSIONS TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    context_data JSONB DEFAULT '{}'::jsonb,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------
-- 9. AI LEARNING & ASSESSMENT AGENT TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255),
    user_email VARCHAR(255),
    course_name VARCHAR(255) NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    module_name VARCHAR(255),
    topic_name VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Medium',
    question_type VARCHAR(50) DEFAULT 'Mixed',
    total_questions INTEGER NOT NULL,
    time_limit_minutes INTEGER DEFAULT 20,
    time_taken_seconds INTEGER DEFAULT 0,
    total_marks NUMERIC(10, 2) NOT NULL,
    marks_obtained NUMERIC(10, 2) NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    performance_level VARCHAR(50) NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    student_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    evaluation JSONB NOT NULL DEFAULT '{}'::jsonb,
    recommendations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------
-- 10. RESUMES & ATS AUDIT TRAIL TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255),
    user_email VARCHAR(255),
    file_name VARCHAR(255),
    resume_text TEXT,
    ats_score INTEGER DEFAULT 0,
    analysis JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------
-- 11. INDEXES FOR HIGH-THROUGHPUT SEARCH & LOOKUPS
-- ------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_login_details_email ON login_details(email);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversation_session_id ON conversation_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_course ON assessments(course_name);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

-- ------------------------------------------------------------------------
-- 12. PERMISSIVE ROW LEVEL SECURITY (RLS) FOR SUPABASE API ACCESS
-- ------------------------------------------------------------------------
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE login_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE availability DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE resumes DISABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------
-- 13. SEED DEFAULT CONSULTATION SERVICES
-- ------------------------------------------------------------------------
INSERT INTO services (id, name, description, duration_minutes, price, currency, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111101', 'Resume Consultation & Review', 'Comprehensive 1-on-1 resume audit, bullet-point optimization, and ATS pass-rate review with a career advisor.', 30, 0.00, 'INR', TRUE),
    ('11111111-1111-1111-1111-111111111102', '1-on-1 Career Strategy & Roadmap', 'Personalized career roadmap session tailored for landing product-based, service-based, or startup roles.', 45, 0.00, 'INR', TRUE),
    ('11111111-1111-1111-1111-111111111103', 'Mock Technical & HR Interview', 'Realistic mock interview simulation with behavioral feedback, DSA/technical questions, and communication tips.', 60, 0.00, 'INR', TRUE),
    ('11111111-1111-1111-1111-111111111104', 'ATS Optimization & Job Match Advice', 'Direct alignment of your existing resume with specific target company JDs (Google, Amazon, TCS, etc.).', 30, 0.00, 'INR', TRUE),
    ('11111111-1111-1111-1111-111111111105', 'Skill Gap Analysis & Transition Plan', 'Detailed breakdown of missing technical skills and project recommendations to crack your next dream role.', 45, 0.00, 'INR', TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    duration_minutes = EXCLUDED.duration_minutes,
    is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------
-- 14. SEED WEEKLY BUSINESS AVAILABILITY SCHEDULE (MONDAY - SUNDAY)
-- ------------------------------------------------------------------------
INSERT INTO availability (day_of_week, start_time, end_time, break_start, break_end, is_available)
VALUES 
    (0, '09:00:00', '18:00:00', '13:00:00', '14:00:00', FALSE),
    (1, '09:00:00', '18:00:00', '13:00:00', '14:00:00', TRUE),
    (2, '09:00:00', '18:00:00', '13:00:00', '14:00:00', TRUE),
    (3, '09:00:00', '18:00:00', '13:00:00', '14:00:00', TRUE),
    (4, '09:00:00', '18:00:00', '13:00:00', '14:00:00', TRUE),
    (5, '09:00:00', '18:00:00', '13:00:00', '14:00:00', TRUE),
    (6, '09:00:00', '18:00:00', '13:00:00', '14:00:00', TRUE)
ON CONFLICT DO NOTHING;
