import { useEffect, useState, useMemo } from 'react'
import {
  Globe,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ExternalLink,
  Package,
  DollarSign,
  User,
  MapPin,
  Calendar,
  X,
  CreditCard,
  MessageCircle,
} from 'lucide-react'
import { supabase } from '@/config/supabase'

export interface WebOrderItem {
  id?: string
  product_id: string
  product_title: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface WebOrder {
  id: string
  created_at: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  shipping_address?: string
  payment_method?: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  notes?: string
  items: WebOrderItem[]
}

const DEMO_WEB_ORDERS: WebOrder[] = [
  {
    id: 'QW-ORD-9021',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // hace 45 min
    customer_name: 'Carlos Mendoza',
    customer_email: 'carlos.mendoza@gmail.com',
    customer_phone: '+51 987 654 321',
    shipping_address: 'Av. Javier Prado Este 2450, San Borja, Lima',
    payment_method: 'Yape / Plin',
    status: 'pending',
    total: 349.0,
    notes: 'Confirmar recepción de voucher adjunto.',
    items: [
      {
        product_id: 'prod-1',
        product_title: 'Pack Landing Page Pro + Dominio',
        quantity: 1,
        unit_price: 349.0,
        subtotal: 349.0,
      },
    ],
  },
  {
    id: 'QW-ORD-8942',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // hace 4 horas
    customer_name: 'Mariana Rosas V.',
    customer_email: 'mariana.rosas@empresa.pe',
    customer_phone: '+51 945 112 334',
    shipping_address: 'Calle Las Begonias 441, San Isidro, Lima',
    payment_method: 'Tarjeta de Crédito',
    status: 'paid',
    total: 580.0,
    notes: 'Solicita factura electrónica.',
    items: [
      {
        product_id: 'prod-2',
        product_title: 'Suscripción Qaway Hub Anual',
        quantity: 1,
        unit_price: 490.0,
        subtotal: 490.0,
      },
      {
        product_id: 'prod-3',
        product_title: 'Módulo WhatsApp CRM Add-on',
        quantity: 1,
        unit_price: 90.0,
        subtotal: 90.0,
      },
    ],
  },
  {
    id: 'QW-ORD-8810',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // hace 1 día
    customer_name: 'Estudio Jurídico Del Solar',
    customer_email: 'contacto@delsolar.com',
    customer_phone: '+51 912 887 665',
    shipping_address: 'Miraflores, Lima',
    payment_method: 'Transferencia BCP',
    status: 'delivered',
    total: 1250.0,
    items: [
      {
        product_id: 'prod-4',
        product_title: 'Sistema de Agenda & Facturación Personalizada',
        quantity: 1,
        unit_price: 1250.0,
        subtotal: 1250.0,
      },
    ],
  },
]

const statusBadges: Record<
  WebOrder['status'],
  { label: string; icon: typeof Clock; color: string; bg: string; border: string }
> = {
  pending: {
    label: 'Pendiente',
    icon: Clock,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  paid: {
    label: 'Pagado',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  shipped: {
    label: 'En camino',
    icon: Truck,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  delivered: {
    label: 'Entregado',
    icon: CheckCircle2,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
}

export default function WebOrdersPage() {
  const [orders, setOrders] = useState<WebOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<WebOrder | null>(null)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(val || 0)
  }

  const loadOrders = async () => {
    setLoading(true)
    try {
      let combined: WebOrder[] = []

      // 1. Cargar desde Supabase
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .order('created_at', { ascending: false })
          .limit(50)

        if (!error && data && data.length > 0) {
          combined = data.map((o) => ({
            id: o.id || `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            created_at: o.created_at || new Date().toISOString(),
            customer_name: o.customer_name || (o.user_id ? `Usuario ${o.user_id.slice(0, 8)}` : 'Cliente Web'),
            customer_email: o.customer_email || o.shipping_address?.email,
            customer_phone: o.customer_phone || o.shipping_address?.phone,
            shipping_address:
              typeof o.shipping_address === 'string'
                ? o.shipping_address
                : o.shipping_address?.address || 'Lima, Perú',
            payment_method: o.payment_method || 'Web Checkout',
            status: o.status || 'pending',
            total: Number(o.total) || 0,
            notes: o.notes,
            items: (o.items || []).map((it: any) => ({
              id: it.id,
              product_id: it.product_id,
              product_title: it.product_title || 'Producto Web',
              quantity: it.quantity || 1,
              unit_price: Number(it.unit_price) || 0,
              subtotal: Number(it.subtotal || it.unit_price * (it.quantity || 1)) || 0,
            })),
          }))
        }
      } catch (err) {
        console.warn('[WebOrdersPage] Supabase error fallback:', err)
      }

      // 2. Failsafe localStorage (qaway_orders)
      try {
        const localOrders = JSON.parse(localStorage.getItem('qaway_orders') || '[]')
        if (Array.isArray(localOrders) && localOrders.length > 0) {
          const mappedLocal: WebOrder[] = localOrders.map((lo) => ({
            id: lo.id || `QW-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            created_at: lo.created_at || new Date().toISOString(),
            customer_name: lo.customer_name || 'Cliente Web',
            customer_email: lo.customer_email || '',
            customer_phone: lo.customer_phone || '',
            shipping_address:
              typeof lo.shipping_address === 'string'
                ? lo.shipping_address
                : lo.shipping_address?.address || 'Entrega Digital',
            payment_method: lo.payment_method || 'Yape / Carrito Web',
            status: lo.status || 'pending',
            total: Number(lo.total) || 0,
            notes: lo.notes,
            items: (lo.items || []).map((it: any) => ({
              product_id: it.product_id,
              product_title: it.product_title || 'Producto Digital',
              quantity: it.quantity || 1,
              unit_price: Number(it.unit_price) || 0,
              subtotal: Number(it.subtotal || it.unit_price * (it.quantity || 1)) || 0,
            })),
          }))

          // Unir evitando duplicados por ID
          const existingIds = new Set(combined.map((o) => o.id))
          mappedLocal.forEach((lo) => {
            if (!existingIds.has(lo.id)) {
              combined.push(lo)
            }
          })
        }
      } catch (e) {
        console.warn('[WebOrdersPage] Local orders parse error:', e)
      }

      // 3. Fallback a DEMO_WEB_ORDERS si no hay ninguno
      if (combined.length === 0) {
        combined = [...DEMO_WEB_ORDERS]
      }

      setOrders(combined)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: WebOrder['status']) => {
    // Actualizar estado local
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    )
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
    }

    // Actualizar en localStorage
    try {
      const local = JSON.parse(localStorage.getItem('qaway_orders') || '[]')
      const updated = local.map((o: any) => (o.id === orderId ? { ...o, status: newStatus } : o))
      localStorage.setItem('qaway_orders', JSON.stringify(updated))
    } catch (e) {
      console.warn('[WebOrdersPage] update local error:', e)
    }

    // Actualizar en Supabase si está disponible
    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    } catch (e) {
      // Ignorar si tabla remota no responde
    }
  }

  // Filtrado y estadísticas
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(search.toLowerCase())) ||
        (o.customer_email && o.customer_email.toLowerCase().includes(search.toLowerCase())) ||
        o.items.some((it) => it.product_title.toLowerCase().includes(search.toLowerCase()))

      const matchesStatus = filterStatus === 'all' || o.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [orders, search, filterStatus])

  const stats = useMemo(() => {
    const totalCount = orders.length
    const pendingCount = orders.filter((o) => o.status === 'pending').length
    const paidCount = orders.filter((o) => o.status === 'paid' || o.status === 'delivered').length
    const totalRevenue = orders
      .filter((o) => o.status === 'paid' || o.status === 'delivered')
      .reduce((sum, o) => sum + (o.total || 0), 0)

    return { totalCount, pendingCount, paidCount, totalRevenue }
  }, [orders])

  return (
    <div className="space-y-6">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <Globe size={24} className="text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Pedidos Web</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {orders.length} órdenes
              </span>
            </div>
            <p className="text-sm text-muted-light/60 mt-0.5">
              Bandeja unificada de pedidos generados en el carrito web y tienda online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-light bg-surface border border-white/10 rounded-xl hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Actualizar</span>
          </button>
          <a
            href="/landings/desarrollo-web-qaway"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand hover:bg-brand/90 rounded-xl shadow-lg shadow-brand/20 transition-all"
          >
            <span>Ver Catálogo Web</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Tarjetas de Métricas de Pedidos Web */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-light/60">
              Total Pedidos Web
            </span>
            <Package size={16} className="text-muted-light/40" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalCount}</p>
          <p className="text-xs text-muted-light/60 mt-1">Registrados en tienda online</p>
        </div>

        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-light/60">
              Por Confirmar
            </span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats.pendingCount}</p>
          <p className="text-xs text-amber-400/80 mt-1">Requieren validar voucher/pago</p>
        </div>

        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-light/60">
              Confirmados
            </span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{stats.paidCount}</p>
          <p className="text-xs text-emerald-400/80 mt-1">Pagados o despachados</p>
        </div>

        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-light/60">
              Ingresos Confirmados
            </span>
            <DollarSign size={16} className="text-brand" />
          </div>
          <p className="text-2xl font-bold text-brand">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-xs text-brand/80 mt-1">Total recaudado web</p>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface border border-white/10 p-3 rounded-xl">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light/40" />
          <input
            type="text"
            placeholder="Buscar por código, cliente o producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-ink/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-muted-light/40 focus:outline-none focus:border-brand/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-muted-light/60 whitespace-nowrap pl-1">Filtrar:</span>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'pending', label: 'Pendientes' },
            { id: 'paid', label: 'Pagados' },
            { id: 'shipped', label: 'En camino' },
            { id: 'delivered', label: 'Entregados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-brand text-white'
                  : 'bg-white/5 text-muted-light hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Pedidos Web */}
      <div className="bg-surface border border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-xs font-mono uppercase tracking-wider text-muted-light/60">
              <tr>
                <th className="py-3.5 px-4">Pedido / Fecha</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Productos</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Método</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-muted-light">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-light/60">
                    <Globe size={32} className="mx-auto mb-2 opacity-40 text-blue-400" />
                    <p className="text-sm font-medium">No se encontraron pedidos con estos filtros.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const badge = statusBadges[order.status] || statusBadges.pending
                  const StatusIcon = badge.icon
                  const formattedDate = new Date(order.created_at).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* ID y Fecha */}
                      <td className="py-4 px-4">
                        <div className="font-mono text-sm font-semibold text-white group-hover:text-brand transition-colors">
                          {order.id}
                        </div>
                        <div className="text-xs text-muted-light/50 flex items-center gap-1 mt-0.5">
                          <Calendar size={12} />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-white">{order.customer_name}</div>
                        {order.customer_phone && (
                          <div className="text-xs text-muted-light/50 mt-0.5">
                            {order.customer_phone}
                          </div>
                        )}
                      </td>

                      {/* Productos */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="text-sm text-white font-medium truncate">
                          {order.items[0]?.product_title || 'Pedido Web'}
                        </div>
                        {order.items.length > 1 && (
                          <div className="text-xs text-brand mt-0.5">
                            +{order.items.length - 1} producto(s) adicional(es)
                          </div>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-white">
                          {formatCurrency(order.total)}
                        </span>
                      </td>

                      {/* Método de Pago */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-light">
                          <CreditCard size={13} className="text-muted-light/60" />
                          <span>{order.payment_method}</span>
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.color} ${badge.border}`}
                        >
                          <StatusIcon size={12} />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Acciones */}
                      <td
                        className="py-4 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-muted-light hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </button>
                          {order.customer_phone && (
                            <a
                              href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(
                                order.customer_name || ''
                              )},%20te%20contactamos%20de%20Qaway%20sobre%20tu%20pedido%20${order.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Chat WhatsApp"
                            >
                              <MessageCircle size={16} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalle de Pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
            {/* Cabecera Modal */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-brand">
                  Detalle de Pedido Web
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedOrder.id}</h3>
                <p className="text-xs text-muted-light/60">
                  Emitido el {new Date(selectedOrder.created_at).toLocaleString('es-PE')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-muted-light hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Datos del Cliente */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-white font-medium text-sm">
                <User size={15} className="text-brand" />
                <span>{selectedOrder.customer_name || 'Cliente sin nombre'}</span>
              </div>
              {selectedOrder.customer_email && (
                <p className="text-xs text-muted-light/70 pl-6">
                  {selectedOrder.customer_email}
                </p>
              )}
              {selectedOrder.customer_phone && (
                <p className="text-xs text-muted-light/70 pl-6">
                  Tel: {selectedOrder.customer_phone}
                </p>
              )}
              {selectedOrder.shipping_address && (
                <div className="flex items-start gap-2 text-xs text-muted-light/70 pl-6 pt-1">
                  <MapPin size={13} className="text-muted-light/40 shrink-0 mt-0.5" />
                  <span>{selectedOrder.shipping_address}</span>
                </div>
              )}
            </div>

            {/* Desglose de Productos */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-muted-light/60 mb-2">
                Productos Comprados
              </h4>
              <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden bg-ink/30">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium text-white">{item.product_title}</div>
                      <div className="text-xs text-muted-light/50">
                        {item.quantity} x {formatCurrency(item.unit_price)}
                      </div>
                    </div>
                    <div className="font-semibold text-white">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-3.5 bg-brand/10 border border-brand/20 rounded-xl">
              <span className="font-semibold text-white">Total a Pagar</span>
              <span className="text-xl font-bold text-brand">
                {formatCurrency(selectedOrder.total)}
              </span>
            </div>

            {/* Notas */}
            {selectedOrder.notes && (
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-light/50 block mb-1">
                  Notas del pedido:
                </span>
                <p className="text-xs text-muted-light/80 italic">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Estado y Acciones Rápidas */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-xs text-muted-light/60 block">Cambiar estado del pedido:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'paid')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    selectedOrder.status === 'paid'
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : 'bg-white/5 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'
                  }`}
                >
                  ✓ Pagado
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    selectedOrder.status === 'delivered'
                      ? 'bg-purple-500 text-white border-purple-400'
                      : 'bg-white/5 text-purple-400 border-purple-500/20 hover:bg-purple-500/10'
                  }`}
                >
                  ✓ Entregado
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    selectedOrder.status === 'cancelled'
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-white/5 text-rose-400 border-rose-500/20 hover:bg-rose-500/10'
                  }`}
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
