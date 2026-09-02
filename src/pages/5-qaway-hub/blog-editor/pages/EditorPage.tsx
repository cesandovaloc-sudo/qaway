import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Send, Save, Eye, Edit3, Maximize, Minimize, BookOpen, Sparkles, Link2, Type, Undo2, Redo2, PanelRightOpen } from 'lucide-react'
import { useBlog, slugify } from '../context/BlogContext'
import type { PostStatus } from '../types'
import CoverDropzone from '../components/CoverDropzone'
import VisualEditor, { type VisualEditorRef } from '../components/VisualEditor'
import PostSettingsSidebar from '../components/PostSettingsSidebar'
import ImageAdvancedModal, { type ImageInsertData } from '../components/modals/ImageAdvancedModal'
import VideoModal from '../components/modals/VideoModal'
import CtaModal, { type CtaData } from '../components/modals/CtaModal'
import BookmarkModal, { type BookmarkData } from '../components/modals/BookmarkModal'
import ComparisonModal, { type ComparisonData } from '../components/modals/ComparisonModal'
import ColumnsModal, { type ColumnsData } from '../components/modals/ColumnsModal'
import FaqModal, { type FaqItem } from '../components/modals/FaqModal'
import CalloutModal, { type CalloutData } from '../components/modals/CalloutModal'
import InfographicModal, { type InfographicData } from '../components/modals/InfographicModal'
import LeadFormModal from '../components/modals/LeadFormModal'
import HubSpotTemplatesModal, { type HubSpotTemplate } from '../components/modals/HubSpotTemplatesModal'
import HubSpotQuickRulesModal from '../components/modals/HubSpotQuickRulesModal'
import { processBlogHtml } from '../utils/contentRenderer'
import type { LeadFormData } from '../types'

export default function EditorPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getPost, savePost, setStatus: updateContextStatus, categories } = useBlog()
  const editorRef = useRef<VisualEditorRef>(null)

  const postId = id || searchParams.get('id') || undefined
  const existing = postId ? getPost(postId) : undefined

  const defaultCategory = categories[0]?.name || 'I. Artificial'
  const initialUrlTitle = searchParams.get('title') || ''
  const initialUrlCategory = searchParams.get('category') || defaultCategory

  const [title, setTitle] = useState(existing?.title || initialUrlTitle)
  const [slug, setSlug] = useState(existing?.slug || (initialUrlTitle ? slugify(initialUrlTitle) : ''))
  const [excerpt, setExcerpt] = useState(existing?.excerpt || '')
  const [category, setCategory] = useState(existing?.category || initialUrlCategory)
  const [coverUrl, setCoverUrl] = useState(existing?.coverUrl || '')
  const [coverAlt, setCoverAlt] = useState(existing?.coverAlt || '')
  const [contentHtml, setContentHtml] = useState(existing?.contentHtml || existing?.body || '')
  const [contentJson, setContentJson] = useState(existing?.contentJson || '')
  const [plainText, setPlainText] = useState(existing?.body || '')
  const [status, setStatus] = useState<PostStatus>(existing?.status || 'borrador')
  const [headerLayout, setHeaderLayout] = useState<'editorial-cta' | 'split' | 'banner'>(existing?.headerLayout || 'editorial-cta')
  const [headerCtaTag, setHeaderCtaTag] = useState(existing?.headerCtaTag || '')
  const [headerCtaTitle, setHeaderCtaTitle] = useState(existing?.headerCtaTitle || '')
  const [headerCtaDesc, setHeaderCtaDesc] = useState(existing?.headerCtaDesc || '')
  const [headerCtaBtnText, setHeaderCtaBtnText] = useState(existing?.headerCtaBtnText || '')
  const [headerCtaUrl, setHeaderCtaUrl] = useState(existing?.headerCtaUrl || '')
  const [internalNotes, setInternalNotes] = useState('')
  const [focusKeyword, setFocusKeyword] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [isZenMode, setIsZenMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeAssistant, setActiveAssistant] = useState<'title' | 'intro' | 'body' | 'links' | null>(null)

  const savedScrollTopRef = useRef<number>(0)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  const handleSwitchViewMode = (newMode: 'edit' | 'preview') => {
    if (newMode === viewMode) return

    if (newMode === 'preview') {
      const top = editorRef.current?.getScrollTop() || 0
      savedScrollTopRef.current = top
      setViewMode('preview')
      requestAnimationFrame(() => {
        if (previewContainerRef.current) {
          previewContainerRef.current.scrollTop = top
        }
      })
    } else {
      const top = previewContainerRef.current?.scrollTop || 0
      savedScrollTopRef.current = top
      setViewMode('edit')
      requestAnimationFrame(() => {
        editorRef.current?.setScrollTop(top)
      })
    }
  }

  const toggleAssistant = (tab: 'title' | 'intro' | 'body' | 'links') => {
    setActiveAssistant(prev => (prev === tab ? null : tab))
  }

  const addBracketToTitle = (tag: string) => {
    if (!title.includes(tag)) {
      const cleanTitle = title.replace(/\s*\[.*?\]\s*$/, '').trim()
      const newTitle = cleanTitle ? `${cleanTitle} ${tag}` : tag
      setTitle(newTitle)
      if (!slug) setSlug(slugify(newTitle))
    }
  }

  const insertOpeningHook = (hookText: string) => {
    if (editorRef.current) {
      const ed = editorRef.current.getEditor()
      if (ed) {
        ed.chain().focus().insertContent(`<p>${hookText} </p>`).run()
      }
    }
  }

  const insertPassiveCta = (text: string) => {
    if (editorRef.current) {
      editorRef.current.insertCta({
        type: 'passive',
        title: text,
        passiveText: text,
        buttonText: 'Descargar',
        buttonUrl: '#',
        buttonBgColor: '#FF5B26',
      })
    }
  }

  // Estados de Modales Avanzados
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isCtaModalOpen, setIsCtaModalOpen] = useState(false)
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false)
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false)
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false)
  const [isCalloutModalOpen, setIsCalloutModalOpen] = useState(false)
  const [isInfographicModalOpen, setIsInfographicModalOpen] = useState(false)
  const [isLeadFormModalOpen, setIsLeadFormModalOpen] = useState(false)
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false)
  const [isHubSpotTemplatesOpen, setIsHubSpotTemplatesOpen] = useState(false)
  const [isQuickRulesOpen, setIsQuickRulesOpen] = useState(false)

  // Auto-guardado de emergencia en localStorage mientras se redacta
  useEffect(() => {
    if (title || contentHtml) {
      try {
        localStorage.setItem(
          'qaway_editor_autosave',
          JSON.stringify({
            title,
            slug,
            excerpt,
            category,
            coverUrl,
            coverAlt,
            headerLayout,
            contentHtml,
            contentJson,
            plainText,
            timestamp: Date.now(),
          })
        )
      } catch (e) {
        console.debug(e)
      }
    }
  }, [title, slug, excerpt, category, coverUrl, coverAlt, headerLayout, contentHtml, contentJson, plainText])

  const [hasAutosaveToRestore, setHasAutosaveToRestore] = useState(false)
  useEffect(() => {
    if (!id && !contentHtml) {
      try {
        const saved = localStorage.getItem('qaway_editor_autosave')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.title || parsed.contentHtml) {
            setHasAutosaveToRestore(true)
          }
        }
      } catch (e) {
        console.debug(e)
      }
    }
  }, [id, contentHtml])

  const handleRestoreAutosave = () => {
    try {
      const saved = localStorage.getItem('qaway_editor_autosave')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.title) setTitle(parsed.title)
        if (parsed.slug) setSlug(parsed.slug)
        if (parsed.excerpt) setExcerpt(parsed.excerpt)
        if (parsed.category) setCategory(parsed.category)
        if (parsed.coverUrl) setCoverUrl(parsed.coverUrl)
        if (parsed.coverAlt) setCoverAlt(parsed.coverAlt)
        if (parsed.headerLayout) setHeaderLayout(parsed.headerLayout)
        if (parsed.contentHtml) {
          setContentHtml(parsed.contentHtml)
          editorRef.current?.getEditor()?.commands.setContent(parsed.contentHtml)
        }
        if (parsed.contentJson) setContentJson(parsed.contentJson)
        if (parsed.plainText) setPlainText(parsed.plainText)
        setHasAutosaveToRestore(false)
      }
    } catch (e) {
      console.debug(e)
    }
  }

  useEffect(() => {
    if (id) {
      const p = getPost(id)
      if (p) {
        setTitle(p.title)
        setSlug(p.slug)
        setExcerpt(p.excerpt)
        setCategory(p.category)
        setCoverUrl(p.coverUrl)
        setCoverAlt(p.coverAlt || '')
        setHeaderLayout(p.headerLayout || 'editorial-cta')
        setHeaderCtaTag(p.headerCtaTag || '')
        setHeaderCtaTitle(p.headerCtaTitle || '')
        setHeaderCtaDesc(p.headerCtaDesc || '')
        setHeaderCtaBtnText(p.headerCtaBtnText || '')
        setHeaderCtaUrl(p.headerCtaUrl || '')
        setContentHtml(p.contentHtml || p.body)
        setContentJson(p.contentJson || '')
        setPlainText(p.body)
        setStatus(p.status)
      }
    }
  }, [id, getPost])

  const handleSave = useCallback(
    async (targetStatus: PostStatus) => {
      if (!title.trim()) {
        alert('Por favor añade un título al artículo.')
        return
      }

      setIsSaving(true)
      try {
        const savedPost = await savePost({
          id: existing?.id,
          title: title.trim(),
          slug: slug || slugify(title),
          excerpt: excerpt.trim(),
          category,
          coverUrl,
          coverAlt,
          headerLayout,
          headerCtaTag,
          headerCtaTitle,
          headerCtaDesc,
          headerCtaBtnText,
          headerCtaUrl,
          body: plainText,
          contentHtml,
          contentJson,
          status: targetStatus,
        })

        setStatus(targetStatus)
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 2500)

        if (!existing && targetStatus === 'publicado') {
          navigate('/')
        } else if (!existing && savedPost.id) {
          navigate(`/editor/${savedPost.id}`, { replace: true })
        }
      } catch (err) {
        console.error(err)
        alert('Error al guardar el artículo.')
      } finally {
        setIsSaving(false)
      }
    },
    [
      title,
      slug,
      excerpt,
      category,
      coverUrl,
      coverAlt,
      plainText,
      contentHtml,
      contentJson,
      existing,
      savePost,
      navigate,
    ]
  )

  const handleArchive = async () => {
    if (!existing) return
    const newStatus: PostStatus = status === 'archivado' ? 'borrador' : 'archivado'
    await updateContextStatus(existing.id, newStatus)
    setStatus(newStatus)
  }

  const handleSelectHubSpotTemplate = (template: HubSpotTemplate) => {
    setContentHtml(template.contentHtml)
    if (editorRef.current?.getEditor()) {
      editorRef.current.getEditor()?.commands.setContent(template.contentHtml)
    }
  }

  const words = (plainText || contentHtml.replace(/<[^>]*>/g, ' ')).trim().split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(words / 200))

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-white text-primary flex flex-col font-sans">
      {/* 1. Header Superior del Editor */}
      <header className="h-14 border-b border-line bg-white px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <Link
            to="/hub/blog-editor"
            className="p-2 rounded-lg text-muted hover:text-primary hover:bg-surface-muted border border-line transition-all"
            title="Volver al panel de publicaciones"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2.5">
            <Link to="/hub/blog-editor" className="font-display font-bold text-base tracking-tight text-primary">
              Qaway Lab
            </Link>
            <span className="text-line select-none">/</span>
            <span className="text-xs font-mono font-semibold bg-surface-muted text-muted px-2 py-0.5 rounded border border-line">
              {existing ? `POST-${existing.id.substring(0, 4).toUpperCase()}` : 'NUEVO-POST'}
            </span>
            <span className="text-line select-none hidden sm:inline">/</span>
            <span className="text-sm font-medium text-primary/80 truncate max-w-[220px] hidden sm:inline">
              {title || 'Sin título'}
            </span>
          </div>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-2">
          {/* Botones Deshacer / Rehacer (Solo Iconos) */}
          <div className="flex items-center bg-surface-muted p-1 rounded-lg border border-line">
            <button
              type="button"
              onClick={() => editorRef.current?.undo()}
              className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-white transition-all cursor-pointer"
              title="Deshacer último cambio (Ctrl + Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-3.5 bg-line mx-0.5" />
            <button
              type="button"
              onClick={() => editorRef.current?.redo()}
              className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-white transition-all cursor-pointer"
              title="Rehacer cambio (Ctrl + Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Alternador de Modo con Memoria de Posición */}
          <div className="flex bg-surface-muted p-1 rounded-lg border border-line">
            <button
              type="button"
              onClick={() => handleSwitchViewMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'edit'
                  ? 'bg-white text-primary shadow-xs font-bold'
                  : 'text-muted hover:text-primary'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-white text-primary shadow-xs font-bold'
                  : 'text-muted hover:text-primary'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Vista Previa</span>
            </button>
          </div>

          {/* Modo Zen */}
          <button
            type="button"
            onClick={() => setIsZenMode(!isZenMode)}
            className={`p-2 rounded-lg border border-line transition-colors cursor-pointer ${
              isZenMode ? 'bg-surface-muted text-primary font-bold border-primary/30' : 'text-muted hover:text-primary hover:bg-surface-muted'
            }`}
            title={isZenMode ? 'Salir de Modo Zen' : 'Modo Zen (Sin distracciones)'}
          >
            {isZenMode ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Botón Guardar Borrador (Icono Sutil) */}
          <button
            type="button"
            onClick={() => handleSave('borrador')}
            disabled={isSaving}
            className="p-2 bg-white border border-line hover:border-muted-light text-muted hover:text-primary rounded-lg transition-all cursor-pointer shadow-2xs"
            title="Guardar Borrador (Ctrl + S)"
          >
            <Save className="w-4 h-4" />
          </button>

          {/* Botón Publicar (Icono Naranja Elegante) */}
          <button
            type="button"
            onClick={() => handleSave('publicado')}
            disabled={isSaving}
            className="p-2 bg-accent hover:bg-accent-dark text-white rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center"
            title={status === 'publicado' ? 'Actualizar Artículo' : 'Publicar Ahora'}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Área de Redacción y Panel Lateral Full-Width */}
      <div className="relative flex-1 overflow-hidden w-full min-h-0">
        {/* Botón para Reabrir Panel de Ajustes ubicado en el lugar exacto del panel derecho */}
        {!isSidebarOpen && !isZenMode && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-3.5 right-4 sm:right-6 lg:right-8 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-white hover:bg-surface-muted text-xs font-bold text-primary shadow-xs hover:shadow-md transition-all cursor-pointer animate-in fade-in duration-150"
            title="Mostrar panel lateral de ajustes"
          >
            <PanelRightOpen className="w-4 h-4 text-muted" />
            <span>Ajustes</span>
          </button>
        )}

        <div
          className={`h-full w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 grid gap-6 sm:gap-8 min-h-0 ${
            isZenMode || !isSidebarOpen ? 'grid-cols-1 max-w-5xl mx-auto' : 'grid-cols-1 lg:grid-cols-[1fr_370px]'
          }`}
        >
        {/* Columna Izquierda: Lienzo del Documento */}
        <div className="h-full flex flex-col overflow-hidden min-h-0 space-y-2.5">
          {/* 1. Vista Modo Edición */}
          <div className={`h-full flex flex-col overflow-hidden min-h-0 space-y-2.5 ${viewMode === 'edit' ? '' : 'hidden'}`}>
            {/* 1. Portada y Título */}
              <div className="shrink-0 space-y-1.5">
                {hasAutosaveToRestore && (
                  <div className="p-3 bg-surface-muted border border-line rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
                    <span className="font-semibold text-primary flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5 text-muted" />
                      <span>Se ha detectado un borrador guardado localmente.</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRestoreAutosave}
                        className="px-3 py-1 bg-white border border-line text-primary font-bold rounded-lg shadow-2xs hover:bg-surface-subtle cursor-pointer transition-colors"
                      >
                        Restaurar
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasAutosaveToRestore(false)}
                        className="px-2 py-1 text-muted hover:text-primary cursor-pointer text-xs"
                      >
                        Descartar
                      </button>
                    </div>
                  </div>
                )}

                <CoverDropzone
                  coverUrl={coverUrl}
                  coverAlt={coverAlt}
                  onChange={(url, alt) => {
                    setCoverUrl(url)
                    if (alt) setCoverAlt(alt)
                  }}
                />

                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => {
                    setTitle(e.target.value)
                    if (!slug) setSlug(slugify(e.target.value))
                  }}
                  placeholder="Escribe el título de tu artículo (máx. 60 caracteres)..."
                  className="w-full bg-transparent border-0 border-b border-transparent hover:border-line focus:border-accent text-2xl sm:text-3xl font-display font-bold tracking-tight text-primary placeholder:text-muted-light/40 focus:outline-none transition-colors py-1.5 leading-tight"
                />

                {/* Barra de Asistentes Editoriales HubSpot (Minimalista por Etapas) */}
                <div className="pt-0.5 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          title.length > 0 && title.length <= 60
                            ? 'bg-success/10 text-success'
                            : title.length > 60
                            ? 'bg-danger text-white'
                            : 'bg-surface-muted text-muted'
                        }`}
                      >
                        {title.length} / 60 car. {title.length > 60 && ' (Excede el límite)'}
                      </span>

                      {title.length > 60 && (
                        <span className="text-[11px] text-danger font-medium">
                          Google cortará tu título en los resultados de búsqueda.
                        </span>
                      )}
                    </div>

                    {/* Píldoras de Asistente Rápido */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => toggleAssistant('title')}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          activeAssistant === 'title'
                            ? 'bg-primary text-white border-primary shadow-xs font-bold'
                            : 'text-muted hover:text-primary bg-white hover:bg-surface-muted border-line shadow-2xs'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Título</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleAssistant('intro')}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          activeAssistant === 'intro'
                            ? 'bg-primary text-white border-primary shadow-xs font-bold'
                            : 'text-muted hover:text-primary bg-white hover:bg-surface-muted border-line shadow-2xs'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Introducción</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleAssistant('body')}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          activeAssistant === 'body'
                            ? 'bg-primary text-white border-primary shadow-xs font-bold'
                            : 'text-muted hover:text-primary bg-white hover:bg-surface-muted border-line shadow-2xs'
                        }`}
                      >
                        <Type className="w-3.5 h-3.5" />
                        <span>Cuerpo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleAssistant('links')}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          activeAssistant === 'links'
                            ? 'bg-primary text-white border-primary shadow-xs font-bold'
                            : 'text-muted hover:text-primary bg-white hover:bg-surface-muted border-line shadow-2xs'
                        }`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Enlaces & CTA</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. Asistente de Título */}
                  {activeAssistant === 'title' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-line shadow-xs space-y-3.5 animate-in fade-in duration-150">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                            🎯 Regla HubSpot: Fijar Expectativas en el Título
                          </span>
                          <span className="text-xs font-semibold text-primary bg-surface-muted px-2 py-0.5 rounded-md border border-line font-mono">
                            +38% CTR con corchetes [ ]
                          </span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">
                          El lector y Google deben saber exactamente qué ganarán antes de hacer clic respondiendo 3 puntos:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-[#fafafc] p-3.5 rounded-xl border border-line space-y-1">
                          <strong className="text-primary font-bold block">1. ¿Qué logrará? (Beneficio)</strong>
                          <p className="text-muted leading-relaxed">Ej: "Cómo automatizar WhatsApp"</p>
                        </div>
                        <div className="bg-[#fafafc] p-3.5 rounded-xl border border-line space-y-1">
                          <strong className="text-primary font-bold block">2. ¿Cuánto tiempo/esfuerzo?</strong>
                          <p className="text-muted leading-relaxed">Ej: "en 15 minutos" o "Paso a Paso"</p>
                        </div>
                        <div className="bg-[#fafafc] p-3.5 rounded-xl border border-line space-y-1">
                          <strong className="text-primary font-bold block">3. ¿Qué recurso incluye?</strong>
                          <p className="text-muted leading-relaxed">Usa corchetes al final [ ]</p>
                        </div>
                      </div>

                      {/* Botones de Inserción Rápida de Corchetes */}
                      <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-xs font-bold text-muted mr-1">Insertar corchete rápido:</span>
                        {[
                          '[Guía 2026]',
                          '[Paso a Paso]',
                          '[Plantilla Gratis]',
                          '[Checklist]',
                          '[Casos Reales]',
                          '[5 Ejemplos]',
                        ].map((tag, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => addBracketToTitle(tag)}
                            className="bg-[#fafafc] hover:bg-accent hover:text-white text-zinc-700 font-semibold px-3 py-1.5 rounded-lg border border-line shadow-2xs transition-all cursor-pointer text-xs"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>

                      <div className="text-xs text-muted bg-[#fafafc] p-3 rounded-xl border border-line">
                        <span className="font-bold text-danger">✕ Título Débil:</span> "Diseño de infografías" &nbsp;|&nbsp;{' '}
                        <span className="font-bold text-success">✓ Fija Expectativas:</span> "Cómo crear una infografía en 1 hora [15 Plantillas Gratis]"
                      </div>
                    </div>
                  )}

                  {/* 2. Asistente de Introducción */}
                  {activeAssistant === 'intro' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-line shadow-xs space-y-3.5 animate-in fade-in duration-150">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                            🎣 Regla HubSpot: Los 4 Ganchos de Apertura
                          </span>
                          <span className="text-xs font-semibold text-primary bg-surface-muted px-2 py-0.5 rounded-md border border-line font-mono">
                            Primeras 2-3 frases
                          </span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">
                          Captura la atención inmediata del lector para evitar que abandone el post utilizando uno de estos disparadores:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className="bg-[#fafafc] p-3.5 rounded-xl border border-line space-y-1">
                          <strong className="text-primary font-bold block">🤝 1. Empatía con su dolor</strong>
                          <p className="text-muted leading-relaxed">Conecta con una frustración real del día a día.</p>
                        </div>
                        <div className="bg-[#fafafc] p-3.5 rounded-xl border border-line space-y-1">
                          <strong className="text-primary font-bold block">📊 2. Estadística / Dato</strong>
                          <p className="text-muted leading-relaxed">Inicia con un número o métrica reveladora.</p>
                        </div>
                        <div className="bg-[#fafafc] p-3.5 rounded-xl border border-line space-y-1">
                          <strong className="text-primary font-bold block">😄 3. Humor o Anécdota</strong>
                          <p className="text-muted leading-relaxed">Situación cotidiana y cercana de la industria.</p>
                        </div>
                        <div className="bg-[#fafafc] p-3.5 rounded-xl border border-line space-y-1">
                          <strong className="text-primary font-bold block">❓ 4. Pregunta Retadora</strong>
                          <p className="text-muted leading-relaxed">Desafía una creencia común de tu audiencia.</p>
                        </div>
                      </div>

                      {/* Botones de Inserción Rápida de Gancho en el Editor */}
                      <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-xs font-bold text-muted mr-1">Insertar frase de inicio:</span>
                        {[
                          'Si alguna vez has sentido que...',
                          'El 70% de las empresas cometen el error de...',
                          '¿Alguna vez te has preguntado por qué...',
                          'Existe un problema común cuando...',
                        ].map((hookText, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => insertOpeningHook(hookText)}
                            className="bg-[#fafafc] hover:bg-surface-muted hover:text-primary text-zinc-700 font-semibold px-3 py-1.5 rounded-lg border border-line shadow-2xs transition-all cursor-pointer text-xs"
                          >
                            + "{hookText}"
                          </button>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-surface-muted border border-line flex items-start gap-2.5 text-xs">
                        <span className="text-base">💡</span>
                        <p className="text-muted leading-relaxed">
                          <strong className="text-primary font-bold">Secreto de Productividad HubSpot:</strong> Si sientes bloqueo al iniciar, redacta primero los puntos del cuerpo (Paso 1 al 5) y escribe la introducción y conclusión al final.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 3. Asistente de Cuerpo y Redacción */}
                  {activeAssistant === 'body' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-line shadow-xs space-y-3.5 animate-in fade-in duration-150">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                            ✍️ Reglas HubSpot: Redacción, Ritmo y Espacio en Blanco
                          </span>
                          <span className="text-xs font-semibold text-primary bg-surface-muted px-2 py-0.5 rounded-md border border-line font-mono">
                            Cuerpo del Post
                          </span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">
                          Estructura tus párrafos para que la lectura respire y no fatigue la vista del usuario:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className="bg-[#fafafc] p-3.5 rounded-xl border border-line space-y-1">
                          <strong className="text-primary font-bold block">🗣️ Tutea al Lector</strong>
                          <p className="text-muted leading-relaxed">Usa "tú" para hablarle directo a una persona real.</p>
                        </div>
                        <div className="bg-[#fafafc] p-3.5 rounded-xl border border-line space-y-1">
                          <strong className="text-primary font-bold block">⚡ Voz Activa</strong>
                          <p className="text-muted leading-relaxed">"Automatizamos el flujo" en vez de "fue automatizado".</p>
                        </div>
                        <div className="bg-[#fafafc] p-3.5 rounded-xl border border-line space-y-1">
                          <strong className="text-primary font-bold block">📏 Párrafos de 2-3 Líneas</strong>
                          <p className="text-muted leading-relaxed">Crea espacio en blanco para lectura ágil en móvil.</p>
                        </div>
                        <div className="bg-[#fafafc] p-3.5 rounded-xl border border-line space-y-1">
                          <strong className="text-primary font-bold block">✨ Negritas Selectivas</strong>
                          <p className="text-muted leading-relaxed">Solo 1 oración clave cada 2-3 párrafos para escaneo.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-0.5">
                        <div className="p-3 rounded-xl bg-surface-muted border border-line space-y-1">
                          <strong className="text-primary font-bold block">🔍 Palabras Clave Naturales</strong>
                          <p className="text-muted leading-relaxed">
                            Usa tu palabra clave en la intro y en algún H2. Luego usa sinónimos para no saturar (&gt;2.8% penaliza).
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-surface-muted border border-line space-y-1">
                          <strong className="text-primary font-bold block">✂️ Elimina Palabras Vacías</strong>
                          <p className="text-muted leading-relaxed">
                            Elimina palabras de relleno como "muy", "realmente", "totalmente", "absolutamente".
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. Asistente de Enlaces & Conversión */}
                  {activeAssistant === 'links' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-line shadow-xs space-y-3.5 animate-in fade-in duration-150">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                            🔗 Reglas HubSpot: Enlaces, CTAs y Conversión
                          </span>
                          <span className="text-xs font-semibold text-primary bg-surface-muted px-2 py-0.5 rounded-md border border-line font-mono">
                            Estrategia de Clics
                          </span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">
                          Todo artículo debe conducir al lector hacia el siguiente paso de valor:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-[#fafafc] p-3.5 rounded-xl border border-line space-y-1">
                          <strong className="text-primary font-bold block">🎯 CTA Pasivo Temprano</strong>
                          <p className="text-muted leading-relaxed">
                            Coloca un enlace discreto de descarga en los primeros párrafos para lectores con prisa.
                          </p>
                        </div>
                        <div className="bg-[#fafafc] p-3.5 rounded-xl border border-line space-y-1">
                          <strong className="text-primary font-bold block">🌐 Enlaces Externos (_blank)</strong>
                          <p className="text-muted leading-relaxed">
                            Abre fuentes o estudios en pestaña nueva para no perder la visita a tu sitio.
                          </p>
                        </div>
                        <div className="bg-[#fafafc] p-3.5 rounded-xl border border-line space-y-1">
                          <strong className="text-primary font-bold block">🚀 CTA Visual al Cierre</strong>
                          <p className="text-muted leading-relaxed">
                            Finaliza el post con una tarjeta visual hacia WhatsApp, asesoría o descarga.
                          </p>
                        </div>
                      </div>

                      {/* Botones de Inserción Rápida de Enlaces / CTA */}
                      <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-xs font-bold text-muted mr-1">Insertar en el editor:</span>
                        <button
                          type="button"
                          onClick={() => insertPassiveCta('Descarga aquí la guía completa gratuita')}
                          className="bg-[#fafafc] hover:bg-surface-muted hover:text-primary text-zinc-700 font-semibold px-3 py-1.5 rounded-lg border border-line shadow-2xs transition-all cursor-pointer text-xs"
                        >
                          + CTA Pasivo: &lt;&lt; Descarga aquí la guía &gt;&gt;
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCtaModalOpen(true)}
                          className="bg-primary hover:bg-primary/90 text-white font-semibold px-3.5 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer text-xs"
                        >
                          + Crear CTA Visual Grande
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Editor Visual */}
              <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
                <VisualEditor
                  ref={editorRef}
                  initialContent={contentHtml}
                  onChange={res => {
                    setContentHtml(res.html)
                    setContentJson(res.json)
                    setPlainText(res.plainText)
                  }}
                  onOpenImageModal={() => setIsImageModalOpen(true)}
                  onOpenVideoModal={() => setIsVideoModalOpen(true)}
                  onOpenCtaModal={() => setIsCtaModalOpen(true)}
                  onOpenBookmarkModal={() => setIsBookmarkModalOpen(true)}
                  onOpenComparisonModal={() => setIsComparisonModalOpen(true)}
                  onOpenColumnsModal={() => setIsColumnsModalOpen(true)}
                  onOpenCalloutModal={() => setIsCalloutModalOpen(true)}
                  onOpenInfographicModal={() => setIsInfographicModalOpen(true)}
                  onOpenLeadFormModal={() => setIsLeadFormModalOpen(true)}
                  onOpenFaqModal={() => setIsFaqModalOpen(true)}
                  onOpenHubSpotTemplates={() => setIsHubSpotTemplatesOpen(true)}
                />
              </div>
            </div>

            {/* 2. Vista Previa de Lectura Fiel (WYSIWYG) */}
            <div
              ref={previewContainerRef}
              className={`flex-1 overflow-y-auto bg-[#fafafc] p-4 sm:p-6 min-h-0 ${
                viewMode === 'preview' ? '' : 'hidden'
              }`}
            >
              <div className="max-w-[712px] mx-auto w-full bg-white border border-zinc-200/80 rounded-[15px] p-6 sm:p-7 md:px-7 md:py-9 shadow-xs">
                {headerLayout === 'split' ? (
                  /* 1. Cabecera Dividida a 2 Columnas (Estilo Oficial HubSpot Hero) */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8 pb-8 border-b border-line">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-surface-muted text-primary border border-line">
                          {category}
                        </span>
                        <span className="text-xs text-muted-light font-mono">
                          ~{readingTime} min de lectura ({words} palabras)
                        </span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-display tracking-tight text-primary leading-[1.15]">
                        {title || 'Sin título'}
                      </h1>
                      {excerpt && (
                        <p className="text-sm sm:text-base text-muted leading-relaxed">
                          {excerpt}
                        </p>
                      )}
                      <div className="pt-2 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#18181b] text-white flex items-center justify-center font-bold text-xs">
                          QL
                        </div>
                        <div>
                          <p className="text-xs font-bold text-primary">Equipo Qaway Lab</p>
                          <p className="text-[11px] text-muted-light">Publicación oficial</p>
                        </div>
                      </div>
                    </div>

                    {coverUrl ? (
                      <div className="rounded-2xl overflow-hidden border border-line shadow-md aspect-[1200/630]">
                        <img
                          src={coverUrl}
                          alt={coverAlt || title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="rounded-2xl border-2 border-dashed border-line flex items-center justify-center p-8 text-muted aspect-[1200/630] bg-[#fafafc]">
                        <span className="text-xs">Sin foto de portada</span>
                      </div>
                    )}
                  </div>
                ) : headerLayout === 'banner' ? (
                  /* 2. Cabecera Panorámica Superior (Full Banner) */
                  <div className="mb-8 pb-8 border-b border-line space-y-6">
                    {coverUrl && (
                      <img
                        src={coverUrl}
                        alt={coverAlt || title}
                        className="w-full aspect-[1200/630] object-cover rounded-xl shadow-xs"
                      />
                    )}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-surface-muted text-primary border border-line">
                          {category}
                        </span>
                        <span className="text-xs text-muted-light font-mono">
                          ~{readingTime} min de lectura ({words} palabras)
                        </span>
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-primary leading-tight">
                        {title || 'Sin título'}
                      </h1>
                      {excerpt && (
                        <p className="text-base text-muted leading-relaxed border-l-2 border-accent pl-3">
                          {excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* 3. Cabecera Oficial Producción (Portada 16:9 + Tarjeta CTA Lateral) */
                  <div className="mb-8 pb-8 border-b border-line space-y-6">
                    <div>
                      <span className="inline-block bg-[#ff4b0b]/10 text-[#ff4b0b] text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#ff4b0b]/20 mb-3 font-mono">
                        {category}
                      </span>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-950 tracking-tight mb-4 leading-[1.15]">
                        {title || 'Sin título'}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 mb-5 font-medium">
                        <span>Escrito por: <strong className="text-zinc-950">Qaway Lab</strong></span>
                        <span>•</span>
                        <span className="text-zinc-500 font-mono">~{readingTime} min de lectura</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                      {/* Portada 16:9 */}
                      <div className="md:col-span-8 relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-zinc-950 border border-black/10 shadow-xs">
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={coverAlt || title}
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs bg-zinc-100">
                            Sin imagen de portada
                          </div>
                        )}
                      </div>

                      {/* Tarjeta Lateral CTA */}
                      <div className="md:col-span-4 flex flex-col justify-between rounded-2xl border border-[#ff4b0b]/25 bg-gradient-to-br from-[#fff9f6] via-[#fff2eb] to-[#ffe7d9] p-5 shadow-2xs">
                        <div>
                          <div className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#ff4b0b] bg-[#ff4b0b]/10 px-2.5 py-0.5 rounded-md mb-2 font-mono">
                            {headerCtaTag || 'Recurso Destacado'}
                          </div>
                          <h4 className="text-sm font-black text-zinc-950 mb-1.5 leading-snug">
                            {headerCtaTitle || 'Guía y Prompts de IA para Negocios'}
                          </h4>
                          <p className="text-[12px] text-zinc-600 leading-relaxed mb-3">
                            {headerCtaDesc || 'Maximiza la productividad de tu equipo y automatiza tareas repetitivas con nuestras plantillas listas para usar.'}
                          </p>
                        </div>
                        <div>
                          <a
                            href={headerCtaUrl || '/recursos/primeros-flujos-ia'}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#ff703d] to-[#ff4b0b] text-white py-2.5 px-3 rounded-xl text-xs font-bold shadow-xs no-underline"
                          >
                            <span>{headerCtaBtnText || 'Descargar Guía Gratis'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className="blog-content blog-prose w-full"
                  dangerouslySetInnerHTML={{
                    __html: processBlogHtml(contentHtml) || '<p class="text-muted-light italic">Sin contenido aún.</p>',
                  }}
                />
              </div>
            </div>
          </div>

        {/* Columna Derecha: Sidebar Lateral de Ajustes, Auditoría HubSpot y Notas (Sin slider gris) */}
        {!isZenMode && isSidebarOpen && (
          <div className="h-full overflow-y-auto space-y-3.5 pr-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <PostSettingsSidebar
              title={title}
              slug={slug}
              excerpt={excerpt}
              category={category}
              contentHtml={contentHtml}
              coverUrl={coverUrl}
              headerLayout={headerLayout}
              headerCtaTag={headerCtaTag}
              headerCtaTitle={headerCtaTitle}
              headerCtaDesc={headerCtaDesc}
              headerCtaBtnText={headerCtaBtnText}
              headerCtaUrl={headerCtaUrl}
              status={status}
              readingTime={readingTime}
              wordCount={words}
              isSaving={isSaving}
              isSaved={isSaved}
              isExisting={Boolean(existing)}
              internalNotes={internalNotes}
              focusKeyword={focusKeyword}
              onSlugChange={setSlug}
              onExcerptChange={setExcerpt}
              onCategoryChange={setCategory}
              onHeaderLayoutChange={setHeaderLayout}
              onHeaderCtaTagChange={setHeaderCtaTag}
              onHeaderCtaTitleChange={setHeaderCtaTitle}
              onHeaderCtaDescChange={setHeaderCtaDesc}
              onHeaderCtaBtnTextChange={setHeaderCtaBtnText}
              onHeaderCtaUrlChange={setHeaderCtaUrl}
              onNotesChange={setInternalNotes}
              onFocusKeywordChange={setFocusKeyword}
              onOpenQuickRules={() => setIsQuickRulesOpen(true)}
              onNavigateKeywordMatch={(kw, idx) => {
                if (editorRef.current) {
                  return editorRef.current.findAndHighlightKeyword(kw, idx)
                }
                return { total: 0, current: 0 }
              }}
              onCloseSidebar={() => setIsSidebarOpen(false)}
              onPublish={() => handleSave('publicado')}
              onSaveDraft={() => handleSave('borrador')}
              onArchive={handleArchive}
            />
          </div>
        )}
        </div>
      </div>

      {/* Modales de la Suite Editorial & HubSpot */}
      <ImageAdvancedModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={(data: ImageInsertData) => editorRef.current?.insertAdvancedImage(data)}
      />

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onInsert={(url: string) => editorRef.current?.insertVideo(url)}
      />

      <CtaModal
        isOpen={isCtaModalOpen}
        onClose={() => setIsCtaModalOpen(false)}
        onInsert={(data: CtaData) => editorRef.current?.insertCta(data)}
      />

      <BookmarkModal
        isOpen={isBookmarkModalOpen}
        onClose={() => setIsBookmarkModalOpen(false)}
        onInsert={(data: BookmarkData) => editorRef.current?.insertBookmark(data)}
      />

      <ComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        onInsert={(data: ComparisonData) => editorRef.current?.insertComparison(data)}
      />

      <ColumnsModal
        isOpen={isColumnsModalOpen}
        onClose={() => setIsColumnsModalOpen(false)}
        onInsert={(data: ColumnsData) => editorRef.current?.insertColumns(data)}
      />

      <CalloutModal
        isOpen={isCalloutModalOpen}
        onClose={() => setIsCalloutModalOpen(false)}
        onInsert={(data: CalloutData) => editorRef.current?.insertCallout(data)}
      />

      <InfographicModal
        isOpen={isInfographicModalOpen}
        onClose={() => setIsInfographicModalOpen(false)}
        onInsert={(data: InfographicData) => editorRef.current?.insertInfographic(data)}
      />

      <LeadFormModal
        isOpen={isLeadFormModalOpen}
        onClose={() => setIsLeadFormModalOpen(false)}
        onInsert={(data: LeadFormData) => editorRef.current?.insertLeadForm(data)}
      />

      <FaqModal
        isOpen={isFaqModalOpen}
        onClose={() => setIsFaqModalOpen(false)}
        onInsert={(faqs: FaqItem[]) => editorRef.current?.insertFaq(faqs)}
      />

      <HubSpotTemplatesModal
        isOpen={isHubSpotTemplatesOpen}
        onClose={() => setIsHubSpotTemplatesOpen(false)}
        onSelectTemplate={handleSelectHubSpotTemplate}
      />

      <HubSpotQuickRulesModal
        isOpen={isQuickRulesOpen}
        onClose={() => setIsQuickRulesOpen(false)}
      />
    </div>
  )
}
