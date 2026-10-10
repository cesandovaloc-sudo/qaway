import { Loader2, CheckCircle2, AlertCircle, Sparkles, Tag, Palette, Box, Hash, RotateCcw } from 'lucide-react'
import type { AIAnalysisResult } from '@/services/aiSuggestionService'
import { confidenceStyles, conditionLabels } from '@/services/aiSuggestionService'

interface AIAnalysisProps {
  status: 'analyzing' | 'complete' | 'error'
  result?: AIAnalysisResult
  error?: string
  imagePreview?: string
  onRetry?: () => void
}

export default function AIAnalysis({ status, result, error, imagePreview, onRetry }: AIAnalysisProps) {
  return (
    <div className="max-w-lg w-full mx-auto space-y-6">
      {/* Image preview */}
      {imagePreview && (
        <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-lg">
          <img
            src={imagePreview}
            alt="Producto capturado"
            className="w-full h-56 object-cover"
          />
          {status === 'analyzing' && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
              <div className="flex items-center gap-2 text-white">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm font-medium">Analizando...</span>
              </div>
            </div>
          )}
          {status === 'complete' && (
            <div className="absolute top-4 right-4">
              <div className="px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <CheckCircle2 size={14} />
                Detectado
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analyzing state */}
      {status === 'analyzing' && (
        <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-3xl border border-orange-100 p-10 text-center">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
              <Loader2 size={32} className="text-white animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-3xl bg-orange-400/30 animate-ping" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Analizando producto...</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            La IA está identificando el producto en la imagen
          </p>
          <div className="w-full bg-orange-100 rounded-full h-2 max-w-xs mx-auto overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full animate-progress" style={{ width: '60%' }} />
          </div>
          <p className="text-xs text-gray-400 mt-4">Esto puede tomar unos segundos</p>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="bg-gradient-to-br from-red-50 via-white to-orange-50 rounded-3xl border border-red-100 p-10 text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No se pudo analizar</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            {error || 'Hubo un error al analizar la imagen. Intenta con otra foto.'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="
                inline-flex items-center gap-2 px-6 py-3 
                bg-white text-gray-700 border-2 border-gray-200 
                rounded-2xl text-sm font-bold 
                hover:bg-gray-50 hover:border-gray-300
                transition-all duration-300
              "
            >
              <RotateCcw size={16} />
              Intentar de nuevo
            </button>
          )}
        </div>
      )}

      {/* Complete state */}
      {status === 'complete' && result && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 px-8 py-6 border-b border-emerald-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <CheckCircle2 size={24} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Producto identificado</h3>
                <p className="text-sm text-gray-500 mt-0.5">La IA analizó la imagen correctamente</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Main info */}
            <div className="space-y-4">
              <InfoRow 
                icon={<Tag size={18} className="text-orange-500" />}
                label="Nombre" 
                value={result.name} 
                highlight 
              />
              <InfoRow 
                icon={<Box size={18} className="text-blue-500" />}
                label="Categoría" 
                value={result.category} 
              />
              <InfoRow 
                icon={<Palette size={18} className="text-purple-500" />}
                label="Color" 
                value={result.color || 'No identificado'} 
              />
              {result.brand && (
                <InfoRow 
                  icon={<span className="text-sm font-bold text-gray-400">M</span>}
                  label="Marca" 
                  value={result.brand} 
                />
              )}
              {result.material && (
                <InfoRow 
                  icon={<span className="text-sm font-bold text-gray-400">Mat</span>}
                  label="Material" 
                  value={result.material} 
                />
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Condition & Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1.5 font-medium">Estado</p>
                <p className="text-base font-bold text-gray-900">
                  {conditionLabels[result.condition] || result.condition}
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1.5 font-medium">Cantidad</p>
                <div className="flex items-center gap-1.5">
                  <Hash size={16} className="text-gray-400" />
                  <p className="text-base font-bold text-gray-900">
                    {result.estimated_quantity}
                  </p>
                </div>
              </div>
            </div>

            {/* Confidence */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="text-sm text-gray-600 font-medium">Confianza del análisis</span>
              <span className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold
                ${confidenceStyles[result.confidence].bg} ${confidenceStyles[result.confidence].text}
              `}>
                <span className={`w-2 h-2 rounded-full ${
                  result.confidence === 'high' ? 'bg-emerald-500' :
                  result.confidence === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                {confidenceStyles[result.confidence].label}
              </span>
            </div>

            {/* AI badge */}
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <Sparkles size={18} className="text-orange-500" />
              <span className="text-sm text-orange-700 font-medium">
                Datos sugeridos por IA — confirma o edita antes de guardar
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Info Row ──
function InfoRow({ 
  icon, 
  label, 
  value, 
  highlight = false 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-sm truncate ${highlight ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
          {value}
        </p>
      </div>
    </div>
  )
}
