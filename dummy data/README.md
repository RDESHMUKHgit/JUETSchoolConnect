# School Connect — Authentic Dummy Data Seed Suite

This directory contains a complete, production-grade seed dataset tailored for the **School Connect** web platform and companion **React Native mobile application**.

> [!IMPORTANT]
> **Database Status: APPLICATION DATA SEEDED DIRECTLY INTO SUPABASE**
> - **112 Schools, 112 Principals, 493 Teachers, 2,130 Students, 250 Questions, 20 Mock Tests, 854 Test Attempts** have already been seeded directly into the live Supabase instance using `npm run seed:dummy`.
> - **Existing Data Preserved**: All existing accounts (`admin@jaypee.ac.in`, `examadmin@jaypee.ac.in`, existing schools, teachers, students) remain 100% intact with 0 deletions.

---

## 📊 Live Database Inventory

| Table | Live Count | Description |
| :--- | :--- | :--- |
| **`school`** | **118** (6 existing + 112 new) | Premier institutions across 14 Indian states (Delhi, Mumbai, Bengaluru, Pune, etc.) with real registration numbers, contact info, and 1-to-1 principal leadership. |
| **`principal`** | **118** (6 existing + 112 new) | Principals and Vice-Principals mapped 1-to-1 with their respective schools. |
| **`teachers`** | **501** (8 existing + 493 new) | Distributed across all schools (~4.4 teachers/school) across Mathematics, Physics, Chemistry, CS, and Biology. |
| **`student`** | **2,143** (13 existing + 2,130 new) | Class 12 students strictly mapped to their school and assigned to a teacher *within the same school*; unique 12-digit APAAR IDs and admission numbers. |
| **`question_bank`** | **325** (75 existing + 250 new) | Rigorous KaTeX-formatted questions (85 Math, 85 Physics, 80 Chem) with standard option arrays and answers JSON. |
| **`mock_test`** | **23** (3 existing + 20 new) | Composite and subject-specific mocks with valid 6-digit access keys (e.g. `749201`), time limits, and question linkages. |
| **`questions`** | **232** (15 existing + 217 new) | Paper questions attached to mock tests. |
| **`test_attempts`** | **858** (4 existing + 854 new) | Realistic student submissions with scores, percentage accuracies, timestamps, and answer breakdowns. |

---

## 🔐 Supabase Auth & Passwords ("Query Too Large" Fix)

The Supabase SQL Editor enforces a **1 MB payload limit** per query tab. The single unified `00_auth_users_and_passwords.sql` file was ~1.75 MB, causing the *"query is too large"* browser error.

To solve this, we have divided the Auth and password creation into small, bite-sized files (< 500 KB each) that run in seconds with **zero errors**:

### Step 1: Set All Existing Accounts Password to `1234567` (Run First)
- File: [`set_all_passwords_to_1234567.sql`](./set_all_passwords_to_1234567.sql) (~1.1 KB)
- What it does: Runs a 3-line query to set the password for **ALL existing accounts** in `auth.users` to `1234567`.

### Step 2: Create Dummy Auth Accounts (Run in Supabase SQL Editor)
Run these lightweight files in sequential order:

1. [`00a_principals_auth.sql`](./00a_principals_auth.sql) (~75 KB) — 112 Principal login accounts with password `1234567`.
2. [`00b_teachers_auth.sql`](./00b_teachers_auth.sql) (~318 KB) — 493 Teacher login accounts with password `1234567`.
3. [`00c_students_auth_part1.sql`](./00c_students_auth_part1.sql) (~454 KB) — Students 1 to 710 login accounts with password `1234567`.
4. [`00d_students_auth_part2.sql`](./00d_students_auth_part2.sql) (~455 KB) — Students 711 to 1420 login accounts with password `1234567`.
5. [`00e_students_auth_part3.sql`](./00e_students_auth_part3.sql) (~456 KB) — Students 1421 to 2130 login accounts with password `1234567`.
6. [`00f_link_auth_ids.sql`](./00f_link_auth_ids.sql) (~0.4 KB) — Links `auth_id` in public tables (`principal`, `teachers`, `student`) to matching auth IDs.

---

## 🔁 How to Re-Seed Application Tables Programmatically
If you ever want to re-run or refresh the application tables, simply run from the repository root:
```bash
cd server
npm run seed:dummy
```
This runs `tsx src/scripts/seed-dummy-data.ts` to directly batch upsert all 112 schools, 112 principals, 493 teachers, 2,130 students, 250 questions, 20 mock tests, and 854 test attempts in ~10 seconds.
