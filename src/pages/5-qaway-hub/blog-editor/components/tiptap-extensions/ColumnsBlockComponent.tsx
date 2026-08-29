import React, { useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Pencil, Trash2 } from 'lucide-react'

export default function ColumnsBlockComponent(props: any) {
  const { node, updateAttributes, deleteNode } = props
  const {
    layoutType,
    col1Title,
    col1Text,
    col2Type,
    col2Title,
    col2Text,
    col2ImageUrl,
    col2ImageAlt,
    col2ImageCaption,
  } = node.attrs

  const [isEditing, setIsEditing] = useState(false)
  const [editCol1Title, setEditCol1Title] = useState(col1Title || '')
  const [editCol1Text, setEditCol1Text] = useState(col1Text || '')
  const [editCol2Type, setEditCol2Type] = useState<'text' | 'image'>(col2Type || 'text')
  const [editCol2Title, setEditCol2Title] = useState(col2Title || '')
  const [editCol2Text, setEditCol2Text] = useState(col2Text || '')
  const [editCol2ImageUrl, setEditCol2ImageUrl] = useState(col2ImageUrl || '')
  const [editCol2ImageAlt, setEditCol2ImageAlt] = useState(col2ImageAlt || '')
  const [editCol2ImageCaption, setEditCol2ImageCaption] = useState(col2ImageCaption || '')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateAttributes({
      col1Title: editCol1Title,
      col1Text: editCol1Text,
      col2Type: editCol2Type,
      col2Title: editCol2Title,
      col2Text: editCol2Text,
      col2ImageUrl: editCol2ImageUrl,
      col2ImageAlt: editCol2ImageAlt,
      col2ImageCaption: editCol2ImageCaption,
    })
    setIsEditing(false)
  }

  let col1Classes = 'space-y-3'
  let col2Classes = 'space-y-3'

  if (layoutType === 'cards') {
    col1Classes = 'p-6 rounded-2xl bg-surface-muted border border-line shadow-xs space-y-3'
    col2Classes = 'p-6 rounded-2xl bg-surface-muted border border-line shadow-xs space-y-3'
  } else if (layoutType === 'highlight') {
    col1Classes = 'p-6 rounded-2xl bg-[#18181b] text-white border border-line/20 shadow-md space-y-3'
    col2Classes = 'p-6 rounded-2xl bg-surface-muted border border-line shadow-xs space-y-3'
  }

  // Dividir por cualquier salto de línea (Enter) para garantizar párrafos separados
  const col1Paragraphs = (col1Text || '')
    .split(/\n+/)
    .map((s: string) => s.trim())
    .filter(Boolean)

  const col2Paragraphs = (col2Text || '')
    .split(/\n+/)
    .map((s: string) => s.trim())
    .filter(Boolean)

  return (
    <NodeViewWrapper className="columns-block-node-view relative group mt-4 mb-2 font-sans clear-both">
      {/* Barra Flotante de Acciones en Hover */}
      <div className="absolute -top-3.5 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-line rounded-lg shadow-md px-1.5 py-0.5 text-xs">
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="p-1 text-muted hover:text-accent font-bold flex items-center gap-1 cursor-pointer transition-colors"
          title="Editar contenido de las 2 columnas"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold">{isEditing ? 'Cerrar' : 'Editar 2 Columnas'}</span>
        </button>
        <div className="w-[1px] h-3 bg-line mx-0.5" />
        <button
          type="button"
          onClick={deleteNode}
          className="p-1 text-muted hover:text-danger cursor-pointer transition-colors"
          title="Eliminar este bloque"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSave}
          className="p-5 bg-white border-2 border-accent rounded-2xl shadow-xl space-y-3.5 text-xs animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-line pb-2 font-bold text-primary">
            <span>✏️ Modificar Bloque en 2 Columnas</span>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-muted hover:text-primary cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Columna 1 */}
            <div className="p-3 bg-surface-muted rounded-xl space-y-2">
              <span className="font-bold text-primary block">Columna 1 (Izquierda)</span>
              <input
                type="text"
                value={editCol1Title}
                onChange={e => setEditCol1Title(e.target.value)}
                placeholder="Título..."
                className="w-full bg-white border border-line rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-accent"
              />
              <textarea
                rows={5}
                value={editCol1Text}
                onChange={e => setEditCol1Text(e.target.value)}
                placeholder="Escribe aquí tu texto. Puedes usar Enter para crear varios párrafos..."
                className="w-full bg-white border border-line rounded-lg p-2 text-xs focus:outline-none focus:border-accent resize-none leading-relaxed"
              />
            </div>

            {/* Columna 2 */}
            <div className="p-3 bg-surface-muted rounded-xl space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-primary">Columna 2 (Derecha)</span>
                <div className="flex rounded-md bg-white p-0.5 border border-line text-[11px]">
                  <button
                    type="button"
                    onClick={() => setEditCol2Type('text')}
                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      editCol2Type === 'text' ? 'bg-accent text-white' : 'text-muted'
                    }`}
                  >
                    Texto
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditCol2Type('image')}
                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      editCol2Type === 'image' ? 'bg-accent text-white' : 'text-muted'
                    }`}
                  >
                    Foto
                  </button>
                </div>
              </div>

              {editCol2Type === 'text' ? (
                <>
                  <input
                    type="text"
                    value={editCol2Title}
                    onChange={e => setEditCol2Title(e.target.value)}
                    placeholder="Título..."
                    className="w-full bg-white border border-line rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-accent"
                  />
                  <textarea
                    rows={5}
                    value={editCol2Text}
                    onChange={e => setEditCol2Text(e.target.value)}
                    placeholder="Escribe aquí tu texto..."
                    className="w-full bg-white border border-line rounded-lg p-2 text-xs focus:outline-none focus:border-accent resize-none leading-relaxed"
                  />
                </>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editCol2ImageUrl}
                    onChange={e => setEditCol2ImageUrl(e.target.value)}
                    placeholder="URL de la imagen..."
                    className="w-full bg-white border border-line rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-accent"
                  />
                  <input
                    type="text"
                    value={editCol2ImageCaption}
                    onChange={e => setEditCol2ImageCaption(e.target.value)}
                    placeholder="Pie de foto (caption)..."
                    className="w-full bg-white border border-line rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent"
                  />
                  <input
                    type="text"
                    value={editCol2ImageAlt}
                    onChange={e => setEditCol2ImageAlt(e.target.value)}
                    placeholder="Texto alternativo (alt SEO)..."
                    className="w-full bg-white border border-line rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent"
                  />
                  {editCol2ImageUrl && (
                    <img
                      src={editCol2ImageUrl}
                      alt="Preview"
                      className="max-h-24 mx-auto rounded-lg object-contain border border-line"
                    />
                  )}
                </div>
              )}
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
        /* Renderizado Visual de las 2 Columnas */
        <div
          onDoubleClick={() => setIsEditing(true)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start cursor-pointer"
        >
          <div className={col1Classes}>
            {col1Title && (
              <h3
                className={`font-display font-bold text-xl sm:text-2xl tracking-tight leading-tight m-0 ${
                  layoutType === 'highlight' ? 'text-white' : 'text-primary'
                }`}
              >
                {col1Title}
              </h3>
            )}
            {col1Paragraphs.length > 0 ? (
              col1Paragraphs.map((p: string, idx: number) => (
                <p
                  key={idx}
                  className={`text-sm sm:text-base leading-relaxed m-0 ${
                    layoutType === 'highlight' ? 'text-zinc-300' : 'text-primary'
                  }`}
                >
                  {p}
                </p>
              ))
            ) : (
              <p
                className={`text-sm sm:text-base leading-relaxed m-0 ${
                  layoutType === 'highlight' ? 'text-zinc-300' : 'text-primary'
                }`}
              >
                {col1Text}
              </p>
            )}
          </div>

          <div className={col2Classes}>
            {col2Type === 'image' && col2ImageUrl ? (
              <figure className="m-0 clear-both block text-center">
                <img
                  src={col2ImageUrl}
                  alt={col2ImageAlt || col1Title || 'Imagen complementaria'}
                  className="w-full h-auto rounded-2xl border border-line shadow-xs object-contain block"
                />
                {col2ImageCaption && (
                  <figcaption className="text-xs text-center text-muted italic mt-1.5 leading-snug">
                    {col2ImageCaption}
                  </figcaption>
                )}
              </figure>
            ) : (
              <>
                {col2Title && (
                  <h3 className="font-display font-bold text-xl sm:text-2xl tracking-tight leading-tight m-0 text-primary">
                    {col2Title}
                  </h3>
                )}
                {col2Paragraphs.length > 0 ? (
                  col2Paragraphs.map((p: string, idx: number) => (
                    <p key={idx} className="text-sm sm:text-base leading-relaxed m-0 text-primary">
                      {p}
                    </p>
                  ))
                ) : (
                  <p className="text-sm sm:text-base leading-relaxed m-0 text-primary">{col2Text}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </NodeViewWrapper>
  )
}
