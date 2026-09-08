import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search,
  Trash2,
  Loader2,
  AlertCircle,
  UserRound,
  Banknote,
  ArrowLeft,
  Check,
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { customerService } from '@/services/customerService'
import { saleService } from '@/services/saleService'
import type { Customer, PaymentMethod, Product } from '@/types'
import { calcSaleTotals, calcLineSubtotal } from '@/utils/sales'

interface Line {
  product_id: string
  product_title: string
  quantity: number
  unit_price: number
}

const methodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'yape', label: 'Yape' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
]

export default function NewSalePage() {
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerResults, setCustomerResults] = useState<Customer[]>([])
  const [customerOpen, setCustomerOpen] = useState(false)

  const [productQuery, setProductQuery] = useState('')
  const [productResults, setProductResults] = useState<Product[]>([])
  const [productOpen, setProductOpen] = useState(false)

  const [lines, setLines] = useState<Line[]>([])
  const [discount, setDiscount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('efectivo')
  const [paidAmount, setPaidAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totals = useMemo(() => calcSaleTotals(lines, Number(discount) || 0), [lines, discount])

  const searchCustomers = async (query: string) => {
    if (!query.trim()) {
      setCustomerResults([])
      return
    }
    const results = await customerService.searchCustomers(query)
    setCustomerResults(results)
  }

  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setProductResults([])
      return
    }
    const { data } = await supabase
      .from('products')
      .select('id, name, sku, base_price, stock, unit')
      .eq('status', 'active')
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
      .order('name')
      .limit(8)
    setProductResults((data || []) as unknown as Product[])
  }

  const addLine = (product: Product) => {
    setLines(prev => {
      const existing = prev.find(l => l.product_id === product.id)
      if (existing) {
        return prev.map(l =>
          l.product_id === product.id ? { ...l, quantity: l.quantity + 1 } : l
        )
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_title: product.name,
          quantity: 1,
          unit_price: product.base_price || 0,
        },
      ]
    })
    setProductQuery('')
    setProductResults([])
    setProductOpen(false)
  }

  const updateLine = (productId: string, patch: Partial<Line>) => {
    setLines(prev => prev.map(l => (l.product_id === productId ? { ...l, ...patch } : l)))
  }

  const removeLine = (productId: string) => {
    setLines(prev => prev.filter(l => l.product_id !== productId))
  }

  const handleSave = async (paymentMode: 'contado' | 'deuda' | 'abono') => {
    if (lines.length === 0) {
      setError('Agrega al menos un producto a la venta')
      return
    }

    let amount = 0
    if (paymentMode === 'contado') amount = totals.total
    if (paymentMode === 'abono') amount = Math.min(Number(paidAmount) || 0, totals.total)

    try {
      setSaving(true)
      setError(null)
      const sale = await saleService.createSale({
        customer: customer || undefined,
        items: lines.map(l => ({
          product_id: l.product_id,
          product_title: l.product_title,
          quantity: l.quantity,
          unit_price: l.unit_price,
        })),
        discount: totals.discount,
        payment_method: method,
        payment_amount: amount,
        notes: notes.trim() || undefined,
      })
      navigate(`/ventas/${sale.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la venta')
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/ventas"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nueva venta</h1>
            <p className="text-sm text-gray-500">Venta de mostrador (POS)</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: customer + products + lines */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
            {customer ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                  <p className="text-xs text-gray-500">
                    {customer.doc_type && customer.doc_number
                      ? `${customer.doc_type} ${customer.doc_number} · ${customer.fiscal_name || ''}`
                      : 'Cliente sin documento fiscal'}
                  </p>
                </div>
                <button
                  onClick={() => setCustomer(null)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={customerQuery}
                      onChange={e => {
                        setCustomerQuery(e.target.value)
                        setCustomerOpen(true)
                        searchCustomers(e.target.value)
                      }}
                      onFocus={() => setCustomerOpen(true)}
                      placeholder="Buscar por nombre, DNI o RUC..."
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomer(null)}
                    className="px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Cliente ocasional
                  </button>
                </div>
                {customerOpen && customerResults.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                    {customerResults.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setCustomer(c)
                          setCustomerOpen(false)
                          setCustomerQuery('')
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50"
                      >
                        <span className="block text-sm text-gray-900">{c.name}</span>
                        <span className="block text-xs text-gray-400">
                          {c.doc_type && c.doc_number ? `${c.doc_type} ${c.doc_number}` : c.email || 'Sin documento'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Productos</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={productQuery}
                onChange={e => {
                  setProductQuery(e.target.value)
                  setProductOpen(true)
                  searchProducts(e.target.value)
                }}
                onFocus={() => setProductOpen(true)}
                placeholder="Buscar producto por nombre o SKU..."
                className={`${inputCls} pl-9`}
              />
              {productOpen && productResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  {productResults.map(p => (
                    <button
                      key={p.id}
                      onClick={() => addLine(p)}
                      className="w-full flex items-center justify-between text-left px-4 py-2.5 hover:bg-gray-50"
                    >
                      <div>
                        <span className="block text-sm text-gray-900">{p.name}</span>
                        <span className="block text-xs text-gray-400">{p.sku}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        S/ {p.base_price || 0}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lines */}
            {lines.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                      <th className="pb-2 font-medium">Producto</th>
                      <th className="pb-2 font-medium w-20">Cant.</th>
                      <th className="pb-2 font-medium w-28">P. unit.</th>
                      <th className="pb-2 font-medium w-28 text-right">Subtotal</th>
                      <th className="pb-2 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lines.map(line => (
                      <tr key={line.product_id}>
                        <td className="py-2.5 pr-2 text-gray-900">{line.product_title}</td>
                        <td className="py-2.5 pr-2">
                          <input
                            type="number"
                            min={1}
                            value={line.quantity}
                            onChange={e =>
                              updateLine(line.product_id, { quantity: Math.max(1, Number(e.target.value) || 1) })
                            }
                            className="w-16 px-2 py-1 border border-gray-300 rounded-lg"
                          />
                        </td>
                        <td className="py-2.5 pr-2">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={line.unit_price}
                            onChange={e =>
                              updateLine(line.product_id, { unit_price: Number(e.target.value) || 0 })
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded-lg"
                          />
                        </td>
                        <td className="py-2.5 text-right font-medium text-gray-900">
                          S/ {calcLineSubtotal(line.quantity, line.unit_price)}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => removeLine(line.product_id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {lines.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-6">
                Busca y agrega productos a la venta
              </p>
            )}
          </div>
        </div>

        {/* Right: totals + payment */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Resumen</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">S/ {totals.subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Descuento</span>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                  placeholder="0.00"
                  className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-right"
                />
              </div>
              <div className="flex justify-between text-gray-600">
                <span>IGV (0%)</span>
                <span>S/ 0.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>S/ {totals.total}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Pago</h3>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Método</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value as PaymentMethod)}
                className={inputCls}
              >
                {methodOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Pago ahora (para abono)
              </label>
              <input
                type="number"
                min={0}
                value={paidAmount}
                onChange={e => setPaidAmount(e.target.value)}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notas</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Notas de la venta..."
                className={inputCls}
              />
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleSave('contado')}
                disabled={saving || lines.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                Vender al contado
              </button>
              <button
                onClick={() => handleSave('deuda')}
                disabled={saving || lines.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserRound className="w-4 h-4" />}
                Guardar como deuda
              </button>
              <button
                onClick={() => handleSave('abono')}
                disabled={saving || lines.length === 0 || !(Number(paidAmount) > 0)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Vender con abono
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
