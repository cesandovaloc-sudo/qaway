import { ArrowLeftRight } from 'lucide-react'

export default function MovementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">Movimientos</h1>
        <p className="text-sm text-muted mt-1">Historial de entradas, salidas y ajustes.</p>
      </div>
      <div className="bg-white rounded-xl border border-surface-muted p-12 text-center">
        <ArrowLeftRight size={40} className="mx-auto text-muted-light mb-3" />
        <p className="text-sm text-muted">Próximamente.</p>
      </div>
    </div>
  )
}
