import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import supabase, { isSupabaseConfigured } from '@/lib/supabase'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f0d]">
        <div className="w-full max-w-sm px-6 text-center">
          <h1 className="text-xl font-bold text-white">Supabase no configurado</h1>
          <p className="mt-2 text-sm text-[#666860]">
            Crea un archivo <code className="text-[#ff4b0b]">.env</code> con las
            credenciales de Supabase para habilitar el registro.
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

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })
      if (error) throw error
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f0d]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm px-6 text-center"
        >
          <div className="w-12 h-12 mx-auto bg-[#ff4b0b]/10 text-[#ff4b0b] flex items-center justify-center text-xl">
            ✓
          </div>
          <h1 className="mt-6 text-xl font-bold text-white">Revisa tu correo</h1>
          <p className="mt-2 text-sm text-[#666860]">
            Te enviamos un enlace de confirmación a <strong className="text-white">{email}</strong>.
          </p>
          <Link
            to="/acceder"
            className="mt-6 inline-block text-sm text-[#ff4b0b] hover:underline"
          >
            Ir a iniciar sesión
          </Link>
        </motion.div>
      </div>
    )
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

        <h1 className="mt-8 text-2xl font-bold text-white">Crear cuenta</h1>
        <p className="mt-2 text-sm text-[#666860]">
          Únete a Qaway Academy y empieza a aprender.
        </p>

        <form onSubmit={handleRegister} className="mt-8 space-y-5">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Nombre completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm rounded-sm focus:outline-none focus:border-[#ff4b0b] transition-colors placeholder:text-white/20"
              placeholder="Tu nombre"
            />
          </div>

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
              minLength={6}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm rounded-sm focus:outline-none focus:border-[#ff4b0b] transition-colors placeholder:text-white/20"
              placeholder="Mínimo 6 caracteres"
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
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#666860]">
          ¿Ya tienes cuenta?{' '}
          <Link to="/acceder" className="text-[#ff4b0b] hover:underline">
            Inicia sesión
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
