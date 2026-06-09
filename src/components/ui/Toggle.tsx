import type { KeyboardEvent } from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  labelOn?: string
  labelOff?: string
  disabled?: boolean
  ariaLabel?: string
}

/* Pill switch for binary settings (access, visibility). Optional start/end labels.
   Mirrors the DS forms/Toggle — RTL-aware via inset-inline-start on the knob. */
export function Toggle({ checked, onChange, labelOn, labelOff, disabled = false, ariaLabel = 'toggle' }: ToggleProps) {
  const toggle = () => {
    if (!disabled) onChange(!checked)
  }
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onChange(!checked)
    }
  }
  const lbl = (active: boolean) => (active ? 'text-strong' : 'text-faint')

  return (
    <div
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
      onClick={toggle}
      onKeyDown={onKey}
      className="inline-flex items-center gap-2 select-none"
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
    >
      {labelOff && <span className={`text-sm font-semibold ${lbl(!checked)}`}>{labelOff}</span>}
      <span
        className="relative w-12 h-7 rounded-[var(--radius-pill)] transition-colors duration-200 shrink-0"
        style={{ background: checked ? 'var(--accent)' : 'var(--border-strong)' }}
      >
        <span
          className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-[var(--shadow-sm)]"
          style={{ insetInlineStart: checked ? 23 : 3, transition: 'inset-inline-start .24s var(--ease-spring)' }}
        />
      </span>
      {labelOn && <span className={`text-sm font-semibold ${lbl(checked)}`}>{labelOn}</span>}
    </div>
  )
}
