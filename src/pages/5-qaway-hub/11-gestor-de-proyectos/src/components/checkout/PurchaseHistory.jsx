import { useState, useEffect } from 'react'

const STATUS_BADGES = {
  completed: { label: 'Completado', bg: '#e6f4ea', color: '#137333' },
  pending: { label: 'Pendiente de Validación', bg: '#fef7e0', color: '#b06000' },
  failed: { label: 'Rechazado / Fallido', bg: '#fce8e6', color: '#c5221f' },
  refunded: { label: 'Reembolsado', bg: '#f1f3f4', color: '#5f6368' },
}

export default function PurchaseHistory({ paymentsService, userId, emptyMessage = 'No tienes compras registradas aún.' }) {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    paymentsService.getUserPayments(userId)
      .then(data => setPurchases(data || []))
      .catch(err => setError(err?.message || 'Error al cargar compras'))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
        Cargando tus compras...
      </div>
    )
  }

  if (error) {
    return (
      <div className="form-status" style={{ textAlign: 'center' }}>
        {error}
      </div>
    )
  }

  if (!purchases.length) {
    return (
      <div className="empty-state" style={{ padding: '40px 20px' }}>
        <h3>{emptyMessage}</h3>
        <p className="muted">Tus cursos y productos digitales aparecerán aquí una vez realizada la compra.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '14px' }}>
      {purchases.map((p) => {
        const badge = STATUS_BADGES[p.status] || STATUS_BADGES.pending
        const amount = p.amount ? `S/ ${parseFloat(p.amount).toFixed(2)}` : '—'

        return (
          <div key={p.id} className="card-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderRadius: '4px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="eyebrow" style={{ fontSize: '0.65rem' }}>{p.provider === 'manual' ? 'Pago Directo / Yape' : 'Tarjeta Stripe'}</span>
                <span style={{ fontSize: '0.72rem', background: badge.bg, color: badge.color, padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  {badge.label}
                </span>
              </div>

              <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700 }}>
                {p.product_title || 'Pedido de Formación / Producto'}
              </h3>

              <div className="muted" style={{ fontSize: '0.78rem', display: 'flex', gap: '12px' }}>
                <span>ID: #{p.id?.slice(0, 8)}</span>
                <span>·</span>
                <span>{p.created_at ? new Date(p.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <strong style={{ fontSize: '1.15rem', color: 'var(--ink)' }}>{amount}</strong>
              {p.proof_url && (
                <div style={{ marginTop: '4px' }}>
                  <a href={p.proof_url} target="_blank" rel="noopener noreferrer" className="text-link" style={{ fontSize: '0.75rem' }}>
                    Ver Comprobante
                  </a>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
