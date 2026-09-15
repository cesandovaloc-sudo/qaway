import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Checkout from '@/components/checkout/Checkout'
import CheckoutSteps from '@/components/checkout/storefront/CheckoutSteps'
import TiendaHeader from '@/components/checkout/storefront/TiendaHeader'
import TiendaShell from '@/components/checkout/TiendaShell'
import { supabase } from '@/config/supabase'
import { siteConfig } from '@/config/site'
import { setPageMeta } from '@/utils/seo'
import { qawaServices } from '@/services/qawaService'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/context/AuthContext'

/**
 * Página de cliente «Finalizar pedido» de la tienda (paso 2 del flujo).
 *
 * Es la vista que faltaba: el pago deja de estar embutido en el carrito y pasa
 * a su propia URL (`/carrito/checkout`), con el indicador de pasos del
 * storefront. Preserva el flujo original de dos pasos del proyecto.
 */
export default function CheckoutPage() {
  const { items, clear } = useCart()
  // Si hay sesión, el pedido se asocia al usuario real (RLS lo permite);
  // invitados: userId null → el schema registra un pedido anónimo
  const { session } = useAuth()
  const [orderDone, setOrderDone] = useState(false)
  // Solo el flujo MANUAL limpia el carrito, y recién en el CTA final: ese método
  // no tiene confirmación automática. Para pasarelas el punto de limpieza queda
  // PREPARADO (`onFinish`) y sin conectar hasta tener la confirmación real del
  // webhook / flujo de pago.
  const [pagoManual, setPagoManual] = useState(false)

  useEffect(() => {
    setPageMeta({ title: 'Finalizar pedido | Qaway Lab', robots: 'noindex' })
  }, [])

  // Sin carrito no hay nada que pagar: se vuelve a «Mi pedido».
  // Tras confirmar el pedido (`orderDone`) no se redirige, para que el
  // comprador vea la confirmación del checkout.
  if (!orderDone && (!siteConfig.cart.enabled || items.length === 0)) {
    return <Navigate to="/carrito" replace />
  }

  return (
    <TiendaShell>
      <section className="section">
        <Checkout
          header={
            <TiendaHeader
              eyebrow="Finalizar Pedido"
              title="Completar Datos y Pago"
              copy="Ingresa tus datos de contacto y selecciona tu método de pago preferido."
              steps={<CheckoutSteps active={2} />}
            />
          }
          paymentsService={qawaServices.payments}
          ordersService={qawaServices.orders}
          supabase={supabase}
          userId={session?.user?.id ?? null}
          items={items}
          currency="PEN"
          bucketName="resources"
          onSuccess={({ order }: { order?: { payment_method?: string } }) => {
            // Crear la orden NO vacía el carrito: el pedido queda PENDIENTE hasta
            // que el pago se confirme. Antes se borraba aquí y el comprador
            // perdía su carrito al volver atrás.
            setOrderDone(true)
            setPagoManual(order?.payment_method === 'manual')
          }}
          // Único punto de limpieza: el CTA final, y solo cuando el método es el
          // manual. Para pasarelas queda sin conectar (ver comentario arriba).
          onFinish={pagoManual ? clear : undefined}
          onError={(err: unknown) => console.error('Checkout error:', err)}
        />

        <p style={{ marginTop: '24px' }}>
          <Link className="button button-secondary" to="/carrito">
            Volver a mi pedido
          </Link>
        </p>
      </section>
    </TiendaShell>
  )
}
