import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

/* The read/download gate. Browsing is fully open; the moment a guest tries to
   open or download a file, open() shows this login popup (the client-approved
   gate). Mounted inside AppLayout so any page under it (download/library/file)
   can trigger it via useFileGate(). The real enforcement is server-side RLS. */
interface FileGateValue {
  open: () => void
}
const FileGateContext = createContext<FileGateValue | null>(null)

export function FileGateProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const openModal = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])
  const goLogin = useCallback(() => {
    setOpen(false)
    navigate('/login')
  }, [navigate])

  return (
    <FileGateContext.Provider value={{ open: openModal }}>
      {children}
      <Modal
        open={open}
        onClose={close}
        title={t('file.gateModal.title')}
        titleIcon="lock"
        width={460}
        footer={
          <>
            <Button icon="userPlus" onClick={goLogin}>
              {t('common.login')}
            </Button>
            <Button variant="secondary" onClick={close}>
              {t('common.cancel')}
            </Button>
          </>
        }
      >
        <p className="flex items-start gap-2.5 text-body leading-relaxed">
          <span className="mt-0.5 shrink-0 text-accentStrong">
            <Icon name="mail" size={18} />
          </span>
          <span>{t('file.gateModal.message')}</span>
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
