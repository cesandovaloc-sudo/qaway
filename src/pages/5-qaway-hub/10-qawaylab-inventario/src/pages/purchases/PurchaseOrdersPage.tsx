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
    draft: 'bg-muted-light/10 text-muted ',
    pending: 'bg-yellow-500/10 text-yellow-400',
    approved: 'bg-green-500/10 text-green-400',
    received: 'bg-blue-500/10 text-blue-400',
    cancelled: 'bg-red-500/10 text-red-400',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">Órdenes de Compra</h1>
          <p className="text-muted text-sm mt-1">Gestión de compras a proveedores</p>
        </div>
        <Link
          to="/compras/nueva"
          className="flex items-center gap-2 h-10 px-5 bg-brand text-white rounded-xl hover:bg-brand-hover transition-colors text-sm font-bold"
        >
          <Plus size={16} />
          Nueva Orden
        </Link>
      </div>

      {/* Search — sticky anti-scroll (ref HubPanelPage.jsx:990) */}
      <div className="sticky top-0 z-30 relative bg-white/95 backdrop-blur-md border border-zinc-200 py-1 rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted " />
        <input
          type="text"
          placeholder="Buscar por número o proveedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-gray-300 rounded-lg text-ink text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-brand" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart size={48} className="mx-auto text-muted mb-4" />
          <p className="text-muted ">No hay órdenes de compra</p>
          <p className="text-muted text-sm mt-1">Crea tu primera orden para comenzar</p>
        </div>
      ) : (
        <div className="bg-surface border border-zinc-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted ">Orden</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted ">Proveedor</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted ">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted ">Total</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted ">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-ink font-medium">{order.order_number}</td>
                  <td className="px-4 py-3 text-sm text-muted ">{order.supplier_name || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs ${statusColors[order.status] || 'bg-muted-light/10 text-muted '}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink text-right">
                    {order.currency === 'USD' ? '$' : 'S/'} {order.total?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted ">
                    {new Date(order.created_at).toLocaleDateString('es-PE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
