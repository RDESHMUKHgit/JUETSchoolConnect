# Walkthrough 07: Authentic Dummy Data Seed Script Suite

> **Timeline**: Phase 7 (Dataset Engineering & Mobile/Web Integrity)  
> **Milestone**: Generating a comprehensive, authentic seed data suite with zero schema alteration, 100% referential integrity, and strict isolation from live database execution.

---

## 1. Executive Summary

Phase 7 delivered a production-grade dummy data suite stored entirely within a dedicated root folder named [`dummy data/`](file:///s:/College%20journey/COLLEGE%20THINGS/Jaypee%20School%20Connect/code/dummy%20data). The dataset was engineered to mirror realistic Indian secondary education systems without modifying database schemas, altering table definitions, or executing unapproved mutations against the live Supabase instance.

---

## 2. Dataset Inventory & Exact Record Counts

| Sequence | Script File | Target Count | Actual Generated | Referential Linkages & Details |
| :---: | :--- | :---: | :---: | :--- |
| **01** | [`01_subjects_and_exams.sql`](file:///s:/College%20journey/COLLEGE%20THINGS/Jaypee%20School%20Connect/code/dummy%20data/01_subjects_and_exams.sql) | **3 Subj, 4 Exams** | **3 Subj, 4 Exams** | Mathematics, Physics, Chemistry; JEE Main 2026, CBSE Class 12, NEET UG, CUET UG. |
| **02** | [`02_schools_and_principals.sql`](file:///s:/College%20journey/COLLEGE%20THINGS/Jaypee%20School%20Connect/code/dummy%20data/02_schools_and_principals.sql) | **112 Schools, 112 Principals** | **112 Schools, 112 Principals** | Premier schools across Delhi, Mumbai, Bengaluru, Pune, Lucknow, Jaipur, Chennai, Kolkata, etc. with valid registration numbers, 6-digit PIN codes, domains, and 1-to-1 principal leadership. |
| **03** | [`03_teachers.sql`](file:///s:/College%20journey/COLLEGE%20THINGS/Jaypee%20School%20Connect/code/dummy%20data/03_teachers.sql) | **493 Teachers** | **493 Teachers** | Distributed across all 112 schools (~4.4 teachers/school); authentic PGT faculty across Mathematics, Physics, Chemistry, CS, and Biology with unique employee IDs (`EMP-2024-xxxx`) and qualifications. |
| **04** | [`04_students.sql`](file:///s:/College%20journey/COLLEGE%20THINGS/Jaypee%20School%20Connect/code/dummy%20data/04_students.sql) | **2,130 Students** | **2,130 Students** | Class 12 candidates strictly mapped to schools and assigned to teachers *in their exact same school*; unique 12-digit APAAR IDs (`9182...`) and admission numbers (`ADM/2024/...`). |
| **05** | [`05_question_bank_250.sql`](file:///s:/College%20journey/COLLEGE%20THINGS/Jaypee%20School%20Connect/code/dummy%20data/05_question_bank_250.sql) | **250 STEM Questions** | **250 STEM Questions** | Rigorous KaTeX-formatted questions (85 Mathematics, 85 Physics, 80 Chemistry) with standardized option arrays and answer keys. |
| **06** | [`06_mock_tests_and_questions.sql`](file:///s:/College%20journey/COLLEGE%20THINGS/Jaypee%20School%20Connect/code/dummy%20data/06_mock_tests_and_questions.sql) | **20 Mock Tests** | **20 Tests, 217 Questions** | Composite and single-subject assessments with valid 6-digit access keys (e.g. `749201`), time limits, and question linkages. |
| **07** | [`07_test_attempts_telemetry.sql`](file:///s:/College%20journey/COLLEGE%20THINGS/Jaypee%20School%20Connect/code/dummy%20data/07_test_attempts_telemetry.sql) | **~850 Attempts** | **854 Attempts** | Realistic submissions with calculated scores, percentage accuracies, timestamps, and zero duplicate `(student_id, mock_test_id)` collisions. |
| **Master** | [`master_seed.sql`](file:///s:/College%20journey/COLLEGE%20THINGS/Jaypee%20School%20Connect/code/dummy%20data/master_seed.sql) | **All Datasets** | **1.35 MB Unified SQL** | Chronological single-transaction execution file (`BEGIN ... COMMIT;`). |
| **Runner** | [`generate_seed_data.js`](file:///s:/College%20journey/COLLEGE%20THINGS/Jaypee%20School%20Connect/code/dummy%20data/generate_seed_data.js) | **Generator Engine** | **Reproducible Script** | Self-contained deterministic Node.js script to recreate the entire dataset on demand. |

---

## 3. Referential Integrity & Compatibility Audits

- **Zero School-Teacher Mismatches**: Audited all 2,130 students; 100% of students have their `teacher_id` pointing to a teacher belonging to that student's parent `school_id`.
- **Zero Broken Bank References**: All 217 paper questions in mock tests link directly to existing `bank_question_id` records in `question_bank`.
- **Check Constraint Compliance**: All check constraints (`board_affiliation IN ('CBSE', 'ICSE')`, `school_type IN ('PRIVATE', 'GOVT.', 'GIRLS ONLY', 'BOYS ONLY')`, `status`, etc.) strictly adhered to.
- **Mobile App Safety**: React Native mobile app schema contracts remain 100% intact with zero column modifications or missing fields.
- **Non-Execution In Live DB**: Live Supabase database verified untouched (5 schools, 7 teachers, 11 students intact).
