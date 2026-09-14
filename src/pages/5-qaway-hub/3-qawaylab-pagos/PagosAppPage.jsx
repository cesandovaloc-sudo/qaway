import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Link, useParams, useLocation, useNavigate, Navigate } from 'react-router-dom'
import {
  createQawaServices,
  Checkout,
  PurchaseHistory,
  PaymentsPanel,
  ProductsManager,
  ProductGrid,
  ProductCard,
  ProductDetail,
  CartView,
} from './index.js'
import CheckoutSteps from './components/storefront/CheckoutSteps.jsx'
import './styles/storefront.css'
import { supabase as realSupabase } from '@/config/supabase'
import { itemKey, isSingleInstance, normalizeCart } from './components/storefront/utils.js'

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
  {
    id: 'one-web',
    title: 'One Web (Landing Page de Alto Impacto)',
    slug: 'one-web',
    price: 79.90,
    type: 'service',
    category: 'Desarrollo Web',
    description:
      'Diseño web de una sola página de alto impacto, adaptado a tu marca, optimizado para móviles y conexión directa a WhatsApp.',
    image_url:
      'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=600&q=80',
    facts: [
      ['Tipo', 'Landing Page One Page'],
      ['Entrega', 'Rápida (3 a 5 días)'],
      ['Optimización', 'Móviles, SEO y Carga Rápida'],
      ['Soporte', 'Garantía Qaway Lab'],
    ],
  },
  {
    id: 'web-comercial',
    title: 'Web Comercial Corporativa',
    slug: 'web-comercial',
    price: 290.0,
    type: 'service',
    category: 'Desarrollo Web',
    description:
      'Sitio web corporativo de hasta 5 secciones principales, diseño corporativo, formulario de contacto, mapas y WhatsApp.',
    image_url:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    facts: [
      ['Tipo', 'Sitio Web Multi-sección'],
      ['Páginas', 'Hasta 5 secciones'],
      ['Integraciones', 'WhatsApp + Formulario + Maps'],
      ['Diseño', '100% Personalizado'],
    ],
  },
  {
    id: 'tienda-online',
    title: 'Tienda Online Autoadministrable',
    slug: 'tienda-online',
    price: 490.0,
    type: 'service',
    category: 'Desarrollo Web',
    description:
      'Catálogo digital interactivo con carrito, panel autoadministrable de productos, stock y pasarela de cobros.',
    image_url:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    facts: [
      ['Tipo', 'E-commerce / Tienda Online'],
      ['Catálogo', 'Productos ilimitados + Carrito'],
      ['Panel', 'Gestor de stock y pedidos'],
      ['Pagos', 'Multi-método integrado'],
    ],
  },
]

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

const activeSupabase = realSupabase || supabaseMock
const { payments, orders, products } = createQawaServices(activeSupabase, {
  onPaymentCompleted: async (payment) => {
    console.log('[Qaway] Pago completado:', payment.id)
  },
})

export default function PagosAppPage() {
  const [cart, setCart] = useState(() => {
    try {
      // Normalizado al restaurar: colapsa duplicados de sesiones anteriores
      const saved = localStorage.getItem('qaway_cart')
      return saved ? normalizeCart(JSON.parse(saved)) : []
    } catch {
      return []
    }
  })
  const location = useLocation()
  const navigate = useNavigate()
  // Slug de ?add= ya resuelto: evita reinyectar el producto en cada re-render
  const processedAddRef = useRef(null)
  // Slug en resolución: mientras exista, el carrito muestra "cargando" en lugar
  // del estado vacío (antes parpadeaba "Tu pedido está vacío" al entrar).
  const [pendingAdd, setPendingAdd] = useState(null)

  // Sincronizar persistencia en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qaway_cart', JSON.stringify(cart))
    } catch (e) {
      console.warn('[Qaway Pagos] Error al persistir carrito:', e)
    }
  }, [cart])

  const [dbProducts, setDbProducts] = useState([])
  const [productsLoaded, setProductsLoaded] = useState(false)

  // Cargar productos reales desde la tabla products de Supabase
  useEffect(() => {
    async function loadProductsFromSupabase() {
      try {
        const { data, error } = await activeSupabase
          .from('products')
          .select('*')
          .eq('status', 'active')
        if (data && data.length > 0) {
          const formatted = data.map((p) => ({
            ...p,
            id: p.id,
            title: p.title || p.name,
            price: Number(p.price || p.base_price || 0),
            image_url: p.image_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
          }))
          setDbProducts(formatted)
        }
      } catch (err) {
        console.warn('[Qaway Pagos] Error cargando productos de Supabase:', err)
      } finally {
        setProductsLoaded(true)
      }
    }
    loadProductsFromSupabase()
  }, [])

  // Soporte de precarga directa por parámetro ?plan=... o ?add=...
  //
  // Resolución determinista: se espera a que el catálogo termine de cargar para
  // resolver el slug contra una sola fuente de verdad. Antes, el efecto corría
  // primero con el catálogo estático (id "one-web") y luego otra vez con el
  // producto de Supabase (UUID), insertando el mismo servicio dos veces.
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const planSlug = params.get('plan') || params.get('add')

    if (!planSlug) {
      processedAddRef.current = null
      setPendingAdd(null)
      return
    }
    if (!productsLoaded) {
      setPendingAdd(planSlug)
      return
    }
    if (processedAddRef.current === planSlug) return

    processedAddRef.current = planSlug
    setPendingAdd(null)

    const allPool = dbProducts.length > 0 ? dbProducts : SAMPLE_PRODUCTS
    const targetProduct = allPool.find(
      (p) => p.slug === planSlug || p.id === planSlug || p.sku === planSlug
    )
    if (targetProduct) {
      addToCart(
        {
          ...targetProduct,
          title: targetProduct.title || targetProduct.name,
          price: Number(targetProduct.price || targetProduct.base_price || 0),
        },
        1
      )
    }

    // Se limpia el parámetro para que un refresh no reinyecte el producto
    navigate(location.pathname, { replace: true })
  }, [location.search, location.pathname, dbProducts, productsLoaded, navigate])

  function addToCart(product, quantity = 1) {
    const incomingKey = itemKey(product)
    if (!incomingKey) return

    setCart((prev) => {
      const existing = prev.find((item) => itemKey(item) === incomingKey)

      if (existing) {
        // Servicios y cursos: compra única, nunca se duplica ni se incrementa
        if (isSingleInstance(existing) || isSingleInstance(product)) {
          return prev
        }
        return prev.map((item) =>
          itemKey(item) === incomingKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      // La cantidad de un servicio nace fijada en 1
      return [...prev, { ...product, quantity: isSingleInstance(product) ? 1 : quantity }]
    })
  }

  function updateQuantity(key, qty) {
    setCart((prev) => {
      const target = prev.find((item) => itemKey(item) === key)
      if (!target) return prev

      // Barrera autoritativa: un servicio o curso nunca supera 1 unidad, ni
      // aunque la UI llegara a permitir el intento.
      if (isSingleInstance(target)) {
        if (qty <= 0) return prev.filter((item) => itemKey(item) !== key)
        return prev
      }

      if (qty <= 0) return prev.filter((item) => itemKey(item) !== key)

      return prev.map((item) =>
        itemKey(item) === key ? { ...item, quantity: qty } : item
      )
    })
  }

  function removeFromCart(key) {
    setCart((prev) => prev.filter((item) => itemKey(item) !== key))
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div
      className="qawa-storefront"
      style={{
        minHeight: '100vh',
        background: 'var(--paper, #f4f3f0)',
        paddingTop: '96px',
        paddingBottom: '80px',
      }}
    >
      {/* Contenido Principal de Cliente */}
      <main className="container">
        <Routes>
          {/* 1. Redirección automática a Carrito */}
          <Route index element={<Navigate to="carrito" replace />} />

          {/* 2. Vista del Carrito ("Mi pedido") */}
          <Route
            path="carrito"
            element={
              <CartView
                items={cart}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                count={cartCount}
                subtotal={cartSubtotal}
                emptyHref="/landings/desarrollo-web-qaway#precios"
                checkoutHref="/hub/pagos/checkout"
                deliveryLabel="Plazo"
                deliveryValue="Según plan"
                loading={Boolean(pendingAdd)}
                note="Revisa los ítems y luego completa tus datos y forma de pago."
              />
            }
          />

          {/* 3. Página de Checkout Final con Datos y Métodos de Pago */}
          <Route
            path="checkout"
            element={
              <section className="section">
                <span className="eyebrow">Finalizar Pedido</span>
                <h1 className="section-title">Completar Datos y Pago</h1>
                <p className="section-copy">
                  Ingresa tus datos de contacto y selecciona tu método de pago preferido.
                </p>

                <CheckoutSteps active={2} />

                <Checkout
                  paymentsService={payments}
                  ordersService={orders}
                  supabase={activeSupabase}
                  items={cart}
                  currency="PEN"
                  onSuccess={() => {
                    setCart([])
                  }}
                />
              </section>
            }
          />

          {/* 4. Historial de compras para clientes */}
          <Route
            path="purchases"
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

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="carrito" replace />} />
        </Routes>
      </main>
    </div>
  )
}
