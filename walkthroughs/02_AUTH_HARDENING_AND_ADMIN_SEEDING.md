# Walkthrough 02: Authentication Hardening, Schema Constraints & Admin Seeding

> **Timeline**: Phase 2 (Hardening & Deployment Stabilization)  
> **Source Commits**: `f14ae47` through `2941cbe`  
> **Milestone**: Resolving cloud build bottlenecks, harmonizing database check constraints, and implementing platform administrator provisioning scripts.

---

## 1. Executive Summary

Following initial fullstack construction, live testing revealed edge cases around cloud deployment builds on Render, Supabase database check constraint mismatches for onboarding statuses, and principal designation constraints. This phase hardened the authentication layer, automated database seeding, and refined multi-role onboarding flows.

---

## 2. Key Challenges & Technical Resolutions

### A. Render Cloud Build Failure (`f14ae47`)
- **Problem**: When deploying `server` to Render, TypeScript compilation failed because `@types/express`, `@types/node`, and `@types/jsonwebtoken` were located exclusively in `devDependencies`, which are pruned during standard cloud production builds.
- **Resolution**:
  - Moved essential TypeScript definitions into `dependencies` in `server/package.json`.
  - Updated the Render build command to build and compile TypeScript assets before starting the daemon.

### B. Onboarding Status Check Constraints Harmonization (`0d6042e`)
- **Problem**: Supabase tables had strict database check constraints on user status:
  - `principal.status`: `CHECK (status IN ('NOT_COMPLETED', 'COMPLETED', 'PENDING', 'VERIFIED', 'ACTIVE', 'SUSPENDED'))`
  - `school.status`: `CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'))`
  - When new users signed up or moved between stages, arbitrary values caused PostgreSQL constraint violations.
- **Resolution**:
  - Harmonized the `AuthContext.tsx` client state machine with the backend controllers to use strictly validated enum constants: `NOT_COMPLETED` &rarr; `COMPLETED` &rarr; `PENDING` &rarr; `VERIFIED` / `ACTIVE`.

### C. JWT Token Expiration Collision on Resign (`ae834d1`)
- **Problem**: When refreshing or re-signing tokens during profile updates, `expiresIn: '7d'` clashed with an already present `exp` claim on existing payloads, triggering `JsonWebTokenError: "expiresIn" cannot be passed when "exp" is already present`.
- **Resolution**:
  - Refactored `token.utils.ts` to sanitize and strip `exp` and `iat` claims before passing payloads into `jwt.sign()`.
  - Constrained the Principal designation field to validate between `'Principal'` and `'Vice Principal'`.

### D. Default Platform Administrator Seeding (`a0d534b`)
- **Problem**: The system had no initial super admin account provisioned in fresh environments, making it impossible to approve newly registered schools.
- **Resolution**:
  - Created `server/src/scripts/seed-admin.ts`.
  - Script programmatically checks Supabase Auth for `ADMIN_EMAIL`, creates the auth identity if missing, and syncs the record into `public.admin` with role `SUPER_ADMIN` and status `VERIFIED`.

### E. School Verification Status Synchronization (`594bc6c`)
- **Problem**: Approving a pending school previously only updated the `school` table, leaving the principal account in `PENDING` state and preventing the principal from entering their dashboard.
- **Resolution**:
  - Updated `approveSchool` in `admin.controller.ts` to execute a coordinated update: marks `school.status = 'VERIFIED'` and updates `principal.status = 'ACTIVE'` (with fallback to `'VERIFIED'`).
  - Updated `rejectSchool` to set `school.status = 'REJECTED'` and suspend the principal account.

### F. Principal Faculty Invitation Refinement (`2941cbe`)
- **Problem**: Principals inviting teachers only entered an email address; teachers then had to guess what profile was created.
- **Resolution**:
  - Enhanced the Principal `+ Add Teacher` modal to capture the faculty member's `Full Name` and `Department` upfront.
  - Removed duplicate name prompts from the teacher initial profile completion screen to streamline onboarding.
