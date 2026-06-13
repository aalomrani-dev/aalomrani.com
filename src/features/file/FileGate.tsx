import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

/* The read/download gate. Browsing is fully open; the moment a guest opens or
   downloads a file — or lands on the Download Center — open() shows this login
   popup (the client-approved gate). It is NON-dismissible for the first few
   seconds (lockSeconds), so the message is read before it can be closed.
   Mounted inside AppLayout so any page under it can trigger it via useFileGate().
   The real enforcement is server-side RLS. */
const LOCK_SECONDS = 5

interface FileGateValue {
  open: (opts?: { lockSeconds?: number }) => void
}
const FileGateContext = createContext<FileGateValue | null>(null)

export function FileGateProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [secsLeft, setSecsLeft] = useState(0)

  const openModal = useCallback((opts?: { lockSeconds?: number }) => {
    setSecsLeft(opts?.lockSeconds ?? LOCK_SECONDS)
    setOpen(true)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    setSecsLeft(0)
  }, [])

  const goLogin = useCallback(() => {
    setOpen(false)
    setSecsLeft(0)
    navigate('/login')
  }, [navigate])

  // Tick the non-dismissible window down once per second while open.
  useEffect(() => {
    if (!open || secsLeft <= 0) return
    const id = window.setTimeout(() => setSecsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearTimeout(id)
  }, [open, secsLeft])

  const canClose = secsLeft <= 0
  // Stable identity so consumers' effects (which depend on `gate`) don't re-fire
  // open() every time the countdown re-renders the provider.
  const value = useMemo(() => ({ open: openModal }), [openModal])

  return (
    <FileGateContext.Provider value={value}>
      {children}
      <Modal
        open={open}
        onClose={close}
        dismissible={canClose}
        title={t('file.gateModal.title')}
        titleIcon="lock"
        width={460}
        footer={
          <>
            <Button icon="userPlus" onClick={goLogin}>
              {t('common.login')}
            </Button>
            <Button variant="secondary" disabled={!canClose} onClick={close}>
              {canClose ? t('common.close') : `${t('common.close')} (${secsLeft})`}
            </Button>
          </>
        }
      >
        <p className="flex items-start gap-2.5 text-body leading-relaxed">
          <span className="mt-0.5 shrink-0 text-accentStrong">
            <Icon name="mail" size={18} />
          </span>
          <span>
            {t('file.gateModal.messagePre')}{' '}
            <span dir="ltr" className="inline-block">{t('file.gateModal.messageDomain')}</span>
          </span>
        </p>
      </Modal>
    </FileGateContext.Provider>
  )
}

export function useFileGate() {
  const ctx = useContext(FileGateContext)
  if (!ctx) throw new Error('useFileGate must be used within FileGateProvider')
  return ctx
}
