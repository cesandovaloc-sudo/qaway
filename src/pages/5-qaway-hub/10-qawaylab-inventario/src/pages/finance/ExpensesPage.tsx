import { useState, useEffect, useMemo } from 'react'
import { useDismissOnEscapeOrOutside } from '@/hooks/useDismissOnEscapeOrOutside'
import { Search, Plus, Loader2, AlertCircle, Receipt, X, Tag } from 'lucide-react'
import { supabase } from '@/config/supabase'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'

interface Expense {
  id: string
  description: string
  category: string
  amount: number
  expense_date: string
  receipt_url: string | null
  created_by: string | null
}

const categories = [
  { value: 'servicios', label: 'Servicios (luz, agua, internet)', color: '#3b82f6', textColor: 'text-blue-400' },
  { value: 'alquiler', label: 'Alquiler', color: '#8b5cf6', textColor: 'text-purple-400' },
  { value: 'sueldos', label: 'Sueldos y personal', color: '#22c55e', textColor: 'text-green-400' },
  { value: 'impuestos', label: 'Impuestos y tasas', color: '#ef4444', textColor: 'text-red-400' },
  { value: 'transporte', label: 'Transporte y logística', color: '#eab308', textColor: 'text-yellow-400' },
  { value: 'marketing', label: 'Marketing y publicidad', color: '#ec4899', textColor: 'text-pink-400' },
  { value: 'suministros', label: 'Suministros y materiales', color: '#f97316', textColor: 'text-orange-400' },
  { value: 'mantenimiento', label: 'Mantenimiento y reparaciones', color: '#06b6d4', textColor: 'text-cyan-400' },
  { value: 'seguros', label: 'Seguros', color: '#6366f1', textColor: 'text-indigo-400' },
  { value: 'otros', label: 'Otros gastos', color: '#6b7280', textColor: 'text-gray-400' },
]

const inputCls =
  'w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm placeholder:text-[#94a3b8] focus:outline-none focus:border-[#ff4b0b]'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // ── Modal ──
  const [showForm, setShowForm] = useState(false)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('otros')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const modalRef = useDismissOnEscapeOrOutside(showForm, () => setShowForm(false))
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    loadExpenses()
  }, [])

  async function loadExpenses() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false })

      if (fetchError) throw fetchError
      setExpenses(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar gastos')
    } finally {
      setLoading(false)
    }
  }

  const openForm = () => {
    setDescription('')
    setCategory('otros')
    setAmount('')
    setExpenseDate(new Date().toISOString().split('T')[0])
    setFormError(null)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!description.trim()) {
      setFormError('La descripción es obligatoria')
      return
    }
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) {
      setFormError('El monto debe ser mayor a 0')
      return
    }

    try {
      setSaving(true)
      setFormError(null)
      const userId = (await supabase.auth.getUser()).data.user?.id || null

      const { error: insertError } = await supabase.from('expenses').insert({
        description: description.trim(),
        category,
        amount: parsed,
        expense_date: expenseDate,
        created_by: userId,
      })

      if (insertError) throw insertError

      setShowForm(false)
      await loadExpenses()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar gasto')
    } finally {
      setSaving(false)
    }
  }

  const filtered = expenses.filter(
    e =>
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalGastos = filtered.reduce((sum, e) => sum + e.amount, 0)
  const getCategoryInfo = (cat: string) => categories.find(c => c.value === cat) || categories[categories.length - 1]

  // ── Datos para el gráfico de torta ──
  const chartData = useMemo(() => {
    const grouped = new Map<string, number>()
    for (const expense of filtered) {
      const cat = expense.category || 'otros'
      grouped.set(cat, (grouped.get(cat) || 0) + expense.amount)
    }
    return [...grouped.entries()]
      .map(([cat, total]) => ({
        name: getCategoryInfo(cat).label,
        value: total,
        color: getCategoryInfo(cat).color,
      }))
      .sort((a, b) => b.value - a.value)
  }, [filtered])

  return (
    <div className="pxp-root">
      <div className="pxp-layout">
        <main className="pxp-main">
          <div className="pxp-content">
            {/* Header oficial pxp */}
            <div className="pxp-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="pxp-heading-icon">
                  <Receipt size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.8px', margin: '0 0 2px', color: '#111b2d' }}>
                    Gastos Operativos
                  </h1>
                  <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
                    Control de egresos fijos, variables, pagos de servicios e impuestos.
                  </p>
                </div>
              </div>

              <div className="pxp-heading-actions">
                <button
                  onClick={openForm}
                  className="pxp-btn primary"
                  title="Registrar nuevo gasto"
                >
                  <Plus size={15} /> Nuevo Gasto
                </button>
              </div>
            </div>

            {/* Toolbar oficial */}
            <div className="pxp-toolbar">
              <div className="pxp-search">
                <Search size={15} style={{ color: 'var(--muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar gastos por concepto o categoría..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Resumen + Gráfico */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Tarjetas de resumen pxp */}
              <div className="space-y-3">
                <div className="pxp-metric">
                  <span className="pxp-metric-label">Total Gastos</span>
                  <div className="pxp-metric-value" style={{ color: '#e11d48' }}>S/ {totalGastos.toFixed(2)}</div>
                  <div className="pxp-metric-note">Período auditado</div>
                </div>

                <div className="pxp-metric">
                  <span className="pxp-metric-label">N° de Gastos</span>
                  <div className="pxp-metric-value">{filtered.length}</div>
                  <div className="pxp-metric-note">Registros encontrados</div>
                </div>

                <div className="pxp-metric">
                  <span className="pxp-metric-label">Gasto Promedio</span>
                  <div className="pxp-metric-value">
                    S/ {filtered.length > 0 ? (totalGastos / filtered.length).toFixed(2) : '0.00'}
                  </div>
                  <div className="pxp-metric-note">Por cada comprobante</div>
                </div>
              </div>

              {/* Gráfico de torta */}
              <div className="lg:col-span-2 bg-white border border-[#e4e4e7] rounded-2xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-[#111b2d] mb-4">Distribución por Categoría</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#1a1a2e',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                        formatter={(value: React.ReactNode) => [`S/ ${Number(value).toFixed(2)}`, 'Monto']}
                      />
                      <Legend
                        wrapperStyle={{ color: '#64748b', fontSize: 12 }}
                        formatter={(value: React.ReactNode) => (
                          <span style={{ color: '#334155', fontSize: 11, fontWeight: 500 }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[260px] text-[#94a3b8] text-sm">
                    Sin gastos para graficar
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
                <AlertCircle size={18} className="shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Content & Table (TABLA 100% INTACTA) */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-[#ff4b0b]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e4e4e7] p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#f4f4f5] text-[#52525b] grid place-items-center mx-auto mb-3 text-xl">
                  <Receipt size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#111b2d] mb-1">
                  {searchTerm ? 'Sin coincidencias' : 'No hay gastos registrados'}
                </h3>
                <p className="text-sm text-[#71809e] mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? 'No se encontraron gastos que coincidan con la búsqueda.' 
                    : 'Registra los gastos de tu negocio para deducir costos y tener balances precisos.'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={openForm}
                    className="pxp-btn primary"
                  >
                    <Plus size={15} /> Registrar primer gasto
                  </button>
                )}
              </div>
            ) : (
              <div className="pxp-table-wrap">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Fecha</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Descripción</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Categoría</th>
                        <th className="text-right px-4 py-3 font-semibold text-[#475569]">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {filtered.map(expense => {
                        const catInfo = getCategoryInfo(expense.category)
                        return (
                          <tr key={expense.id} className="hover:bg-[#fafafa]">
                            <td className="px-4 py-3 text-sm text-[#64748b]">
                              {new Date(expense.expense_date + 'T12:00:00').toLocaleDateString('es-PE')}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#0f172a] font-medium">{expense.description}</td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                style={{ backgroundColor: `${catInfo.color}15`, color: catInfo.color }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catInfo.color }} />
                                {catInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-[#e11d48] text-right">
                              S/ {expense.amount.toFixed(2)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal */}
            {showForm && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                onClick={() => setShowForm(false)}
              >
                <div
                  ref={modalRef}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#e4e4e7] space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                    <h2 className="text-lg font-bold text-[#111b2d]">Registrar Gasto</h2>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="text-[#71809e] hover:text-[#111b2d] font-bold text-lg cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#52525b] mb-1">Descripción *</label>
                      <input
                        placeholder="Ej. Recibo de luz del local"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#52525b] mb-1">Categoría</label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className={inputCls}
                      >
                        {categories.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#52525b] mb-1">Monto (S/) *</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#52525b] mb-1">Fecha del gasto</label>
                      <input
                        type="date"
                        value={expenseDate}
                        onChange={e => setExpenseDate(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-[#f1f5f9]">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="pxp-btn flex-1 justify-center"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="pxp-btn primary flex-1 justify-center disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Registrar Gasto'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
