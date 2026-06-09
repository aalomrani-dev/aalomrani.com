import type { ButtonHTMLAttributes } from 'react'
import { Icon, type IconName } from '@/components/ui/Icon'

type Variant = 'outline' | 'ghost' | 'soft'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  name: IconName
  label: string
  size?: number
  variant?: Variant
  active?: boolean
}

const VARIANTS: Record<Variant, string> = {
  outline: 'border border-line hover:bg-tint text-body',
  ghost: 'hover:bg-tint text-body',
  soft: 'bg-tint hover:brightness-95 text-body',
}

export function IconButton({ name, label, size = 40, variant = 'ghost', active = false, className = '', ...rest }: IconButtonProps) {
  const base = active ? 'bg-surface text-accentStrong shadow-[var(--shadow-xs)]' : VARIANTS[variant]
  return (
    <button
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      {...rest}
      className={`grid place-items-center rounded-[var(--radius-md)] transition-[background-color,transform,filter] duration-200 active:scale-95 ${base} ${className}`}
      style={{ width: size, height: size }}
    >
      <Icon name={name} size={Math.round(size * 0.5)} />
    </button>
  )
}
