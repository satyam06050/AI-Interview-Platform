-- AI Interview Platform — Database Schema
-- PostgreSQL 16

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- Users
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    full_name     VARCHAR(255),
    avatar_url    TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Resumes
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename      VARCHAR(500) NOT NULL,
    storage_path  TEXT NOT NULL,
    parsed_text   TEXT,
    skills        JSONB DEFAULT '[]',
    experience    TEXT,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

-- ─────────────────────────────────────────
-- Interviews
-- ─────────────────────────────────────────
CREATE TYPE interview_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE interview_difficulty AS ENUM ('junior', 'mid', 'senior');

CREATE TABLE IF NOT EXISTS interviews (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id     UUID REFERENCES resumes(id) ON DELETE SET NULL,
    job_role      VARCHAR(255) NOT NULL,
    difficulty    interview_difficulty DEFAULT 'mid',
    status        interview_status DEFAULT 'pending',
    total_score   NUMERIC(5,2),
    started_at    TIMESTAMPTZ,
    completed_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status  ON interviews(status);

-- ─────────────────────────────────────────
-- Messages (Q&A turns)
-- ─────────────────────────────────────────
CREATE TYPE message_role AS ENUM ('assistant', 'user');

CREATE TABLE IF NOT EXISTS messages (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id   UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    role           message_role NOT NULL,
    content        TEXT NOT NULL,
    question_index INTEGER,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_interview_id ON messages(interview_id);

-- ─────────────────────────────────────────
-- Evaluations (per-answer scoring)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evaluations (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id     UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    message_id       UUID REFERENCES messages(id) ON DELETE SET NULL,
    question         TEXT NOT NULL,
    answer           TEXT NOT NULL,
    score            NUMERIC(4,1),
    clarity_score    NUMERIC(4,1),
    relevance_score  NUMERIC(4,1),
    depth_score      NUMERIC(4,1),
    feedback         TEXT,
    strengths        JSONB DEFAULT '[]',
    improvements     JSONB DEFAULT '[]',
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluations_interview_id ON evaluations(interview_id);

-- ─────────────────────────────────────────
-- Updated_at trigger
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
