-- ============================================================
-- MIGRATION: SUPPORT EXAM_ADMIN & TEST ATTEMPTS METRICS
-- ============================================================

-- 1. Expand admin table role constraint to support EXAM_ADMIN
ALTER TABLE public.admin DROP CONSTRAINT IF EXISTS admin_role_check;
ALTER TABLE public.admin ADD CONSTRAINT admin_role_check 
  CHECK (role IN ('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'));

-- 2. Add score_obtained, percentage, and status to test_attempts
ALTER TABLE public.test_attempts 
  ADD COLUMN IF NOT EXISTS score_obtained numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS percentage numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status character varying DEFAULT 'COMPLETED';
