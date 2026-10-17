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
  { url: '/bandeja', expected: 'Bandeja' },
  { url: '/proyectos?view=criticas', expected: 'Alertas Críticas' },
  { url: '/proyectos', expected: 'Proyectos' },
  {
    url: '/proyectos/proj-minedu-2027?tab=hitos&milestone=ML-M01',
    expected: 'Comunicación de Directorio de Almacenes',
  },
  {
    url: '/proyectos/proj-minedu-om050?tab=hitos&milestone=ML-O01',
    expected: 'H1',
    tenant: 'org-minedu',
  },
  {
    url: '/proyectos/proj-005?tab=hitos&milestone=ML-501',
    expected: 'Integración WMS Completa',
    tenant: 'org-pacifico',
  },
  { url: '/config', expected: 'Configuración' },
]

describe('Sidebar: selección activa unívoca y cascada Alternativa A', () => {
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

  it('el selector de PROYECTO ACTIVO es flotante (absolute) y el botón de Subprocesos colapsa con clic en todo el botón', () => {
    const { getByText, container, unmount } = render(
      <MemoryRouter initialEntries={['/proyectos/proj-minedu-2027']}>
        <TenantProvider>
          <Sidebar collapsed={false} />
        </TenantProvider>
      </MemoryRouter>,
    )

    // El botón de Subprocesos colapsa y expande al hacer clic en cualquier parte del botón
    const subprocessBtn = getByText('Fases & Subprocesos').closest('button')
    expect(subprocessBtn).toBeTruthy()
    expect(subprocessBtn?.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(subprocessBtn!)
    expect(subprocessBtn?.getAttribute('aria-expanded')).toBe('false')

    // El selector superior de proyecto activo despliega un menú flotante (absolute)
    const activeSelectorBtn = container.querySelector('button[aria-expanded]')
    expect(activeSelectorBtn).toBeTruthy()
    fireEvent.click(activeSelectorBtn!)
    const floatingMenu = container.querySelector('div.absolute.left-0.right-0.top-full')
    expect(floatingMenu).toBeTruthy()

    unmount()
  })
})

