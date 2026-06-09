import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { submitLead } from '@/lib/leads'
import { LEAD_INTERESTS } from '@/data/content'

const BENEFITS = ['benefit1', 'benefit2', 'benefit3'] as const

/* The lead-magnet popup: collects email (+ optional name & interest) so the
   agency can send the template / guidance PDFs. Built on the shared Modal
   (focus-trap / Esc / scroll-lock). The provider owns when it appears; this
   component owns the form + success state. */
export function LeadCaptureModal({ onClose, onSubscribed }: { onClose: () => void; onSubscribed: () => void }) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [interest, setInterest] = useState('')
  const [hp, setHp] = useState('') // honeypot — humans never see it
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setError(null)
    // Bot tripped the honeypot → pretend success, write nothing.
    if (hp.trim() !== '') {
      setDone(true)
      return
    }
    if (!email.trim()) {
      setError(t('lead.errorEmail'))
      return
    }
    setBusy(true)
    const outcome = await submitLead({ email, name, interest })
    setBusy(false)
    if (outcome === 'ok') {
      setDone(true)
      onSubscribed()
    } else {
      setError(t('lead.error'))
    }
  }

  const selectCls =
    'h-12 px-3.5 rounded-[var(--radius-sm)] bg-surface border-[1.5px] border-[var(--border-strong)] text-strong outline-none focus:border-accent appearance-none w-full'

  return (
    <Modal
      open
      onClose={onClose}
      title={done ? t('lead.successTitle') : t('lead.title')}
      titleIcon={done ? 'checkCircle' : 'download'}
      width={520}
    >
      {done ? (
        <div className="text-center py-4" role="status">
          <span className="grid place-items-center w-16 h-16 rounded-full mx-auto mb-4" style={{ background: 'var(--success-100)', color: 'var(--success-600)' }}>
            <Icon name="checkCircle" size={32} />
          </span>
          <p className="font-display font-bold text-strong text-xl">{t('lead.successTitle')}</p>
          <p className="text-muted mt-2 leading-relaxed max-w-[36ch] mx-auto">{t('lead.successBody')}</p>
          <div className="mt-6">
            <Button onClick={onClose}>{t('lead.successClose')}</Button>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={submit}>
          <p className="text-body leading-relaxed">{t('lead.subtitle')}</p>
          <ul className="space-y-2">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-body">
                <span className="grid place-items-center w-6 h-6 rounded-full shrink-0 bg-tint text-accentStrong">
                  <Icon name="check" size={14} />
                </span>
                {t(`lead.${b}`)}
              </li>
            ))}
          </ul>

          <Input
            label={t('lead.nameLabel')}
            icon="user"
            placeholder={t('lead.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <Input
            label={t('lead.emailLabel')}
            type="email"
            icon="mail"
            dir="ltr"
            placeholder="name@email.com"
            value={email}
            error={error || undefined}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
            autoComplete="email"
            required
          />

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-strong">{t('lead.interestLabel')}</span>
            <div className="relative">
              <select value={interest} onChange={(e) => setInterest(e.target.value)} className={selectCls}>
                <option value="">{t('lead.interestPlaceholder')}</option>
                {LEAD_INTERESTS.map((k) => (
                  <option key={k} value={k}>
                    {t(`lead.interests.${k}`)}
                  </option>
                ))}
              </select>
              <span className="absolute top-1/2 -translate-y-1/2 pointer-events-none text-muted" style={{ insetInlineEnd: 12 }}>
                <Icon name="chevronDown" size={18} />
              </span>
            </div>
          </label>

          {/* honeypot: off-screen, tab-skipped, hidden from AT — only bots fill it */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            style={{ position: 'absolute', insetInlineStart: '-9999px', width: 1, height: 1, opacity: 0 }}
          />

          <Button type="submit" full size="lg" icon="download" disabled={busy}>
            {t('lead.submit')}
          </Button>
          <p className="text-xs text-muted text-center leading-relaxed">{t('lead.consent')}</p>
        </form>
      )}
    </Modal>
  )
}
