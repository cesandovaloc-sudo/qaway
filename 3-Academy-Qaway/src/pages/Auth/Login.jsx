import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import supabase, { isSupabaseConfigured } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f0d]">
        <div className="w-full max-w-sm px-6 text-center">
          <h1 className="text-xl font-bold text-white">Supabase no configurado</h1>
          <p className="mt-2 text-sm text-[#666860]">
            Crea un archivo <code className="text-[#ff4b0b]">.env</code> con las
            credenciales de Supabase para habilitar la autenticación.
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

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      // Redirect handled by Supabase listener or manual
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

        <h1 className="mt-8 text-2xl font-bold text-white">Acceder</h1>
        <p className="mt-2 text-sm text-[#666860]">
          Ingresa con tu correo y contraseña.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
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

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm rounded-sm focus:outline-none focus:border-[#ff4b0b] transition-colors placeholder:text-white/20"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-[#ff4b0b] text-white text-sm font-semibold rounded-sm hover:bg-[#e03e00] transition-all disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#666860]">
          <Link to="/recuperar" className="hover:text-[#ff4b0b] transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
          <span className="mx-2">·</span>
          <Link to="/registro" className="hover:text-[#ff4b0b] transition-colors">
            Crear cuenta
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
