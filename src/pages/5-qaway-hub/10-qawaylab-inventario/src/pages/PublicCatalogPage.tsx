import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, Loader2, AlertCircle, Package, Phone, MessageCircle, ShoppingCart } from 'lucide-react'
import { usePublicCatalog } from '@/hooks/useCatalogs'
import { useCart } from '@/hooks/useCart'
import { qawaCommerceAdapter } from '@/services/adapters/commerceAdapter'
import { siteConfig } from '@/config/site'
import { setPageMeta } from '@/utils/seo'
import type { Product } from '@/types'

export default function PublicCatalogPage() {
  const { slug } = useParams<{ slug: string }>()
  const { catalog, loading, error } = usePublicCatalog(slug || null)
  const { add: addToCart, count: cartCount, subtotal: cartSubtotal } = useCart()
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleAdd = (product: Product | undefined) => {
    if (!product) return
    addToCart(qawaCommerceAdapter.toCartItem(product))
    setJustAdded(product.id)
    window.setTimeout(() => setJustAdded((prev) => (prev === product.id ? null : prev)), 1500)
  }

  useEffect(() => {
    setPageMeta({
      title: catalog?.name ? `${catalog.name} | Qaway Lab` : 'Catálogo Qaway Lab',
      description: catalog?.description ?? 'Catálogo de productos Qaway Lab',
      robots: 'index',
    })
  }, [catalog])

  const formatDate = (date: string | null) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    )
  }

  if (error || !catalog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Catálogo no encontrado</h1>
          <p className="text-gray-500">El catálogo que buscas no existe o no está disponible.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{catalog.name}</h1>
            {catalog.description && (
              <p className="text-gray-600 max-w-2xl mx-auto">{catalog.description}</p>
            )}
            {catalog.campaign && (
              <div className="mt-4 text-sm text-gray-500">
                {catalog.campaign.start_date && (
                  <span>Válido desde {formatDate(catalog.campaign.start_date)}</span>
                )}
                {catalog.campaign.end_date && (
                  <span> • Hasta {formatDate(catalog.campaign.end_date)}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {catalog.items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Este catálogo no tiene productos aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalog.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                {item.product?.images?.[0] && (
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={item.product.images[0].processed_url || item.product.images[0].original_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.product?.name || 'Producto'}
                  </h3>
                  {item.product?.sku && (
                    <p className="text-xs text-gray-500 mb-2">{item.product.sku}</p>
                  )}
                  
                  {item.show_description && item.product?.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.product.description}
                    </p>
                  )}

                  {/* Price */}
                  {item.show_price && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {item.bundle ? (
                        <div>
                          <span className="text-xl font-bold text-green-600">
                            S/ {item.bundle.bundle_price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            {item.bundle.name}
                          </span>
                        </div>
                      ) : item.product?.base_price ? (
                        <span className="text-xl font-bold text-gray-900">
                          S/ {item.product.base_price.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Consultar precio</span>
                      )}
                    </div>
                  )}

                  {/* Agregar al carrito (módulo @qawaylab/pago) */}
                  {siteConfig.cart.enabled && item.product && (
                    <button
                      onClick={() => handleAdd(item.product)}
                      className={`mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        justAdded === item.product.id
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-600 text-white hover:bg-orange-700'
                      }`}
                    >
                      {justAdded === item.product.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          Agregado
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          Agregar al carrito
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Mini carrito flotante */}
      {siteConfig.cart.enabled && cartCount > 0 && (
        <div className="fixed bottom-4 right-4 z-50 bg-ink text-white rounded-xl shadow-elevated px-4 py-3 flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-light">{cartCount} ítems</p>
            <p className="text-sm font-semibold">S/ {cartSubtotal.toFixed(2)}</p>
          </div>
          <button
            onClick={() => navigate('/carrito')}
            className="px-4 py-2 bg-brand rounded-lg text-sm font-medium hover:bg-brand-light transition-colors"
          >
            Ver carrito
          </button>
        </div>
      )}

      {/* Footer with Contact */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Catálogo generado por Qaway Lab
            </p>
            <div className="flex items-center gap-3">
              {siteConfig.whatsapp && (
                <a
                  href={`https://wa.me/${siteConfig.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
              {siteConfig.phone && (
                <a
                  href={`tel:+${siteConfig.phone}`}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Llamar
                </a>
              )}
              {!siteConfig.whatsapp && !siteConfig.phone && (
                <p className="text-sm text-gray-500">
                  Consulta por WhatsApp para más información
                </p>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
