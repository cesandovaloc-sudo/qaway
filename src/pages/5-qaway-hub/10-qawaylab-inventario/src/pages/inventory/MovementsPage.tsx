import { useEffect, useState, useMemo } from 'react'
import {
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  SlidersHorizontal,
  Search,
  Plus,
  RefreshCw,
  Package,
  Calendar,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import type { MovementType } from '@/types'

export interface KardexMovement {
  id: string
  created_at: string
  product_id?: string
  product_name: string
  sku?: string
  type: MovementType
  quantity: number
  location_name?: string
  notes?: string
  created_by?: string
}

const DEMO_MOVEMENTS: KardexMovement[] = [
  {
    id: 'mov-1',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    product_name: 'Pack Landing Page Pro + Dominio',
    sku: 'WEB-PRO-01',
    type: 'sale',
    quantity: -1,
    location_name: 'Plataforma Digital',
    notes: 'Venta web automatizada desde Carrito #QW-ORD-9021',
    created_by: 'Sistema Web',
  },
  {
    id: 'mov-2',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    product_name: 'Módulo WhatsApp CRM Add-on',
    sku: 'SAAS-CRM-02',
    type: 'sale',
    quantity: -1,
    location_name: 'Plataforma Digital',
    notes: 'Adquisición de módulo adicional en tienda',
    created_by: 'Sistema Web',
  },
  {
    id: 'mov-3',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    product_name: 'Licencia Qaway Hub Anual',
    sku: 'LIC-HUB-365',
    type: 'entry',
    quantity: 50,
    location_name: 'Almacén Central',
    notes: 'Recepción de lote de licencias de temporada',
    created_by: 'Admin Qaway',
  },
  {
    id: 'mov-4',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    product_name: 'Lector Código de Barras Bluetooth POS',
    sku: 'HW-BAR-01',
    type: 'adjustment',
    quantity: -2,
    location_name: 'Mostrador Miraflores',
    notes: 'Ajuste por garantía y reposición de equipo dañado',
    created_by: 'Auditoría Interna',
  },
  {
    id: 'mov-5',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    product_name: 'Impresora Térmica 80mm USB/LAN',
    sku: 'HW-PRN-80',
    type: 'entry',
    quantity: 10,
    location_name: 'Almacén Central',
    notes: 'Orden de compra OC-2026-04 recibida completa',
    created_by: 'Logística',
  },
]

const typeConfig: Record<
  MovementType,
  { label: string; icon: typeof ArrowUpRight; color: string; bg: string; sign: string }
> = {
  entry: {
    label: 'Entrada',
    icon: ArrowDownLeft,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    sign: '+',
  },
  exit: {
    label: 'Salida',
    icon: ArrowUpRight,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    sign: '-',
  },
  sale: {
    label: 'Venta',
    icon: ArrowUpRight,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    sign: '-',
  },
  transfer: {
    label: 'Transferencia',
    icon: ArrowLeftRight,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    sign: '⇄',
  },
  adjustment: {
    label: 'Ajuste',
    icon: SlidersHorizontal,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    sign: '±',
  },
  reservation: {
    label: 'Reserva',
    icon: ArrowLeftRight,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    sign: '⏳',
  },
}

export default function MovementsPage() {
  const [movements, setMovements] = useState<KardexMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)

  // Formulario nuevo movimiento
  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    type: 'entry' as MovementType,
    quantity: 1,
    location_name: 'Almacén Central',
    notes: '',
  })

  const loadMovements = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select(`
          id,
          created_at,
          product_id,
          type,
          quantity,
          notes,
          created_by,
          product:products(name, sku),
          location:inventory_locations(name)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data && data.length > 0) {
        const mapped: KardexMovement[] = data.map((m: any) => ({
          id: m.id,
          created_at: m.created_at,
          product_id: m.product_id,
          product_name: m.product?.name || 'Producto no especificado',
          sku: m.product?.sku || '',
          type: m.type as MovementType,
          quantity: m.quantity,
          location_name: m.location?.name || 'Almacén',
          notes: m.notes,
          created_by: m.created_by || 'Admin',
        }))
        setMovements(mapped)
      } else {
        setMovements(DEMO_MOVEMENTS)
      }
    } catch {
      setMovements(DEMO_MOVEMENTS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMovements()
  }, [])

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault()
    const newMov: KardexMovement = {
      id: `mov-${Date.now()}`,
      created_at: new Date().toISOString(),
      product_name: formData.product_name || 'Producto General',
      sku: formData.sku || 'SKU-GEN',
      type: formData.type,
      quantity:
        formData.type === 'exit' || formData.type === 'sale'
          ? -Math.abs(formData.quantity)
          : Math.abs(formData.quantity),
      location_name: formData.location_name,
      notes: formData.notes || 'Ajuste manual registrado',
      created_by: 'Admin Qaway',
    }

    setMovements((prev) => [newMov, ...prev])
    setModalOpen(false)
    setFormData({
      product_name: '',
      sku: '',
      type: 'entry',
      quantity: 1,
      location_name: 'Almacén Central',
      notes: '',
    })

    // Intentar persistir en Supabase si es posible
    try {
      await supabase.from('inventory_movements').insert({
        type: newMov.type,
        quantity: newMov.quantity,
        notes: newMov.notes,
      })
    } catch {
      // ignore
    }
  }

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        m.product_name.toLowerCase().includes(search.toLowerCase()) ||
        (m.sku && m.sku.toLowerCase().includes(search.toLowerCase())) ||
        (m.notes && m.notes.toLowerCase().includes(search.toLowerCase()))

      const matchesType = selectedType === 'all' || m.type === selectedType
      return matchesSearch && matchesType
    })
  }, [movements, search, selectedType])

  const stats = useMemo(() => {
    const totalCount = movements.length
    const entries = movements
      .filter((m) => m.type === 'entry')
      .reduce((acc, m) => acc + Math.abs(m.quantity), 0)
    const exits = movements
      .filter((m) => m.type === 'exit' || m.type === 'sale')
      .reduce((acc, m) => acc + Math.abs(m.quantity), 0)
    const adjustments = movements.filter((m) => m.type === 'adjustment').length

    return { totalCount, entries, exits, adjustments }
  }, [movements])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand/10 border border-brand/20 rounded-xl">
            <ArrowLeftRight size={24} className="text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Movimientos de Inventario (Kardex)
            </h1>
            <p className="text-sm text-muted-light/60 mt-0.5">
              Registro histórico y trazabilidad de entradas, salidas, ventas y ajustes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadMovements}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-light bg-surface border border-white/10 rounded-xl hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Actualizar</span>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand hover:bg-brand/90 rounded-xl shadow-lg shadow-brand/20 transition-all"
          >
            <Plus size={16} />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-light/60">
              Total Registros
            </span>
            <Package size={16} className="text-muted-light/40" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalCount}</p>
          <p className="text-xs text-muted-light/60 mt-1">Operaciones en historial</p>
        </div>

        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-light/60">
              Entradas
            </span>
            <ArrowDownLeft size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">+{stats.entries}</p>
          <p className="text-xs text-emerald-400/80 mt-1">Unidades ingresadas</p>
        </div>

        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-light/60">
              Salidas y Ventas
            </span>
            <ArrowUpRight size={16} className="text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400">-{stats.exits}</p>
          <p className="text-xs text-rose-400/80 mt-1">Unidades despachadas</p>
        </div>

        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-light/60">
              Ajustes de Stock
            </span>
            <SlidersHorizontal size={16} className="text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400">{stats.adjustments}</p>
          <p className="text-xs text-purple-400/80 mt-1">Auditorías y correcciones</p>
        </div>
      </div>

      {/* Buscador y Filtros por Tipo */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface border border-white/10 p-3 rounded-xl">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light/40" />
          <input
            type="text"
            placeholder="Buscar por producto, SKU o motivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-ink/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-muted-light/40 focus:outline-none focus:border-brand/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-muted-light/60 whitespace-nowrap pl-1">Tipo:</span>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'entry', label: 'Entradas' },
            { id: 'sale', label: 'Ventas' },
            { id: 'exit', label: 'Salidas' },
            { id: 'adjustment', label: 'Ajustes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedType === tab.id
                  ? 'bg-brand text-white'
                  : 'bg-white/5 text-muted-light hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla Kardex */}
      <div className="bg-surface border border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-xs font-mono uppercase tracking-wider text-muted-light/60">
              <tr>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Producto / SKU</th>
                <th className="py-3.5 px-4 text-center">Cantidad</th>
                <th className="py-3.5 px-4">Ubicación</th>
                <th className="py-3.5 px-4">Motivo / Notas</th>
                <th className="py-3.5 px-4">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-muted-light">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-light/60">
                    <ArrowLeftRight size={32} className="mx-auto mb-2 opacity-40 text-brand" />
                    <p className="text-sm font-medium">No se encontraron movimientos registrados.</p>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const conf = typeConfig[mov.type] || typeConfig.adjustment
                  const Icon = conf.icon
                  const formattedDate = new Date(mov.created_at).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  return (
                    <tr key={mov.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Fecha */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-xs font-mono text-white flex items-center gap-1.5">
                          <Calendar size={13} className="text-muted-light/40" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${conf.bg} ${conf.color}`}
                        >
                          <Icon size={12} />
                          <span>{conf.label}</span>
                        </span>
                      </td>

                      {/* Producto */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white">{mov.product_name}</div>
                        {mov.sku && (
                          <div className="text-xs font-mono text-muted-light/50">{mov.sku}</div>
                        )}
                      </td>

                      {/* Cantidad */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span
                          className={`font-mono text-sm font-bold ${
                            mov.quantity > 0
                              ? 'text-emerald-400'
                              : mov.quantity < 0
                              ? 'text-rose-400'
                              : 'text-muted-light'
                          }`}
                        >
                          {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                        </span>
                      </td>

                      {/* Ubicación */}
                      <td className="py-4 px-4 text-xs text-muted-light whitespace-nowrap">
                        {mov.location_name || 'Almacén Central'}
                      </td>

                      {/* Notas */}
                      <td className="py-4 px-4 text-xs text-muted-light max-w-xs truncate">
                        {mov.notes || '—'}
                      </td>

                      {/* Responsable */}
                      <td className="py-4 px-4 text-xs text-muted-light/60 whitespace-nowrap">
                        {mov.created_by || 'Sistema'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Movimiento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Registrar Movimiento Manual</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-muted-light hover:text-white rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMovement} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-light mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Dominio Web, Licencia, etc."
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full px-3 py-2 bg-ink/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-light mb-1">
                    Tipo de Operación
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as MovementType })
                    }
                    className="w-full px-3 py-2 bg-ink/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand"
                  >
                    <option value="entry">Entrada (+)</option>
                    <option value="exit">Salida (-)</option>
                    <option value="adjustment">Ajuste / Merma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-light mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 bg-ink/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-light mb-1">Ubicación</label>
                <input
                  type="text"
                  placeholder="Almacén Central / Digital"
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  className="w-full px-3 py-2 bg-ink/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-light mb-1">
                  Motivo / Observaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles del movimiento o número de guía..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-ink/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-muted-light hover:text-white rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand hover:bg-brand/90 rounded-lg shadow-lg shadow-brand/20"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
