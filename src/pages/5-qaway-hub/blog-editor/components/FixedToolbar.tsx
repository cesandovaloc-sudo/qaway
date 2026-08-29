import React, { useState, useRef, useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Minus,
  Image as ImageIcon,
  Link as LinkIcon,
  Video,
  Sparkles,
  Bookmark,
  Columns2,
  HelpCircle,
  ListTree,
  Lightbulb,
  BookOpen,
  Palette,
  ChevronDown,
  Workflow,
  Mail,
} from 'lucide-react'

interface FixedToolbarProps {
  editor: Editor | null
  onOpenImageModal: () => void
  onOpenVideoModal: () => void
  onOpenCtaModal: () => void
  onOpenBookmarkModal: () => void
  onOpenComparisonModal: () => void
  onOpenColumnsModal?: () => void
  onOpenInfographicModal?: () => void
  onOpenLeadFormModal?: () => void
  onOpenFaqModal: () => void
  onOpenHubSpotTemplates?: () => void
  onGenerateToc: () => void
  onInsertCallout: () => void
}

const PRESET_COLORS = [
  { name: 'Naranja', hex: '#ff4b0b' },
  { name: 'Azul', hex: '#2563eb' },
  { name: 'Esmeralda', hex: '#10b981' },
  { name: 'Púrpura', hex: '#8b5cf6' },
  { name: 'Ámbar', hex: '#d97706' },
  { name: 'Rojo', hex: '#dc2626' },
  { name: 'Carbón', hex: '#3f3f46' },
]

export default function FixedToolbar({
  editor,
  onOpenImageModal,
  onOpenVideoModal,
  onOpenCtaModal,
  onOpenBookmarkModal,
  onOpenComparisonModal,
  onOpenColumnsModal,
  onOpenInfographicModal,
  onOpenLeadFormModal,
  onOpenFaqModal,
  onOpenHubSpotTemplates,
  onGenerateToc,
  onInsertCallout,
}: FixedToolbarProps) {
  const [showColorMenu, setShowColorMenu] = useState(false)
  const [showListMenu, setShowListMenu] = useState(false)
  const [showQuoteMenu, setShowQuoteMenu] = useState(false)
  const [showDividerMenu, setShowDividerMenu] = useState(false)

  const [selectedListColor, setSelectedListColor] = useState('#ff4b0b')
  const [selectedQuoteColor, setSelectedQuoteColor] = useState('#ff4b0b')
  const [selectedDividerColor, setSelectedDividerColor] = useState('#ff4b0b')

  const colorMenuRef = useRef<HTMLDivElement>(null)
  const listMenuRef = useRef<HTMLDivElement>(null)
  const quoteMenuRef = useRef<HTMLDivElement>(null)
  const dividerMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (colorMenuRef.current && !colorMenuRef.current.contains(target)) {
        setShowColorMenu(false)
      }
      if (listMenuRef.current && !listMenuRef.current.contains(target)) {
        setShowListMenu(false)
      }
      if (quoteMenuRef.current && !quoteMenuRef.current.contains(target)) {
        setShowQuoteMenu(false)
      }
      if (dividerMenuRef.current && !dividerMenuRef.current.contains(target)) {
        setShowDividerMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!editor) return null

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL del enlace:', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const btnClass = (isActive: boolean) =>
    `w-8 h-8 rounded-md text-xs transition-all flex items-center justify-center cursor-pointer select-none ${
      isActive
        ? 'bg-primary text-white font-bold shadow-xs'
        : 'text-muted hover:text-primary hover:bg-black/5'
    }`

  // Aplicar estilo o color a listas de forma 100% nativa
  const applyListStyle = (styleType: 'disc' | 'check' | 'arrow') => {
    if (!editor.isActive('bulletList')) {
      editor.chain().focus().toggleBulletList().updateAttributes('bulletList', { listStyle: styleType, listColor: selectedListColor }).run()
    } else {
      editor.chain().focus().updateAttributes('bulletList', { listStyle: styleType }).run()
    }
    setShowListMenu(false)
  }

  const applyListColor = (color: string) => {
    setSelectedListColor(color)
    if (!editor.isActive('bulletList') && !editor.isActive('orderedList')) {
      editor.chain().focus().toggleBulletList().updateAttributes('bulletList', { listColor: color }).run()
    } else if (editor.isActive('bulletList')) {
      editor.chain().focus().updateAttributes('bulletList', { listColor: color }).run()
    } else if (editor.isActive('orderedList')) {
      editor.chain().focus().updateAttributes('orderedList', { listColor: color }).run()
    }
  }

  // Aplicar color a citas
  const applyQuoteColor = (color: string) => {
    setSelectedQuoteColor(color)
    if (!editor.isActive('blockquote')) {
      editor.chain().focus().toggleBlockquote().updateAttributes('blockquote', { borderColor: color }).run()
    } else {
      editor.chain().focus().updateAttributes('blockquote', { borderColor: color }).run()
    }
  }

  // Inserción de Separadores Limpios
  const insertStyledDivider = (type: 'classic' | 'custom-line' | 'gradient' | 'dots') => {
    setShowDividerMenu(false)
    if (type === 'classic') {
      editor.chain().focus().setHorizontalRule().run()
      return
    }

    let html = ''
    if (type === 'custom-line') {
      html = `<div style="border-top: 2px solid ${selectedDividerColor}; margin: 2rem 0; width: 100%; clear: both;"></div>`
    } else if (type === 'gradient') {
      html = `<div style="height: 2px; width: 100%; background: linear-gradient(to right, transparent, ${selectedDividerColor}, transparent); margin: 2rem 0; clear: both;"></div>`
    } else if (type === 'dots') {
      html = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin: 2rem 0; user-select: none; clear: both;">
          <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: ${selectedDividerColor}; opacity: 0.6;"></span>
          <span style="width: 10px; height: 10px; border-radius: 9999px; background-color: ${selectedDividerColor};"></span>
          <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: ${selectedDividerColor}; opacity: 0.6;"></span>
        </div>
      `
    }

    if (html) {
      editor.chain().focus().insertContent(html).run()
    }
  }

  return (
    <div className="bg-[#fafafc] border-b border-line px-3.5 py-2 min-h-[46px] flex flex-wrap items-center gap-1.5 shrink-0 z-10 font-sans">
      {/* 1. Selector de Bloques: Párrafo, H1, H2, H3 */}
      <div className="flex items-center gap-1 border-r border-line pr-2 mr-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={btnClass(editor.isActive('paragraph'))}
          title="Párrafo normal"
        >
          <Pilcrow className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={btnClass(editor.isActive('heading', { level: 1 }))}
          title="Encabezado H1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={btnClass(editor.isActive('heading', { level: 2 }))}
          title="Encabezado H2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btnClass(editor.isActive('heading', { level: 3 }))}
          title="Encabezado H3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Formato Inline: Negrita, Cursiva, Color */}
      <div className="flex items-center gap-1 border-r border-line pr-2 mr-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive('bold'))}
          title="Negrita (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive('italic'))}
          title="Cursiva (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={btnClass(editor.isActive('strike'))}
          title="Tachado"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={btnClass(editor.isActive('code'))}
          title="Código inline"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={setLink}
          className={btnClass(editor.isActive('link'))}
          title="Insertar enlace"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {/* Selector de Color de Texto y Resaltador */}
        <div className="relative" ref={colorMenuRef}>
          <button
            type="button"
            onClick={() => setShowColorMenu(!showColorMenu)}
            className={btnClass(Boolean(editor.getAttributes('textStyle').color || editor.isActive('highlight')))}
            title="Color de Texto y Resaltador"
          >
            <Palette className="w-4 h-4 text-accent" />
          </button>

          {showColorMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 p-3 bg-white rounded-2xl shadow-2xl border border-line space-y-3 w-60 text-xs font-sans animate-in fade-in duration-150">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Color de Texto:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-light">Selector libre:</span>
                    <input
                      type="color"
                      onChange={e => editor.chain().focus().setColor(e.target.value).run()}
                      className="w-6 h-6 rounded-md border border-line cursor-pointer p-0"
                      title="Abrir selector de color libre"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().setColor(c.hex).run()
                        setShowColorMenu(false)
                      }}
                      style={{ backgroundColor: c.hex }}
                      className="w-5 h-5 rounded-full border border-black/10 hover:scale-115 transition-transform cursor-pointer shadow-2xs"
                      title={`${c.name} (${c.hex})`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().unsetColor().run()
                      setShowColorMenu(false)
                    }}
                    className="px-1.5 py-0.5 rounded text-[10px] bg-surface-muted text-muted hover:text-primary border border-line cursor-pointer"
                    title="Restablecer color por defecto"
                  >
                    Restablecer
                  </button>
                </div>
              </div>

              <div className="pt-2.5 border-t border-line">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5 block">
                  Resaltador de Fondo:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()
                      setShowColorMenu(false)
                    }}
                    className="px-2 py-1 rounded bg-[#fef08a] text-zinc-800 text-[11px] font-bold hover:scale-105 transition-transform cursor-pointer border border-yellow-300 shadow-2xs"
                  >
                    Amarillo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().toggleHighlight({ color: '#ffedd5' }).run()
                      setShowColorMenu(false)
                    }}
                    className="px-2 py-1 rounded bg-[#ffedd5] text-amber-900 text-[11px] font-bold hover:scale-105 transition-transform cursor-pointer border border-orange-200 shadow-2xs"
                  >
                    Naranja
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().toggleHighlight({ color: '#dcfce7' }).run()
                      setShowColorMenu(false)
                    }}
                    className="px-2 py-1 rounded bg-[#dcfce7] text-emerald-900 text-[11px] font-bold hover:scale-105 transition-transform cursor-pointer border border-emerald-200 shadow-2xs"
                  >
                    Verde
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().unsetHighlight().run()
                      setShowColorMenu(false)
                    }}
                    className="px-2 py-1 rounded bg-surface-muted text-muted text-[11px] font-semibold hover:text-primary transition-colors cursor-pointer border border-line"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Estructuras & Accesorios: Listas, Citas, Separadores, Callouts */}
      <div className="flex items-center gap-1 border-r border-line pr-2 mr-1">
        {/* Selector de Listas & Viñetas Personalizables */}
        <div className="relative" ref={listMenuRef}>
          <div className="flex items-center bg-surface-muted rounded-lg border border-line p-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={btnClass(editor.isActive('bulletList'))}
              title="Lista básica con viñetas"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowListMenu(!showListMenu)}
              className="px-1 py-1 text-muted hover:text-primary cursor-pointer"
              title="Personalizar forma y color de las viñetas"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {showListMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 p-3 bg-white rounded-2xl shadow-2xl border border-line w-64 text-xs font-sans space-y-3 animate-in fade-in duration-150">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                  1. Elige la Forma de Viñeta:
                </span>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => applyListStyle('disc')}
                    className="w-full p-1.5 rounded-lg hover:bg-surface-muted flex items-center gap-2.5 text-left font-semibold text-primary cursor-pointer transition-colors"
                  >
                    <span className="text-base font-bold leading-none" style={{ color: selectedListColor }}>•</span>
                    <span>Puntos Redondos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyListStyle('check')}
                    className="w-full p-1.5 rounded-lg hover:bg-surface-muted flex items-center gap-2.5 text-left font-semibold text-primary cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-xs leading-none" style={{ color: selectedListColor }}>✓</span>
                    <span>Checkmarks de Verificación</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyListStyle('arrow')}
                    className="w-full p-1.5 rounded-lg hover:bg-surface-muted flex items-center gap-2.5 text-left font-semibold text-primary cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-xs leading-none" style={{ color: selectedListColor }}>➔</span>
                    <span>Flechas de Acción</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-line">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    2. Color de la Viñeta:
                  </span>
                  <input
                    type="color"
                    value={selectedListColor}
                    onChange={e => applyListColor(e.target.value)}
                    className="w-5 h-5 rounded border border-line cursor-pointer p-0"
                    title="Selector de color libre"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => applyListColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-4 h-4 rounded-full border cursor-pointer hover:scale-120 transition-transform ${
                        selectedListColor === c.hex ? 'ring-2 ring-accent ring-offset-1 border-white' : 'border-black/10'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnClass(editor.isActive('orderedList'))}
          title="Lista numerada estándar"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        {/* Citas Editoriales con Selector de Color */}
        <div className="relative" ref={quoteMenuRef}>
          <div className="flex items-center bg-surface-muted rounded-lg border border-line p-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={btnClass(editor.isActive('blockquote'))}
              title="Cita editorial estándar"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowQuoteMenu(!showQuoteMenu)}
              className="px-1 py-1 text-muted hover:text-primary cursor-pointer"
              title="Elegir color de barra para la cita"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {showQuoteMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 p-3 bg-white rounded-2xl shadow-2xl border border-line w-60 text-xs font-sans space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Color de Barra Lateral:
                </span>
                <input
                  type="color"
                  value={selectedQuoteColor}
                  onChange={e => applyQuoteColor(e.target.value)}
                  className="w-5 h-5 rounded border border-line cursor-pointer p-0"
                  title="Selector libre de color para la cita"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => applyQuoteColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-5 h-5 rounded-full border cursor-pointer hover:scale-115 transition-transform ${
                      selectedQuoteColor === c.hex ? 'ring-2 ring-accent ring-offset-1 border-white' : 'border-black/10'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Callout / Nota destacada */}
        <button
          type="button"
          onClick={onInsertCallout}
          className={btnClass(false)}
          title="Nota destacada / Tip"
        >
          <Lightbulb className="w-4 h-4 text-warning" />
        </button>

        {/* Separadores con Selector de Color */}
        <div className="relative" ref={dividerMenuRef}>
          <div className="flex items-center bg-surface-muted rounded-lg border border-line p-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className={btnClass(false)}
              title="Línea divisoria clásica"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowDividerMenu(!showDividerMenu)}
              className="px-1 py-1 text-muted hover:text-primary cursor-pointer"
              title="Elegir estilo de separador"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {showDividerMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 p-3 bg-white rounded-2xl shadow-2xl border border-line w-64 text-xs font-sans space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Color del Separador:
                </span>
                <input
                  type="color"
                  value={selectedDividerColor}
                  onChange={e => setSelectedDividerColor(e.target.value)}
                  className="w-5 h-5 rounded border border-line cursor-pointer p-0"
                  title="Selector libre de color para separador"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedDividerColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-4 h-4 rounded-full border cursor-pointer hover:scale-120 transition-transform ${
                      selectedDividerColor === c.hex ? 'ring-2 ring-accent ring-offset-1 border-white' : 'border-black/10'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>

              <div className="pt-2 border-t border-line space-y-1">
                <button
                  type="button"
                  onClick={() => insertStyledDivider('classic')}
                  className="w-full p-1.5 rounded-lg hover:bg-surface-muted flex items-center gap-2.5 text-left font-semibold text-primary cursor-pointer transition-colors"
                >
                  <span className="w-7 h-[1px] bg-zinc-400"></span>
                  <span>Línea Gris Clásica</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertStyledDivider('custom-line')}
                  className="w-full p-1.5 rounded-lg hover:bg-surface-muted flex items-center gap-2.5 text-left font-semibold text-primary cursor-pointer transition-colors"
                >
                  <span className="w-7 h-[2px]" style={{ backgroundColor: selectedDividerColor }}></span>
                  <span>Línea con Color Elegido</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertStyledDivider('gradient')}
                  className="w-full p-1.5 rounded-lg hover:bg-surface-muted flex items-center gap-2.5 text-left font-semibold text-primary cursor-pointer transition-colors"
                >
                  <span className="w-7 h-[2px]" style={{ background: `linear-gradient(to right, transparent, ${selectedDividerColor}, transparent)` }}></span>
                  <span>Degradado Suave</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertStyledDivider('dots')}
                  className="w-full p-1.5 rounded-lg hover:bg-surface-muted flex items-center gap-2.5 text-left font-semibold text-primary cursor-pointer transition-colors"
                >
                  <span className="font-bold leading-none tracking-widest" style={{ color: selectedDividerColor }}>•••</span>
                  <span>Puntos Diamante</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Bloques Ricos & Multimedia Avanzada */}
      <div className="flex items-center gap-1 border-r border-line pr-2 mr-1">
        <button
          type="button"
          onClick={onOpenImageModal}
          className="h-8 px-2.5 rounded-lg text-xs font-semibold text-primary bg-white hover:bg-surface-muted border border-line transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title="Insertar y configurar foto (Alt, tamaños, alineación)"
        >
          <ImageIcon className="w-3.5 h-3.5 text-muted" />
          <span>Foto</span>
        </button>

        <button
          type="button"
          onClick={onOpenVideoModal}
          className="h-8 px-2.5 rounded-lg text-xs font-semibold text-primary bg-white hover:bg-surface-muted border border-line transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title="Incrustar Video (YouTube/Vimeo/Loom)"
        >
          <Video className="w-3.5 h-3.5 text-muted" />
          <span>Video</span>
        </button>

        <button
          type="button"
          onClick={onOpenCtaModal}
          className="h-8 px-2.5 rounded-lg text-xs font-semibold text-primary bg-white hover:bg-surface-muted border border-line transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title="Insertar Bloque de Llamado a la Acción (CTA)"
        >
          <Sparkles className="w-3.5 h-3.5 text-muted" />
          <span>CTA</span>
        </button>

        <button
          type="button"
          onClick={onOpenBookmarkModal}
          className="h-8 px-2 rounded-lg text-xs font-semibold text-muted hover:text-primary hover:bg-surface-muted transition-colors flex items-center gap-1 cursor-pointer"
          title="Insertar Tarjeta de Enlace / Cita"
        >
          <Bookmark className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onOpenComparisonModal}
          className="h-8 px-2 rounded-lg text-xs font-semibold text-muted hover:text-primary hover:bg-surface-muted transition-colors flex items-center gap-1 cursor-pointer"
          title="Insertar Tabla Comparativa Antes vs Después"
        >
          <Columns2 className="w-3.5 h-3.5" />
        </button>

        {onOpenColumnsModal && (
          <button
            type="button"
            onClick={onOpenColumnsModal}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold text-primary bg-white hover:bg-surface-muted border border-line transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Insertar Bloque en 2 Columnas de Contenido"
          >
            <Columns2 className="w-3.5 h-3.5 text-muted" />
            <span className="hidden sm:inline">2 Columnas</span>
          </button>
        )}

        {onOpenInfographicModal && (
          <button
            type="button"
            onClick={onOpenInfographicModal}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold text-primary bg-white hover:bg-surface-muted border border-line transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Insertar Flujos de Pasos, Métricas, Barras de Datos, Timelines y Gráficos"
          >
            <Workflow className="w-3.5 h-3.5 text-muted" />
            <span>Gráficos & Flujos</span>
          </button>
        )}

        {onOpenLeadFormModal && (
          <button
            type="button"
            onClick={onOpenLeadFormModal}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold text-primary bg-white hover:bg-surface-muted border border-line transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Insertar Formulario Emergente o Embebido para Captar Leads (HubSpot Video 5)"
          >
            <Mail className="w-3.5 h-3.5 text-muted" />
            <span>Captura Leads</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenFaqModal}
          className="h-8 px-2 rounded-lg text-xs font-semibold text-muted hover:text-primary hover:bg-surface-muted transition-colors flex items-center gap-1 cursor-pointer"
          title="Insertar Acordeón FAQ"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onGenerateToc}
          className="h-8 px-2 rounded-lg text-xs font-semibold text-muted hover:text-primary hover:bg-surface-muted transition-colors flex items-center gap-1 cursor-pointer"
          title="Generar Índice de Contenidos (TOC)"
        >
          <ListTree className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5. Plantillas HubSpot */}
      {onOpenHubSpotTemplates && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenHubSpotTemplates}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold text-primary bg-white hover:bg-surface-muted border border-line transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Cargar Plantillas de Estructura HubSpot"
          >
            <BookOpen className="w-3.5 h-3.5 text-muted" />
            <span>Plantillas HubSpot</span>
          </button>
        </div>
      )}
    </div>
  )
}
