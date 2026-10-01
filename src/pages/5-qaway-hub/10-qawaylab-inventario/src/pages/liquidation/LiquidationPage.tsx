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
    <div className="pxp-root">
      <div className="pxp-layout">
        <main className="pxp-main">
          <div className="pxp-content">
            {/* Header oficial pxp */}
            <div className="pxp-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="pxp-heading-icon">
                  <Zap size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.8px', margin: '0 0 2px', color: '#111b2d' }}>
                    Promociones y Liquidaciones
                  </h1>
                  <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
                    Gestiona campañas de remate, promociones y liquidación de inventario.
                  </p>
                </div>
              </div>

              <div className="pxp-heading-actions">
                <button
                  onClick={() => setShowForm(true)}
                  className="pxp-btn primary"
                  title="Crear nueva campaña"
                >
                  <Plus size={15} /> Nueva campaña
                </button>
              </div>
            </div>

            {/* Toolbar oficial */}
            <div className="pxp-toolbar">
              <div className="pxp-search">
                <Search size={15} style={{ color: 'var(--muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar campañas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="text-[#ff4b0b] animate-spin" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e4e4e7] p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#f4f4f5] text-[#52525b] grid place-items-center mx-auto mb-3 text-xl">
                  <Zap size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#111b2d] mb-1">
                  {searchTerm ? 'Sin coincidencias' : 'No hay campañas activas'}
                </h3>
                <p className="text-sm text-[#71809e] mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? 'No se encontraron campañas que coincidan con tu búsqueda.' 
                    : 'Crea tu primera campaña de liquidación o promoción para comenzar a rotar inventario.'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="pxp-btn primary"
                  >
                    <Plus size={15} /> Crear campaña
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
                  <div className="flex items-center justify-between pt-4 border-t border-[#e5ebf4]">
                    <p className="text-sm text-[#71809e]">
                      Mostrando {filteredCampaigns.length} de {pagination.total} campañas
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="pxp-btn"
                        style={{ height: '32px', padding: '6px 12px', fontSize: '12px' }}
                      >
                        Anterior
                      </button>
                      <span className="text-sm text-[#34415b] font-medium px-2">
                        {pagination.page} / {pagination.total_pages}
                      </span>
                      <button
                        onClick={() => setPage(pagination.page + 1)}
                        disabled={pagination.page === pagination.total_pages}
                        className="pxp-btn"
                        style={{ height: '32px', padding: '6px 12px', fontSize: '12px' }}
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
        </main>
      </div>
    </div>
  )
}
