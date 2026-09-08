import React, { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock, Loader2, HeartPulse } from 'lucide-react'
import { useClinica } from '../context/ClinicaContext'

export default function LoginPage() {
  const { signIn, showToast } = useClinica()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: err } = await signIn(email, password)
    setLoading(false)
    if (err) {
      setError('Credenciales inválidas. Verifica tu email y contraseña.')
      return
    }
    showToast('¡Bienvenido de nuevo!')
    navigate('/panel')
  }

  return (
    <div className="min-h-dvh bg-[#111111] text-white flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-[#ff4b0b] items-center justify-center mb-4">
            <HeartPulse className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black">Qaway Lab · Clínica</h1>
          <p className="text-white/40 text-sm mt-1">Panel de tu clínica</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#18181b] border border-white/10 rounded-2xl p-8 space-y-4">
          <div>
            <label className="text-xs text-white/40 font-bold mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@clinica.com"
                className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#ff4b0b] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 font-bold mb-1.5 block">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#ff4b0b] transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-[#ff4b0b] hover:bg-[#ff5c1f] disabled:opacity-50 font-bold rounded-xl py-3.5 text-sm transition-all inline-flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            Entrar al panel
          </button>

          <p className="text-center text-[11px] text-white/30 pt-2">
            ¿No tienes cuenta? Crea el usuario en Supabase Auth (Users → Add user) y entra.
          </p>
        </form>

        <p className="text-center mt-6">
          <Link to="/" className="text-xs text-white/40 hover:text-white transition-colors">← Volver al inicio</Link>
        </p>
      </motion.div>
    </div>
  )
}
