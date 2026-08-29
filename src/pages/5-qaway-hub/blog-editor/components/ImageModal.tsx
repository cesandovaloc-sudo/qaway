import React, { useState, useRef } from 'react'
import { X, UploadCloud, Link2, Image as ImageIcon } from 'lucide-react'
import { uploadImage } from '../services/storageService'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (url: string, alt?: string) => void
}

export default function ImageModal({ isOpen, onClose, onInsert }: ImageModalProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload')
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen.')
      return
    }
    setIsUploading(true)
    try {
      const res = await uploadImage(file)
      onInsert(res.url, alt || file.name.replace(/\.[^/.]+$/, ''))
      onClose()
    } catch (e) {
      console.error(e)
      alert('Error al procesar la imagen.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onInsert(url.trim(), alt)
      setUrl('')
      setAlt('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-line rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-primary flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-accent" />
            Insertar Imagen en el Artículo
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-primary/40 hover:text-primary hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas Subir / URL */}
        <div className="flex rounded-lg bg-surface p-1 mb-5 border border-line">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
              tab === 'upload' ? 'bg-white shadow-xs text-primary' : 'text-primary/50 hover:text-primary'
            }`}
          >
            Subir archivo
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
              tab === 'url' ? 'bg-white shadow-xs text-primary' : 'text-primary/50 hover:text-primary'
            }`}
          >
            Pegar enlace web
          </button>
        </div>

        {tab === 'upload' ? (
          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-line hover:border-accent/60 bg-surface/50 rounded-xl p-8 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-7 h-7 border-3 border-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-primary/70">Subiendo imagen...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="w-8 h-8 text-accent mb-2" />
                  <p className="text-sm font-bold text-primary">Haz clic para seleccionar imagen</p>
                  <p className="text-[11px] text-primary/40 mt-1">PNG, JPG, GIF o WebP</p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-primary/50 mb-1 block">
                Texto alternativo / Pie de foto (opcional)
              </label>
              <input
                type="text"
                value={alt}
                onChange={e => setAlt(e.target.value)}
                placeholder="Descripción de la imagen"
                className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-primary/50 mb-1 block">
                URL de la imagen
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-primary/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  required
                  autoFocus
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  className="w-full bg-surface border border-line rounded-lg pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-primary/50 mb-1 block">
                Texto alternativo / Pie de foto
              </label>
              <input
                type="text"
                value={alt}
                onChange={e => setAlt(e.target.value)}
                placeholder="Descripción de la imagen"
                className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-primary/60 hover:text-primary rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-accent hover:bg-accent-dark text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
              >
                Insertar imagen
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
