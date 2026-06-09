import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AuthShell } from '@/features/auth/AuthShell'
import { useAuth } from '@/lib/auth'
import { ORG } from '@/data/content'

export function Reset() {
  const { t } = useTranslation()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    // Always confirm sent — never reveal whether an address has an account.
    await resetPassword(email)
    setBusy(false)
    setSent(true)
  }

  return (
    <AuthShell
      title={t('auth.reset.title')}
      subtitle={t('auth.reset.subtitle')}
      foot={
        <p className="mt-6 text-sm text-muted text-center">
          <Link to="/login" className="text-accentStrong font-semibold hover:underline inline-flex items-center gap-1.5">
            <Icon name="arrowLeft" size={15} />
            {t('auth.reset.backToLogin')}
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="rounded-[var(--radius-lg)] border border-line p-6 text-center" style={{ background: 'var(--success-100)' }}>
          <span className="grid place-items-center w-12 h-12 rounded-full mx-auto mb-3" style={{ background: 'var(--success-600)', color: '#fff' }}>
            <Icon name="check" size={24} />
          </span>
          <p className="font-semibold text-strong">{t('auth.reset.sentTitle')}</p>
          <p className="text-sm text-muted mt-1">{t('auth.reset.sentBody')}</p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={submit}>
          <Input
            label={t('auth.field.email')}
            type="email"
            icon="mail"
            dir="ltr"
            placeholder={ORG.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Button full size="lg" type="submit" disabled={busy}>
            {t('auth.reset.submit')}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
