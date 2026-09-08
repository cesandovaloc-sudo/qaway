import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import { useAuth } from '@/context/AuthContext'

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

function mockAuth(overrides: Record<string, unknown> = {}) {
  const signIn = vi.fn().mockResolvedValue({})
  vi.mocked(useAuth).mockReturnValue({
    session: null,
    profile: null,
    loading: false,
    signIn,
    signOut: vi.fn(),
    ...overrides,
  } as never)
  return signIn
}

function renderLogin(initialEntry: string | { pathname: string; state?: unknown } = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialEntry as never]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Página principal</div>} />
        <Route path="/inventario" element={<div>Inventario</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mientras restaura la sesión no renderiza nada', () => {
    mockAuth({ loading: true })

    const { container } = renderLogin()

    expect(container).toBeEmptyDOMElement()
  })

  it('con sesión activa redirige al destino por defecto', () => {
    mockAuth({ session: { user: { id: 'user-1' } } })

    renderLogin()

    expect(screen.getByText('Página principal')).toBeInTheDocument()
  })

  it('con sesión activa redirige al from del location.state', () => {
    mockAuth({ session: { user: { id: 'user-1' } } })

    renderLogin({ pathname: '/login', state: { from: { pathname: '/inventario' } } })

    expect(screen.getByText('Inventario')).toBeInTheDocument()
  })

  it('submit con campos vacíos muestra el error y no llama a signIn', async () => {
    const user = userEvent.setup()
    const signIn = mockAuth()

    renderLogin()
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(screen.getByText('Ingresa tu correo y contraseña.')).toBeInTheDocument()
    expect(signIn).not.toHaveBeenCalled()
  })

  it('submit exitoso llama a signIn y navega al destino', async () => {
    const user = userEvent.setup()
    const signIn = mockAuth()

    renderLogin({ pathname: '/login', state: { from: { pathname: '/inventario' } } })
    await user.type(screen.getByLabelText('Correo electrónico'), 'admin@qawaylab.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secreto')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(signIn).toHaveBeenCalledWith('admin@qawaylab.com', 'secreto')
    expect(await screen.findByText('Inventario')).toBeInTheDocument()
  })

  it('error de signIn muestra el mensaje y no navega', async () => {
    const user = userEvent.setup()
    mockAuth({
      signIn: vi.fn().mockRejectedValue(new Error('Credenciales inválidas')),
    })

    renderLogin()
    await user.type(screen.getByLabelText('Correo electrónico'), 'admin@qawaylab.com')
    await user.type(screen.getByLabelText('Contraseña'), 'mal')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument()
    expect(screen.queryByText('Página principal')).not.toBeInTheDocument()
  })

  it('mientras envía muestra "Ingresando..." y deshabilita el botón', async () => {
    const user = userEvent.setup()
    let resolveSignIn!: (value: unknown) => void
    mockAuth({ signIn: vi.fn(() => new Promise((resolve) => { resolveSignIn = resolve })) })

    renderLogin()
    await user.type(screen.getByLabelText('Correo electrónico'), 'admin@qawaylab.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secreto')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    const submittingButton = screen.getByRole('button', { name: 'Ingresando...' })
    expect(submittingButton).toBeDisabled()

    await act(async () => { resolveSignIn({}) })
    expect(screen.getByText('Página principal')).toBeInTheDocument()
  })
})
