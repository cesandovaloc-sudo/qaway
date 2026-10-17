import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/sidebar/Sidebar'
import Header from '@/components/header/Header'

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
    </div>
  )
}
