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
    signIn: vi.fn(),
    signOut: vi.fn(),
    ...overrides,
  })
}

function LoginProbe() {
  const location = useLocation()
  return (
    <div data-testid="login">
      login-page from:{location.state?.from?.pathname ?? 'none'}
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

  it('con sesión renderiza el contenido protegido (Outlet)', () => {
    mockAuth({ session, loading: false })
    renderProtected()

    expect(screen.getByText('CONTENIDO PROTEGIDO')).toBeInTheDocument()
    expect(screen.queryByTestId('login')).not.toBeInTheDocument()
  })
})
