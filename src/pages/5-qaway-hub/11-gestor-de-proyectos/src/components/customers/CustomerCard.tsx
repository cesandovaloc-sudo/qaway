import { Building2, User, Edit2, Trash2, Mail, Phone, FileText } from 'lucide-react'
import type { Customer } from '@/types'
import { customerTypeConfig, docTypeConfig } from '@/services/customerService'

interface CustomerCardProps {
  customer: Customer
  onEdit?: (customer: Customer) => void
  onDelete?: (customer: Customer) => void
  onView?: (customer: Customer) => void
}

export function CustomerCard({ customer, onEdit, onDelete, onView }: CustomerCardProps) {
  const typeConfig = customerTypeConfig[customer.type] || customerTypeConfig.individual

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            {customer.type === 'company' ? (
              <Building2 className="w-5 h-5 text-blue-600" />
            ) : (
              <User className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 line-clamp-1">{customer.name}</h3>
            {customer.company && (
              <p className="text-xs text-gray-500">{customer.company}</p>
            )}
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeConfig.color} ${typeConfig.bgColor}`}>
          {typeConfig.label}
        </span>
      </div>

      {/* Documento fiscal */}
      {customer.doc_number && (
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{customer.doc_number}</span>
          {customer.doc_type && customer.doc_type !== 'SIN_DOC' && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${docTypeConfig[customer.doc_type]?.color || 'text-gray-500'} ${docTypeConfig[customer.doc_type]?.bgColor || 'bg-gray-100'}`}>
              {docTypeConfig[customer.doc_type]?.label || customer.doc_type}
            </span>
          )}
        </div>
      )}
      {customer.fiscal_name && customer.fiscal_name !== customer.name && (
        <p className="text-xs text-gray-500 mb-2">{customer.fiscal_name}</p>
      )}

      {/* Contact Info */}
      <div className="space-y-1 mb-4">
        {customer.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        {customer.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{customer.phone}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {customer.notes && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{customer.notes}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {onView && (
          <button
            onClick={() => onView(customer)}
            className="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Ver
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(customer)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(customer)}
            className="flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
