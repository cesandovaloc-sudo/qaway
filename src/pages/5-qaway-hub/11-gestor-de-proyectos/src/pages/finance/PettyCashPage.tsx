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
  'w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm placeholder:text-[#94a3b8] focus:outline-none focus:border-[#ff4b0b]'

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
    <div className="pxp-root">
      <div className="pxp-layout">
        <main className="pxp-main">
          <div className="pxp-content">
            {/* Header oficial pxp */}
            <div className="pxp-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="pxp-heading-icon">
                  <DollarSign size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.8px', margin: '0 0 2px', color: '#111b2d' }}>
                    Caja Chica
                  </h1>
                  <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
                    Control de ingresos y egresos de caja menor y gastos corrientes.
                  </p>
                </div>
              </div>

              <div className="pxp-heading-actions">
                <button
                  onClick={() => openForm('ingreso')}
                  className="pxp-btn"
                  style={{ color: '#059669', borderColor: '#a7f3d0', background: '#ecfdf5' }}
                  title="Registrar nuevo ingreso a caja"
                >
                  <TrendingUp size={15} /> Nuevo Ingreso
                </button>
                <button
                  onClick={() => openForm('egreso')}
                  className="pxp-btn primary"
                  title="Registrar nuevo egreso de caja"
                >
                  <TrendingDown size={15} /> Nuevo Egreso
                </button>
              </div>
            </div>

            {/* Resumen Métricas oficiales pxp */}
            <section className="pxp-metrics" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
              <div className="pxp-metric">
                <div className="pxp-metric-top">
                  <span className="pxp-metric-label">Ingresos Totales</span>
                  <div className="pxp-metric-icon" style={{ color: '#059669', background: '#ecfdf5' }}><TrendingUp size={16} /></div>
                </div>
                <div className="pxp-metric-value" style={{ color: '#059669' }}>S/ {totalIngresos.toFixed(2)}</div>
                <div className="pxp-metric-note">Total sumado en caja</div>
              </div>

              <div className="pxp-metric">
                <div className="pxp-metric-top">
                  <span className="pxp-metric-label">Egresos Totales</span>
                  <div className="pxp-metric-icon" style={{ color: '#e11d48', background: '#fff1f2' }}><TrendingDown size={16} /></div>
                </div>
                <div className="pxp-metric-value" style={{ color: '#e11d48' }}>S/ {totalEgresos.toFixed(2)}</div>
                <div className="pxp-metric-note">Gastos y salidas efectuadas</div>
              </div>

              <div className="pxp-metric">
                <div className="pxp-metric-top">
                  <span className="pxp-metric-label">Balance Disponible</span>
                  <div className="pxp-metric-icon" style={{ color: balance >= 0 ? '#ff4b0b' : '#e11d48', background: '#fff2eb' }}><DollarSign size={16} /></div>
                </div>
                <div className="pxp-metric-value" style={{ color: balance >= 0 ? '#0f172a' : '#e11d48' }}>S/ {balance.toFixed(2)}</div>
                <div className="pxp-metric-note">{balance >= 0 ? 'Saldo a favor en caja' : 'Déficit en caja'}</div>
              </div>
            </section>

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
            ) : movements.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e4e4e7] p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#f4f4f5] text-[#52525b] grid place-items-center mx-auto mb-3 text-xl">
                  <DollarSign size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#111b2d] mb-1">No hay movimientos registrados</h3>
                <p className="text-sm text-[#71809e] mb-6 max-w-md mx-auto">
                  Registra tu primer ingreso o egreso de caja menor para mantener el balance al día.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => openForm('ingreso')}
                    className="pxp-btn"
                  >
                    <TrendingUp size={15} /> Registrar Ingreso
                  </button>
                  <button
                    onClick={() => openForm('egreso')}
                    className="pxp-btn primary"
                  >
                    <TrendingDown size={15} /> Registrar Egreso
                  </button>
                </div>
              </div>
            ) : (
              <div className="pxp-table-wrap">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Fecha</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Tipo</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Descripción</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Ref</th>
                        <th className="text-right px-4 py-3 font-semibold text-[#475569]">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {movements.map(movement => (
                        <tr key={movement.id} className="hover:bg-[#fafafa]">
                          <td className="px-4 py-3 text-sm text-[#64748b]">
                            {new Date(movement.created_at).toLocaleDateString('es-PE')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              movement.type === 'ingreso' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {movement.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#0f172a] font-medium">{movement.description}</td>
                          <td className="px-4 py-3 text-sm text-[#64748b]">{movement.reference || '—'}</td>
                          <td className={`px-4 py-3 text-sm font-bold text-right ${
                            movement.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {movement.type === 'ingreso' ? '+' : '-'} S/ {movement.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
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
                    <h2 className="text-lg font-bold text-[#111b2d]">
                      Nuevo {formType === 'ingreso' ? 'Ingreso a Caja' : 'Egreso de Caja'}
                    </h2>
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
                        placeholder="Ej. Pago de movilidad o recarga"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className={inputCls}
                      />
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
                      <label className="block text-xs font-semibold text-[#52525b] mb-1">Referencia / Comprobante</label>
                      <input
                        placeholder="N° de boleta, ticket o vale"
                        value={reference}
                        onChange={e => setReference(e.target.value)}
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
                      {saving ? 'Guardando...' : `Registrar ${formType === 'ingreso' ? 'Ingreso' : 'Egreso'}`}
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
