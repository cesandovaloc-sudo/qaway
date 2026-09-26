import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import RequirePermission from '@/app/router/RequirePermission'
import { useAuth } from '@/context/AuthContext'
import type { User } from '@/types/user'

// Gate C-4 unificado con el Hub: sesión habilita, permiso habilita la sección,
// denegación muestra la tarjeta "Acceso restringido" del shell.

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const profileOf = (role: User['role'], permissions: Partial<User['permissions']> = {}): User => ({
  id: 'u-1',
  email: 'u@test.local',
  full_name: 'Usuario Test',
  avatar_url: null,
  role,
  permissions,
  created_at: new Date().toISOString(),
  last_active_at: null,
})

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/seccion']}>
      <Routes>
        <Route element={<RequirePermission permission="can_access_fiscal_settings" />}>
          <Route path="/seccion" element={<p>CONTENIDO-PROTEGIDO</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequirePermission — gate por ruta (patrón Hub)', () => {
  it('sin sesión redirige a /login (no renderiza contenido)', () => {
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      profile: null,
      loading: false,
      signIn: vi.fn(),
      signInWithOAuth: vi.fn(),
      resetPassword: vi.fn(),
      signOut: vi.fn(),
    } as ReturnType<typeof useAuth>)
    renderRoute()
    expect(screen.queryByText('CONTENIDO-PROTEGIDO')).not.toBeInTheDocument()
  })

  it('viewer sin override: denegado con tarjeta de acceso restringido (fail-closed)', () => {
    vi.mocked(useAuth).mockReturnValue({
      session: { user: { id: 'u-1' } } as never,
      profile: profileOf('viewer'),
      loading: false,
      signIn: vi.fn(),
      signInWithOAuth: vi.fn(),
      resetPassword: vi.fn(),
      signOut: vi.fn(),
    } as ReturnType<typeof useAuth>)
    renderRoute()
    expect(screen.getByText('Acceso restringido')).toBeInTheDocument()
    expect(screen.queryByText('CONTENIDO-PROTEGIDO')).not.toBeInTheDocument()
  })

  it('viewer con permiso overrideado por admin (permissions.panel-style): permitido', () => {
    vi.mocked(useAuth).mockReturnValue({
      session: { user: { id: 'u-1' } } as never,
      profile: profileOf('viewer', { can_access_fiscal_settings: true }),
      loading: false,
      signIn: vi.fn(),
      signInWithOAuth: vi.fn(),
      resetPassword: vi.fn(),
      signOut: vi.fn(),
    } as ReturnType<typeof useAuth>)
    renderRoute()
    expect(screen.getByText('CONTENIDO-PROTEGIDO')).toBeInTheDocument()
    expect(screen.queryByText('Acceso restringido')).not.toBeInTheDocument()
  })

  it('admin: permitido por rol base', () => {
    vi.mocked(useAuth).mockReturnValue({
      session: { user: { id: 'u-1' } } as never,
      profile: profileOf('admin'),
      loading: false,
      signIn: vi.fn(),
      signInWithOAuth: vi.fn(),
      resetPassword: vi.fn(),
      signOut: vi.fn(),
    } as ReturnType<typeof useAuth>)
    renderRoute()
    expect(screen.getByText('CONTENIDO-PROTEGIDO')).toBeInTheDocument()
  })

  it('sesión sin perfil resuelto: fail-closed (denegado)', () => {
    vi.mocked(useAuth).mockReturnValue({
      session: { user: { id: 'u-1' } } as never,
      profile: null,
      loading: false,
      signIn: vi.fn(),
      signInWithOAuth: vi.fn(),
      resetPassword: vi.fn(),
      signOut: vi.fn(),
    } as ReturnType<typeof useAuth>)
    renderRoute()
    expect(screen.getByText('Acceso restringido')).toBeInTheDocument()
  })
})
