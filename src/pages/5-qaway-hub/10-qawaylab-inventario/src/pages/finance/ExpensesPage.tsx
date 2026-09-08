import { useState, useEffect, useMemo } from 'react'
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
  'w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-white text-sm placeholder:text-muted-light/40 focus:outline-none focus:ring-2 focus:ring-brand/50'

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
      setFormError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const filtered = expenses.filter(
    e =>
      e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category?.toLowerCase().includes(searchTerm.toLowerCase()),
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Gastos</h1>
          <p className="text-muted-light/60 text-sm mt-1">Registro de gastos operativos</p>
        </div>
        <button
          onClick={openForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Nuevo Gasto
        </button>
      </div>

      {/* Resumen + Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tarjetas de resumen */}
        <div className="space-y-4">
          <div className="bg-surface border border-white/10 rounded-xl p-4">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-light/60">Total Gastos</p>
            <p className="text-2xl font-bold text-red-400 mt-1">S/ {totalGastos.toFixed(2)}</p>
          </div>
          <div className="bg-surface border border-white/10 rounded-xl p-4">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-light/60">N° Gastos</p>
            <p className="text-2xl font-bold text-white mt-1">{filtered.length}</p>
          </div>
          <div className="bg-surface border border-white/10 rounded-xl p-4">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-light/60">Promedio</p>
            <p className="text-2xl font-bold text-white mt-1">
              S/ {filtered.length > 0 ? (totalGastos / filtered.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        {/* Gráfico de torta */}
        <div className="lg:col-span-2 bg-surface border border-white/10 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Distribución por Categoría</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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
                  wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                  formatter={(value: React.ReactNode) => (
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px]">
              <p className="text-muted-light/40 text-sm">Sin datos para graficar</p>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light/40" />
        <input
          type="text"
          placeholder="Buscar por descripción o categoría..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-gray-300 rounded-lg text-ink text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-brand" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Receipt size={48} className="mx-auto text-muted-light/20 mb-4" />
          <p className="text-muted-light/60">No hay gastos registrados</p>
          <p className="text-muted-light/40 text-sm mt-1">Registra tu primer gasto</p>
        </div>
      ) : (
        <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-light/60">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-light/60">Descripción</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-light/60">Categoría</th>
                <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-light/60">Monto</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(expense => {
                const catInfo = getCategoryInfo(expense.category)
                return (
                  <tr key={expense.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-light/60">
                      {new Date(expense.expense_date).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{expense.description}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded text-xs ${catInfo.textColor}`}>
                        <Tag size={10} />
                        {catInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-red-400 text-right font-medium">
                      - S/ {expense.amount.toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal: Nuevo Gasto ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />

          <div className="relative w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-red-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Receipt size={20} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Nuevo Gasto</h3>
                  <p className="text-xs text-muted-light/60">Registrar gasto operativo</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-muted-light hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {formError}
                </div>
              )}

              {/* Descripción */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-light/60 mb-1.5">
                  Descripción *
                </label>
                <input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ej: Pago de luz, alquiler, compra de insumos..."
                  className={inputCls}
                  autoFocus
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-light/60 mb-1.5">
                  Categoría *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                        category === cat.value
                          ? 'bg-brand/20 border border-brand/50 text-white'
                          : 'bg-background border border-white/10 text-muted-light hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Tag size={12} className={cat.textColor} />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Monto + Fecha */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-light/60 mb-1.5">
                    Monto (S/) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light/40 text-sm">S/</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 py-2 bg-background border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 text-lg font-medium text-red-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-light/60 mb-1.5">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-muted-light rounded-lg hover:bg-white/10 hover:text-white transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Registrar Gasto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
