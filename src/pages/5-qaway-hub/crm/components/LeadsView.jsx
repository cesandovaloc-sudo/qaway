import { Users } from 'lucide-react'

export default function LeadsView() {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-black/5 p-8">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-[#ff4b0b]" />
        <h2 className="text-2xl font-bold tracking-tight text-[#191918]">Gestión de Leads</h2>
      </div>
      <p className="text-black/60 max-w-2xl">
        Aquí aparecerá el listado completo de leads capturados a través de tus canales (Web, WhatsApp, Ads).
        Próximamente conectaremos esta tabla con la base de datos de Supabase.
      </p>
    </div>
  )
}
