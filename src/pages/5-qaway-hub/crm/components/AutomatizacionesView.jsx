import { Zap } from 'lucide-react'

export default function AutomatizacionesView() {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-black/5 p-8">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-[#ff4b0b]" />
        <h2 className="text-2xl font-bold tracking-tight text-[#191918]">Automatizaciones e IA</h2>
      </div>
      <p className="text-black/60 max-w-2xl">
        Centro de control de webhooks, integraciones externas e Inteligencia Artificial (Agentes de asignación y respuestas automáticas).
      </p>
    </div>
  )
}
