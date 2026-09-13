import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { pageview } from '@/lib/analytics/metaPixel'

/**
 * Emite `PageView` en cada transición real de ruta de la SPA.
 *
 * Meta exige que el `PageView` se registre en cada página vista. En una SPA
 * la URL cambia sin recargar el documento, así que el código base solo cubre
 * la primera vista: sin este tracker, Meta recibe 1 PageView por sesión y no
 * puede leer el embudo.
 *
 * La primera ruta NO se emite aquí: ya la registró el código base de
 * `index.html`. La referencia por ruta (en lugar de un booleano "primera vez")
 * evita duplicados con el doble montaje de React StrictMode en desarrollo.
 */
export default function MetaPixelRouteTracker() {
  const { pathname, search } = useLocation()
  const lastTrackedRef = useRef(null)

  useEffect(() => {
    const current = `${pathname}${search}`

    if (lastTrackedRef.current === null) {
      // Montaje inicial: el código base ya envió este PageView.
      lastTrackedRef.current = current
      return
    }

    if (lastTrackedRef.current === current) return

    lastTrackedRef.current = current
    pageview()
  }, [pathname, search])

  return null
}
