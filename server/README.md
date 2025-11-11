# WorkTrack Pro — Backend (Next.js + Supabase)

This folder contains a Next.js App Router backend that uses Supabase (server/service role) and Nodemailer for SMTP emails.

Quick start (after filling `.env.local`):

1. cd server
2. npm install
3. copy `.env.example` to `.env.local` and fill values
4. npm run dev

Important env vars (see `.env.example`). Do NOT commit secrets. Use the Supabase service role key only on the server.

This folder also includes SQL migrations for Supabase (see `migrations/001_init.sql`) and a seed file.
