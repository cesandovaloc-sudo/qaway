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
    draft: 'bg-muted-light/10 text-muted-light/60',
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
          <h1 className="text-2xl font-display font-bold text-white">Órdenes de Compra</h1>
          <p className="text-muted-light/60 text-sm mt-1">Gestión de compras a proveedores</p>
        </div>
        <Link
          to="/compras/nueva"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg hover:bg-brand-light transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Nueva Orden
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light/40" />
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
          <ShoppingCart size={48} className="mx-auto text-muted-light/20 mb-4" />
          <p className="text-muted-light/60">No hay órdenes de compra</p>
          <p className="text-muted-light/40 text-sm mt-1">Crea tu primera orden para comenzar</p>
        </div>
      ) : (
        <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-light/60">Orden</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-light/60">Proveedor</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-light/60">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-light/60">Total</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-light/60">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-sm text-white font-medium">{order.order_number}</td>
                  <td className="px-4 py-3 text-sm text-muted-light/80">{order.supplier_name || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs ${statusColors[order.status] || 'bg-muted-light/10 text-muted-light/60'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white text-right">
                    {order.currency === 'USD' ? '$' : 'S/'} {order.total?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-light/60">
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
