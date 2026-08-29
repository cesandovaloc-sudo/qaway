import React, { useState, useRef, useEffect, useCallback } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Trash2,
  Sliders,
  Pencil,
} from 'lucide-react'

export default function CustomImageComponent(props: any) {
  const { node, updateAttributes, deleteNode, selected } = props
  const { src, alt, caption, align, width } = node.attrs

  const [currentWidth, setCurrentWidth] = useState<string>(width || '75%')
  const [showSlider, setShowSlider] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editAlt, setEditAlt] = useState(alt || '')
  const [editCaption, setEditCaption] = useState(caption || '')
  const [editSrc, setEditSrc] = useState(src || '')
  const [isResizing, setIsResizing] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    setCurrentWidth(width || (align === 'left' || align === 'right' ? '48%' : '75%'))
    setEditAlt(alt || '')
    setEditCaption(caption || '')
    setEditSrc(src || '')
  }, [width, align, alt, caption, src])

  const setAlignment = (newAlign: 'left' | 'center' | 'right' | 'full') => {
    updateAttributes({ align: newAlign })
  }

  const setManualWidth = (newWidthStr: string) => {
    setCurrentWidth(newWidthStr)
    updateAttributes({ width: newWidthStr })
  }

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault()
    updateAttributes({
      alt: editAlt.trim(),
      caption: editCaption.trim(),
      src: editSrc.trim() || src,
    })
    setIsEditing(false)
  }

  // Manejador de Arrastre Manual Ultra-Suave (Sin temblor ni flashes)
  const handleMouseDown = useCallback((e: React.MouseEvent, direction: 'left' | 'right') => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    startXRef.current = e.clientX

    if (wrapperRef.current) {
      startWidthRef.current = wrapperRef.current.offsetWidth
    }

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        const deltaX = direction === 'right'
          ? moveEvent.clientX - startXRef.current
          : startXRef.current - moveEvent.clientX

        const parent = wrapperRef.current?.parentElement
        const parentWidth = parent ? parent.offsetWidth : 800
        const newPixelWidth = Math.max(140, Math.min(parentWidth, startWidthRef.current + deltaX))
        const newPercent = Math.round((newPixelWidth / parentWidth) * 100)
        const percentStr = `${newPercent}%`

        if (wrapperRef.current) {
          wrapperRef.current.style.width = percentStr
        }
        setCurrentWidth(percentStr)
      })
    }

    const onMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''

      if (wrapperRef.current) {
        const parent = wrapperRef.current.parentElement
        const parentWidth = parent ? parent.offsetWidth : 800
        const finalPercent = Math.round((wrapperRef.current.offsetWidth / parentWidth) * 100)
        updateAttributes({ width: `${finalPercent}%` })
      }
    }

    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'ew-resize'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [updateAttributes])

  let alignClass = 'my-6 mx-auto block text-center clear-both'
  if (align === 'left') {
    alignClass = 'float-left mr-6 mb-4 block text-left'
  } else if (align === 'right') {
    alignClass = 'float-right ml-6 mb-4 block text-right'
  } else if (align === 'full') {
    alignClass = 'w-full my-8 block clear-both'
  }

  const numericWidth = parseInt(currentWidth.replace('%', '')) || 75

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      className={`custom-image-node-view relative group clear-both font-sans select-none ${alignClass}`}
      style={{
        width: align === 'full' ? '100%' : currentWidth,
        maxWidth: '100%',
        transition: isResizing ? 'none' : 'width 0.15s ease-out',
      }}
    >
      <div
        onDoubleClick={() => setIsEditing(true)}
        className={`relative inline-block w-full rounded-2xl cursor-pointer ${
          selected || isResizing ? 'ring-2 ring-accent ring-offset-2 shadow-lg' : ''
        }`}
      >
        {/* Barra Flotante de Herramientas de Imagen */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1 bg-[#18181b] text-white p-1 rounded-xl shadow-2xl border border-line/20 text-xs select-none">
          {/* Botón de Editar Atributos */}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              isEditing ? 'bg-accent text-white' : 'hover:bg-white/20 text-zinc-300'
            }`}
            title="Editar texto alternativo (Alt SEO), pie de foto y URL"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cerrar' : 'Editar Foto'}</span>
          </button>

          <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

          {/* Alineaciones */}
          <button
            type="button"
            onClick={() => setAlignment('left')}
            className={`p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer ${
              align === 'left' ? 'bg-accent text-white' : 'text-zinc-300'
            }`}
            title="Flotar a la izquierda"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setAlignment('center')}
            className={`p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer ${
              align === 'center' ? 'bg-accent text-white' : 'text-zinc-300'
            }`}
            title="Centrar imagen"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setAlignment('right')}
            className={`p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer ${
              align === 'right' ? 'bg-accent text-white' : 'text-zinc-300'
            }`}
            title="Flotar a la derecha"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setAlignment('full')}
            className={`p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer ${
              align === 'full' ? 'bg-accent text-white' : 'text-zinc-300'
            }`}
            title="Ancho completo (100%)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

          {/* Slider libre de tamaño */}
          <button
            type="button"
            onClick={() => setShowSlider(!showSlider)}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
              showSlider ? 'bg-accent text-white' : 'hover:bg-white/20 text-zinc-300'
            }`}
            title="Ajustar ancho manual con slider"
          >
            <Sliders className="w-3 h-3" />
            <span>{numericWidth}%</span>
          </button>

          <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

          {/* Eliminar */}
          <button
            type="button"
            onClick={deleteNode}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-danger hover:bg-white/20 transition-colors cursor-pointer"
            title="Eliminar imagen"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal / Formulario de Edición Rápida */}
        {isEditing && (
          <form
            onSubmit={handleSaveDetails}
            onClick={e => e.stopPropagation()}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-50 p-4 bg-white text-primary rounded-2xl shadow-2xl border-2 border-accent w-[92%] max-w-md space-y-3 text-xs text-left animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between border-b border-line pb-2 font-bold text-primary">
              <span className="flex items-center gap-1.5">
                <Pencil className="w-4 h-4 text-accent" />
                <span>Editar Detalles de la Imagen</span>
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-muted hover:text-primary cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-bold text-muted block mb-1">Texto Alternativo (Alt SEO):</label>
              <input
                type="text"
                value={editAlt}
                onChange={e => setEditAlt(e.target.value)}
                placeholder="Describe qué muestra la imagen para Google..."
                className="w-full bg-surface-muted border border-line rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="font-bold text-muted block mb-1">Pie de Foto (Caption visible):</label>
              <input
                type="text"
                value={editCaption}
                onChange={e => setEditCaption(e.target.value)}
                placeholder="Texto explicativo debajo de la foto..."
                className="w-full bg-surface-muted border border-line rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="font-bold text-muted block mb-1">URL de la Imagen:</label>
              <input
                type="text"
                value={editSrc}
                onChange={e => setEditSrc(e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface-muted border border-line rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-accent"
              />
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
        )}

        {/* Popover de Slider Libre */}
        {showSlider && (
          <div
            onClick={e => e.stopPropagation()}
            className="absolute -top-20 left-1/2 -translate-x-1/2 z-50 p-2.5 bg-white text-primary rounded-xl shadow-2xl border border-line flex items-center gap-3 w-56 animate-in fade-in duration-150"
          >
            <input
              type="range"
              min="20"
              max="100"
              value={numericWidth}
              onChange={e => setManualWidth(`${e.target.value}%`)}
              className="flex-1 accent-accent cursor-pointer"
            />
            <span className="text-xs font-bold font-mono w-10 text-right">{numericWidth}%</span>
          </div>
        )}

        {/* Imagen protegida contra drag nativo para evitar flashes */}
        <img
          src={src}
          alt={alt || 'Imagen'}
          draggable={false}
          className="w-full h-auto rounded-2xl border border-line shadow-xs object-contain block pointer-events-none select-none"
        />

        {caption && (
          <figcaption className="text-xs text-center text-muted italic mt-1.5 leading-snug">
            {caption}
          </figcaption>
        )}

        {/* Manejadores de Arrastre Manual en las Esquinas (Handles) */}
        <div
          onMouseDown={e => handleMouseDown(e, 'left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-accent border-2 border-white rounded-full shadow-md cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-30 hover:scale-125"
          title="Arrastra con el mouse para cambiar el tamaño"
        />
        <div
          onMouseDown={e => handleMouseDown(e, 'right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-accent border-2 border-white rounded-full shadow-md cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-30 hover:scale-125"
          title="Arrastra con el mouse para cambiar el tamaño"
        />
      </div>
    </NodeViewWrapper>
  )
}
