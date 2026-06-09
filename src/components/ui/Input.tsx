import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '@/components/ui/Icon'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  icon?: IconName
}

/* Labelled text field, RTL-first. Leading icon, hint / error line, focus ring.
   Password fields get a show/hide reveal toggle. Mirrors the DS forms/Input. */
export function Input({ label, hint, error, icon, type = 'text', id, className = '', ...rest }: InputProps) {
  const { t } = useTranslation()
  const [focused, setFocused] = useState(false)
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && reveal ? 'text' : type
  const fid = id || (label ? `f-${label.replace(/\s+/g, '-')}` : undefined)
  const msgId = fid ? `${fid}-msg` : undefined
  const borderColor = error ? 'var(--error-600)' : focused ? 'var(--accent)' : 'var(--border-strong)'

  return (
    <label htmlFor={fid} className={`flex flex-col gap-2 w-full ${className}`}>
      {label && <span className="text-sm font-medium text-strong">{label}</span>}
      <span
        className="flex items-center gap-2 h-12 px-3.5 rounded-[var(--radius-sm)] bg-surface transition-[border-color,box-shadow] duration-200"
        style={{
          border: `1.5px solid ${borderColor}`,
          boxShadow: focused ? '0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent)' : 'none',
        }}
      >
        {icon && (
          <span className="text-muted shrink-0">
            <Icon name={icon} size={18} />
          </span>
        )}
        <input
          id={fid}
          type={inputType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={error ? true : undefined}
          aria-describedby={(error || hint) ? msgId : undefined}
          className="flex-1 w-full bg-transparent outline-none text-strong placeholder:text-faint min-w-0"
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? t('a11y.hidePassword') : t('a11y.showPassword')}
            className="text-muted hover:text-strong transition shrink-0"
          >
            <Icon name={reveal ? 'eyeOff' : 'eye'} size={18} />
          </button>
        )}
      </span>
      {(error || hint) && (
        <span id={msgId} role={error ? 'alert' : undefined} className="text-xs" style={{ color: error ? 'var(--error-600)' : 'var(--text-muted)' }}>
          {error || hint}
        </span>
      )}
    </label>
  )
}
