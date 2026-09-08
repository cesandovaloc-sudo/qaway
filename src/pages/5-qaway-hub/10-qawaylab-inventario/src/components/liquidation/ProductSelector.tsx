import { useState, useEffect } from 'react'
import { Search, X, Plus, Check, Loader2 } from 'lucide-react'
import { supabase } from '@/config/supabase'
import type { Product } from '@/types'

interface ProductSelectorProps {
  selectedProducts: string[]
  onSelect: (productId: string, price: number) => void
  onRemove: (productId: string) => void
  onClose: () => void
}

export function ProductSelector({ selectedProducts, onSelect, onRemove, onClose }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [prices, setPrices] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = (product: Product) => {
    const price = prices[product.id] || product.base_price || 0
    onSelect(product.id, price)
    setPrices(prev => {
      const next = { ...prev }
      delete next[product.id]
      return next
    })
  }

  const isSelected = (productId: string) => selectedProducts.includes(productId)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Seleccionar productos</h2>
            <p className="text-sm text-gray-500">
              {selectedProducts.length} productos seleccionados
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron productos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map(product => {
                const selected = isSelected(product.id)
                return (
                  <div
                    key={product.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                      selected 
                        ? 'bg-orange-50 border-orange-200' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selected ? 'bg-orange-600 border-orange-600' : 'border-gray-300'
                    }`}>
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                    </div>

                    {/* Price Input */}
                    <div className="w-32">
                      {selected ? (
                        <div className="text-sm text-gray-600">
                          Precio: S/ {(prices[product.id] || product.base_price || 0).toFixed(2)}
                        </div>
                      ) : (
                        <input
                          type="number"
                          placeholder="Precio"
                          value={prices[product.id] || ''}
                          onChange={(e) => setPrices(prev => ({
                            ...prev,
                            [product.id]: parseFloat(e.target.value) || 0
                          }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                        />
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => selected ? onRemove(product.id) : handleAdd(product)}
                      className={`p-2 rounded-lg transition-colors ${
                        selected
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      {selected ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Confirmar selección ({selectedProducts.length} productos)
          </button>
        </div>
      </div>
    </div>
  )
}
