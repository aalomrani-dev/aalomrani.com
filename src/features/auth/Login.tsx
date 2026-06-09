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

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // Session-persistence wiring (remember vs session-only) lands with the Supabase session-config task.
  const [remember, setRemember] = useState(true)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const { error } = await signIn(email, password)
    setBusy(false)
    if (error) setError(t('auth.login.error'))
    else navigate('/')
  }

  return (
    <AuthShell
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      foot={
        <p className="mt-6 text-sm text-muted text-center">
          {t('auth.login.noAccount')}{' '}
          <Link to="/signup" className="text-accentStrong font-semibold hover:underline">
            {t('common.signup')}
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        <Input
          label={t('auth.field.email')}
          type="email"
          icon="mail"
          dir="ltr"
          placeholder={ORG.placeholder}
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
          onChange={(e) => {
            setPassword(e.target.value)
            if (error) setError(null)
          }}
          autoComplete="current-password"
          required
        />
        {error && (
          <p role="alert" className="flex items-center gap-2 text-sm" style={{ color: 'var(--error-600)' }}>
            <Icon name="lock" size={15} />
            {error}
          </p>
        )}
        <div className="flex items-center justify-between">
          <label htmlFor="remember" className="flex items-center gap-2 text-sm text-body cursor-pointer">
            <input
              id="remember"
              type="checkbox"
              className="accent-[var(--accent)]"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            {t('auth.login.rememberMe')}
          </label>
          <Link to="/reset" className="text-sm text-accentStrong font-medium hover:underline">
            {t('auth.login.forgotPassword')}
          </Link>
        </div>
        <Button full size="lg" type="submit" disabled={busy}>
          {t('auth.login.submit')}
        </Button>
      </form>
    </AuthShell>
  )
}
