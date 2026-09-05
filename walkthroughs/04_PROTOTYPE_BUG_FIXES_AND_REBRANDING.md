# Walkthrough 04: Prototype Problem Solving, Schema Migrations & Universal Rebranding

> **Timeline**: Phase 4 (Prototype Refinements)  
> **Source Commits**: `edd4f0e` through `0f9c416`  
> **Milestone**: Resolving duplicate index collisions, consolidating storage buckets, universal rebranding to School Connect, fixing dashboard profile modal triggers, and stabilizing student leaderboards.

---

## 1. Executive Summary

During live testing of prototype workflows, several database constraint collisions, storage policy conflicts, and UI bugs surfaced. Phase 4 corrected these defects, finalized the SQL migrations, eliminated unnecessary storage buckets, universally rebranded the application to **School Connect**, and resolved student portal tab persistence.

---

## 2. Issues Encountered & Solutions

### A. Unique Index Collision on Duplicate Test Attempts (`f742101`, `6b28f35`)
- **Error**:
  ```
  ERROR: 23505: could not create unique index "idx_single_attempt_per_student_mock"
  DETAIL: Key (student_id, mock_test_id)=(...) is duplicated.
  ```
- **Root Cause**: Earlier prototype test runs had left multiple attempts per student for the same mock test in `test_attempts`. When the migration script tried to create a unique index, PostgreSQL rejected it.
- **Resolution**:
  - Authored a deduplication SQL query inside `supabase_prototype_migration.sql`:
    ```sql
    DELETE FROM public.test_attempts
    WHERE attempt_id NOT IN (
      SELECT DISTINCT ON (student_id, mock_test_id) attempt_id
      FROM public.test_attempts
      ORDER BY student_id, mock_test_id, score_obtained DESC, created_at DESC
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_single_attempt_per_student_mock
      ON public.test_attempts (student_id, mock_test_id);
    ```
  - Corrected column name reference from legacy `score` to `score_obtained`.

### B. Storage Bucket Consolidation & Profile Photos Removal (`b73686f`, `7a75549`)
- **Error**: SQL migration failed referencing non-existent `public.principals` (table is singular `public.principal`) and attempting to provision multiple storage buckets (`avatars`, `profile-photos`).
- **Resolution**:
  - Consolidated file storage into a single dedicated storage bucket: `question-images` (for diagram attachments in question papers).
  - Completely stripped profile photo uploads across all role dashboards and onboarding screens (Principals, Teachers, Students), replacing them with clean vector role avatars and badges.

### C. Universal Rebranding to "School Connect" (`f742101`)
- **Requirement**: Remove references to "Jaypee" across the public website and portals; the platform is officially named **School Connect**.
- **Resolution**:
  - Rebranded public hero sections, headers, footers, meta descriptions, page titles, and notification copy to **School Connect**.
  - Retained clean institutional styling while ensuring brand uniformity across every route.

### D. Dashboard Profile Edit Form Refresh Bug (`f742101`)
- **Problem**: In the School (Principal) Dashboard and Teacher Dashboard, clicking the "Edit Profile" button reloaded/refreshed the entire page instead of opening the update information modal.
- **Resolution**:
  - Root-caused to button elements missing `type="button"` inside forms and anchor tags with empty `href="#"` triggering page refreshes.
  - Replaced with controlled React state modal triggers (`setShowEditProfile(true)`) with `e.preventDefault()`.

### E. Student Leaderboard Tab Disappearance (`7a75549`)
- **Problem**: In the Student Portal, navigating into the "Test History" view caused the "Leaderboards" tab button to vanish from the navigation bar.
- **Resolution**:
  - Harmonized `getStudentNavItems()` in `navigation.tsx` so that `Leaderboard` remains a permanent, top-level navigation item alongside Cockpit, Mock Tests, and Test History.
