import type { CSSProperties, ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
  style?: CSSProperties
}

/* Fade + 16px rise when scrolled into view (staggered via `delay`). */
export function Reveal({ children, delay = 0, className, style }: RevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateY(18px)',
        transition: `opacity .6s var(--ease-out) ${delay}ms, transform .6s var(--ease-out) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
