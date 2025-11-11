-- WorkTrack Pro initial schema (Supabase / Postgres)
-- Profiles
create extension if not exists pgcrypto;

-- Schemas and core tables for WorkTrack Pro
-- NOTE: Run this in Supabase SQL editor using a privileged (service) role.

create extension if not exists pgcrypto;

-- Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key,
  role text not null check (role in ('ADMIN','EMPLOYEE')),
  full_name text not null,
  phone text,
  status text not null default 'PENDING_EMAIL' check (status in ('PENDING_EMAIL','PENDING_ADMIN_REVIEW','ACTIVE','REJECTED')),
  employee_id text unique,
  pay_rate_per_hour numeric(10,2) default 0,
  max_hours_per_week int default 40,
  documents_folder text,
  aadhaar_token_ref text,
  aadhaar_last4 text,
  consent_given_at timestamptz,
  first_login_completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Documents (uploaded files references)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_key text not null,
  url text,
  uploaded_at timestamptz default now(),
  type text,
  metadata jsonb
);

-- Leave requests
create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  leave_type text not null check (leave_type in ('ANNUAL','SICK','UNPAID','OTHER')),
  start_date date not null,
  end_date date not null,
  reason text,
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED','CANCELLED')),
  created_at timestamptz default now(),
  decided_by_admin uuid references public.profiles(id),
  decided_at timestamptz
);

-- Clients
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text,
  contact_phone text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  client_id uuid references public.clients(id) on delete set null,
  assignee uuid references public.profiles(id) on delete set null,
  status text not null default 'PENDING' check (status in ('PENDING','IN_PROGRESS','REVIEW','DONE','CANCELLED')),
  priority text default 'MEDIUM',
  estimated_hours numeric(8,2) default 0,
  actual_hours numeric(8,2) default 0,
  due_date date,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Task client OTPs (server-only table)
create table if not exists public.task_client_otps (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  otp_hash text not null,
  expires_at timestamptz not null,
  attempts int default 0,
  created_at timestamptz default now()
);

-- Time entries (work & breaks)
create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  start_time timestamptz not null,
  end_time timestamptz,
  is_break boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- Timesheets (aggregated weekly records)
create table if not exists public.timesheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  week_end date not null,
  total_hours numeric(8,2) default 0,
  status text default 'DRAFT' check (status in ('DRAFT','SUBMITTED','APPROVED','RETURNED')),
  created_at timestamptz default now(),
  approved_at timestamptz
);

-- Task timers (open/close timers)
create table if not exists public.task_timers (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  started_at timestamptz not null,
  stopped_at timestamptz,
  created_at timestamptz default now()
);

-- Presence
create table if not exists public.presence (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  last_heartbeat timestamptz,
  active_task_id uuid references public.tasks(id),
  tab_visible boolean default true,
  device text,
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_time_entries_user_start on public.time_entries (user_id, start_time desc);
create index if not exists idx_task_timers_task_started on public.task_timers (task_id, started_at desc);

-- Example RPC: close_last_time_entry(uid uuid)
create or replace function public.close_last_time_entry(uid uuid)
returns void language plpgsql as $$
declare
  r record;
begin
  select id into r from public.time_entries where user_id = uid and end_time is null order by start_time desc limit 1;
  if found then
    update public.time_entries set end_time = now() where id = r.id;
  end if;
end;
$$;

-- Example RPC: get_presence_statuses()
-- Returns the derived status per user based on presence, timers and recent heartbeats
create or replace function public.get_presence_statuses()
returns table(user_id uuid, last_heartbeat timestamptz, active_task_id uuid, tab_visible boolean, status text)
language sql as $$
select p.user_id, p.last_heartbeat, p.active_task_id, p.tab_visible,
  case
    when p.last_heartbeat is null then 'OFFLINE'
    when p.last_heartbeat < now() - interval '3 minutes' then 'OFFLINE'
    when exists(select 1 from public.task_timers tt where tt.user_id = p.user_id and tt.stopped_at is null) then 'ON_TASK'
    when p.tab_visible = false and p.last_heartbeat < now() - interval '5 minutes' then 'AFK'
    when exists(select 1 from public.time_entries te where te.user_id = p.user_id and te.end_time is null and te.is_break = true) then 'ON_BREAK'
    else 'ON_SHIFT_IDLE'
  end as status
from public.presence p;
$$;

-- RLS policies
-- Enable RLS where appropriate and add sensible policies.

-- PROFILES RLS
alter table public.profiles enable row level security;
create policy profiles_select_self on public.profiles for select using (
  auth.uid() = id or (
    exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'ADMIN')
  )
);
-- For INSERT policies PostgreSQL only allows a WITH CHECK expression. Keep admin-only insert check here.
create policy profiles_insert_admin on public.profiles for insert with check (
  exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'ADMIN')
);
create policy profiles_update_self on public.profiles for update using (
  auth.uid() = id or (
    exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'ADMIN')
  )
) with check (
  auth.uid() = id or (
    exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'ADMIN')
  )
);

-- LEAVE_REQUESTS RLS
alter table public.leave_requests enable row level security;
-- INSERT policies must only provide WITH CHECK. Allow authenticated users to create leave requests for themselves.
create policy leave_requests_insert on public.leave_requests for insert with check (auth.uid() = user_id);
create policy leave_requests_select on public.leave_requests for select using (
  (user_id = auth.uid()) or (exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'ADMIN'))
);
create policy leave_requests_update on public.leave_requests for update using (
  (user_id = auth.uid()) or (exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'ADMIN'))
);

-- TIME_ENTRIES RLS
alter table public.time_entries enable row level security;
-- Allow users to insert their own time entries
create policy time_entries_insert on public.time_entries for insert with check (auth.uid() = user_id);
create policy time_entries_select on public.time_entries for select using (
  (user_id = auth.uid()) or (exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'ADMIN'))
);
create policy time_entries_update on public.time_entries for update using (
  (user_id = auth.uid()) or (exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'ADMIN'))
);

-- TIMESHEETS RLS
alter table public.timesheets enable row level security;
create policy timesheets_select on public.timesheets for select using (
  (user_id = auth.uid()) or (exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'ADMIN'))
);
-- Allow users to create their own timesheets
create policy timesheets_insert on public.timesheets for insert with check (auth.uid() = user_id);
create policy timesheets_update on public.timesheets for update using (
  (user_id = auth.uid()) or (exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'ADMIN'))
);

-- TASKS RLS (employees can read tasks assigned to them; admins all)
alter table public.tasks enable row level security;
create policy tasks_select on public.tasks for select using (
  assignee = auth.uid() or (exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'ADMIN'))
);
create policy tasks_update_admin on public.tasks for update using (
  exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'ADMIN')
);

-- TASK_CLIENT_OTPS: block client access (server-only)
alter table public.task_client_otps enable row level security;
create policy task_client_otps_no_client_access on public.task_client_otps for all using (false);

-- PRESENCE RLS
alter table public.presence enable row level security;
-- INSERT policies must only provide WITH CHECK. Allow users to create their own presence rows.
create policy presence_upsert_self on public.presence for insert with check (auth.uid() = user_id);
create policy presence_update_self on public.presence for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy presence_select on public.presence for select using (
  (user_id = auth.uid()) or (exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'ADMIN'))
);

-- Additional notes:
-- - For task_client_otps the policy blocks all client access. Use the Supabase service role on the server to insert and verify OTPs.
-- - Adjust policies if you want different visibility for clients or other roles.

