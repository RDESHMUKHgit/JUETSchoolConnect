-- =====================================================================
-- 00f. LINK AUTH IDS FOR ALL DUMMY USERS IN PUBLIC TABLES
-- =====================================================================
UPDATE public.principal p SET auth_id = p.principal_id WHERE auth_id IS NULL;
UPDATE public.teachers t SET auth_id = t.teacher_id WHERE auth_id IS NULL;
UPDATE public.student s SET auth_id = s.student_id WHERE auth_id IS NULL;
