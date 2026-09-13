import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package } from 'lucide-react'
import ProductDraftForm, { type ProductDraftData } from '@/components/capture/ProductDraftForm'
import { productService } from '@/services/productService'
import type { AIAnalysisResult } from '@/services/aiSuggestionService'

const initialAnalysis: AIAnalysisResult = {
  name: '',
  category: '',
  description: '',
  brand: null,
  material: null,
  color: null,
  condition: 'new',
  estimated_quantity: 1,
  attributes: {},
  confidence: 'high',
  suggested_price: 0,
  suggested_cost: 0,
}

export default function NewProductPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBack = () => {
    const isCoupled = typeof window !== 'undefined' && window.location.pathname.startsWith('/hub/inventario')
    navigate(isCoupled ? '/hub/inventario/logistica' : '/logistica')
  }

  const handleSave = async (data: ProductDraftData) => {
    setSaving(true)
    setError(null)
    try {
      const product = await productService.createProduct({
        name: data.name,
        description: data.description,
        category_id: null,
        brand: data.brand || null,
        base_price: data.price || null,
        cost: data.cost || null,
        min_stock: data.quantity,
        notes: data.notes || null,
        status: 'active',
        commercial_status: 'available',
        unit: 'unit',
        type: 'simple',
      })

      if (product) {
        const isCoupled = typeof window !== 'undefined' && window.location.pathname.startsWith('/hub/inventario')
        navigate(isCoupled ? '/hub/inventario/logistica' : '/logistica')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
          <Package size={20} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">
            Nuevo Producto
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Ingresa los detalles para agregar un producto al catálogo e inventario.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <ProductDraftForm
        analysis={initialAnalysis}
        onSave={handleSave}
        onBack={handleBack}
        saving={saving}
      />
    </div>
  )
}
