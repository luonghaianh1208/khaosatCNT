-- ============================================================
-- Hệ Thống Khảo Sát THPT Chuyên Nguyễn Trãi
-- Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('Nam', 'Nữ', 'Khác')),
    grade TEXT NOT NULL,
    class_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    auth_user_id UUID REFERENCES auth.users,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: survey_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS survey_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    school_year TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: teachers
-- ============================================================
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    teacher_type TEXT NOT NULL CHECK (teacher_type IN ('chuyen_chinh', 'chuyen_phu', 'bo_mon', 'chu_nhiem')),
    subject TEXT,
    subject_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: teacher_class_assignments
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_class_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES teachers ON DELETE CASCADE,
    survey_session_id UUID REFERENCES survey_sessions ON DELETE CASCADE,
    class_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (teacher_id, survey_session_id, class_name)
);

-- ============================================================
-- TABLE: survey_responses
-- ============================================================
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_session_id UUID REFERENCES survey_sessions ON DELETE CASCADE,
    user_id UUID REFERENCES users ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers ON DELETE CASCADE,
    q1_score SMALLINT CHECK (q1_score BETWEEN 1 AND 10),
    q2_score SMALLINT CHECK (q2_score BETWEEN 1 AND 10),
    q3_score SMALLINT CHECK (q3_score BETWEEN 1 AND 10),
    q4_score SMALLINT CHECK (q4_score BETWEEN 1 AND 10),
    q5_score SMALLINT CHECK (q5_score BETWEEN 1 AND 10),
    total_score SMALLINT GENERATED ALWAYS AS (
        COALESCE(q1_score, 0) +
        COALESCE(q2_score, 0) +
        COALESCE(q3_score, 0) +
        COALESCE(q4_score, 0) +
        COALESCE(q5_score, 0)
    ) STORED,
    submitted_at TIMESTAMPTZ,
    is_skipped BOOLEAN DEFAULT false,
    UNIQUE (survey_session_id, user_id, teacher_id)
);

-- ============================================================
-- TABLE: homeroom_responses
-- ============================================================
CREATE TABLE IF NOT EXISTS homeroom_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_session_id UUID REFERENCES survey_sessions ON DELETE CASCADE,
    user_id UUID REFERENCES users ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers ON DELETE CASCADE,
    q1_score SMALLINT CHECK (q1_score BETWEEN 1 AND 10),
    q2_score SMALLINT CHECK (q2_score BETWEEN 1 AND 10),
    q3_score SMALLINT CHECK (q3_score BETWEEN 1 AND 10),
    q4_score SMALLINT CHECK (q4_score BETWEEN 1 AND 10),
    open_feedback TEXT,
    total_score SMALLINT GENERATED ALWAYS AS (
        COALESCE(q1_score, 0) +
        COALESCE(q2_score, 0) +
        COALESCE(q3_score, 0) +
        COALESCE(q4_score, 0)
    ) STORED,
    submitted_at TIMESTAMPTZ,
    UNIQUE (survey_session_id, user_id, teacher_id)
);

-- ============================================================
-- TABLE: survey_completion
-- ============================================================
CREATE TABLE IF NOT EXISTS survey_completion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_session_id UUID REFERENCES survey_sessions ON DELETE CASCADE,
    user_id UUID REFERENCES users ON DELETE CASCADE,
    completed_at TIMESTAMPTZ,
    is_submitted BOOLEAN DEFAULT false,
    UNIQUE (survey_session_id, user_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_survey_responses_session ON survey_responses(survey_session_id);
CREATE INDEX idx_survey_responses_teacher ON survey_responses(teacher_id);
CREATE INDEX idx_users_class ON users(class_name);
CREATE INDEX idx_survey_completion_session ON survey_completion(survey_session_id);
CREATE INDEX idx_teacher_class_session ON teacher_class_assignments(survey_session_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on survey_sessions table
ALTER TABLE survey_sessions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on teachers table
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Enable RLS on teacher_class_assignments table
ALTER TABLE teacher_class_assignments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on survey_responses table
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on homeroom_responses table
ALTER TABLE homeroom_responses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on survey_completion table
ALTER TABLE survey_completion ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Policy: students can only SELECT their own profile
CREATE POLICY "student_own_profile" ON users
    FOR SELECT USING (
        auth_user_id = auth.uid()
    );

-- Policy: students can only access their own survey responses
CREATE POLICY "student_own_survey_responses" ON survey_responses
    FOR ALL USING (
        user_id = (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- Policy: students can only access their own homeroom responses
CREATE POLICY "student_own_homeroom_responses" ON homeroom_responses
    FOR ALL USING (
        user_id = (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- Policy: students can only SELECT their own completion record
CREATE POLICY "student_own_completion" ON survey_completion
    FOR SELECT USING (
        user_id = (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- Policy: students can read survey sessions (for active session check)
CREATE POLICY "student_read_sessions" ON survey_sessions
    FOR SELECT USING (true);

-- Policy: students can read teachers (for survey form)
CREATE POLICY "student_read_teachers" ON teachers
    FOR SELECT USING (true);

-- Policy: students can read teacher assignments (for survey form)
CREATE POLICY "student_read_assignments" ON teacher_class_assignments
    FOR SELECT USING (true);

-- NOTE: Admin access uses service_role key which bypasses RLS
-- All INSERT/UPDATE/DELETE on admin tables is done server-side only

-- ============================================================
-- END OF SCHEMA
-- ============================================================