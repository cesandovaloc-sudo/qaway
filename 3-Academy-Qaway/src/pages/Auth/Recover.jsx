import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import supabase, { isSupabaseConfigured } from '@/lib/supabase'

export default function Recover() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f0d]">
        <div className="w-full max-w-sm px-6 text-center">
          <h1 className="text-xl font-bold text-white">Supabase no configurado</h1>
          <p className="mt-2 text-sm text-[#666860]">
            Crea un archivo <code className="text-[#ff4b0b]">.env</code> con las
            credenciales de Supabase para habilitar la recuperación.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block text-sm text-[#ff4b0b] hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const handleRecover = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/panel`,
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0f0d]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm px-6"
      >
        <Link
          to="/"
          className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#ff4b0b] hover:opacity-70 transition-opacity"
        >
          ← Qaway Academy
        </Link>

        {sent ? (
          <>
            <h1 className="mt-8 text-xl font-bold text-white">Revisa tu correo</h1>
            <p className="mt-2 text-sm text-[#666860]">
              Si existe una cuenta con <strong className="text-white">{email}</strong>,
              recibirás un enlace para restablecer tu contraseña.
            </p>
            <Link
              to="/acceder"
              className="mt-6 inline-block text-sm text-[#ff4b0b] hover:underline"
            >
              Volver a iniciar sesión
            </Link>
          </>
        ) : (
          <>
            <h1 className="mt-8 text-2xl font-bold text-white">Recuperar acceso</h1>
            <p className="mt-2 text-sm text-[#666860]">
              Te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <form onSubmit={handleRecover} className="mt-8 space-y-5">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm rounded-sm focus:outline-none focus:border-[#ff4b0b] transition-colors placeholder:text-white/20"
                  placeholder="tu@correo.com"
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-[#ff4b0b] text-white text-sm font-semibold rounded-sm hover:bg-[#e03e00] transition-all disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-[#666860]">
              <Link to="/acceder" className="hover:text-[#ff4b0b] transition-colors">
                Volver a inicio de sesión
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
