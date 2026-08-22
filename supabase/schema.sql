-- Scholarship application system schema
-- Safe to run more than once (every statement is idempotent) — run this in the
-- Supabase SQL editor (Project > SQL Editor > New query) any time you need to
-- (re)apply the full schema, including after this file is updated.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'application_status') then
    create type application_status as enum ('pending', 'under_review', 'approved', 'rejected');
  end if;
end $$;

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  application_number bigint generated always as identity,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Personal details
  full_name text not null,
  date_of_birth date not null,
  mobile_number text not null,
  email text not null,
  address text not null,
  state text not null,
  district text not null,

  -- Academic records
  class10_percentage numeric(5,2) not null,
  class10_marksheet_path text not null,
  class12_percentage numeric(5,2) not null,
  class12_marksheet_path text not null,
  graduation_percentage numeric(5,2),
  final_semester_marksheet_path text,
  future_field_of_study text not null,

  -- Financial / family
  amount_requested_per_month numeric(10,2) not null,
  requested_months text not null,
  father_name text not null,
  father_contact text not null,
  mother_name text not null,
  parent_annual_income numeric(12,2) not null,

  -- Essay / documents
  future_goals text not null,
  aadhaar_document_path text not null,

  eligibility_confirmed boolean not null default false,

  status application_status not null default 'pending',
  admin_notes text,

  constraint eligibility_must_be_confirmed check (eligibility_confirmed = true)
);

-- Human-friendly reference number the admin can search by. Added via ALTER
-- for databases that already have the applications table (Postgres
-- backfills existing rows automatically when adding a GENERATED ALWAYS AS
-- IDENTITY column); already present via the CREATE TABLE above on fresh
-- installs, so this is a no-op there.
alter table applications add column if not exists application_number bigint generated always as identity;
create unique index if not exists applications_application_number_idx on applications (application_number);

create index if not exists applications_status_idx on applications (status);
create index if not exists applications_created_at_idx on applications (created_at desc);

-- Keep updated_at fresh
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists applications_set_updated_at on applications;
create trigger applications_set_updated_at
  before update on applications
  for each row execute procedure set_updated_at();

-- ---------------------------------------------------------------------------
-- Admin allowlist. Row Level Security below grants access only to Supabase
-- Auth users listed here — NOT to every "authenticated" user. This matters:
-- if this project's Auth settings ever allow public sign-up, a stranger who
-- self-registers would otherwise satisfy a plain `to authenticated` policy
-- and could read every applicant's Aadhaar number, family income, and
-- contact details. Checking membership in this table closes that gap
-- regardless of the project's sign-up settings.
-- ---------------------------------------------------------------------------
create table if not exists admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- No public policies on `admins` at all: only the service role (used by
-- trusted server code, which bypasses RLS entirely) can read or write it.
alter table admins enable row level security;

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- Row Level Security: no public read/update access at all.
-- Public submissions go through a server action using the service role key,
-- never directly from the browser, so no public INSERT policy is needed either.
alter table applications enable row level security;

drop policy if exists "Admins can read applications" on applications;
create policy "Admins can read applications"
  on applications for select
  to authenticated
  using (is_admin());

drop policy if exists "Admins can update applications" on applications;
create policy "Admins can update applications"
  on applications for update
  to authenticated
  using (is_admin());

-- Storage bucket for uploaded documents (Aadhaar cards, marksheets).
-- Private bucket: files are only reachable via signed URLs generated server-side for admins.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists "Admins can read documents" on storage.objects;
create policy "Admins can read documents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'documents' and is_admin());

-- ---------------------------------------------------------------------------
-- Browser push notification subscriptions, so admins can be notified of a new
-- application without needing a separate email service. Each row is one
-- browser/device an admin clicked "Enable notifications" on.
-- ---------------------------------------------------------------------------
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

-- Admins manage only their own subscription rows via the app's server actions.
drop policy if exists "Admins manage their own push subscriptions" on push_subscriptions;
create policy "Admins manage their own push subscriptions"
  on push_subscriptions for all
  to authenticated
  using (is_admin() and admin_user_id = auth.uid())
  with check (is_admin() and admin_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Login rate-limiting. The admin login is a single account guarding real
-- Aadhaar numbers, family income, and contact details — this tracks failed
-- attempts per email so it can't be freely brute-forced. Only ever touched by
-- the login server action via the service-role client, so no RLS policies
-- are needed (or granted) here at all.
-- ---------------------------------------------------------------------------
create table if not exists login_attempts (
  email text primary key,
  attempt_count int not null default 0,
  first_attempt_at timestamptz not null default now(),
  locked_until timestamptz
);

alter table login_attempts enable row level security;

-- Force PostgREST to pick up the schema immediately. Without this, the API
-- can return "Could not find the table 'public.applications' in the schema
-- cache" for a while after running this script, even though the table exists.
notify pgrst, 'reload schema';
