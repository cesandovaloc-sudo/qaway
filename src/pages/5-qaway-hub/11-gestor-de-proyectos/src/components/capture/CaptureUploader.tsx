import { useRef, useState, useCallback } from 'react'
import { Camera, Upload, Loader2, ImageIcon, Sparkles, Check } from "lucide-react"

interface CaptureUploaderProps {
  onImageSelect: (file: File, preview: string) => void
  loading?: boolean
}

export default function CaptureUploader({ onImageSelect, loading }: CaptureUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileSelected, setFileSelected] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen no debe superar 10MB')
      return
    }
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
    setFileSelected(true)
    
    // Small delay for animation
    setTimeout(() => {
      onImageSelect(file, previewUrl)
    }, 300)
  }, [onImageSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragOver(false), [])

  return (
    <div className="max-w-lg w-full mx-auto">
      {/* Main upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !loading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        aria-label="Área de carga de imagen. Arrastra una imagen o haz clic para seleccionar"
        className={`
          relative overflow-hidden
          border-2 border-dashed rounded-3xl 
          p-12 text-center cursor-pointer 
          transition-all duration-300 ease-out
          focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400
          ${dragOver
            ? 'border-orange-400 bg-orange-50 scale-[1.02] shadow-xl shadow-orange-100'
            : fileSelected
              ? 'border-green-300 bg-green-50'
              : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50 hover:shadow-lg hover:shadow-gray-200/50'
          }
          ${loading ? 'pointer-events-none opacity-75' : ''}
        `}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.03),transparent_70%)]" />

        {loading ? (
          <div className="relative flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-orange-100 flex items-center justify-center">
                <Loader2 size={40} className="text-orange-600 animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-3xl bg-orange-500/20 animate-ping" />
            </div>
            <p className="mt-6 text-base font-semibold text-gray-900">Procesando imagen...</p>
            <p className="mt-1.5 text-sm text-gray-500">La IA está analizando el producto</p>
            <div className="mt-4 w-48 bg-orange-100 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        ) : fileSelected && preview ? (
          <div className="relative">
            <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4">
              <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center animate-bounce">
                  <Check size={32} className="text-white" />
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-green-700">Imagen seleccionada</p>
          </div>
        ) : (
          <div className="relative">
            {/* Icon */}
            <div className={`
              w-24 h-24 rounded-3xl mx-auto mb-6
              flex items-center justify-center
              transition-all duration-300
              ${dragOver 
                ? 'bg-orange-100 scale-110 rotate-3 shadow-lg shadow-orange-200' 
                : 'bg-gray-100 hover:bg-orange-50'
              }
            `}>
              <ImageIcon size={40} className={`transition-colors duration-300 ${dragOver ? 'text-orange-600' : 'text-gray-400'}`} />
            </div>

            {/* Text */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {dragOver ? 'Suelta la imagen aquí' : 'Captura tu producto'}
            </h2>
            <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto leading-relaxed">
              {dragOver 
                ? 'La imagen se analizará automáticamente'
                : 'Arrastra una foto o selecciona del dispositivo'
              }
            </p>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  cameraInputRef.current?.click()
                }}
                className="
                  inline-flex items-center gap-2.5 px-7 py-4 
                  bg-gradient-to-r from-orange-500 to-orange-600 
                  text-white rounded-2xl text-sm font-bold 
                  shadow-lg shadow-orange-500/25
                  hover:shadow-xl hover:shadow-orange-500/30
                  hover:-translate-y-1
                  active:translate-y-0
                  focus:outline-none focus:ring-4 focus:ring-orange-500/30
                  transition-all duration-300
                "
                aria-label="Abrir cámara para tomar foto"
              >
                <Camera size={20} />
                Usar cámara
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                className="
                  inline-flex items-center gap-2.5 px-7 py-4 
                  bg-white text-gray-700 border-2 border-gray-200 
                  rounded-2xl text-sm font-bold 
                  hover:bg-gray-50 hover:border-gray-300 hover:shadow-md
                  hover:-translate-y-1
                  active:translate-y-0
                  focus:outline-none focus:ring-4 focus:ring-gray-200
                  transition-all duration-300
                "
                aria-label="Abrir galería para seleccionar imagen"
              >
                <Upload size={20} />
                Subir imagen
              </button>
            </div>

            {/* Supported formats */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                JPG
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                PNG
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                WEBP
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 font-medium">Máx 10MB</span>
            </div>
          </div>
        )}

        {/* Hover indicator */}
        <div className={`
          absolute inset-0 rounded-3xl 
          ring-1 ring-inset
          ${dragOver ? 'ring-orange-400' : 'ring-transparent'}
          transition-all duration-300
        `} />
      </div>

      {/* AI hint */}
      <div className="flex items-center justify-center gap-2.5 mt-8 py-3 px-4 bg-orange-50 rounded-2xl border border-orange-100">
        <Sparkles size={16} className="text-orange-500" />
        <span className="text-sm text-orange-700 font-medium">
          La IA identificará el producto automáticamente
        </span>
      </div>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
        className="hidden"
        aria-hidden="true"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}
