# Jaypee School Connect (JUETSchoolConnect)

A production-grade School–Student Intelligence Platform connecting Schools, Principals, Teachers, Class 12 Students, and Jaypee University Platform Administration.

> **Note**: This branch (`develop`) contains the active full-stack codebase prepared for team review, collaborative feature development, and staging deployment on Netlify & Render.

---

## 📁 Repository Structure

```
├── client/                 # React + Vite + TypeScript Frontend
│   ├── public/             # Static assets & _redirects for Netlify SPA routing
│   ├── src/
│   │   ├── api/            # Typed fetch API clients (with Bearer & cookie auth)
│   │   ├── components/     # UI primitives, common layout items, modals
│   │   ├── context/        # AuthContext (multi-stage onboarding & state machine)
│   │   ├── layouts/        # PublicLayout, PortalSidebarLayout
│   │   ├── pages/          # Public, Admin, Principal, Teacher, Student portals
│   │   └── styles/         # CSS design system (Light Theme by default)
│   ├── .env.example        # Client environment variable template
│   └── package.json
│
├── server/                 # Express + TypeScript Backend
│   ├── src/
│   │   ├── config/         # Environment & Supabase client configuration
│   │   ├── controllers/    # Auth, admin, principal, teacher, school, test
│   │   ├── middlewares/    # Authentication, role-based, status guards
│   │   ├── routes/         # RESTful API route endpoints
│   │   ├── types/          # Domain interfaces & JWT payload types
│   │   └── utils/          # JWT signing & cross-origin cookie management
│   ├── .env.example        # Server environment variable template
│   └── package.json
│
├── db_schema.sql           # PostgreSQL / Supabase reference schema
├── netlify.toml            # Netlify deployment configuration (SPA rewrites)
├── render.yaml             # Render deployment blueprint for Express backend
├── DEPLOYMENT.md           # Step-by-step Netlify & Render hosting instructions
└── .gitignore              # Ignores .env, GARBAGE, node_modules, dist
```

---

## 🚀 Quick Start (Local Development)

### 1. Backend Server Setup
```bash
cd server
npm install
cp .env.example .env     # Fill in your Supabase credentials
npm run dev              # Starts Express server on http://localhost:5000
```

### 2. Frontend Client Setup
```bash
cd client
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:5000/api
npm run dev              # Starts Vite dev server on http://localhost:5173
```

---

## 🌐 Staging & Hosting Instructions

Detailed hosting instructions for **Netlify** (Frontend) and **Render** (Backend API) can be found in [DEPLOYMENT.md](DEPLOYMENT.md).

- **Netlify**: Auto-configured via `netlify.toml` and `client/public/_redirects` (Base: `client`, Publish: `dist`).
- **Render**: Auto-configured via `render.yaml` (Root: `server`, Build: `npm install && npm run build`, Start: `npm start`).
- **Cross-Origin Auth**: Configured with `SameSite=None; Secure` cookies and `Authorization: Bearer <token>` fallback headers.
