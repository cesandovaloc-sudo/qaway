import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, Trash2, Loader2, AlertCircle, ArrowLeft, Plus, Truck, Check, UserPlus, X } from 'lucide-react'
import { supabase } from '@/config/supabase'
import { purchaseService } from '@/services/purchaseService'
import type { Customer, Product } from '@/types'

interface Line {
  product_id: string | null
  product_title: string
  quantity: number
  unit_price: number
}

const inputCls =
  'w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-white text-sm placeholder:text-muted-light/40 focus:outline-none focus:ring-2 focus:ring-brand/50'

type Step = 'supplier' | 'products' | 'confirm'

export default function NewPurchaseOrderPage() {
  const navigate = useNavigate()

  // ── Wizard ──
  const [step, setStep] = useState<Step>('supplier')

  // ── Proveedor ──
  const [supplier, setSupplier] = useState<Customer | null>(null)
  const [supplierQuery, setSupplierQuery] = useState('')
  const [supplierResults, setSupplierResults] = useState<Customer[]>([])
  const [supplierOpen, setSupplierOpen] = useState(false)

  // ── Modal crear proveedor rápido ──
  const [showNewSupplier, setShowNewSupplier] = useState(false)
  const [newSupplierName, setNewSupplierName] = useState('')
  const [newSupplierDoc, setNewSupplierDoc] = useState('')
  const [newSupplierPhone, setNewSupplierPhone] = useState('')
  const [newSupplierEmail, setNewSupplierEmail] = useState('')
  const [savingSupplier, setSavingSupplier] = useState(false)

  // ── Productos ──
  const [productQuery, setProductQuery] = useState('')
  const [productResults, setProductResults] = useState<Product[]>([])
  const [productOpen, setProductOpen] = useState(false)

  // ── Líneas ──
  const [lines, setLines] = useState<Line[]>([])
  const [notes, setNotes] = useState('')

  // ── Estado ──
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Búsquedas ──
  const searchSuppliers = async (query: string) => {
    if (!query.trim()) {
      setSupplierResults([])
      return
    }
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('customer_type', 'proveedor')
      .or(`name.ilike.%${query}%,doc_number.ilike.%${query}%`)
      .order('name')
      .limit(8)
    setSupplierResults((data || []) as unknown as Customer[])
  }

  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setProductResults([])
      return
    }
    const { data } = await supabase
      .from('products')
      .select('id, name, sku, base_price, cost, unit')
      .eq('status', 'active')
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
      .order('name')
      .limit(8)
    setProductResults((data || []) as unknown as Product[])
  }

  // ── Crear proveedor rápido ──
  const handleCreateSupplier = async () => {
    if (!newSupplierName.trim()) return
    setSavingSupplier(true)
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: newSupplierName.trim(),
          doc_type: newSupplierDoc ? 'RUC' : null,
          doc_number: newSupplierDoc.trim() || null,
          phone: newSupplierPhone.trim() || null,
          email: newSupplierEmail.trim() || null,
          customer_type: 'proveedor',
        })
        .select()
        .single()

      if (error) throw error
      setSupplier(data as unknown as Customer)
      setShowNewSupplier(false)
      setNewSupplierName('')
      setNewSupplierDoc('')
      setNewSupplierPhone('')
      setNewSupplierEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear proveedor')
    } finally {
      setSavingSupplier(false)
    }
  }

  // ── Líneas ──
  const addLine = (product: Product) => {
    setLines(prev => {
      const existing = prev.find(l => l.product_id === product.id)
      if (existing) {
        return prev.map(l =>
          l.product_id === product.id ? { ...l, quantity: l.quantity + 1 } : l,
        )
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_title: product.name,
          quantity: 1,
          unit_price: product.cost || product.base_price || 0,
        },
      ]
    })
    setProductQuery('')
    setProductResults([])
    setProductOpen(false)
  }

  const addCustomLine = () => {
    setLines(prev => [
      ...prev,
      {
        product_id: null,
        product_title: '',
        quantity: 1,
        unit_price: 0,
      },
    ])
  }

  const updateLine = (index: number, patch: Partial<Line>) => {
    setLines(prev => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  }

  const removeLine = (index: number) => {
    setLines(prev => prev.filter((_, i) => i !== index))
  }

  // ── Totales ──
  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0)

  // ── Guardar ──
  const handleSave = async (status: 'draft' | 'pending') => {
    if (lines.length === 0) {
      setError('Agrega al menos un producto a la orden')
      return
    }

    if (lines.some(l => !l.product_title.trim())) {
      setError('Todos los productos deben tener nombre')
      return
    }

    try {
      setSaving(true)
      setError(null)
      const order = await purchaseService.createOrder({
        supplier_id: supplier?.id || null,
        supplier_name: supplier?.name || null,
        items: lines.map(l => ({
          product_id: l.product_id,
          product_title: l.product_title,
          quantity: l.quantity,
          unit_price: l.unit_price,
        })),
        notes: notes.trim() || undefined,
      })

      if (status !== 'draft') {
        await purchaseService.updateStatus(order.id, status)
      }

      navigate('/compras')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la orden')
    } finally {
      setSaving(false)
    }
  }

  // ── Steps ──
  const steps: { id: Step; label: string }[] = [
    { id: 'supplier', label: 'Proveedor' },
    { id: 'products', label: 'Productos' },
    { id: 'confirm', label: 'Confirmar' },
  ]

  const canAdvance = (s: Step) => {
    if (s === 'supplier') return true // proveedor es opcional
    if (s === 'products') return lines.length > 0
    return false
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/compras"
            className="p-2 text-muted-light hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Nueva Orden de Compra</h1>
            <p className="text-muted-light/60 text-sm mt-1">Registrar compra a proveedor</p>
          </div>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (i === 0 || (i === 1 && canAdvance('supplier')) || (i === 2 && canAdvance('products'))) {
                  setStep(s.id)
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                step === s.id
                  ? 'bg-brand text-white'
                  : i < steps.findIndex(x => x.id === step)
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-white/5 text-muted-light/60'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                step === s.id
                  ? 'bg-white text-brand'
                  : i < steps.findIndex(x => x.id === step)
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-muted-light/60'
              }`}>
                {i < steps.findIndex(x => x.id === step) ? <Check size={12} /> : i + 1}
              </span>
              {s.label}
            </button>
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 ${i < steps.findIndex(x => x.id === step) ? 'bg-green-500' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Izquierda: contenido del paso */}
        <div className="lg:col-span-2 space-y-4">
          {/* ── PASO 1: Proveedor ── */}
          {step === 'supplier' && (
            <div className="bg-surface border border-white/10 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Seleccionar Proveedor</h2>
                <button
                  onClick={() => setShowNewSupplier(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand hover:text-white bg-brand/10 hover:bg-brand/20 rounded-lg transition-colors"
                >
                  <UserPlus size={12} />
                  Crear nuevo
                </button>
              </div>

              {supplier ? (
                <div className="flex items-center justify-between p-4 bg-brand/10 border border-brand/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-brand/20 flex items-center justify-center">
                      <Truck size={20} className="text-brand" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{supplier.name}</p>
                      <p className="text-xs text-muted-light/60">
                        {supplier.doc_type && supplier.doc_number
                          ? `${supplier.doc_type} ${supplier.doc_number}`
                          : 'Sin documento'}
                        {supplier.phone && ` · ${supplier.phone}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSupplier(null)}
                    className="p-2 text-muted-light hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light/40" />
                  <input
                    value={supplierQuery}
                    onChange={e => {
                      setSupplierQuery(e.target.value)
                      setSupplierOpen(true)
                      searchSuppliers(e.target.value)
                    }}
                    onFocus={() => setSupplierOpen(true)}
                    placeholder="Buscar proveedor por nombre o RUC..."
                    className={`${inputCls} pl-9`}
                    autoFocus
                  />
                  {supplierOpen && supplierResults.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-surface border border-white/10 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {supplierResults.map(s => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setSupplier(s)
                            setSupplierOpen(false)
                            setSupplierQuery('')
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        >
                          <span className="block text-sm text-white font-medium">{s.name}</span>
                          <span className="block text-xs text-muted-light/60">
                            {s.doc_type && s.doc_number
                              ? `${s.doc_type} ${s.doc_number}`
                              : 'Sin documento'}
                            {s.phone && ` · ${s.phone}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-light/40">
                El proveedor es opcional. Puedes saltar este paso.
              </p>
            </div>
          )}

          {/* ── PASO 2: Productos ── */}
          {step === 'products' && (
            <div className="space-y-4">
              {/* Buscador de productos */}
              <div className="bg-surface border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-light/60">
                    Buscar productos
                  </label>
                  <button
                    onClick={addCustomLine}
                    className="flex items-center gap-1 text-xs text-brand hover:text-brand-light transition-colors"
                  >
                    <Plus size={12} />
                    Agregar manual
                  </button>
                </div>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light/40" />
                  <input
                    value={productQuery}
                    onChange={e => {
                      setProductQuery(e.target.value)
                      setProductOpen(true)
                      searchProducts(e.target.value)
                    }}
                    onFocus={() => setProductOpen(true)}
                    placeholder="Buscar por nombre o SKU..."
                    className={`${inputCls} pl-9`}
                    autoFocus
                  />
                  {productOpen && productResults.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-surface border border-white/10 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {productResults.map(p => (
                        <button
                          key={p.id}
                          onClick={() => addLine(p)}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center justify-between border-b border-white/5 last:border-0"
                        >
                          <div>
                            <span className="block text-sm text-white font-medium">{p.name}</span>
                            <span className="block text-xs text-muted-light/60">
                              SKU: {p.sku || '—'} · Stock: {(p as any).stock ?? '—'}
                            </span>
                          </div>
                          <span className="text-sm text-brand font-medium">
                            S/ {(p.cost || p.base_price || 0).toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Líneas de la orden */}
              <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-light/60">
                    Items de la orden ({lines.length})
                  </p>
                </div>
                {lines.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <Truck size={48} className="mx-auto text-muted-light/20 mb-3" />
                    <p className="text-muted-light/60 text-sm">Aún no hay productos</p>
                    <p className="text-muted-light/40 text-xs mt-1">Busca un producto o haz clic en "Agregar manual"</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {lines.map((line, index) => (
                      <div key={index} className="px-4 py-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          {line.product_id ? (
                            <span className="text-sm text-white truncate block">{line.product_title}</span>
                          ) : (
                            <input
                              value={line.product_title}
                              onChange={e => updateLine(index, { product_title: e.target.value })}
                              placeholder="Nombre del producto..."
                              className={`${inputCls} text-xs`}
                            />
                          )}
                        </div>
                        <div className="w-20">
                          <input
                            type="number"
                            min={1}
                            value={line.quantity}
                            onChange={e =>
                              updateLine(index, { quantity: Math.max(1, parseInt(e.target.value) || 1) })
                            }
                            className={`${inputCls} text-xs text-center`}
                          />
                        </div>
                        <div className="w-28">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={line.unit_price}
                            onChange={e =>
                              updateLine(index, { unit_price: parseFloat(e.target.value) || 0 })
                            }
                            className={`${inputCls} text-xs text-right`}
                          />
                        </div>
                        <div className="w-24 text-right">
                          <span className="text-sm text-white font-medium">
                            S/ {(line.quantity * line.unit_price).toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeLine(index)}
                          className="p-1.5 text-muted-light hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PASO 3: Confirmar ── */}
          {step === 'confirm' && (
            <div className="space-y-4">
              {/* Resumen del proveedor */}
              {supplier && (
                <div className="bg-surface border border-white/10 rounded-xl p-4">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-light/60 mb-2">Proveedor</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand/20 flex items-center justify-center">
                      <Truck size={18} className="text-brand" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{supplier.name}</p>
                      <p className="text-xs text-muted-light/60">
                        {supplier.doc_type} {supplier.doc_number}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de productos */}
              <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-light/60">
                    Productos ({lines.length})
                  </p>
                </div>
                <div className="divide-y divide-white/5">
                  {lines.map((line, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <span className="text-sm text-white">{line.product_title}</span>
                        <span className="text-xs text-muted-light/60 ml-2">
                          {line.quantity} × S/ {line.unit_price.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        S/ {(line.quantity * line.unit_price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas */}
              <div className="bg-surface border border-white/10 rounded-xl p-4">
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-light/60 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Observaciones de la orden..."
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Derecha: resumen + acciones */}
        <div className="space-y-4">
          {/* Resumen */}
          <div className="bg-surface border border-white/10 rounded-xl p-4 space-y-3">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-light/60">Resumen</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-light/60">Proveedor</span>
                <span className="text-white text-xs">{supplier?.name || 'Sin proveedor'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-light/60">Items</span>
                <span className="text-white">{lines.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-light/60">Subtotal</span>
                <span className="text-white">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between">
                <span className="text-sm font-medium text-white">Total</span>
                <span className="text-lg font-bold text-brand">S/ {subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <div className="space-y-2">
            {step !== 'confirm' ? (
              <>
                <button
                  onClick={() => {
                    if (step === 'supplier') setStep('products')
                    else if (step === 'products') setStep('confirm')
                  }}
                  disabled={!canAdvance(step)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ArrowLeft size={16} className="rotate-180" />
                </button>
                {step === 'products' && (
                  <button
                    onClick={() => setStep('supplier')}
                    className="w-full px-4 py-2.5 text-sm text-muted-light hover:text-white transition-colors"
                  >
                    ← Volver a Proveedor
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSave('pending')}
                  disabled={saving || lines.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Truck size={16} />
                      Guardar y Enviar
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleSave('draft')}
                  disabled={saving || lines.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-muted-light rounded-lg hover:bg-white/10 hover:text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar Borrador
                </button>
                <button
                  onClick={() => setStep('products')}
                  className="w-full px-4 py-2.5 text-sm text-muted-light hover:text-white transition-colors"
                >
                  ← Volver a Productos
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal: Crear Proveedor Rápido ── */}
      {showNewSupplier && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowNewSupplier(false) }}
        >
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Crear Proveedor</h2>
              <button onClick={() => setShowNewSupplier(false)} className="p-1 text-muted-light/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs text-muted-light/60 mb-1">Razón Social / Nombre *</label>
                <input
                  type="text"
                  value={newSupplierName}
                  onChange={e => setNewSupplierName(e.target.value)}
                  placeholder="Ej: Distribuidora ABC SAC"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-light/60 mb-1">RUC</label>
                  <input
                    type="text"
                    value={newSupplierDoc}
                    onChange={e => setNewSupplierDoc(e.target.value)}
                    placeholder="20XXXXXXXXX"
                    maxLength={11}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-light/60 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={newSupplierPhone}
                    onChange={e => setNewSupplierPhone(e.target.value)}
                    placeholder="999 888 777"
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-light/60 mb-1">Email</label>
                <input
                  type="email"
                  value={newSupplierEmail}
                  onChange={e => setNewSupplierEmail(e.target.value)}
                  placeholder="proveedor@email.com"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
              <button
                onClick={() => setShowNewSupplier(false)}
                className="px-4 py-2 text-sm text-muted-light hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateSupplier}
                disabled={!newSupplierName.trim() || savingSupplier}
                className="px-4 py-2 text-sm bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {savingSupplier ? 'Creando...' : 'Crear y Seleccionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
