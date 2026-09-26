import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/sidebar/Sidebar'
import Header from '@/components/header/Header'

/**
 * Uniformización con el panel principal (Hub, HubPanelPage.jsx):
 * el colapso del menú lateral se gobierna desde el topbar (botón hamburguesa
 * a la izquierda, junto al waffle de Apps). El estado vive aquí y se reparte
 * a Sidebar (ancho) y Header (botón). Referencia: fila 41 del plan v3.
 */
export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-dvh bg-surface">
      <Sidebar collapsed={collapsed} />
      <div
        className="transition-all duration-300"
        style={{ marginLeft: collapsed ? 72 : 260 }}
      >
        <Header collapsed={collapsed} onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
