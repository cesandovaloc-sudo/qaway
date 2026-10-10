import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, Zap, Gift } from 'lucide-react'
import { useProduct } from '@/hooks/useProduct'
import { ProductGallery } from '@/components/products/ProductGallery'
import { ProductInfo } from '@/components/products/ProductInfo'
import { ProductPrices } from '@/components/products/ProductPrices'
import { ProductHistory } from '@/components/products/ProductHistory'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { product, loading, error, deleteProduct, deleteImage, setPrimaryImage } = useProduct(id || null)
  const [activeTab, setActiveTab] = useState<'info' | 'prices' | 'history'>('info')

  const handleDelete = async () => {
    if (!product) return
    if (window.confirm(`¿Eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`)) {
      await deleteProduct()
      navigate('/inventario')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <span className="text-sm text-red-700">{error || 'Producto no encontrado'}</span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Gallery */}
        <div>
          <ProductGallery
            images={product.images}
            productName={product.name}
            onDelete={deleteImage}
            onSetPrimary={setPrimaryImage}
          />
        </div>

        {/* Right Column - Info */}
        <div>
          <ProductInfo
            product={product}
            onEdit={() => console.log('Edit product')}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-8">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Información
          </button>
          <button
            onClick={() => setActiveTab('prices')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'prices'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Precios
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Historial
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Variants */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Variantes</h3>
                {product.variants.length > 0 ? (
                  <div className="space-y-2">
                    {product.variants.map((variant) => (
                      <div key={variant.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">{variant.name}</p>
                        <p className="text-sm text-gray-500">{variant.sku}</p>
                        <p className="text-sm text-gray-600">Stock: {variant.stock}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Sin variantes</p>
                )}
              </div>

              {/* Related Bundles */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Paquetes</h3>
                {product.bundles && product.bundles.length > 0 ? (
                  <div className="space-y-2">
                    {product.bundles.map((bundle) => (
                      <div key={bundle.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <Gift className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">{bundle.name}</p>
                          <p className="text-sm text-purple-600">S/ {bundle.bundle_price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No está en ningún paquete</p>
                )}
              </div>

              {/* Related Campaigns */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Liquidaciones</h3>
                {product.campaigns && product.campaigns.length > 0 ? (
                  <div className="space-y-2">
                    {product.campaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <Zap className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="font-medium text-gray-900">{campaign.name}</p>
                          <p className="text-sm text-orange-600">S/ {campaign.liquidation_price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No está en ninguna liquidación</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'prices' && (
            <ProductPrices
              prices={product.prices}
              basePrice={product.base_price}
              onEdit={() => console.log('Edit prices')}
            />
          )}

          {activeTab === 'history' && (
            <ProductHistory movements={product.movements} />
          )}
        </div>
      </div>
    </div>
  )
}
