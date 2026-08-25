-- Scholarship application system schema
-- Safe to run more than once. Run this in the Supabase SQL Editor to apply the database changes.

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

  full_name text not null,
  date_of_birth date not null,
  mobile_number text not null,
  email text not null,
  address text not null,
  state text not null,
  district text not null,

  class10_percentage numeric(5,2) not null,
  class10_marksheet_path text not null,
  class12_percentage numeric(5,2) not null,
  class12_marksheet_path text not null,
  graduation_percentage numeric(5,2),
  final_semester_marksheet_path text,
  future_field_of_study text not null,

  amount_requested_per_month numeric(10,2) not null,
  requested_months text not null,
  father_name text not null,
  father_contact text not null,
  mother_name text not null,
  parent_annual_income numeric(12,2) not null,

  future_goals text not null,
  aadhaar_document_path text not null,
  parent_aadhaar_document_path text not null,

  eligibility_confirmed boolean not null default false,
  status application_status not null default 'pending',
  admin_notes text,

  constraint eligibility_must_be_confirmed check (eligibility_confirmed = true)
);

alter table applications add column if not exists application_number bigint generated always as identity;
alter table applications add column if not exists parent_aadhaar_document_path text;

-- Existing applications predate the new required parent Aadhaar field. Keep them valid
-- while requiring the field for all new submissions through application validation.
create unique index if not exists applications_application_number_idx on applications (application_number);
create index if not exists applications_status_idx on applications (status);
create index if not exists applications_created_at_idx on applications (created_at desc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists applications_set_updated_at on applications;
create trigger applications_set_updated_at before update on applications for each row execute procedure set_updated_at();

create table if not exists admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

alter table applications enable row level security;
drop policy if exists "Admins can read applications" on applications;
create policy "Admins can read applications" on applications for select to authenticated using (is_admin());
drop policy if exists "Admins can update applications" on applications;
create policy "Admins can update applications" on applications for update to authenticated using (is_admin());

insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict (id) do nothing;
drop policy if exists "Admins can read documents" on storage.objects;
create policy "Admins can read documents" on storage.objects for select to authenticated using (bucket_id = 'documents' and is_admin());

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;
drop policy if exists "Admins manage their own push subscriptions" on push_subscriptions;
create policy "Admins manage their own push subscriptions" on push_subscriptions for all to authenticated using (is_admin() and admin_user_id = auth.uid()) with check (is_admin() and admin_user_id = auth.uid());

create table if not exists login_attempts (
  email text primary key,
  attempt_count int not null default 0,
  first_attempt_at timestamptz not null default now(),
  locked_until timestamptz
);

alter table login_attempts enable row level security;
notify pgrst, 'reload schema';
