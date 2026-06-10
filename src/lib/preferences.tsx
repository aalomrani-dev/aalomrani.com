import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import i18n from '@/lib/i18n'

type Lang = 'ar' | 'en'

interface Preferences {
  dark: boolean
  setDark: (v: boolean) => void
  lang: Lang
  setLang: (v: Lang) => void
}

const PreferencesContext = createContext<Preferences | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState<boolean>(() => {
    // Light is the default; only honor an explicit saved choice (ignore the OS theme).
    return localStorage.getItem('kp-theme') === 'dark'
  })
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('kp-lang') as Lang) || 'ar')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('kp-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    // Content is Arabic-first; full EN i18n is a later phase. We track the
    // preference and the <html lang>, but keep RTL until EN strings land.
    document.documentElement.setAttribute('lang', lang)
    localStorage.setItem('kp-lang', lang)
    void i18n.changeLanguage(lang)
  }, [lang])

  return (
    <PreferencesContext.Provider value={{ dark, setDark, lang, setLang }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
