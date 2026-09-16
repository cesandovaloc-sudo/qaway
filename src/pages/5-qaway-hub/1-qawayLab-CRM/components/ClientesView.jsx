import { Briefcase } from 'lucide-react'

export default function ClientesView() {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xs border border-black/5 p-8">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="w-6 h-6 text-[#ff4b0b]" />
        <h2 className="text-2xl font-bold tracking-tight text-[#191918]">Cartera de Clientes</h2>
      </div>
      <p className="text-black/60 max-w-2xl">
        Base de datos de todos los clientes activos e inactivos. Aquí podrás ver el historial completo
        de facturación, servicios activos y su ciclo de vida.
      </p>
    </div>
  )
}
