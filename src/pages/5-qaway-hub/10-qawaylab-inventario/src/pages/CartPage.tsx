import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CartView from '@/components/checkout/storefront/CartView'
import CheckoutSteps from '@/components/checkout/storefront/CheckoutSteps'
import TiendaShell from '@/components/checkout/TiendaShell'
import { supabase } from '@/config/supabase'
import { setPageMeta } from '@/utils/seo'
import { useCart } from '@/hooks/useCart'

// ── Resolución del producto entrante (?add=<ref>) ────────────────────────────
// `products.id` es uuid y `slug`/`sku` son text. Mezclar ambos tipos en un mismo
// filtro OR (`id.eq.<texto>,slug.eq.<texto>`) obliga a Postgres a convertir el
// texto a uuid y rechaza la consulta completa (error 22P02), dejando el pedido
// vacío. Por eso el identificador se resuelve según su tipo real.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function resolveProductByRef(ref: string) {
  if (UUID_RE.test(ref)) {
    const { data } = await supabase.from('products').select('*').eq('id', ref).limit(1)
    return data?.[0] ?? null
  }

  const { data } = await supabase.from('products').select('*').eq('slug', ref).limit(1)
  if (data?.[0]) return data[0]

  const { data: bySku } = await supabase.from('products').select('*').eq('sku', ref).limit(1)
  return bySku?.[0] ?? null
}

/**
 * Página de cliente «Mi pedido» de la tienda.
 *
 * Solo el carrito: el pago vive en `CheckoutPage` (`/carrito/checkout`), igual
 * que el flujo original de dos pasos. La piel y los componentes del storefront
 * (CartView → CartItems + OrderSummary) los aporta el propio diseño ya
 * trabajado, no marcado propio.
 */
export default function CartPage() {
  const { items, add, updateQuantity, remove, count, subtotal } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const handledAddRef = useRef<string | null>(null)
  // Mientras viaja el producto de `?add=`, CartView muestra "Agregando tu
  // producto…" en lugar del estado vacío (que parpadeaba al entrar).
  const [resolving, setResolving] = useState(() => Boolean(searchParams.get('add')))

  useEffect(() => {
    setPageMeta({ title: 'Mi pedido | Qaway Lab', robots: 'noindex' })
  }, [])

  useEffect(() => {
    const addSlug = searchParams.get('add')
    if (!addSlug || handledAddRef.current === addSlug) return
    handledAddRef.current = addSlug
    setResolving(true)

    async function loadItem(ref: string) {
      try {
        const p = await resolveProductByRef(ref)
        if (p) {
          add({
            product_id: p.id,
            title: p.title || p.name,
            unit_price: Number(p.base_price || p.price || 0),
            quantity: 1,
            product_type: p.type || 'digital',
            image_url: p.images?.[0]?.processed_url || p.image_url || null,
          })
        }
      } catch (err) {
        console.warn('[CartPage] Error precargando producto:', err)
      }
      setResolving(false)
      setSearchParams({}, { replace: true })
    }

    loadItem(addSlug)
  }, [searchParams, add, setSearchParams])

  return (
    <TiendaShell>
      <CartView
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemove={remove}
        count={count}
        subtotal={subtotal}
        emptyHref="/proyectos"
        checkoutHref="/carrito/checkout"
        deliveryLabel="Plazo"
        deliveryValue="Según plan"
        note="Revisa los ítems y luego completa tus datos y forma de pago."
        loading={resolving}
        // Migas de pan del flujo, en el mismo lugar que en el checkout
        steps={<CheckoutSteps active={1} />}
      />
    </TiendaShell>
  )
}
