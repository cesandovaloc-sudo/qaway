import { useState, useEffect } from 'react'
import { Search, Loader2, AlertCircle, BookOpen, Plus, X, Check, Trash2 } from 'lucide-react'
import { supabase } from '@/config/supabase'

/* ── Cuentas contables predefinidas (Plan Contable Simplificado) ── */
const ACCOUNTS = [
  { code: '10', name: 'Caja' },
  { code: '11', name: 'Bancos' },
  { code: '12', name: 'Cuentas por Cobrar' },
  { code: '13', name: 'Inventario' },
  { code: '14', name: 'Anticipos' },
  { code: '20', name: 'Proveedores' },
  { code: '21', name: 'Cuentas por Pagar' },
  { code: '30', name: 'Capital' },
  { code: '31', name: 'Resultados Acumulados' },
  { code: '40', name: 'Ventas' },
  { code: '41', name: 'Servicios' },
  { code: '42', name: 'Otros Ingresos' },
  { code: '50', name: 'Compras' },
  { code: '51', name: 'Sueldos y Salarios' },
  { code: '52', name: 'Servicios Básicos' },
  { code: '53', name: 'Alquileres' },
  { code: '54', name: 'Materiales' },
  { code: '55', name: 'Publicidad' },
  { code: '56', name: 'Mantenimiento' },
  { code: '57', name: 'Impuestos y Tasas' },
  { code: '58', name: 'Transporte' },
  { code: '59', name: 'Otros Gastos' },
  { code: '60', name: 'Gastos Financieros' },
]

/* ── Types ── */
interface EntryLine {
  accountCode: string
  accountName: string
  description: string
  debit: number
  credit: number
}

interface AccountingEntry {
  id: string
  entry_number: string
  description: string
  entry_date: string
  reference: string | null
  status: string
  created_at: string
  total_debit: number
  total_credit: number
  is_balanced: boolean
  lines: EntryLine[]
}

const inputCls =
  'px-3 py-2 bg-background border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/50'
const selectCls =
  'px-3 py-2 bg-background border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 appearance-none'

export default function AccountingPage() {
  const [entries, setEntries] = useState<AccountingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [entryDesc, setEntryDesc] = useState('')
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0])
  const [entryReference, setEntryReference] = useState('')
  const [lines, setLines] = useState<EntryLine[]>([
    { accountCode: '', accountName: '', description: '', debit: 0, credit: 0 },
    { accountCode: '', accountName: '', description: '', debit: 0, credit: 0 },
  ])

  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    setLoading(true)
    setError(null)
    try {
      const { data: entriesData, error: entriesError } = await supabase
        .from('accounting_entries')
        .select('*')
        .order('created_at', { ascending: false })

      if (entriesError) throw entriesError

      const { data: linesData } = await supabase
        .from('accounting_entry_lines')
        .select('*')
        .order('created_at', { ascending: true })

      const linesMap = new Map<string, EntryLine[]>()
      for (const line of linesData || []) {
        const arr = linesMap.get(line.entry_id) || []
        arr.push({
          accountCode: line.account_code,
          accountName: line.account_name,
          description: line.description || '',
          debit: line.debit || 0,
          credit: line.credit || 0,
        })
        linesMap.set(line.entry_id, arr)
      }

      const enriched: AccountingEntry[] = (entriesData || []).map((e: any) => {
        const entryLines = linesMap.get(e.id) || []
        const totalDebit = entryLines.reduce((s, l) => s + l.debit, 0)
        const totalCredit = entryLines.reduce((s, l) => s + l.credit, 0)
        return {
          ...e,
          lines: entryLines,
          total_debit: totalDebit,
          total_credit: totalCredit,
          is_balanced: Math.abs(totalDebit - totalCredit) < 0.01,
        }
      })

      setEntries(enriched)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar asientos')
    } finally {
      setLoading(false)
    }
  }

  const filtered = entries.filter(
    e =>
      e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.entry_number?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalDebitAll = filtered.reduce((s, e) => s + e.total_debit, 0)
  const totalCreditAll = filtered.reduce((s, e) => s + e.total_credit, 0)

  /* ── Modal helpers ── */
  function resetForm() {
    setEntryDesc('')
    setEntryDate(new Date().toISOString().split('T')[0])
    setEntryReference('')
    setLines([
      { accountCode: '', accountName: '', description: '', debit: 0, credit: 0 },
      { accountCode: '', accountName: '', description: '', debit: 0, credit: 0 },
    ])
  }

  function addLine() {
    setLines([...lines, { accountCode: '', accountName: '', description: '', debit: 0, credit: 0 }])
  }

  function removeLine(index: number) {
    if (lines.length <= 2) return // mínimo 2 líneas
    setLines(lines.filter((_, i) => i !== index))
  }

  function updateLine(index: number, field: keyof EntryLine, value: string | number) {
    const updated = [...lines]
    if (field === 'accountCode') {
      const account = ACCOUNTS.find(a => a.code === value)
      updated[index] = {
        ...updated[index],
        accountCode: value as string,
        accountName: account?.name || '',
      }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setLines(updated)
  }

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0)
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0
  const isValid =
    entryDesc.trim() &&
    lines.length >= 2 &&
    lines.every(l => l.accountCode && l.accountName && (l.debit > 0 || l.credit > 0)) &&
    isBalanced

  async function handleSave(status: 'draft' | 'posted') {
    if (!isValid) return
    setSaving(true)
    try {
      const { data: entryData, error: entryError } = await supabase
        .from('accounting_entries')
        .insert({
          description: entryDesc.trim(),
          entry_date: entryDate,
          reference: entryReference.trim() || null,
          status,
        })
        .select()
        .single()

      if (entryError) throw entryError

      const lineInserts = lines.map(l => ({
        entry_id: entryData.id,
        account_code: l.accountCode,
        account_name: l.accountName,
        description: l.description.trim() || null,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
      }))

      const { error: linesError } = await supabase.from('accounting_entry_lines').insert(lineInserts)
      if (linesError) throw linesError

      setShowModal(false)
      resetForm()
      loadEntries()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar asiento')
    } finally {
      setSaving(false)
    }
  }

  async function cancelEntry(id: string) {
    try {
      await supabase.from('accounting_entries').update({ status: 'cancelled' }).eq('id', id)
      loadEntries()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Contabilidad</h1>
          <p className="text-muted-light/60 text-sm mt-1">Asientos contables con doble partida</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Nuevo Asiento
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-light/60">Total Débitos</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">S/ {totalDebitAll.toFixed(2)}</p>
        </div>
        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-light/60">Total Créditos</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">S/ {totalCreditAll.toFixed(2)}</p>
        </div>
        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-light/60">Balance</p>
          <p className={`text-2xl font-bold mt-1 ${Math.abs(totalDebitAll - totalCreditAll) < 0.01 ? 'text-green-400' : 'text-red-400'}`}>
            S/ {(totalDebitAll - totalCreditAll).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light/40" />
        <input
          type="text"
          placeholder="Buscar por descripción o número de asiento..."
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
          <BookOpen size={48} className="mx-auto text-muted-light/20 mb-4" />
          <p className="text-muted-light/60">No hay asientos contables registrados</p>
          <p className="text-muted-light/40 text-sm mt-1">Crea tu primer asiento con débito y crédito</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(entry => (
            <div key={entry.id} className="bg-surface border border-white/10 rounded-xl overflow-hidden">
              {/* Entry header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold text-brand">{entry.entry_number}</span>
                  <span className="text-sm text-white">{entry.description}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    entry.status === 'posted'
                      ? 'bg-green-500/10 text-green-400'
                      : entry.status === 'cancelled'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {entry.status === 'posted' ? 'Contabilizado' : entry.status === 'cancelled' ? 'Anulado' : 'Borrador'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-light/60">
                    {new Date(entry.entry_date).toLocaleDateString('es-PE')}
                  </span>
                  {entry.status === 'draft' && (
                    <button
                      onClick={() => cancelEntry(entry.id)}
                      className="p-1 text-muted-light/40 hover:text-red-400 transition-colors"
                      title="Anular asiento"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Lines table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-4 py-2 text-xs font-mono uppercase text-muted-light/60">Cuenta</th>
                      <th className="text-left px-4 py-2 text-xs font-mono uppercase text-muted-light/60">Descripción</th>
                      <th className="text-right px-4 py-2 text-xs font-mono uppercase text-muted-light/60">Débito</th>
                      <th className="text-right px-4 py-2 text-xs font-mono uppercase text-muted-light/60">Crédito</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.lines.map((line, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-2 text-sm">
                          <span className="text-brand font-mono">{line.accountCode}</span>
                          <span className="text-muted-light/60 ml-2">{line.accountName}</span>
                        </td>
                        <td className="px-4 py-2 text-sm text-muted-light/80">{line.description || '—'}</td>
                        <td className="px-4 py-2 text-sm text-right font-medium text-blue-400">
                          {line.debit > 0 ? `S/ ${line.debit.toFixed(2)}` : '—'}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-medium text-purple-400">
                          {line.credit > 0 ? `S/ ${line.credit.toFixed(2)}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-white/10 bg-white/5">
                      <td colSpan={2} className="px-4 py-2 text-sm font-medium text-muted-light/80">Totales</td>
                      <td className="px-4 py-2 text-sm text-right font-bold text-blue-400">S/ {entry.total_debit.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-right font-bold text-purple-400">S/ {entry.total_credit.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Balance indicator */}
              <div className="px-4 py-2 border-t border-white/5 flex items-center gap-2">
                {entry.is_balanced ? (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <Check size={12} /> Cuadrado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={12} /> Descuadrado — diferencia: S/ {Math.abs(entry.total_debit - entry.total_credit).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Nuevo Asiento ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Nuevo Asiento Contable</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-muted-light/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-4 space-y-4">
              {/* Datos del asiento */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-muted-light/60 mb-1">Descripción *</label>
                  <input
                    type="text"
                    value={entryDesc}
                    onChange={e => setEntryDesc(e.target.value)}
                    placeholder="Ej: Venta al contado, Pago proveedor..."
                    className={`w-full ${inputCls}`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-light/60 mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={e => setEntryDate(e.target.value)}
                    className={`w-full ${inputCls}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-light/60 mb-1">Referencia (opcional)</label>
                <input
                  type="text"
                  value={entryReference}
                  onChange={e => setEntryReference(e.target.value)}
                  placeholder="N° de comprobante, factura, etc."
                  className={`w-full ${inputCls}`}
                />
              </div>

              {/* Líneas del asiento */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-light/60">
                    Líneas del Asiento ({lines.length})
                  </label>
                  <button
                    onClick={addLine}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-brand hover:text-white bg-brand/10 hover:bg-brand/20 rounded transition-colors"
                  >
                    <Plus size={12} />
                    Agregar línea
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Header row */}
                  <div className="grid grid-cols-12 gap-2 px-3 text-xs font-mono uppercase text-muted-light/40">
                    <div className="col-span-2">Cuenta</div>
                    <div className="col-span-3">Nombre</div>
                    <div className="col-span-3">Descripción</div>
                    <div className="col-span-2 text-right">Débito (S/)</div>
                    <div className="col-span-2 text-right">Crédito (S/)</div>
                  </div>

                  {lines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-background rounded-lg p-2">
                      <div className="col-span-2">
                        <select
                          value={line.accountCode}
                          onChange={e => updateLine(idx, 'accountCode', e.target.value)}
                          className={`w-full text-xs ${selectCls}`}
                        >
                          <option value="">Cuenta</option>
                          {ACCOUNTS.map(a => (
                            <option key={a.code} value={a.code}>{a.code} — {a.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3 text-xs text-muted-light/60 truncate">
                        {line.accountName || '—'}
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={line.description}
                          onChange={e => updateLine(idx, 'description', e.target.value)}
                          placeholder="Detalle..."
                          className="w-full px-2 py-1.5 bg-background border border-white/10 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand/50"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.debit || ''}
                          onChange={e => updateLine(idx, 'debit', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-full px-2 py-1.5 bg-background border border-white/10 rounded text-blue-400 text-xs text-right focus:outline-none focus:ring-1 focus:ring-brand/50"
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.credit || ''}
                          onChange={e => updateLine(idx, 'credit', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-full px-2 py-1.5 bg-background border border-white/10 rounded text-purple-400 text-xs text-right focus:outline-none focus:ring-1 focus:ring-brand/50"
                        />
                        <button
                          onClick={() => removeLine(idx)}
                          disabled={lines.length <= 2}
                          className="p-1 text-muted-light/30 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Eliminar línea"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales y balance */}
                <div className="flex items-center justify-between mt-3 px-3 py-2 bg-background rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-light/60">
                      Débito: <span className="font-bold text-blue-400">S/ {totalDebit.toFixed(2)}</span>
                    </span>
                    <span className="text-xs text-muted-light/60">
                      Crédito: <span className="font-bold text-purple-400">S/ {totalCredit.toFixed(2)}</span>
                    </span>
                    <span className="text-xs text-muted-light/60">
                      Diferencia: <span className={`font-bold ${isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                        S/ {Math.abs(totalDebit - totalCredit).toFixed(2)}
                      </span>
                    </span>
                  </div>
                  {isBalanced ? (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <Check size={12} /> Cuadrado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-400">
                      <AlertCircle size={12} /> Descuadrado
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-muted-light hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSave('draft')}
                disabled={!isValid || saving}
                className="px-4 py-2 text-sm bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar Borrador'}
              </button>
              <button
                onClick={() => handleSave('posted')}
                disabled={!isValid || saving}
                className="px-4 py-2 text-sm bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Contabilizando...' : 'Contabilizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
