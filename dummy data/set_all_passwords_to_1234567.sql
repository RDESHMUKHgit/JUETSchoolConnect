-- =====================================================================
-- ⚡ SET PASSWORD TO '1234567' FOR ALL SUPABASE AUTH USERS
-- =====================================================================
-- Run this query directly in the Supabase Dashboard -> SQL Editor to
-- instantly update all existing user accounts in the Authentication tab
-- (Super Admin, Exam Admin, Teachers, Students, Principals) to have the
-- universal password:
--
--     PASSWORD: 1234567
--
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Update encrypted_password to '1234567' for ALL accounts in auth.users
UPDATE auth.users
SET 
  encrypted_password = extensions.crypt('1234567', extensions.gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now();

-- 2. Verify updated user accounts in auth.users
SELECT 
  id, 
  email, 
  role, 
  raw_user_meta_data->>'role' AS platform_role,
  raw_user_meta_data->>'full_name' AS full_name,
  email_confirmed_at, 
  updated_at
FROM auth.users
ORDER BY updated_at DESC;
