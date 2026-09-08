import { useState, useEffect } from 'react'

const PAYMENT_STATUS_COLORS = {
  pending: 'badge-warning',
  completed: 'badge-success',
  failed: 'badge-danger',
  refunded: 'badge',
}

const PAYMENT_STATUS_LABELS = {
  pending: 'Pendiente',
  completed: 'Completado',
  failed: 'Fallido',
  refunded: 'Reembolsado',
}

const PROVIDER_LABELS = {
  stripe: '💳 Stripe',
  culqi: '💳 Culqi',
  manual: '📋 Pago Directo',
  woocommerce: '🛒 WooCommerce',
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'Ahora'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Hace ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `Hace ${days}d`
  return new Date(dateStr).toLocaleDateString('es-PE')
}

function formatAmount(amount, currency = 'PEN') {
  const symbol = currency === 'PEN' ? 'S/' : '$'
  return `${symbol}${parseFloat(amount || 0).toFixed(2)}`
}

export default function PaymentsPanel({
  paymentsService,
  supabase,
  title = 'Pagos',
  subtitle = 'Gestiona los pagos de la plataforma',
  adminUser = null,
}) {
  const [tab, setTab] = useState('pendientes')
  const [processingId, setProcessingId] = useState(null)
  const [pending, setPending] = useState([])
  const [allPayments, setAllPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [pendingData, allData] = await Promise.all([
        paymentsService.getPendingPayments(),
        paymentsService.getAllPayments({ limit: 100 }),
      ])
      setPending(pendingData || [])
      setAllPayments(allData || [])
    } catch (err) {
      setError(err?.message || 'Error al cargar pagos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleApprove(paymentId) {
    setProcessingId(paymentId)
    try {
      let adminId = adminUser?.id
      if (!adminId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No se pudo obtener el usuario')
        adminId = user.id
      }

      await paymentsService.updatePaymentStatus(paymentId, 'completed', {
        providerId: `manual_${Date.now()}`,
        notes: 'Aprobado por administrador',
      })
      await loadData()
    } catch (err) {
      alert('Error al aprobar: ' + (err.message || 'Error desconocido'))
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject(paymentId) {
    setProcessingId(paymentId)
    try {
      await paymentsService.updatePaymentStatus(paymentId, 'failed', {
        notes: 'Rechazado por administrador',
      })
      await loadData()
    } catch (err) {
      alert('Error al rechazar: ' + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const tabs = [
    { key: 'pendientes', label: 'Pendientes', count: pending.length },
    { key: 'todas', label: 'Todas', count: allPayments.length },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (error) {
    return <div className="card p-12 text-center text-surface-500">{error}</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-title">{title}</h1>
        <p className="section-subtitle mt-1">{subtitle}</p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-primary-600 text-white'
                : 'bg-white text-surface-600 hover:bg-surface-100 border border-surface-200'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === 'pendientes' && (
        pending.length > 0 ? (
          <div className="space-y-4">
            {pending.map((p) => (
              <div key={p.id} className="card p-5 border-l-4 border-l-amber-400">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-surface-900">{p.product_title || 'Producto'}</p>
                    <p className="text-sm text-surface-500">
                      {formatAmount(p.amount, p.currency)}
                      {p.provider === 'manual' ? ' — Pago Directo' : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-surface-400">
                      <span>ID: {p.user_id?.slice(0, 8)}...</span>
                      <span>·</span>
                      <span>{timeAgo(p.created_at)}</span>
                      <span>·</span>
                      <span>{PROVIDER_LABELS[p.provider] || p.provider}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button onClick={() => handleApprove(p.id)} disabled={processingId === p.id}
                      className="btn-primary text-xs px-4 py-2">
                      {processingId === p.id ? '...' : '✅ Aprobar'}
                    </button>
                    <button onClick={() => handleReject(p.id)} disabled={processingId === p.id}
                      className="btn-ghost text-xs text-red-600 px-4 py-2">
                      ❌ Rechazar
                    </button>
                  </div>
                </div>
                {p.proof_url && (
                  <div className="mt-4 rounded-lg bg-surface-50 p-3">
                    <p className="text-xs font-medium text-surface-600 mb-1">Comprobante:</p>
                    <a href={p.proof_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:text-primary-700 underline break-all">
                      📎 Ver comprobante
                    </a>
                  </div>
                )}
                {p.notes && <div className="mt-2 text-xs text-surface-400 italic">Nota: {p.notes}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <span className="text-5xl block mb-4">✅</span>
            <h3 className="text-lg font-semibold text-surface-900 mb-2">No hay pagos pendientes</h3>
            <p className="text-sm text-surface-500">Todos los pagos han sido procesados</p>
          </div>
        )
      )}

      {tab === 'todas' && (
        allPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Método</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {allPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-surface-900 text-xs">{p.user_id?.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-surface-900">{p.product_title || '—'}</td>
                    <td className="px-4 py-3 text-surface-900">{formatAmount(p.amount, p.currency)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-surface-500">{PROVIDER_LABELS[p.provider] || p.provider}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS_COLORS[p.status] || 'badge'}`}>
                        {PAYMENT_STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-400">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('es-PE') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {p.proof_url ? (
                        <a href={p.proof_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:text-primary-700 underline">📎 Ver</a>
                      ) : <span className="text-xs text-surface-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card p-12 text-center">
            <span className="text-5xl block mb-4">🛒</span>
            <h3 className="text-lg font-semibold text-surface-900 mb-2">No hay pagos registrados</h3>
            <p className="text-sm text-surface-500">Los pagos aparecerán aquí cuando los usuarios compren</p>
          </div>
        )
      )}
    </div>
  )
}
