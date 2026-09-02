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
        CHECK (role IN ('ADMIN', 'SUPER_ADMIN')),
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