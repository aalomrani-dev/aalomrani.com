import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '@/components/ui/Icon'
import { IconButton } from '@/components/ui/IconButton'

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  titleIcon?: IconName
  children: ReactNode
  footer?: ReactNode
  width?: number
  /* When false, hides the ✕ and ignores Esc + backdrop click (a forced-read gate). */
  dismissible?: boolean
}

/* Centered dialog over a navy scrim. Glass-edged card, Esc to close,
   body scroll lock while open. Used for the admin upload / confirm flows. */
export function Modal({ open, onClose, title, titleIcon, children, footer, width = 540, dismissible = true }: ModalProps) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null

    // Move focus into the dialog on open.
    const focusables = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    const first = focusables()[0]
    ;(first ?? dialogRef.current)?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (dismissible) onClose()
        return
      }
      // Trap Tab focus within the dialog.
      if (e.key === 'Tab') {
        const list = focusables()
        if (list.length === 0) {
          e.preventDefault()
          dialogRef.current?.focus()
          return
        }
        const firstEl = list[0]
        const lastEl = list[list.length - 1]
        const active = document.activeElement
        if (e.shiftKey && active === firstEl) {
          e.preventDefault()
          lastEl.focus()
        } else if (!e.shiftKey && active === lastEl) {
          e.preventDefault()
          firstEl.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus?.()
    }
  }, [open, onClose, dismissible])

  if (!open) return null

  return (
    <div
      onClick={dismissible ? onClose : undefined}
      className="fixed inset-0 z-[100] grid place-items-center p-5"
      style={{
        background: 'color-mix(in srgb, var(--navy-900) 55%, transparent)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'kp-fade .24s var(--ease-out)',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-[var(--radius-lg)] bg-surface shadow-[var(--shadow-xl)] overflow-hidden outline-none"
        style={{ maxWidth: width, border: '1px solid var(--glass-border)', animation: 'kp-rise .42s var(--ease-out)' }}
      >
        <div className="flex items-center justify-between gap-4 p-5 border-b border-line">
          <h3 className="font-display font-bold text-strong text-2xl flex items-center gap-2.5">
            {titleIcon && <Icon name={titleIcon} size={22} style={{ color: 'var(--accent-strong)' }} />}
            {title}
          </h3>
          {dismissible && <IconButton name="x" label={t('common.close')} size={36} onClick={onClose} />}
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex gap-3 p-5 border-t border-line bg-subtle">{footer}</div>}
      </div>
    </div>
  )
}
