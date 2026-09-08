import { useState } from 'react'
import { Zap, Plus, Search, Loader2, AlertCircle } from 'lucide-react'
import { useCampaigns } from '@/hooks/useCampaigns'
import { CampaignCard } from '@/components/liquidation/CampaignCard'
import { CampaignForm } from '@/components/liquidation/CampaignForm'
import type { LiquidationCampaign } from '@/types'

export default function LiquidationPage() {
  const { campaigns, loading, error, pagination, setPage, createCampaign, updateCampaign, deleteCampaign } = useCampaigns()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<LiquidationCampaign | null>(null)

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleCreate = async (data: Omit<LiquidationCampaign, 'id' | 'created_at'>) => {
    await createCampaign({ ...data, items: [] })
    setShowForm(false)
  }

  const handleUpdate = async (data: Omit<LiquidationCampaign, 'id' | 'created_at'>) => {
    if (editingCampaign) {
      await updateCampaign(editingCampaign.id, data)
      setEditingCampaign(null)
    }
  }

  const handleDelete = async (campaign: LiquidationCampaign) => {
    if (window.confirm(`¿Eliminar la campaña "${campaign.name}"?`)) {
      await deleteCampaign(campaign.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liquidación</h1>
          <p className="text-sm text-gray-500">Gestiona campañas de remate y liquidación de inventario</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva campaña
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar campañas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No hay campañas</h3>
          <p className="text-sm text-gray-500 mb-4">
            Crea tu primera campaña de liquidación para comenzar a vender inventario
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Plus className="w-4 h-4" />
            Crear campaña
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCampaigns.map(campaign => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onEdit={(c) => setEditingCampaign(c)}
                onDelete={handleDelete}
                onView={(c) => console.log('View campaign:', c)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500">
                Mostrando {filteredCampaigns.length} de {pagination.total} campañas
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  {pagination.page} / {pagination.total_pages}
                </span>
                <button
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.total_pages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Forms */}
      {showForm && (
        <CampaignForm
          onSave={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

      {editingCampaign && (
        <CampaignForm
          campaign={editingCampaign}
          onSave={handleUpdate}
          onClose={() => setEditingCampaign(null)}
        />
      )}
    </div>
  )
}
