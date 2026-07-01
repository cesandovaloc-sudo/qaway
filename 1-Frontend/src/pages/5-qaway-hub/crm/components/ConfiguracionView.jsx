import { Settings2 } from 'lucide-react'

export default function ConfiguracionView() {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-black/5 p-8">
      <div className="flex items-center gap-3 mb-6">
        <Settings2 className="w-6 h-6 text-[#ff4b0b]" />
        <h2 className="text-2xl font-bold tracking-tight text-[#191918]">Configuración del CRM</h2>
      </div>
      <p className="text-black/60 max-w-2xl">
        Ajustes del perfil, configuración de notificaciones, usuarios, permisos y plantillas del embudo.
      </p>
    </div>
  )
}
