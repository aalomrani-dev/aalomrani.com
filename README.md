# المنصة المعرفية — Knowledge Platform (web app)

Arabic-first (RTL) knowledge portal for the investment agency. **Phase 1:** a calm,
institutional, **view-and-download** library. Built to the client's reference home-page
design, on the project's design system.

## Stack
- **Vite + React 19 + TypeScript**
- **Tailwind CSS v3** — theme mapped onto the design-system CSS-variable tokens
- **React Router v7**
- **@supabase/supabase-js** — wired in the data/auth phase
- Inline Lucide-style icons (no icon-font dependency)

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check (tsc -b) + production bundle
npm run preview  # serve the production build
```

## Structure
```
src/
  styles/tokens/     design-system tokens (colors, typography, spacing, effects) → Tailwind
  index.css          token imports + Tailwind layers + DS base (RTL) + motion classes
  components/ui/      primitives: Icon, Button, IconButton, FileTypeChip, Avatar, Reveal, CountUp
  components/layout/  Header, Footer
  features/home/      Hero, FeatureCards, SectionPanels (the landing)
  pages/             Home, Placeholder
  data/content.ts    Arabic seed content (sections, departments, files, owner) — Supabase later
  hooks/             useInView
  lib/               preferences (theme + lang), ScrollToTop
  App.tsx            providers + router + layout
```
`@/` is an alias for `src/`.

## Design notes
- **Arabic-first, full RTL** (logical CSS properties). The AR/EN toggle currently switches the
  preference + `<html lang>`; full English i18n is a later phase (content stays Arabic for now).
- **Light/dark** via `data-theme` on `<html>` (persisted to localStorage).
- **Motion** is tasteful (scroll-reveal, hover lift + glow, hero Ken-Burns, stat count-ups) and
  respects `prefers-reduced-motion`.
- **Imagery is placeholder** — the agency supplies the real building photo + the owner's portrait.

## Roadmap (next phases)
1. **Supabase foundation** — client, schema (profiles, categories, files, departments,
   allowed_domains, downloads), private storage bucket, RLS.
2. **Auth** — sign up / log in / reset, org-domain gating, roles (owner / user).
3. **Gated app** — Download Center, Organizational Library, File Detail (RLS-gated downloads via
   signed URLs).
4. **Content pages** — Departments, About, Agency.
5. **Admin dashboard** — upload / edit / delete / categorize files, manage access.
6. EN i18n, designed states (empty / loading / no-results), polish, deploy.
