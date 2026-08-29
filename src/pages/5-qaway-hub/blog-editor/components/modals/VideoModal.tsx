import React, { useState } from 'react'
import { X, Video, PlayCircle } from 'lucide-react'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (videoUrl: string) => void
}

export default function VideoModal({ isOpen, onClose, onInsert }: VideoModalProps) {
  const [videoUrl, setVideoUrl] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (videoUrl.trim()) {
      onInsert(videoUrl.trim())
      setVideoUrl('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-line rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
          <h3 className="font-display font-bold text-base text-primary flex items-center gap-2">
            <Video className="w-5 h-5 text-accent" />
            Insertar Video
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted mb-1 block">
              Enlace del Video (YouTube, Vimeo, Loom)
            </label>
            <div className="relative">
              <PlayCircle className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                autoFocus
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-surface-muted border border-line rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-accent font-mono text-primary"
              />
            </div>
            <p className="text-[11px] text-muted-light mt-1.5 leading-relaxed">
              Pega el enlace directo de YouTube, Vimeo o Loom para incrustar el reproductor interactivo responsive.
            </p>
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
              Incrustar Video
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
