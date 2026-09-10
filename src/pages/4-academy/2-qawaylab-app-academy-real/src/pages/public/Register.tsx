import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useAuthGuard } from '@/hooks/useAuthGuard'

export default function Register() {
  const guard = useAuthGuard()
  if (guard.guard === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }
  if (guard.guard === 'redirect') {
    return <Navigate to={guard.target} replace />
  }

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')
  const safeRedirect = redirect?.startsWith('/') ? redirect : null

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    try {
      const data = await signUp(email, password, { full_name: fullName })
      const userId = data?.user?.id
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single()

        const roleRoutes: Record<string, string> = {
          student: '/academy/app/panel',
          teacher: '/academy/app/docente',
          editor: '/academy/app/docente',
          admin: '/academy/app/admin',
          support: '/academy/app/admin',
        }
        navigate(safeRedirect || roleRoutes[profile?.role || ''] || '/academy/app/panel')
      } else {
        navigate(safeRedirect || '/academy/app/panel')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err) || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Crear tu cuenta</h1>
        <p className="mt-2 text-sm text-surface-500">
          ¿Ya tienes cuenta?{' '}
          <Link to={safeRedirect ? `/academy/app/acceder?redirect=${encodeURIComponent(safeRedirect)}` : '/academy/app/acceder'} className="font-medium text-primary-600 hover:text-primary-700">
            Accede aquí
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label htmlFor="fullName" className="label-field">Nombre completo</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder="Tu nombre"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="label-field">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="label-field">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-surface-400">
        Al registrarte, aceptas nuestros Términos y Política de Privacidad.
      </p>
    </div>
  )
}
