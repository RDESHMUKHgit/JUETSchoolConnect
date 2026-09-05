# School Connect — Authentic Dummy Data Seed Suite

This directory contains a complete, production-grade seed dataset tailored for the **School Connect** web platform and companion **React Native mobile application**.

> [!IMPORTANT]
> **Safety & Integrity Guarantees**:
> - **Universal Password for ALL Accounts**: Every account (Principals, Teachers, Students, Admins) is configured with the password: **`1234567`**.
> - **Zero Schema Alterations**: 0 tables modified, 0 columns added, 0 types changed.
> - **100% Referential Integrity**: Every foreign key is strictly matched using deterministic RFC4122 UUIDs.
> - **Cross-App Compatibility**: Matches all check constraints, JSONB schemas, and enum values required by both Web & React Native.
> - **Status**: These files are **generated only** and have **NOT** been executed against the live database.

---

## 🔑 Universal Password Policy: `1234567`

In Supabase, user passwords are encrypted using bcrypt inside the `auth.users` table (`encrypted_password`).
Two options are provided to handle passwords:

### ⚡ Option 1: Set Password to `1234567` for ALL Existing Users (Instant)
If you just want to set the password of all users already in your Supabase Authentication tab to **`1234567`**, run [`set_all_passwords_to_1234567.sql`](./set_all_passwords_to_1234567.sql) in the Supabase SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE auth.users
SET 
  encrypted_password = extensions.crypt('1234567', extensions.gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now();
```

### ⚡ Option 2: Full Auth Accounts for All 2,735 Dummy Users
[`00_auth_users_and_passwords.sql`](./00_auth_users_and_passwords.sql) seeds **2,735 accounts** into `auth.users` and `auth.identities` (112 Principals, 493 Teachers, 2,130 Students), pre-confirmed and ready to log in with:
- **Email**: The user's respective email (e.g. `faculty.amit.sharma.1@schoolconnect.edu.in`)
- **Password**: **`1234567`**

---

## 📊 Dataset Inventory & Exact Record Counts

| Sequence | File Name | Records | Description |
| :--- | :--- | :--- | :--- |
| **⚡** | [`set_all_passwords_to_1234567.sql`](./set_all_passwords_to_1234567.sql) | **Standalone Reset** | One-click script to set password to `1234567` for every existing account in Supabase Auth. |
| **00** | [`00_auth_users_and_passwords.sql`](./00_auth_users_and_passwords.sql) | **2,735 Auth Accounts** | Creates `auth.users` and `auth.identities` records for 112 Principals, 493 Teachers, and 2,130 Students with password `1234567` and confirmed emails. |
| **01** | [`01_subjects_and_exams.sql`](./01_subjects_and_exams.sql) | **3 Subjects, 4 Exams** | Mathematics, Physics, Chemistry, and national testing exams (JEE Main 2026, CBSE Class 12, NEET UG, CUET UG). |
| **02** | [`02_schools_and_principals.sql`](./02_schools_and_principals.sql) | **112 Schools, 112 Principals** | Premier institutions across 14 Indian states with real registration numbers, contact info, and 1-to-1 principal leadership linked via `auth_id`. |
| **03** | [`03_teachers.sql`](./03_teachers.sql) | **493 Teachers** | Distributed across all 112 schools (~4.4 teachers/school) across Mathematics, Physics, Chemistry, CS, and Biology with authentic qualifications and employee IDs. |
| **04** | [`04_students.sql`](./04_students.sql) | **2,130 Students** | Class 12 students strictly mapped to their school and assigned to a teacher *within the same school*; unique 12-digit APAAR IDs and admission numbers. |
| **05** | [`05_question_bank_250.sql`](./05_question_bank_250.sql) | **250 STEM Questions** | Rigorous KaTeX-formatted questions (85 Math, 85 Physics, 80 Chem) with standard option arrays and answers JSON. |
| **06** | [`06_mock_tests_and_questions.sql`](./06_mock_tests_and_questions.sql) | **20 Mock Tests & Questions** | Composite and subject-specific mocks with valid 6-digit access keys (e.g. `749201`), time limits, and question linkages. |
| **07** | [`07_test_attempts_telemetry.sql`](./07_test_attempts_telemetry.sql) | **854 Test Attempts** | Realistic student submissions with scores, percentage accuracies, timestamps, and answer breakdowns. |
| **Master** | [`master_seed.sql`](./master_seed.sql) | **All Datasets (3.2 MB)** | Single unified transaction file running 00 through 07 in strict chronological order. |

---

## 🔗 Entity Relationship & Integrity Map

```
[auth.users] (2,735) ─────────────┐ (all passwords: '1234567')
   │                              │
   ├─► [principal] (112) ──► [school] (112)
   │                           ▲
   ├─► [teachers] (493) ───────┤
   │      │                    │
   │      │ 1:N (same school)  │
   │      ▼                    │
   └─► [student] (2,130) ──────┘
          │
          ▼
   [test_attempts] (854) ◄── [mock_test] (20) ◄── [questions] (217) ◄── [question_bank] (250)
```

---

## 🚀 How to Execute Seed Scripts (When Ready)

### Option A: Via Supabase SQL Editor (Recommended)
1. Open the **Supabase Dashboard** &rarr; **SQL Editor**.
2. Run the files sequentially:
   1. `00_auth_users_and_passwords.sql` *(creates login accounts with password: 1234567)*
   2. `01_subjects_and_exams.sql`
   3. `02_schools_and_principals.sql`
   4. `03_teachers.sql`
   5. `04_students.sql`
   6. `05_question_bank_250.sql`
   7. `06_mock_tests_and_questions.sql`
   8. `07_test_attempts_telemetry.sql`
   *(Or run `master_seed.sql` to execute everything in one transaction).*

### Option B: Via Command Line (psql)
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.cedklyodapmquxlancvg.supabase.co:5432/postgres" -f "dummy data/master_seed.sql"
```
