import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, CheckCircle2 } from 'lucide-react'
import { getSupabaseClient } from '@/pages/5-qaway-hub/blog-editor/services/supabaseClient'

// Flujo /update-password (run SaaS): el link de recuperación de Supabase
// trae sesión de recovery; aquí el usuario fija su nueva contraseña.
// Sin sesión de recovery no se muestra el formulario.
export default function UpdatePasswordPage() {
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session))
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Mínimo 8 caracteres.')
      return
    }
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
    } catch (err) {
      setError(err.message || 'No se pudo actualizar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">Nueva contraseña</h1>
        {!ready ? (
          <p className="mt-4 text-sm text-zinc-400">
            Enlace inválido o vencido. Pide uno nuevo desde <Link to="/login" className="text-zinc-200 underline">ingresar</Link>.
          </p>
        ) : done ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 size={16} /> Lista. <Link to="/login" className="underline">Entrar al Hub</Link>
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400">
              Contraseña nueva
              <span className="relative mt-2 block">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3.5 pl-12 pr-4 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
                />
              </span>
            </label>
            {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white py-4 font-bold text-black transition-all hover:bg-zinc-200 disabled:opacity-70"
            >
              {loading ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
