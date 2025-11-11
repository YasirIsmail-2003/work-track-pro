Deployment guide — Render and Vercel

This doc explains how to deploy the WorkTrack Pro monorepo (Vite frontend + Next backend) to Render and Vercel.

Repository layout (relevant parts):
- / (root) — Vite React frontend
  - package.json (root contains frontend scripts)
  - public/ (place `logo-worktrack.png` here)
- /server — Next.js backend
  - server/package.json

Prerequisites
- GitHub repository for this project.
- Accounts on Render and/or Vercel with access to that GitHub repo.
- Environment variables and secrets for production (see list below).

Common environment variables (example names — adapt for your stack):
- DATABASE_URL (Postgres connection string, if backend uses a DB)
- SUPABASE_URL (if using Supabase)
- SUPABASE_SERVICE_ROLE_KEY
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (for nodemailer)
- NEXT_PUBLIC_SOME_VAR (any public envs used in frontend)
- NODE_ENV=production

A note about ports: Render/Vercel manage ports automatically. Locally the frontend runs on 8080 (Vite), backend on 3000 (Next).

Render (recommended: use manifest or dashboard)
--------------------------------------------
We added a `render.yaml` at the repo root with two services: a static site for the frontend and a web service for the Next backend.

Quick steps (Render dashboard):
1. In Render dashboard, click "New" → "Import from GitHub".
2. Choose this repository and branch (e.g., main).
3. For the frontend service (static site):
   - Set build command: `npm install && npm run build`
   - Publish directory: `dist`
   - Auto-deploy: on
   - Add any required environment variables under Settings → Environment.
4. For the backend service (web service):
   - Root directory: `server`
   - Build command: `npm install && npm run build`
   - Start command: `npm run start` (executed in `server/`)
   - Set environment variables (DATABASE_URL, SUPABASE keys, SMTP credentials, etc.)
   - Choose instance type/plan
5. Alternatively, use the `render.yaml` manifest to import the stack as a single rendered group. Edit `render.yaml` to set your repo URL and branch.

Notes:
- If your backend needs a managed Postgres DB, add one in Render and update `DATABASE_URL`.
- Render’s Node environment will use `npm run start` to run the Next production server (`next start`) — ensure you build first.

Vercel (two project approach or monorepo)
---------------------------------------
Vercel works best if you create two projects in the dashboard (one for the frontend static site and one for the Next backend). You can also configure a single monorepo project with custom `vercel.json` builds.

Option A — Two separate Vercel projects:
1. Frontend project:
   - In Vercel, choose "New Project" → Import Git repository → pick repo.
   - Set the Root Directory to the repository root (leave blank).
   - Framework Preset: Other / Vite.
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
   - Environment variables: set `NEXT_PUBLIC_...` or other public keys if your frontend needs them.

2. Backend (Next) project:
   - New Project → Import repo → Set Root Directory to `server`.
   - Framework Preset: Next.js
   - Vercel will detect Next and set build/start automatically.
   - Add environment variables (DATABASE_URL, SUPABASE keys, SMTP credentials) in the Vercel dashboard.

Option B — Single Vercel project using `vercel.json` (monorepo style)
- We included a sample `vercel.json` in the repo root. It instructs Vercel to build the Next app inside `server/` and the static site from the root. This approach still needs to be configured in the Vercel dashboard; sometimes creating two projects is easier and faster.

Sample vercel.json files in this repo:
- `vercel.json` (root): build definitions for both frontend and backend.
- `server/vercel.json`: optional server-level configuration for Next.

What to set in Vercel (envs/secrets):
- Add all environment variables (server-side) as Environment Variables in the Vercel project for `server/` (or on the monorepo project under the correct scope):
  - DATABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - SUPABASE_URL
  - SMTP_* credentials
  - Any other `NEXT_PUBLIC_` variables used by the frontend can be added to the frontend project.

Local build & test before deploy
--------------------------------
1. Build frontend locally (in repo root):
   ```powershell
   npm install
   npm run build
   # the dist/ folder will be generated
   ```
2. Build backend (in server):
   ```powershell
   cd server
   npm install
   npm run build
   # ensure server can be started with env vars
   npm run start
   ```

Tips & troubleshooting
----------------------
- If your Next backend requires secrets during build (like Supabase keys used at build-time), set them in the deployment platform as Build-time env vars.
- Use Vercel's Preview Deploys to test branch deploys before promoting to Production.
- If you get 500s after deploy, check the deployment logs for missing env vars or DB connection errors.
- If the frontend expects the backend API under a different domain, configure CORS or use rewrites in Vercel/Render.

Need me to do this for you?
---------------------------
I can:
- Fill in `render.yaml` and `vercel.json` with your GitHub repo URL and branch.
- Add a small GitHub Actions workflow to automatically build and push artifacts to Render or Vercel (if you prefer CI-based deploys).
- Help set up environment variables (safely) if you paste sanitized values or allow me to create sample placeholders.

If you want me to continue, tell me which provider you prefer (Render or Vercel), and whether you want me to: (A) commit repo-specific configs (replace <your-repo> placeholders), (B) add a GitHub Actions workflow for auto-deploy, or (C) set up vercel/render manifests for a monorepo two-project deployment.