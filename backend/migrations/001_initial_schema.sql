-- ============================================================
-- InterviewIQ — Database Schema (updated Day 3)
-- ============================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id            TEXT UNIQUE NOT NULL,   -- Clerk user ID
    email               TEXT UNIQUE NOT NULL,
    name                TEXT NOT NULL,
    avatar              TEXT,
    credits             INTEGER DEFAULT 50,
    plan_type           TEXT DEFAULT 'free',
    last_interview_date DATE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RESUMES
CREATE TABLE IF NOT EXISTS resumes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    raw_text    TEXT,
    parsed_json JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INTERVIEWS
CREATE TABLE IF NOT EXISTS interviews (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id    UUID REFERENCES resumes(id),
    started_at   TIMESTAMPTZ DEFAULT NOW(),
    ended_at     TIMESTAMPTZ,
    status       TEXT DEFAULT 'active',
    credits_used INTEGER DEFAULT 0,
    feedback_id  UUID,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    sender       TEXT NOT NULL,
    message      TEXT NOT NULL,
    timestamp    TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FEEDBACK
CREATE TABLE IF NOT EXISTS feedback (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id        UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    technical_score     INTEGER,
    communication_score INTEGER,
    strengths           JSONB,
    weaknesses          JSONB,
    suggestions         JSONB,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREDIT TRANSACTIONS
CREATE TABLE IF NOT EXISTS credit_transactions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount     INTEGER NOT NULL,
    type       TEXT NOT NULL,
    reason     TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_clerk_id        ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id       ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_user_id    ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_interview_id ON messages(interview_id);
CREATE INDEX IF NOT EXISTS idx_feedback_interview_id ON feedback(interview_id);
CREATE INDEX IF NOT EXISTS idx_credits_user_id       ON credit_transactions(user_id);
