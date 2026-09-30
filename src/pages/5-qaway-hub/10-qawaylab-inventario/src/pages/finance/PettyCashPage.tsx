import { useState, useEffect } from 'react'
import { useDismissOnEscapeOrOutside } from '@/hooks/useDismissOnEscapeOrOutside'
import { Loader2, AlertCircle, DollarSign, TrendingUp, TrendingDown, X } from 'lucide-react'
import { supabase } from '@/config/supabase'

interface PettyCashMovement {
  id: string
  type: 'ingreso' | 'egreso'
  description: string
  amount: number
  reference: string | null
  created_at: string
  created_by: string | null
}

const inputCls =
  'w-full px-3 py-2 bg-background border border-zinc-200 rounded-lg text-ink text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/50'

export default function PettyCashPage() {
  const [movements, setMovements] = useState<PettyCashMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Modal ──
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<'ingreso' | 'egreso'>('ingreso')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
  const [saving, setSaving] = useState(false)
  const modalRef = useDismissOnEscapeOrOutside(showForm, () => setShowForm(false))
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    loadMovements()
  }, [])

  async function loadMovements() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('petty_cash_movements')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setMovements(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar movimientos')
    } finally {
      setLoading(false)
    }
  }

  const openForm = (type: 'ingreso' | 'egreso') => {
    setFormType(type)
    setDescription('')
    setAmount('')
    setReference('')
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

      const { error: insertError } = await supabase.from('petty_cash_movements').insert({
        type: formType,
        description: description.trim(),
        amount: parsed,
        reference: reference.trim() || null,
        created_by: userId,
      })

      if (insertError) throw insertError

      setShowForm(false)
      await loadMovements()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const totalIngresos = movements.filter(m => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0)
  const totalEgresos = movements.filter(m => m.type === 'egreso').reduce((sum, m) => sum + m.amount, 0)
  const balance = totalIngresos - totalEgresos

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">Caja Chica</h1>
          <p className="text-muted text-sm mt-1">Control de ingresos y egresos diarios</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openForm('ingreso')}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <TrendingUp size={16} />
            Nuevo Ingreso
          </button>
          <button
            onClick={() => openForm('egreso')}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <TrendingDown size={16} />
            Nuevo Egreso
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-zinc-200 rounded-xl p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-muted ">Ingresos</p>
          <p className="text-2xl font-bold text-green-400 mt-1">S/ {totalIngresos.toFixed(2)}</p>
        </div>
        <div className="bg-surface border border-zinc-200 rounded-xl p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-muted ">Egresos</p>
          <p className="text-2xl font-bold text-red-400 mt-1">S/ {totalEgresos.toFixed(2)}</p>
        </div>
        <div className="bg-surface border border-zinc-200 rounded-xl p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-muted ">Balance</p>
          <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-ink' : 'text-red-400'}`}>S/ {balance.toFixed(2)}</p>
        </div>
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
      ) : movements.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign size={48} className="mx-auto text-muted mb-4" />
          <p className="text-muted ">No hay movimientos registrados</p>
          <p className="text-muted text-sm mt-1">Registra tu primer ingreso o egreso</p>
        </div>
      ) : (
        <div className="bg-surface border border-zinc-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted ">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted ">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted ">Descripción</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted ">Ref</th>
                <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted ">Monto</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(movement => (
                <tr key={movement.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-muted ">
                    {new Date(movement.created_at).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs ${
                      movement.type === 'ingreso' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {movement.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink">{movement.description}</td>
                  <td className="px-4 py-3 text-sm text-muted ">{movement.reference || '—'}</td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${
                    movement.type === 'ingreso' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {movement.type === 'ingreso' ? '+' : '-'} S/ {movement.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal: Nuevo Movimiento ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />

          {/* Modal */}
          <div ref={modalRef} className="relative w-full max-w-md bg-surface border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b border-zinc-200 ${
              formType === 'ingreso' ? 'bg-green-500/5' : 'bg-red-500/5'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  formType === 'ingreso' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {formType === 'ingreso' ? (
                    <TrendingUp size={20} className="text-green-400" />
                  ) : (
                    <TrendingDown size={20} className="text-red-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">
                    {formType === 'ingreso' ? 'Nuevo Ingreso' : 'Nuevo Egreso'}
                  </h3>
                  <p className="text-xs text-muted ">
                    {formType === 'ingreso' ? 'Registra un ingreso a caja' : 'Registra un egreso de caja'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-muted hover:text-ink hover:bg-zinc-50 rounded-lg transition-colors"
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
                <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
                  Descripción *
                </label>
                <input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={formType === 'ingreso' ? 'Ej: Pago de cliente, préstamo...' : 'Ej: Pago de servicio, compra menor...'}
                  className={inputCls}
                  autoFocus
                />
              </div>

              {/* Monto */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
                  Monto (S/) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">S/</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`${inputCls} pl-10 text-lg font-medium ${
                      formType === 'ingreso' ? 'text-green-400' : 'text-red-400'
                    }`}
                  />
                </div>
              </div>

              {/* Referencia */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
                  Referencia
                </label>
                <input
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  placeholder="N° de comprobante, voucher, etc. (opcional)"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-200 flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-200 text-muted rounded-lg hover:bg-zinc-100 hover:text-ink transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-ink rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                  formType === 'ingreso'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>Registrar {formType === 'ingreso' ? 'Ingreso' : 'Egreso'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
