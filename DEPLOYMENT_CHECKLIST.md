# WorkTrack Pro - Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables

#### Frontend (Root `.env` or Vercel/Render env vars)
- [ ] `VITE_API_BASE_URL` - Backend API URL (e.g., `https://your-backend.vercel.app` or `https://worktrack-pro-server.onrender.com`)

#### Backend (`server/.env.local` or platform env vars)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (keep secret!)
- [ ] `DATABASE_URL` or `SUPABASE_DB_URL` - Database connection string (for migrations)
- [ ] `APP_URL` - Frontend URL (used in email templates)
- [ ] `SMTP_HOST` - SMTP server hostname
- [ ] `SMTP_PORT` - SMTP port (usually 587 for TLS, 465 for SSL)
- [ ] `SMTP_USER` - SMTP username
- [ ] `SMTP_PASS` - SMTP password
- [ ] `SMTP_FROM` - Email sender address (e.g., `"WorkTrack Pro <no-reply@worktrack.pro>"`)

### 2. Database Setup

- [ ] Run migrations: `cd server && npm run migrate:run`
- [ ] Verify tables exist in Supabase dashboard
- [ ] Test database connection

### 3. Local Testing

- [ ] Frontend builds: `npm run build`
- [ ] Backend builds: `cd server && npm run build`
- [ ] Both run together: `npm run dev:all`
- [ ] Test API connectivity from frontend to backend
- [ ] Test email sending: `node server/scripts/send_test_email.js your@email.com`

## Render Deployment

### Frontend (Static Site)
- [ ] Create new Static Site service
- [ ] Connect GitHub repository
- [ ] Set build command: `npm install && npm run build`
- [ ] Set publish directory: `dist`
- [ ] Add environment variable: `VITE_API_BASE_URL` = your backend URL
- [ ] Enable auto-deploy

### Backend (Web Service)
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set root directory: `server`
- [ ] Set build command: `npm ci && npm run build`
- [ ] Set start command: `npm run start`
- [ ] Add all backend environment variables
- [ ] Set Node version: 18
- [ ] Run migrations after first deploy (via Render shell or script)
- [ ] Enable auto-deploy

## Vercel Deployment

### Option A: Two Separate Projects (Recommended)

#### Frontend Project
- [ ] Create new Vercel project
- [ ] Import repository
- [ ] Framework: Other / Vite
- [ ] Root directory: (leave empty, uses repo root)
- [ ] Build command: `npm install && npm run build`
- [ ] Output directory: `dist`
- [ ] Add environment variable: `VITE_API_BASE_URL` = your backend URL

#### Backend Project
- [ ] Create new Vercel project
- [ ] Import same repository
- [ ] Framework: Next.js (auto-detected)
- [ ] Root directory: `server`
- [ ] Add all backend environment variables
- [ ] Run migrations after first deploy

### Option B: Monorepo (Single Project)
- [ ] Use `vercel.json` configuration
- [ ] Set up both builds in single project
- [ ] Configure routes appropriately

## Post-Deployment Verification

- [ ] Frontend loads without errors
- [ ] Backend API responds (check `/api/admin/employees` or similar)
- [ ] Frontend can reach backend (check browser network tab)
- [ ] Database queries work (test a page that loads data)
- [ ] Email sending works (test onboarding approval)
- [ ] CORS headers are set correctly (if frontend/backend on different domains)

## Troubleshooting

### Frontend can't reach backend
- Check `VITE_API_BASE_URL` is set correctly
- Verify backend is deployed and running
- Check CORS headers in `server/next.config.js`
- Check browser console for errors

### Backend errors
- Check environment variables are set
- Verify Supabase credentials
- Check database connection
- Review server logs

### Build failures
- Ensure Node version matches (18.x)
- Check all dependencies are in `package.json`
- Verify build commands are correct
- Check for TypeScript errors

## Security Notes

- [ ] Never commit `.env` files
- [ ] Rotate secrets if accidentally committed
- [ ] Use environment variables in deployment platform
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` secret (server-only)
- [ ] Review CORS settings for production


