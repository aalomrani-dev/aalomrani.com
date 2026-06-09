import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui/Icon'
import { IconButton } from '@/components/ui/IconButton'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { usePreferences } from '@/lib/preferences'
import { useAuth, type AuthUser } from '@/lib/auth'
import { NAV_LINKS, type RouteKey } from '@/data/content'

const pathFor = (k: RouteKey) => (k === 'home' ? '/' : '/' + k)

function Brand({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  return (
    <button onClick={onClick} className="flex items-center gap-3 group shrink-0" aria-label={t('a11y.brandHome')}>
      <span
        className="grid place-items-center w-10 h-10 rounded-[var(--radius-md)] text-white shadow-[var(--shadow-sm)] transition-transform group-hover:scale-105"
        style={{ background: 'linear-gradient(135deg, var(--navy-700), var(--teal-600))' }}
      >
        <Icon name="layers" size={22} />
      </span>
      <span className="text-start leading-tight hidden sm:block">
        <span className="block font-display font-bold text-strong text-[16px]">{t('header.brandTitle')}</span>
        <span className="block text-[11px] text-muted">{t('header.brandSubtitle')}</span>
      </span>
    </button>
  )
}

function RegTooltip({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <span className="relative" ref={rootRef}>
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        aria-label={t('a11y.loginOrSignup')}
        aria-expanded={open}
        aria-haspopup="true"
        className="grid place-items-center w-10 h-10 rounded-full transition hover:brightness-95"
        style={{ color: 'var(--sec-download)', background: 'var(--sec-download-surface)' }}
      >
        <Icon name="userPlus" size={20} />
      </button>
      {open && (
        <span
          className="absolute z-50 w-[min(320px,calc(100vw-2rem))] p-4 rounded-[var(--radius-md)] bg-surface border border-line shadow-[var(--shadow-lg)] text-sm leading-relaxed text-body"
          style={{ top: 'calc(100% + 12px)', insetInlineEnd: 0 }}
        >
          <span className="flex items-center gap-2 mb-2 font-display font-bold text-strong">
            <Icon name="bell" size={16} style={{ color: 'var(--highlight)' }} />
            {t('header.regTooltipTitle')}
          </span>
          {t('download.regMessage')}
          <span className="mt-3 block">
            <Button size="sm" full onClick={onSignup}>
              {t('common.signup')}
            </Button>
          </span>
          <span className="mt-2 block text-center text-xs text-muted">
            {t('header.haveAccount')}{' '}
            <button onClick={onLogin} className="text-accentStrong font-semibold hover:underline">
              {t('common.login')}
            </button>
          </span>
        </span>
      )}
    </span>
  )
}

function UserMenu({ user, onAdmin, onSignOut }: { user: AuthUser; onAdmin: () => void; onSignOut: () => void }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const isOwner = user.role === 'owner'
  const rootRef = useRef<HTMLSpanElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <span className="relative" ref={rootRef}>
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 ps-1 pe-2.5 h-10 rounded-full bg-tint hover:brightness-95 transition"
        aria-label={t('a11y.userMenu')}
        aria-expanded={open}
      >
        <Avatar name={user.name} size={30} />
        <Icon name="chevronDown" size={15} style={{ color: 'var(--text-muted)' }} />
      </button>
      {open && (
        <span className="absolute z-50 mt-2 w-60 p-1.5 rounded-[var(--radius-md)] bg-surface border border-line shadow-[var(--shadow-lg)]" style={{ insetInlineEnd: 0 }}>
          <span className="flex items-center gap-3 p-2.5 border-b border-line mb-1">
            <Avatar name={user.name} size={38} />
            <span className="leading-tight min-w-0">
              <span className="block text-sm font-semibold text-strong truncate">{user.name}</span>
              <span className="block text-xs text-muted truncate latin" dir="ltr">{user.email}</span>
            </span>
          </span>
          {isOwner && (
            <button
              onClick={() => {
                setOpen(false)
                onAdmin()
              }}
              className="flex items-center gap-2.5 w-full p-2.5 rounded-[var(--radius-sm)] text-sm transition text-start text-body hover:bg-tint"
            >
              <Icon name="settings" size={17} style={{ color: 'var(--accent-strong)' }} />
              {t('header.adminDashboard')}
            </button>
          )}
          <button
            onClick={() => {
              setOpen(false)
              onSignOut()
            }}
            className="flex items-center gap-2.5 w-full p-2.5 rounded-[var(--radius-sm)] text-sm transition text-start hover:bg-[var(--error-100)]"
            style={{ color: 'var(--error-600)' }}
          >
            <Icon name="logout" size={17} />
            {t('common.signOut')}
          </button>
        </span>
      )}
    </span>
  )
}

export function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, setDark, lang, setLang } = usePreferences()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const go = (k: RouteKey) => {
    navigate(pathFor(k))
    setMenuOpen(false)
  }
  const isActive = (k: RouteKey) => location.pathname === pathFor(k)

  return (
    <header
      className="sticky top-0 z-40 border-b border-line"
      style={{
        background: 'color-mix(in srgb, var(--surface-card) 92%, transparent)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div className="mx-auto max-w-[1280px] flex items-center gap-4 h-[68px] px-4 md:px-8">
        {/* utilities — inline-end (left in RTL) */}
        <div className="flex items-center gap-1.5 order-3 ms-auto md:ms-0">
          <IconButton name="bell" label={t('a11y.notifications')} variant="outline" />
          {/* MOCK: signOut stands in for Supabase auth until the backend phase; guests route to /login or /signup */}
          {user ? (
            <UserMenu user={user} onAdmin={() => navigate('/admin')} onSignOut={signOut} />
          ) : (
            <RegTooltip onLogin={() => navigate('/login')} onSignup={() => navigate('/signup')} />
          )}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            aria-label={t('a11y.toggleLanguage')}
            className="inline-flex items-center gap-1.5 h-10 px-2.5 rounded-[var(--radius-sm)] text-sm font-semibold text-body hover:bg-tint transition"
          >
            <Icon name="globe" size={18} />
            {lang === 'ar' ? 'EN' : t('header.langToggleAr')}
          </button>
          <IconButton name={dark ? 'sun' : 'moon'} label={t('a11y.darkMode')} onClick={() => setDark(!dark)} />
          <IconButton name={menuOpen ? 'x' : 'menu'} label={t('a11y.menu')} className="md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-controls="mobile-nav" />
        </div>

        {/* nav — centered */}
        <nav className="hidden md:flex items-center gap-0.5 mx-auto order-2">
          {NAV_LINKS.map(({ key }) => {
            const active = isActive(key)
            return (
              <button
                key={key}
                onClick={() => go(key)}
                className={`relative px-3 h-[68px] text-[14px] font-medium whitespace-nowrap transition ${active ? 'text-strong' : 'text-body hover:text-accentStrong'}`}
              >
                {key === 'home' ? t('nav.home') : t(`sections.${key}.title`)}
                {active && <span className="absolute bottom-0 inset-x-2 h-[3px] rounded-t-full bg-accent" />}
              </button>
            )
          })}
        </nav>

        {/* brand — inline-start (right in RTL) */}
        <div className="order-1">
          <Brand onClick={() => go('home')} />
        </div>
      </div>

      {/* mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-line bg-surface">
          <nav id="mobile-nav" className="max-w-[1280px] mx-auto px-4 py-2 flex flex-col">
            {NAV_LINKS.map(({ key }) => (
              <button
                key={key}
                onClick={() => go(key)}
                className={`text-start px-3 py-3 rounded-[var(--radius-sm)] text-[15px] transition hover:bg-tint ${isActive(key) ? 'text-strong font-semibold' : 'text-body'}`}
              >
                {key === 'home' ? t('nav.home') : t(`sections.${key}.title`)}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
