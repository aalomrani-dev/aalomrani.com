-- Knowledge Platform — Row Level Security
-- Enable RLS on every table, set coarse grants, then the fine-grained policies.
-- Grants are the outer gate; RLS is the real gate. Anon is granted SELECT only
-- on the publicly-readable tables.

-- ----------------------------------------------------------------------------
-- Grants
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.files, public.categories, public.allowed_domains to anon;

grant select, insert, update, delete on
  public.files,
  public.categories,
  public.allowed_domains,
  public.profiles,
  public.download_events,
  public.app_config
to authenticated;

-- ----------------------------------------------------------------------------
-- Enable RLS (default-deny everywhere)
-- ----------------------------------------------------------------------------
alter table public.app_config      enable row level security;
alter table public.profiles        enable row level security;
alter table public.categories      enable row level security;
alter table public.files           enable row level security;
alter table public.allowed_domains enable row level security;
alter table public.download_events enable row level security;

-- ----------------------------------------------------------------------------
-- files : public metadata, owner-only writes
-- ----------------------------------------------------------------------------
drop policy if exists files_select_public on public.files;
create policy files_select_public on public.files
  for select using (true);

drop policy if exists files_write_owner on public.files;
create policy files_write_owner on public.files
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ----------------------------------------------------------------------------
-- categories : public read, owner-only writes
-- ----------------------------------------------------------------------------
drop policy if exists categories_select_public on public.categories;
create policy categories_select_public on public.categories
  for select using (true);

drop policy if exists categories_write_owner on public.categories;
create policy categories_write_owner on public.categories
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ----------------------------------------------------------------------------
-- allowed_domains : anon sees enabled rows; owner sees all and writes
-- ----------------------------------------------------------------------------
drop policy if exists allowed_domains_select on public.allowed_domains;
create policy allowed_domains_select on public.allowed_domains
  for select using (enabled or public.is_owner());

drop policy if exists allowed_domains_write_owner on public.allowed_domains;
create policy allowed_domains_write_owner on public.allowed_domains
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ----------------------------------------------------------------------------
-- profiles : self-or-owner read; owner-only updates; no client insert
-- (rows are created exclusively by the handle_new_user trigger).
-- The owner row cannot be deleted (matches the admin UI).
-- ----------------------------------------------------------------------------
drop policy if exists profiles_select_self_or_owner on public.profiles;
create policy profiles_select_self_or_owner on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.is_owner());

drop policy if exists profiles_update_owner on public.profiles;
create policy profiles_update_owner on public.profiles
  for update to authenticated
  using (public.is_owner())
  with check (public.is_owner());

drop policy if exists profiles_delete_owner on public.profiles;
create policy profiles_delete_owner on public.profiles
  for delete to authenticated
  using (public.is_owner() and role <> 'owner');

-- ----------------------------------------------------------------------------
-- download_events : owner reads; active members insert their own rows; immutable
-- ----------------------------------------------------------------------------
drop policy if exists download_events_select_owner on public.download_events;
create policy download_events_select_owner on public.download_events
  for select to authenticated
  using (public.is_owner());

drop policy if exists download_events_insert_self on public.download_events;
create policy download_events_insert_self on public.download_events
  for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_active_member());

-- ----------------------------------------------------------------------------
-- app_config : owner only
-- ----------------------------------------------------------------------------
drop policy if exists app_config_select_owner on public.app_config;
create policy app_config_select_owner on public.app_config
  for select to authenticated
  using (public.is_owner());

drop policy if exists app_config_update_owner on public.app_config;
create policy app_config_update_owner on public.app_config
  for update to authenticated
  using (public.is_owner())
  with check (public.is_owner());
