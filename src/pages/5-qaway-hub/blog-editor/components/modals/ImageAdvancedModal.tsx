import React, { useState, useRef } from 'react'
import {
  X,
  UploadCloud,
  Link2,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
} from 'lucide-react'
import { uploadImage } from '../../services/storageService'

export type ImageAlignment = 'left' | 'center' | 'right' | 'full'

export interface ImageInsertData {
  url: string
  alt: string
  caption?: string
  align: ImageAlignment
  width?: string
}

interface ImageAdvancedModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (data: ImageInsertData) => void
}

export default function ImageAdvancedModal({
  isOpen,
  onClose,
  onInsert,
}: ImageAdvancedModalProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload')
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [caption, setCaption] = useState('')
  const [align, setAlign] = useState<ImageAlignment>('center')
  const [width, setWidth] = useState<string>('75%')
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.')
      return
    }
    setIsUploading(true)
    try {
      const res = await uploadImage(file)
      setUrl(res.url)
      setPreviewUrl(res.url)
      if (!alt) setAlt(file.name.replace(/\.[^/.]+$/, ''))
    } catch (e) {
      console.error(e)
      alert('Error al subir imagen.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalUrl = previewUrl || url
    if (!finalUrl.trim()) {
      alert('Por favor selecciona o ingresa la URL de una imagen.')
      return
    }

    let finalWidth = width
    if (align === 'left' || align === 'right') {
      finalWidth = width === '100%' ? '48%' : width
    } else if (align === 'full') {
      finalWidth = '100%'
    }

    onInsert({
      url: finalUrl.trim(),
      alt: alt.trim() || 'Imagen del artículo',
      caption: caption.trim(),
      align,
      width: finalWidth,
    })

    // Reset
    setUrl('')
    setAlt('')
    setCaption('')
    setPreviewUrl('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-line rounded-2xl shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
          <h3 className="font-display font-bold text-base text-primary flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-accent" />
            Insertar & Configurar Imagen
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas Subir / URL */}
        <div className="flex rounded-lg bg-surface-muted p-1 mb-4 border border-line">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              tab === 'upload' ? 'bg-white shadow-xs text-primary font-bold' : 'text-muted hover:text-primary'
            }`}
          >
            Subir archivo
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              tab === 'url' ? 'bg-white shadow-xs text-primary font-bold' : 'text-muted hover:text-primary'
            }`}
          >
            Pegar enlace URL
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'upload' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-line hover:border-accent/60 bg-surface-muted/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-primary">Procesando imagen...</span>
                  </div>
                ) : previewUrl ? (
                  <div className="space-y-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-36 mx-auto rounded-lg object-contain border border-line"
                    />
                    <p className="text-xs font-semibold text-accent">Clic para cambiar imagen</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <UploadCloud className="w-8 h-8 text-accent mb-2" />
                    <p className="text-xs sm:text-sm font-bold text-primary">Haz clic para seleccionar imagen</p>
                    <p className="text-[11px] text-muted-light mt-1">PNG, JPG, WebP o GIF</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted mb-1 block">
                URL de la imagen
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  required={tab === 'url'}
                  value={url}
                  onChange={e => {
                    setUrl(e.target.value)
                    setPreviewUrl(e.target.value)
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full bg-surface-muted border border-line rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-accent font-mono"
                />
              </div>
            </div>
          )}

          {/* Alineación y Tamaño (Flotante o Ancho) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted mb-1.5 block">
              Alineación y Disposición con el Texto
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setAlign('left')}
                className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  align === 'left'
                    ? 'border-accent bg-accent/10 text-accent font-bold shadow-2xs'
                    : 'border-line bg-white hover:bg-surface-muted text-muted'
                }`}
                title="Imagen a la izquierda, texto envolvente a la derecha"
              >
                <AlignLeft className="w-4 h-4" />
                <span className="text-[10px]">Izquierda (50%)</span>
              </button>

              <button
                type="button"
                onClick={() => setAlign('center')}
                className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  align === 'center'
                    ? 'border-accent bg-accent/10 text-accent font-bold shadow-2xs'
                    : 'border-line bg-white hover:bg-surface-muted text-muted'
                }`}
                title="Imagen centrada al 75%"
              >
                <AlignCenter className="w-4 h-4" />
                <span className="text-[10px]">Centrada (75%)</span>
              </button>

              <button
                type="button"
                onClick={() => setAlign('right')}
                className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  align === 'right'
                    ? 'border-accent bg-accent/10 text-accent font-bold shadow-2xs'
                    : 'border-line bg-white hover:bg-surface-muted text-muted'
                }`}
                title="Imagen a la derecha, texto envolvente a la izquierda"
              >
                <AlignRight className="w-4 h-4" />
                <span className="text-[10px]">Derecha (50%)</span>
              </button>

              <button
                type="button"
                onClick={() => setAlign('full')}
                className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  align === 'full'
                    ? 'border-accent bg-accent/10 text-accent font-bold shadow-2xs'
                    : 'border-line bg-white hover:bg-surface-muted text-muted'
                }`}
                title="Ancho completo (100%)"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="text-[10px]">Completo (100%)</span>
              </button>
            </div>
          </div>

          {/* Tamaño / Ancho de Imagen */}
          {align !== 'full' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted mb-1.5 block">
                Tamaño de la Imagen:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '30% Pequeña', value: '30%' },
                  { label: '48% Flotante', value: '48%' },
                  { label: '75% Mediana', value: '75%' },
                  { label: '100% Completa', value: '100%' },
                ].map((sz, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setWidth(sz.value)}
                    className={`py-1.5 px-2 rounded-lg border text-xs text-center font-bold transition-all cursor-pointer ${
                      width === sz.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-line bg-white hover:bg-surface-muted text-muted'
                    }`}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Metadatos: Texto Alt & Pie de Foto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted mb-1 block">
                Texto Alt (SEO & Accesibilidad)
              </label>
              <input
                type="text"
                value={alt}
                onChange={e => setAlt(e.target.value)}
                placeholder="Descripción concisa de la foto"
                className="w-full bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted mb-1 block">
                Pie de Foto / Caption (Opcional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Ej: Dashboard de métricas Qaway Lab"
                className="w-full bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted hover:text-primary rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="bg-accent hover:bg-accent-dark text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Insertar en el Artículo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
