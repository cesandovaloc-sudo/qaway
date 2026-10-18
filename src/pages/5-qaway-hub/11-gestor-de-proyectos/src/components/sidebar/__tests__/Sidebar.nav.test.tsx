// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from '@/components/sidebar/Sidebar'
import { TenantProvider } from '@/context/TenantContext'

// ─────────────────────────────────────────────────────────────────────────
// Sidebar.nav.test.tsx — Verificación E2E de navegación en cascada (Alternativa A)
// 1. Selector superior de PROYECTO ACTIVO flotante (sin duplicar lista de proyectos abajo).
// 2. Enlaces de OPERACIÓN & CARTERA y SUBPROCESOS con 0 colisiones de selección activa.
// 3. Los Subprocesos se filtran automáticamente según el proyecto activo / entidad.
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
  { url: '/bandeja', expected: 'Bandeja' },
  { url: '/proyectos?view=criticas', expected: 'Alertas Críticas' },
  { url: '/cascada', expected: 'Cascada Fractal (WBS)' },
  {
    url: '/monitoreo-territorial',
    expected: 'Monitoreo Territorial',
  },
  { url: '/config', expected: 'Configuración' },
]

describe('Sidebar: selección activa unívoca y separación por niveles', () => {
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

  it('el selector de PROYECTO ACTIVO es flotante (absolute) y no desplaza el menú', () => {
    const { container, unmount } = render(
      <MemoryRouter initialEntries={['/proyectos/proj-minedu-2027']}>
        <TenantProvider>
          <Sidebar collapsed={false} />
        </TenantProvider>
      </MemoryRouter>,
    )

    // El selector superior de proyecto activo despliega un menú flotante (absolute)
    const activeSelectorBtn = container.querySelector('button[aria-expanded]')
    expect(activeSelectorBtn).toBeTruthy()
    fireEvent.click(activeSelectorBtn!)
    const floatingMenu = container.querySelector('div.absolute.left-0.right-0.top-full')
    expect(floatingMenu).toBeTruthy()

    unmount()
  })
})


