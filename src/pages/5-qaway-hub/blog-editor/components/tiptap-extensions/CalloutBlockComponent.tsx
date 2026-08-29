import React, { useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'

export default function CalloutBlockComponent(props: any) {
  const { node, updateAttributes, deleteNode } = props
  const {
    calloutType,
    title,
    text,
    sourceUrl,
    sourceLabel,
  } = node.attrs

  const [isEditing, setIsEditing] = useState(false)
  const [editType, setEditType] = useState<'tip' | 'data' | 'key' | 'warning'>(calloutType || 'tip')
  const [editTitle, setEditTitle] = useState(title || '')
  const [editText, setEditText] = useState(text || '')
  const [editSourceUrl, setEditSourceUrl] = useState(sourceUrl || '')
  const [editSourceLabel, setEditSourceLabel] = useState(sourceLabel || '')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateAttributes({
      calloutType: editType,
      title: editTitle,
      text: editText,
      sourceUrl: editSourceUrl,
      sourceLabel: editSourceLabel,
    })
    setIsEditing(false)
  }

  // Estilos según el tipo de nota
  const styles = {
    tip: {
      bg: 'bg-amber-500/5',
      border: 'border-l-4 border-l-amber-500 border-amber-500/20',
      titleColor: 'text-amber-900',
      icon: '💡',
      badge: 'Tip Pro',
    },
    data: {
      bg: 'bg-blue-500/5',
      border: 'border-l-4 border-l-blue-500 border-blue-500/20',
      titleColor: 'text-blue-900',
      icon: '📊',
      badge: 'Dato Clave',
    },
    key: {
      bg: 'bg-emerald-500/5',
      border: 'border-l-4 border-l-emerald-500 border-emerald-500/20',
      titleColor: 'text-emerald-900',
      icon: '🎯',
      badge: 'Clave',
    },
    warning: {
      bg: 'bg-rose-500/5',
      border: 'border-l-4 border-l-rose-500 border-rose-500/20',
      titleColor: 'text-rose-900',
      icon: '⚠️',
      badge: 'Importante',
    },
  }

  const currentStyle = styles[calloutType as keyof typeof styles] || styles.tip

  return (
    <NodeViewWrapper className="callout-block-node-view relative group my-4 font-sans clear-both">
      {/* Barra Flotante de Acciones */}
      <div className="absolute -top-3.5 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-line rounded-lg shadow-md px-1.5 py-0.5 text-xs">
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="p-1 text-muted hover:text-accent font-bold flex items-center gap-1 cursor-pointer transition-colors"
          title="Editar nota"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold">{isEditing ? 'Cerrar' : 'Editar Nota'}</span>
        </button>
        <div className="w-[1px] h-3 bg-line mx-0.5" />
        <button
          type="button"
          onClick={deleteNode}
          className="p-1 text-muted hover:text-danger cursor-pointer transition-colors"
          title="Eliminar esta nota"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSave}
          className="p-4 bg-white border-2 border-accent rounded-2xl shadow-xl space-y-3 text-xs animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-line pb-2 font-bold text-primary">
            <span>✏️ Modificar Nota Destacada</span>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-muted hover:text-primary cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Selector de Tipo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => setEditType('tip')}
              className={`p-1.5 rounded-lg border font-bold text-left flex items-center gap-1 cursor-pointer transition-all ${
                editType === 'tip' ? 'bg-amber-500/10 border-amber-500 text-amber-900' : 'border-line text-muted'
              }`}
            >
              <span>💡</span>
              <span className="truncate">Tip</span>
            </button>
            <button
              type="button"
              onClick={() => setEditType('data')}
              className={`p-1.5 rounded-lg border font-bold text-left flex items-center gap-1 cursor-pointer transition-all ${
                editType === 'data' ? 'bg-blue-500/10 border-blue-500 text-blue-900' : 'border-line text-muted'
              }`}
            >
              <span>📊</span>
              <span className="truncate">Dato</span>
            </button>
            <button
              type="button"
              onClick={() => setEditType('key')}
              className={`p-1.5 rounded-lg border font-bold text-left flex items-center gap-1 cursor-pointer transition-all ${
                editType === 'key' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900' : 'border-line text-muted'
              }`}
            >
              <span>🎯</span>
              <span className="truncate">Clave</span>
            </button>
            <button
              type="button"
              onClick={() => setEditType('warning')}
              className={`p-1.5 rounded-lg border font-bold text-left flex items-center gap-1 cursor-pointer transition-all ${
                editType === 'warning' ? 'bg-rose-500/10 border-rose-500 text-rose-900' : 'border-line text-muted'
              }`}
            >
              <span>⚠️</span>
              <span className="truncate">Alerta</span>
            </button>
          </div>

          <div>
            <label className="font-bold text-muted block mb-1">Título / Etiqueta:</label>
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder="Ej: Dato del Foro Económico Mundial..."
              className="w-full bg-surface-muted border border-line rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="font-bold text-muted block mb-1">Contenido de la Nota:</label>
            <textarea
              rows={3}
              value={editText}
              onChange={e => setEditText(e.target.value)}
              placeholder="Escribe el texto de la recomendación o estadística..."
              className="w-full bg-surface-muted border border-line rounded-lg p-2 text-xs focus:outline-none focus:border-accent resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-muted block mb-1">Texto del Enlace (Opcional):</label>
              <input
                type="text"
                value={editSourceLabel}
                onChange={e => setEditSourceLabel(e.target.value)}
                placeholder="Ej: Ver estudio oficial →"
                className="w-full bg-surface-muted border border-line rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="font-bold text-muted block mb-1">URL de la Fuente:</label>
              <input
                type="text"
                value={editSourceUrl}
                onChange={e => setEditSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface-muted border border-line rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-line">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 border border-line rounded-lg font-bold text-muted hover:text-primary cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-accent hover:bg-accent-dark text-white font-bold rounded-lg shadow-xs cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      ) : (
        /* Renderizado Visual de la Nota */
        <div
          onDoubleClick={() => setIsEditing(true)}
          className={`p-4 sm:p-4.5 rounded-xl border ${currentStyle.border} ${currentStyle.bg} shadow-2xs transition-all cursor-pointer`}
        >
          <div className="flex items-start gap-2.5">
            <span className="text-base sm:text-lg shrink-0 select-none leading-none mt-0.5">
              {currentStyle.icon}
            </span>
            <div className="space-y-1 flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-primary leading-relaxed m-0 font-sans">
                {title && (
                  <strong className={`font-bold mr-1.5 ${currentStyle.titleColor}`}>
                    {title}:
                  </strong>
                )}
                <span>{text}</span>
              </p>

              {sourceUrl && (
                <div className="pt-2">
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1 rounded-md bg-white border border-accent/30 text-accent hover:bg-accent hover:text-white transition-all shadow-2xs no-underline cursor-pointer"
                  >
                    <span>{sourceLabel || 'Ver fuente oficial →'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  )
}
