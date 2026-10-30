-- Backdoor (backdoorv.1) Ground-Zero Clean Bootstrap Schema
-- Target: PostgreSQL 16 (Supabase)
BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CUSTOM ENUM TYPES (5 Custom Enums)
-- ============================================================================
CREATE TYPE posting_status_enum AS ENUM (
    'OPEN', 
    'STALE', 
    'CLOSED'
);

CREATE TYPE application_stage_enum AS ENUM (
    'DISCOVERED', 
    'CHOSEN', 
    'OUTREACH_STARTED', 
    'IN_CONVERSATION', 
    'INTERVIEW_SCHEDULED', 
    'OFFER_RECEIVED', 
    'ARCHIVED', 
    'SKIPPED', 
    'NOT_A_FIT'
);

CREATE TYPE outreach_door_enum AS ENUM (
    'DOOR_1', 
    'DOOR_2', 
    'DOOR_3'
);

CREATE TYPE cadence_step_status_enum AS ENUM (
    'DRAFT_PENDING', 
    'DRAFT_CREATED', 
    'SENT', 
    'REPLIED', 
    'BOUNCED', 
    'CANCELLED', 
    'SKIPPED'
);

CREATE TYPE contact_confidence_enum AS ENUM (
    'VERIFIED', 
    'INFERRED', 
    'HYPOTHESIS', 
    'CURATED'
);

-- ============================================================================
-- 2. SECTION 1: PROFILES & IDENTITY (User-Owned)
-- ============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    work_countries TEXT[] NOT NULL DEFAULT ARRAY['India', 'US', 'UK', 'EU'],
    linkedin_url TEXT NOT NULL,
    baseline_profession TEXT NOT NULL DEFAULT 'Chartered Accountant',
    google_tokens JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================================
-- 3. SECTION 2: DYNAMIC PERSONA TRACKS (User-Owned)
-- ============================================================================
CREATE TABLE public.tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_titles TEXT[] NOT NULL,
    skill_weights JSONB NOT NULL DEFAULT '{}'::jsonb,
    seniority_levels TEXT[] NOT NULL,
    regions TEXT[] NOT NULL,
    excluded_industries TEXT[] NOT NULL DEFAULT ARRAY['FinTech', 'Payments'],
    featured_proof_point_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. SECTION 3: PROOF POINTS & SIDE PROJECTS (User-Owned)
-- ============================================================================
CREATE TABLE public.proof_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    statement TEXT NOT NULL,
    metric_number NUMERIC NOT NULL,
    metric_unit TEXT NOT NULL,
    metric_direction TEXT NOT NULL,
    time_frame TEXT NOT NULL,
    employer TEXT NOT NULL,
    evidence_url TEXT,
    skills_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.side_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    live_url TEXT,
    repo_url TEXT,
    tech_stack TEXT[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. SECTION 4: GLOBAL COMPANIES & INTELLIGENCE (Canonical / Global)
-- ============================================================================
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    funding_stage TEXT,
    total_funding_usd NUMERIC,
    hq_location TEXT,
    headcount_estimate INTEGER,
    wikidata_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.company_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    one_sentence_summary TEXT NOT NULL,
    funding_details TEXT,
    recent_news JSONB NOT NULL DEFAULT '[]'::jsonb,
    founders JSONB NOT NULL DEFAULT '[]'::jsonb,
    why_you_fit TEXT,
    unconfirmed_points TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id)
);

CREATE TABLE public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    review_date DATE,
    source_url TEXT,
    excerpt TEXT NOT NULL,
    friction_tag TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. SECTION 5: CANONICAL JOBS POOL & INGESTION (Canonical / Global)
-- ============================================================================
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    normalized_title TEXT NOT NULL,
    locations TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    region TEXT NOT NULL DEFAULT 'Global Remote',
    workplace TEXT NOT NULL DEFAULT 'remote',
    seniority TEXT,
    specializations TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    apply_url TEXT NOT NULL,
    primary_source TEXT NOT NULL,
    dedup_match_key TEXT UNIQUE NOT NULL,
    salary_raw TEXT,
    description_text TEXT NOT NULL,
    posted_at TIMESTAMPTZ,
    posting_status posting_status_enum NOT NULL DEFAULT 'OPEN',
    link_checked_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.sources (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    group_type TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    requires_user_key BOOLEAN NOT NULL DEFAULT false,
    user_key_reference TEXT,
    last_run_at TIMESTAMPTZ,
    last_status TEXT,
    last_error TEXT
);

CREATE TABLE public.source_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id TEXT NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    jobs_found INTEGER NOT NULL DEFAULT 0,
    jobs_stored INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    error_message TEXT
);

CREATE TABLE public.job_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    url TEXT NOT NULL,
    raw_payload JSONB,
    confidence contact_confidence_enum NOT NULL DEFAULT 'VERIFIED',
    first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(job_id, source, url)
);

-- ============================================================================
-- 7. SECTION 6: USER-SPECIFIC EVALUATIONS (User-Owned)
-- ============================================================================
CREATE TABLE public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
    tier1_result BOOLEAN NOT NULL DEFAULT true,
    tier1_reason TEXT,
    fit_score INTEGER NOT NULL CHECK (fit_score BETWEEN 0 AND 100),
    tier2_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    score_confidence TEXT NOT NULL DEFAULT 'HIGH',
    strategic_positioning_angle TEXT,
    why_you_excel JSONB NOT NULL DEFAULT '[]'::jsonb,
    score_booster_gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
    stage application_stage_enum NOT NULL DEFAULT 'DISCOVERED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, job_id, track_id)
);

-- ============================================================================
-- 8. SECTION 7: THE THREE DOORS CONTACTS (User-Owned)
-- ============================================================================
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    title TEXT NOT NULL,
    door outreach_door_enum NOT NULL,
    email TEXT,
    email_status TEXT NOT NULL DEFAULT 'UNVERIFIED',
    linkedin_url TEXT,
    source_url TEXT NOT NULL,
    confidence contact_confidence_enum NOT NULL DEFAULT 'INFERRED',
    activity_score INTEGER NOT NULL DEFAULT 50 CHECK (activity_score BETWEEN 0 AND 100),
    last_active_date DATE,
    do_not_contact BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. SECTION 8: CADENCES & GMAIL DRAFT TRACKING (User-Owned)
-- ============================================================================
CREATE TABLE public.cadences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    door outreach_door_enum NOT NULL,
    channel TEXT NOT NULL DEFAULT 'GMAIL',
    step_number INTEGER NOT NULL DEFAULT 1,
    status cadence_step_status_enum NOT NULL DEFAULT 'DRAFT_PENDING',
    suggested_send_at TIMESTAMPTZ NOT NULL,
    gmail_draft_id TEXT,
    gmail_thread_id TEXT,
    sent_at TIMESTAMPTZ,
    subject TEXT,
    body_text TEXT NOT NULL,
    resume_doc_id TEXT,
    resume_pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. SECTION 9: RESUME BULLETS BANK & BUILDS (User-Owned)
-- ============================================================================
CREATE TABLE public.resume_bullets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    track_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    skill_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    bullet_text TEXT NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.cv_builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
    google_doc_id TEXT NOT NULL,
    google_drive_pdf_url TEXT NOT NULL,
    bullet_ids UUID[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 11. SECTION 10: MEETING NOTES & ACTION ITEMS (User-Owned)
-- ============================================================================
CREATE TABLE public.meeting_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
    meeting_title TEXT NOT NULL,
    scheduled_start TIMESTAMPTZ NOT NULL,
    transcription_status TEXT NOT NULL DEFAULT 'COMPLETED',
    transcript_raw TEXT,
    my_action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    their_action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    next_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    google_sheet_row_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 12. SECTION 11: IMMUTABLE DECISION EVENTS AUDIT TRAIL (User-Owned)
-- ============================================================================
CREATE TABLE public.decision_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    actor TEXT NOT NULL,
    aggregate_type TEXT NOT NULL,
    aggregate_id UUID NOT NULL,
    event_name TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security Invariant: Hard Revoke on decision_events
REVOKE UPDATE, DELETE ON public.decision_events FROM PUBLIC, authenticated, anon;

-- ============================================================================
-- 13. PERFORMANCE & QUERY INDEXES (9 Specific Indexes)
-- ============================================================================
CREATE INDEX idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX idx_jobs_posting_status ON public.jobs(posting_status);
CREATE INDEX idx_jobs_posted_at ON public.jobs(posted_at DESC);
CREATE INDEX idx_evaluations_user_stage ON public.evaluations(user_id, stage);
CREATE INDEX idx_evaluations_fit_score ON public.evaluations(fit_score DESC);
CREATE INDEX idx_contacts_company_door ON public.contacts(company_id, door);
CREATE INDEX idx_cadences_user_status ON public.cadences(user_id, status);
CREATE INDEX idx_cadences_suggested_send ON public.cadences(suggested_send_at);
CREATE INDEX idx_decision_events_aggregate ON public.decision_events(aggregate_type, aggregate_id);

-- ============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES (All 18 Tables)
-- ============================================================================
-- Enable RLS on all 18 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.side_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_bullets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_events ENABLE ROW LEVEL SECURITY;

-- 11 User-Owned Tables: Multi-Tenant Isolation (Explicitly TO authenticated)
CREATE POLICY "user_owns_profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_tracks" ON public.tracks FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_proof_points" ON public.proof_points FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_side_projects" ON public.side_projects FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_evaluations" ON public.evaluations FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_contacts" ON public.contacts FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_cadences" ON public.cadences FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_bullets" ON public.resume_bullets FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_cv_builds" ON public.cv_builds FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_meeting_notes" ON public.meeting_notes FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_events" ON public.decision_events FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 7 Global Canonical Tables: Read-Only for Authenticated Users (Explicitly TO authenticated)
CREATE POLICY "authenticated_read_companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_company_briefs" ON public.company_briefs FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_complaints" ON public.complaints FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_jobs" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_job_sources" ON public.job_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_sources" ON public.sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_source_runs" ON public.source_runs FOR SELECT TO authenticated USING (true);

COMMIT;
