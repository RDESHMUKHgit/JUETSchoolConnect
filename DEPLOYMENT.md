# Jaypee School Connect — Hosting & Deployment Guide

This guide describes how to deploy **Jaypee School Connect** on **Render** (Backend API) and **Netlify** (Frontend Single Page Application).

---

## Architecture Overview

```
                        ┌─────────────────────────────────────────┐
                        │      Netlify (Frontend Client)          │
                        │    https://<your-app>.netlify.app       │
                        └──────────────────┬──────────────────────┘
                                           │
                        HTTPS / JSON API   │ (Cookies: SameSite=None; Secure)
                        Credentials        │ (Header: Authorization Bearer)
                                           ▼
                        ┌─────────────────────────────────────────┐
                        │        Render (Backend Server)          │
                        │   https://<your-api>.onrender.com       │
                        └──────────────────┬──────────────────────┘
                                           │
                                           ▼
                        ┌─────────────────────────────────────────┐
                        │      Supabase PostgreSQL Database       │
                        │      Auth + Public Schema Tables        │
                        └─────────────────────────────────────────┘
```

---

## 1. Deploying Backend on Render

1. Log in to [Render](https://render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository: `https://github.com/RDESHMUKHgit/JUETSchoolConnect.git`.
3. Select your deployment branch (e.g. `develop` or `staging`).
4. Configure the service settings:
   - **Name**: `jaypee-school-connect-api`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode (enables secure cookies) |
   | `PORT` | `10000` | Port assigned by Render |
   | `CLIENT_URL` | `https://<your-netlify-app>.netlify.app` | Netlify frontend origin (or comma-separated) |
   | `SUPABASE_URL` | `https://cedklyodapmquxlancvg.supabase.co` | Supabase project URL |
   | `SUPABASE_KEY` | `sb_publishable_p4Ekx-sCQ7-DB0iuFsT0gg_eN94x42x` | Supabase key |
   | `JWT_SECRET` | `jaypee_school_connect_super_jwt_secret_key_2026_production` | JWT signing secret |
   | `JWT_EXPIRES_IN` | `7d` | Token expiry |
   | `COOKIE_NAME` | `jaypee_session_token` | Session cookie identifier |
6. Click **Create Web Service**.
7. Once deployed, copy your Render URL (e.g., `https://jaypee-school-connect-api.onrender.com`).
   Verify by visiting `https://jaypee-school-connect-api.onrender.com/api/health`.

---

## 2. Deploying Frontend on Netlify

1. Log in to [Netlify](https://www.netlify.com/) and click **Add new site** -> **Import an existing project**.
2. Connect to GitHub and select `RDESHMUKHgit/JUETSchoolConnect`.
3. Select the branch (e.g., `develop` or `staging`).
4. Netlify will automatically detect `netlify.toml`:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist` (or `dist`)
5. Under **Site configuration** -> **Environment variables**, add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://jaypee-school-connect-api.onrender.com/api` | Point to your live Render backend `/api` |
   | `VITE_SUPABASE_URL` | `https://cedklyodapmquxlancvg.supabase.co` | Supabase project URL |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_p4Ekx-sCQ7-DB0iuFsT0gg_eN94x42x` | Supabase publishable key |
6. Click **Deploy Site**.
7. Once built, copy your Netlify URL (e.g., `https://juet-school-connect.netlify.app`).

---

## 3. Connecting Frontend and Backend

1. In Render dashboard for your backend, ensure `CLIENT_URL` is set to your Netlify site URL (e.g., `https://juet-school-connect.netlify.app`).
2. Both SPA page reloads and cross-origin authentication requests will work smoothly:
   - `client/public/_redirects` ensures direct navigation to `/login`, `/admin`, `/student`, etc. never returns a 404.
   - Dual-token auth architecture uses both `SameSite=None; Secure` cookies and `Authorization: Bearer <token>` fallback headers for browser compatibility.
