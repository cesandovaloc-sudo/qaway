import { MapPin } from 'lucide-react'

export default function LocationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">Ubicaciones</h1>
        <p className="text-sm text-muted mt-1">Administra las ubicaciones de tu inventario.</p>
      </div>
      <div className="bg-white rounded-xl border border-surface-muted p-12 text-center">
        <MapPin size={40} className="mx-auto text-muted-light mb-3" />
        <p className="text-sm text-muted">Próximamente.</p>
      </div>
    </div>
  )
}
