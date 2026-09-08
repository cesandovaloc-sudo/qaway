import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, AlertCircle, Package, Check, Upload, FileText } from 'lucide-react'
import { sharedAccessService } from '@/services/userService'
import { supabase } from '@/config/supabase'
import { setPageMeta } from '@/utils/seo'
import type { SharedAccessLink, Product } from '@/types'

export default function GuestAccessPage() {
  const { token } = useParams<{ token: string }>()
  const [link, setLink] = useState<SharedAccessLink | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guestName, setGuestName] = useState('')
  const [authenticated, setAuthenticated] = useState(false)

  // Validate token
  useEffect(() => {
    setPageMeta({ title: 'Acceso invitado | Qaway Lab', robots: 'noindex' })
    if (!token) {
      setError('Token no válido')
      setLoading(false)
      return
    }

    const validateToken = async () => {
      try {
        const result = await sharedAccessService.validateToken(token)
        if (result.valid && result.link) {
          setLink(result.link)
        } else {
          setError(result.error || 'Enlace no válido')
        }
      } catch {
        setError('Error al validar el enlace')
      } finally {
        setLoading(false)
      }
    }

    validateToken()
  }, [token])

  // Load products if authenticated
  useEffect(() => {
    if (!authenticated || !link) return

    const loadProducts = async () => {
      try {
        let query = supabase.from('products').select('*').eq('status', 'active')

        // If products are restricted
        if (link.products && link.products.length > 0) {
          query = query.in('id', link.products)
        }

        const { data, error } = await query.order('name')
        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        console.error('Error loading products:', err)
      }
    }

    loadProducts()
  }, [authenticated, link])

  const handleAuthenticate = () => {
    if (!guestName.trim() && link?.guest_name) {
      setGuestName(link.guest_name)
    }
    setAuthenticated(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Acceso no disponible</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  // Name prompt if no guest name
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Bienvenido</h1>
            <p className="text-sm text-gray-500 mt-1">
              {link?.guest_name ? `Hola ${link.guest_name}` : 'Ingresa tu nombre para continuar'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <button
              onClick={handleAuthenticate}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Continuar
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            Enlace proporcionado por Qaway Lab
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Inventario</h1>
              <p className="text-sm text-gray-500">
                Bienvenido, {guestName || link?.guest_name || 'Invitado'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {link?.permissions?.can_set_purchase_price && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Puede colocar precios
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Products */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <GuestProductCard
                key={product.id}
                product={product}
                canSetPrice={link?.permissions?.can_set_purchase_price ?? false}
                canUploadPhotos={link?.permissions?.can_upload_photos ?? false}
                canAddNotes={link?.permissions?.can_add_notes ?? false}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// ── Guest Product Card ──
function GuestProductCard({
  product,
  canSetPrice,
  canUploadPhotos,
  canAddNotes,
}: {
  product: Product
  canSetPrice: boolean
  canUploadPhotos: boolean
  canAddNotes: boolean
}) {
  const [purchasePrice, setPurchasePrice] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    // In a real implementation, this would save to Supabase
    console.log('Saving:', {
      productId: product.id,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
      notes: notes || null,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Product Info */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Package className="w-6 h-6 text-gray-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500">{product.sku}</p>
          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
          {product.brand && (
            <p className="text-xs text-gray-500">{product.brand}</p>
          )}
        </div>
      </div>

      {/* Price Display */}
      {product.base_price && (
        <div className="mb-4 p-2 bg-gray-50 rounded">
          <p className="text-xs text-gray-500">Precio base</p>
          <p className="font-semibold text-gray-900">S/ {product.base_price.toFixed(2)}</p>
        </div>
      )}

      {/* Purchase Price Input */}
      {canSetPrice && (
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Precio de compra</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">S/</span>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="0.00"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      )}

      {/* Notes */}
      {canAddNotes && (
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Agregar notas..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {canUploadPhotos && (
          <button className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Upload className="w-4 h-4" />
            Foto
          </button>
        )}
        <button
          onClick={handleSave}
          className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
            saved
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Guardado
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Guardar
            </>
          )}
        </button>
      </div>
    </div>
  )
}
