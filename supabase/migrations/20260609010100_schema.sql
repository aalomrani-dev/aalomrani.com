-- Knowledge Platform — schema
-- Tables, indexes, and the files.updated_at trigger.
-- Built backward from the frontend's gating: public metadata, private bytes,
-- approve-then-access membership, role-based owner. RLS is added in 0103.

-- ----------------------------------------------------------------------------
-- app_config : singleton holding the config-driven owner email.
-- Read by handle_new_user() (SECURITY DEFINER) at signup time.
-- ----------------------------------------------------------------------------
create table if not exists public.app_config (
  id          smallint primary key default 1,
  owner_email text        not null,
  updated_at  timestamptz not null default now(),
  constraint app_config_singleton check (id = 1)
);

-- ----------------------------------------------------------------------------
-- profiles : 1:1 with auth.users. role + status split the UI's owner/active/
-- pending badge. Rows are created only by the handle_new_user() trigger.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid        primary key references auth.users (id) on delete cascade,
  email      text        not null,
  full_name  text,
  role       text        not null default 'member' check (role in ('owner', 'member')),
  status     text        not null default 'pending' check (status in ('pending', 'active')),
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_idx   on public.profiles (role);
create index if not exists profiles_status_idx on public.profiles (status);
create index if not exists profiles_email_idx  on public.profiles (lower(email));

-- ----------------------------------------------------------------------------
-- categories : the category chips. 'all' is a UI-only pseudo-filter, not stored.
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id         bigint generated always as identity primary key,
  label      text   not null unique,
  sort_order int    not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- files : document metadata (publicly readable). The binary lives in the
-- private 'documents' storage bucket, referenced by storage_path.
-- ----------------------------------------------------------------------------
create table if not exists public.files (
  id           bigint generated always as identity primary key,
  title        text   not null,
  type         text   not null check (type in ('pdf', 'xlsx', 'pptx')),
  category_id  bigint references public.categories (id) on delete set null,
  description  text   not null default '',
  storage_path text,                       -- null until the binary is uploaded
  size_bytes   bigint check (size_bytes is null or size_bytes >= 0),
  file_date    date   not null default current_date,
  uploaded_by  uuid   references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists files_category_idx on public.files (category_id);
create index if not exists files_type_idx     on public.files (type);
create index if not exists files_date_idx      on public.files (file_date desc);

-- ----------------------------------------------------------------------------
-- allowed_domains : the org-email gate the admin toggles. enabled=false hides
-- a domain from anon (RLS) and rejects its signups (handle_new_user).
-- ----------------------------------------------------------------------------
create table if not exists public.allowed_domains (
  id         bigint generated always as identity primary key,
  domain     text    not null unique,
  enabled    boolean not null default true,
  created_at timestamptz not null default now(),
  constraint allowed_domains_no_at check (position('@' in domain) = 0)
);

-- ----------------------------------------------------------------------------
-- download_events : immutable download log (analytics-ready).
-- ----------------------------------------------------------------------------
create table if not exists public.download_events (
  id         bigint generated always as identity primary key,
  file_id    bigint references public.files (id)    on delete set null,
  user_id    uuid   references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists download_events_file_idx on public.download_events (file_id);
create index if not exists download_events_time_idx  on public.download_events (created_at desc);

-- ----------------------------------------------------------------------------
-- files.updated_at maintenance.
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists files_set_updated_at on public.files;
create trigger files_set_updated_at
  before update on public.files
  for each row execute function public.set_updated_at();
