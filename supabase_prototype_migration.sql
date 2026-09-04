-- =====================================================================
-- SCHOOL CONNECT — PRODUCTION SCHEMA MIGRATIONS & EXTENSIONS
-- =====================================================================

-- Enable Postgres extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------------------------------------------------------------------
-- 0. SUPABASE STORAGE BUCKETS CONFIGURATION (300 KB LIMIT)
-- ---------------------------------------------------------------------

-- Insert buckets into storage.buckets if not existing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('question-images', 'question-images', true, 307200, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('profile-images', 'profile-images', true, 307200, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = 307200,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS Policies: profile-images
DROP POLICY IF EXISTS "Public Read Profile Images" ON storage.objects;
CREATE POLICY "Public Read Profile Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Authenticated Users Upload Profile Images" ON storage.objects;
CREATE POLICY "Authenticated Users Upload Profile Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images'
);

DROP POLICY IF EXISTS "Users Update Own Profile Images" ON storage.objects;
CREATE POLICY "Users Update Own Profile Images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images')
WITH CHECK (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Users Delete Own Profile Images" ON storage.objects;
CREATE POLICY "Users Delete Own Profile Images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images');

-- Storage RLS Policies: question-images
DROP POLICY IF EXISTS "Public Read Question Images" ON storage.objects;
CREATE POLICY "Public Read Question Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'question-images');

DROP POLICY IF EXISTS "Staff Upload Question Images" ON storage.objects;
CREATE POLICY "Staff Upload Question Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'question-images'
);

DROP POLICY IF EXISTS "Staff Modify Question Images" ON storage.objects;
CREATE POLICY "Staff Modify Question Images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'question-images');

DROP POLICY IF EXISTS "Staff Delete Question Images" ON storage.objects;
CREATE POLICY "Staff Delete Question Images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'question-images');

-- ---------------------------------------------------------------------
-- 1. ENFORCE STRICT SINGLE ATTEMPT PER STUDENT PER MOCK TEST (CRITICAL)
-- ---------------------------------------------------------------------

-- Ensure public.test_attempts columns exist before deduplication and indexing
ALTER TABLE public.test_attempts 
  ADD COLUMN IF NOT EXISTS score_obtained numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS percentage numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status character varying DEFAULT 'COMPLETED',
  ADD COLUMN IF NOT EXISTS question_timings jsonb DEFAULT '{}';

-- Clean up existing duplicate attempts (if any) prior to creating the unique index,
-- retaining the highest-scoring (or most recent) attempt per student per mock test.
DELETE FROM public.test_attempts
WHERE attempt_id NOT IN (
  SELECT DISTINCT ON (student_id, mock_test_id) attempt_id
  FROM public.test_attempts
  ORDER BY student_id, mock_test_id, score_obtained DESC, created_at DESC
);

-- Create unique index preventing duplicate test attempts
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_attempt_per_student_mock
ON public.test_attempts (student_id, mock_test_id);

-- ---------------------------------------------------------------------
-- 2. SCHEMA ADJUSTMENTS & PERFORMANCE INDEXES
-- ---------------------------------------------------------------------

-- Ensure public.student has teacher_id, profile_photo_url, and nullable school_id during onboarding
ALTER TABLE public.student 
  ALTER COLUMN school_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES public.teachers(teacher_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS profile_photo_url text;

-- Ensure public.teachers and public.principals have profile columns
ALTER TABLE public.teachers 
  ADD COLUMN IF NOT EXISTS profile_photo_url text,
  ADD COLUMN IF NOT EXISTS qualification character varying,
  ADD COLUMN IF NOT EXISTS specialization character varying,
  ADD COLUMN IF NOT EXISTS gender character varying;

ALTER TABLE public.principals 
  ADD COLUMN IF NOT EXISTS profile_photo_url text;

-- Fast index for student directory queries by school & status
CREATE INDEX IF NOT EXISTS idx_student_school_status 
ON public.student (school_id, status);

CREATE INDEX IF NOT EXISTS idx_student_teacher_status 
ON public.student (teacher_id, status);

-- Ensure mock_test has required access key columns before indexing
ALTER TABLE public.mock_test 
  ADD COLUMN IF NOT EXISTS access_key character varying(6),
  ADD COLUMN IF NOT EXISTS access_key_created_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS access_key_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS is_multi_subject boolean DEFAULT false;

-- Ensure Master Question Bank table exists
CREATE TABLE IF NOT EXISTS public.question_bank (
  bank_question_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question_number integer,
  subject_id uuid REFERENCES public.subject(subject_id) ON DELETE SET NULL,
  subject_name character varying NOT NULL,
  question_type character varying DEFAULT 'MCQ',
  marks_per_question numeric DEFAULT 4,
  negative_marking numeric DEFAULT 1,
  question_text text NOT NULL,
  option_array jsonb NOT NULL,
  answers jsonb NOT NULL,
  explanation text,
  difficulty character varying DEFAULT 'MEDIUM',
  topic character varying,
  question_image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Fast index for Question Bank pagination and subject filtering
CREATE INDEX IF NOT EXISTS idx_qbank_subject_created 
ON public.question_bank (subject_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_qbank_created_at_desc 
ON public.question_bank (created_at DESC);

-- Ensure public.questions has bank_question_id before indexing
ALTER TABLE public.questions 
  ADD COLUMN IF NOT EXISTS bank_question_id uuid REFERENCES public.question_bank(bank_question_id) ON DELETE SET NULL;

-- Fast index on questions table for bank_question_id usage lookup
CREATE INDEX IF NOT EXISTS idx_questions_bank_lookup 
ON public.questions (bank_question_id) 
WHERE bank_question_id IS NOT NULL;

-- Fast index on mock_test for access key validity checks
CREATE INDEX IF NOT EXISTS idx_mock_test_key_expires 
ON public.mock_test (access_key_expires_at) 
WHERE access_key IS NOT NULL;

-- Trigram index for mock test fuzzy title search
CREATE INDEX IF NOT EXISTS idx_mock_test_title_trgm 
ON public.mock_test USING gin (title gin_trgm_ops);

-- Ensure test_attempt_answers has time_spent_seconds column
ALTER TABLE public.test_attempt_answers 
  ADD COLUMN IF NOT EXISTS time_spent_seconds integer DEFAULT 0;

-- ---------------------------------------------------------------------
-- 3. SECURE LEADERBOARD DATABASE VIEWS / FUNCTIONS
-- ---------------------------------------------------------------------

-- Function: Get mock test leaderboard scoped to student's/requester's school
CREATE OR REPLACE FUNCTION get_mock_test_leaderboard(p_mock_test_id uuid, p_school_id uuid)
RETURNS TABLE (
  rank bigint,
  student_id uuid,
  full_name character varying,
  profile_photo_url text,
  school_id uuid,
  score_obtained numeric,
  percentage numeric,
  time_taken integer,
  submitted_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DENSE_RANK() OVER (ORDER BY a.score_obtained DESC, a.time_taken ASC, a.submitted_at ASC) AS rank,
    s.student_id,
    s.full_name,
    s.profile_photo_url,
    s.school_id,
    COALESCE(a.score_obtained, 0) AS score_obtained,
    COALESCE(a.percentage, 0) AS percentage,
    COALESCE(a.time_taken, 0) AS time_taken,
    a.submitted_at
  FROM public.test_attempts a
  JOIN public.student s ON s.student_id = a.student_id
  WHERE a.mock_test_id = p_mock_test_id
    AND s.school_id = p_school_id
    AND a.status = 'COMPLETED'
  ORDER BY rank ASC, a.submitted_at ASC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get overall school leaderboard aggregated across all mock tests
CREATE OR REPLACE FUNCTION get_school_overall_leaderboard(p_school_id uuid)
RETURNS TABLE (
  rank bigint,
  student_id uuid,
  full_name character varying,
  profile_photo_url text,
  tests_completed bigint,
  total_score numeric,
  avg_percentage numeric,
  last_attempt_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DENSE_RANK() OVER (ORDER BY SUM(COALESCE(a.score_obtained, 0)) DESC, AVG(COALESCE(a.percentage, 0)) DESC) AS rank,
    s.student_id,
    s.full_name,
    s.profile_photo_url,
    COUNT(a.attempt_id) AS tests_completed,
    COALESCE(SUM(a.score_obtained), 0) AS total_score,
    ROUND(AVG(COALESCE(a.percentage, 0)), 1) AS avg_percentage,
    MAX(a.submitted_at) AS last_attempt_at
  FROM public.student s
  JOIN public.test_attempts a ON a.student_id = s.student_id
  WHERE s.school_id = p_school_id
    AND a.status = 'COMPLETED'
  GROUP BY s.student_id, s.full_name, s.profile_photo_url
  ORDER BY rank ASC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
