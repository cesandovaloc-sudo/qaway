import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Minus, Package, Plus, ShoppingCart } from 'lucide-react'
import { Checkout } from '@qawaylab/pago'
import { supabase } from '@/config/supabase'
import { siteConfig } from '@/config/site'
import { setPageMeta } from '@/utils/seo'
import { qawaServices } from '@/services/qawaService'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/context/AuthContext'
// Piel del checkout y la tienda: única fuente en el módulo @qawaylab/pago
import '@qawaylab/pago/styles/storefront.css'

export default function CartPage() {
  const { items, updateQuantity, remove, clear, count, subtotal } = useCart()
  // Si hay sesión, el pedido se asocia al usuario real (RLS lo permite);
  // invitados: userId null → el schema registra un pedido anónimo
  const { session } = useAuth()
  const [orderDone, setOrderDone] = useState(false)

  useEffect(() => {
    setPageMeta({ title: 'Mi pedido | Qaway Lab', robots: 'noindex' })
  }, [])

  const handleOrderSuccess = () => {
    setOrderDone(true)
    clear()
  }

  return (
    <div className="min-h-dvh bg-surface">
      {/* Header */}
      <header className="bg-white border-b border-surface-muted sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <ShoppingCart size={16} className="text-white" />
            </div>
            <span className="font-display font-semibold text-ink">Mi pedido</span>
          </div>
          <Link
            to="/"
            className="text-sm text-muted hover:text-ink flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={14} />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {orderDone ? (
          <div className="bg-white rounded-2xl border border-surface-muted p-12 text-center max-w-lg mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-semibold text-ink mb-2">¡Pedido registrado!</h1>
            <p className="text-sm text-muted mb-6">
              Gracias por tu compra. Te contactaremos para confirmar el pago y la entrega.
            </p>
            <Link
              to="/"
              className="inline-flex px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-light transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-surface-muted p-12 text-center max-w-lg mx-auto">
            <ShoppingCart className="w-12 h-12 text-muted-light mx-auto mb-4" />
            <h1 className="font-display text-xl font-semibold text-ink mb-2">Tu pedido está vacío</h1>
            <p className="text-sm text-muted mb-6">Agrega productos desde el catálogo para continuar.</p>
            <Link
              to="/"
              className="inline-flex px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-light transition-colors"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">
            {/* Items */}
            <div className="bg-white rounded-2xl border border-surface-muted divide-y divide-surface-muted">
              {items.map((item) => (
                <div key={item.product_id} className="flex items-center gap-4 p-4">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg bg-surface"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-surface flex items-center justify-center">
                      <Package size={20} className="text-muted-light" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted">S/ {item.unit_price.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-1 border border-surface-muted rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="p-2 hover:text-brand transition-colors"
                      aria-label="Restar uno"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="p-2 hover:text-brand transition-colors"
                      aria-label="Sumar uno"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink">
                      S/ {(item.unit_price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => remove(item.product_id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
              <div className="p-4 flex justify-between items-center text-sm bg-surface/60">
                <span className="text-muted">{count} ítems</span>
                <span className="font-semibold text-ink">Subtotal S/ {subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout (módulo @qawaylab/pago) */}
            {siteConfig.cart.enabled && (
              <div
                className="qawa-storefront"
                // Ajuste de piel: el resumen del checkout se pega bajo el header (64px) del inventario
                style={{ ['--qawa-sticky-top' as string]: '88px' } as React.CSSProperties}
              >
                <Checkout
                  paymentsService={qawaServices.payments}
                  ordersService={qawaServices.orders}
                  supabase={supabase}
                  userId={session?.user?.id ?? null}
                  items={items}
                  currency="PEN"
                  bucketName="resources"
                  onSuccess={handleOrderSuccess}
                  onError={(err: unknown) => console.error('Checkout error:', err)}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
