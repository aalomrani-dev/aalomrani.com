# Supabase backend — bootstrap

Backend for the Knowledge Platform: schema, RLS, storage, and the signup trigger.
Design of record: `../docs/superpowers/specs/2026-06-09-supabase-backend-design.md`.

## What's here

```
migrations/
  20260609010100_schema.sql       tables, indexes, files.updated_at trigger
  20260609010200_functions.sql    is_owner / is_active_member + handle_new_user (auth trigger)
  20260609010300_rls.sql          enable RLS + grants + all policies
  20260609010400_storage.sql      private 'documents' bucket + object policies
  20260609010500_config_seed.sql  owner email + allowed domains + categories (idempotent, prod-safe)
seed.sql                        8 demo file rows (dev only — `supabase db reset`)
```

`config.toml` is **not** committed on purpose — run `supabase init` once to let the
CLI generate the version-correct one. (If it already exists, leave it.)

## First-time setup

```bash
# from app/
supabase init                 # generates supabase/config.toml (keep migrations/ + seed.sql)
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push              # applies the 5 migrations to the linked project
```

`db push` runs the migrations **but not** `seed.sql` (seed is for `supabase db reset`
on a local stack). For demo rows in a hosted project, paste `seed.sql` into the
SQL editor — and remember the binaries still need uploading (see below).

## Local dev (optional, needs Docker)

```bash
supabase start               # local stack
supabase db reset            # migrations + seed.sql into the local DB
```

## Before it works end-to-end

1. **Owner email** — `0105` seeds `a.alomrani@agency.gov.sa`. To change it:
   `update public.app_config set owner_email = '<real-owner>@agency.gov.sa' where id = 1;`
   The owner then signs up normally and is auto-promoted to owner + active.
2. **Allowed domains** — `0105` seeds `agency.gov.sa` + `moe.gov.sa` (both enabled).
   Toggle/add via the admin app or `public.allowed_domains`.
3. **File binaries** — upload to the `documents` bucket (admin UI next phase, or the
   storage dashboard) and set `public.files.storage_path` to the object path.
4. **Frontend env** (`app/.env`, never commit):
   ```
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-key>
   ```

## Signup contract (for the frontend swap)

`handle_new_user` reads the display name from user metadata, so the client must call:

```ts
await supabase.auth.signUp({
  email, password,
  options: { data: { full_name: name } },
})
```

- owner email → `owner` + `active`
- enabled allowed-domain email → `member` + `pending` (awaits owner approval)
- anything else → signup rejected (server-side mirror of `isAllowedEmail`)
