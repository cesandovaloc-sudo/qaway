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
    <div className="pxp-root">
      <div className="pxp-layout">
        <main className="pxp-main">
          <div className="pxp-content">
            {/* Header oficial pxp */}
            <div className="pxp-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="pxp-heading-icon">
                  <ShoppingCart size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.8px', margin: '0 0 2px', color: '#111b2d' }}>
                    Ventas Comerciales
                  </h1>
                  <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
                    Registro de ventas de mostrador y facturación al contado o a crédito.
                  </p>
                </div>
              </div>

              <div className="pxp-heading-actions">
                <button
                  onClick={() => setExportOpen(true)}
                  className="pxp-btn"
                  title="Descargar reporte en Excel / CSV"
                >
                  <Download size={15} /> Descargar reporte
                </button>
                <Link
                  to="nueva"
                  className="pxp-btn primary"
                  title="Registrar una nueva venta"
                >
                  <Plus size={15} /> Nueva venta
                </Link>
              </div>
            </div>

            {/* Toolbar oficial */}
            <div className="pxp-toolbar">
              <div className="pxp-search">
                <Search size={15} style={{ color: 'var(--muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar por número, cliente o documento..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') load(1, search, statusFilter)
                  }}
                />
              </div>

              <div className="pxp-select-wrap">
                <select
                  value={statusFilter}
                  onChange={e => {
                    const status = e.target.value as PaymentStatus | ''
                    setStatusFilter(status)
                    load(1, search, status)
                  }}
                  className="pxp-select"
                >
                  <option value="">Todos los estados</option>
                  <option value="pagado">Pagado</option>
                  <option value="deuda">Deuda</option>
                  <option value="parcial">Parcial</option>
                </select>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {exportError && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span className="text-sm text-red-700">{exportError}</span>
              </div>
            )}

            {/* Content & Table (TABLA 100% INTACTA) */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="text-[#ff4b0b] animate-spin" />
              </div>
            ) : sales.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e4e4e7] p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#f4f4f5] text-[#52525b] grid place-items-center mx-auto mb-3 text-xl">
                  <ShoppingCart size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#111b2d] mb-1">No hay ventas registradas</h3>
                <p className="text-sm text-[#71809e] mb-6 max-w-md mx-auto">
                  Registra tu primera venta de mostrador para emitir comprobantes y llevar el control de cobros.
                </p>
                <Link
                  to="nueva"
                  className="pxp-btn primary"
                >
                  <Plus size={15} /> Nueva venta
                </Link>
              </div>
            ) : (
              <div className="pxp-table-wrap">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">N°</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Fecha</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Cliente</th>
                        <th className="text-right px-4 py-3 font-semibold text-[#475569]">Total</th>
                        <th className="text-center px-4 py-3 font-semibold text-[#475569]">Estado</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {sales.map(sale => {
                        const cfg = paymentStatusConfig[sale.payment_status]
                        return (
                          <tr key={sale.id} className={sale.status === 'cancelled' ? 'opacity-50' : 'hover:bg-[#fafafa]'}>
                            <td className="px-4 py-3 font-mono font-medium text-[#0f172a]">{sale.sale_number}</td>
                            <td className="px-4 py-3 text-[#64748b]">
                              {new Date(sale.created_at).toLocaleDateString('es-PE')}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-[#0f172a] font-medium">{sale.customer_name || 'Cliente ocasional'}</div>
                              {sale.doc_number && (
                                <div className="text-xs text-[#94a3b8]">
                                  {sale.doc_type} {sale.doc_number}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-[#0f172a]">
                              {formatPEN(sale.total)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bgColor}`}>
                                {cfg.label}
                              </span>
                              {sale.status === 'cancelled' && (
                                <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-gray-500 bg-gray-200">
                                  Anulada
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                to={`/ventas/${sale.id}`}
                                className="text-[#ff4b0b] hover:text-[#ea3e00] font-semibold"
                              >
                                Ver
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-[#e2e8f0]">
                    <p className="text-sm text-[#64748b]">
                      Página {page} de {totalPages} · ({total} ventas)
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => load(page - 1, search, statusFilter)}
                        disabled={page === 1}
                        className="pxp-btn"
                        style={{ height: '32px', padding: '6px 12px', fontSize: '12px' }}
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => load(page + 1, search, statusFilter)}
                        disabled={page === totalPages}
                        className="pxp-btn"
                        style={{ height: '32px', padding: '6px 12px', fontSize: '12px' }}
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
        </main>
      </div>
    </div>
  )
}
