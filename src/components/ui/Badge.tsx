import type { ReactNode } from 'react'
import { Icon, type IconName } from '@/components/ui/Icon'

type Tone = 'neutral' | 'success' | 'warning' | 'error' | 'accent'

interface BadgeProps {
  children: ReactNode
  tone?: Tone
  icon?: IconName
  dot?: boolean
}

const TONES: Record<Tone, { color: string; bg: string }> = {
  neutral: { color: 'var(--text-muted)', bg: 'var(--surface-inset)' },
  success: { color: 'var(--success-600)', bg: 'var(--success-100)' },
  warning: { color: 'var(--warning-600)', bg: 'var(--warning-100)' },
  error: { color: 'var(--error-600)', bg: 'var(--error-100)' },
  accent: { color: 'var(--accent-strong)', bg: 'var(--surface-tint)' },
}

export function Badge({ children, tone = 'neutral', icon, dot = false }: BadgeProps) {
  const t = TONES[tone]
  return (
    <span
      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[var(--radius-pill)] text-xs font-semibold whitespace-nowrap"
      style={{ color: t.color, background: t.bg }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />}
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  )
}
