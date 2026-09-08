import { useState } from 'react'
import { Link, X, Copy, Check, Calendar, Users, Shield } from 'lucide-react'
import type { UserPermissions } from '@/types/user'
import { sharedAccessService } from '@/services/userService'

interface SharedLinkFormProps {
  onClose: () => void
  onCreated?: (url: string) => void
}

export function SharedLinkForm({ onClose, onCreated }: SharedLinkFormProps) {
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    expiresInHours: 72, // 3 days default
    maxUses: 10,
    unlimitedUses: false,
  })

  const [permissions, setPermissions] = useState<Partial<UserPermissions>>({
    can_set_purchase_price: true,
    can_upload_photos: false,
    can_add_notes: true,
    can_view_products: true,
    can_view_prices: true,
    can_view_only_assigned: false,
  })

  const [creating, setCreating] = useState(false)
  const [createdUrl, setCreatedUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    try {
      setCreating(true)
      const link = await sharedAccessService.createLink({
        guestName: formData.guestName || undefined,
        guestEmail: formData.guestEmail || undefined,
        permissions,
        expiresInHours: formData.unlimitedUses ? undefined : formData.expiresInHours,
        maxUses: formData.unlimitedUses ? undefined : formData.maxUses,
      })

      const url = `${window.location.origin}/acceso/${link.token}`
      setCreatedUrl(url)
      if (onCreated) onCreated(url)
    } catch (err) {
      console.error('Error creating link:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleCopy = async () => {
    if (!createdUrl) return
    try {
      await navigator.clipboard.writeText(createdUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying:', err)
    }
  }

  if (createdUrl) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-md p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Enlace creado</h2>
            <p className="text-sm text-gray-500 mt-1">
              Comparte este enlace con el invitado
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 break-all font-mono">{createdUrl}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar enlace
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Crear enlace compartido</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Guest Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Información del invitado
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                  placeholder="Nombre del invitado"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email (opcional)</label>
                <input
                  type="email"
                  value={formData.guestEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
                  placeholder="email@ejemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Expiration */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Vigencia
            </h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.unlimitedUses}
                  onChange={(e) => setFormData(prev => ({ ...prev, unlimitedUses: e.target.checked }))}
                  className="w-4 h-4 text-orange-600 rounded"
                />
                <span className="text-sm text-gray-600">Sin límite de tiempo</span>
              </label>
            </div>
            {!formData.unlimitedUses && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Expira en (horas)</label>
                  <input
                    type="number"
                    value={formData.expiresInHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiresInHours: parseInt(e.target.value) || 24 }))}
                    min={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Máximo de usos</label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUses: parseInt(e.target.value) || 1 }))}
                    min={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Permisos
            </h3>
            <div className="space-y-2">
              <PermissionToggle
                label="Ver productos"
                description="Puede ver el inventario"
                checked={permissions.can_view_products ?? true}
                onChange={(v) => setPermissions(prev => ({ ...prev, can_view_products: v }))}
              />
              <PermissionToggle
                label="Ver precios"
                description="Puede ver los precios"
                checked={permissions.can_view_prices ?? true}
                onChange={(v) => setPermissions(prev => ({ ...prev, can_view_prices: v }))}
              />
              <PermissionToggle
                label="Colocar precio de compra"
                description="Puede ingresar precio de compra"
                checked={permissions.can_set_purchase_price ?? false}
                onChange={(v) => setPermissions(prev => ({ ...prev, can_set_purchase_price: v }))}
              />
              <PermissionToggle
                label="Subir fotos"
                description="Puede agregar fotos a productos"
                checked={permissions.can_upload_photos ?? false}
                onChange={(v) => setPermissions(prev => ({ ...prev, can_upload_photos: v }))}
              />
              <PermissionToggle
                label="Agregar notas"
                description="Puede agregar notas a productos"
                checked={permissions.can_add_notes ?? true}
                onChange={(v) => setPermissions(prev => ({ ...prev, can_add_notes: v }))}
              />
              <PermissionToggle
                label="Solo productos asignados"
                description="Solo ve productos específicos"
                checked={permissions.can_view_only_assigned ?? false}
                onChange={(v) => setPermissions(prev => ({ ...prev, can_view_only_assigned: v }))}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              {creating ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Link className="w-4 h-4" />
              )}
              Crear enlace
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Permission Toggle ──
function PermissionToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-orange-600' : 'bg-gray-300'}`}>
          <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-1 ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
        </div>
      </div>
    </label>
  )
}
