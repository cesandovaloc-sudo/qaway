import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Mail, ArrowRight, ShieldCheck, User, Eye, EyeOff } from 'lucide-react'
import { getSupabaseClient } from '@/pages/5-qaway-hub/blog-editor/services/supabaseClient'

// Registro Hub: MISMO diseño del login (dos paneles), solo suma el campo
// Nombre hacia abajo. Crea la cuenta y continúa a /onboarding.
const CLIENT_LOGOS = [
  { name: 'Gelato Gourmet', initials: 'GG', color: 'bg-orange-500' },
  { name: 'Nóra Moda', initials: 'NM', color: 'bg-pink-500' },
  { name: 'Finix Soluciones', initials: 'FS', color: 'bg-blue-500' },
  { name: 'Lumina Estética', initials: 'LE', color: 'bg-purple-500' },
]

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState('')

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const rawRedirect = searchParams.get('redirect')
  const redirectTarget = (rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//'))
    ? rawRedirect
    : '/onboarding'

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) {
      setError('Escribe tu nombre.')
      return
    }
    if (password.length < 8) {
      setError('Mínimo 8 caracteres.')
      return
    }
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        setError('Servicio de autenticación no disponible.')
        return
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${window.location.origin}/login?verified=1`,
        },
      })
      if (error) throw error
      if (data.session) {
        // Ruta canónica (aprobado 2026-09-23): ?redirect= explícito gana SOLO si el
        // usuario ya tiene marca (invitado). Cuenta nueva sin marca → /onboarding.
        let target = rawRedirect || null
        try {
          const { data: me } = await supabase.from('users').select('tenant_id, is_platform_admin').eq('id', data.user.id).maybeSingle()
          if (!target) target = (me && me.tenant_id !== null) ? '/hub/panel' : '/onboarding'
        } catch (_) {
          target = target || '/onboarding'
        }
        navigate(target, { replace: true })
        return
      } else {
        navigate(`/login?registered=1&email=${encodeURIComponent(email.trim())}`, { replace: true })
      }
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuth(provider) {
    setError('')
    setOauthLoading(provider)
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        setError('Servicio de autenticación no disponible.')
        return
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}${redirectTarget}` },
      })
      if (error) throw error
    } catch (err) {
      setError(err.message || 'No se pudo continuar.')
    } finally {
      setOauthLoading('')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans">

      {/* ── Panel Izquierdo: Branding ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/40 via-zinc-900/10 to-zinc-950" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full" />

        <div className="relative z-10 max-w-lg p-12">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
            <span className="text-3xl font-black text-zinc-950">Q</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-6 leading-tight tracking-tight">
            Qaway Lab <br /><span className="text-zinc-500">Workspace</span>
          </h1>
          <p className="text-lg text-zinc-400 font-medium leading-relaxed">
            El ecosistema centralizado para la gestión de leads, automatización de marketing y operaciones comerciales de alto impacto.
          </p>

          {/* Proyectos activos — Prueba social */}
          <div className="mt-12">
            <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest mb-4">Proyectos activos</p>
            <div className="flex items-center gap-3 flex-wrap">
              {CLIENT_LOGOS.map((c) => (
                <div key={c.name} className="flex items-center gap-2 bg-zinc-800/60 border border-zinc-700/50 rounded-full px-3 py-1.5">
                  <div className={`w-5 h-5 rounded-full ${c.color} flex items-center justify-center`}>
                    <span className="text-white text-[9px] font-bold">{c.initials}</span>
                  </div>
                  <span className="text-zinc-300 text-xs font-medium">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex items-center gap-3 text-zinc-500 text-sm font-bold uppercase tracking-widest">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            Acceso Restringido · Encriptación E2E
          </div>
        </div>
      </div>

      {/* ── Panel Derecho: Formulario ─────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative bg-black">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />

        <div className="w-full max-w-md relative z-10">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-black text-white mb-2">Crear cuenta</h2>
            <p className="text-zinc-400">Únete al ecosistema de trabajo Qaway Lab.</p>
          </div>

          {/* Selector: Iniciar Sesión / Crear Cuenta */}
          <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800 mb-6">
            <Link
              to={redirectTarget !== '/onboarding' ? `/login?redirect=${encodeURIComponent(redirectTarget)}` : '/login'}
              className="flex-1 py-2.5 text-xs font-bold rounded-xl text-zinc-500 hover:text-white text-center"
            >
              Iniciar Sesión
            </Link>
            <button
              type="button"
              className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-white text-black shadow-sm"
            >
              Crear Cuenta
            </button>
          </div>

          {/* OAuth */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {oauthLoading === 'google' ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continuar con Google
            </button>
          </div>

          {/* Divisor */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-600 text-xs font-medium">o con correo</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Formulario nombre + correo + contraseña */}
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Nombre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-zinc-600" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all font-medium placeholder:text-zinc-600"
                  placeholder="Tu nombre"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-600" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all font-medium placeholder:text-zinc-600"
                  placeholder="ejemplo@qaway.pe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Contraseña
              </label>
<div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-zinc-600" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3.5 pl-12 pr-12 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all font-medium placeholder:text-zinc-600"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-600 hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Crear mi cuenta
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
