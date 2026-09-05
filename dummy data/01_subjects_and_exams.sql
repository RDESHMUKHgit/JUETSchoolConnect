-- =====================================================================
-- 01. SUBJECTS AND STANDARDIZED EXAMS SEED
-- =====================================================================

-- Subjects (Mathematics, Physics, Chemistry)
INSERT INTO public.subject (subject_id, name, description)
VALUES
  ('50a02b50-667d-4beb-add5-a05a11204e9a', 'Mathematics', 'Higher Secondary Mathematics (Calculus, Algebra, Coordinate Geometry, Vectors)'),
  ('58aeea98-85ee-4405-9225-57a9bf025aec', 'Physics', 'Higher Secondary Physics (Mechanics, Electrodynamics, Optics, Modern Physics)'),
  ('d7e1c77a-3837-4f8a-a673-5c852bd356ab', 'Chemistry', 'Higher Secondary Chemistry (Physical, Organic, and Inorganic Chemistry)')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description;

-- National Testing Authorities & Boards (JEE Main, CBSE 12th, NEET UG, CUET UG)
INSERT INTO public.exam (exam_id, name, description)
VALUES
  ('595c136f-8a4f-44c7-be0c-c91eef1531f2', 'JEE Main 2026', 'National Testing Agency Joint Entrance Examination (Main)'),
  ('629d81b4-2b63-4871-bc01-e23a67281f01', 'CBSE Class 12 Board', 'Central Board of Secondary Education Senior School Certificate Examination'),
  ('738e92c5-3c74-4982-cd12-f34b78392a02', 'NEET UG 2026', 'National Eligibility cum Entrance Test (Undergraduate)'),
  ('849f03d6-4d85-4a93-de23-a45c89403b03', 'CUET UG 2026', 'Common University Entrance Test (Undergraduate)')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description;
