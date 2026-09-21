import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Eye, EyeOff, GraduationCap, Loader2, Lock, LogIn, Mail } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { isSuperAdmin } from '../../../../../../config/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const { signIn, signInWithOAuth } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')
  const safeRedirect = redirect?.startsWith('/') ? redirect : null
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cleanEmail = email.trim()
      const data = await signIn(cleanEmail, password)
      const userObj = data?.user

      if (isSuperAdmin(cleanEmail) || (userObj?.email && isSuperAdmin(userObj.email))) {
        navigate(safeRedirect || '/academy/app/admin', { replace: true })
        return
      }

      const userId = userObj?.id
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
        navigate(safeRedirect || roleRoutes[profile?.role || ''] || '/academy/app/panel', { replace: true })
      } else {
        navigate(safeRedirect || '/academy/app/panel', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err) || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuth() {
    setOauthLoading(true)
    setError('')
    try {
      await signInWithOAuth('google')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con Google.')
    } finally {
      setOauthLoading(false)
    }
  }

  return (
    <div>
      {/* Encabezado con Icono Badge de Academy */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff4b0b] to-[#df3900] inline-flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[#ff4b0b]/25 mb-4">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Inicia sesión</h1>
        <p className="mt-1 text-sm text-surface-500">
          Accede a tus cursos, lecciones y certificaciones
        </p>
      </div>

      {/* Card Principal */}
      <div className="bg-white rounded-3xl border border-surface-200/80 shadow-xl shadow-slate-200/50 p-8 space-y-6">
        {/* Selector Píldora: Iniciar Sesión / Crear Cuenta */}
        <div className="flex bg-surface-100 p-1 rounded-2xl border border-surface-200">
          <button
            type="button"
            className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-white text-[#ff4b0b] shadow-sm transition-all"
          >
            Iniciar Sesión
          </button>
          <Link
            to={safeRedirect ? `/academy/app/registro?redirect=${encodeURIComponent(safeRedirect)}` : '/academy/app/registro'}
            className="flex-1 py-2.5 text-xs font-bold rounded-xl text-surface-500 hover:text-surface-900 text-center transition-all"
          >
            Crear Cuenta
          </Link>
        </div>

        {/* Botón Google OAuth */}
        <button
          type="button"
          onClick={handleOAuth}
          disabled={oauthLoading}
          className="w-full flex items-center justify-center gap-2.5 bg-surface-50 hover:bg-surface-100/80 border border-surface-200 text-surface-800 font-semibold py-3 rounded-xl transition-all text-xs active:scale-[0.99] disabled:opacity-60"
        >
          {oauthLoading ? (
            <span className="w-4 h-4 border-2 border-[#ff4b0b] border-t-transparent rounded-full animate-spin" />
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

        <div className="relative flex py-0.5 items-center">
          <div className="flex-grow border-t border-surface-200"></div>
          <span className="flex-shrink mx-3 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">o con correo</span>
          <div className="flex-grow border-t border-surface-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 leading-relaxed">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-surface-700 mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff4b0b] focus:bg-white transition-all text-surface-900"
                placeholder="tu@correo.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-surface-700 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-[#ff4b0b] focus:bg-white transition-all text-surface-900"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-1 focus:outline-none"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Fila: Recordarme + Olvidé mi contraseña */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-surface-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-surface-300 text-[#ff4b0b] focus:ring-[#ff4b0b]/20 w-3.5 h-3.5 cursor-pointer"
              />
              <span>Recordarme</span>
            </label>
            <Link
              to="/academy/app/recuperar"
              className="text-[#ff4b0b] hover:underline font-semibold"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#ff4b0b] to-[#df3900] hover:from-[#e0430a] hover:to-[#c63300] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#ff4b0b]/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] text-sm"
          >
            <LogIn className="w-4 h-4" /> {loading ? 'Iniciando sesión...' : 'Acceder al aula'}
          </button>
        </form>

        {/* Sello de Seguridad */}
        <div className="pt-2 text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-surface-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Acceso Seguro · Encriptación SSL/TLS
          </span>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-surface-400">
        Al acceder, aceptas nuestros Términos de Servicio y Privacidad.
      </p>
    </div>
  )
}
