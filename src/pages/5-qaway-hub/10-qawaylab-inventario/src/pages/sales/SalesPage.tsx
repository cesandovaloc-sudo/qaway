import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Loader2, AlertCircle, ShoppingCart, Download } from 'lucide-react'
import { saleService } from '@/services/saleService'
import { ColumnPickerModal } from '@/components/reports/ColumnPickerModal'
import { SALES_REPORT_COLUMNS, exportSalesReport } from '@/utils/salesExport'
import type { PaymentStatus, Sale } from '@/types'

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string; bgColor: string }> = {
  pagado: { label: 'Pagado', color: 'text-green-700', bgColor: 'bg-green-100' },
  deuda: { label: 'Deuda', color: 'text-red-700', bgColor: 'bg-red-100' },
  parcial: { label: 'Parcial', color: 'text-amber-700', bgColor: 'bg-amber-100' },
}

export function formatPEN(amount: number): string {
  return amount.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('')
  const [exportOpen, setExportOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const load = async (p = page, query = search, status = statusFilter) => {
    setLoading(true)
    setError(null)
    try {
      const result = await saleService.getSales({
        page: p,
        per_page: perPage,
        search: query || undefined,
        payment_status: status || undefined,
      })
      setSales(result.data)
      setTotal(result.total)
      setPage(result.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ventas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalPages = Math.ceil(total / perPage)

  const handleExport = async (selected: string[]) => {
    setExporting(true)
    setExportError(null)
    try {
      await exportSalesReport(selected)
      setExportOpen(false)
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Error al generar el reporte')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
          <p className="text-sm text-gray-500">Ventas de mostrador al contado o al crédito</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar reporte
          </button>
          <Link
            to="/ventas/nueva"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva venta
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número, cliente o documento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') load(1, search, statusFilter)
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => {
            const status = e.target.value as PaymentStatus | ''
            setStatusFilter(status)
            load(1, search, status)
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="pagado">Pagado</option>
          <option value="deuda">Deuda</option>
          <option value="parcial">Parcial</option>
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {exportError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{exportError}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No hay ventas</h3>
          <p className="text-sm text-gray-500 mb-4">
            Registra tu primera venta de mostrador
          </p>
          <Link
            to="/ventas/nueva"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nueva venta
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">N°</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Cliente</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Total</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.map(sale => {
                const cfg = paymentStatusConfig[sale.payment_status]
                return (
                  <tr key={sale.id} className={sale.status === 'cancelled' ? 'opacity-50' : ''}>
                    <td className="px-4 py-3 font-mono text-gray-900">{sale.sale_number}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(sale.created_at).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">{sale.customer_name || 'Cliente ocasional'}</div>
                      {sale.doc_number && (
                        <div className="text-xs text-gray-400">
                          {sale.doc_type} {sale.doc_number}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatPEN(sale.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color} ${cfg.bgColor}`}>
                        {cfg.label}
                      </span>
                      {sale.status === 'cancelled' && (
                        <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-500 bg-gray-200">
                          Anulada
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/ventas/${sale.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Página {page} de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => load(page - 1, search, statusFilter)}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => load(page + 1, search, statusFilter)}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ColumnPickerModal
        open={exportOpen}
        title="Descargar reporte de ventas"
        subtitle="Selecciona las columnas que deseas incluir en el Excel"
        options={SALES_REPORT_COLUMNS}
        confirming={exporting}
        onConfirm={handleExport}
        onCancel={() => {
          if (!exporting) setExportOpen(false)
        }}
      />
    </div>
  )
}
