// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from '@/components/sidebar/Sidebar'
import { TenantProvider } from '@/context/TenantContext'

// ─────────────────────────────────────────────────────────────────────────
// Sidebar.nav.test.tsx — Verificación E2E de navegación (Fase 20/24)
// Recorre las URLs del sidebar y confirma 0 colisiones: como máximo UN item
// con estilo activo a la vez, y que sea exactamente el esperado. Incluye
// alcance por entidad (Fase 24): los hijos de CARTERA siguen al tenant.
// Nota: NavLink marca aria-current por pathname (ignora el query); la app usa
// coincidencia exacta ruta+query, por eso se audita la clase `font-semibold`.
// ─────────────────────────────────────────────────────────────────────────

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    profile: { role: 'admin', is_platform_admin: true },
    session: null,
  }),
}))

function activeLabelsAt(url: string, scopedTenantId?: string): string[] {
  window.sessionStorage.clear()
  if (scopedTenantId) {
    window.sessionStorage.setItem('qaway.scopedTenant', JSON.stringify({ id: scopedTenantId }))
  }
  const { container, unmount } = render(
    <MemoryRouter initialEntries={[url]}>
      <TenantProvider>
        <Sidebar collapsed={false} />
      </TenantProvider>
    </MemoryRouter>,
  )
  const labels = Array.from(container.querySelectorAll('a'))
    .filter((a) => (a.getAttribute('class') ?? '').includes('font-semibold'))
    .map((a) => a.textContent ?? '')
  unmount()
  window.sessionStorage.clear()
  return labels
}

const CASES: Array<{ url: string; expected: string; tenant?: string }> = [
  { url: '/', expected: 'Resumen' },
  { url: '/proyectos', expected: 'Proyectos' },
  { url: '/proyectos/proj-minedu-2027', expected: 'Dotación 2027' },
  { url: '/proyectos/proj-minedu-2027?tab=kanban', expected: 'Gestores & Territorio' },
  { url: '/bandeja', expected: 'Bandeja' },
  { url: '/proyectos?view=criticas', expected: 'Alertas Críticas' },
  { url: '/proyectos/proj-minedu-2027?tab=gantt', expected: 'Diagrama Gantt' },
  { url: '/proyectos/proj-minedu-2027?tab=hitos', expected: 'Hitos & Entregables' },
  { url: '/proyectos/proj-minedu-2027?tab=docs', expected: 'Normativa & Wiki' },
  { url: '/proyectos/proj-minedu-om050', expected: 'OM 050' },
  { url: '/proyectos/proj-minedu-om050?tab=gantt', expected: 'Diagrama Gantt' },
  { url: '/proyectos/proj-minedu-om050?tab=kanban', expected: 'Gestores & Territorio' },
  { url: '/proyectos/proj-minedu-om050?tab=resumen', expected: 'OM 050' },
  { url: '/config', expected: 'Configuración' },
  // Alcance por entidad (Fase 24)
  { url: '/proyectos/proj-minedu-om050', expected: 'OM 050', tenant: 'org-minedu' },
  { url: '/proyectos/proj-005', expected: 'Almacén', tenant: 'org-pacifico' },
]

describe('Sidebar: selección activa unívoca', () => {
  for (const { url, expected, tenant } of CASES) {
    it(`solo activa "${expected}" en ${url}${tenant ? ` [${tenant}]` : ''}`, () => {
      const labels = activeLabelsAt(url, tenant)
      expect(labels).toHaveLength(1)
      expect(labels[0]).toContain(expected)
    })
  }

  it('0 colisiones en todo el mapa de navegación', () => {
    for (const { url } of CASES) {
      expect(activeLabelsAt(url).length).toBeLessThanOrEqual(1)
    }
  })

  it('sin coincidencias no ilumina nada (tenant pacifico + url minedu)', () => {
    expect(activeLabelsAt('/proyectos/proj-minedu-2027', 'org-pacifico')).toHaveLength(0)
  })
})
