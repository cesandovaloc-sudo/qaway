import { useState } from 'react'
import { X, Save, Loader2, User, Building2, Search } from 'lucide-react'
import type { Customer, CustomerDocType, CustomerType } from '@/types'
import { docTypeOptions, isValidDocNumber, normalizeDocNumber } from '@/utils/fiscal'
import { customerService } from '@/services/customerService'

interface CustomerFormProps {
  customer?: Customer
  onSave: (data: Omit<Customer, 'id' | 'created_at'>) => Promise<void>
  onClose: () => void
}

const typeOptions: { value: CustomerType; label: string; icon: typeof User }[] = [
  { value: 'individual', label: 'Particular', icon: User },
  { value: 'company', label: 'Empresa', icon: Building2 },
  { value: 'wholesale', label: 'Mayorista', icon: User },
  { value: 'reseller', label: 'Revendedor', icon: User },
]

export function CustomerForm({ customer, onSave, onClose }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    company: customer?.company || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    type: (customer?.type || 'individual') as CustomerType,
    doc_type: (customer?.doc_type || 'SIN_DOC') as CustomerDocType,
    doc_number: customer?.doc_number || '',
    fiscal_name: customer?.fiscal_name || '',
    address: customer?.address || '',
    notes: customer?.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lookingUp, setLookingUp] = useState(false)
  const [lookupInfo, setLookupInfo] = useState<string | null>(null)

  const canLookup = formData.doc_type === 'DNI' || formData.doc_type === 'RUC'

  const handleLookup = async () => {
    if (!canLookup || !formData.doc_number.trim()) {
      setError('Ingresa un número de documento para consultar en SUNAT')
      return
    }
    const docNumber = normalizeDocNumber(formData.doc_number)
    if (!isValidDocNumber(formData.doc_type, docNumber)) {
      setError(`El ${formData.doc_type} ingresado no es válido`)
      return
    }

    try {
      setLookingUp(true)
      setError(null)
      setLookupInfo(null)
      const result = await customerService.lookupFiscalDoc(formData.doc_type, docNumber)
      setFormData(prev => ({
        ...prev,
        doc_number: docNumber,
        fiscal_name: result.fiscal_name,
        address: result.address || prev.address,
        // Si aún no hay nombre comercial, usa el nombre legal como sugerencia
        name: prev.name.trim() ? prev.name : result.fiscal_name,
      }))
      setLookupInfo(`Datos obtenidos: ${result.fiscal_name}${result.address ? ` · ${result.address}` : ''}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar SUNAT')
    } finally {
      setLookingUp(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() && !formData.fiscal_name.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    const docNumber = normalizeDocNumber(formData.doc_number)
    const docType = formData.doc_type
    if (docType !== 'SIN_DOC' && docNumber && !isValidDocNumber(docType, docNumber)) {
      setError(`El número de ${docType} no es válido`)
      return
    }

    try {
      setSaving(true)
      setError(null)
      await onSave({
        name: formData.name.trim() || formData.fiscal_name.trim(),
        company: formData.company || null,
        email: formData.email || null,
        phone: formData.phone || null,
        type: formData.type,
        doc_type: docType === 'SIN_DOC' || !docNumber ? 'SIN_DOC' : docType,
        doc_number: docType === 'SIN_DOC' ? null : docNumber || null,
        fiscal_name: formData.fiscal_name.trim() || null,
        address: formData.address.trim() || null,
        extra_data: null,
        notes: formData.notes || null,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {customer ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          {lookupInfo && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {lookupInfo}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre del cliente"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de cliente
            </label>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: opt.value }))}
                  className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                    formData.type === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <opt.icon className="w-4 h-4" />
                  <span className="text-sm">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Documento fiscal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documento fiscal
            </label>
            <div className="grid grid-cols-[auto_1fr_auto] gap-2">
              <select
                value={formData.doc_type}
                onChange={(e) => {
                  const docType = e.target.value as CustomerDocType
                  setFormData(prev => ({ ...prev, doc_type: docType }))
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                {docTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={formData.doc_number}
                onChange={(e) => setFormData(prev => ({ ...prev, doc_number: e.target.value }))}
                placeholder={formData.doc_type === 'RUC' ? 'N° RUC (11 dígitos)' : formData.doc_type === 'DNI' ? 'N° DNI (8 dígitos)' : 'N° de documento'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleLookup}
                disabled={!canLookup || lookingUp || !formData.doc_number.trim()}
                title={canLookup ? 'Consultar en SUNAT' : 'Disponible para DNI y RUC'}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {lookingUp ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                SUNAT
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              DNI/RUC requeridos para facturar. El botón SUNAT autocompleta razón social y dirección.
            </p>
          </div>

          {/* Razón social / nombre legal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razón social / nombre legal
            </label>
            <input
              type="text"
              value={formData.fiscal_name}
              onChange={(e) => setFormData(prev => ({ ...prev, fiscal_name: e.target.value }))}
              placeholder="Lo que aparecerá en la boleta/factura"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección fiscal
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Domicilio fiscal"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Nombre de la empresa (opcional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@ejemplo.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+51 999 999 999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notas sobre el cliente..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {customer ? 'Actualizar' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
