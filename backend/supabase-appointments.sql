-- ========================================================================
-- CareerCraft.buzz Appointment & Customer Management Database Schema
-- Supabase PostgreSQL Migration
-- ========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'INR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. AVAILABILITY TABLE
CREATE TABLE IF NOT EXISTS availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, ..., 6=Saturday
    start_time TIME NOT NULL DEFAULT '09:00:00',
    end_time TIME NOT NULL DEFAULT '18:00:00',
    break_start TIME DEFAULT '13:00:00',
    break_end TIME DEFAULT '14:00:00',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed' 
        CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show')),
    notes TEXT,
    cancelled_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_booking_slot UNIQUE (appointment_date, start_time, service_id)
);

-- 5. CONVERSATION SESSIONS TABLE
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    context_data JSONB DEFAULT '{}'::jsonb,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversation_session_id ON conversation_sessions(session_id);

-- SEED DEFAULT CONSULTATION SERVICES
INSERT INTO services (id, name, description, duration_minutes, price, currency, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111101', 'Resume Consultation & Review', 'Comprehensive 1-on-1 resume audit, bullet-point optimization, and ATS pass-rate review with a career advisor.', 30, 0.00, 'INR', TRUE),
    ('11111111-1111-1111-1111-111111111102', '1-on-1 Career Strategy & Roadmap', 'Personalized career roadmap session tailored for landing product-based, service-based, or startup roles.', 45, 0.00, 'INR', TRUE),
    ('11111111-1111-1111-1111-111111111103', 'Mock Technical & HR Interview', 'Realistic mock interview simulation with behavioral feedback, DSA/technical questions, and communication tips.', 60, 0.00, 'INR', TRUE),
    ('11111111-1111-1111-1111-111111111104', 'ATS Optimization & Job Match Advice', 'Direct alignment of your existing resume with specific target company JDs (Google, Amazon, TCS, etc.).', 30, 0.00, 'INR', TRUE),
    ('11111111-1111-1111-1111-111111111105', 'Skill Gap Analysis & Transition Plan', 'Detailed breakdown of missing technical skills and project recommendations to crack your next dream role.', 45, 0.00, 'INR', TRUE)
ON CONFLICT (id) DO NOTHING;

-- SEED WEEKLY BUSINESS AVAILABILITY (Mon-Sat: 09:00 - 18:00, Lunch: 13:00 - 14:00, Sun: Closed)
INSERT INTO availability (day_of_week, start_time, end_time, break_start, break_end, is_available)
VALUES 
    (0, '09:00:00', '18:00:00', '13:00:00', '14:00:00', FALSE), -- Sunday: Closed
    (1, '09:00:00', '18:00:00', '13:00:00', '14:00:00', TRUE),  -- Monday
    (2, '09:00:00', '18:00:00', '13:00:00', '14:00:00', TRUE),  -- Tuesday
    (3, '09:00:00', '18:00:00', '13:00:00', '14:00:00', TRUE),  -- Wednesday
    (4, '09:00:00', '18:00:00', '13:00:00', '14:00:00', TRUE),  -- Thursday
    (5, '09:00:00', '18:00:00', '13:00:00', '14:00:00', TRUE),  -- Friday
    (6, '09:00:00', '18:00:00', '13:00:00', '14:00:00', TRUE)   -- Saturday
ON CONFLICT DO NOTHING;
