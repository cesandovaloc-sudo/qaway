import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, GraduationCap, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Recover() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/academy/app/acceder`,
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err) || 'Error al enviar el correo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff4b0b] to-[#df3900] inline-flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[#ff4b0b]/25 mb-4">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Recuperar acceso</h1>
        <p className="mt-1 text-sm text-surface-500">
          Te enviaremos un enlace a tu correo para restablecer tu contraseña
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-surface-200/80 shadow-xl shadow-slate-200/50 p-8 space-y-6">
        <Link
          to="/academy/app/acceder"
          className="text-xs font-semibold text-surface-500 hover:text-surface-900 flex items-center gap-1.5 transition-colors"
        >
          ← Volver al inicio de sesión
        </Link>

        {sent ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl p-4 leading-relaxed text-center font-medium">
            ✓ Si existe una cuenta asociada a <strong>{email}</strong>, recibirás un enlace de recuperación en los próximos minutos.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 leading-relaxed">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-surface-700 mb-1.5">
                Correo registrado
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#ff4b0b] to-[#df3900] hover:from-[#e0430a] hover:to-[#c63300] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#ff4b0b]/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] text-sm"
            >
              {loading ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}
            </button>
          </form>
        )}

        <div className="pt-2 text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-surface-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Acceso Seguro · Encriptación SSL/TLS
          </span>
        </div>
      </div>
    </div>
  )
}
