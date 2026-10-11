import { useEffect, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────
// useHubBrand.ts — Color de marca resuelto a hex (Fase 17)
// Los atributos de presentación SVG (fill/stroke) no aceptan var(); este hook
// resuelve `--hub-brand` a hexadecimal y se re-suscribe a los cambios de
// paleta (`qaway-palette-change`) para mantener gráficos reactivos.
// ─────────────────────────────────────────────────────────────────────────

const FALLBACK_BRAND = '#d9532f'

function readHubBrand(): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') return FALLBACK_BRAND
  try {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--hub-brand')
      .trim()
    return value || FALLBACK_BRAND
  } catch {
    return FALLBACK_BRAND
  }
}

export function useHubBrand(): string {
  const [brand, setBrand] = useState(readHubBrand)
  useEffect(() => {
    const update = () => setBrand(readHubBrand())
    window.addEventListener('qaway-palette-change', update)
    return () => window.removeEventListener('qaway-palette-change', update)
  }, [])
  return brand
}

export default useHubBrand
