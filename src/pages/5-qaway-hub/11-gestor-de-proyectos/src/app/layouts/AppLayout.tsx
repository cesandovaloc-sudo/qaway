import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Layers, Sparkles } from 'lucide-react'
import Sidebar from '@/components/sidebar/Sidebar'
import Header from '@/components/header/Header'

const BASE_PREFIXES = [
  '/hub/proyectos',
  '/hub/gestor-proyectos-app',
  '/hub/inventario',
  '/inventario',
]
function detectBase(pathname: string) {
  return BASE_PREFIXES.find((prefix) => pathname.startsWith(prefix)) ?? ''
}
function getHref(to: string) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const basePrefix = detectBase(pathname)
  if (!basePrefix) return to
  if (to === '/') return basePrefix
  return `${basePrefix}${to.startsWith('/') ? to : `/${to}`}`
}

/**
 * Uniformización con el panel principal (Hub, HubPanelPage.jsx):
 * el colapso del menú lateral se gobierna desde el topbar (botón hamburguesa
 * a la izquierda, junto al waffle de Apps). El estado vive aquí y se reparte
 * a Sidebar (ancho) y Header (botón). Referencia: fila 41 del plan v3.
 *
 * Estructura del shell = Hub (:2516 → :2574 → :2972). Esto es lo que hace
 * correcto el anti-scroll de las barras de filtros:
 * - la raíz es `h-dvh overflow-hidden`: el shell NO scrollea;
 * - el topbar es hermano `shrink-0` FUERA del scroller, por eso queda siempre
 *   visible (no necesita ser sticky);
 * - `<main>` es el contenedor de scroll (`flex-1 min-h-0 overflow-y-auto`).
 */
export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const lastLegacyPathRef = useRef<string>('/proyectos/proj-minedu-2027')

  const barePath = location.pathname.slice(detectBase(location.pathname).length) || '/'
  const isCascadeView = barePath.startsWith('/cascada')

  useEffect(() => {
    if (!isCascadeView) {
      lastLegacyPathRef.current = `${barePath}${location.search}`
    }
  }, [barePath, location.search, isCascadeView])

  const [themeMode, setThemeMode] = useState<'blanco' | 'grises' | 'contraste' | 'oscuro' | 'ejecutivo'>(() => {
    const raw = localStorage.getItem('qaway.hubTheme')
    if (raw === 'claro' || raw === 'blanco') return 'blanco'
    if (raw === 'grises') return 'grises'
    if (raw === 'oscuro') return 'oscuro'
    if (raw === 'ejecutivo') return 'ejecutivo'
    return 'contraste'
  })
  const [colorPalette, setColorPalette] = useState<'terracota' | 'carbon' | 'estudio' | 'ejecutivo' | 'personalizado'>(() => {
    const raw = localStorage.getItem('qaway.colorPalette')
    if (raw === 'carbon' || raw === 'estudio' || raw === 'ejecutivo' || raw === 'personalizado') return raw
    return 'terracota'
  })

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e.detail) {
        setThemeMode(e.detail)
      }
    }
    const handlePaletteChange = (e: any) => {
      if (e.detail) {
        setColorPalette(e.detail)
      }
    }
    window.addEventListener('qaway-theme-change', handleThemeChange)
    window.addEventListener('qaway-palette-change', handlePaletteChange)
    return () => {
      window.removeEventListener('qaway-theme-change', handleThemeChange)
      window.removeEventListener('qaway-palette-change', handlePaletteChange)
    }
  }, [])

  return (
    <div
      data-mode={themeMode}
      data-palette={colorPalette}
      className="hub-shell h-dvh bg-[var(--hub-bg)] text-[var(--hub-text)] overflow-hidden transition-colors duration-200"
    >
      <Sidebar collapsed={collapsed} />
      <div
        className="flex flex-col h-dvh min-h-0 transition-all duration-300"
        style={{ marginLeft: collapsed ? 72 : 256 }}
      >
        <Header collapsed={collapsed} onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main className="flex-1 min-h-0 overflow-y-auto transition-colors duration-200">
          <div className="p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* SWITCHER FLOTANTE INFERIOR: Alterna en 1 clic entre Versión Actual (Fase 17) y Vista Cascada Fractal */}
      <div
        role="region"
        aria-label="Selector de versión de arquitectura"
        className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur-md"
      >
        <button
          type="button"
          onClick={() => navigate(getHref(lastLegacyPathRef.current || '/proyectos/proj-minedu-2027'))}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            !isCascadeView
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Layers size={14} />
          <span>Versión Anterior (Fase 17)</span>
        </button>
        <button
          type="button"
          onClick={() => navigate(getHref('/cascada'))}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            isCascadeView
              ? 'bg-[#1e3a8a] text-white shadow-sm ring-1 ring-blue-400/50'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Sparkles size={14} className={isCascadeView ? 'text-amber-300' : 'text-blue-400'} />
          <span>Versión Actual · Cascada Fractal</span>
        </button>
      </div>
    </div>
  )
}
