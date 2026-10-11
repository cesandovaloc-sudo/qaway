// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from '@/components/sidebar/Sidebar'

// ─────────────────────────────────────────────────────────────────────────
// Sidebar.nav.test.tsx — Verificación E2E de navegación (Fase 20)
// Recorre las URLs del sidebar y confirma 0 colisiones: como máximo UN item
// con estilo activo a la vez, y que sea exactamente el esperado.
// Nota: NavLink marca aria-current por pathname (ignora el query); la app usa
// coincidencia exacta ruta+query, por eso se audita la clase `font-semibold`.
// ─────────────────────────────────────────────────────────────────────────

function activeLabelsAt(url: string): string[] {
  const { container, unmount } = render(
    <MemoryRouter initialEntries={[url]}>
      <Sidebar collapsed={false} />
    </MemoryRouter>,
  )
  const labels = Array.from(container.querySelectorAll('a'))
    .filter((a) => (a.getAttribute('class') ?? '').includes('font-semibold'))
    .map((a) => a.textContent ?? '')
  unmount()
  return labels
}

const CASES: Array<{ url: string; expected: string }> = [
  { url: '/', expected: 'Resumen' },
  { url: '/proyectos', expected: 'Proyectos' },
  { url: '/proyectos/proj-minedu-2027', expected: 'Dotación MINEDU 2027' },
  { url: '/proyectos/proj-minedu-2027?tab=kanban', expected: 'Gestores & Territorio' },
  { url: '/proyectos/proj-minedu-2027?tab=kanban&view=bandeja', expected: 'Bandeja' },
  { url: '/proyectos?view=criticas', expected: 'Alertas Críticas' },
  { url: '/proyectos/proj-minedu-2027?tab=gantt', expected: 'Diagrama Gantt' },
  { url: '/proyectos/proj-minedu-2027?tab=gantt&sub=om050', expected: 'Redistribución OM 050' },
  { url: '/proyectos/proj-minedu-2027?tab=hitos', expected: 'Hitos & Entregables' },
  { url: '/proyectos/proj-minedu-2027?tab=docs', expected: 'Normativa & Wiki' },
  { url: '/config', expected: 'Configuración' },
]

describe('Sidebar: selección activa unívoca', () => {
  for (const { url, expected } of CASES) {
    it(`solo activa "${expected}" en ${url}`, () => {
      const labels = activeLabelsAt(url)
      expect(labels).toHaveLength(1)
      expect(labels[0]).toContain(expected)
    })
  }

  it('0 colisiones en todo el mapa de navegación', () => {
    for (const { url } of CASES) {
      expect(activeLabelsAt(url).length).toBeLessThanOrEqual(1)
    }
  })
})
