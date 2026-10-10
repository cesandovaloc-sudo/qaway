import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Loader2, AlertCircle, ShoppingCart } from 'lucide-react'
import { supabase } from '@/config/supabase'

interface PurchaseOrder {
  id: string
  order_number: string
  supplier_name: string | null
  total: number
  status: string
  currency: string
  created_at: string
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setOrders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes')
    } finally {
      setLoading(false)
    }
  }

  const filtered = orders.filter(o =>
    o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusColors: Record<string, string> = {
    draft: 'bg-zinc-100 text-zinc-600',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    received: 'bg-blue-50 text-blue-700 border border-blue-200',
    cancelled: 'bg-rose-50 text-rose-700 border border-rose-200',
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
                    Órdenes de Compra
                  </h1>
                  <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
                    Gestión de abastecimiento, compras e ingreso de mercadería con proveedores.
                  </p>
                </div>
              </div>

              <div className="pxp-heading-actions">
                <Link
                  to="../nueva"
                  className="pxp-btn primary"
                  title="Emitir nueva orden de compra"
                >
                  <Plus size={15} /> Nueva Orden
                </Link>
              </div>
            </div>

            {/* Toolbar oficial pxp */}
            <div className="pxp-toolbar">
              <div className="pxp-search">
                <Search size={15} style={{ color: 'var(--muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar por número o proveedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Content & Table (TABLA 100% INTACTA) */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-[#ff4b0b]" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
                <AlertCircle size={18} className="shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e4e4e7] p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#f4f4f5] text-[#52525b] grid place-items-center mx-auto mb-3 text-xl">
                  <ShoppingCart size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#111b2d] mb-1">
                  {searchTerm ? 'Sin coincidencias' : 'No hay órdenes de compra'}
                </h3>
                <p className="text-sm text-[#71809e] mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? 'No se encontraron órdenes que coincidan con la búsqueda.' 
                    : 'Crea tu primera orden de compra para solicitar mercadería a proveedores.'}
                </p>
                {!searchTerm && (
                  <Link
                    to="../nueva"
                    className="pxp-btn primary"
                  >
                    <Plus size={15} /> Crear primera orden
                  </Link>
                )}
              </div>
            ) : (
              <div className="pxp-table-wrap">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Orden</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Proveedor</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Estado</th>
                        <th className="text-right px-4 py-3 font-semibold text-[#475569]">Total</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {filtered.map(order => (
                        <tr key={order.id} className="hover:bg-[#fafafa]">
                          <td className="px-4 py-3 text-sm text-[#0f172a] font-mono font-semibold">{order.order_number}</td>
                          <td className="px-4 py-3 text-sm text-[#475569]">{order.supplier_name || '—'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-zinc-100 text-zinc-600'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#0f172a] font-bold text-right">
                            {order.currency === 'USD' ? '$' : 'S/'} {order.total?.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#64748b]">
                            {new Date(order.created_at).toLocaleDateString('es-PE')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
