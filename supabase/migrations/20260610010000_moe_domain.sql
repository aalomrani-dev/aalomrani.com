-- Switch the org-email gate to moe.gov.sa ONLY (client decision 2026-06-10).
-- The official domain is the Saudi Ministry of Education (moe.gov.sa); the old
-- placeholder aalomrani.com is removed from the allowed list. Members register
-- with @moe.gov.sa (member + pending); the owner bootstrap (app_config.owner_email)
-- is intentionally unchanged. open_registration stays OFF so the domain gate in
-- handle_new_user is authoritative — "moe.gov.sa only & only".

delete from public.allowed_domains where lower(domain) = 'aalomrani.com';

insert into public.allowed_domains (domain, enabled)
values ('moe.gov.sa', true)
on conflict (domain) do update set enabled = true;

update public.app_config set open_registration = false where id = 1;
