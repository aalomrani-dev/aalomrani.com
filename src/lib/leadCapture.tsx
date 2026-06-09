import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { LeadCaptureModal } from '@/features/lead/LeadCaptureModal'

/* Owns WHEN the lead-capture popup appears. Auto-opens once, ~12s into a
   visitor's first session, then remembers the outcome in localStorage so it
   never nags. Always reopenable on demand via useLeadCapture().open() (the
   footer link). Mounted inside AppLayout, so it never shows on auth/admin. */

const STORAGE_KEY = 'kp-lead' // 'dismissed' | 'subscribed' (absent = never seen)
const FIRST_VISIT_DELAY = 12_000

interface LeadCaptureValue {
  open: () => void
}
const LeadCaptureContext = createContext<LeadCaptureValue | null>(null)

export function LeadCaptureProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const subscribedRef = useRef(false)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    const id = window.setTimeout(() => setOpen(true), FIRST_VISIT_DELAY)
    return () => window.clearTimeout(id)
  }, [])

  const openModal = useCallback(() => setOpen(true), [])

  const handleClose = useCallback(() => {
    setOpen(false)
    // Remember the dismissal so the timer never re-fires (the footer link still
    // opens it on demand) — unless they've already subscribed.
    if (!subscribedRef.current && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, 'dismissed')
    }
  }, [])

  const handleSubscribed = useCallback(() => {
    subscribedRef.current = true
    localStorage.setItem(STORAGE_KEY, 'subscribed')
  }, [])

  return (
    <LeadCaptureContext.Provider value={{ open: openModal }}>
      {children}
      {open && <LeadCaptureModal onClose={handleClose} onSubscribed={handleSubscribed} />}
    </LeadCaptureContext.Provider>
  )
}

export function useLeadCapture() {
  const ctx = useContext(LeadCaptureContext)
  if (!ctx) throw new Error('useLeadCapture must be used within LeadCaptureProvider')
  return ctx
}
