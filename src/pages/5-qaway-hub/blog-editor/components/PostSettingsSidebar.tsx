import React, { useState, useEffect } from 'react'
import {
  Send,
  Save,
  Archive,
  Clock,
  Globe,
  CheckCircle2,
  Check,
  AlertTriangle,
  Users,
  Settings,
  Target,
  Sparkles,
  Info,
  Search,
  ChevronUp,
  ChevronDown,
  PanelRightClose,
  BookOpen,
} from 'lucide-react'
import type { PostStatus } from '../types'
import CategoryPicker from './CategoryPicker'
import { useBlog, slugify } from '../context/BlogContext'

interface PostSettingsSidebarProps {
  title: string
  slug: string
  excerpt: string
  category: string
  contentHtml?: string
  coverUrl?: string
  status: PostStatus
  readingTime?: number
  wordCount?: number
  isSaving: boolean
  isSaved: boolean
  isExisting: boolean
  internalNotes?: string
  focusKeyword?: string
  headerLayout?: 'split' | 'banner'
  onSlugChange: (slug: string) => void
  onExcerptChange: (excerpt: string) => void
  onCategoryChange: (category: string) => void
  onNotesChange?: (notes: string) => void
  onFocusKeywordChange?: (keyword: string) => void
  onHeaderLayoutChange?: (layout: 'split' | 'banner') => void
  onOpenQuickRules?: () => void
  onNavigateKeywordMatch?: (keyword: string, targetIndex: number) => { total: number; current: number }
  onCloseSidebar?: () => void
  onPublish: () => void
  onSaveDraft: () => void
  onArchive: () => void
}

export default function PostSettingsSidebar({
  title,
  slug,
  excerpt,
  category,
  contentHtml = '',
  coverUrl,
  status,
  readingTime = 1,
  wordCount = 0,
  isSaving,
  isSaved,
  isExisting,
  internalNotes = '',
  focusKeyword = '',
  headerLayout = 'split',
  onSlugChange,
  onExcerptChange,
  onCategoryChange,
  onNotesChange,
  onFocusKeywordChange,
  onHeaderLayoutChange,
  onOpenQuickRules,
  onNavigateKeywordMatch,
  onCloseSidebar,
  onPublish,
  onSaveDraft,
  onArchive,
}: PostSettingsSidebarProps) {
  const { isCloudConnected } = useBlog()
  const [activeSidebarTab, setActiveSidebarTab] = useState<'settings' | 'seo' | 'notes'>('settings')
  const [localKeyword, setLocalKeyword] = useState(focusKeyword)
  const [matchNav, setMatchNav] = useState<{ total: number; current: number }>({ total: 0, current: 0 })

  const currentSlug = slug || slugify(title) || 'nuevo-post'

  // Auditoría Inteligente y Flexible de Palabra Clave Long-Tail
  const kw = (focusKeyword || localKeyword).trim().toLowerCase()
  const stopWords = new Set([
    'de', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas',
    'para', 'por', 'con', 'en', 'y', 'o', 'a', 'del', 'al', 'se',
    'su', 'sus', 'tu', 'tus', 'que', 'como', 'es', 'son'
  ])
  const rawTerms = kw.split(/\s+/).filter(Boolean)
  const significantTerms = rawTerms.filter(w => w.length > 2 && !stopWords.has(w))
  const searchTerms = significantTerms.length > 0 ? significantTerms : rawTerms

  const lowerTitle = title.toLowerCase()
  const termsInTitleCount = searchTerms.filter(term => lowerTitle.includes(term)).length
  const isKwInTitle = Boolean(
    kw && (lowerTitle.includes(kw) || (searchTerms.length > 0 && termsInTitleCount >= Math.ceil(searchTerms.length * 0.7)))
  )

  const lowerSlug = currentSlug.toLowerCase()
  const termsInSlugCount = searchTerms.filter(term => lowerSlug.includes(slugify(term))).length
  const isKwInSlug = Boolean(
    kw && (lowerSlug.includes(slugify(kw)) || (searchTerms.length > 0 && termsInSlugCount >= Math.ceil(searchTerms.length * 0.7)))
  )

  const lowerExcerpt = excerpt.toLowerCase()
  const termsInExcerptCount = searchTerms.filter(term => lowerExcerpt.includes(term)).length
  const isKwInExcerpt = Boolean(
    kw && (lowerExcerpt.includes(kw) || (searchTerms.length > 0 && termsInExcerptCount >= Math.ceil(searchTerms.length * 0.7)))
  )

  const h2Matches = Array.from(contentHtml.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi))
  const isKwInH2 = Boolean(
    kw && h2Matches.some(m => {
      const h2Text = m[1].toLowerCase().replace(/<[^>]*>/g, '')
      if (h2Text.includes(kw)) return true
      const matched = searchTerms.filter(term => h2Text.includes(term)).length
      return searchTerms.length > 0 && matched >= Math.ceil(searchTerms.length * 0.6)
    })
  )

  const fullText = (title + ' ' + excerpt + ' ' + contentHtml.replace(/<[^>]*>/g, ' ')).toLowerCase()

  let kwCount = 0
  if (kw && kw.length >= 2) {
    const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const exactMatches = (fullText.match(new RegExp(escapedKw, 'gi')) || []).length
    if (exactMatches > 0) {
      kwCount = exactMatches
    } else {
      const sentences = fullText.split(/[.\n;!?]+/)
      const matchingSentences = sentences.filter(s => {
        const matched = searchTerms.filter(t => s.includes(t)).length
        return searchTerms.length > 0 && matched >= Math.ceil(searchTerms.length * 0.7)
      })
      kwCount = matchingSentences.length
    }
  }

  const kwDensity = wordCount > 0 && kw ? ((kwCount / wordCount) * 100).toFixed(1) : '0.0'
  const numDensity = parseFloat(kwDensity)

  const isKwStuffing = numDensity > 2.8
  const isKwOptimal = (numDensity >= 0.8 && numDensity <= 2.8) || (kwCount >= 1 && numDensity <= 2.8 && (isKwInTitle || isKwInH2))
  const isKwLow = numDensity < 0.8 && kwCount === 0

  const handleNextMatch = () => {
    if (!onNavigateKeywordMatch || !kw) return
    const nextIdx = matchNav.current < matchNav.total ? matchNav.current : 0
    const res = onNavigateKeywordMatch(kw, nextIdx)
    setMatchNav(res)
  }

  const handlePrevMatch = () => {
    if (!onNavigateKeywordMatch || !kw) return
    const prevIdx = matchNav.current > 1 ? matchNav.current - 2 : (matchNav.total > 0 ? matchNav.total - 1 : 0)
    const res = onNavigateKeywordMatch(kw, prevIdx)
    setMatchNav(res)
  }

  useEffect(() => {
    if (kw && onNavigateKeywordMatch && activeSidebarTab === 'seo') {
      const res = onNavigateKeywordMatch(kw, 0)
      setMatchNav(res)
    } else {
      setMatchNav({ total: 0, current: 0 })
    }
  }, [kw, activeSidebarTab])

  // Auditoría HubSpot 360° en tiempo real
  const hasGoodTitleLength = title.trim().length >= 20 && title.trim().length <= 60
  const hasBracketsInTitle = /\[.*\]/.test(title)
  const hasUrlNoNumbers = !/\d/.test(currentSlug)
  const hasExcerptLength = excerpt.trim().length >= 120 && excerpt.trim().length <= 165
  const hasCover = Boolean(coverUrl)
  const hasH2Subheadings = /<h2[^>]*>/i.test(contentHtml)
  const hasNoH1InBody = !/<h1[^>]*>/i.test(contentHtml)
  const hasEnoughWords = wordCount >= 300
  const hasCtaOrLink = /<a[^>]*href=/i.test(contentHtml) || /data-type="cta-block"/i.test(contentHtml) || /infographic-block/i.test(contentHtml)

  // Lista de Criterios sin truncamientos
  const checks = [
    {
      label: 'Título optimizado (≤ 60 car.)',
      passed: hasGoodTitleLength,
      weight: 15,
      badge: `${title.length} / 60`,
      alert: 'Google corta títulos de más de 60 caracteres.',
    },
    {
      label: 'Corchetes en título [ ] (+38% CTR)',
      passed: hasBracketsInTitle,
      weight: 10,
      badge: hasBracketsInTitle ? '✓ Incluido' : 'Opcional (+38%)',
      alert: 'Ej: [Guía 2026] o [Plantilla]',
    },
    {
      label: 'URL limpia sin números (Evita 301s)',
      passed: hasUrlNoNumbers,
      weight: 15,
      badge: hasUrlNoNumbers ? '✓ Correcta' : 'Tiene números',
      alert: 'HubSpot recomienda no poner números en URLs.',
    },
    {
      label: 'Metadescripción (120-160 car.)',
      passed: hasExcerptLength,
      weight: 15,
      badge: `${excerpt.length} / 160`,
      alert: 'Escribe un resumen atractivo de 120 a 160 caracteres.',
    },
    {
      label: 'Foto de portada destacada',
      passed: hasCover,
      weight: 10,
      badge: hasCover ? '✓ Lista' : 'Falta portada',
      alert: 'Añade una portada 1200×630.',
    },
    {
      label: 'Subtítulos H2 (sin H1 en cuerpo)',
      passed: hasH2Subheadings && hasNoH1InBody,
      weight: 15,
      badge: hasH2Subheadings && hasNoH1InBody ? '✓ Correcto' : 'Faltan H2s',
      alert: 'Estructura el cuerpo usando solo H2 y H3.',
    },
    {
      label: 'Extensión mínima (≥ 300 palabras)',
      passed: hasEnoughWords,
      weight: 10,
      badge: `${wordCount} pal.`,
      alert: 'Los posts educativos de valor suelen tener +300 palabras.',
    },
    {
      label: 'Estrategia de CTAs & Infografías',
      passed: hasCtaOrLink,
      weight: 10,
      badge: hasCtaOrLink ? '✓ Con elementos' : 'Falta CTA',
      alert: 'Inserta enlaces internos, infografías o un botón CTA.',
    },
  ]

  const hubSpotScore = checks.reduce((acc, c) => acc + (c.passed ? c.weight : 0), 0)

  return (
    <aside className="w-full space-y-3.5 font-sans shrink-0">
      {/* Selector de Pestañas del Inspector con Botón de Cierre Integrado */}
      <div className="flex items-center gap-1.5">
        {onCloseSidebar && (
          <button
            type="button"
            onClick={onCloseSidebar}
            className="p-2 rounded-xl border border-line bg-surface-muted hover:bg-white text-muted hover:text-primary transition-all cursor-pointer shrink-0 shadow-2xs"
            title="Ocultar panel lateral de ajustes"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        )}

        <div className="flex-1 flex bg-surface-muted p-1 rounded-xl border border-line">
          <button
            type="button"
            onClick={() => setActiveSidebarTab('settings')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSidebarTab === 'settings'
                ? 'bg-white text-primary shadow-xs font-bold'
                : 'text-muted hover:text-primary'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Ajustes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSidebarTab('seo')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSidebarTab === 'seo'
                ? 'bg-white text-primary shadow-xs font-bold'
                : 'text-muted hover:text-primary'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-muted" />
            <span>HubSpot ({hubSpotScore}%)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSidebarTab('notes')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSidebarTab === 'notes'
                ? 'bg-white text-primary shadow-xs font-bold'
                : 'text-muted hover:text-primary'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Notas</span>
          </button>
        </div>
      </div>

      {activeSidebarTab === 'settings' && (
        <>
          {/* 1. Panel de Publicación & Acciones */}
          <div className="bg-white border border-line rounded-xl p-4 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Publicación
              </span>
              <div className="flex items-center gap-1.5">
                {isSaving ? (
                  <span className="text-xs font-bold text-accent animate-pulse">Guardando...</span>
                ) : isSaved ? (
                  <span className="text-xs font-bold text-success flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Guardado
                  </span>
                ) : (
                  <span className="text-xs text-muted-light font-medium">Sincronizado</span>
                )}
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onPublish}
                className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-bold py-2.5 px-4 rounded-lg text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{status === 'publicado' ? 'Actualizar Artículo' : 'Publicar Ahora'}</span>
              </button>

              <button
                type="button"
                onClick={onSaveDraft}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#24262e] hover:bg-[#2f323c] text-white font-bold py-2.5 px-4 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Borrador</span>
              </button>
            </div>

            {/* Metadatos del Estado */}
            <div className="pt-2 border-t border-line space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted font-medium">Estado actual:</span>
                <span
                  className={`font-semibold capitalize px-2 py-0.5 rounded text-[11px] ${
                    status === 'publicado'
                      ? 'bg-success/15 text-success'
                      : status === 'borrador'
                      ? 'bg-amber-500/15 text-amber-700'
                      : 'bg-muted/15 text-muted'
                  }`}
                >
                  {status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Tiempo lectura:
                </span>
                <span className="font-semibold text-primary">~{readingTime} min ({wordCount} pal.)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted font-medium flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Base de datos:
                </span>
                <span className="font-semibold text-primary font-mono text-[11px]">
                  {isCloudConnected ? 'Cloud PostgreSQL' : 'Local IndexedDB'}
                </span>
              </div>
            </div>

            {isExisting && (
              <div className="pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={onArchive}
                  className="w-full text-left text-xs font-semibold text-muted hover:text-danger flex items-center justify-between py-1 transition-colors cursor-pointer"
                >
                  <span>{status === 'archivado' ? 'Desarchivar artículo' : 'Archivar este artículo'}</span>
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 2. Categoría Oficial */}
          <div className="bg-white border border-line rounded-xl p-4 shadow-xs space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted block">
              Categoría
            </span>
            <CategoryPicker
              value={category}
              onChange={onCategoryChange}
            />
          </div>

          {/* 3. Diseño de Cabecera Oficial HubSpot */}
          <div className="bg-white border border-line rounded-xl p-4 shadow-xs space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted block">
              Diseño de Cabecera
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onHeaderLayoutChange && onHeaderLayoutChange('split')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                  headerLayout === 'split'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-line bg-surface-muted text-muted hover:text-primary'
                }`}
              >
                <span className="text-xs block">◫ 2 Columnas</span>
                <span className="text-[10px] font-normal text-muted-light block">Estilo HubSpot Hero</span>
              </button>

              <button
                type="button"
                onClick={() => onHeaderLayoutChange && onHeaderLayoutChange('banner')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                  headerLayout === 'banner'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-line bg-surface-muted text-muted hover:text-primary'
                }`}
              >
                <span className="text-xs block">▭ Panorámica</span>
                <span className="text-[10px] font-normal text-muted-light block">Foto superior full</span>
              </button>
            </div>
          </div>

          {/* 4. Metadescripción (Extracto SEO) */}
          <div className="bg-white border border-line rounded-xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Metadescripción (Extracto)
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  hasExcerptLength ? 'text-success' : excerpt.length > 165 ? 'text-danger' : 'text-muted'
                }`}
              >
                {excerpt.length} / 160
              </span>
            </div>
            <textarea
              rows={3}
              value={excerpt}
              onChange={e => onExcerptChange(e.target.value)}
              placeholder="Resumen persuasivo de 120 a 160 caracteres para Google y portada..."
              className="w-full bg-surface-muted border border-line rounded-lg p-2.5 text-xs text-primary focus:outline-none focus:border-accent resize-none leading-relaxed"
            />
            {excerpt.length > 0 && !hasExcerptLength && (
              <p className="text-[11px] text-amber-600 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                {excerpt.length < 120 ? 'Agrega un poco más para completar el snippet de Google.' : 'Supera los 160 caracteres; Google lo recortará.'}
              </p>
            )}
          </div>

          {/* 5. URL / Slug SEO */}
          <div className="bg-white border border-line rounded-xl p-4 shadow-xs space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted block">
              URL / Slug (Sin números)
            </span>
            <div className="flex items-center bg-surface-muted border border-line rounded-lg px-2.5 py-1.5 text-xs">
              <span className="text-muted-light select-none font-mono">/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={e => onSlugChange(slugify(e.target.value))}
                placeholder={slugify(title) || 'tu-post'}
                className="flex-1 bg-transparent focus:outline-none ml-0.5 text-primary font-bold"
              />
            </div>
            {!hasUrlNoNumbers && (
              <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> HubSpot recomienda quitar números de la URL.
              </p>
            )}
          </div>
        </>
      )}

      {activeSidebarTab === 'seo' && (
        <div className="bg-white border border-line rounded-xl p-4 shadow-xs space-y-4">
          {/* Tarjeta de Score HubSpot */}
          <div className="p-3.5 rounded-xl bg-[#fafafc] border border-line space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onOpenQuickRules}
                className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 hover:text-accent cursor-pointer transition-colors"
                title="Ver guía de las 11 normas de HubSpot"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Score HubSpot</span>
              </button>
              <span
                className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
                  hubSpotScore >= 80
                    ? 'bg-success text-white'
                    : hubSpotScore >= 50
                    ? 'bg-warning text-white'
                    : 'bg-danger text-white'
                }`}
              >
                {hubSpotScore} / 100
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  hubSpotScore >= 80 ? 'bg-success' : hubSpotScore >= 50 ? 'bg-warning' : 'bg-danger'
                }`}
                style={{ width: `${hubSpotScore}%` }}
              />
            </div>
          </div>

          {/* 🔍 Detector y Navegador Inteligente de Palabra Clave Long-Tail */}
          <div className="p-3.5 rounded-xl border border-line bg-[#fafafc] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-accent" /> Palabra Clave Long-Tail
              </span>
              <span className="text-[10px] font-mono text-muted-light">1 por post</span>
            </div>

            <div className="relative flex items-center gap-1">
              <input
                type="text"
                value={localKeyword}
                onChange={e => {
                  setLocalKeyword(e.target.value)
                  if (onFocusKeywordChange) {
                    onFocusKeywordChange(e.target.value)
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (e.shiftKey) {
                      handlePrevMatch()
                    } else {
                      handleNextMatch()
                    }
                  }
                }}
                placeholder="Ej: habilidades para trabajar con IA"
                className="w-full bg-white border border-line rounded-lg px-3 py-1.5 text-xs text-primary focus:outline-none focus:border-accent"
              />

              {/* Botones de Navegación entre Ocurrencias con Flechas */}
              {kw && matchNav.total > 0 && (
                <div className="flex items-center gap-0.5 shrink-0 bg-white border border-line rounded-lg p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={handlePrevMatch}
                    className="p-1 text-muted hover:text-primary hover:bg-surface-muted rounded cursor-pointer transition-colors"
                    title="Coincidencia anterior (Shift + Enter)"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMatch}
                    className="p-1 text-muted hover:text-primary hover:bg-surface-muted rounded cursor-pointer transition-colors"
                    title="Coincidencia siguiente (Enter)"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {kw ? (
              <div className="space-y-2 pt-1 border-t border-line/60">
                {/* Semáforo de Densidad & Navegador de Coincidencias */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted font-medium">Presencia en texto:</span>
                  <div className="flex items-center gap-1.5">
                    {matchNav.total > 0 && (
                      <span className="text-[11px] font-mono text-accent font-bold bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                        {matchNav.current} de {matchNav.total}
                      </span>
                    )}
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isKwStuffing
                          ? 'bg-danger text-white'
                          : isKwOptimal
                          ? 'bg-success/15 text-success'
                          : 'bg-amber-500/15 text-amber-700'
                      }`}
                    >
                      {kwCount} {kwCount === 1 ? 'mención' : 'menciones'} ({kwDensity}%)
                    </span>
                  </div>
                </div>

                {isKwStuffing && (
                  <p className="text-[11px] text-danger font-medium flex items-start gap-1 leading-tight bg-danger/5 p-2 rounded-lg border border-danger/20">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <strong>¡Alerta de Saturación!</strong> Superas el 2.8% de densidad. Usa sinónimos para evitar penalización de Google.
                  </p>
                )}

                {isKwOptimal && (
                  <p className="text-[11px] text-success font-medium flex items-center gap-1 leading-tight">
                    <Check className="w-3.5 h-3.5 shrink-0" /> Densidad óptima recomendada por HubSpot (1% a 2.5%).
                  </p>
                )}

                {isKwLow && (
                  <p className="text-[11px] text-amber-700 leading-tight">
                    Aparece pocas veces en el cuerpo. Procura incluirla en el título o un H2.
                  </p>
                )}

                {/* Checklist de Ubicación Flexible de Keyword */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                  <span className={`flex items-center gap-1 ${isKwInTitle ? 'text-success font-bold' : 'text-muted-light'}`}>
                    {isKwInTitle ? '✓' : '✕'} En Título
                  </span>
                  <span className={`flex items-center gap-1 ${isKwInSlug ? 'text-success font-bold' : 'text-muted-light'}`}>
                    {isKwInSlug ? '✓' : '✕'} En URL
                  </span>
                  <span className={`flex items-center gap-1 ${isKwInExcerpt ? 'text-success font-bold' : 'text-muted-light'}`}>
                    {isKwInExcerpt ? '✓' : '✕'} En Extracto
                  </span>
                  <span className={`flex items-center gap-1 ${isKwInH2 ? 'text-success font-bold' : 'text-muted-light'}`}>
                    {isKwInH2 ? '✓' : '✕'} En Subtítulo H2
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-muted-light leading-tight">
                Escribe tu palabra clave para auditar saturación, términos y navegar coincidencias.
              </p>
            )}
          </div>

          {/* Checklist de Criterios Oficiales HubSpot */}
          <div className="space-y-2">
            {checks.map((c, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-line bg-[#fafafc] hover:bg-white transition-colors space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    {c.passed ? (
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                    )}
                    <span>{c.label}</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      c.passed ? 'bg-success/15 text-success' : 'bg-surface-muted text-muted'
                    }`}
                  >
                    {c.badge}
                  </span>
                </div>

                {!c.passed && (
                  <p className="text-[11px] text-muted leading-tight pl-5">
                    {c.alert}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Botón Integrado: 11 Normas Oficiales HubSpot */}
          {onOpenQuickRules && (
            <button
              type="button"
              onClick={onOpenQuickRules}
              className="w-full inline-flex items-center justify-between p-3 rounded-xl border border-line bg-surface-muted hover:bg-white text-xs font-bold text-primary transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                <span>Ver las 11 Normas Oficiales HubSpot</span>
              </div>
              <span className="text-[10px] font-semibold text-muted bg-white px-2 py-0.5 rounded border border-line">
                Guía
              </span>
            </button>
          )}
        </div>
      )}

      {activeSidebarTab === 'notes' && (
        <div className="bg-white border border-line rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-accent" /> Notas Editoriales Internas
            </span>
            <span className="text-[10px] font-semibold text-muted-light bg-surface-muted px-2 py-0.5 rounded border border-line">
              Privado
            </span>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Anotaciones visibles solo para el equipo de redactores y editores de Qaway Lab (no se publican en la web).
          </p>

          <textarea
            rows={8}
            value={internalNotes}
            onChange={e => onNotesChange && onNotesChange(e.target.value)}
            placeholder="Ej: Revisado por Marketing. Falta agregar el link de descarga del PDF..."
            className="w-full bg-surface-muted border border-line rounded-lg p-3 text-xs text-primary leading-relaxed focus:outline-none focus:border-accent resize-none font-sans"
          />
        </div>
      )}
    </aside>
  )
}
