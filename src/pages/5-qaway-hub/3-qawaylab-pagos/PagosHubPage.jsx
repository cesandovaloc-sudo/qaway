import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  ShoppingBag,
  History,
  ShieldAlert,
  Sliders,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Layers,
  Zap,
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import { supabase } from '@/config/supabase'
import {
  createQawaServices,
  Checkout,
  PurchaseHistory,
  PaymentsPanel,
  ProductsManager,
  ProductGrid,
  ProductDetail,
  CartView,
} from './index.js'
import './styles/storefront.css'

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
      ['Presentación', 'Curso en Vivo + Grabaciones'],
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

const DEMO_USER = {
  id: 'user-demo-001',
  email: 'proyectos@qawaylab.com',
}

export default function PagosHubPage() {
  useSetNavbarVariant('light')

  const [activeTab, setActiveTab] = useState('storefront')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState([SAMPLE_PRODUCTS[0]])
  const [orderSuccess, setOrderSuccess] = useState(null)

  // Inicializar servicios de pagos
  const services = useMemo(() => {
    return createQawaServices(supabase, {
      stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
      mercadoPagoPublicKey: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY,
    })
  }, [])

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      if (exists) return prev
      return [...prev, product]
    })
  }

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((p) => p.id !== productId))
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pt-24 pb-20 selection:bg-orange-500 selection:text-white">
      {/* Header & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <Link
              to="/hub"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Hub
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Qaway Pagos & Checkout
                </h1>
                <p className="text-xs text-zinc-400">
                  Pasarela multi-método (Stripe, Yape, Plin, PagoEfectivo, Transferencia) y gestión de catálogo.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-2xl overflow-x-auto">
            <button
              onClick={() => { setActiveTab('storefront'); setSelectedProduct(null) }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'storefront'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Catálogo
            </button>

            <button
              onClick={() => setActiveTab('checkout')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer relative ${
                activeTab === 'checkout'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> Checkout
              {cart.length > 0 && (
                <span className="w-4 h-4 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Historial
            </button>

            <button
              onClick={() => setActiveTab('panel')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'panel'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Panel Pagos
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Catálogo Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {/* 1. STOREFRONT */}
          {activeTab === 'storefront' && (
            <motion.div
              key="storefront"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {selectedProduct ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white mb-6 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Volver a la lista de productos
                  </button>
                  <ProductDetail
                    product={selectedProduct}
                    onAddToCart={(p) => {
                      addToCart(p)
                      setActiveTab('checkout')
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">Catálogo de Productos & Cursos</h2>
                      <p className="text-xs text-zinc-400">Selecciona un producto para ver detalles o comprar directamente.</p>
                    </div>
                  </div>

                  <div className="qawa-storefront">
                    <ProductGrid
                      products={SAMPLE_PRODUCTS}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      onAddToCart={(p) => addToCart(p)}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 2. CHECKOUT MULTI-MÉTODO */}
          {activeTab === 'checkout' && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {orderSuccess ? (
                <div className="max-w-xl mx-auto bg-zinc-900 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-white">¡Pago Procesado Exitosamente!</h2>
                  <p className="text-sm text-zinc-400">
                    Tu orden #{orderSuccess.orderId || 'QW-9942'} ha sido registrada y validada. Recibirás confirmación a tu correo.
                  </p>
                  <button
                    onClick={() => { setOrderSuccess(null); setActiveTab('storefront') }}
                    className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Volver al Catálogo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Resumen del Carrito */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-emerald-400" /> Resumen del Pedido
                      </h3>
                      {cart.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-xs text-zinc-500">Tu carrito está vacío.</p>
                          <button
                            onClick={() => setActiveTab('storefront')}
                            className="mt-3 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                          >
                            + Explorar catálogo
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {cart.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{item.title}</p>
                                <p className="text-xs text-zinc-400">S/ {item.price.toFixed(2)} PEN</p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-xs text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                              >
                                Quitar
                              </button>
                            </div>
                          ))}

                          <div className="pt-2 flex justify-between items-center text-sm font-black">
                            <span className="text-zinc-400">Total a Pagar:</span>
                            <span className="text-xl text-emerald-400">
                              S/ {cart.reduce((acc, c) => acc + c.price, 0).toFixed(2)} PEN
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Formulario de Checkout */}
                  <div className="lg:col-span-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8">
                      <Checkout
                        paymentsService={services.payments}
                        ordersService={services.orders}
                        supabase={supabase}
                        user={DEMO_USER}
                        items={cart}
                        currency="PEN"
                        onSuccess={(res) => setOrderSuccess(res)}
                        onError={(err) => console.error('[Checkout Error]', err)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 3. HISTORIAL DE COMPRAS */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8"
            >
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" /> Historial de Transacciones
              </h2>
              <PurchaseHistory
                ordersService={services.orders}
                user={DEMO_USER}
              />
            </motion.div>
          )}

          {/* 4. PANEL DE PAGOS (ADMIN) */}
          {activeTab === 'panel' && (
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8"
            >
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" /> Conciliación y Aprobación de Pagos
                </h2>
                <p className="text-xs text-zinc-400">Verifica comprobantes Yape/Plin y valida transacciones bancarias.</p>
              </div>
              <PaymentsPanel
                ordersService={services.orders}
                paymentsService={services.payments}
                supabase={supabase}
              />
            </motion.div>
          )}

          {/* 5. GESTOR DE PRODUCTOS (ADMIN) */}
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8"
            >
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" /> Administración del Catálogo
                </h2>
                <p className="text-xs text-zinc-400">Crea, edita o retira productos y planes de pago del catálogo.</p>
              </div>
              <ProductsManager
                productsService={services.products}
                supabase={supabase}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
