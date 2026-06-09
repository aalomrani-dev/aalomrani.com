import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AuthShell } from '@/features/auth/AuthShell'
import { useAuth } from '@/lib/auth'
import { ORG } from '@/data/content'

export function Signup() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    // The org-domain gate + owner promotion are enforced server-side by the
    // handle_new_user trigger; we surface its rejection rather than pre-checking.
    const { error, needsConfirmation } = await signUp(name, email, password)
    setBusy(false)
    if (error) {
      setError(/already.*regist|already.*exist|user.*exist/i.test(error) ? t('auth.signup.duplicateError') : t('auth.signup.error'))
      return
    }
    if (needsConfirmation) {
      setSent(true)
      return
    }
    navigate('/')
  }

  return (
    <AuthShell
      title={t('common.signup')}
      subtitle={t('auth.signup.subtitle')}
      foot={
        <p className="mt-6 text-sm text-muted text-center">
          {t('auth.signup.haveAccount')}{' '}
          <Link to="/login" className="text-accentStrong font-semibold hover:underline">
            {t('common.login')}
          </Link>
        </p>
      }
    >
      {sent ? (
        <div role="status" className="rounded-[var(--radius-lg)] border border-line p-6 text-center" style={{ background: 'var(--success-100)' }}>
          <span className="grid place-items-center w-12 h-12 rounded-full mx-auto mb-3" style={{ background: 'var(--success-600)', color: '#fff' }}>
            <Icon name="mail" size={24} />
          </span>
          <p className="font-semibold text-strong">{t('auth.signup.checkEmailTitle')}</p>
          <p className="text-sm text-muted mt-1">{t('auth.signup.checkEmailBody')}</p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={submit}>
          <Input
            label={t('auth.signup.fullName')}
            icon="user"
            placeholder={t('auth.signup.fullNamePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
          <Input
            label={t('auth.field.email')}
            type="email"
            icon="mail"
            dir="ltr"
            placeholder={ORG.placeholder}
            hint={t('org.hint')}
            error={error || undefined}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
            autoComplete="email"
            required
          />
          <Input
            label={t('auth.field.password')}
            type="password"
            icon="lock"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <label className="flex items-start gap-2.5 text-sm text-body pt-1 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 accent-[var(--accent)]"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
            />
            {t('org.consent')}
          </label>
          <Button full size="lg" type="submit" disabled={busy}>
            {t('auth.signup.submit')}
          </Button>
          <p className="flex items-center gap-2 text-xs text-muted justify-center pt-1">
            <Icon name="shield" size={14} style={{ color: 'var(--success-600)' }} />
            {t('org.signupNote')}
          </p>
        </form>
      )}
    </AuthShell>
  )
}
