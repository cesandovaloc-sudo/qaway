import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Banknote,
  Trash2,
  ReceiptText,
} from 'lucide-react'
import { saleService } from '@/services/saleService'
import type { PaymentMethod, PaymentStatus, SalePayment, SaleWithRelations } from '@/types'
import { formatPEN } from './SalesPage'

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string; bgColor: string }> = {
  pagado: { label: 'Pagado', color: 'text-green-700', bgColor: 'bg-green-100' },
  deuda: { label: 'Deuda', color: 'text-red-700', bgColor: 'bg-red-100' },
  parcial: { label: 'Parcial', color: 'text-amber-700', bgColor: 'bg-amber-100' },
}

const methodLabels: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  yape: 'Yape',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
}

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [sale, setSale] = useState<SaleWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo')
  const [savingPayment, setSavingPayment] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const load = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      setSale(await saleService.getSaleById(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la venta')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const paid = (sale?.payments || []).reduce((sum, p) => sum + p.amount, 0)
  const pending = sale ? Math.max(0, sale.total - paid) : 0

  const handlePayment = async () => {
    if (!sale || !(Number(paymentAmount) > 0)) return
    setSavingPayment(true)
    setError(null)
    try {
      await saleService.registerPayment(sale.id, Number(paymentAmount), paymentMethod, 'Abono registrado')
      setPaymentAmount('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar el abono')
    } finally {
      setSavingPayment(false)
    }
  }

  const handleCancel = async () => {
    if (!sale) return
    if (window.confirm(`¿Anular la venta ${sale.sale_number}? Se restaurará el stock.`)) {
      setCancelling(true)
      setError(null)
      try {
        await saleService.cancelSale(sale.id)
        await load()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al anular la venta')
      } finally {
        setCancelling(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (error && !sale) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <span className="text-sm text-red-700">{error}</span>
      </div>
    )
  }

  if (!sale) return null

  const cfg = paymentStatusConfig[sale.payment_status]
  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/ventas"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{sale.sale_number}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color} ${cfg.bgColor}`}>
                {cfg.label}
              </span>
              {sale.status === 'cancelled' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-500 bg-gray-200">
                  Anulada
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {new Date(sale.created_at).toLocaleString('es-PE')}
            </p>
          </div>
        </div>
        {sale.status === 'active' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50"
          >
            {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Anular venta
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info + items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Cliente</h3>
            <p className="text-sm font-medium text-gray-900">{sale.customer_name || 'Cliente ocasional'}</p>
            {sale.doc_number && (
              <p className="text-sm text-gray-500">
                {sale.doc_type} {sale.doc_number}
                {sale.fiscal_name && ` · ${sale.fiscal_name}`}
              </p>
            )}
            {sale.fiscal_address && <p className="text-sm text-gray-500">{sale.fiscal_address}</p>}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Ítems</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                  <th className="pb-2 font-medium">Producto</th>
                  <th className="pb-2 font-medium w-20 text-center">Cant.</th>
                  <th className="pb-2 font-medium w-28 text-right">P. unit.</th>
                  <th className="pb-2 font-medium w-28 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sale.items.map(item => (
                  <tr key={item.id}>
                    <td className="py-2.5 pr-2 text-gray-900">{item.product_title}</td>
                    <td className="py-2.5 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-2.5 text-right text-gray-600">{formatPEN(item.unit_price)}</td>
                    <td className="py-2.5 text-right font-medium text-gray-900">{formatPEN(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 space-y-1.5 text-sm border-t border-gray-200 pt-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPEN(sale.subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Descuento</span>
                  <span>-{formatPEN(sale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>IGV</span>
                <span>S/ 0.00</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-gray-900 pt-1">
                <span>Total</span>
                <span>{formatPEN(sale.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Pagos</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pagado</span>
              <span className="font-medium text-gray-900">{formatPEN(paid)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pendiente</span>
              <span className={`font-medium ${pending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatPEN(pending)}
              </span>
            </div>

            {sale.status === 'active' && pending > 0 && (
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Monto del abono</label>
                  <input
                    type="number"
                    min={0}
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Método</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className={inputCls}
                  >
                    {Object.entries(methodLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={savingPayment || !(Number(paymentAmount) > 0)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {savingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                  Registrar abono
                </button>
              </div>
            )}

            {sale.status === 'active' && (
              <button
                disabled
                title="Disponible al activar la integración con SUNAT"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
              >
                <ReceiptText className="w-4 h-4" />
                Emitir comprobante (al activar SUNAT)
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Historial de pagos</h3>
            {sale.payments.length === 0 ? (
              <p className="text-sm text-gray-400">Sin pagos registrados</p>
            ) : (
              <div className="space-y-2">
                {sale.payments.map((p: SalePayment) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{formatPEN(p.amount)}</span>
                      <span className="ml-2 text-xs text-gray-500">{methodLabels[p.method]}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(p.received_at).toLocaleString('es-PE')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
