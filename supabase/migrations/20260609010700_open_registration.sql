-- Owner-toggled open registration (2026-06-09): when on, ANY email may register
-- (still member+pending → owner approval); when off, the allowed_domains gate
-- applies. Toggled from the admin Access tab (app_config is owner-only via RLS).
alter table public.app_config add column if not exists open_registration boolean not null default false;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_email       text := lower(new.email);
  v_domain      text := lower(split_part(new.email, '@', 2));
  v_owner_email text;
  v_open        boolean;
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

  select lower(owner_email), open_registration into v_owner_email, v_open
  from public.app_config where id = 1;

  if v_owner_email is not null and v_email = v_owner_email then
    insert into public.profiles (id, email, full_name, role, status)
    values (new.id, new.email, v_name, 'owner', 'active');
    return new;
  end if;

  if not coalesce(v_open, false) then
    select exists (
      select 1 from public.allowed_domains
      where lower(domain) = v_domain and enabled
    ) into v_domain_ok;
    if not v_domain_ok then
      raise exception 'Email domain "%" is not on the approved list', v_domain
        using errcode = 'check_violation';
    end if;
  end if;

  insert into public.profiles (id, email, full_name, role, status)
  values (new.id, new.email, v_name, 'member', 'pending');
  return new;
end;
$$;
