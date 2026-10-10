import { useState, useEffect } from 'react'
import { useDismissOnEscapeOrOutside } from '@/hooks/useDismissOnEscapeOrOutside'
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
  type: string
  extra_data: Record<string, unknown> | null
  notes: string | null
}

const inputCls =
  'w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm focus:outline-none focus:border-[#ff4b0b]'
const selectCls =
  'px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm focus:outline-none focus:border-[#ff4b0b]'

// Los proveedores son clientes con tipo 'proveedor' en la tabla customers
export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const modalRef = useDismissOnEscapeOrOutside(showModal, () => setShowModal(false))
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
        .eq('type', 'company')
        .contains('extra_data', { is_supplier: true })
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
      String(s.extra_data?.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase()),
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
    if (!isValid || saving) return
    setSaving(true)
    setError(null)

    try {
      const { error: insertError } = await supabase.from('customers').insert({
        name: form.name.trim(),
        type: 'company',
        doc_type: form.doc_type,
        doc_number: form.doc_number.trim() || null,
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        notes: form.notes.trim() || null,
        extra_data: {
          is_supplier: true,
          contact_name: form.contact_name.trim() || null,
          contact_phone: form.contact_phone.trim() || null,
          contact_email: form.contact_email.trim() || null,
        },
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
    <div className="pxp-root">
      <div className="pxp-layout">
        <main className="pxp-main">
          <div className="pxp-content">
            {/* Header oficial pxp */}
            <div className="pxp-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="pxp-heading-icon">
                  <Truck size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.8px', margin: '0 0 2px', color: '#111b2d' }}>
                    Proveedores
                  </h1>
                  <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
                    Directorio comercial de proveedores, contactos y compras logísticas.
                  </p>
                </div>
              </div>

              <div className="pxp-heading-actions">
                <button
                  onClick={() => { resetForm(); setShowModal(true) }}
                  className="pxp-btn primary"
                  title="Registrar un nuevo proveedor"
                >
                  <Plus size={15} /> Nuevo Proveedor
                </button>
              </div>
            </div>

            {/* Toolbar oficial pxp */}
            <div className="pxp-toolbar">
              <div className="pxp-search">
                <Search size={15} style={{ color: 'var(--muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, documento o contacto..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
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
                  <Truck size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#111b2d] mb-1">
                  {searchTerm ? 'Sin coincidencias' : 'No hay proveedores registrados'}
                </h3>
                <p className="text-sm text-[#71809e] mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? 'No se encontraron proveedores que coincidan con la búsqueda.' 
                    : 'Registra tus proveedores habituales para asociar órdenes de compra y facturas.'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => { resetForm(); setShowModal(true) }}
                    className="pxp-btn primary"
                  >
                    <Plus size={15} /> Crear primer proveedor
                  </button>
                )}
              </div>
            ) : (
              <div className="pxp-table-wrap">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Nombre</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Documento</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Contacto</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Dirección</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Teléfono</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#475569]">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {filtered.map(supplier => (
                        <tr key={supplier.id} className="hover:bg-[#fafafa]">
                          <td className="px-4 py-3 text-sm text-[#0f172a] font-semibold">{supplier.name}</td>
                          <td className="px-4 py-3 text-sm">
                            {supplier.doc_type && supplier.doc_number ? (
                              <span className="inline-flex items-center px-2 py-0.5 bg-[#f4f4f5] text-[#18181b] border border-[#e4e4e7] rounded text-xs font-mono">
                                {supplier.doc_type} {supplier.doc_number}
                              </span>
                            ) : (
                              <span className="text-[#94a3b8]">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#475569]">
                             {(supplier.extra_data?.contact_name as string) || '—'}
                             {(supplier.extra_data?.contact_phone as string) && (
                               <span className="block text-xs text-[#94a3b8]">{supplier.extra_data?.contact_phone as string}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#475569]">{supplier.address || '—'}</td>
                          <td className="px-4 py-3 text-sm text-[#475569]">{supplier.phone || '—'}</td>
                          <td className="px-4 py-3 text-sm text-[#475569]">{supplier.email || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Nuevo Proveedor */}
            {showModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                onClick={() => setShowModal(false)}
              >
                <div
                  ref={modalRef}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-[#e4e4e7] max-h-[90vh] overflow-y-auto space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                    <h2 className="text-lg font-bold text-[#111b2d]">Nuevo Proveedor</h2>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="text-[#71809e] hover:text-[#111b2d] font-bold text-lg cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#52525b] mb-1">Razón Social / Nombre *</label>
                      <input
                        placeholder="Ej. Distribuidora del Norte S.A.C."
                        value={form.name}
                        onChange={e => updateField('name', e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#52525b] mb-1">Doc.</label>
                        <select
                          value={form.doc_type}
                          onChange={e => updateField('doc_type', e.target.value)}
                          className={selectCls}
                        >
                          <option value="RUC">RUC</option>
                          <option value="DNI">DNI</option>
                          <option value="CE">CE</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-[#52525b] mb-1">Número</label>
                        <input
                          placeholder="20123456789"
                          value={form.doc_number}
                          onChange={e => updateField('doc_number', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#52525b] mb-1">Teléfono</label>
                        <input
                          placeholder="999 888 777"
                          value={form.phone}
                          onChange={e => updateField('phone', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#52525b] mb-1">Email</label>
                        <input
                          placeholder="ventas@proveedor.com"
                          value={form.email}
                          onChange={e => updateField('email', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#52525b] mb-1">Dirección fiscal</label>
                      <input
                        placeholder="Av. Industrial 123, Lima"
                        value={form.address}
                        onChange={e => updateField('address', e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <div className="border-t border-[#f1f5f9] pt-3">
                      <span className="block text-xs font-bold text-[#111b2d] mb-2 uppercase">Contacto Comercial</span>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          placeholder="Nombre contacto"
                          value={form.contact_name}
                          onChange={e => updateField('contact_name', e.target.value)}
                          className={inputCls}
                        />
                        <input
                          placeholder="Teléfono contacto"
                          value={form.contact_phone}
                          onChange={e => updateField('contact_phone', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-[#f1f5f9]">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="pxp-btn flex-1 justify-center"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!isValid || saving}
                      className="pxp-btn primary flex-1 justify-center disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Guardar Proveedor'}
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
