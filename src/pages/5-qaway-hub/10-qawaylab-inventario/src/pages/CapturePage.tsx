import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, CheckCircle2, Camera, Package, RotateCcw } from 'lucide-react'
import CaptureUploader from '@/components/capture/CaptureUploader'
import AIAnalysis from '@/components/capture/AIAnalysis'
import ProductDraftForm, { type ProductDraftData } from '@/components/capture/ProductDraftForm'
import { aiService, type AIAnalysisResult } from '@/services/aiSuggestionService'
import { productService } from '@/services/productService'

type CaptureStep = 'upload' | 'analyzing' | 'result' | 'editing' | 'success'

export default function CapturePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<CaptureStep>('upload')
  const [_imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null)
  const [error, setError] = useState<string>("")
  const [saving, setSaving] = useState(false)

  // Step 1: Image selected
  const handleImageSelect = async (file: File, preview: string) => {
    setImageFile(file)
    setImagePreview(preview)
    setStep('analyzing')
    setError('')

    try {
      const result = await aiService.analyzeImage(preview)
      setAnalysis(result)
      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al analizar la imagen')
      setStep('upload')
    }
  }

  // Step 2: User wants to edit
  const handleEdit = () => {
    setStep('editing')
  }

  // Step 3: User saves the product
  const handleSave = async (data: ProductDraftData) => {
    setSaving(true)
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
        setStep('success')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  // Reset flow
  const handleReset = () => {
    setStep('upload')
    setImageFile(null)
    setImagePreview('')
    setAnalysis(null)
    setError('')
  }

  // Steps configuration
  const steps: { key: CaptureStep; label: string; number: number }[] = [
    { key: 'upload', label: 'Capturar', number: 1 },
    { key: 'analyzing', label: 'Analizando', number: 2 },
    { key: 'result', label: 'Resultado', number: 3 },
    { key: 'editing', label: 'Editar', number: 4 },
    { key: 'success', label: 'Guardado', number: 5 },
  ]

  const currentStepIndex = steps.findIndex(x => x.key === step)

  return (
    <div className="min-h-dvh bg-gradient-to-br from-gray-50 via-white to-orange-50/30 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-200 rounded-xl px-3 py-2"
            aria-label="Volver al dashboard"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Volver</span>
          </Link>
          
          <div className="h-6 w-px bg-gray-200" />
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl shadow-lg shadow-orange-200">
              <Camera size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm block leading-tight">
                Captura con IA
              </span>
              <span className="text-xs text-gray-500">
                Paso {currentStepIndex + 1} de {steps.length}
              </span>
            </div>
          </div>

          {/* Step indicator */}
          <div className="ml-auto hidden sm:flex items-center gap-1.5">
            {steps.map((s, i) => {
              const isActive = step === s.key
              const isCompleted = currentStepIndex > i
              
              return (
                <div key={s.key} className="flex items-center">
                  <div className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold
                    transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-300 scale-110' 
                      : isCompleted
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-400'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      s.number
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`
                      w-6 h-0.5 mx-0.5 rounded-full
                      ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="w-full">
            {error && (
              <div className="max-w-lg mx-auto mb-6 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-xl">
                  <AlertCircle size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-0.5">{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  aria-label="Cerrar error"
                >
                  ×
                </button>
              </div>
            )}
            <CaptureUploader onImageSelect={handleImageSelect} />
          </div>
        )}

        {/* Step: Analyzing */}
        {step === 'analyzing' && (
          <AIAnalysis
            status="analyzing"
            imagePreview={imagePreview}
          />
        )}

        {/* Step: Result */}
        {step === 'result' && analysis && (
          <div className="w-full space-y-6">
            <AIAnalysis
              status="complete"
              result={analysis}
              imagePreview={imagePreview}
              onRetry={handleReset}
            />
            <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleReset}
                className="
                  w-full sm:w-auto inline-flex items-center justify-center gap-2.5 
                  px-6 py-3.5 text-sm font-semibold text-gray-600 
                  bg-white border-2 border-gray-200 rounded-2xl
                  hover:bg-gray-50 hover:border-gray-300 
                  focus:outline-none focus:ring-4 focus:ring-gray-200
                  transition-all duration-200
                "
              >
                <RotateCcw size={16} />
                Capturar otra
              </button>
              <button
                onClick={handleEdit}
                className="
                  w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 
                  bg-gradient-to-r from-orange-500 to-orange-600 
                  text-white rounded-2xl text-sm font-bold 
                  shadow-lg shadow-orange-500/25
                  hover:shadow-xl hover:shadow-orange-500/30
                  hover:-translate-y-1
                  active:translate-y-0
                  focus:outline-none focus:ring-4 focus:ring-orange-500/30
                  transition-all duration-300
                "
              >
                <Sparkles size={18} />
                Confirmar y editar
              </button>
            </div>
          </div>
        )}

        {/* Step: Editing */}
        {step === 'editing' && analysis && (
          <ProductDraftForm
            analysis={analysis}
            imagePreview={imagePreview}
            onSave={handleSave}
            onBack={() => setStep('result')}
            saving={saving}
          />
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="max-w-md w-full mx-auto text-center">
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-200">
                <CheckCircle2 size={48} className="text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Package size={16} className="text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Producto guardado
            </h2>
            <p className="text-base text-gray-500 mb-10 max-w-sm mx-auto">
              El producto se agregó a tu inventario correctamente
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleReset}
                className="
                  w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-gray-600 
                  bg-white border-2 border-gray-200 rounded-2xl
                  hover:bg-gray-50 hover:border-gray-300
                  focus:outline-none focus:ring-4 focus:ring-gray-200
                  transition-all duration-200
                "
              >
                Capturar otro
              </button>
              <button
                onClick={() => navigate('/inventario')}
                className="
                  w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 
                  bg-gradient-to-r from-orange-500 to-orange-600 
                  text-white rounded-2xl text-sm font-bold 
                  shadow-lg shadow-orange-500/25
                  hover:shadow-xl hover:shadow-orange-500/30
                  hover:-translate-y-1
                  active:translate-y-0
                  focus:outline-none focus:ring-4 focus:ring-orange-500/30
                  transition-all duration-300
                "
              >
                <Package size={18} />
                Ver en inventario
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Alert Icon (for error state) ──
function AlertCircle({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}
