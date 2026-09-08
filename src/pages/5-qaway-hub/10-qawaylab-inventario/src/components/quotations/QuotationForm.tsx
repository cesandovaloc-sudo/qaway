import { useState, useEffect } from 'react'
import { X, Trash2, Save, Loader2, Search, User, Package } from 'lucide-react'
import { customerService } from '@/services/customerService'
import { supabase } from '@/config/supabase'
import type { Customer, Product } from '@/types'

interface QuotationFormProps {
  quotation?: any
  onSave: (data: any) => Promise<void>
  onClose: () => void
}

interface QuotationItemForm {
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  discount: number
}

export function QuotationForm({ quotation, onSave, onClose }: QuotationFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  const [items, setItems] = useState<QuotationItemForm[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)

  const [discount, setDiscount] = useState(0)
  const [validUntil, setValidUntil] = useState('')
  const [notes, setNotes] = useState('')

  // Load customers and products
  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersData, productsData] = await Promise.all([
          customerService.getCustomers({ page: 1, per_page: 100 }),
          supabase.from('products').select('*').eq('status', 'active').order('name'),
        ])
        setCustomers(customersData.data)
        setProducts(productsData.data || [])
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter customers
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(customerSearch.toLowerCase()))
  )

  // Filter products
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  ).filter(p => !items.some(item => item.product_id === p.id))

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unit_price
    return sum + itemTotal - item.discount
  }, 0)
  const total = subtotal - discount

  const handleAddProduct = (product: Product) => {
    setItems(prev => [...prev, {
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      quantity: 1,
      unit_price: product.base_price || 0,
      discount: 0,
    }])
    setProductSearch('')
    setShowProductDropdown(false)
  }

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof QuotationItemForm, value: number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (items.length === 0) {
      setError('Agrega al menos un producto')
      return
    }

    try {
      setSaving(true)
      setError(null)
      await onSave({
        customer_id: selectedCustomer?.id || null,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount,
        })),
        discount,
        valid_until: validUntil || null,
        notes: notes || null,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {quotation ? 'Editar cotización' : 'Nueva cotización'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Cliente
            </label>
            <div className="relative">
              <input
                type="text"
                value={selectedCustomer ? `${selectedCustomer.name} ${selectedCustomer.company ? `(${selectedCustomer.company})` : ''}` : customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value)
                  setSelectedCustomer(null)
                  setShowCustomerDropdown(true)
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                placeholder="Buscar cliente..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              {showCustomerDropdown && !selectedCustomer && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredCustomers.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">No hay clientes</div>
                  ) : (
                    filteredCustomers.map(customer => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setCustomerSearch('')
                          setShowCustomerDropdown(false)
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        {customer.company && (
                          <p className="text-xs text-gray-500">{customer.company}</p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 inline mr-1" />
              Productos
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value)
                  setShowProductDropdown(true)
                }}
                onFocus={() => setShowProductDropdown(true)}
                placeholder="Buscar producto para agregar..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              {showProductDropdown && productSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">No hay productos disponibles</div>
                  ) : (
                    filteredProducts.map(product => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleAddProduct(product)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sku}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          S/ {(product.base_price || 0).toFixed(2)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">Cant.</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Precio</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Desc.</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Subtotal</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-xs text-gray-500">{item.product_sku}</p>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          min={1}
                          className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          step={0.01}
                          className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                          step={0.01}
                          className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        S/ {((item.quantity * item.unit_price) - item.discount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span className="text-gray-900">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Descuento:</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  step={0.01}
                  className="w-24 px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span className="text-gray-700">Total:</span>
                <span className="text-gray-900">S/ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Válida hasta</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas para el cliente..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || items.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {quotation ? 'Actualizar' : 'Crear cotización'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
