-- Knowledge Platform — leads (public lead-capture)
-- The first ANON-WRITABLE table: site visitors leave an email to receive the
-- template / guidance PDFs. anon may INSERT (shape-validated by CHECK
-- constraints + a column-scoped grant); only the owner may read.
-- Built to mirror the gating style of 0103_rls: grants are the outer gate,
-- RLS the real gate, owner reads via private.is_owner() (helpers live in the
-- private schema after the advisor-hardening migration).

-- ----------------------------------------------------------------------------
-- Table
-- ----------------------------------------------------------------------------
create table if not exists public.leads (
  id          bigint generated always as identity primary key,
  email       text        not null,
  full_name   text,
  interest    text,                          -- one of the LEAD_INTERESTS keys, or null
  source_path text,                          -- page the form was submitted from
  referrer    text,                          -- document.referrer at submit time
  lang        text,                          -- 'ar' | 'en' preference
  user_agent  text,
  created_at  timestamptz not null default now(),

  -- Shape + size guards. These apply to EVERY insert (unbypassable); the RLS
  -- insert policy below additionally re-checks email validity (clears advisor
  -- 0024 "RLS policy always true").
  constraint leads_email_len     check (char_length(email) between 3 and 320),
  constraint leads_email_shape   check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint leads_name_len      check (full_name   is null or char_length(full_name)   <= 120),
  constraint leads_interest_len  check (interest    is null or char_length(interest)    <= 40),
  constraint leads_src_len       check (source_path is null or char_length(source_path) <= 200),
  constraint leads_ref_len       check (referrer    is null or char_length(referrer)    <= 400),
  constraint leads_lang_len      check (lang        is null or char_length(lang)        <= 8),
  constraint leads_ua_len        check (user_agent  is null or char_length(user_agent)  <= 400)
);

-- One row per subscriber; a re-submit of the same address hits this unique index
-- (the client treats the 23505 as success). lower() = case-insensitive dedupe.
create unique index if not exists leads_email_unique_idx on public.leads (lower(email));
create index if not exists leads_created_idx  on public.leads (created_at desc);
create index if not exists leads_interest_idx on public.leads (interest);

-- ----------------------------------------------------------------------------
-- Grants. Supabase's default privileges already grant broadly to anon/auth, so
-- RLS (default-deny, below) is the real gate. These explicit statements document
-- the intended surface: public insert of the form columns; owner-gated read/delete.
-- ----------------------------------------------------------------------------
grant insert (email, full_name, interest, source_path, referrer, lang, user_agent)
  on public.leads to anon, authenticated;
grant select, delete on public.leads to authenticated;

-- ----------------------------------------------------------------------------
-- RLS — default-deny, then: public insert (shape enforced by CHECK), owner read,
-- owner delete. No update path.
-- ----------------------------------------------------------------------------
alter table public.leads enable row level security;

drop policy if exists leads_insert_public on public.leads;
create policy leads_insert_public on public.leads
  for insert to anon, authenticated
  with check (
    char_length(email) between 3 and 320
    and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  );

drop policy if exists leads_select_owner on public.leads;
create policy leads_select_owner on public.leads
  for select to authenticated
  using (private.is_owner());

drop policy if exists leads_delete_owner on public.leads;
create policy leads_delete_owner on public.leads
  for delete to authenticated
  using (private.is_owner());
