# School Connect — Authentic Dummy Data Seed Suite

This directory contains a complete, production-grade seed dataset tailored for the **School Connect** web platform and companion **React Native mobile application**.

> [!IMPORTANT]
> **Safety & Integrity Guarantees**:
> - **Zero Schema Alterations**: 0 tables modified, 0 columns added, 0 types changed.
> - **100% Referential Integrity**: Every foreign key is strictly matched using deterministic RFC4122 UUIDs.
> - **Cross-App Compatibility**: Matches all check constraints, JSONB schemas, and enum values required by both Web & React Native.
> - **Status**: These files are **generated only** and have **NOT** been executed against the live database.

---

## 📊 Dataset Inventory & Exact Counts

| Sequence | File Name | Records | Description |
| :--- | :--- | :--- | :--- |
| **01** | [`01_subjects_and_exams.sql`](./01_subjects_and_exams.sql) | **3 Subjects, 4 Exams** | Mathematics, Physics, Chemistry, and national testing exams (JEE Main 2026, CBSE Class 12, NEET UG, CUET UG). |
| **02** | [`02_schools_and_principals.sql`](./02_schools_and_principals.sql) | **112 Schools, 112 Principals** | Premier institutions across 14 Indian states (Delhi, Mumbai, Bengaluru, Pune, etc.) with real registration numbers, contact info, and 1-to-1 principal leadership. |
| **03** | [`03_teachers.sql`](./03_teachers.sql) | **493 Teachers** | Distributed across all 112 schools (~4.4 teachers/school) across Mathematics, Physics, Chemistry, CS, and Biology with authentic qualifications and employee IDs. |
| **04** | [`04_students.sql`](./04_students.sql) | **2,130 Students** | Class 12 students strictly mapped to their school and assigned to a teacher *within the same school*; unique 12-digit APAAR IDs and admission numbers. |
| **05** | [`05_question_bank_250.sql`](./05_question_bank_250.sql) | **250 STEM Questions** | Rigorous KaTeX-formatted questions (85 Math, 85 Physics, 80 Chem) with standard option arrays and answers JSON. |
| **06** | [`06_mock_tests_and_questions.sql`](./06_mock_tests_and_questions.sql) | **20 Mock Tests & Questions** | Composite and subject-specific mocks with valid 6-digit access keys (e.g. `749201`), time limits, and question linkages. |
| **07** | [`07_test_attempts_telemetry.sql`](./07_test_attempts_telemetry.sql) | **854 Test Attempts** | Realistic student submissions with scores, percentage accuracies, timestamps, and answer breakdowns. |
| **Master** | [`master_seed.sql`](./master_seed.sql) | **All Datasets** | Single unified transaction file running 01 through 07 in strict chronological order. |

---

## 🔗 Entity Relationship & Integrity Map

```
[subject] ───────────────┬────────────────────────┐
                         │                        │
[school] (112) ──────────┼───────────────┐        │
   │ 1:1                 │               │        │
[principal] (112)        ▼               ▼        ▼
   │              [mock_test] (20) ◄─ [questions] ◄── [question_bank] (250)
   │ 1:N                 │               │
   ▼                     │               │
[teachers] (493)         │               │
   │ 1:N                 ▼               │
[student] (2,130) ──► [test_attempts] ◄──┘
```

---

## 🚀 How to Execute Seed Scripts (When Ready)

### Option A: Via Supabase SQL Editor (Recommended)
1. Open the **Supabase Dashboard** &rarr; **SQL Editor**.
2. Run the files sequentially:
   1. `01_subjects_and_exams.sql`
   2. `02_schools_and_principals.sql`
   3. `03_teachers.sql`
   4. `04_students.sql`
   5. `05_question_bank_250.sql`
   6. `06_mock_tests_and_questions.sql`
   7. `07_test_attempts_telemetry.sql`
   *(Or copy-paste `master_seed.sql` to execute everything in one transaction).*

### Option B: Via Command Line (psql)
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.cedklyodapmquxlancvg.supabase.co:5432/postgres" -f "dummy data/master_seed.sql"
```
