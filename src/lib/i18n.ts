import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from '@/locales/ar.json'

/* react-i18next bootstrap. Only the Arabic bundle ships today; `en` is a later
   phase (CLAUDE.md). Until en.json lands, any non-ar language falls back to ar,
   so content stays Arabic + RTL regardless of the lang preference toggle.
   Resources are bundled (synchronous), so useSuspense is off — t() resolves
   immediately on first render. */
void i18n.use(initReactI18next).init({
  resources: { ar: { translation: ar } },
  // Read the persisted preference so the initial language matches what
  // PreferencesProvider restores (same kp-lang source) — no ar→en first-paint
  // flip once en.json lands. Falls back to ar (the only bundled locale today).
  lng: localStorage.getItem('kp-lang') || 'ar',
  fallbackLng: 'ar',
  supportedLngs: ['ar', 'en'],
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
  react: { useSuspense: false },
  // DEV only: surface any unresolved key loudly so verification (and future
  // regressions) catch a missing/typo'd translation instead of silently
  // rendering the key path. In production this stays off — saveMissing adds a
  // per-lookup tax, and once a partial en.json lands an untranslated key would
  // otherwise spam console.error in users' browsers.
  saveMissing: import.meta.env.DEV,
  missingKeyHandler: import.meta.env.DEV
    ? (_lngs, _ns, key) => {
        console.error('[i18n] missing key:', key)
      }
    : undefined,
})

export default i18n
