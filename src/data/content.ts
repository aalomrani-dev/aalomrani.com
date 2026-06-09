/* Site STRUCTURE + shared types/helpers. Realistic Arabic, aligned to the design.
   Owner: آلاء العمراني (Alaa Alomrani) — vice director, investment agency.

   DISPLAY COPY lives in src/locales/ar.json (react-i18next). This file holds the
   STRUCTURE of the site sections (icons, routes, accents, a stable i18n key per
   item) plus shared types/helpers. The dynamic DATA (files, categories, profiles,
   allowed_domains) now comes from Supabase via `@/lib/data` and `@/lib/auth` —
   the static seed arrays that used to live here were removed in the backend phase. */
import type { IconName } from '@/components/ui/Icon'

export type FileType = 'pdf' | 'xlsx' | 'pptx'
export type SectionKey = 'download' | 'library' | 'departments' | 'about' | 'agency'
export type RouteKey = 'home' | SectionKey

/* Owner identity (data). Display name/role/bio are in ar.json (owner.*).
   `photo` is empty until she uploads one while editing her profile. */
export const OWNER: { email: string; photo: string } = {
  email: 'admin@aalomrani.com',
  photo: '',
}

/* A document as the UI consumes it. Mapped from a Supabase `files` row in
   `@/lib/data` (mapFileRow): `size`/`date` are display strings, `cat` is the
   category label, and `storagePath`/`categoryId` carry the DB linkage for
   downloads and admin edits. */
export interface FileItem {
  id: number
  title: string
  type: FileType
  size: string
  date: string
  cat: string
  desc: string
  storagePath?: string | null
  categoryId?: number | null
}

export interface Category {
  key: string
  label: string
}

export interface CategoryFilter {
  key: string
  label: string
  count: number
}

/* Last-resort fallback category label when a file has no category. */
export const DEFAULT_CATEGORY = 'عام'

/* Departments: structure only. Names/descriptions -> ar.json departments.<key>.* */
export interface Department {
  key: string
  icon: IconName
}
export const DEPARTMENTS: Department[] = [
  { key: 'agentOffice', icon: 'shield' },
  { key: 'assistantOffice', icon: 'user' },
  { key: 'businessDev', icon: 'briefcase' },
  { key: 'assetsEnablement', icon: 'layers' },
  { key: 'eduVouchers', icon: 'bookOpen' },
  { key: 'privatization', icon: 'target' },
]

/* A download-center file-type bullet: structural ft + i18n key segment.
   Label -> t(`sections.download.fileItems.${item.key}`). */
export interface DownloadFileItem {
  key: string
  ft: FileType
}

export interface SectionDef {
  key: SectionKey
  route: RouteKey
  icon: IconName
  accent: SectionKey
  kind: 'download' | 'list' | 'departments' | 'about' | 'agency'
  fileItems?: DownloadFileItem[] // download panel
  listItems?: string[] // library panel — i18n key segments under sections.library.listItems
}

/* The five main areas — structure only (per-section accent + icon). All copy
   (title/blurb/intro/goal/item labels) is in ar.json under sections.<key>.* */
export const SECTIONS: SectionDef[] = [
  {
    key: 'download', route: 'download', icon: 'download', accent: 'download', kind: 'download',
    fileItems: [
      { key: 'pdf', ft: 'pdf' },
      { key: 'presentations', ft: 'pptx' },
      { key: 'templates', ft: 'xlsx' },
      { key: 'infographics', ft: 'pdf' },
      { key: 'reports', ft: 'pdf' },
      { key: 'shared', ft: 'xlsx' },
    ],
  },
  {
    key: 'library', route: 'library', icon: 'bookOpen', accent: 'library', kind: 'list',
    listItems: ['regGuides', 'policies', 'procedures', 'regulations', 'approvedForms', 'processMaps', 'operationalGuides'],
  },
  { key: 'departments', route: 'departments', icon: 'building', accent: 'departments', kind: 'departments' },
  { key: 'about', route: 'about', icon: 'user', accent: 'about', kind: 'about' },
  { key: 'agency', route: 'agency', icon: 'target', accent: 'agency', kind: 'agency' },
]

/* Hero count-up stats: structure + i18n key. Label -> t(`stats.${s.key}.label`). */
export const STATS: { key: string; value: number; suffix: string }[] = [
  { key: 'files', value: 120, suffix: '+' },
  { key: 'sections', value: 5, suffix: '' },
  { key: 'departments', value: 6, suffix: '' },
]

/* Nav links: route key only. Label -> t('nav.home') for home, else
   t(`sections.${key}.title`). */
export const NAV_LINKS: { key: RouteKey }[] = [
  { key: 'home' },
  { key: 'about' },
  { key: 'departments' },
  { key: 'library' },
  { key: 'download' },
]

/* ---- Auth: email field presentation (the real gate is server-side allowed_domains) ---- */
export const ORG = {
  domain: 'aalomrani.com',
  placeholder: 'name@aalomrani.com',
} as const

/* ---- About page: three capability highlights (icon + i18n key) ---- */
export interface Highlight {
  key: string
  icon: IconName
}
export const ABOUT_HIGHLIGHTS: Highlight[] = [
  { key: 'businessDev', icon: 'briefcase' },
  { key: 'digitalTech', icon: 'sparkles' },
  { key: 'knowledgeDocs', icon: 'layers' },
]

/* ---- Agency page: supporting pillars (icon + i18n key) ---- */
export interface AgencyPillar {
  key: string
  icon: IconName
}
export const AGENCY_PILLARS: AgencyPillar[] = [
  { key: 'eduSectorGrowth', icon: 'briefcase' },
  { key: 'assetsOffering', icon: 'target' },
  { key: 'privateEduEnablement', icon: 'layers' },
  { key: 'sustainabilityImpact', icon: 'sparkles' },
]

/* ---- Access management types (Supabase profiles + allowed_domains) ---- */
export type AccessStatus = 'owner' | 'active' | 'pending'
export interface AccessUser {
  id: string
  name: string
  email: string
  status: AccessStatus
}

/* Email-domain helpers — mirror the server-side handle_new_user gate. Requires
   exactly one '@' so `x@allowed.com@evil.com` does NOT pass. */
export function emailDomain(email: string): string {
  const parts = email.trim().toLowerCase().split('@')
  return parts.length === 2 && parts[0] !== '' ? parts[1] : ''
}
export function isAllowedEmail(email: string, domains: readonly string[]): boolean {
  const d = emailDomain(email)
  return d !== '' && domains.some((x) => x.toLowerCase() === d)
}

/* ---- Lead capture: interest options. Labels in ar.json lead.interests.<key>. ---- */
export const LEAD_INTERESTS = ['templates', 'policies', 'guides', 'reports', 'all'] as const
export type LeadInterest = (typeof LEAD_INTERESTS)[number]
