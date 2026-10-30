import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Layers, Sparkles } from 'lucide-react'
import Sidebar from '@/components/sidebar/Sidebar'
import Header from '@/components/header/Header'

const BASE_PREFIXES = [
  '/gestor_proyectos0',
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
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('qaway.sidebarWidth')
      if (saved) {
        const val = Number(saved)
        if (val >= 180 && val <= 400) return val
      }
    } catch {
      // ignore
    }
    return 256
  })
  const isResizingRef = useRef(false)
  const location = useLocation()
  const navigate = useNavigate()
  const lastLegacyPathRef = useRef<string>('/proyectos/proj-minedu-2027')

  const barePath = location.pathname.slice(detectBase(location.pathname).length) || '/'
  const isCascadeView = barePath.startsWith('/cascada')
  const isMonitoring = barePath.includes('monitoreo')

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

  // Control de arrastre / redimensionamiento dinámico del Sidebar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return
      // Limitar entre 190px y 400px
      const newWidth = Math.min(Math.max(e.clientX, 190), 400)
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        try {
          localStorage.setItem('qaway.sidebarWidth', String(sidebarWidth))
        } catch {
          // ignore
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [sidebarWidth])

  const handleStartResize = (e: React.MouseEvent) => {
    e.preventDefault()
    isResizingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  return (
    <div
      data-mode={themeMode}
      data-palette={colorPalette}
      className="hub-shell h-dvh bg-[var(--hub-bg)] text-[var(--hub-text)] overflow-hidden transition-colors duration-200 print:!h-auto print:!overflow-visible print:!bg-white"
    >
      <div className="print:hidden">
        <Sidebar
          collapsed={collapsed}
          width={collapsed ? 72 : sidebarWidth}
          onStartResize={handleStartResize}
        />
      </div>
      <div
        className="flex flex-col h-dvh min-h-0 transition-[margin] duration-150 print:!ml-0 print:!h-auto print:!overflow-visible"
        style={{ marginLeft: collapsed ? 72 : sidebarWidth }}
      >
        <div className="print:hidden">
          <Header collapsed={collapsed} onToggleSidebar={() => setCollapsed((c) => !c)} />
        </div>
        <main className="flex-1 min-h-0 overflow-y-auto transition-colors duration-200 print:!overflow-visible print:!h-auto print:!p-0">
          <div className="p-6 min-h-full print:!p-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
