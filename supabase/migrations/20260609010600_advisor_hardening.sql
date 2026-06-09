-- Knowledge Platform — post-audit advisor hardening (2026-06-09)
-- Applied after the live MCP bootstrap when `get_advisors security` flagged:
--   * function_search_path_mutable on set_updated_at
--   * SECURITY DEFINER helpers (is_owner/is_active_member/handle_new_user)
--     reachable via /rest/v1/rpc (lints 0028/0029)
-- Verified: revoking EXECUTE was NOT viable — anon (allowed_domains_select) and
-- authenticated (most policies) call these helpers inside RLS, so a revoke errors
-- with "permission denied for function". The correct fix is to move them into a
-- non-exposed `private` schema (unreachable via the REST API) while keeping them
-- executable for policy evaluation. Also adds the two FK covering indexes and
-- splits the FOR ALL owner-write policies (clears the multiple-permissive perf lint).

-- 1) pin set_updated_at search_path -----------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) move SECURITY DEFINER helpers into a non-exposed `private` schema --
create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.is_owner()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'owner'
  );
$$;

create or replace function private.is_active_member()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and (status = 'active' or role = 'owner')
  );
$$;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_email       text := lower(new.email);
  v_domain      text := lower(split_part(new.email, '@', 2));
  v_owner_email text;
  v_name        text := coalesce(
                          nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
                          split_part(new.email, '@', 1)
                        );
  v_domain_ok   boolean;
begin
  if array_length(string_to_array(new.email, '@'), 1) <> 2
     or split_part(new.email, '@', 1) = '' then
    raise exception 'Malformed email "%": exactly one "@" with a non-empty local part is required', new.email
      using errcode = 'check_violation';
  end if;

  select lower(owner_email) into v_owner_email
  from public.app_config where id = 1;

  if v_owner_email is not null and v_email = v_owner_email then
    insert into public.profiles (id, email, full_name, role, status)
    values (new.id, new.email, v_name, 'owner', 'active');
    return new;
  end if;

  select exists (
    select 1 from public.allowed_domains
    where lower(domain) = v_domain and enabled
  ) into v_domain_ok;

  if not v_domain_ok then
    raise exception 'Email domain "%" is not on the approved list', v_domain
      using errcode = 'check_violation';
  end if;

  insert into public.profiles (id, email, full_name, role, status)
  values (new.id, new.email, v_name, 'member', 'pending');
  return new;
end;
$$;

revoke all on function private.is_owner()         from public;
revoke all on function private.is_active_member() from public;
revoke all on function private.handle_new_user()  from public;
grant execute on function private.is_owner()         to anon, authenticated;
grant execute on function private.is_active_member() to authenticated;
-- handle_new_user: invoked only by the auth trigger as definer; no role execute.

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- 3) covering indexes for the two FKs ---------------------------------
create index if not exists files_uploaded_by_idx    on public.files (uploaded_by);
create index if not exists download_events_user_idx on public.download_events (user_id);

-- 4) repoint every policy to private.* + split FOR ALL writes ----------
-- files
drop policy if exists files_write_owner on public.files;
create policy files_insert_owner on public.files
  for insert to authenticated with check (private.is_owner());
create policy files_update_owner on public.files
  for update to authenticated using (private.is_owner()) with check (private.is_owner());
create policy files_delete_owner on public.files
  for delete to authenticated using (private.is_owner());

-- categories
drop policy if exists categories_write_owner on public.categories;
create policy categories_insert_owner on public.categories
  for insert to authenticated with check (private.is_owner());
create policy categories_update_owner on public.categories
  for update to authenticated using (private.is_owner()) with check (private.is_owner());
create policy categories_delete_owner on public.categories
  for delete to authenticated using (private.is_owner());

-- allowed_domains
drop policy if exists allowed_domains_select on public.allowed_domains;
create policy allowed_domains_select on public.allowed_domains
  for select using (enabled or private.is_owner());
drop policy if exists allowed_domains_write_owner on public.allowed_domains;
create policy allowed_domains_insert_owner on public.allowed_domains
  for insert to authenticated with check (private.is_owner());
create policy allowed_domains_update_owner on public.allowed_domains
  for update to authenticated using (private.is_owner()) with check (private.is_owner());
create policy allowed_domains_delete_owner on public.allowed_domains
  for delete to authenticated using (private.is_owner());

-- profiles
drop policy if exists profiles_select_self_or_owner on public.profiles;
create policy profiles_select_self_or_owner on public.profiles
  for select to authenticated using (id = (select auth.uid()) or private.is_owner());
drop policy if exists profiles_update_owner on public.profiles;
create policy profiles_update_owner on public.profiles
  for update to authenticated using (private.is_owner()) with check (private.is_owner());
drop policy if exists profiles_delete_owner on public.profiles;
create policy profiles_delete_owner on public.profiles
  for delete to authenticated using (private.is_owner() and role <> 'owner');

-- download_events
drop policy if exists download_events_select_owner on public.download_events;
create policy download_events_select_owner on public.download_events
  for select to authenticated using (private.is_owner());
drop policy if exists download_events_insert_self on public.download_events;
create policy download_events_insert_self on public.download_events
  for insert to authenticated
  with check (user_id = (select auth.uid()) and private.is_active_member());

-- app_config
drop policy if exists app_config_select_owner on public.app_config;
create policy app_config_select_owner on public.app_config
  for select to authenticated using (private.is_owner());
drop policy if exists app_config_update_owner on public.app_config;
create policy app_config_update_owner on public.app_config
  for update to authenticated using (private.is_owner()) with check (private.is_owner());

-- storage.objects (documents bucket)
drop policy if exists documents_read_members on storage.objects;
create policy documents_read_members on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and (private.is_owner() or private.is_active_member()));
drop policy if exists documents_insert_owner on storage.objects;
create policy documents_insert_owner on storage.objects
  for insert to authenticated with check (bucket_id = 'documents' and private.is_owner());
drop policy if exists documents_update_owner on storage.objects;
create policy documents_update_owner on storage.objects
  for update to authenticated
  using (bucket_id = 'documents' and private.is_owner())
  with check (bucket_id = 'documents' and private.is_owner());
drop policy if exists documents_delete_owner on storage.objects;
create policy documents_delete_owner on storage.objects
  for delete to authenticated using (bucket_id = 'documents' and private.is_owner());

-- drop the now-unreferenced public helpers
drop function if exists public.is_owner();
drop function if exists public.is_active_member();
drop function if exists public.handle_new_user();
