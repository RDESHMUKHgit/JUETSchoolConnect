# Walkthrough 06: Global Background Pattern & Platform-Wide Mock Test Analytics

> **Timeline**: Phase 6 (Aesthetic Polishing & Assessment Telemetry)  
> **Source Commit**: `c54a0f9` + current updates  
> **Milestone**: Integrating the ambient transparent patterned background at 50% opacity globally, and delivering platform-wide mock test candidate analytics.

---

## 1. Executive Summary

Phase 6 polished the visual ambiance of the platform by integrating an elegant transparent pattern overlay (`base_bg.png`) tuned to 50% opacity across all public and portal views. In addition, the Super Admin's assessment auditing capabilities were expanded with deep platform-wide analytics, providing detailed candidate rosters linking every attempt to its student, school, and assigned faculty mentor.

---

## 2. Key Features Delivered

### A. Global Ambient Background Pattern at 50% Opacity
- **Transparent Pattern Integration**: Integrated `/base_bg.png` across the entire web application via `client/src/styles/design-system.css` and `client/src/index.css`.
- **50% Opacity Calibration via Pseudo-Element**:
  - Implemented using a fixed `body::before` pseudo-element to isolate the pattern's opacity without degrading foreground text contrast or card luminance:
    ```css
    body {
      position: relative;
      min-height: 100vh;
      background-color: var(--bg-darkest);
    }

    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-image: url('/base_bg.png');
      background-repeat: repeat;
      background-position: top center;
      background-attachment: fixed;
      opacity: 0.5;
      pointer-events: none;
      z-index: 0;
    }

    #root {
      position: relative;
      z-index: 1;
      background-color: transparent;
    }
    ```
- **Translucent Portals Layering**: Updated `PortalSidebarLayout.tsx` with translucent sidebars and headers (`rgba(255, 255, 255, 0.95)` with `backdrop-filter: blur(12px)`), allowing the subtle ambient pattern to tile behind public pages and all portal views.

### B. Super Admin Mock Test Platform Analytics & Candidate Roster
- **Backend Analytics Endpoint (`GET /api/admin/mock-tests/:testId/analytics`)**:
  - Fetches the mock test specification and question blueprint.
  - Queries all `test_attempts` across the entire platform.
  - Performs cross-table hydration across `student`, `school`, and `teachers` to link candidate names, institutions, and assigned faculty mentors.
  - Aggregates high-yield statistics: total attempts, highest score, lowest score, average score, average correct count, mean percentage accuracy, and participating school counts.
- **Enhanced Inspector Modal in `AdminPortal.tsx`**:
  - Replaced the basic inspector with a dual-view dialog (`maxWidth="1000px"`):
    1. **Tab 1: Platform Performance & Candidate Roster**:
       - **KPI Metric Tiles**:
         - Total Attempts
         - Average Correct (out of total questions)
         - Highest Score (out of maximum marks)
         - Average Platform Score & Mean Accuracy percentage
         - Total Participating Schools
       - **Candidate Roster Table**:
         - Rank & Student Name (with admission number and APAAR ID)
         - School / Institution (with city and state)
         - Assigned Faculty Mentor (with department)
         - Score Obtained (color-coded green if passing marks met)
         - Percentage Accuracy badge
         - Answer Breakdown (Correct `C` / Wrong `W` / Skipped `S`)
         - Time Taken (`Xm Ys`)
         - Submission Date and timestamp
       - **Real-Time Candidate Search**: Live filtering across candidate names, admission numbers, APAAR IDs, schools, and teachers.
    2. **Tab 2: Paper Questions & Blueprint**:
       - Complete question texts, diagrams, options, marks, and negative marking penalty with correct answers highlighted in green.
