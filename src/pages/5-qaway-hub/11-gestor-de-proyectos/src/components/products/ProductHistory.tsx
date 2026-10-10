import { ArrowDown, ArrowUp, ArrowLeftRight, RotateCcw, ShoppingCart, Bookmark } from 'lucide-react'
import type { InventoryMovement } from '@/types'

interface ProductHistoryProps {
  movements: InventoryMovement[]
}

const movementConfig: Record<string, { icon: typeof ArrowDown; label: string; color: string; bgColor: string }> = {
  entry: { icon: ArrowDown, label: 'Entrada', color: 'text-green-600', bgColor: 'bg-green-100' },
  exit: { icon: ArrowUp, label: 'Salida', color: 'text-red-600', bgColor: 'bg-red-100' },
  transfer: { icon: ArrowLeftRight, label: 'Transferencia', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  adjustment: { icon: RotateCcw, label: 'Ajuste', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  sale: { icon: ShoppingCart, label: 'Venta', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  reservation: { icon: Bookmark, label: 'Reserva', color: 'text-orange-600', bgColor: 'bg-orange-100' },
}

export function ProductHistory({ movements }: ProductHistoryProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (movements.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Historial</h3>
        <p className="text-sm text-gray-500 text-center py-4">
          No hay movimientos registrados
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Historial de movimientos</h3>
      
      <div className="space-y-3">
        {movements.map((movement) => {
          const config = movementConfig[movement.type] || movementConfig.adjustment
          const Icon = config.icon

          return (
            <div
              key={movement.id}
              className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className={`p-2 rounded-lg ${config.bgColor}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${config.color}`}>{config.label}</span>
                  <span className="text-sm text-gray-500">
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity} unidades
                  </span>
                </div>
                
                {movement.notes && (
                  <p className="text-sm text-gray-600 mt-1">{movement.notes}</p>
                )}
                
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(movement.created_at)}
                  {movement.created_by && ` • Por: ${movement.created_by}`}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
