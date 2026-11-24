import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Sparkles, Save, AlertCircle, ImagePlus, X } from "lucide-react"
import type { AIAnalysisResult } from '@/services/aiSuggestionService'
import { confidenceStyles, conditionLabels } from '@/services/aiSuggestionService'

interface ProductDraftFormProps {
  analysis: AIAnalysisResult
  imagePreview?: string
  onSave: (data: ProductDraftData) => void
  onBack: () => void
  saving?: boolean
}

export interface ProductDraftData {
  name: string
  category: string
  description: string
  brand: string
  material: string
  color: string
  condition: string
  quantity: number
  price: number
  cost: number
  notes: string
  imageFile?: File | null
  imagePreview?: string
}

export default function ProductDraftForm({
  analysis,
  imagePreview,
  onSave,
  onBack,
  saving,
}: ProductDraftFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [localImageFile, setLocalImageFile] = useState<File | null>(null)
  const [localImagePreview, setLocalImagePreview] = useState<string>(imagePreview || '')
  const [formData, setFormData] = useState<ProductDraftData>({
    name: analysis.name,
    category: analysis.category,
    description: analysis.description,
    brand: analysis.brand || '',
    material: analysis.material || '',
    color: analysis.color || '',
    condition: analysis.condition,
    quantity: analysis.estimated_quantity,
    price: analysis.suggested_price || 0,
    cost: analysis.suggested_cost || 0,
    notes: '',
    imageFile: null,
    imagePreview: imagePreview || '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ProductDraftData, string>>>({})

  useEffect(() => {
    if (imagePreview) {
      setLocalImagePreview(imagePreview)
      setFormData((prev) => ({ ...prev, imagePreview }))
    }
  }, [imagePreview])

  const handleImageSelect = (file?: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const preview = URL.createObjectURL(file)
    setLocalImageFile(file)
    setLocalImagePreview(preview)
    setFormData((prev) => ({ ...prev, imageFile: file, imagePreview: preview }))
  }

  const clearImage = () => {
    setLocalImageFile(null)
    setLocalImagePreview('')
    setFormData((prev) => ({ ...prev, imageFile: null, imagePreview: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleChange = (field: keyof ProductDraftData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductDraftData, string>> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSave({
        ...formData,
        imageFile: localImageFile,
        imagePreview: localImagePreview || formData.imagePreview || '',
      })
    }
  }

  return (
    <div className="max-w-2xl w-full mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-3 rounded-2xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
          aria-label="Volver al análisis"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">
            Confirmar producto
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Edita los datos sugeridos por IA antes de guardar
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100">
          <Sparkles size={14} className="text-orange-500" />
          <span className="text-xs font-bold text-orange-700">
            Confianza: {confidenceStyles[analysis.confidence].label}
          </span>
        </div>
      </div>

      {/* Image preview / upload */}
      <div className="mb-6 rounded-3xl overflow-hidden border border-gray-200 shadow-lg bg-white">
        {localImagePreview ? (
          <div className="relative">
            <img
              src={localImagePreview}
              alt="Producto"
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white/90 text-xs font-semibold text-gray-700 hover:bg-white border border-gray-200"
              >
                Cambiar foto
              </button>
              <button
                type="button"
                onClick={clearImage}
                className="p-1.5 rounded-lg bg-white/90 text-gray-700 hover:bg-white border border-gray-200"
                aria-label="Quitar foto"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-48 flex flex-col items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ImagePlus size={28} className="text-orange-500" />
            <span className="text-sm font-semibold text-gray-700">Subir foto del producto</span>
            <span className="text-xs text-gray-400">JPG, PNG o WebP</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageSelect(e.target.files?.[0] || null)}
        />
      </div>

      {/* Form */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 space-y-6">
        {/* Name */}
        <FormField label="Nombre del producto" required error={errors.name}>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ej: Silla ejecutiva negra"
            className={`
              w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl text-sm text-gray-900 
              placeholder:text-gray-400 focus:outline-none focus:ring-0 transition-all
              ${errors.name 
                ? 'border-red-300 focus:border-red-500 bg-red-50' 
                : 'border-gray-200 focus:border-orange-500 focus:bg-white'
              }
            `}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
        </FormField>

        {/* Category */}
        <FormField label="Categoría">
          <input
            type="text"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            placeholder="Ej: Mobiliario"
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-orange-500 focus:bg-white transition-all"
          />
        </FormField>

        {/* Description */}
        <FormField label="Descripción">
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            placeholder="Describe el producto..."
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-orange-500 focus:bg-white transition-all resize-none"
          />
        </FormField>

        {/* Brand & Material */}
        <div className="grid grid-cols-2 gap-5">
          <FormField label="Marca">
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
              placeholder="Opcional"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-orange-500 focus:bg-white transition-all"
            />
          </FormField>
          <FormField label="Material">
            <input
              type="text"
              value={formData.material}
              onChange={(e) => handleChange('material', e.target.value)}
              placeholder="Opcional"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-orange-500 focus:bg-white transition-all"
            />
          </FormField>
        </div>

        {/* Color & Condition */}
        <div className="grid grid-cols-2 gap-5">
          <FormField label="Color">
            <input
              type="text"
              value={formData.color}
              onChange={(e) => handleChange('color', e.target.value)}
              placeholder="Ej: Negro"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-orange-500 focus:bg-white transition-all"
            />
          </FormField>
          <FormField label="Estado">
            <select
              value={formData.condition}
              onChange={(e) => handleChange('condition', e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-0 focus:border-orange-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              {Object.entries(conditionLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Quantity & Price */}
        <div className="grid grid-cols-3 gap-5">
          <FormField label="Cantidad">
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', Number(e.target.value))}
              min={1}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-0 focus:border-orange-500 focus:bg-white transition-all"
            />
          </FormField>
          <FormField label="Precio (S/)">
            <input
              type="number"
              value={formData.price || ''}
              onChange={(e) => handleChange('price', Number(e.target.value))}
              min={0}
              step={0.01}
              placeholder="0.00"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-orange-500 focus:bg-white transition-all"
            />
          </FormField>
          <FormField label="Costo (S/)">
            <input
              type="number"
              value={formData.cost || ''}
              onChange={(e) => handleChange('cost', Number(e.target.value))}
              min={0}
              step={0.01}
              placeholder="0.00"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-orange-500 focus:bg-white transition-all"
            />
          </FormField>
        </div>

        {/* Notes */}
        <FormField label="Notas adicionales">
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={2}
            placeholder="Observaciones, detalles, etc."
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-orange-500 focus:bg-white transition-all resize-none"
          />
        </FormField>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
        >
          Volver al análisis
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.name.trim() || saving}
          className="
            inline-flex items-center gap-3 px-8 py-4 
            bg-gradient-to-r from-orange-500 to-orange-600 
            text-white rounded-2xl text-sm font-bold 
            shadow-lg shadow-orange-500/25
            hover:shadow-xl hover:shadow-orange-500/30
            hover:-translate-y-1
            active:translate-y-0
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
            focus:outline-none focus:ring-4 focus:ring-orange-500/30
            transition-all duration-300
          "
          aria-label="Confirmar y guardar producto"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save size={18} />
              Confirmar y guardar
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Form Field ──
function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-2">
        {label}
        {required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-2 text-xs text-red-600 flex items-center gap-1.5" id={`${label.toLowerCase().replace(/\s+/g, '-')}-error`}>
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}
