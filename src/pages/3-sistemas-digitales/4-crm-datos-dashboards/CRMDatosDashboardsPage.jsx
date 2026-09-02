import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3 } from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'

export default function CRMDatosDashboardsPage() {
  useSetNavbarVariant('dark')

  return (
    <main className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-[#fe6612] text-xs font-bold uppercase tracking-widest mb-4">
            <BarChart3 className="w-4 h-4" />
            CRM, Datos y Dashboards
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Controla clientes y decisiones con datos.
          </h1>
          <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
            Ordenamos clientes, leads, oportunidades y procesos comerciales con CRM, pipelines
            y tableros para que tomes decisiones con información clara.
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
