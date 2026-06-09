# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Arabic-first, **full-RTL**, view-and-download document portal ("المنصة المعرفية" / Knowledge Platform) for an investment agency. **Current state:** all Phase-1 UI is built and runs end-to-end on a **mock auth + static content** — no backend yet. The only remaining phase is wiring a real Supabase project (auth, storage, RLS). Treat the app as fully functional offline; the backend swap is additive.

The design is **LOCKED** to the design system at `../Knowledge Platform Design System/` (esp. `ui_kits/knowledge-platform/kit-*.jsx`), which encodes every screen's layout + Arabic copy + tokens. Build to match those kits — do **not** redesign, brainstorm new concepts, or add "cinematic/editorial" flourishes. "Alive" = tasteful polish only (scroll-reveal, hover lift, count-ups), never drama.

## Commands

```bash
npm run dev      # Vite dev server → http://localhost:5173
npm run build    # tsc -b (type-check) + vite build — the CI/correctness gate; must pass clean
npm run preview  # serve the production build → http://localhost:4173
npm run lint     # eslint (see "Known lint" below)
```

There are no unit tests. Verification is **headless render + behavior checks** via Puppeteer (installed locally):

```bash
node scripts/verify.cjs '{"scenarios":[{"name":"x","path":"/download","theme":"dark","auth":1,"role":"owner"}]}'
```

`scripts/verify.cjs` loads each scenario against the **preview** server (run `npm run preview` first), sets `kp-theme`/`kp-auth`/`kp-role` in localStorage *before* load, emulates `prefers-reduced-motion: reduce` (so scroll-reveal content is visible), asserts **zero console/page errors**, and writes full-page screenshots to `scripts/shots/`. Use it to confirm any screen across guest/member/owner × light/dark × desktop/mobile. For interactive flows (clicks, form fills, modals), write a one-off Puppeteer script in the same style and assert zero errors throughout.

## Theming & tokens (read before touching styles)

Styling is **not** ad-hoc Tailwind colors — it's a CSS-variable token system mapped into Tailwind:

- `src/styles/tokens/*.css` define DS variables (`--surface-card`, `--text-strong`, `--accent`, `--sec-*`, `--file-*`, `--radius-*`, `--shadow-*`, `--ease-*`, …). Imported by `src/index.css`.
- `tailwind.config.js` maps those vars to semantic utilities: `bg-surface bg-app bg-tint bg-subtle bg-inset`, `text-strong/body/muted/faint`, `text-accentStrong text-onAccent`, `border-line`, plus section/file scales.
- **Use the semantic classes**, not raw hex. For radius/shadow/section vars use arbitrary values: `rounded-[var(--radius-lg)]`, `shadow-[var(--shadow-md)]`. Per-section accents come via inline style: `var(--sec-download|library|departments|about|agency)` and the matching `-surface` vars; file-type colors via `var(--file-pdf|xlsx|pptx)`.
- **Dark mode** = `data-theme="dark"` on `<html>`, toggled by `PreferencesProvider` (`src/lib/preferences.tsx`), persisted to `kp-theme`. Tailwind `darkMode: ['selector','[data-theme="dark"]']`. Every change must read correctly in both themes — colors come from the tokens, so use them and dark mode follows for free. Hardcoded literals are only acceptable where the DS itself uses them (e.g. white text / rgba on navy-teal gradient brand panels).

## Routing model

`src/App.tsx` defines two route groups:

- **Inside `AppLayout`** (renders `<Header/>` + `<Footer/>`): `/`, `/download`, `/library`, `/departments`, `/about`, `/agency`, `/file/:id`, and the `*` 404. **Pages in this group render their content only** — never add a Header/Footer inside a page (the DS kits include them; the app does not).
- **Standalone (outside `AppLayout`, own branding, no app chrome):** `/login`, `/signup`, `/reset` (full-screen `AuthShell` split panel) and `/admin` (owner-only dashboard shell). When adding an auth/admin-like full-bleed screen, register it as a sibling of `AppLayout`, not inside it.

## Auth & gating (mock — to be replaced by Supabase)

`src/lib/auth.tsx` is a deliberate placeholder: `useAuth()` exposes `user`, `isOwner`, `signIn(opts?)`, `signOut`. State persists via `localStorage` `kp-auth` (`'1'`) + `kp-role` (`owner|user`); signing in with the owner email (`OWNER.email` in content) yields the `owner` role. This drives all gating now:

- `FileCard locked={!user}` is the visual analogue of the future RLS gate; guests see locked overlays, members see download buttons.
- `/admin` renders a NotAuthorized state unless `isOwner`; the Header user menu shows «لوحة الإدارة» only for owners.

Keep using this mock for all UI work. In the Supabase phase it gets replaced by real auth and `FileCard.locked` becomes the RLS/sign-in result.

## Content & data

`src/data/content.ts` is the **single source** for all seed data and copy: `FILES`, `CATEGORIES`, `DEPARTMENTS`, `SECTIONS`, `OWNER`, `AGENCY_*`, `ABOUT_HIGHLIGHTS`, `ACCESS_USERS`, `ALLOWED_DOMAINS`, `NAV_LINKS`, `REG_MESSAGE`, `FOOTER_TAGLINE`, `ORG`. Extend it here; keep Arabic realistic. It also holds shared helpers that the backend phase should mirror server-side: `emailDomain` / `isAllowedEmail` (org-domain gate — requires exactly one `@`, exact-match) and `downloadSoonMsg`. Admin CRUD operates on local React state seeded from this file. In the Supabase phase, static data is swapped for queries.

## Component conventions

- Reuse primitives in `src/components/ui` (`Icon, Button, IconButton, Badge, Avatar, CategoryChip, FileTypeChip, FileCard, EmptyState, Reveal, CountUp, Input, Modal, Toggle, Skeleton, Toast`) and layout (`Header, Footer, PageHero`). Port more from the DS in the same style as needed.
- **Icons are inline SVG** in `src/components/ui/Icon.tsx` (Lucide paths, `currentColor`). Add new glyphs there — do **not** add an icon dependency.
- `Toast` (+ `useToast`) is the shared toast; `Modal` handles focus-trap + Escape + scroll-lock; prefer remounting form modals via a React `key` over syncing derived state in render.

## RTL & TypeScript rules that bite

- **Full RTL.** Use logical CSS (`ms-/me-/ps-/pe-`, `inset-inline-*`, `text-start/end`) — never physical `ml/mr/left/right/text-left`. In a RTL flex row the **lowest `order` / first child sits on the RIGHT**; the header keeps the **brand+logo on the right** (inline-start, `order-1`) and utilities on the left (`order-3`), with dropdowns at `insetInlineEnd:0` so they open inward. (The DS `kit-header.jsx` renders this backwards — do not copy it.)
- **Never flip the logo or numerals.** Numbers are Western digits, tabular/mono (`.tnum`, `font-mono`), and dates/emails/domains use `dir="ltr"`.
- The AR/EN toggle flips the `<html lang>` preference and calls `i18n.changeLanguage(lang)`, but **content stays Arabic** because only the `ar` bundle ships — switching to `en` resolves every key through the `ar` fallback (no visible change, no missing-key noise). RTL is not toggled. This stays true until `en.json` lands in a later i18n phase.
- TS is strict: `verbatimModuleSyntax` (use `import type`), `erasableSyntaxOnly` (no runtime `enum`/`namespace` — use union types + `as const`), `noUnusedLocals`/`noUnusedParameters`. Avoid CSS custom props in `style` without a `CSSProperties` cast. `@/` aliases `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).

## Known lint

`npm run lint` reports a few `react-refresh/only-export-components` and `react-hooks/set-state-in-effect` errors in provider/hook files (`lib/auth.tsx`, `lib/preferences.tsx`, `components/ui/Toast.tsx`, `hooks/useInView.ts`, `components/ui/CountUp.tsx`). These are accepted dev-only HMR/style rules for the project's provider+hook co-location pattern and have no build/runtime impact. `npm run build` is the gate, not lint.

## Project memory

Longer-form build history, decisions, and the Supabase-phase plan live in the project's `.claude/.../memory/knowledge-platform-build.md` (auto-loaded). The Supabase phase requires the operator's existing project URL + anon key; keys go in `app/.env` as `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (never commit).
