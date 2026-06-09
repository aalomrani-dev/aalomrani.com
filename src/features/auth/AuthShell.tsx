import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '@/components/ui/Icon'

const BENEFITS: [IconName, string][] = [
  ['lock', 'auth.shell.benefit1'],
  ['download', 'auth.shell.benefit2'],
  ['bell', 'auth.shell.benefit3'],
]

interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
  foot?: ReactNode
}

/* Full-screen split shell for the auth flow (rendered outside AppLayout, so it
   carries its own branding — no app header/footer). Brand panel hides below lg. */
export function AuthShell({ title, subtitle, children, foot }: AuthShellProps) {
  const { t } = useTranslation()
  return (
    <div className="min-h-svh grid lg:grid-cols-[1fr_1.1fr] bg-app">
      {/* brand panel */}
      <div
        className="relative overflow-hidden hidden lg:flex flex-col justify-between p-12"
        style={{ background: 'linear-gradient(150deg, var(--navy-800), var(--teal-700))' }}
      >
        <Link to="/" className="relative z-[1] flex items-center gap-3 w-fit" aria-label={t('a11y.brandHome')}>
          <span className="grid place-items-center w-11 h-11 rounded-[var(--radius-md)] bg-white/[0.12] text-white">
            <Icon name="layers" size={24} />
          </span>
          <span className="leading-tight">
            <span className="block font-display font-bold text-white text-lg">{t('org.platformName')}</span>
            <span className="block text-[12px]" style={{ color: 'rgba(234,242,242,.7)' }}>
              {t('org.tagline')}
            </span>
          </span>
        </Link>

        <div className="relative z-[1]">
          <h2 className="font-display font-bold text-white text-4xl leading-snug" style={{ maxWidth: '14ch' }}>
            {t('auth.shell.heading')}
          </h2>
          <ul className="mt-8 space-y-4">
            {BENEFITS.map(([ic, k]) => (
              <li key={k} className="flex items-center gap-3" style={{ color: 'rgba(234,242,242,.92)' }}>
                <span className="grid place-items-center w-9 h-9 rounded-full bg-white/[0.12] shrink-0">
                  <Icon name={ic} size={18} />
                </span>
                {t(k)}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-[1] text-xs latin" dir="ltr" style={{ color: 'rgba(234,242,242,.6)' }}>
          © 2026 aalomrani . All Rights Reserved
        </div>

        <span aria-hidden="true" className="absolute -top-24 w-96 h-96 rounded-full" style={{ insetInlineStart: -96, background: 'radial-gradient(circle, rgba(207,161,74,.4), transparent 70%)' }} />
        <span aria-hidden="true" className="absolute bottom-0 w-[420px] h-[420px] rounded-full" style={{ insetInlineEnd: 0, background: 'radial-gradient(circle, rgba(70,166,166,.5), transparent 70%)' }} />
      </div>

      {/* form panel */}
      <main className="flex flex-col justify-center px-6 py-12 md:px-16">
        {/* mobile brand / back-home (brand panel is hidden below lg) */}
        <div className="lg:hidden flex items-center justify-between mb-10">
          <Link to="/" className="flex items-center gap-2.5" aria-label={t('a11y.home')}>
            <span className="grid place-items-center w-9 h-9 rounded-[var(--radius-md)] text-white" style={{ background: 'linear-gradient(135deg, var(--navy-700), var(--teal-600))' }}>
              <Icon name="layers" size={18} />
            </span>
            <span className="font-display font-bold text-strong">{t('org.platformName')}</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-strong transition">
            <Icon name="arrowLeft" size={15} />
            {t('common.home')}
          </Link>
        </div>

        <div className="w-full max-w-[420px] mx-auto">
          <h1 className="font-display font-bold text-strong text-3xl">{title}</h1>
          <p className="text-muted mt-2 mb-8">{subtitle}</p>
          {children}
          {foot}
        </div>
      </main>
    </div>
  )
}
