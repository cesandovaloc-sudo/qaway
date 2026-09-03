import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Search,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Compass,
  Layers,
  Sparkles,
  PenTool,
  Cpu,
  Palette,
  FolderKanban,
  BookOpen,
  Globe,
  Shield,
  ExternalLink,
  Sliders,
  ChevronRight,
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import './rutas.css'

import { hierarchicalRoutes, categoriesList } from '@/config/routesRegistry'


function getBadgeStyle(badgeType) {
  switch (badgeType) {
    case 'public':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'hub':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'demo':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'landing':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'area':
    default:
      return 'bg-zinc-100 text-zinc-700 border-zinc-200'
  }
}

// =========================================================================
// TARJETA DESPLEGABLE MINIMALISTA (ESTILO CLAUDE / ANTHROPIC DOCS)
// =========================================================================
function HierarchicalRouteCard({ item, isExpanded, onToggle, onCopy, copiedPath }) {
  const IconComponent = item.icon || Sparkles

  return (
    <div
      className={`rutas-card rounded-2xl border bg-white transition-all duration-200 ${
        isExpanded
          ? 'border-zinc-300 shadow-[0_10px_30px_rgba(0,0,0,0.06)]'
          : 'border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-zinc-300'
      }`}
    >
      {/* CABECERA MINIMALISTA DE LA TARJETA */}
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Lado izquierdo: Ícono + Título + Descripción + Badge */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="shrink-0 mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200/80">
            <IconComponent className="h-5 w-5 text-[#fe6612]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h2 className="text-[17px] sm:text-[18px] font-bold text-zinc-950 tracking-[-0.02em] truncate">
                {item.title}
              </h2>
              <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getBadgeStyle(item.badgeType)}`}>
                {item.badge}
              </span>
              <code className="hidden md:inline-block text-[11px] font-mono text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200/60">
                {item.path}
              </code>
            </div>

            <p className="text-[13.5px] leading-relaxed text-zinc-500 line-clamp-2 sm:line-clamp-1">
              {item.summary}
            </p>
          </div>
        </div>

        {/* Lado derecho: Botón directo + Control Desplegable */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 w-full sm:w-auto justify-between sm:justify-end">
          
          <Link
            to={item.path}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 transition-colors"
          >
            <span>Ir a la ruta</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#fe6612]" />
          </Link>

          <button
            type="button"
            onClick={onToggle}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isExpanded
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <span>{isExpanded ? 'Ocultar' : `Ver ${item.children.length} sub-rutas`}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>
        </div>

      </div>

      {/* PANEL DESPLEGABLE CON LAS SUB-RUTAS (HIJOS) */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-zinc-100 bg-zinc-50/70 rounded-b-2xl"
          >
            <div className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Sub-rutas de {item.title}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {item.children.length} rutas asociadas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {item.children.map((child) => (
                  <div
                    key={child.path + child.title}
                    className="flex flex-col justify-between rounded-xl border border-zinc-200/90 bg-white p-3.5 shadow-xs transition-all hover:border-[#fe6612]/40 hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[13.5px] font-bold text-zinc-900 tracking-[-0.01em]">
                          {child.title}
                        </span>
                        {child.tag && (
                          <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                            {child.tag}
                          </span>
                        )}
                      </div>

                      <p className="text-[12px] leading-relaxed text-zinc-500 mb-3">
                        {child.description}
                      </p>
                    </div>

                    {/* Fila de Path y Acciones */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100/80">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <code className="text-[11.5px] font-mono text-zinc-800 truncate">
                          {child.path}
                        </code>
                        <button
                          type="button"
                          onClick={(e) => onCopy(child.path, e)}
                          title="Copiar URL"
                          className="shrink-0 p-1 text-zinc-400 hover:text-[#fe6612] transition-colors"
                        >
                          {copiedPath === child.path ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <Link
                        to={child.path}
                        className="inline-flex items-center gap-1 text-[12px] font-bold text-[#fe6612] hover:text-[#e0550a] transition-colors shrink-0"
                      >
                        <span>Abrir</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// =========================================================================
// COMPONENTE PRINCIPAL
// =========================================================================
export default function RutasPage() {
  useSetNavbarVariant('transparent')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCards, setExpandedCards] = useState(() => ({}))
  const [copiedPath, setCopiedPath] = useState(null)

  const handleCopy = (path, e) => {
    e.preventDefault()
    e.stopPropagation()
    const fullUrl = `${window.location.origin}${path}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  // Filtrado jerárquico inteligente
  const filteredParents = useMemo(() => {
    return hierarchicalRoutes.filter((parent) => {
      const matchesCategory = activeCategory === 'Todos' || parent.category === activeCategory
      const q = searchQuery.toLowerCase().trim()

      if (!q) return matchesCategory

      const matchesParent =
        parent.title.toLowerCase().includes(q) ||
        parent.path.toLowerCase().includes(q) ||
        parent.summary.toLowerCase().includes(q) ||
        parent.category.toLowerCase().includes(q)

      const matchesAnyChild = parent.children.some(
        (child) =>
          child.title.toLowerCase().includes(q) ||
          child.path.toLowerCase().includes(q) ||
          child.description.toLowerCase().includes(q) ||
          (child.tag && child.tag.toLowerCase().includes(q))
      )

      return matchesCategory && (matchesParent || matchesAnyChild)
    })
  }, [activeCategory, searchQuery])

  // Conteo total de sub-rutas
  const totalSubRoutes = useMemo(() => {
    return hierarchicalRoutes.reduce((acc, curr) => acc + curr.children.length + 1, 0)
  }, [])

  const toggleCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const expandAll = () => {
    const allExpanded = {}
    hierarchicalRoutes.forEach((p) => {
      allExpanded[p.id] = true
    })
    setExpandedCards(allExpanded)
  }

  const collapseAll = () => {
    setExpandedCards({})
  }

  return (
    <main className="rutas-page">
      {/* ========================================================================= */}
      {/* HERO SECTION: ENCABEZADO CARBÓN DIFUMINADO ESTÉTICO */}
      {/* ========================================================================= */}
      <section className="rutas-hero border-b border-white/10">
        <div className="rutas-shell">
          <motion.div
            className="rutas-hero__center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Kicker en Cápsula translúcida */}
            <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[11px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm">
              <Compass className="w-3.5 h-3.5 text-[#fe6612]" />
              <span>/ Sistema de Rutas & Mandos</span>
            </div>

            {/* Título Principal */}
            <h1
              className="text-[clamp(2.4rem,4.2vw,3.6rem)] font-extrabold text-white leading-[1.12] tracking-[-0.03em] mb-4 text-balance"
              style={{ fontWeight: 800 }}
            >
              Directorio de Rutas<span className="text-[#fe6612]">.</span>
            </h1>

            {/* Bajada */}
            <p className="text-zinc-300 text-base sm:text-lg max-w-2xl leading-relaxed mb-7 text-balance font-normal">
              Estructura jerárquica con mandos superiores y sub-rutas segmentadas para navegación y pruebas del sistema.
            </p>

            {/* Buscador Integrado Centrado */}
            <div className="w-full max-w-xl">
              <div className="flex items-center gap-3 rounded-[12px] border border-white/20 bg-zinc-900/90 px-4 py-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-[#fe6612] focus-within:border-transparent">
                <Search className="h-5 w-5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por módulo, ruta padre o hijo (/blog, /editor, /hub)..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-bold text-zinc-400 hover:text-[#fe6612] transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Métricas rápidas */}
            <div className="mt-6 flex items-center gap-4 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#fe6612]" />
                <strong>{hierarchicalRoutes.length}</strong> mandos superiores
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-zinc-400" />
                <strong>{totalSubRoutes}</strong> rutas totales mapeadas
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BARRA DE PÍLDORAS / FILTROS (MANDOS SUPERIORES) */}
      {/* ========================================================================= */}
      <div id="rutas-listado" className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur-md py-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="rutas-shell flex items-center justify-between gap-4">
          
          {/* Lista de píldoras horizontal */}
          <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categoriesList.map((category) => {
              const isActive = activeCategory === category
              const count = category === 'Todos'
                ? hierarchicalRoutes.length
                : hierarchicalRoutes.filter((r) => r.category === category).length

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[12.5px] sm:text-[13px] font-semibold transition-all ${
                    isActive
                      ? 'bg-[#fe6612] text-white shadow-sm shadow-[#fe6612]/20'
                      : 'border border-black/10 bg-white text-[#191918] hover:border-[#fe6612]/40 hover:text-[#fe6612]'
                  }`}
                >
                  <span>{category}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-white/25 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Botones de control rápido */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={expandAll}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Desplegar todo
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Colapsar
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* LISTADO JERÁRQUICO DE TARJETAS MINIMALISTAS */}
      {/* ========================================================================= */}
      <section className="rutas-listing py-10 sm:py-12">
        <div className="rutas-shell">
          
          {filteredParents.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg font-bold text-zinc-900 mb-1">No se encontraron mandos superiores para tu búsqueda</p>
              <p className="text-sm text-zinc-500 mb-6">Prueba buscando otro término o selecciona "Todos".</p>
              <button
                type="button"
                onClick={() => { setActiveCategory('Todos'); setSearchQuery('') }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#fe6612] text-white text-xs font-bold hover:bg-[#e0550a] transition-all"
              >
                Ver todas las categorías
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredParents.map((parent) => (
                <HierarchicalRouteCard
                  key={parent.id}
                  item={parent}
                  isExpanded={Boolean(expandedCards[parent.id] || searchQuery)}
                  onToggle={() => toggleCard(parent.id)}
                  onCopy={handleCopy}
                  copiedPath={copiedPath}
                />
              ))}
            </div>
          )}

        </div>
      </section>
    </main>
  )
}
