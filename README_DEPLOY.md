README — Deploy WorkTrack Pro (Render & Vercel)

This document explains how to deploy the WorkTrack Pro repository (Vite frontend at the repo root + Next backend in `server/`) to Render and Vercel. It assumes the repository is already pushed to GitHub.

---

Quick layout reminder
- Frontend: repository root (Vite) — runs `npm run build` and outputs `dist/`
- Backend: `server/` (Next.js) — uses `server/package.json` scripts: `dev`, `build`, `start`

Prerequisites
- GitHub repo containing this code.
- Accounts on Render and/or Vercel with access to that GitHub repo.
- Node v18+ recommended for building both parts.
- Ensure secrets and sensitive files are not committed (use `.env` locally and the provided `env.sample` / `server/env.sample` files as references).

Environment variables (examples — do NOT commit values)
- `VITE_API_BASE_URL` (frontend uses this to call the backend; set to the deployed backend URL, e.g. `https://worktrack-pro-server.onrender.com`)
- `DATABASE_URL` (Postgres connection string) or `SUPABASE_DB_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `APP_URL` (production frontend URL, used in transactional emails)
- Any other `NEXT_PUBLIC_*` variables you add

Local build & test (PowerShell)
- From repo root (frontend):
  ```powershell
  npm install
  npm run dev      # run Vite dev server at http://localhost:8080
  npm run build    # produce production output in dist/
  ```

- Backend (server/):
  ```powershell
  cd server
  npm install
  npm run dev      # run Next dev server at http://localhost:3000
  npm run build
  npm run start    # run production server after build
  ```

Important: keep secrets out of git. Copy `env.sample` ➜ `.env` at the repo root and `server/env.sample` ➜ `server/.env.local` (or `.env`) for local development. Both sample files list every required variable with safe placeholders.

Deploying to Render
-------------------
You can use the included `render.yaml` manifest or configure services in Render's dashboard.

Option A — Using Render dashboard (recommended for beginners)
1. Sign in to Render and click "New" -> "Import from GitHub" -> choose this repo and branch (e.g., `main`).
2. Create a Static Site for the frontend:
   - Name: `worktrack-pro-frontend` (or your choice)
   - Branch: `main`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Set environment variables (any `NEXT_PUBLIC_` values the frontend needs) under Settings -> Environment.
   - Enable auto-deploy if desired.
3. Create a Web Service for the backend:
   - Name: `worktrack-pro-server`
   - Root Directory or Repo Path: `server` (set this so Render builds the `server/` folder)
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start` (executed in `server/`)
   - Add env vars in the Render dashboard (DATABASE_URL, SUPABASE keys, SMTP creds). Make sure to set Build and Runtime env vars as needed.
   - Choose an instance type/plan and click Create.
4. (Optional) Add a managed Postgres on Render and copy `DATABASE_URL` into the service env.

Option B — Using `render.yaml` manifest
- Edit `render.yaml` at repo root to set your GitHub repo URL and branch.
- Import the manifest into Render (New -> Import -> Manifest) and follow instructions.

Notes for Render
- Render runs `next start` to serve Next in production. Ensure `server/package.json` has a `build` and `start` script (it does by default: `next build` and `next start`).
- If the backend needs services (DB, Redis), add them in Render and set env vars accordingly.

Deploying to Vercel
-------------------
Vercel supports monorepos, but splitting into two Vercel projects (frontend and backend) is often simpler.

Option A — Two separate projects (recommended)
1. Frontend (Vite):
   - Create a new Vercel project -> import the repo.
   - In the project setup, set the Root Directory to the repository root (leave empty).
   - Framework Preset: Other / Vite.
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
   - Set any `NEXT_PUBLIC_*` env vars in the Vercel project settings.
2. Backend (Next):
   - Create a second Vercel project -> import the same repo.
   - Set the Root Directory to `server` (so Vercel builds the Next app in `server/`).
   - Framework Preset: Next.js (Vercel will detect it)
   - Add server-side env vars in Project Settings (DATABASE_URL, SUPABASE keys, SMTP creds). Choose whether these are available at build time or runtime depending on your needs.

Option B — Single monorepo project using `vercel.json`
- A sample `vercel.json` is included at repo root. This can be used to instruct Vercel how to build both the root static site and the server Next app. However, monorepo config can be tricky; sometimes creating 2 projects (one per root) is easier.

Setting env vars on Vercel
- Go to your Project -> Settings -> Environment Variables and add the keys. For server-only secrets (e.g., `SUPABASE_SERVICE_ROLE_KEY`), mark them as Environment: Production and Preview as needed, but do NOT mark them as public.

Testing after deploy
- Frontend: open the Frontend URL (Vercel/Render) and confirm the UI loads and shows assets from `public/` (logo etc.).
- Backend: check backend logs in the provider dashboard for errors. Confirm API routes respond and DB connectivity works.

CI / Auto deploys
- Both Render and Vercel auto-deploy on push by default (when connected to GitHub). Ensure your branch (e.g., `main`) is configured in the provider.

Security & secrets
- Never commit `.env` files with real secrets. If any secret was committed, rotate it immediately (Supabase service key, SMTP password, DB passwords).
- Use `server/.env.example` in git with placeholder names only.
- Add secrets in Render or Vercel via their dashboard and reference them via `process.env.<KEY>` in your code.

Troubleshooting
- 500 errors after deploy: check logs for missing env vars, DB connection errors, or failed migrations.
- Build fails: check build logs for missing build-time env vars. Add them as Build environment variables in Render or Vercel.
- Ports: platforms manage ports — do not hardcode port values in production. For local testing, Vite uses 8080 and Next uses 3000.

Optional next steps I can do for you
- Replace placeholder repo URLs in `render.yaml` and `vercel.json` with your GitHub repo and set branch names.
- Add a GitHub Action workflow that triggers Render or notify Vercel on push.
- Add a short `docs/DEPLOY-quick.md` with screenshots of the Render/Vercel dashboard steps.

If you want me to fill placeholders and commit the provider-specific configs for you (render repo URL, Vercel project settings), tell me the repo URL and which provider/project pair you'd like me to finalize and I will commit the changes.
