import { useState } from 'react'
import { Link, Copy, Check, Trash2, Clock, Users, Shield } from 'lucide-react'
import type { SharedAccessLink } from '@/types/user'

interface SharedLinkCardProps {
  link: SharedAccessLink
  onDelete?: (link: SharedAccessLink) => void
}

export function SharedLinkCard({ link, onDelete }: SharedLinkCardProps) {
  const [copied, setCopied] = useState(false)

  const url = `${window.location.origin}/acceso/${link.token}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying:', err)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isExpired = link.expires_at && new Date(link.expires_at) < new Date()
  const isMaxedOut = link.max_uses && link.use_count >= link.max_uses

  const getStatus = () => {
    if (!link.is_active) return { label: 'Inactivo', color: 'text-gray-600 bg-gray-100' }
    if (isExpired) return { label: 'Expirado', color: 'text-red-600 bg-red-100' }
    if (isMaxedOut) return { label: 'Agotado', color: 'text-yellow-600 bg-yellow-100' }
    return { label: 'Activo', color: 'text-green-600 bg-green-100' }
  }

  const status = getStatus()

  // Get active permissions
  const activePermissions = Object.entries(link.permissions)
    .filter(([, value]) => value === true)
    .map(([key]) => key.replace('can_', '').replace(/_/g, ' '))

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Link className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{link.guest_name || 'Sin nombre'}</p>
            {link.guest_email && (
              <p className="text-xs text-gray-500">{link.guest_email}</p>
            )}
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{link.use_count}{link.max_uses ? ` / ${link.max_uses}` : ''} usos</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{link.expires_at ? formatDate(link.expires_at) : 'Sin expiración'}</span>
        </div>
      </div>

      {/* Permissions */}
      {activePermissions.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Permisos:
          </p>
          <div className="flex flex-wrap gap-1">
            {activePermissions.slice(0, 4).map((perm, i) => (
              <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full capitalize">
                {perm}
              </span>
            ))}
            {activePermissions.length > 4 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{activePermissions.length - 4} más
              </span>
            )}
          </div>
        </div>
      )}

      {/* URL */}
      <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-500 truncate font-mono">
        {url}
      </div>

      {/* Created */}
      <p className="text-xs text-gray-400 mb-3">
        Creado: {formatDate(link.created_at)}
        {link.last_used_at && ` • Último uso: ${formatDate(link.last_used_at)}`}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar
            </>
          )}
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(link)}
            className="flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
