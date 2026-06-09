-- Knowledge Platform — config & reference data (idempotent prod bootstrap)
-- Safe to re-run. Unlike seed.sql (dev demo data), this seeds the config the
-- app needs to function in production: the owner email, the allowed domains,
-- and the canonical category list the owner manages.

-- Owner email (drives handle_new_user promotion). Change here or via the admin
-- app_config update.
insert into public.app_config (id, owner_email)
values (1, 'admin@aalomrani.com')
on conflict (id) do nothing;

-- Approved org domains: intentionally empty for now (operator decision 2026-06-09).
-- With no enabled domains, ONLY the owner email above can sign up; every other
-- address is rejected by handle_new_user until a domain is added here or via admin:
--   insert into public.allowed_domains (domain, enabled) values ('aalomrani.com', true);

-- Canonical categories (order mirrors content.ts CATEGORIES, minus the 'all' chip).
insert into public.categories (label, sort_order) values
  ('السياسات',        1),
  ('الإجراءات',       2),
  ('اللوائح',         3),
  ('القوالب',         4),
  ('خرائط العمليات',  5),
  ('عروض',            6)
on conflict (label) do nothing;
