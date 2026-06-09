-- Knowledge Platform — functions & triggers
-- RLS helpers + the signup handler. Must run before 0103 (policies call is_owner()).

-- ----------------------------------------------------------------------------
-- RLS helpers. SECURITY DEFINER so they read profiles WITHOUT triggering RLS,
-- which is what lets profiles' own policies call is_owner() without recursion.
-- search_path is pinned to '' and every reference is schema-qualified.
-- ----------------------------------------------------------------------------
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'owner'
  );
$$;

create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and (status = 'active' or role = 'owner')
  );
$$;

-- ----------------------------------------------------------------------------
-- handle_new_user : runs after a row lands in auth.users.
--   owner email                       -> owner  + active
--   email on an enabled allowed_domain -> member + pending  (awaits approval)
--   anything else                      -> RAISE (rejects signup; the server-side
--                                         mirror of isAllowedEmail())
-- full_name comes from signUp({ options: { data: { full_name } } }).
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
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
  -- Mirror the client's emailDomain() contract: exactly one '@' with a non-empty
  -- local part, so a multi-@ address (e.g. 'x@allowed.com@evil.com') can never
  -- slip a wrong domain past split_part(...,2). The server is the security boundary.
  if array_length(string_to_array(new.email, '@'), 1) <> 2
     or split_part(new.email, '@', 1) = '' then
    raise exception 'Malformed email "%": exactly one "@" with a non-empty local part is required', new.email
      using errcode = 'check_violation';
  end if;

  select lower(owner_email) into v_owner_email
  from public.app_config where id = 1;

  -- Owner bootstrap (exact-match).
  if v_owner_email is not null and v_email = v_owner_email then
    insert into public.profiles (id, email, full_name, role, status)
    values (new.id, new.email, v_name, 'owner', 'active');
    return new;
  end if;

  -- Org-domain gate (enabled domains only).
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
