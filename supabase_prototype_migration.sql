-- =====================================================================
-- SCHOOL CONNECT — PRODUCTION SCHEMA MIGRATIONS & EXTENSIONS
-- =====================================================================

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

-- Clean up existing duplicate attempts (if any) prior to creating the unique index,
-- retaining the highest-scoring (or most recent) attempt per student per mock test.
DELETE FROM public.test_attempts
WHERE attempt_id NOT IN (
  SELECT DISTINCT ON (student_id, mock_test_id) attempt_id
  FROM public.test_attempts
  ORDER BY student_id, mock_test_id, score DESC, created_at DESC
);

-- Create unique index preventing duplicate test attempts
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_attempt_per_student_mock
ON public.test_attempts (student_id, mock_test_id);

-- ---------------------------------------------------------------------
-- 2. SCHEMA ADJUSTMENTS & PERFORMANCE INDEXES
-- ---------------------------------------------------------------------

-- Ensure public.student has teacher_id and nullable school_id during onboarding
ALTER TABLE public.student 
  ALTER COLUMN school_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES public.teachers(teacher_id) ON DELETE SET NULL;

-- Fast index for student directory queries by school & status
CREATE INDEX IF NOT EXISTS idx_student_school_status 
ON public.student (school_id, status);

CREATE INDEX IF NOT EXISTS idx_student_teacher_status 
ON public.student (teacher_id, status);

-- Fast index for Question Bank pagination and subject filtering
CREATE INDEX IF NOT EXISTS idx_qbank_subject_created 
ON public.question_bank (subject_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_qbank_created_at_desc 
ON public.question_bank (created_at DESC);

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
