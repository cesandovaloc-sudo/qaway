import { Link } from 'react-router-dom'
import { ArrowRight, BrainCircuit } from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'

export default function AgentesIAPage() {
  useSetNavbarVariant('dark')

  return (
    <main className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-[#ff4b0b] text-xs font-bold uppercase tracking-widest mb-4">
            <BrainCircuit className="w-4 h-4" />
            Agentes IA
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Asistentes inteligentes para tu equipo.
          </h1>
          <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
            Implementamos agentes de IA para apoyar tareas, producir contenido, atender clientes,
            analizar datos y ejecutar procesos digitales.
          </p>
          <Link
            to="/sistemas-digitales"
            className="mt-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            ← Volver a Sistemas Digitales
          </Link>
        </div>
      </div>
    </main>
  )
}
