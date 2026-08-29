import React, { useState, useRef } from 'react'
import { Image as ImageIcon, UploadCloud, X, Link2, Eye, ChevronUp } from 'lucide-react'
import { uploadImage } from '../services/storageService'

interface CoverDropzoneProps {
  coverUrl: string
  coverAlt?: string
  onChange: (url: string, alt?: string) => void
}

export default function CoverDropzone({ coverUrl, coverAlt = '', onChange }: CoverDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [manualUrl, setManualUrl] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).')
      return
    }
    setIsUploading(true)
    try {
      const res = await uploadImage(file)
      onChange(res.url, file.name.replace(/\.[^/.]+$/, ''))
      setIsOpen(false)
      setShowUrlInput(false)
    } catch (e) {
      console.error('Error al subir imagen:', e)
      alert('No se pudo procesar la imagen seleccionada.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const sampleImages = [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611746872915-64382b5c76da?q=80&w=1200&auto=format&fit=crop',
  ]

  if (coverUrl) {
    return (
      <div className="shrink-0 mb-3 font-sans">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {!isExpanded ? (
          /* Tira Compacta Proporcional de Alta Calidad */
          <div className="bg-[#fafafc] hover:bg-white border border-line rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-all">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className="relative group/thumb cursor-pointer overflow-hidden rounded-lg border border-line shrink-0 shadow-2xs"
                onClick={() => setIsExpanded(true)}
                title="Clic para expandir a tamaño real"
              >
                <img
                  src={coverUrl}
                  alt={coverAlt || 'Portada'}
                  className="w-20 h-12 sm:w-24 sm:h-14 object-cover transition-transform group-hover/thumb:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                  <Eye className="w-4 h-4 text-white drop-shadow-sm" />
                </div>
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                    Portada Oficial 1200×630
                  </span>
                  <span className="text-xs font-semibold text-primary truncate hidden md:inline">
                    {coverAlt || 'Imagen cargada'}
                  </span>
                </div>
                <p className="text-xs text-muted-light font-mono truncate max-w-[240px] sm:max-w-md">
                  {coverUrl.startsWith('data:') ? 'Archivo local cargado' : coverUrl}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-primary bg-white hover:bg-surface-muted border border-line px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="Expandir vista completa"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Expandir</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-white hover:bg-surface-muted border border-line px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="Cambiar foto de portada"
              >
                <span>Cambiar</span>
              </button>

              <button
                type="button"
                onClick={() => onChange('', '')}
                title="Eliminar foto de portada"
                className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Vista Expandida en Proporción Nativa 1200x630 */
          <div className="relative group rounded-xl overflow-hidden border border-line bg-surface-muted shadow-xs mb-1">
            <img
              src={coverUrl}
              alt={coverAlt || 'Portada del artículo'}
              className="w-full aspect-[1200/630] object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="bg-white hover:bg-surface-muted text-primary text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronUp className="w-4 h-4" /> Colapsar tira
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white hover:bg-surface-muted text-primary text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Cambiar foto
                </button>
              </div>

              <button
                type="button"
                onClick={() => onChange('', '')}
                title="Quitar portada"
                className="bg-danger hover:bg-danger/90 text-white p-2 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mb-2 shrink-0 font-sans">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {!isOpen ? (
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-700 bg-[#fafafc] hover:bg-white hover:text-accent border border-line py-2 px-3.5 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer select-none"
          >
            <ImageIcon className="w-4 h-4 text-accent" />
            <span>+ Subir foto de portada</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-xs text-muted hover:text-primary underline cursor-pointer"
          >
            o pegar enlace
          </button>
        </div>
      ) : (
        <div
          onDragOver={e => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setIsDragging(false)
            if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
          }}
          className={`border border-dashed rounded-xl p-5 text-center transition-all bg-[#fafafc] relative shadow-xs ${
            isDragging ? 'border-accent bg-accent/5' : 'border-line hover:border-muted-light'
          }`}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 p-1 text-muted-light hover:text-primary rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {isUploading ? (
            <div className="py-3 flex flex-col items-center gap-1.5">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-primary">Procesando foto de portada...</span>
            </div>
          ) : showUrlInput ? (
            <div className="max-w-md mx-auto py-1 flex items-center gap-2">
              <input
                type="url"
                autoFocus
                value={manualUrl}
                onChange={e => setManualUrl(e.target.value)}
                placeholder="https://ejemplo.com/foto.jpg"
                className="flex-1 bg-white border border-line rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent shadow-2xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (manualUrl.trim()) {
                    onChange(manualUrl.trim(), coverAlt)
                    setShowUrlInput(false)
                    setIsOpen(false)
                  }
                }}
                className="bg-[#24262e] hover:bg-[#2f323c] text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Aplicar
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 bg-[#24262e] hover:bg-[#2f323c] text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-4 h-4" /> Explorar archivos
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="inline-flex items-center gap-1.5 bg-white border border-line hover:border-muted-light text-primary px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer shadow-2xs transition-colors"
                >
                  <Link2 className="w-4 h-4" /> Pegar enlace
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted pt-0.5">
                <span>O sugiere una muestra:</span>
                {sampleImages.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onChange(s, 'Muestra')
                      setIsOpen(false)
                    }}
                    className="w-7 h-7 rounded overflow-hidden border border-line hover:border-accent shadow-2xs cursor-pointer transition-transform hover:scale-105"
                  >
                    <img src={s} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
