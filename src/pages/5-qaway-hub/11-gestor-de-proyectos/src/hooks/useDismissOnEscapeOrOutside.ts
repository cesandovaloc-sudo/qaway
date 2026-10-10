import { useEffect, useRef } from 'react'

export function useDismissOnEscapeOrOutside(active: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!active) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onCloseRef.current()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('mousedown', onPointerDown as EventListener)
    window.addEventListener('touchstart', onPointerDown as EventListener)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('mousedown', onPointerDown as EventListener)
      window.removeEventListener('touchstart', onPointerDown as EventListener)
    }
  }, [active])

  return ref
}