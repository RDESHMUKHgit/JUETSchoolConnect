-- ==============================================================================
-- JAYPEE SCHOOL CONNECT — ALL-IN-ONE CONSOLIDATED MIGRATION SCRIPT
-- Copy and paste this complete script into the Supabase SQL Editor and click RUN.
-- ==============================================================================

-- 1. ADMIN TABLE: Expand role check constraint to support 'EXAM_ADMIN'
ALTER TABLE public.admin DROP CONSTRAINT IF EXISTS admin_role_check;
ALTER TABLE public.admin ADD CONSTRAINT admin_role_check 
  CHECK (role IN ('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'));

-- Update existing exam admin account role to EXAM_ADMIN
UPDATE public.admin 
SET role = 'EXAM_ADMIN' 
WHERE email = 'examadmin@jaypee.ac.in';


-- 2. SUBJECTS: Ensure foundational subjects exist (Mathematics, Physics, Chemistry)
INSERT INTO public.subject (name, description)
VALUES 
  ('Mathematics', 'Higher Secondary Mathematics (Calculus, Algebra, Coordinate Geometry, Vectors)'),
  ('Physics', 'Higher Secondary Physics (Mechanics, Electrodynamics, Optics, Modern Physics)'),
  ('Chemistry', 'Higher Secondary Chemistry (Physical, Organic, and Inorganic Chemistry)')
ON CONFLICT (name) DO NOTHING;


-- 3. MOCK TEST: Add columns for 6-digit access key, validity, and multi-subject indicator
ALTER TABLE public.mock_test 
  ADD COLUMN IF NOT EXISTS access_key character varying(6),
  ADD COLUMN IF NOT EXISTS access_key_created_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS access_key_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS is_multi_subject boolean DEFAULT false;

-- Create index for instant access key lookup during student validation
CREATE INDEX IF NOT EXISTS idx_mock_test_access_key 
  ON public.mock_test(access_key) 
  WHERE access_key IS NOT NULL;


-- 4. MULTI-SUBJECT MOCK TESTS: Normalized many-to-many junction table
CREATE TABLE IF NOT EXISTS public.mock_test_subjects (
  mock_test_id uuid NOT NULL REFERENCES public.mock_test(mock_test_id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subject(subject_id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (mock_test_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_mock_test_subjects_test 
  ON public.mock_test_subjects(mock_test_id);

CREATE INDEX IF NOT EXISTS idx_mock_test_subjects_subject 
  ON public.mock_test_subjects(subject_id);

-- Backfill junction table with existing mock test subject associations
INSERT INTO public.mock_test_subjects (mock_test_id, subject_id)
SELECT mock_test_id, subject_id 
FROM public.mock_test 
WHERE subject_id IS NOT NULL
ON CONFLICT DO NOTHING;


-- 5. MASTER QUESTION BANK: Dataset table storing all available pool questions
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

CREATE INDEX IF NOT EXISTS idx_question_bank_subject 
  ON public.question_bank(subject_name);

CREATE INDEX IF NOT EXISTS idx_question_bank_created 
  ON public.question_bank(created_at DESC);


-- 6. QUESTIONS TABLE: Link test paper questions to the source question bank
ALTER TABLE public.questions 
  ADD COLUMN IF NOT EXISTS bank_question_id uuid REFERENCES public.question_bank(bank_question_id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_questions_bank_id 
  ON public.questions(bank_question_id);


-- 7. TEST ATTEMPTS: Native columns for score evaluation, percentage, and completion status
ALTER TABLE public.test_attempts 
  ADD COLUMN IF NOT EXISTS score_obtained numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS percentage numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status character varying DEFAULT 'COMPLETED';

CREATE INDEX IF NOT EXISTS idx_test_attempts_student 
  ON public.test_attempts(student_id);

CREATE INDEX IF NOT EXISTS idx_test_attempts_test 
  ON public.test_attempts(mock_test_id);
