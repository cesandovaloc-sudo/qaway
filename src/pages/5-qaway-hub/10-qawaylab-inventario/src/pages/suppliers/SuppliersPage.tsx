import { useState, useEffect } from 'react'
import { Search, Plus, Loader2, AlertCircle, Truck, X } from 'lucide-react'
import { supabase } from '@/config/supabase'

interface Supplier {
  id: string
  name: string
  doc_type: string | null
  doc_number: string | null
  address: string | null
  phone: string | null
  email: string | null
  customer_type: string
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  notes: string | null
}

const inputCls =
  'w-full px-3 py-2 bg-background border border-zinc-200 rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand/50'
const selectCls =
  'px-3 py-2 bg-background border border-zinc-200 rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 appearance-none'

// Los proveedores son clientes con tipo 'proveedor' en la tabla customers
export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    doc_type: 'RUC',
    doc_number: '',
    address: '',
    phone: '',
    email: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    notes: '',
  })

  useEffect(() => {
    loadSuppliers()
  }, [])

  async function loadSuppliers() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_type', 'proveedor')
        .order('name')

      if (fetchError) throw fetchError
      setSuppliers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar proveedores')
    } finally {
      setLoading(false)
    }
  }

  const filtered = suppliers.filter(
    s =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.doc_number?.includes(searchTerm) ||
      s.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  function resetForm() {
    setForm({
      name: '',
      doc_type: 'RUC',
      doc_number: '',
      address: '',
      phone: '',
      email: '',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      notes: '',
    })
  }

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const isValid = form.name.trim().length > 0

  async function handleSave() {
    if (!isValid) return
    setSaving(true)
    try {
      const { error: insertError } = await supabase.from('customers').insert({
        name: form.name.trim(),
        doc_type: form.doc_type || null,
        doc_number: form.doc_number.trim() || null,
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        contact_name: form.contact_name.trim() || null,
        contact_phone: form.contact_phone.trim() || null,
        contact_email: form.contact_email.trim() || null,
        notes: form.notes.trim() || null,
        customer_type: 'proveedor',
      })

      if (insertError) throw insertError

      setShowModal(false)
      resetForm()
      loadSuppliers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar proveedor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">Proveedores</h1>
          <p className="text-muted text-sm mt-1">Gestión de proveedores y compras</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Nuevo Proveedor
        </button>
      </div>

      {/* Search — sticky anti-scroll (ref HubPanelPage.jsx:990) */}
      <div className="sticky top-0 z-30 relative bg-white/95 backdrop-blur-md py-1 rounded-lg">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted " />
        <input
          type="text"
          placeholder="Buscar por nombre, documento o contacto..."
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
          <Truck size={48} className="mx-auto text-muted mb-4" />
          <p className="text-muted ">No hay proveedores registrados</p>
          <p className="text-muted text-sm mt-1">Crea tu primer proveedor para comenzar</p>
        </div>
      ) : (
        <div className="bg-surface border border-zinc-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted ">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted ">Documento</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted ">Contacto</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted ">Dirección</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted ">Teléfono</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted ">Email</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(supplier => (
                <tr key={supplier.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-ink font-medium">{supplier.name}</td>
                  <td className="px-4 py-3 text-sm">
                    {supplier.doc_type && supplier.doc_number ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand/10 text-brand rounded text-xs font-mono">
                        {supplier.doc_type} {supplier.doc_number}
                      </span>
                    ) : (
                      <span className="text-muted ">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted ">
                    {supplier.contact_name || '—'}
                    {supplier.contact_phone && (
                      <span className="block text-xs text-muted ">{supplier.contact_phone}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted ">{supplier.address || '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted ">{supplier.phone || '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted ">{supplier.email || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal Nuevo Proveedor ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-surface border border-zinc-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
              <h2 className="text-lg font-semibold text-ink">Nuevo Proveedor</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-muted hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-4 space-y-5">
              {/* Datos del proveedor */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-muted mb-3">Datos del Proveedor</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-muted mb-1">Razón Social / Nombre *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => updateField('name', e.target.value)}
                      placeholder="Ej: Distribuidora ABC SAC"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Tipo de Documento</label>
                    <select
                      value={form.doc_type}
                      onChange={e => updateField('doc_type', e.target.value)}
                      className={selectCls}
                    >
                      <option value="RUC">RUC</option>
                      <option value="DNI">DNI</option>
                      <option value="CE">Carnet de Extranjería</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">N° de Documento</label>
                    <input
                      type="text"
                      value={form.doc_number}
                      onChange={e => updateField('doc_number', e.target.value)}
                      placeholder={form.doc_type === 'RUC' ? '20XXXXXXXXX' : '12345678'}
                      maxLength={form.doc_type === 'RUC' ? 11 : 8}
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-muted mb-1">Dirección</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={e => updateField('address', e.target.value)}
                      placeholder="Av. Principal 123, Lima"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => updateField('phone', e.target.value)}
                      placeholder="999 888 777"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => updateField('email', e.target.value)}
                      placeholder="proveedor@email.com"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Contacto principal */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-muted mb-3">Contacto Principal</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-muted mb-1">Nombre</label>
                    <input
                      type="text"
                      value={form.contact_name}
                      onChange={e => updateField('contact_name', e.target.value)}
                      placeholder="Juan Pérez"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={form.contact_phone}
                      onChange={e => updateField('contact_phone', e.target.value)}
                      placeholder="999 888 777"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Email</label>
                    <input
                      type="email"
                      value={form.contact_email}
                      onChange={e => updateField('contact_email', e.target.value)}
                      placeholder="contacto@email.com"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-xs text-muted mb-1">Notas (opcional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => updateField('notes', e.target.value)}
                  placeholder="Condiciones de pago, horarios de entrega, etc."
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-muted hover:text-ink transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!isValid || saving}
                className="px-4 py-2 text-sm bg-brand text-white rounded-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar Proveedor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
