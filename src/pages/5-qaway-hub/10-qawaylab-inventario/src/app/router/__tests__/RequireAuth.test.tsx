import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import RequireAuth from '@/app/router/RequireAuth'
import { useAuth } from '@/context/AuthContext'
import type * as AuthContextTypes from '@/context/AuthContext'
import type { Session } from '@supabase/supabase-js'

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

// Deriva el contrato real del contexto (vi.mock solo afecta runtime, no tipos),
// para que cualquier cambio de forma en AuthContext rompa el typecheck del test
type AuthContextValue = ReturnType<typeof AuthContextTypes.useAuth>

const mockUseAuth = vi.mocked(useAuth)

const session = {
  access_token: 'token',
  refresh_token: 'refresh',
  expires_at: 4_102_444_800,
  user: { id: 'user-1' },
} as unknown as Session

function mockAuth(overrides: Partial<AuthContextValue> = {}): void {
  mockUseAuth.mockReturnValue({
    session: null,
    profile: null,
    loading: false,
    memberships: [],
    activeTenantId: null,
    tenantLoading: false,
    needsTenantSelection: false,
    selectTenant: vi.fn(),
    refreshTenantContext: vi.fn(),
    signIn: vi.fn(),
    signInWithOAuth: vi.fn(),
    resetPassword: vi.fn(),
    signOut: vi.fn(),
    ...overrides,
  })
}

function LoginProbe() {
  const location = useLocation()
  return (
    <div data-testid="login">
      login-page from:{location.state?.from?.pathname ?? 'none'}
      login-page search:{location.search ?? ''}
    </div>
  )
}

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/protegida']}>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="protegida" element={<div>CONTENIDO PROTEGIDO</div>} />
        </Route>
        <Route path="login" element={<LoginProbe />} />
      </Routes>
    </MemoryRouter>,
  )
}

function renderProtectedHub() {
  return render(
    <MemoryRouter initialEntries={['/hub/inventario/panel?tab=ofertas']}>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/hub/inventario/panel" element={<div>CONTENIDO HUB</div>} />
        </Route>
        <Route path="/login" element={<LoginProbe />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mientras loading muestra el spinner y no renderiza contenido', () => {
    mockAuth({ loading: true })
    const { container } = renderProtected()

    expect(container.querySelector('.animate-spin')).not.toBeNull()
    expect(screen.queryByText('CONTENIDO PROTEGIDO')).not.toBeInTheDocument()
    expect(screen.queryByTestId('login')).not.toBeInTheDocument()
  })

  it('sin sesión redirige a /login guardando la ruta de origen en state.from', () => {
    mockAuth({ session: null, loading: false })
    renderProtected()

    const login = screen.getByTestId('login')
    expect(login).toBeInTheDocument()
    expect(login).toHaveTextContent('login-page from:/protegida')
    expect(screen.queryByText('CONTENIDO PROTEGIDO')).not.toBeInTheDocument()
  })

  it('modo módulo sin sesión redirige a /login?redirect= con path + search codificados', () => {
    mockAuth({ session: null, loading: false })
    renderProtectedHub()

    const login = screen.getByTestId('login')
    expect(login).toBeInTheDocument()
    expect(login).toHaveTextContent('search:?redirect=%2Fhub%2Finventario%2Fpanel%3Ftab%3Dofertas')
    expect(login).toHaveTextContent('from:none')
    expect(screen.queryByText('CONTENIDO HUB')).not.toBeInTheDocument()
  })

  it('modo módulo con sesión renderiza el contenido protegido (Outlet)', () => {
    mockAuth({ session, loading: false })
    renderProtectedHub()

    expect(screen.getByText('CONTENIDO HUB')).toBeInTheDocument()
    expect(screen.queryByTestId('login')).not.toBeInTheDocument()
  })

  it('con sesión renderiza el contenido protegido (Outlet)', () => {
    mockAuth({ session, loading: false })
    renderProtected()

    expect(screen.getByText('CONTENIDO PROTEGIDO')).toBeInTheDocument()
    expect(screen.queryByTestId('login')).not.toBeInTheDocument()
  })

  it('con sesión y tenantLoading muestra spinner', () => {
    mockAuth({ session, loading: false, tenantLoading: true })
    const { container } = renderProtected()

    expect(container.querySelector('.animate-spin')).not.toBeNull()
    expect(screen.queryByText('CONTENIDO PROTEGIDO')).not.toBeInTheDocument()
  })

  it('con sesión y múltiples memberships sin contexto activo muestra selector', () => {
    mockAuth({
      session,
      loading: false,
      needsTenantSelection: true,
      memberships: [
        { membership_id: 'm1', tenant_id: 't1', tenant_slug: 'digere', tenant_name: 'DIGERE', tenant_status: 'active', membership_role: 'admin', membership_status: 'active', is_default: true, is_active_context: false },
        { membership_id: 'm2', tenant_id: 't2', tenant_slug: 'pulir', tenant_name: 'Financiera Pulir', tenant_status: 'active', membership_role: 'viewer', membership_status: 'active', is_default: false, is_active_context: false },
      ],
    })
    renderProtected()

    expect(screen.getByText('Selecciona una empresa')).toBeInTheDocument()
    expect(screen.getByText('DIGERE')).toBeInTheDocument()
    expect(screen.getByText('Financiera Pulir')).toBeInTheDocument()
    expect(screen.queryByText('CONTENIDO PROTEGIDO')).not.toBeInTheDocument()
  })
})
