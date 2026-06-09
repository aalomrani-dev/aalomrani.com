import type { ReactNode } from 'react'

interface CategoryChipProps {
  children: ReactNode
  active?: boolean
  count?: number
  onClick?: () => void
}

/* Filter / category selector. Active = filled teal; idle = soft mint outline. */
export function CategoryChip({ children, active = false, count, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-pill)] text-sm font-medium whitespace-nowrap border transition-[background-color,color,transform] duration-200 active:scale-[.96]"
      style={
        active
          ? { color: 'var(--text-on-accent)', background: 'var(--accent)', borderColor: 'transparent' }
          : { color: 'var(--text-body)', background: 'var(--surface-tint)', borderColor: 'var(--border)' }
      }
    >
      {children}
      {count != null && (
        <span
          className="tnum font-mono text-[11px] font-semibold rounded-[var(--radius-pill)] px-1.5 py-px"
          style={active ? { background: 'rgba(255,255,255,0.22)', color: '#fff' } : { background: 'var(--surface-card)', color: 'var(--text-muted)' }}
        >
          {count}
        </span>
      )}
    </button>
  )
}
