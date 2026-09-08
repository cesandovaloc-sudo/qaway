import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AuthError, type Session } from '@supabase/supabase-js'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { supabase } from '@/config/supabase'
import { userService } from '@/services/userService'
import type { User } from '@/types/user'

// userService usa la cadena supabase.from(...); lo mockeamos para controlar el perfil
vi.mock('@/services/userService', () => ({
  userService: {
    getCurrentUser: vi.fn(),
  },
}))

const mockGetCurrentUser = vi.mocked(userService.getCurrentUser)

type SignInResult = Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>

function makeSession(userId = 'user-1'): Session {
  return {
    access_token: 'token-de-prueba',
    refresh_token: 'refresh-de-prueba',
    expires_at: 4_102_444_800,
    user: {
      id: userId,
      email: 'admin@qawaylab.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2026-01-01T00:00:00Z',
      role: 'authenticated',
    },
  } as unknown as Session
}

const mockUser: User = {
  id: 'user-1',
  email: 'admin@qawaylab.com',
  full_name: 'Admin Qaway',
  avatar_url: null,
  role: 'admin',
  permissions: {},
  created_at: '2026-01-01T00:00:00Z',
  last_active_at: null,
}

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentUser.mockResolvedValue(null)
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    })
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    } as unknown as SignInResult)
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((_event) => ({
      data: {
        subscription: { id: 'sub-1', callback: vi.fn(), unsubscribe: vi.fn() },
      },
    }))
  })

  it('lanza error si se usa fuera de <AuthProvider>', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() => renderHook(() => useAuth())).toThrow(
        'useAuth debe usarse dentro de <AuthProvider>',
      )
    } finally {
      consoleSpy.mockRestore()
    }
  })

  it('arranca en loading y termina con sesión null sin perfil cuando no hay sesión persistida', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.session).toBeNull()
    expect(result.current.profile).toBeNull()
    expect(mockGetCurrentUser).not.toHaveBeenCalled()
  })

  it('restaura la sesión persistida y carga el perfil del usuario', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: makeSession() },
      error: null,
    })
    mockGetCurrentUser.mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))
    await waitFor(() => expect(result.current.profile?.role).toBe('admin'))

    expect(result.current.session?.user?.id).toBe('user-1')
    expect(result.current.profile?.full_name).toBe('Admin Qaway')
    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1)
  })

  it('si getSession falla, termina con sesión null sin romper', async () => {
    vi.mocked(supabase.auth.getSession).mockRejectedValue(new Error('red caída'))

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.session).toBeNull()
    expect(result.current.profile).toBeNull()
  })

  it('si falla la carga del perfil, la sesión se conserva y profile queda null', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: makeSession() },
      error: null,
    })
    mockGetCurrentUser.mockRejectedValue(new Error('db caída'))

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))
    await waitFor(() => expect(result.current.profile).toBeNull())

    expect(result.current.session?.user?.id).toBe('user-1')
  })

  it('onAuthStateChange actualiza la sesión en vivo (login remoto)', async () => {
    let handler: ((event: string, session: Session | null) => void) | null = null
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      handler = callback as typeof handler
      return { data: { subscription: { id: 'sub-1', callback, unsubscribe: vi.fn() } } }
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.session).toBeNull()

    act(() => handler?.('SIGNED_IN', makeSession()))

    await waitFor(() => expect(result.current.session?.user?.id).toBe('user-1'))
  })

  it('al cambiar de usuario en la sesión, re-carga el perfil del nuevo usuario', async () => {
    let handler: ((event: string, session: Session | null) => void) | null = null
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      handler = callback as typeof handler
      return { data: { subscription: { id: 'sub-1', callback, unsubscribe: vi.fn() } } }
    })
    mockGetCurrentUser
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ ...mockUser, id: 'user-2', email: 'editor@qawaylab.com', role: 'editor' })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => handler?.('SIGNED_IN', makeSession('user-1')))
    await waitFor(() => expect(result.current.profile?.id).toBe('user-1'))

    act(() => handler?.('SIGNED_IN', makeSession('user-2')))
    await waitFor(() => expect(result.current.profile?.id).toBe('user-2'))

    expect(mockGetCurrentUser).toHaveBeenCalledTimes(2)
  })

  it('al desmontar se cancela la suscripción de auth', async () => {
    const unsubscribe = vi.fn()
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(() => ({
      data: { subscription: { id: 'sub-1', callback: vi.fn(), unsubscribe } },
    }))

    const { result, unmount } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    unmount()

    expect(unsubscribe).toHaveBeenCalled()
  })

  it('signIn llama a signInWithPassword con las credenciales', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.signIn('admin@qawaylab.com', 'secreto')
    })

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'admin@qawaylab.com',
      password: 'secreto',
    })
  })

  it('signIn propaga el error de credenciales inválidas', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthError('Invalid login credentials'),
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await expect(result.current.signIn('admin@qawaylab.com', 'mal')).rejects.toThrow(
        'Invalid login credentials',
      )
    })
  })

  it('signOut limpia sesión y perfil', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: makeSession() },
      error: null,
    })
    mockGetCurrentUser.mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.session?.user?.id).toBe('user-1'))

    await act(async () => {
      await result.current.signOut()
    })

    expect(supabase.auth.signOut).toHaveBeenCalled()
    expect(result.current.session).toBeNull()
    expect(result.current.profile).toBeNull()
  })

  it('signOut propaga el error del backend', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: new AuthError('sesión expirada') })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await expect(result.current.signOut()).rejects.toThrow('sesión expirada')
    })
  })
})
