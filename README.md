
WorkTrack Pro
=============

WorkTrack Pro is a dual-application monorepo:

- **Frontend:** Vite + React (TypeScript) located at the repository root. It renders landing, employee, and admin experiences with a component library built on top of shadcn/ui + Radix primitives.
- **Backend:** Next.js (App Router) located inside `server/`. It exposes REST-style API routes backed by Supabase (service-role) and Nodemailer for email delivery. Database schema and seed data live in `server/migrations`.

The two parts communicate over HTTP. The frontend uses a configurable base URL (`VITE_API_BASE_URL`) so it can call the backend whether both apps are hosted on the same domain or on separate providers (Render / Vercel).

Project Structure
-----------------

```
├── src/                  # Vite frontend source
│   ├── components/       # shadcn-derived UI building blocks
│   ├── pages/            # route-level pages (admin & employee areas)
│   └── lib/              # shared helpers (API client, utils, hooks)
├── public/               # static assets served by Vite
├── server/               # Next.js backend (App Router)
│   ├── app/api/          # REST endpoints for admin/employee flows
│   ├── email/templates/  # HTML templates for transactional emails
│   ├── migrations/       # SQL migrations and seeds for Supabase/Postgres
│   └── scripts/          # Utility scripts (run migrations, send test mail)
├── env.sample            # Frontend environment variable template
├── server/env.sample     # Backend environment variable template
├── render.yaml           # Render manifest (static frontend + Node backend)
├── vercel.json           # Example Vercel monorepo configuration
└── README_DEPLOY.md      # Detailed deployment instructions
```

Getting Started
---------------

1. **Install dependencies**
   ```powershell
   npm install
   npm --prefix server install
   ```

2. **Create environment files**
   ```powershell
   copy env.sample .env
   copy server\env.sample server\.env.local
   ```
   Edit the copies with your Supabase, SMTP, and database credentials. For local development you can point `VITE_API_BASE_URL` to `http://localhost:3000`, Supabase URL to your project, and SMTP to a local catcher such as MailHog.

3. **Run the backend (port 3000)**
   ```powershell
   cd server
   npm run dev
   ```

4. **Run the frontend (port 8080)**
   ```powershell
   npm run dev
   ```

5. **Or run both with one command**
   ```powershell
   npm run dev:all
   ```
   `dev:all` uses `concurrently` to start the Vite dev server and the Next backend together. Ensure the environment variables are loaded in the same shell before launching.

Testing & Quality
-----------------

- **Linting:** `npm run lint`
- **Backend tests:** `npm --prefix server run test` (Vitest suite focused on OTP helpers)

Database & Migrations
---------------------

The backend relies on Supabase/Postgres tables defined in `server/migrations/001_init.sql` and seeded in `002_seed.sql`. To apply these migrations against a local or managed Postgres instance:

```powershell
cd server
npm run migrate:run   # requires DATABASE_URL or SUPABASE_DB_URL in env
```

Deployment
----------

See `README_DEPLOY.md` for a full walkthrough covering Render (static frontend + Node backend) and Vercel (two projects or monorepo). Key points:

- Frontend build command: `npm run build` → outputs to `dist/`
- Backend build/start: `npm run build` and `npm run start` inside `server/`
- Set `VITE_API_BASE_URL` to the backend’s public URL so the static frontend can reach the APIs.
- Supplying Supabase service-role keys and SMTP credentials is required for production features (user onboarding, email notifications, OTPs).

Troubleshooting
---------------

- **Frontend shows no data:** confirm `VITE_API_BASE_URL` points to a live backend and CORS is allowed when hosted on separate origins.
- **Backend fails to boot:** missing Supabase or SMTP environment variables will throw at startup. Double-check `server/.env.local`.
- **Emails not delivered:** verify SMTP credentials and that `SMTP_PORT` matches your provider. Use `node server/scripts/send_test_email.js you@example.com` to test.

For more help or deployment automation scripts, see `README_DEPLOY.md` or reach out.
