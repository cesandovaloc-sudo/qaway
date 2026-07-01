import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        sessionStorage.setItem('qaway_auth_token', data.token)
        navigate('/hub/crm')
      } else {
        setError(data.error || 'Credenciales incorrectas.')
        setLoading(false)
      }
    } catch (err) {
      setError('Error de conexión con el servidor. Verifica que el backend esté corriendo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans">
      {/* Lado Izquierdo: Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 items-center justify-center overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/40 via-zinc-900/10 to-zinc-950"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-green-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 max-w-lg p-12">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
            <span className="text-3xl font-black text-zinc-950">Q</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-6 leading-tight tracking-tight">
            Qaway Lab <br/> <span className="text-zinc-500">Workspace</span>
          </h1>
          <p className="text-lg text-zinc-400 font-medium leading-relaxed">
            El ecosistema centralizado para la gestión de leads, automatización de marketing y operaciones comerciales de alto impacto.
          </p>

          <div className="mt-12 flex items-center gap-4 text-zinc-500 text-sm font-bold uppercase tracking-widest">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            Acceso Restringido
          </div>
        </div>
      </div>

      {/* Lado Derecho: Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative bg-black">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-white mb-2">Iniciar Sesión</h2>
            <p className="text-zinc-400">Ingresa tus credenciales para acceder al sistema.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-600" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all font-medium placeholder-zinc-600"
                  placeholder="ejemplo@qaway.pe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-600" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all font-medium placeholder-zinc-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Ingresar al Hub
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-zinc-600 font-medium">
              V1.0 - Plataforma protegida por encriptación de extremo a extremo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
