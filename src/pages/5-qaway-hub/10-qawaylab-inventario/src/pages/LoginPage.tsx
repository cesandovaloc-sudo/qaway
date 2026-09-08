import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, Lock, LogIn, Mail, Package } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { setPageMeta } from '@/utils/seo'

export default function LoginPage() {
  const { session, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setPageMeta({ title: 'Iniciar sesión | Inventario Qaway', robots: 'noindex' })
  }, [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/'

  // Esperar restauración de sesión persistida
  if (loading) return null

  // Ya autenticado → ir al destino
  if (session) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await signIn(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Decoración sutil de fondo */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-brand/5 blur-3xl" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-brand flex items-center justify-center shadow-card">
            <Package size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-ink tracking-tight">
              Inventario Qaway
            </h1>
            <p className="text-xs text-muted">Sistema de inventario y liquidación</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-surface-muted shadow-card p-8">
          <div className="mb-6">
            <h2 className="font-display text-lg font-semibold text-ink">Iniciar sesión</h2>
            <p className="text-sm text-muted mt-1">
              Acceso restringido al equipo autorizado.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-ink mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@qawaylab.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-surface rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 border border-transparent transition-shadow"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-ink mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-surface rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 border border-transparent transition-shadow"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-light disabled:opacity-60 transition-colors"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {submitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Qaway Lab · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
