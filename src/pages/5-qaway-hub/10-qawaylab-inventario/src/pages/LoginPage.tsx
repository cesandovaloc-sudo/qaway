import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock, LogIn, Mail, Package } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { setPageMeta } from '@/utils/seo'

export default function LoginPage() {
  const { session, loading, signIn, signInWithOAuth, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setPageMeta({ title: 'Iniciar sesión | Inventario Qaway', robots: 'noindex' })
  }, [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Subflujo de recuperación de contraseña
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

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

  const handleOAuth = async () => {
    setOauthLoading(true)
    setError(null)
    try {
      await signInWithOAuth('google')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con Google.')
    } finally {
      setOauthLoading(false)
    }
  }

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!resetEmail.trim()) return
    setResetLoading(true)
    setError(null)
    try {
      await resetPassword(resetEmail.trim())
      setResetSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el correo de recuperación.')
    } finally {
      setResetLoading(false)
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
          {showReset ? (
            /* ── Modo: Recuperación de Contraseña ── */
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => { setShowReset(false); setResetSent(false); setError(null) }}
                className="text-xs font-medium text-muted hover:text-ink flex items-center gap-1.5 transition-colors"
              >
                ← Volver al inicio de sesión
              </button>

              <div>
                <h2 className="font-display text-lg font-semibold text-ink">Recuperar acceso</h2>
                <p className="text-xs text-muted mt-1">
                  Te enviaremos un enlace a tu correo para restablecer tu contraseña.
                </p>
              </div>

              {resetSent ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg p-4 leading-relaxed text-center font-medium">
                  ✓ Correo enviado con éxito. Revisa tu bandeja de entrada.
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="resetEmail" className="block text-xs font-medium text-ink mb-1.5">
                      Correo registrado
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        id="resetEmail"
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="admin@qawaylab.com"
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
                    disabled={resetLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-light disabled:opacity-60 transition-colors"
                  >
                    {resetLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                    {resetLoading ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ── Modo Principal: Inicio de Sesión ── */
            <>
              <div className="mb-6">
                <h2 className="font-display text-lg font-semibold text-ink">Iniciar sesión</h2>
                <p className="text-sm text-muted mt-1">
                  Acceso restringido al equipo autorizado.
                </p>
              </div>

              {/* Botón Google OAuth */}
              <button
                type="button"
                onClick={handleOAuth}
                disabled={oauthLoading}
                className="w-full flex items-center justify-center gap-2.5 bg-surface hover:bg-surface-muted border border-surface-muted text-ink font-medium py-2.5 px-4 rounded-lg transition-all text-xs active:scale-[0.99] disabled:opacity-60 mb-4"
              >
                {oauthLoading ? (
                  <Loader2 size={16} className="animate-spin text-brand" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continuar con Google
              </button>

              <div className="relative flex py-1 items-center mb-4">
                <div className="flex-grow border-t border-surface-muted"></div>
                <span className="flex-shrink mx-3 text-[10px] font-semibold text-muted uppercase tracking-wider">o con correo</span>
                <div className="flex-grow border-t border-surface-muted"></div>
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
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-surface rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 border border-transparent transition-shadow"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1 focus:outline-none"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Fila: Recordarme + Olvidé mi contraseña */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-muted select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-surface-muted text-brand focus:ring-brand/20 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Recordarme</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setShowReset(true); setError(null) }}
                    className="text-brand hover:underline font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
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

              {/* Sello de Seguridad */}
              <div className="pt-4 text-center">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  Acceso Seguro · Encriptación SSL/TLS
                </span>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Qaway Lab · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
