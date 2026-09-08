# QA PAGOS — Módulo de Pagos Multi-Método

**by Qaway Lab**

Módulo de pagos agnóstico para e-commerce, cursos, productos digitales y físicos. Soporta múltiples métodos de pago nacionales e internacionales.

## Stack

- React 18+ (componentes)
- Supabase (BD + Auth + Storage)
- TailwindCSS (estilos)
- Stripe (procesador internacional — opcional)
- Culqi (procesador Perú — opcional)

## Instalación

```bash
npm install @qawaylab/pago
# o si es local:
npm install ./packages/qaway-pago
```

## Uso rápido

```jsx
import { createClient } from '@supabase/supabase-js'
import { createQawaServices, Checkout } from '@qawaylab/pago'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
const { products, orders, payments } = createQawaServices(supabase)

function Carrito() {
  const cart = [
    { id: '123', title: 'Zapatillas Running Pro', price: 249.90, quantity: 1, type: 'physical', image_url: '...' },
    { id: '456', title: 'Medias Deportivas', price: 29.90, quantity: 2, type: 'physical', image_url: '...' },
  ]

  return (
    <Checkout
      paymentsService={payments}
      ordersService={orders}
      supabase={supabase}
      user={currentUser}
      items={cart}
      stripePublishableKey={import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY}
    />
  )
}
```

## Componentes

| Componente | Ruta | Descripción |
|-----------|------|-------------|
| `Checkout` | `components/Checkout.jsx` | Multi-item + dirección envío + Stripe/ Yape/Pago Directo |
| `PurchaseHistory` | `components/PurchaseHistory.jsx` | Historial de pagos del usuario |
| `PaymentsPanel` | `admin/PaymentsPanel.jsx` | Panel admin: aprobar/rechazar Pago Directo |
| `ProductsManager` | `admin/ProductsManager.jsx` | CRUD de productos con stock |

## Storefront (piel de tienda, v0.4.0+)

El storefront (catálogo, ficha de producto y carrito) también vive en el módulo,
para no duplicar la piel entre apps. La **única fuente de la skin** es
`styles/storefront.css` (sistema “papel y tinta”, scoped bajo `.qawa-storefront`
para no chocar con Tailwind/tokens del host):

```jsx
// 1. Importar la piel (una vez, en el entry de la app)
import '@qawaylab/pago/styles/storefront.css'

// 2. Envolver la zona de tienda
<div className="qawa-storefront">
  <ProductGrid products={products} />
  <ProductDetail product={product} onAddToCart={addToCart} />
  <CartView
    items={cart}
    onUpdateQuantity={updateQuantity}
    onRemove={removeFromCart}
    count={count}
    subtotal={subtotal}
  />
</div>
```

| Componente | Ruta | Descripción |
|---|---|---|
| `ProductCard` | `components/storefront/ProductCard.jsx` | Tarjeta de producto (precio + CTA a la ficha) |
| `ProductGrid` | `components/storefront/ProductGrid.jsx` | Grid de tarjetas (`renderCard` para personalizar) |
| `ProductDetail` | `components/storefront/ProductDetail.jsx` | Ficha descriptiva: galería, cantidad, agregar al pedido, facts |
| `CartItems` | `components/storefront/CartItems.jsx` | Lista de ítems con controles +/− y retirar |
| `OrderSummary` | `components/storefront/OrderSummary.jsx` | Resumen lateral (subtotal, delivery, CTA) |
| `CartView` | `components/storefront/CartView.jsx` | Página “Mi pedido” completa (vacío + items + resumen) |

Normalizan el shape del producto/ítem (aceptan `title/name`, `price/unit_price/base_price`,
`image_url/image/images`…). Requieren `react-router-dom` (peer) para los `Link`.

> 💡 **Piel en el host**: el fondo de página lo decide el host (el wrapper es transparente).
> Las fuentes (Inter, Space Grotesk, JetBrains Mono) las carga el host. La variable
> `--qawa-sticky-top` (default `112px`) ajusta el tope sticky del resumen.

## Servicios

```js
const { products, orders, payments } = createQawaServices(supabase)

// Products
await products.getProducts({ type: 'physical', category: 'zapatillas' })
await products.createProduct({ title: '...', price: 99, type: 'physical', stock: 50 })

// Orders (multi-item)
await orders.createOrder(userId, items, { paymentMethod: 'stripe', shippingAddress: {...} })
await orders.getOrders(userId)

// Payments
await payments.createPayment({ userId, orderId, amount: 49.90, provider: 'stripe' })
await payments.updatePaymentStatus(paymentId, 'completed')
await payments.getPendingPayments()
```

## Métodos de pago

| Método | Tipo | Alcance | Estado |
|--------|------|---------|--------|
| Mercado Pago | Tarjetas / Yape / Cuotas | 🇵🇪 Perú / Latam | ✅ Recomendado / Listo |
| Stripe | Tarjeta crédito/débito | 🌎 Internacional | ✅ Opcional |
| Yape Directo | Billetera móvil (QR/Nro) | 🇵🇪 Perú | ✅ Listo (Voucher) |
| Pago Directo | Transferencia manual | 🇵🇪 Perú | ✅ Listo (BCP/CCI) |
| PagoEfectivo | Depósito en agentes | 🇵🇪 Perú | 🔶 Pendiente integración |

## Migración SQL

Ejecutar contra tu proyecto Supabase:

```bash
npx supabase db query --linked -f node_modules/@qawaylab/pago/supabase/00001_schema.sql
```

## Variables de entorno

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_MERCADOPAGO_PUBLIC_KEY=...            # Principal (para Mercado Pago Perú)
MERCADOPAGO_ACCESS_TOKEN=...               # Principal (Backend Mercado Pago)
VITE_STRIPE_PUBLISHABLE_KEY=...          # Opcional (para Stripe Internacional)
STRIPE_SECRET_KEY=...                      # Opcional (para Stripe)
STRIPE_WEBHOOK_SECRET=...                 # Opcional (para Stripe)
VITE_CULQI_PUBLIC_KEY=...                 # Opcional (para Culqi)
CULQI_SECRET_KEY=...                       # Opcional (para Culqi)
CULQI_WEBHOOK_SECRET=...                  # Opcional (para Culqi)
```

## Licencia

UNLICENSED — Uso interno Qaway Lab
