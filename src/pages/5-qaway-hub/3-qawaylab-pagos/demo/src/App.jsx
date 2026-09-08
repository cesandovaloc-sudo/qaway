import { useState } from 'react'
import { Routes, Route, Link, useParams, useLocation } from 'react-router-dom'
import {
  createQawaServices,
  Checkout,
  PurchaseHistory,
  PaymentsPanel,
  ProductsManager,
  ProductGrid,
  ProductDetail,
  CartView,
} from '@qawaylab/pago'

const SAMPLE_PRODUCTS = [
  {
    id: 'prod-1',
    title: 'Curso Fullstack React & Node.js',
    slug: 'curso-fullstack-react',
    price: 199.0,
    type: 'course',
    category: 'Academy',
    description:
      'Aprende a construir aplicaciones web completas desde cero con React 19, Node.js y Supabase.',
    image_url:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    facts: [
      ['Presentación', 'Curso en Vivo + Acceso Grabaciones'],
      ['Nivel', 'Intermedio / Avanzado'],
      ['Duración', '8 Semanas · 32 Horas'],
      ['Certificación', 'Incluida por Qaway Lab'],
    ],
  },
  {
    id: 'prod-2',
    title: 'Masterclass Automatizaciones IA',
    slug: 'masterclass-ia',
    price: 149.0,
    type: 'course',
    category: 'Academy',
    description:
      'Conecta workflows, agentes de inteligencia artificial y APIs para automatizar procesos clave.',
    image_url:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    facts: [
      ['Presentación', 'Masterclass Práctica'],
      ['Nivel', 'Todos los niveles'],
      ['Duración', '4 Horas intensivas'],
      ['Recursos', 'Plantillas y scripts incluidos'],
    ],
  },
  {
    id: 'prod-3',
    title: 'Pack Plantillas Qaway Hub',
    slug: 'pack-plantillas-hub',
    price: 89.0,
    type: 'digital',
    category: 'Recursos',
    description:
      'Colección de plantillas, componentes UI y código listo para acelerar proyectos de desarrollo.',
    image_url:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    facts: [
      ['Presentación', 'Descarga Digital Inmediata'],
      ['Compatibilidad', 'React, Next.js, Vite, TailwindCSS'],
      ['Licencia', 'Uso Comercial Ilimitado'],
    ],
  },
]

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Qaway Lab'
const APP_NAME_SPLIT = APP_NAME.split(' ')
const BRAND_FIRST = APP_NAME_SPLIT[0]
const BRAND_REST = APP_NAME_SPLIT.slice(1).join(' ')

const DEMO_USER = { id: 'user-demo-001', email: 'demo@qawaylab.com' }

const supabaseMock = {
  auth: {
    getUser: async () => ({ data: { user: DEMO_USER } }),
  },
  from: (table) => {
    const chain = {
      select: () => chain,
      insert: async (data) => ({ data: Array.isArray(data) ? data : [data], error: null }),
      update: () => chain,
      delete: () => chain,
      eq: () => chain,
      order: () => chain,
      limit: () => chain,
      single: async () => ({ data: { id: 'mock-1', title: 'Producto Demo' }, error: null }),
      then: (resolve) => resolve({ data: [], error: null }),
    }
    return chain
  },
  storage: {
    from: () => ({
      upload: async (path, file) => {
        console.log('[Mock] Upload voucher:', path, file.name)
        return { error: null }
      },
      getPublicUrl: (path) => ({
        data: { publicUrl: `https://mock.storage.qaway/${path}` },
      }),
    }),
  },
}

const { payments, orders, products } = createQawaServices(supabaseMock, {
  onPaymentCompleted: async (payment) => {
    console.log('[Qaway] Pago completado:', payment.id)
  },
})

export default function App() {
  const [cart, setCart] = useState([])
  const location = useLocation()

  function addToCart(product, quantity = 1) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }

  function updateQuantity(productId, qty) {
    if (qty <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: qty } : item))
    )
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="qawa-storefront">
      {/* Header oficial de Mesa Selecta */}
      <header className="site-header">
        <div className="container">
          <div className="header-inner">
            <Link to="/" className="brand">
              {BRAND_FIRST} <span>{BRAND_REST || 'Lab'}</span>
            </Link>

            <nav className="main-nav">
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Catálogo</Link>
              <Link to="/carrito" className={location.pathname === '/carrito' ? 'active' : ''}>Mi Pedido ({cartCount})</Link>
              <Link to="/purchases" className={location.pathname === '/purchases' ? 'active' : ''}>Mis Compras</Link>
              <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin</Link>
            </nav>

            <div className="header-actions">
              <Link to="/carrito" className="cart-link">
                <span>Mi pedido</span>
                <span className="cart-count">{cartCount}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container">
        <Routes>
          {/* 1. Página de Catálogo Principal */}
          <Route
            path="/"
            element={
              <section className="section">
                <div style={{ marginBottom: '32px' }}>
                  <span className="eyebrow">Catálogo Oficial</span>
                  <h1 className="section-title">Formación y Sistemas Digitales</h1>
                  <p className="section-copy">
                    Haz clic en cualquier producto para ver su ficha descriptiva y agregar la cantidad deseada.
                  </p>
                </div>

                <ProductGrid products={SAMPLE_PRODUCTS} />
              </section>
            }
          />

          {/* 2. Página Intermedia Descriptiva de Producto */}
          <Route
            path="/producto/:slug"
            element={<ProductDetailRoute products={SAMPLE_PRODUCTS} onAddToCart={addToCart} />}
          />

          {/* 3. Página de "Mi pedido" (CartView del módulo) */}
          <Route
            path="/carrito"
            element={
              <CartView
                items={cart}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                count={cartCount}
                subtotal={cartSubtotal}
              />
            }
          />

          {/* 4. Página de Checkout Final con Datos y Métodos de Pago */}
          <Route
            path="/checkout"
            element={
              <section className="section">
                <span className="eyebrow">Finalizar Pedido</span>
                <h1 className="section-title">Completar Datos y Pago</h1>
                <p className="section-copy">
                  Ingresa tus datos de contacto y selecciona tu método de pago preferido.
                </p>

                <Checkout
                  paymentsService={payments}
                  ordersService={orders}
                  supabase={supabaseMock}
                  user={DEMO_USER}
                  items={cart}
                  currency="PEN"
                  onSuccess={() => {
                    setCart([])
                  }}
                />
              </section>
            }
          />

          {/* Compras y Admin */}
          <Route
            path="/purchases"
            element={
              <section className="section">
                <span className="eyebrow">Historial</span>
                <h1 className="section-title">Mis Compras</h1>
                <div style={{ marginTop: '24px', background: 'var(--white)', padding: '24px', border: '1px solid var(--line)' }}>
                  <PurchaseHistory paymentsService={payments} userId={DEMO_USER.id} />
                </div>
              </section>
            }
          />

          <Route
            path="/admin"
            element={
              <section className="section">
                <span className="eyebrow">Administración</span>
                <h1 className="section-title">Panel de Control de Pagos</h1>
                <div style={{ marginTop: '24px', background: 'var(--white)', padding: '24px', border: '1px solid var(--line)' }}>
                  <PaymentsPanel paymentsService={payments} supabase={supabaseMock} />
                  <div style={{ marginTop: '36px' }}>
                    <ProductsManager productsService={products} />
                  </div>
                </div>
              </section>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

// Resuelve el slug → producto y delega en el ProductDetail del módulo
function ProductDetailRoute({ products, onAddToCart }) {
  const { slug } = useParams()
  const product = products.find((p) => p.slug === slug) || products[0]
  return <ProductDetail product={product} onAddToCart={onAddToCart} />
}
