-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.school (
  school_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  state character varying NOT NULL,
  city character varying NOT NULL,
  pin character varying,
  board_affiliation character varying CHECK (board_affiliation::text = ANY (ARRAY['CBSE'::character varying, 'ICSE'::character varying]::text[])),
  registration_no character varying UNIQUE,
  contact_email character varying,
  official_phone character varying,
  website_url text,
  school_type character varying CHECK (school_type::text = ANY (ARRAY['GOVT.'::character varying, 'PRIVATE'::character varying, 'GIRLS ONLY'::character varying, 'BOYS ONLY'::character varying]::text[])),
  medium_of_institution character varying CHECK (medium_of_institution::text = ANY (ARRAY['HINDI'::character varying, 'ENGLISH'::character varying]::text[])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT school_pkey PRIMARY KEY (school_id)
);
CREATE TABLE public.principal (
  principal_id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  full_name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  phone character varying,
  password_hash text NOT NULL,
  profile_photo_url text,
  gender character varying,
  designation character varying CHECK (designation::text = ANY (ARRAY['P'::character varying, 'VP'::character varying]::text[])),
  status character varying NOT NULL DEFAULT 'PENDING'::character varying CHECK (status::text = ANY (ARRAY['PENDING'::character varying, 'ACTIVE'::character varying, 'SUSPENDED'::character varying]::text[])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT principal_pkey PRIMARY KEY (principal_id),
  CONSTRAINT fk_principal_school FOREIGN KEY (school_id) REFERENCES public.school(school_id)
);
CREATE TABLE public.teachers (
  teacher_id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  full_name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  phone character varying,
  profile_photo_url text,
  teachers_emp_id character varying,
  designation character varying,
  department character varying,
  qualification character varying,
  specialization character varying,
  gender character varying,
  joining_date date,
  dob date,
  status character varying NOT NULL DEFAULT 'PENDING'::character varying CHECK (status::text = ANY (ARRAY['PENDING'::character varying, 'ACTIVE'::character varying, 'SUSPENDED'::character varying]::text[])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT teachers_pkey PRIMARY KEY (teacher_id),
  CONSTRAINT fk_teacher_school FOREIGN KEY (school_id) REFERENCES public.school(school_id)
);
CREATE TABLE public.student (
  student_id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  teacher_id uuid,
  full_name character varying NOT NULL,
  email character varying UNIQUE,
  phone_no character varying,
  profile_photo_url text,
  admission_no character varying,
  apaar character varying UNIQUE,
  dob date,
  gender character varying,
  class integer NOT NULL DEFAULT 12,
  status character varying NOT NULL DEFAULT 'PENDING'::character varying CHECK (status::text = ANY (ARRAY['PENDING'::character varying, 'ACTIVE'::character varying, 'SUSPENDED'::character varying]::text[])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT student_pkey PRIMARY KEY (student_id),
  CONSTRAINT fk_student_school FOREIGN KEY (school_id) REFERENCES public.school(school_id),
  CONSTRAINT fk_student_teacher FOREIGN KEY (teacher_id) REFERENCES public.teachers(teacher_id)
);
CREATE TABLE public.subject (
  subject_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subject_pkey PRIMARY KEY (subject_id)
);
CREATE TABLE public.exam (
  exam_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT exam_pkey PRIMARY KEY (exam_id)
);
CREATE TABLE public.mock_test (
  mock_test_id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id uuid,
  exam_id uuid,
  title character varying NOT NULL,
  description text,
  total_questions integer NOT NULL CHECK (total_questions >= 0),
  max_marks numeric NOT NULL CHECK (max_marks >= 0::numeric),
  max_time_in_mins integer CHECK (max_time_in_mins > 0),
  scheduled_time timestamp with time zone,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  negative_marking boolean NOT NULL DEFAULT false,
  passing_marks numeric,
  instructions text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT mock_test_pkey PRIMARY KEY (mock_test_id),
  CONSTRAINT fk_mock_test_subject FOREIGN KEY (subject_id) REFERENCES public.subject(subject_id),
  CONSTRAINT fk_mock_test_exam FOREIGN KEY (exam_id) REFERENCES public.exam(exam_id)
);
CREATE TABLE public.questions (
  question_id uuid NOT NULL DEFAULT gen_random_uuid(),
  mock_test_id uuid NOT NULL,
  subject_id uuid,
  question_text text NOT NULL,
  question_type character varying,
  marks_per_question numeric DEFAULT 1 CHECK (marks_per_question >= 0::numeric),
  question_image_url text,
  negative_marking numeric DEFAULT 0 CHECK (negative_marking >= 0::numeric),
  option_array jsonb,
  answers jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT questions_pkey PRIMARY KEY (question_id),
  CONSTRAINT fk_question_mock_test FOREIGN KEY (mock_test_id) REFERENCES public.mock_test(mock_test_id),
  CONSTRAINT fk_question_subject FOREIGN KEY (subject_id) REFERENCES public.subject(subject_id)
);
CREATE TABLE public.test_attempts (
  attempt_id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  mock_test_id uuid NOT NULL,
  submitted_at timestamp with time zone,
  time_taken integer,
  total_questions integer,
  attempted_questions integer,
  correct_ans integer DEFAULT 0,
  wrong_ans integer DEFAULT 0,
  unanswered integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT test_attempts_pkey PRIMARY KEY (attempt_id),
  CONSTRAINT fk_attempt_student FOREIGN KEY (student_id) REFERENCES public.student(student_id),
  CONSTRAINT fk_attempt_mock_test FOREIGN KEY (mock_test_id) REFERENCES public.mock_test(mock_test_id)
);

-- 1. Detailed per-question response table
CREATE TABLE public.test_attempt_answers (
  attempt_answer_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES public.test_attempts(attempt_id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.questions(question_id),
  selected_options jsonb,
  is_correct boolean,
  time_spent_seconds integer
);

-- 2. Dwell time & engagement telemetry
CREATE TABLE public.student_activity_logs (
  log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.student(student_id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  page_route character varying NOT NULL,
  duration_seconds integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Scholarship & Admission Lead Tracking
CREATE TABLE public.scholarship_leads (
  lead_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.student(student_id) ON DELETE CASCADE,
  score_percentile numeric,
  scholarship_slab character varying, -- e.g. '50% Tuition Waiver'
  counselor_call_status character varying DEFAULT 'NOT_CONTACTED',
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- 1. DROP PASSWORD_HASH & LINK TO SUPABASE AUTH (AUTH.USERS)
-- ============================================================

-- Remove manual password hashing from principal & link auth_id
ALTER TABLE public.principal 
  DROP COLUMN IF EXISTS password_hash,
  ADD COLUMN IF NOT EXISTS auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

-- Link teacher table to Supabase Auth
ALTER TABLE public.teachers 
  ADD COLUMN IF NOT EXISTS auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

-- Link student table to Supabase Auth
ALTER TABLE public.student 
  ADD COLUMN IF NOT EXISTS auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update Teacher status constraint to support your onboarding flow ('INVITED')
ALTER TABLE public.teachers 
  DROP CONSTRAINT IF EXISTS teachers_status_check;

ALTER TABLE public.teachers 
  ADD CONSTRAINT teachers_status_check 
  CHECK (status::text = ANY (ARRAY['INVITED'::character varying, 'PENDING'::character varying, 'ACTIVE'::character varying, 'SUSPENDED'::character varying]::text[]));


-- ============================================================
-- 2. PAPER LEAK FIX: SECURE VIEW (STRIPS OUT ANSWERS)
-- ============================================================

-- Creates a safe view that never serves the `answers` column to clients
CREATE OR REPLACE VIEW public.student_questions_view AS
SELECT 
  question_id,
  mock_test_id,
  subject_id,
  question_text,
  question_type,
  marks_per_question,
  question_image_url,
  negative_marking,
  option_array
FROM public.questions;

CREATE TABLE public.admin (
    admin_id uuid NOT NULL DEFAULT gen_random_uuid(),
    auth_id uuid NOT NULL UNIQUE,
    full_name varchar NOT NULL,
    email varchar NOT NULL UNIQUE,
    phone varchar,
    role varchar NOT NULL DEFAULT 'ADMIN'
        CHECK (role IN ('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN')),
    status varchar NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED')),
    profile_photo_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT admin_pkey PRIMARY KEY (admin_id),
    CONSTRAINT fk_admin_auth
        FOREIGN KEY (auth_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

-- 1. Allow principal to exist temporarily before school is registered
ALTER TABLE public.principal ALTER COLUMN school_id DROP NOT NULL;

-- 2. Expand allowed status values for onboarding states
ALTER TABLE public.principal DROP CONSTRAINT IF EXISTS principal_status_check;

ALTER TABLE public.principal ADD CONSTRAINT principal_status_check 
CHECK (status::text = ANY (ARRAY[
  'NOT_COMPLETED'::text, 
  'COMPLETED'::text, 
  'PENDING'::text, 
  'ACTIVE'::text, 
  'SUSPENDED'::text
]));

-- 1. Kill the broken trigger and function trying to write to "profiles"
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Add the missing 'status' column to public.school so school verification works
ALTER TABLE public.school 
ADD COLUMN IF NOT EXISTS status character varying NOT NULL DEFAULT 'PENDING' 
CHECK (status::text = ANY (ARRAY['PENDING'::text, 'VERIFIED'::text, 'REJECTED'::text]));

-- 3. Ensure principal.school_id is nullable for the 3-step draft flow
ALTER TABLE public.principal ALTER COLUMN school_id DROP NOT NULL;

-- 4. Ensure principal.status supports draft states without crashing
ALTER TABLE public.principal DROP CONSTRAINT IF EXISTS principal_status_check;

ALTER TABLE public.principal ADD CONSTRAINT principal_status_check 
CHECK (status::text = ANY (ARRAY[
  'NOT_COMPLETED'::text, 
  'COMPLETED'::text, 
  'PENDING'::text, 
  'ACTIVE'::text, 
  'SUSPENDED'::text
]));


-- Allow NOT_COMPLETED and REJECTED in teachers status
ALTER TABLE public.teachers DROP CONSTRAINT IF EXISTS teachers_status_check;

ALTER TABLE public.teachers ADD CONSTRAINT teachers_status_check 
CHECK (status::text = ANY (ARRAY[
  'NOT_COMPLETED'::text, 
  'PENDING'::text, 
  'ACTIVE'::text, 
  'SUSPENDED'::text
]));

-- Expand student table status constraints
ALTER TABLE public.student DROP CONSTRAINT IF EXISTS student_status_check;

ALTER TABLE public.student ADD CONSTRAINT student_status_check 
CHECK (status::text = ANY (ARRAY[
  'NOT_COMPLETED'::text, 
  'PENDING'::text, 
  'ACTIVE'::text, 
  'SUSPENDED'::text
]));

-- 1. Enable Trigram Extension for real fuzzy text matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create a GIN index on school name for instant searching
CREATE INDEX IF NOT EXISTS school_name_trgm_idx ON public.school USING gin (name gin_trgm_ops);

-- 3. Create fuzzy search RPC function
CREATE OR REPLACE FUNCTION search_schools(search_term text)
RETURNS SETOF public.school AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.school
  WHERE 
    similarity(name, search_term) > 0.15
    OR name ILIKE ('%' || search_term || '%')
    OR city ILIKE ('%' || search_term || '%')
  ORDER BY 
    similarity(name, search_term) DESC,
    name ASC
  LIMIT 15;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


ALTER TABLE public.admin DROP CONSTRAINT IF EXISTS admin_role_check;
ALTER TABLE public.admin ADD CONSTRAINT admin_role_check 
  CHECK (role IN ('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'));

ALTER TABLE public.test_attempts 
  ADD COLUMN IF NOT EXISTS score_obtained numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS percentage numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status character varying DEFAULT 'COMPLETED';



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
