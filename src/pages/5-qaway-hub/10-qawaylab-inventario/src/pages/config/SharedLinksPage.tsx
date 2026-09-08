import { useState, useEffect } from 'react'
import { Link, Plus, Loader2, AlertCircle } from 'lucide-react'
import { sharedAccessService } from '@/services/userService'
import { SharedLinkCard } from '@/components/shared/SharedLinkCard'
import { SharedLinkForm } from '@/components/shared/SharedLinkForm'
import type { SharedAccessLink } from '@/types/user'

export default function SharedLinksPage() {
  const [links, setLinks] = useState<SharedAccessLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await sharedAccessService.getActiveLinks()
      setLinks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching links')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (link: SharedAccessLink) => {
    if (window.confirm(`¿Eliminar el enlace de ${link.guest_name || 'este invitado'}?`)) {
      try {
        await sharedAccessService.deleteLink(link.id)
        setLinks(prev => prev.filter(l => l.id !== link.id))
      } catch (err) {
        console.error('Error deleting link:', err)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enlaces compartidos</h1>
          <p className="text-sm text-gray-500">Gestiona enlaces para usuarios invitados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo enlace
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-12">
          <Link className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No hay enlaces</h3>
          <p className="text-sm text-gray-500 mb-4">
            Crea tu primer enlace para compartir acceso con usuarios invitados
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Crear enlace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map(link => (
            <SharedLinkCard
              key={link.id}
              link={link}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <SharedLinkForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false)
            fetchLinks()
          }}
        />
      )}
    </div>
  )
}
