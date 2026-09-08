import { FileText, Edit2, Trash2, Eye, Send, Check, X, Download } from 'lucide-react'
import type { Quotation } from '@/types'
import { statusConfig } from '@/services/quotationService'

interface QuotationCardProps {
  quotation: Quotation & { customer?: { name: string; company?: string } }
  onEdit?: (quotation: Quotation) => void
  onDelete?: (quotation: Quotation) => void
  onView?: (quotation: Quotation) => void
  onStatusChange?: (quotation: Quotation, status: Quotation['status']) => void
  onExportPDF?: (quotation: Quotation) => void
  exportingPDF?: boolean
}

export function QuotationCard({ quotation, onEdit, onDelete, onView, onStatusChange, onExportPDF, exportingPDF }: QuotationCardProps) {
  const status = statusConfig[quotation.status] || statusConfig.draft

  const formatDate = (date: string | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Cotización</h3>
            <p className="text-xs text-gray-500">
              {quotation.customer?.name || 'Sin cliente'}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color} ${status.bgColor}`}>
          {status.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Fecha:</span>
          <span className="text-gray-900">{formatDate(quotation.created_at)}</span>
        </div>
        {quotation.valid_until && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Válida hasta:</span>
            <span className="text-gray-900">{formatDate(quotation.valid_until)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Subtotal:</span>
          <span className="text-gray-900">S/ {(quotation.subtotal || 0).toFixed(2)}</span>
        </div>
        {quotation.discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Descuento:</span>
            <span className="text-red-600">-S/ {quotation.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm font-semibold pt-2 border-t">
          <span className="text-gray-700">Total:</span>
          <span className="text-gray-900">S/ {(quotation.total || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Notes */}
      {quotation.notes && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{quotation.notes}</p>
      )}

      {/* Quick Actions */}
      {quotation.status === 'draft' && onStatusChange && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => onStatusChange(quotation, 'sent')}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Send className="w-4 h-4" />
            Enviar
          </button>
        </div>
      )}

      {quotation.status === 'sent' && onStatusChange && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => onStatusChange(quotation, 'accepted')}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Check className="w-4 h-4" />
            Aceptar
          </button>
          <button
            onClick={() => onStatusChange(quotation, 'rejected')}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4" />
            Rechazar
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {onView && (
          <button
            onClick={() => onView(quotation)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver
          </button>
        )}
        {onExportPDF && (
          <button
            onClick={() => onExportPDF(quotation)}
            disabled={exportingPDF}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
            title="Exportar a PDF"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(quotation)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(quotation)}
            className="flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
