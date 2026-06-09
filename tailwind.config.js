/** @type {import('tailwindcss').Config} */
// Tailwind theme is mapped onto the design-system CSS variables (src/styles/tokens/*).
// So utilities like `bg-surface`, `text-strong`, `text-accentStrong` follow the active
// [data-theme]. Dark mode = set data-theme="dark" on <html>.
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // surfaces
        app: 'var(--bg-app)',
        subtle: 'var(--bg-subtle)',
        surface: 'var(--surface-card)',
        raised: 'var(--surface-raised)',
        tint: 'var(--surface-tint)',
        inset: 'var(--surface-inset)',
        // text
        strong: 'var(--text-strong)',
        body: 'var(--text-body)',
        muted: 'var(--text-muted)',
        faint: 'var(--text-faint)',
        onAccent: 'var(--text-on-accent)',
        onNavy: 'var(--text-on-navy)',
        // brand / accent
        accent: 'var(--accent)',
        accentStrong: 'var(--accent-strong)',
        accentSoft: 'var(--accent-soft)',
        brand: 'var(--brand)',
        brandStrong: 'var(--brand-strong)',
        highlight: 'var(--highlight)',
        // lines
        line: 'var(--border)',
        lineStrong: 'var(--border-strong)',
        // status
        success: 'var(--success-600)',
        warning: 'var(--warning-600)',
        error: 'var(--error-600)',
        info: 'var(--info-600)',
        // raw scales
        navy: {
          900: 'var(--navy-900)', 800: 'var(--navy-800)', 700: 'var(--navy-700)',
          600: 'var(--navy-600)', 500: 'var(--navy-500)',
        },
        teal: {
          700: 'var(--teal-700)', 600: 'var(--teal-600)', 500: 'var(--teal-500)',
          400: 'var(--teal-400)', 300: 'var(--teal-300)', 200: 'var(--teal-200)',
        },
        sand: {
          600: 'var(--sand-600)', 500: 'var(--sand-500)', 400: 'var(--sand-400)', 100: 'var(--sand-100)',
        },
        // section accents + surfaces
        'sec-download': 'var(--sec-download)', 'sec-download-surface': 'var(--sec-download-surface)',
        'sec-library': 'var(--sec-library)', 'sec-library-surface': 'var(--sec-library-surface)',
        'sec-departments': 'var(--sec-departments)', 'sec-departments-surface': 'var(--sec-departments-surface)',
        'sec-about': 'var(--sec-about)', 'sec-about-surface': 'var(--sec-about-surface)',
        'sec-agency': 'var(--sec-agency)', 'sec-agency-surface': 'var(--sec-agency-surface)',
        // file types
        'file-pdf': 'var(--file-pdf)', 'file-xlsx': 'var(--file-xlsx)', 'file-pptx': 'var(--file-pptx)',
      },
      fontFamily: {
        display: ['Tajawal', 'IBM Plex Sans Arabic', 'sans-serif'],
        body: ['IBM Plex Sans Arabic', 'Tajawal', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        latin: ['IBM Plex Sans', 'IBM Plex Sans Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
