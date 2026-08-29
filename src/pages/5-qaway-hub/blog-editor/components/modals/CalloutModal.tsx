import React, { useState } from 'react'
import { X, Lightbulb, ExternalLink } from 'lucide-react'

export interface CalloutData {
  calloutType: 'tip' | 'data' | 'key' | 'warning'
  title: string
  text: string
  sourceUrl?: string
  sourceLabel?: string
}

interface CalloutModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (data: CalloutData) => void
}

export default function CalloutModal({ isOpen, onClose, onInsert }: CalloutModalProps) {
  const [calloutType, setCalloutType] = useState<'tip' | 'data' | 'key' | 'warning'>('tip')
  const [title, setTitle] = useState('Dato del Foro Económico Mundial')
  const [text, setText] = useState(
    'El pensamiento analítico y la alfabetización tecnológica se mantienen entre las habilidades centrales con mayor proyección de crecimiento hacia 2030.'
  )
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceLabel, setSourceLabel] = useState('Ver estudio oficial →')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) {
      alert('Por favor escribe el contenido de la nota.')
      return
    }

    onInsert({
      calloutType,
      title: title.trim(),
      text: text.trim(),
      sourceUrl: sourceUrl.trim(),
      sourceLabel: sourceLabel.trim(),
    })

    // Reset para la próxima
    setTitle('')
    setText('')
    setSourceUrl('')
    setSourceLabel('Ver fuente oficial →')
    onClose()
  }

  const styles = {
    tip: {
      border: 'border-l-4 border-l-amber-500 border-amber-500/20 bg-amber-500/5',
      titleColor: 'text-amber-900',
      icon: '💡',
    },
    data: {
      border: 'border-l-4 border-l-blue-500 border-blue-500/20 bg-blue-500/5',
      titleColor: 'text-blue-900',
      icon: '📊',
    },
    key: {
      border: 'border-l-4 border-l-emerald-500 border-emerald-500/20 bg-emerald-500/5',
      titleColor: 'text-emerald-900',
      icon: '🎯',
    },
    warning: {
      border: 'border-l-4 border-l-rose-500 border-rose-500/20 bg-rose-500/5',
      titleColor: 'text-rose-900',
      icon: '⚠️',
    },
  }

  const currentStyle = styles[calloutType]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-line rounded-2xl shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
          <h3 className="font-display font-bold text-base text-primary flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-warning" />
            Insertar Nota Destacada / Tip
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Selector de Tipo de Nota */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5 block">
              Tipo de Nota / Formato:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCalloutType('tip')
                  if (!title) setTitle('Tip Pro')
                }}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  calloutType === 'tip'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-900 font-bold shadow-2xs'
                    : 'bg-surface-muted border-line text-muted hover:text-primary'
                }`}
              >
                <span className="text-base block mb-0.5">💡</span>
                <span className="text-xs">Tip</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCalloutType('data')
                  if (!title) setTitle('Dato Clave')
                }}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  calloutType === 'data'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-900 font-bold shadow-2xs'
                    : 'bg-surface-muted border-line text-muted hover:text-primary'
                }`}
              >
                <span className="text-base block mb-0.5">📊</span>
                <span className="text-xs">Dato</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCalloutType('key')
                  if (!title) setTitle('Concepto Clave')
                }}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  calloutType === 'key'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 font-bold shadow-2xs'
                    : 'bg-surface-muted border-line text-muted hover:text-primary'
                }`}
              >
                <span className="text-base block mb-0.5">🎯</span>
                <span className="text-xs">Clave</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCalloutType('warning')
                  if (!title) setTitle('Importante')
                }}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  calloutType === 'warning'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-900 font-bold shadow-2xs'
                    : 'bg-surface-muted border-line text-muted hover:text-primary'
                }`}
              >
                <span className="text-base block mb-0.5">⚠️</span>
                <span className="text-xs">Alerta</span>
              </button>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1 block">
              Título o Etiqueta de la Nota:
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Dato del Foro Económico Mundial..."
              className="w-full bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-accent"
            />
          </div>

          {/* Texto de la nota */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1 block">
              Contenido de la Nota / Recomendación:
            </label>
            <textarea
              rows={3}
              required
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Escribe aquí el texto explicativo de tu nota..."
              className="w-full bg-surface-muted border border-line rounded-lg p-2.5 text-xs focus:outline-none focus:border-accent resize-none leading-relaxed"
            />
          </div>

          {/* Enlace de Fuente (Opcional) */}
          <div className="p-3 bg-surface-muted rounded-xl border border-line space-y-2">
            <span className="font-bold text-primary block text-[11px]">
              🔗 Enlace de Respaldo / Fuente (Opcional):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={sourceLabel}
                onChange={e => setSourceLabel(e.target.value)}
                placeholder="Texto del enlace (ej: Ver estudio oficial →)"
                className="w-full bg-white border border-line rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                placeholder="URL de la fuente (https://...)"
                className="w-full bg-white border border-line rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Vista Previa en Vivo */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1 block">
              Vista Previa en Vivo:
            </span>
            <div className={`p-4 rounded-xl border ${currentStyle.border} shadow-2xs`}>
              <div className="flex items-start gap-2.5">
                <span className="text-base shrink-0 leading-none mt-0.5">{currentStyle.icon}</span>
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-xs text-primary leading-relaxed m-0">
                    {title && (
                      <strong className={`font-bold mr-1.5 ${currentStyle.titleColor}`}>{title}:</strong>
                    )}
                    <span>{text || 'Texto de la nota...'}</span>
                  </p>
                  {sourceUrl && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent">
                      {sourceLabel || 'Ver fuente oficial'} <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-2 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-line rounded-lg text-xs font-bold text-muted hover:text-primary cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Insertar Nota
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
