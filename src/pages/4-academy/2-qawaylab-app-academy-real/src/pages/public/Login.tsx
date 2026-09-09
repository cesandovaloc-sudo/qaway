import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')
  const safeRedirect = redirect?.startsWith('/') ? redirect : null

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await signIn(email, password)
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
      setError(err instanceof Error ? err.message : String(err) || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Acceder a tu cuenta</h1>
        <p className="mt-2 text-sm text-surface-500">
          ¿No tienes cuenta?{' '}
          <Link to={safeRedirect ? `/academy/app/registro?redirect=${encodeURIComponent(safeRedirect)}` : '/academy/app/registro'} className="font-medium text-primary-600 hover:text-primary-700">
            Regístrate aquí
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
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="label-field mb-0">Contraseña</label>
              <Link to="/academy/app/recuperar" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Iniciando sesión...' : 'Acceder'}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-surface-400">
        Al acceder, aceptas nuestros Términos y Política de Privacidad.
      </p>
    </div>
  )
}
