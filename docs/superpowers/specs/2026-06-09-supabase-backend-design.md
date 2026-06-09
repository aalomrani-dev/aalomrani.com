# Supabase backend — design of record

**Date:** 2026-06-09 · **Status:** approved, authoring · **Scope:** DB schema + RLS + storage + triggers/seed (the React swap is a separate follow-up phase).

## Context

The Knowledge Platform ("المنصة المعرفية") runs fully on mock auth + static content (`src/data/content.ts`). This phase adds the real Supabase backend. The schema is built **backward from the gating the frontend already enforces**, so the swap is additive — no UI redesign.

Three facts from the code drive everything:

1. **Public metadata, private bytes.** `DownloadCenter` / `FileCard` render every file to guests with `locked={!user}` (title blurred, download hidden). So file/category *rows* are anon-readable; only the storage *object* is gated.
2. **Approve-then-access.** `Signup` validates the org domain client-side (`isAllowedEmail`); `ORG.signupNote` = «يخضع طلبك لموافقة المشرف قبل التفعيل». Members land `pending`, owner approves to `active`. The real gate becomes `!activeMember`, not `!user`.
3. **Owner is role-based.** `auth.tsx` role `owner|user`; owner = `a.alomrani@agency.gov.sa`; `/admin` owner-only. Admin CRUDs files, categories, allowed_domains (toggle), profiles (invite→pending, remove).

## Decisions (locked)

- **Scope:** dynamic data only (files, categories, profiles, allowed_domains, download_events). Marketing/site copy (departments, about/agency text, sections, stats) stays static in `content.ts` — nothing edits it today.
- **Delivery:** Supabase CLI migrations (`supabase/migrations/*.sql` + `seed.sql`), applied via `supabase db push`.
- **Owner bootstrap:** config-driven. `app_config.owner_email` → signup trigger promotes that exact email to `owner` + `active`.
- **Download log:** included now (`download_events`), analytics-ready.
- **IDs:** `bigint identity` for files/categories/events — clean `/file/3` URLs, parity with current numeric `file.id`; metadata is public so enumeration is a non-issue. `profiles.id` = `auth.users.id` (uuid).

## Schema (`public`)

| Table | Key columns | Notes |
|---|---|---|
| `app_config` | `id=1`, `owner_email` | Singleton. Read by the signup trigger (SECURITY DEFINER). |
| `profiles` | `id`→`auth.users`, `email`, `full_name`, `role` (`owner`\|`member`), `status` (`pending`\|`active`) | Splits the UI `owner/active/pending` badge into role + status. |
| `categories` | `id`, `label` unique, `sort_order` | `all` is a UI pseudo-filter, not stored. |
| `files` | `id`, `title`, `type` (`pdf\|xlsx\|pptx` check), `category_id`→`categories ON DELETE SET NULL`, `description`, `storage_path`, `size_bytes`, `file_date`, `uploaded_by`→`profiles`, `created_at`, `updated_at` | `SET NULL` reproduces the admin "orphaned category → coerce" behavior. |
| `allowed_domains` | `id`, `domain` unique, `enabled` | The signup gate the admin toggles. |
| `download_events` | `id`, `file_id`→`files SET NULL`, `user_id`→`profiles SET NULL`, `created_at` | Immutable download log. |

## RLS matrix

Helpers `public.is_owner()` / `public.is_active_member()` are `SECURITY DEFINER` (read `profiles` bypassing RLS → no recursion in `profiles` policies).

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `files` | public | owner | owner | owner |
| `categories` | public | owner | owner | owner |
| `allowed_domains` | `enabled OR is_owner()` | owner | owner | owner |
| `profiles` | self **or** owner | — (trigger only) | owner | owner **and** `role<>'owner'` |
| `download_events` | owner | `user_id=auth.uid() AND is_active_member()` | — | — |
| `app_config` | owner | — | owner | — |

## Storage

Private bucket `documents` (25 MB limit, pdf/xlsx/pptx mime allowlist). `storage.objects` policies (scoped `bucket_id='documents'`):

- **SELECT (download):** `is_owner() OR is_active_member()` — the real `FileCard.locked` gate. Guests **and pending** members → denied → blurred overlay.
- **INSERT / UPDATE / DELETE:** owner only.

## Functions & triggers

- `handle_new_user()` (AFTER INSERT on `auth.users`, SECURITY DEFINER): owner-email → owner+active; else domain ∈ enabled `allowed_domains` → member+pending; else **`RAISE EXCEPTION`** (server-side mirror of `isAllowedEmail`). Reads `full_name` from `raw_user_meta_data`.
- `set_updated_at()` (BEFORE UPDATE on `files`).
- `is_owner()`, `is_active_member()`.

## Deliverables

```
supabase/
  migrations/
    20260609010100_schema.sql       tables, indexes, updated_at trigger
    20260609010200_functions.sql    helpers + handle_new_user + auth trigger
    20260609010300_rls.sql          enable RLS + grants + all policies
    20260609010400_storage.sql      bucket + storage.objects policies
    20260609010500_config_seed.sql  owner email + allowed_domains + 6 categories (idempotent prod bootstrap)
  seed.sql                        8 demo file rows (dev/demo only; binaries uploaded via admin)
  README.md                       bootstrap commands
```

`config.toml` is intentionally **not** hand-written — `supabase init` generates the correct one for the installed CLI version (avoids drift). See `supabase/README.md`.

## Next phase (frontend swap — not in this batch)

`src/lib/supabaseClient.ts`; rewire `auth.tsx` to Supabase Auth (`signUp` passing `options.data.full_name`); replace `FILES`/`CATEGORIES` with queries; `FileCard.locked = !activeMember`; signed-URL download + `download_events` insert; admin mutations; `.env` → `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

## Risks / accepted trade-offs

- Domain-gate via trigger `RAISE EXCEPTION` surfaces as a generic signup error. Accepted: it's the backstop behind the client check; legit users never hit it.
- `bigint` enumerable IDs on public metadata — non-issue (metadata is public by design).
- Owner profile cannot be deleted via RLS — matches the UI (no remove button on the owner row).

## Review follow-ups — must address when wiring real auth (2026-06-09 code review)

These can't be code-fixed while the frontend is still on mock auth; they're hard requirements for the Supabase swap:

- **Live domain gate (#1, #3).** The client signup must validate the email against the **live `allowed_domains` (enabled rows)**, not the static `ALLOWED_DOMAINS` array — otherwise a user on a disabled domain passes the client check, hits the trigger `RAISE`, and gets an opaque GoTrue *"Database error saving new user"* instead of the localized `auth.signup.domainError`. After `signUp`, map that DB error to the friendly message as a fallback. (Server hardening already done: the trigger now also rejects multi-`@` addresses, #7.)
- **Member display name reactivity (#12).** Once `en.json` lands, the mock stores `user.name` in non-reactive `AuthProvider` state, so a language toggle won't update the header name. Moot after the swap — `name` will come from the `profiles` query (reactive), so resolve it from query data, not captured state.
- **Approval flow (#2).** The DB supports `pending→active` via the owner `UPDATE` policy on `profiles`; the mock Admin now has an **approve** action. At swap, wire it to `supabase.from('profiles').update({ status: 'active' })` (owner-gated by RLS).
- **Role vocabulary (#13).** Mock `Role` is now `'owner' | 'member'` to match `profiles.role` — keep them aligned; don't reintroduce `'user'`.
