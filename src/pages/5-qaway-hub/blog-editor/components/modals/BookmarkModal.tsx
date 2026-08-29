import React, { useState } from 'react'
import { X, Bookmark } from 'lucide-react'

export interface BookmarkData {
  url: string
  title: string
  description: string
  authorOrSite: string
  imageUrl?: string
}

interface BookmarkModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (data: BookmarkData) => void
}

export default function BookmarkModal({ isOpen, onClose, onInsert }: BookmarkModalProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [authorOrSite, setAuthorOrSite] = useState('Qaway Lab')
  const [imageUrl, setImageUrl] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim() && title.trim()) {
      onInsert({
        url: url.trim(),
        title: title.trim(),
        description: description.trim(),
        authorOrSite: authorOrSite.trim() || 'Fuente externa',
        imageUrl: imageUrl.trim() || undefined,
      })
      setUrl('')
      setTitle('')
      setDescription('')
      setImageUrl('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-line rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
          <h3 className="font-display font-bold text-base text-primary flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-accent" />
            Insertar Tarjeta de Enlace / Cita
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted mb-1 block">
              URL del Artículo o Fuente Citada
            </label>
            <input
              type="url"
              required
              autoFocus
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://qawaylab.com/blog/..."
              className="w-full bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted mb-1 block">
              Título del Contenido Citado
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Cómo estructurar una landing que convierta"
              className="w-full bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted mb-1 block">
              Resumen o Cita (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Breve extracto de la fuente citada..."
              className="w-full bg-surface-muted border border-line rounded-lg p-2 text-xs focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted mb-1 block">
                Nombre del Sitio / Autor
              </label>
              <input
                type="text"
                value={authorOrSite}
                onChange={e => setAuthorOrSite(e.target.value)}
                placeholder="Ej: Qaway Lab"
                className="w-full bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted mb-1 block">
                Miniatura (Opcional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://.../foto.jpg"
                className="w-full bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent"
              />
            </div>
          </div>

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
              className="bg-accent hover:bg-accent-dark text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Insertar Tarjeta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
