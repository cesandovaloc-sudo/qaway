import { useEffect, useRef } from 'react'

// Cierra un overlay (menú/popover/panel/filtro) al presionar Escape o al hacer
// click fuera del mismo. La detección de "click fuera" usa el atributo
// data-dismissable sobre el trigger y el panel, por lo que funciona también
// para menús renderizados dentro de un .map() (filas de tabla).
//   open  : boolean que activa/desactiva los listeners.
//   close : función que cierra el overlay.
export function useDismissOnEscapeOrOutside(open, close) {
  const closeRef = useRef(close)
  useEffect(() => {
    closeRef.current = close
  })

  useEffect(() => {
    if (!open) return undefined
    function handlePointerDown(event) {
      const target = event.target
      if (target && typeof target.closest === 'function' && target.closest('[data-dismissable]')) return
      closeRef.current()
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closeRef.current()
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])
}