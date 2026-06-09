import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/* Reset scroll to top on route change. */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}
