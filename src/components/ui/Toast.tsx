import { useCallback, useEffect, useState } from 'react'
import { Icon, type IconName } from '@/components/ui/Icon'

/* Transient bottom toast — navy pill with a sand-highlighted glyph.
   `useToast` owns the auto-dismiss timer; `<Toast>` renders nothing when idle. */
export function useToast(duration = 3000) {
  const [toast, setToast] = useState<string | null>(null)
  // `nonce` bumps on every trigger so the dismiss timer restarts even when the
  // same message string is shown twice in a row (React bails out of identical state).
  const [nonce, setNonce] = useState(0)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), duration)
    return () => clearTimeout(t)
  }, [toast, nonce, duration])
  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setNonce((n) => n + 1)
  }, [])
  return { toast, showToast }
}

interface ToastProps {
  message: string | null
  icon?: IconName
}

export function Toast({ message, icon = 'download' }: ToastProps) {
  if (!message) return null
  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none">
      <div
        role="status"
        className="pointer-events-auto inline-flex items-center gap-2.5 px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium shadow-[var(--shadow-lg)]"
        style={{ background: 'var(--navy-800)', color: 'var(--text-on-navy)' }}
      >
        <Icon name={icon} size={16} style={{ color: 'var(--highlight)' }} />
        {message}
      </div>
    </div>
  )
}
