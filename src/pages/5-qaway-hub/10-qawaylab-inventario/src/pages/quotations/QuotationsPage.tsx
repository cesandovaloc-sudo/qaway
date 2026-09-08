import { useState } from 'react'
import { FileText, Plus, Search, Loader2, AlertCircle } from 'lucide-react'
import { useQuotations } from '@/hooks/useQuotations'
import { QuotationCard } from '@/components/quotations/QuotationCard'
import { QuotationForm } from '@/components/quotations/QuotationForm'
import { QuotationPDF } from '@/components/quotations/QuotationPDF'
import { quotationService } from '@/services/quotationService'
import type { Quotation } from '@/types'
import type { QuotationWithItems } from '@/services/quotationService'

export default function QuotationsPage() {
  const { quotations, loading, error, pagination, setPage, createQuotation, updateQuotation, updateStatus, deleteQuotation } = useQuotations()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null)
  const [pdfQuotation, setPdfQuotation] = useState<QuotationWithItems | null>(null)
  const [exportingPDF, setExportingPDF] = useState<string | null>(null)

  const filteredQuotations = quotations.filter(quotation =>
    (quotation as any).customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = async (data: any) => {
    await createQuotation(data)
    setShowForm(false)
  }

  const handleUpdate = async (data: any) => {
    if (editingQuotation) {
      await updateQuotation(editingQuotation.id, data)
      setEditingQuotation(null)
    }
  }

  const handleStatusChange = async (quotation: Quotation, status: Quotation['status']) => {
    await updateStatus(quotation.id, status)
  }

  const handleDelete = async (quotation: Quotation) => {
    if (window.confirm('¿Eliminar esta cotización?')) {
      await deleteQuotation(quotation.id)
    }
  }

  const handleExportPDF = async (quotation: Quotation) => {
    try {
      setExportingPDF(quotation.id)
      const fullQuotation = await quotationService.getQuotationById(quotation.id)
      setPdfQuotation(fullQuotation)
    } catch (err) {
      console.error('Error fetching quotation for PDF:', err)
      alert('Error al cargar la cotización para exportar')
    } finally {
      setExportingPDF(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
          <p className="text-sm text-gray-500">Gestiona las cotizaciones de tus clientes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva cotización
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por cliente o notas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      ) : filteredQuotations.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No hay cotizaciones</h3>
          <p className="text-sm text-gray-500 mb-4">
            Crea tu primera cotización para enviar a un cliente
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Crear cotización
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuotations.map(quotation => (
              <QuotationCard
                key={quotation.id}
                quotation={quotation}
                onEdit={(q) => setEditingQuotation(q)}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onExportPDF={handleExportPDF}
                exportingPDF={exportingPDF === quotation.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500">
                Mostrando {filteredQuotations.length} de {pagination.total} cotizaciones
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
        <QuotationForm
          onSave={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

      {editingQuotation && (
        <QuotationForm
          quotation={editingQuotation}
          onSave={handleUpdate}
          onClose={() => setEditingQuotation(null)}
        />
      )}

      {/* PDF Generator (hidden, triggers download) */}
      {pdfQuotation && (
        <QuotationPDF
          quotation={pdfQuotation}
          onGenerated={() => setPdfQuotation(null)}
        />
      )}
    </div>
  )
}
