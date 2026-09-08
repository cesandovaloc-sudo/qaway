import { useState, useEffect, useCallback } from 'react'
import { BarChart3, Package, Users, TrendingUp, Download, Loader2, Calendar, ArrowUpRight, ArrowDownRight, BookOpen, FileText } from 'lucide-react'
import { supabase } from '@/config/supabase'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

type ReportType = 'kardex' | 'productos' | 'clientes' | 'ventas' | 'libro_mayor'

const inputCls =
  'px-3 py-2 bg-background border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/50'

function defaultDateRange() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  return {
    from: first.toISOString().split('T')[0],
    to: now.toISOString().split('T')[0],
  }
}

interface KardexRow {
  product_id: string
  product_name: string
  type: string
  quantity: number
  created_at: string
}

interface ProductoRow {
  product_title: string
  total_qty: number
  total_revenue: number
}

interface ClienteRow {
  customer_name: string
  total_spent: number
  total_orders: number
}

interface VentasSummary {
  total_ventas: number
  count_ventas: number
  promedio: number
  pagado: number
  deuda: number
}

const reports = [
  { id: 'kardex' as ReportType, label: 'Kardex', icon: Package },
  { id: 'productos' as ReportType, label: 'Productos', icon: BarChart3 },
  { id: 'clientes' as ReportType, label: 'Clientes', icon: Users },
  { id: 'ventas' as ReportType, label: 'Ventas', icon: TrendingUp },
  { id: 'libro_mayor' as ReportType, label: 'Libro Mayor', icon: BookOpen },
]

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('kardex')
  const [dateFrom, setDateFrom] = useState(defaultDateRange().from)
  const [dateTo, setDateTo] = useState(defaultDateRange().to)

  const [kardexData, setKardexData] = useState<KardexRow[]>([])
  const [productosData, setProductosData] = useState<ProductoRow[]>([])
  const [clientesData, setClientesData] = useState<ClienteRow[]>([])
  const [ventasData, setVentasData] = useState<VentasSummary | null>(null)
  const [ventasTrend, setVentasTrend] = useState<{ date: string; total: number; count: number }[]>([])
  const [trendMode, setTrendMode] = useState<'daily' | 'weekly'>('daily')
  const [loading, setLoading] = useState(false)

  // Libro Mayor
  const [libroAccount, setLibroAccount] = useState('')
  const [libroData, setLibroData] = useState<{ entry_number: string; description: string; entry_date: string; account_code: string; account_name: string; debit: number; credit: number; running_balance: number }[]>([])
  const libroAccounts = [
    { code: '10', name: 'Caja' }, { code: '11', name: 'Bancos' }, { code: '12', name: 'Ctas por Cobrar' },
    { code: '13', name: 'Inventario' }, { code: '20', name: 'Proveedores' }, { code: '21', name: 'Ctas por Pagar' },
    { code: '30', name: 'Capital' }, { code: '40', name: 'Ventas' }, { code: '41', name: 'Servicios' },
    { code: '50', name: 'Compras' }, { code: '51', name: 'Sueldos' }, { code: '52', name: 'Servicios Básicos' },
    { code: '53', name: 'Alquileres' }, { code: '54', name: 'Materiales' }, { code: '55', name: 'Publicidad' },
    { code: '56', name: 'Mantenimiento' }, { code: '57', name: 'Impuestos' }, { code: '58', name: 'Transporte' },
    { code: '59', name: 'Otros Gastos' },
  ]

  const loadKardex = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('inventory_movements')
      .select('product_id, type, quantity, created_at, products(name)')
      .gte('created_at', `${dateFrom}T00:00:00`)
      .lte('created_at', `${dateTo}T23:59:59`)
      .order('created_at', { ascending: false })

    const rows: KardexRow[] = (data || []).map((r: any) => ({
      product_id: r.product_id,
      product_name: r.products?.name || '—',
      type: r.type,
      quantity: r.quantity,
      created_at: r.created_at,
    }))
    setKardexData(rows)
    setLoading(false)
  }, [dateFrom, dateTo])

  const loadProductos = useCallback(async () => {
    setLoading(true)
    const { data: sales } = await supabase
      .from('sales')
      .select('id')
      .gte('created_at', `${dateFrom}T00:00:00`)
      .lte('created_at', `${dateTo}T23:59:59`)

    const saleIds = (sales || []).map((s: any) => s.id)
    if (saleIds.length === 0) {
      setProductosData([])
      setLoading(false)
      return
    }

    const { data: items } = await supabase
      .from('sale_items')
      .select('product_title, quantity, subtotal')
      .in('sale_id', saleIds)

    const map = new Map<string, ProductoRow>()
    for (const item of items || []) {
      const key = item.product_title
      const existing = map.get(key)
      if (existing) {
        existing.total_qty += item.quantity
        existing.total_revenue += item.subtotal
      } else {
        map.set(key, {
          product_title: key,
          total_qty: item.quantity,
          total_revenue: item.subtotal,
        })
      }
    }
    setProductosData([...map.values()].sort((a, b) => b.total_qty - a.total_qty))
    setLoading(false)
  }, [dateFrom, dateTo])

  const loadClientes = useCallback(async () => {
    setLoading(true)
    const { data: sales } = await supabase
      .from('sales')
      .select('customer_name, total')
      .gte('created_at', `${dateFrom}T00:00:00`)
      .lte('created_at', `${dateTo}T23:59:59`)
      .eq('status', 'active')

    const map = new Map<string, ClienteRow>()
    for (const s of sales || []) {
      const name = s.customer_name || 'Cliente ocasiona'
      const existing = map.get(name)
      if (existing) {
        existing.total_spent += s.total || 0
        existing.total_orders += 1
      } else {
        map.set(name, {
          customer_name: name,
          total_spent: s.total || 0,
          total_orders: 1,
        })
      }
    }
    setClientesData([...map.values()].sort((a, b) => b.total_spent - a.total_spent))
    setLoading(false)
  }, [dateFrom, dateTo])

  const loadVentas = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('sales')
      .select('total, payment_status')
      .gte('created_at', `${dateFrom}T00:00:00`)
      .lte('created_at', `${dateTo}T23:59:59`)
      .eq('status', 'active')

    const rows = data || []
    const total = rows.reduce((s: number, r: any) => s + (r.total || 0), 0)
    const pagado = rows
      .filter((r: any) => r.payment_status === 'pagado')
      .reduce((s: number, r: any) => s + (r.total || 0), 0)
    const deuda = rows
      .filter((r: any) => r.payment_status === 'deuda' || r.payment_status === 'parcial')
      .reduce((s: number, r: any) => s + (r.total || 0), 0)

    setVentasData({
      total_ventas: total,
      count_ventas: rows.length,
      promedio: rows.length > 0 ? total / rows.length : 0,
      pagado,
      deuda,
    })
    setLoading(false)
  }, [dateFrom, dateTo])

  const loadVentasTrend = useCallback(async () => {
    const { data } = await supabase
      .from('sales')
      .select('total, created_at')
      .gte('created_at', `${dateFrom}T00:00:00`)
      .lte('created_at', `${dateTo}T23:59:59`)
      .eq('status', 'active')

    const grouped = new Map<string, { total: number; count: number }>()
    for (const s of data || []) {
      const d = new Date(s.created_at)
      let key: string
      if (trendMode === 'weekly') {
        const weekStart = new Date(d)
        weekStart.setDate(d.getDate() - d.getDay())
        key = weekStart.toISOString().split('T')[0]
      } else {
        key = d.toISOString().split('T')[0]
      }
      const existing = grouped.get(key)
      if (existing) {
        existing.total += s.total || 0
        existing.count += 1
      } else {
        grouped.set(key, { total: s.total || 0, count: 1 })
      }
    }

    const sorted = [...grouped.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, val]) => ({
        date,
        total: val.total,
        count: val.count,
      }))

    setVentasTrend(sorted)
  }, [dateFrom, dateTo, trendMode])

  const loadLibroMayor = useCallback(async () => {
    setLoading(true)
    try {
      // Cargar asientos contables
      const { data: entries } = await supabase
        .from('accounting_entries')
        .select('id, entry_number, description, entry_date, status')
        .gte('entry_date', dateFrom)
        .lte('entry_date', dateTo)
        .in('status', ['posted', 'draft'])
        .order('entry_date', { ascending: true })

      if (!entries || entries.length === 0) {
        setLibroData([])
        return
      }

      const entryIds = entries.map(e => e.id)
      const { data: lines } = await supabase
        .from('accounting_entry_lines')
        .select('entry_id, account_code, account_name, debit, credit')
        .in('entry_id', entryIds)

      // Filtrar por cuenta seleccionada si hay
      const filteredLines = libroAccount
        ? (lines || []).filter(l => l.account_code === libroAccount)
        : (lines || [])

      // Crear mapa de entries para acceso rápido
      const entryMap = new Map(entries.map(e => [e.id, e]))

      // Construir filas del libro mayor
      const rows = filteredLines
        .map(line => {
          const entry = entryMap.get(line.entry_id)
          return {
            entry_number: entry?.entry_number || '—',
            description: entry?.description || line.account_name,
            entry_date: entry?.entry_date || '',
            account_code: line.account_code,
            account_name: line.account_name,
            debit: line.debit || 0,
            credit: line.credit || 0,
            running_balance: 0, // se calcula después
          }
        })
        .sort((a, b) => a.entry_date.localeCompare(b.entry_date))

      // Calcular saldo acumulado
      let balance = 0
      for (const row of rows) {
        balance += row.debit - row.credit
        row.running_balance = balance
      }

      setLibroData(rows)
    } catch {
      setLibroData([])
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo, libroAccount])

  useEffect(() => {
    if (activeReport === 'kardex') loadKardex()
    if (activeReport === 'productos') loadProductos()
    if (activeReport === 'clientes') loadClientes()
    if (activeReport === 'ventas') {
      loadVentas()
      loadVentasTrend()
    }
    if (activeReport === 'libro_mayor') loadLibroMayor()
  }, [activeReport, loadKardex, loadProductos, loadClientes, loadVentas, loadVentasTrend, loadLibroMayor])

  const exportCSV = (headers: string[], rows: string[][], filename: string) => {
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${dateFrom}_${dateTo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = (title: string, headers: string[], rows: string[][]) => {
    const doc = new jsPDF({ orientation: rows[0] && rows[0].length > 5 ? 'landscape' : 'portrait' })

    // Header
    doc.setFontSize(16)
    doc.text('QawayLab — ' + title, 14, 20)
    doc.setFontSize(10)
    doc.setTextColor(120)
    doc.text(`Período: ${dateFrom} al ${dateTo}`, 14, 28)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, 14, 34)

    // Table
    const tableStartY = 40
    ;(doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: tableStartY,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 250],
      },
      margin: { top: tableStartY },
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        `QawayLab — Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' },
      )
    }

    doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${dateFrom}_${dateTo}.pdf`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Reportes</h1>
        <p className="text-muted-light/60 text-sm mt-1">Análisis y exportación de datos</p>
      </div>

      {/* Report tabs */}
      <div className="flex flex-wrap gap-2">
        {reports.map(report => {
          const Icon = report.icon
          return (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeReport === report.id
                  ? 'bg-brand text-white'
                  : 'bg-surface border border-gray-300 text-muted hover:text-ink hover:bg-gray-100'
              }`}
            >
              <Icon size={16} />
              {report.label}
            </button>
          )
        })}
      </div>

      {/* Filtros de fecha */}
      <div className="bg-surface border border-white/10 rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-light/60" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-light/60">Período</span>
          </div>
          <div>
            <label className="block text-xs text-muted-light/40 mb-1">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-light/40 mb-1">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className={inputCls}
            />
          </div>
          <button
            onClick={() => {
              const d = defaultDateRange()
              setDateFrom(d.from)
              setDateTo(d.to)
            }}
            className="px-3 py-2 text-xs text-muted-light hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            Este mes
          </button>
        </div>
      </div>

      {/* Report content */}
      <div className="bg-surface border border-white/10 rounded-xl p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-brand" />
          </div>
        ) : (
          <>
            {/* ── KARDEX ── */}
            {activeReport === 'kardex' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Kardex Valorizado</h2>
                    <p className="text-muted-light/60 text-sm">Movimientos de inventario en el período</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        exportCSV(
                          ['Fecha', 'Producto', 'Tipo', 'Cantidad'],
                          kardexData.map(r => [
                            new Date(r.created_at).toLocaleDateString('es-PE'),
                            r.product_name,
                            r.type,
                            String(r.quantity),
                          ]),
                          'kardex'
                        )
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 text-muted-light rounded-lg hover:bg-white/10 hover:text-white transition-colors text-sm"
                    >
                      <Download size={14} />
                      CSV
                    </button>
                    <button
                      onClick={() =>
                        exportPDF(
                          'Kardex Valorizado',
                          ['Fecha', 'Producto', 'Tipo', 'Cantidad'],
                          kardexData.map(r => [
                            new Date(r.created_at).toLocaleDateString('es-PE'),
                            r.product_name,
                            r.type,
                            String(r.quantity),
                          ]),
                        )
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
                    >
                      <FileText size={14} />
                      PDF
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-muted-light/60">Entradas</p>
                    <p className="text-xl font-bold text-green-400">
                      {kardexData.filter(r => r.type === 'entry' || r.type === 'sale').reduce((s, r) => s + r.quantity, 0)}
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-muted-light/60">Salidas</p>
                    <p className="text-xl font-bold text-red-400">
                      {kardexData.filter(r => r.type === 'exit').reduce((s, r) => s + r.quantity, 0)}
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-muted-light/60">Movimientos</p>
                    <p className="text-xl font-bold text-white">{kardexData.length}</p>
                  </div>
                </div>

                {kardexData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">Fecha</th>
                          <th className="text-left px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">Producto</th>
                          <th className="text-left px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">Tipo</th>
                          <th className="text-right px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kardexData.map((row, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-2 text-sm text-muted-light/60">
                              {new Date(row.created_at).toLocaleDateString('es-PE')}
                            </td>
                            <td className="px-4 py-2 text-sm text-white">{row.product_name}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                row.type === 'entry' ? 'bg-green-500/10 text-green-400' :
                                row.type === 'exit' ? 'bg-red-500/10 text-red-400' :
                                row.type === 'sale' ? 'bg-blue-500/10 text-blue-400' :
                                'bg-muted-light/10 text-muted-light/60'
                              }`}>
                                {row.type}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-white text-right font-medium">{row.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-muted-light/40 py-8">No hay movimientos en este período</p>
                )}
              </div>
            )}

            {/* ── PRODUCTOS ── */}
            {activeReport === 'productos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Ventas por Producto</h2>
                    <p className="text-muted-light/60 text-sm">Ranking de productos más vendidos</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        exportCSV(
                          ['Producto', 'Unidades Vendidas', 'Ingreso Total'],
                          productosData.map(r => [r.product_title, String(r.total_qty), r.total_revenue.toFixed(2)]),
                          'ventas_por_producto'
                        )
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 text-muted-light rounded-lg hover:bg-white/10 hover:text-white transition-colors text-sm"
                    >
                      <Download size={14} />
                      CSV
                    </button>
                    <button
                      onClick={() =>
                        exportPDF(
                          'Ventas por Producto',
                          ['Producto', 'Unidades Vendidas', 'Ingreso Total'],
                          productosData.map(r => [r.product_title, String(r.total_qty), `S/ ${r.total_revenue.toFixed(2)}`]),
                        )
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
                    >
                      <FileText size={14} />
                      PDF
                    </button>
                  </div>
                </div>

                {productosData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">#</th>
                          <th className="text-left px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">Producto</th>
                          <th className="text-right px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">Unidades</th>
                          <th className="text-right px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">Ingreso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosData.map((row, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-2 text-sm text-muted-light/40">{i + 1}</td>
                            <td className="px-4 py-2 text-sm text-white">{row.product_title}</td>
                            <td className="px-4 py-2 text-sm text-white text-right font-medium">{row.total_qty}</td>
                            <td className="px-4 py-2 text-sm text-brand text-right">S/ {row.total_revenue.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-muted-light/40 py-8">No hay ventas de productos en este período</p>
                )}
              </div>
            )}

            {/* ── CLIENTES ── */}
            {activeReport === 'clientes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Compras por Cliente</h2>
                    <p className="text-muted-light/60 text-sm">Historial de compras en el período</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        exportCSV(
                          ['Cliente', 'Total Gastado', 'N° Pedidos'],
                          clientesData.map(r => [r.customer_name, r.total_spent.toFixed(2), String(r.total_orders)]),
                          'compras_por_cliente'
                        )
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 text-muted-light rounded-lg hover:bg-white/10 hover:text-white transition-colors text-sm"
                    >
                      <Download size={14} />
                      CSV
                    </button>
                    <button
                      onClick={() =>
                        exportPDF(
                          'Compras por Cliente',
                          ['Cliente', 'Total Gastado', 'N° Pedidos'],
                          clientesData.map(r => [r.customer_name, `S/ ${r.total_spent.toFixed(2)}`, String(r.total_orders)]),
                        )
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
                    >
                      <FileText size={14} />
                      PDF
                    </button>
                  </div>
                </div>

                {clientesData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">#</th>
                          <th className="text-left px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">Cliente</th>
                          <th className="text-right px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">Pedidos</th>
                          <th className="text-right px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">Total Gastado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientesData.map((row, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-2 text-sm text-muted-light/40">{i + 1}</td>
                            <td className="px-4 py-2 text-sm text-white">{row.customer_name}</td>
                            <td className="px-4 py-2 text-sm text-white text-right">{row.total_orders}</td>
                            <td className="px-4 py-2 text-sm text-brand text-right font-medium">S/ {row.total_spent.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-muted-light/40 py-8">No hay compras en este período</p>
                )}
              </div>
            )}

            {/* ── VENTAS ── */}
            {activeReport === 'ventas' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Resumen de Ventas</h2>
                    <p className="text-muted-light/60 text-sm">Resumen general del período</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        exportCSV(
                          ['Métrica', 'Valor'],
                          [
                            ['Total Ventas', `S/ ${(ventasData?.total_ventas || 0).toFixed(2)}`],
                            ['N° Ventas', String(ventasData?.count_ventas || 0)],
                            ['Promedio/Venta', `S/ ${(ventasData?.promedio || 0).toFixed(2)}`],
                            ['Cobrado', `S/ ${(ventasData?.pagado || 0).toFixed(2)}`],
                            ['Por Cobrar', `S/ ${(ventasData?.deuda || 0).toFixed(2)}`],
                          ],
                          'resumen_ventas'
                        )
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 text-muted-light rounded-lg hover:bg-white/10 hover:text-white transition-colors text-sm"
                    >
                      <Download size={14} />
                      CSV
                    </button>
                    <button
                      onClick={() =>
                        exportPDF(
                          'Resumen de Ventas',
                          ['Métrica', 'Valor'],
                          [
                            ['Total Ventas', `S/ ${(ventasData?.total_ventas || 0).toFixed(2)}`],
                            ['N° Ventas', String(ventasData?.count_ventas || 0)],
                            ['Promedio/Venta', `S/ ${(ventasData?.promedio || 0).toFixed(2)}`],
                            ['Cobrado', `S/ ${(ventasData?.pagado || 0).toFixed(2)}`],
                            ['Por Cobrar', `S/ ${(ventasData?.deuda || 0).toFixed(2)}`],
                          ],
                        )
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
                    >
                      <FileText size={14} />
                      PDF
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-muted-light/60">Total Ventas</p>
                    <p className="text-2xl font-bold text-brand">S/ {(ventasData?.total_ventas || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-muted-light/60">N° Ventas</p>
                    <p className="text-2xl font-bold text-white">{ventasData?.count_ventas || 0}</p>
                  </div>
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-muted-light/60">Promedio/Venta</p>
                    <p className="text-2xl font-bold text-white">S/ {(ventasData?.promedio || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-muted-light/60">Cobrado</p>
                    <p className="text-2xl font-bold text-green-400">S/ {(ventasData?.pagado || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-muted-light/60">Por Cobrar</p>
                    <p className="text-2xl font-bold text-red-400">S/ {(ventasData?.deuda || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-muted-light/60">Tasa de Cobranza</p>
                    <p className="text-2xl font-bold text-white">
                      {(ventasData?.total_ventas || 0) > 0
                        ? (((ventasData?.pagado || 0) / (ventasData?.total_ventas || 1)) * 100).toFixed(0)
                        : '0'}%
                    </p>
                  </div>
                </div>

                {/* ── Tendencia de Ventas ── */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Tendencia de Ventas</h3>
                      <p className="text-muted-light/60 text-sm">
                        {trendMode === 'daily' ? 'Ventas por día' : 'Ventas por semana'}
                      </p>
                    </div>
                    <div className="flex bg-background rounded-lg p-1">
                      <button
                        onClick={() => setTrendMode('daily')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          trendMode === 'daily'
                            ? 'bg-brand text-white'
                            : 'text-muted-light hover:text-white'
                        }`}
                      >
                        Diario
                      </button>
                      <button
                        onClick={() => setTrendMode('weekly')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          trendMode === 'weekly'
                            ? 'bg-brand text-white'
                            : 'text-muted-light hover:text-white'
                        }`}
                      >
                        Semanal
                      </button>
                    </div>
                  </div>

                  {ventasTrend.length > 0 ? (
                    <div className="bg-background rounded-lg p-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={ventasTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                          <XAxis
                            dataKey="date"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            tickFormatter={(val: string) => {
                              const d = new Date(val + 'T00:00:00')
                              return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
                            }}
                          />
                          <YAxis
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val: number) => `S/ ${val}`}
                          />
                          <Tooltip
                            contentStyle={{
                              background: '#1a1a2e',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              color: '#fff',
                            }}
                            labelFormatter={(val: React.ReactNode) => {
                              const d = new Date(String(val) + 'T00:00:00')
                              return d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
                            }}
                            formatter={(value: React.ReactNode, name: React.ReactNode) => [
                              `S/ ${Number(value).toFixed(2)}`,
                              name === 'total' ? 'Ventas' : 'N° Ventas',
                            ]}
                          />
                          <Legend
                            wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="total"
                            name="total"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorTotal)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="bg-background rounded-lg p-8 text-center">
                      <TrendingUp size={32} className="mx-auto text-muted-light/30 mb-2" />
                      <p className="text-muted-light/40 text-sm">No hay datos de ventas para graficar</p>
                    </div>
                  )}

                  {/* Dato rápido: tendencia */}
                  {ventasTrend.length >= 2 && (
                    <div className="flex items-center gap-3 mt-3">
                      {(() => {
                        const last = ventasTrend[ventasTrend.length - 1]
                        const prev = ventasTrend[ventasTrend.length - 2]
                        const diff = last.total - prev.total
                        const pct = prev.total > 0 ? (diff / prev.total) * 100 : 0
                        const isUp = diff >= 0
                        return (
                          <>
                            <span className={`flex items-center gap-1 text-sm font-medium ${
                              isUp ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                              {Math.abs(pct).toFixed(0)}%
                            </span>
                            <span className="text-muted-light/60 text-xs">vs. período anterior</span>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── LIBRO MAYOR ── */}
            {activeReport === 'libro_mayor' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Libro Mayor</h2>
                    <p className="text-muted-light/60 text-sm">Movimientos por cuenta contable</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        exportCSV(
                          ['Fecha', 'N° Asiento', 'Descripción', 'Cuenta', 'Débito', 'Crédito', 'Saldo'],
                          libroData.map(r => [
                            r.entry_date,
                            r.entry_number,
                            r.description,
                            `${r.account_code} — ${r.account_name}`,
                            r.debit.toFixed(2),
                            r.credit.toFixed(2),
                            r.running_balance.toFixed(2),
                          ]),
                          'libro_mayor'
                        )
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 text-muted-light rounded-lg hover:bg-white/10 hover:text-white transition-colors text-sm"
                    >
                      <Download size={14} />
                      CSV
                    </button>
                    <button
                      onClick={() =>
                        exportPDF(
                          'Libro Mayor',
                          ['Fecha', 'N° Asiento', 'Descripción', 'Cuenta', 'Débito', 'Crédito', 'Saldo'],
                          libroData.map(r => [
                            r.entry_date,
                            r.entry_number,
                            r.description,
                            `${r.account_code} — ${r.account_name}`,
                            r.debit.toFixed(2),
                            r.credit.toFixed(2),
                            r.running_balance.toFixed(2),
                          ]),
                        )
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
                    >
                      <FileText size={14} />
                      PDF
                    </button>
                  </div>
                </div>

                {/* Filtro por cuenta */}
                <div className="bg-background rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-light/60">Filtrar por cuenta:</span>
                    <select
                      value={libroAccount}
                      onChange={e => setLibroAccount(e.target.value)}
                      className="px-3 py-1.5 bg-surface border border-gray-300 rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                    >
                      <option value="">Todas las cuentas</option>
                      {libroAccounts.map(a => (
                        <option key={a.code} value={a.code}>{a.code} — {a.name}</option>
                      ))}
                    </select>
                    {libroAccount && (
                      <button
                        onClick={() => setLibroAccount('')}
                        className="text-xs text-muted-light hover:text-white transition-colors"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>

                {/* Resumen */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-muted-light/60">Total Débitos</p>
                    <p className="text-xl font-bold text-blue-400">
                      S/ {libroData.reduce((s, r) => s + r.debit, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-muted-light/60">Total Créditos</p>
                    <p className="text-xl font-bold text-purple-400">
                      S/ {libroData.reduce((s, r) => s + r.credit, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-muted-light/60">Saldo Final</p>
                    <p className={`text-xl font-bold ${libroData.length > 0 && libroData[libroData.length - 1].running_balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      S/ {libroData.length > 0 ? libroData[libroData.length - 1].running_balance.toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>

                {/* Tabla */}
                {libroData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">Fecha</th>
                          <th className="text-left px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">N° Asiento</th>
                          <th className="text-left px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">Descripción</th>
                          <th className="text-left px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">Cuenta</th>
                          <th className="text-right px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">Débito</th>
                          <th className="text-right px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">Crédito</th>
                          <th className="text-right px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-light/60">Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {libroData.map((row, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-2 text-sm text-muted-light/60">
                              {row.entry_date ? new Date(row.entry_date + 'T00:00:00').toLocaleDateString('es-PE') : '—'}
                            </td>
                            <td className="px-4 py-2 text-sm text-brand font-mono">{row.entry_number}</td>
                            <td className="px-4 py-2 text-sm text-white">{row.description}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className="text-muted-light/80 font-mono text-xs">{row.account_code}</span>
                              <span className="text-muted-light/60 ml-1 text-xs">{row.account_name}</span>
                            </td>
                            <td className="px-4 py-2 text-sm text-right font-medium text-blue-400">
                              {row.debit > 0 ? `S/ ${row.debit.toFixed(2)}` : '—'}
                            </td>
                            <td className="px-4 py-2 text-sm text-right font-medium text-purple-400">
                              {row.credit > 0 ? `S/ ${row.credit.toFixed(2)}` : '—'}
                            </td>
                            <td className="px-4 py-2 text-sm text-right font-medium text-white">
                              S/ {row.running_balance.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen size={32} className="mx-auto text-muted-light/30 mb-2" />
                    <p className="text-muted-light/40 text-sm">
                      {libroAccount ? 'No hay movimientos para esta cuenta en el período' : 'No hay asientos contables en este período'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
