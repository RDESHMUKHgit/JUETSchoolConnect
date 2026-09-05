# Walkthrough 01: Initial Full-Stack Platform Architecture from Scratch

> **Timeline**: Phase 1 (Foundation)  
> **Source Commit**: `6073b68` — *feat: production fullstack platform implementation with Netlify & Render staging configuration*  
> **Milestone**: Initializing from an absolute blank repository to a full-stack, production-grade School–Student Intelligence Platform.

---

## 1. Executive Summary

Starting from an absolute blank codebase, we designed, architected, and engineered **Jaypee School Connect** (later evolved into **School Connect**), a multi-tenant institutional governance and Class 12 student intelligence platform. 

The architecture strictly enforced:
1. Separation of concerns between public web landing/informational pages and authenticated role portals.
2. An isolated, unindexed Platform Admin gateway.
3. Multi-stage state machine onboarding for Principals, Teachers, and Class 12 Students.
4. Production deployment readiness targeting **Render** (Express backend) and **Netlify** (Vite SPA frontend).
5. A high-contrast, academic light theme design system with navy and regal gold aesthetics.

---

## 2. Directory Structure Built from Scratch

```
Jaypee School Connect/code/
├── db_schema.sql             # Reference PostgreSQL / Supabase schema (243 lines)
├── rules.txt                 # User rules & architectural constraints
│
├── server/                   # Express + TypeScript Backend
│   ├── src/
│   │   ├── config/           # env.ts, supabase.ts
│   │   ├── controllers/      # auth, admin, principal, teacher, school, test, announcement
│   │   ├── middlewares/      # auth, role, status, error guards
│   │   ├── routes/           # auth, admin, principal, teacher, school, test, announcement
│   │   ├── types/            # auth.types.ts, database.types.ts
│   │   ├── utils/            # token.utils.ts (JWT & HTTP-only cookies)
│   │   └── index.ts          # Express server entry point
│   ├── package.json
│   └── tsconfig.json
│
└── client/                   # React + Vite + TypeScript Frontend
    ├── src/
    │   ├── api/              # client.ts, auth, admin, principal, teacher, school, test
    │   ├── components/
    │   │   ├── common/       # Navbar (no admin links), Footer, RoleGuard
    │   │   ├── modals/       # RegisterSchoolModal (Step 0 modal)
    │   │   └── ui/           # Button, Input, Select, Card, Badge, Modal, LoadingSpinner
    │   ├── context/          # AuthContext.tsx (Multi-stage onboarding & state machine)
    │   ├── layouts/          # PublicLayout.tsx, PortalSidebarLayout.tsx
    │   ├── pages/
    │   │   ├── public/       # Home, Login (3 roles only), StudentRegister, About, etc.
    │   │   ├── admin/        # AdminPortal (/admin hidden entry & credentials form)
    │   │   ├── principal/    # Dashboard, TeacherManagement, StudentManagement, ViewMockTests
    │   │   ├── teacher/      # Dashboard, StudentDirectory, ViewMockTests
    │   │   └── student/      # Cockpit, MockTestCatalog, TestRunnerEngine, History, Analysis
    │   ├── styles/           # design-system.css (Navy & gold theme)
    │   ├── types/            # index.ts (Typed domain interfaces)
    │   ├── App.tsx           # Complete application router
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── tsconfig.json
```

---

## 3. Database Schema & Supabase Architecture

A 10-table relational schema was created in PostgreSQL with Supabase:
- `school`: Core institution record (registration number, board affiliation, city, state, pin, status).
- `principal`: School administrator linked to `school` and Supabase Auth (`auth_id`).
- `teachers`: Faculty accounts linked to `school` with employee IDs and departments.
- `student`: Enrolled candidates linked to `school` and an assigned faculty mentor (`teacher_id`).
- `admin`: Super administrator and platform manager credentials.
- `subject`: Standard academic subjects (Physics, Chemistry, Mathematics, Biology).
- `mock_test`: Assessment specifications (duration, total questions, marks, passing marks, negative marking).
- `questions`: Question repository with MCQ options and answer keys.
- `test_attempts`: Session records (score, accuracy, time taken, question counts).
- `scholarship_leads`: Automatic scholarship pipeline triggered when student scores reach $\ge 80\%$.

---

## 4. Multi-Stage Onboarding State Machine

A deterministic onboarding state machine was engineered to ensure institutional integrity:

```mermaid
stateDiagram-v2
    [*] --> NULL: Account Created

    state Principal_Flow {
        NULL --> NOT_COMPLETED: Step 0 (Name, Email, Password)
        NOT_COMPLETED --> COMPLETED: Step 1 (Phone, Gender, Designation)
        COMPLETED --> PENDING: Step 2 (School Information Form)
        PENDING --> VERIFIED: Step 3 (Platform Admin Approves School)
    }

    state Teacher_Flow {
        NULL --> PENDING: Teacher Enters Full Name, Dept, Emp ID
        PENDING --> VERIFIED: ONLY Principal Approves Faculty in Dashboard
    }

    state Student_Flow {
        NULL --> NOT_COMPLETED: Step 0 (Name, Email, Password)
        NOT_COMPLETED --> PENDING: Step 1 (Selects Verified School from DB, Admission No)
        PENDING --> VERIFIED: Principal Approves Student Enrollment
    }
```

---

## 5. Strict Admin Isolation

1. **Zero Admin Footprint on Public Web**: The public header and `/login` page featured strictly 3 user roles:
   - `Student`
   - `Teacher`
   - `Principal / School Administrator`
2. **Hidden Administrator Gateway (`/admin`)**:
   - Accessing `/admin` rendered a dedicated, security-monitored administrator login interface.
   - Admin authentication unlocked the platform management console for reviewing schools and live database records.

---

## 6. Initial Student Mock Test Taking Engine

- **Live Countdown Timer**: Automatically submitted the test session when time reached `00:00`.
- **Interactive Question Palette**: Visual tracking of `Answered`, `Marked for Review`, and `Not Visited` questions.
- **Client-Side Security**: Question answer keys were stripped before delivery to prevent DevTools inspect-element leaks.
- **Server Evaluation**: Instant calculation of score, accuracy percentage, and negative marking penalty upon submission.
- **Merit Scholarship Pipeline**: Scores $\ge 80\%$ automatically generated a qualified tuition waiver lead.

---

## 7. Default Light Theme Design System

A luminous light theme was designed in `client/src/styles/design-system.css`:
- Canvas: `#F8FAFC` (Slate 50)
- Surfaces & Cards: `#FFFFFF` with `#E2E8F0` borders and soft drop shadows
- Primary Text: `#0F172A` (Slate 900)
- Accent Colors: Imperial Gold (`#C59B27`) and Institutional Slate Navy (`#0F172A`)
- Status Tokens: Success Emerald (`#10B981`), Warning Amber (`#F59E0B`), Danger Rose (`#E11D48`).
