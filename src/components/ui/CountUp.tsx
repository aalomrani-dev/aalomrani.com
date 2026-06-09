import { useEffect, useState } from 'react'
import { useInView } from '@/hooks/useInView'

interface CountUpProps {
  to: number
  suffix?: string
  duration?: number
  className?: string
}

/* Eased count-up that runs once the element enters view. */
export function CountUp({ to, suffix = '', duration = 1400, className }: CountUpProps) {
  const [ref, inView] = useInView<HTMLSpanElement>('0px')
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(to)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1)
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * to))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setVal(to)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])

  return (
    <span ref={ref} className={className}>
      {val.toLocaleString('en-US')}
      {suffix}
    </span>
  )
}
