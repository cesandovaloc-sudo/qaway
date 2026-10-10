import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PurchaseHistory from '@/components/checkout/PurchaseHistory'
import TiendaShell from '@/components/checkout/TiendaShell'
import { setPageMeta } from '@/utils/seo'
import { qawaServices } from '@/services/qawaService'
import { useAuth } from '@/context/AuthContext'

/**
 * Página de cliente «Mis Compras» de la tienda (historial).
 *
 * Cierra el enlace «Ver mis pedidos» que el checkout ofrece tras confirmar:
 * antes apuntaba a `/hub/pagos/purchases` (app de pagos antigua) y quedaba sin
 * destino real.
 */
export default function PurchasesPage() {
  const { session } = useAuth()

  useEffect(() => {
    setPageMeta({ title: 'Mis compras | Qaway Lab', robots: 'noindex' })
  }, [])

  return (
    <TiendaShell>
      <section className="section">
        <span className="eyebrow">Historial</span>
        <h1 className="section-title">Mis Compras</h1>
        <p className="section-copy">
          Consulta el estado de tus pedidos y los comprobantes que hayas enviado.
        </p>

        <div
          style={{
            marginTop: '24px',
            background: 'var(--white)',
            padding: '24px',
            border: '1px solid var(--line)',
          }}
        >
          <PurchaseHistory
            paymentsService={qawaServices.payments}
            userId={session?.user?.id ?? null}
          />
        </div>

        <p style={{ marginTop: '24px' }}>
          <Link className="button button-secondary" to="/carrito">
            Volver a mi pedido
          </Link>
        </p>
      </section>
    </TiendaShell>
  )
}
