import { Outlet, useSearchParams } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import QawayCleanLoader from '@/components/ui/QawayCleanLoader'

// Logos de proyectos activos (prueba social)
const CLIENT_LOGOS = [
  { name: 'Gelato Gourmet', initials: 'GG', color: 'bg-orange-500' },
  { name: 'Nóra Moda', initials: 'NM', color: 'bg-pink-500' },
  { name: 'Finix Soluciones', initials: 'FS', color: 'bg-blue-500' },
  { name: 'Lumina Estética', initials: 'LE', color: 'bg-purple-500' },
]

export default function AuthShell() {
  const [searchParams] = useSearchParams()
  const isVerified = searchParams.get('verified') === '1'
  const hasAuthHash = typeof window !== 'undefined' && window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('type=signup'))

  // Si el usuario viene de confirmar su correo, mostramos pantalla limpia con el
  // mismo fondo neutro de onboarding (#f7f7f8) sin mostrar el panel oscuro de login.
  if (isVerified || hasAuthHash) {
    return (
      <div className="min-h-screen w-full bg-[#f7f7f8] flex items-center justify-center">
        <QawayCleanLoader fullScreen={false} />
        <div className="hidden"><Outlet /></div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-zinc-950 flex font-sans">

      {/* ── Panel Izquierdo: Branding ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative bg-zinc-900 items-center justify-center overflow-hidden">
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
      <div className="w-full lg:w-1/2 h-full flex overflow-y-auto relative bg-black p-8 sm:p-12">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />

        <div className="w-full max-w-md relative z-10 m-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}