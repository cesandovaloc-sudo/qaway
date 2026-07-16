import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    // Timeout to ensure DOM is updated (especially with animations or heavy rendering)
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 0)
  }, [pathname])

  return null
}