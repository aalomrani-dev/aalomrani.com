import { useEffect, useRef, useState } from 'react'

/* Returns [ref, inView] — true once the element first enters the viewport.
   Uses IntersectionObserver with a sensible fallback; respects reduced motion. */
export function useInView<T extends HTMLElement = HTMLDivElement>(rootMargin = '0px 0px -8% 0px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) {
      setInView(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true)
            io.disconnect()
            break
          }
        }
      },
      { threshold: 0.15, rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [inView, rootMargin])

  return [ref, inView] as const
}
