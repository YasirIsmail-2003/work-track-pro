-- Seed data for WorkTrack Pro
-- NOTE: This seed creates example rows for frontend development only.
-- You will likely want to replace the profile ids with real auth.user ids created via Supabase Auth.

-- Profiles (admin + employees)
insert into public.profiles (id, role, full_name, phone, status, employee_id, pay_rate_per_hour, max_hours_per_week, created_at)
values
  ('00000000-0000-0000-0000-000000000001','ADMIN','Alice Admin','+911234567890','ACTIVE','ADM-001',1000.00,48, now()),
  ('00000000-0000-0000-0000-000000000011','EMPLOYEE','Nishanth Gowda','+919876543210','ACTIVE','EMP-011',250.00,40, now()),
  ('00000000-0000-0000-0000-000000000012','EMPLOYEE','Ravi Kumar','+919812345678','ACTIVE','EMP-012',220.00,40, now());

-- Clients
insert into public.clients (id, name, contact_email, contact_phone, metadata, created_at)
values
  ('10000000-0000-0000-0000-000000000001','Acme Corp','pm@acme.example','+911112223333', '{"industry":"ecomm"}', now());

-- Tasks
insert into public.tasks (id, title, description, client_id, assignee, status, estimated_hours, created_at)
values
  ('20000000-0000-0000-0000-000000000001','Website bugfix','Fix checkout flow issue', '10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','IN_PROGRESS', 4.0, now()),
  ('20000000-0000-0000-0000-000000000002','Client onboarding','Prepare onboarding docs','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000012','PENDING', 8.0, now());

-- Task timers (one open timer for emp 011, one stopped timer for emp 012)
insert into public.task_timers (id, task_id, user_id, started_at, stopped_at, created_at)
values
  ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011', now() - interval '30 minutes', null, now()),
  ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000012', now() - interval '2 hours', now() - interval '1 hour', now());

-- Time entries (work & breaks)
insert into public.time_entries (id, user_id, task_id, start_time, end_time, is_break, notes, created_at)
values
  ('40000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','20000000-0000-0000-0000-000000000001', now() - interval '3 hours', now() - interval '2 hours', false, 'Morning work block', now()),
  ('40000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000011', null, now() - interval '2 hours', now() - interval '1 hour 30 minutes', true, 'Coffee break', now());

-- Timesheet for the week for emp 011
insert into public.timesheets (id, user_id, week_start, week_end, total_hours, status, created_at)
values
  ('50000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011', date_trunc('week', now())::date, (date_trunc('week', now())::date + 6), 12.5, 'DRAFT', now());

-- Presence
insert into public.presence (user_id, last_heartbeat, active_task_id, tab_visible, device, updated_at)
values
  ('00000000-0000-0000-0000-000000000011', now() - interval '30 seconds', '20000000-0000-0000-0000-000000000001', true, 'chrome-desktop', now()),
  ('00000000-0000-0000-0000-000000000012', now() - interval '10 minutes', null, false, 'mobile', now());

-- Leave requests
insert into public.leave_requests (id, user_id, leave_type, start_date, end_date, reason, status, created_at)
values
  ('60000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000012','ANNUAL', current_date + 7, current_date + 9, 'Family event', 'PENDING', now());

-- NOTES:
-- 1) If you plan to use Supabase Auth, create real users in Auth and then update public.profiles.id to match auth.users.id for correct RLS behavior.
-- 2) OTP hashes should be generated server-side with bcrypt; task_client_otps in seed is intentionally omitted — the server should create real OTP rows when needed.
