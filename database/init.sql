-- Database Schema Initialization for Student Performance Prediction & Early Warning System
-- PostgreSQL 15+ Schema Definition

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student', -- 'student', 'faculty', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    semester INT NOT NULL
);

CREATE TABLE IF NOT EXISTS academic_records (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    semester INT NOT NULL,
    attendance_pct DOUBLE PRECISION NOT NULL,
    internal_marks DOUBLE PRECISION NOT NULL,
    assignment_marks DOUBLE PRECISION NOT NULL,
    study_hours DOUBLE PRECISION NOT NULL,
    previous_score DOUBLE PRECISION NOT NULL,
    subject_code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prediction_records (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    predicted_score DOUBLE PRECISION NOT NULL,
    performance_level VARCHAR(20) NOT NULL, -- 'GOOD', 'AVERAGE', 'AT_RISK'
    risk_score DOUBLE PRECISION NOT NULL,
    feature_importances JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    weak_area VARCHAR(255) NOT NULL,
    recommendation_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_academic_records_student_id ON academic_records(student_id);
CREATE INDEX IF NOT EXISTS idx_prediction_records_student_id ON prediction_records(student_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_student_id ON recommendations(student_id);
