import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from '@/components/ui/Icon'

type Variant = 'primary' | 'secondary' | 'ghost' | 'sand'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  variant?: Variant
  size?: Size
  icon?: IconName
  iconEnd?: IconName
  full?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-onAccent hover:bg-accentStrong shadow-[var(--shadow-sm)] hover:shadow-[var(--glow-teal)]',
  secondary: 'bg-surface text-strong border border-line hover:bg-tint hover:border-lineStrong',
  ghost: 'bg-transparent text-accentStrong hover:bg-tint',
  sand: 'text-[#14201F] hover:brightness-95 shadow-[var(--shadow-sm)]',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-[15px] gap-2',
  lg: 'h-[52px] px-7 text-[17px] gap-2.5',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconEnd,
  full = false,
  className = '',
  ...rest
}: ButtonProps) {
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center font-medium rounded-[var(--radius-md)] transition-[transform,background-color,box-shadow,border-color] duration-200 active:scale-[.97] disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${full ? 'w-full' : ''} ${className}`}
      style={variant === 'sand' ? { background: 'var(--highlight)' } : undefined}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children && <span>{children}</span>}
      {iconEnd && <Icon name={iconEnd} size={iconSize} />}
    </button>
  )
}
