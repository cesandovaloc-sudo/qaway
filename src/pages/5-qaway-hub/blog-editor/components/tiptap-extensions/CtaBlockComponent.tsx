import React, { useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Pencil, Trash2, Palette } from 'lucide-react'

export default function CtaBlockComponent(props: any) {
  const { node, updateAttributes, deleteNode } = props
  const {
    type,
    title,
    description,
    buttonText,
    buttonUrl,
    cardBgColor,
    cardTextColor,
    buttonBgColor,
    buttonTextColor,
    passiveText,
  } = node.attrs

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title || '')
  const [editDesc, setEditDesc] = useState(description || '')
  const [editText, setEditText] = useState(buttonText || 'Ver Más')
  const [editUrl, setEditUrl] = useState(buttonUrl || '#')
  const [editCardBg, setEditCardBg] = useState(cardBgColor || '#18181b')
  const [editCardText, setEditCardText] = useState(cardTextColor || '#ffffff')
  const [editButtonBg, setEditButtonBg] = useState(buttonBgColor || '#ff4b0b')
  const [editButtonText, setEditButtonText] = useState(buttonTextColor || '#ffffff')
  const [editPassiveText, setEditPassiveText] = useState(passiveText || '')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateAttributes({
      title: editTitle,
      description: editDesc,
      buttonText: editText,
      buttonUrl: editUrl,
      cardBgColor: editCardBg,
      cardTextColor: editCardText,
      buttonBgColor: editButtonBg,
      buttonTextColor: editButtonText,
      passiveText: editPassiveText,
    })
    setIsEditing(false)
  }

  const currentCardBg = cardBgColor || '#18181b'
  const currentCardText = cardTextColor || '#ffffff'
  const currentButtonBg = buttonBgColor || '#ff4b0b'
  const currentButtonText = buttonTextColor || '#ffffff'
  const isLightCard = currentCardBg.toLowerCase() === '#ffffff' || currentCardBg.toLowerCase() === '#fafafc'

  return (
    <NodeViewWrapper className="cta-block-node-view relative group my-6 font-sans clear-both">
      {/* Barra flotante de Acciones en Hover / Selección */}
      <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 backdrop-blur-xs border border-line rounded-lg shadow-md px-2 py-1 text-xs">
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="p-1 text-primary hover:text-accent font-bold flex items-center gap-1 cursor-pointer transition-colors"
          title="Editar texto, colores y enlace del CTA"
        >
          <Pencil className="w-3.5 h-3.5 text-accent" />
          <span className="text-[11px] font-bold">{isEditing ? 'Cerrar' : 'Editar CTA & Colores'}</span>
        </button>
        <div className="w-[1px] h-3.5 bg-line mx-1" />
        <button
          type="button"
          onClick={deleteNode}
          className="p-1 text-muted hover:text-danger cursor-pointer transition-colors"
          title="Eliminar este CTA"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modo Edición Rápida Inline */}
      {isEditing ? (
        <form
          onSubmit={handleSave}
          className="p-5 sm:p-6 bg-white border-2 border-accent rounded-2xl shadow-xl space-y-4 animate-in fade-in duration-150 text-xs"
        >
          <div className="flex items-center justify-between border-b border-line pb-3 font-bold text-primary">
            <span className="flex items-center gap-2 text-sm">
              <Pencil className="w-4 h-4 text-accent" />
              <span>Personalizar CTA ({type === 'passive' ? 'CTA Pasivo' : type === 'button' ? 'Botón' : 'Tarjeta Destacada'})</span>
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 text-muted hover:text-primary cursor-pointer text-sm"
            >
              ✕
            </button>
          </div>

          {type === 'passive' ? (
            <div>
              <label className="font-bold text-muted block mb-1">Texto del Recurso:</label>
              <input
                type="text"
                value={editPassiveText}
                onChange={e => setEditPassiveText(e.target.value)}
                className="w-full bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-accent"
              />
            </div>
          ) : (
            <>
              {type === 'card' && (
                <>
                  <div>
                    <label className="font-bold text-muted block mb-1">Título del CTA:</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs font-bold text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-muted block mb-1">Descripción / Subtítulo:</label>
                    <textarea
                      rows={2}
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      className="w-full bg-surface-muted border border-line rounded-lg p-2.5 text-xs text-muted leading-relaxed focus:outline-none focus:border-accent resize-none"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-muted block mb-1">Texto del Botón / Acción:</label>
              <input
                type="text"
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="w-full bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="font-bold text-muted block mb-1">Enlace de Destino (URL o WhatsApp):</label>
              <input
                type="text"
                value={editUrl}
                onChange={e => setEditUrl(e.target.value)}
                className="w-full bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* SELECTORES DE COLOR 100% PERSONALIZABLES */}
          <div className="p-3.5 bg-surface-subtle border border-line rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-primary text-xs">
              <Palette className="w-3.5 h-3.5 text-accent" />
              <span>Personalización de Colores:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {type === 'card' && (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-muted block mb-1">Fondo de Tarjeta:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editCardBg}
                        onChange={e => setEditCardBg(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={editCardBg}
                        onChange={e => setEditCardBg(e.target.value)}
                        className="w-20 bg-white border border-line rounded px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted block mb-1">Texto de Tarjeta:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editCardText}
                        onChange={e => setEditCardText(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={editCardText}
                        onChange={e => setEditCardText(e.target.value)}
                        className="w-20 bg-white border border-line rounded px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-bold text-muted block mb-1">
                  {type === 'passive' ? 'Color de Enlace:' : 'Fondo del Botón:'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editButtonBg}
                    onChange={e => setEditButtonBg(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={editButtonBg}
                    onChange={e => setEditButtonBg(e.target.value)}
                    className="w-20 bg-white border border-line rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>

              {type !== 'passive' && (
                <div>
                  <label className="text-[11px] font-bold text-muted block mb-1">Texto del Botón:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editButtonText}
                      onChange={e => setEditButtonText(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={editButtonText}
                      onChange={e => setEditButtonText(e.target.value)}
                      className="w-20 bg-white border border-line rounded px-2 py-1 text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-line">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-1.5 border border-line rounded-lg text-muted hover:text-primary font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-accent hover:bg-accent-dark text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      ) : (
        /* Renderizado Visual del CTA */
        <div onDoubleClick={() => setIsEditing(true)}>
          {type === 'passive' ? (
            <div className="my-4 text-left not-prose">
              <a
                href={buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.preventDefault()}
                className="font-bold text-sm sm:text-base hover:underline inline-block cursor-pointer"
                style={{ color: currentButtonBg }}
              >
                &lt;&lt; {passiveText || title} [{buttonText || 'Descargar'}] &gt;&gt;
              </a>
            </div>
          ) : type === 'button' ? (
            <div className="my-6 text-center sm:text-left not-prose">
              <span
                className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md cursor-pointer select-none"
                style={{
                  backgroundColor: currentButtonBg,
                  color: currentButtonText,
                }}
              >
                <span>{buttonText}</span>
                <span>→</span>
              </span>
            </div>
          ) : (
            <div
              className={`not-prose my-6 p-6 sm:p-8 rounded-2xl ${
                isLightCard ? 'border border-line shadow-md' : 'border border-line/20 shadow-xl'
              } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 cursor-pointer`}
              style={{
                backgroundColor: currentCardBg,
                color: currentCardText,
              }}
            >
              <div className="space-y-1.5 max-w-xl">
                <h3
                  className="font-display font-bold text-lg sm:text-xl tracking-tight m-0"
                  style={{ color: currentCardText }}
                >
                  {title}
                </h3>
                {description && (
                  <p
                    className="text-xs sm:text-sm leading-relaxed m-0 opacity-90"
                    style={{ color: currentCardText }}
                  >
                    {description}
                  </p>
                )}
              </div>
              <span
                className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shrink-0 cursor-pointer select-none"
                style={{
                  backgroundColor: currentButtonBg,
                  color: currentButtonText,
                }}
              >
                <span>{buttonText}</span>
                <span>→</span>
              </span>
            </div>
          )}
        </div>
      )}
    </NodeViewWrapper>
  )
}
