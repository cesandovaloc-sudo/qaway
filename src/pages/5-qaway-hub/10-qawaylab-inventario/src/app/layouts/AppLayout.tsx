import { useState } from 'react'
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
 * Sin esta estructura no existe contenedor de scroll intermedio, así que el
 * `sticky top-0` de una barra de filtros se resuelve contra el documento y la
 * barra se ancla al tope del viewport, ocupando el lugar del topbar.
 */
export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="h-dvh bg-surface overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div
        className="flex flex-col h-dvh min-h-0 transition-all duration-300"
        style={{ marginLeft: collapsed ? 72 : 260 }}
      >
        <Header collapsed={collapsed} onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
