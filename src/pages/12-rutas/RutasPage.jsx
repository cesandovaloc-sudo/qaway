import { useState, useMemo, useEffect } from 'react'
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
  Terminal,
  Code2,
  RotateCcw,
  CheckCircle2,
  X,
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import './rutas.css'
import { hierarchicalRoutes, categoriesList } from '@/config/routesRegistry'
import { publicPaths, routeVisibility } from '@/config/siteVisibility'

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
// COMPONENTE SWITCH TOGGLE APPLE STYLE
// =========================================================================
function SwitchToggle({ isChecked, onChange, label, size = 'normal' }) {
  return (
    <div
      role="switch"
      aria-checked={isChecked}
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation()
        onChange(!isChecked)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.stopPropagation()
          onChange(!isChecked)
        }
      }}
      title={isChecked ? 'Aprobada para Producción (Dist)' : 'Solo visible en Local (Dev)'}
      className={`qw-switch ${isChecked ? 'qw-switch--checked' : ''} ${size === 'small' ? 'scale-90 origin-right' : ''}`}
    >
      <span className="qw-switch__thumb" />
    </div>
  )
}

// =========================================================================
// TARJETA DESPLEGABLE CON SWITCH DE PRODUCCIÓN
// =========================================================================
function HierarchicalRouteCard({
  item,
  isExpanded,
  onToggle,
  onCopy,
  copiedPath,
  isApproved,
  onToggleApproval,
  isChildApproved,
  onToggleChildApproval,
}) {
  const IconComponent = item.icon || Sparkles

  return (
    <div
      className={`rutas-card rounded-2xl border bg-white transition-all duration-200 ${
        isApproved
          ? 'border-emerald-200/90 shadow-[0_4px_16px_rgba(16,185,129,0.06)]'
          : 'border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
      } ${
        isExpanded
          ? 'border-zinc-300 shadow-[0_10px_30px_rgba(0,0,0,0.06)]'
          : 'hover:border-zinc-300'
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
              {isApproved && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>En Producción (Dist)</span>
                </span>
              )}
            </div>

            <p className="text-[13.5px] leading-relaxed text-zinc-500 line-clamp-2 sm:line-clamp-1">
              {item.summary}
            </p>
          </div>
        </div>

        {/* Lado derecho: Switch de Producción + Botón directo + Control Desplegable */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* Switch de Producción */}
          <div className="flex items-center gap-2 pr-2 sm:border-r border-zinc-200/80">
            <span className="text-[11px] font-semibold text-zinc-600 hidden sm:inline">
              {isApproved ? 'Dist activo' : 'Solo local'}
            </span>
            <SwitchToggle
              isChecked={isApproved}
              onChange={() => onToggleApproval(item.path)}
              label={item.title}
            />
          </div>

          <Link
            to={item.path}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 transition-colors"
          >
            <span>Abrir</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#fe6612]" />
          </Link>

          {item.children && item.children.length > 0 && (
            <button
              type="button"
              onClick={onToggle}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isExpanded
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <span>{isExpanded ? 'Ocultar' : `Sub-rutas (${item.children.length})`}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </button>
          )}
        </div>

      </div>

      {/* PANEL DESPLEGABLE CON LAS SUB-RUTAS (HIJOS) */}
      <AnimatePresence initial={false}>
        {isExpanded && item.children && item.children.length > 0 && (
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
                {item.children.map((child) => {
                  const childApproved = isChildApproved(child.path)

                  return (
                    <div
                      key={child.path + child.title}
                      className={`flex flex-col justify-between rounded-xl border bg-white p-3.5 transition-all ${
                        childApproved
                          ? 'border-emerald-300 shadow-xs ring-1 ring-emerald-500/10'
                          : 'border-zinc-200/90 hover:border-[#fe6612]/40 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[13.5px] font-bold text-zinc-900 tracking-[-0.01em] truncate">
                              {child.title}
                            </span>
                            {child.tag && (
                              <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded shrink-0">
                                {child.tag}
                              </span>
                            )}
                          </div>

                          {/* Switch individual para la sub-ruta */}
                          <div className="shrink-0 flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-zinc-400 hidden sm:inline">
                              {childApproved ? 'Dist' : 'Local'}
                            </span>
                            <SwitchToggle
                              size="small"
                              isChecked={childApproved}
                              onChange={() => onToggleChildApproval(child.path)}
                              label={child.title}
                            />
                          </div>
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
                  )
                })}
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
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'approved' | 'local'
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCards, setExpandedCards] = useState(() => ({}))
  const [copiedPath, setCopiedPath] = useState(null)
  const [copiedAction, setCopiedAction] = useState(null)
  const [showCodeModal, setShowCodeModal] = useState(false)

  // Estado de rutas aprobadas para producción (Persistente en localStorage)
  const [approvedPaths, setApprovedPaths] = useState(() => {
    try {
      const saved = localStorage.getItem('qaway_dist_approved_paths')
      if (saved) {
        return new Set(JSON.parse(saved))
      }
    } catch {
      // ignore
    }
    return new Set(publicPaths || ['/', '/proyectos', '/landings/desarrollo-web'])
  })

  // Guardar en localStorage ante cualquier cambio
  useEffect(() => {
    try {
      localStorage.setItem('qaway_dist_approved_paths', JSON.stringify(Array.from(approvedPaths)))
    } catch {
      // ignore
    }
  }, [approvedPaths])

  const togglePathApproval = (path) => {
    setApprovedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const resetToDefault = () => {
    setApprovedPaths(new Set(publicPaths || ['/', '/proyectos', '/landings/desarrollo-web']))
  }

  const handleCopy = (path, e) => {
    e.preventDefault()
    e.stopPropagation()
    const fullUrl = `${window.location.origin}${path}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  // Generar código para siteVisibility.js
  const generatedCode = useMemo(() => {
    const pathsArray = Array.from(approvedPaths).sort()
    const pathsFormatted = pathsArray.map((p) => `  '${p}',`).join('\n')

    // Detectar qué módulos principales están activos
    const hasInicio = approvedPaths.has('/')
    const hasEstudio = Array.from(approvedPaths).some((p) => p.startsWith('/estudio'))
    const hasProyectos = Array.from(approvedPaths).some((p) => p.startsWith('/proyectos'))
    const hasSistemas = Array.from(approvedPaths).some((p) => p.startsWith('/sistemas-digitales'))
    const hasAcademy = Array.from(approvedPaths).some((p) => p.startsWith('/academy'))
    const hasHub = Array.from(approvedPaths).some((p) => p.startsWith('/hub'))
    const hasRecursos = Array.from(approvedPaths).some((p) => p.startsWith('/recursos'))
    const hasBlog = Array.from(approvedPaths).some((p) => p.startsWith('/blog'))
    const hasLandings = Array.from(approvedPaths).some((p) => p.startsWith('/landings'))

    return `const routeVisibility = {
  inicio: ${hasInicio},
  estudio: ${hasEstudio},
  proyectos: ${hasProyectos},
  brief: false,
  sistemasDigitales: ${hasSistemas},
  academy: ${hasAcademy},
  hub: ${hasHub},
  recursos: ${hasRecursos},
  blog: ${hasBlog},
  landings: ${hasLandings},
  auth: false,
  pruebas: false,
}

const publicPathAllowList = new Set([
${pathsFormatted}
])`
  }, [approvedPaths])

  // Generar comando PowerShell de una sola línea
  const powershellCommand = useMemo(() => {
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}:${pad(now.getMinutes())}`
    return `npm run build; git add .; git commit -m "${dateStr}_A22@@@_deploy-visibilidad-paginas"; git push origin main-web`
  }, [])

  const copyConfigCode = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopiedAction('config')
    setTimeout(() => setCopiedAction(null), 2500)
  }

  const copyPowerShellCmd = () => {
    navigator.clipboard.writeText(powershellCommand)
    setCopiedAction('ps')
    setTimeout(() => setCopiedAction(null), 2500)
  }

  // Filtrado jerárquico inteligente (Categoría + Estado + Búsqueda)
  const filteredParents = useMemo(() => {
    return hierarchicalRoutes.filter((parent) => {
      const matchesCategory = activeCategory === 'Todos' || parent.category === activeCategory
      const isParentApproved = approvedPaths.has(parent.path)
      const hasAnyChildApproved = parent.children && parent.children.some((c) => approvedPaths.has(c.path))
      const isCardApproved = isParentApproved || hasAnyChildApproved

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'approved' && isCardApproved) ||
        (statusFilter === 'local' && !isCardApproved)

      const q = searchQuery.toLowerCase().trim()
      if (!q) return matchesCategory && matchesStatus

      const matchesParent =
        parent.title.toLowerCase().includes(q) ||
        parent.path.toLowerCase().includes(q) ||
        parent.summary.toLowerCase().includes(q) ||
        parent.category.toLowerCase().includes(q)

      const matchesAnyChild = parent.children && parent.children.some(
        (child) =>
          child.title.toLowerCase().includes(q) ||
          child.path.toLowerCase().includes(q) ||
          child.description.toLowerCase().includes(q) ||
          (child.tag && child.tag.toLowerCase().includes(q))
      )

      return matchesCategory && matchesStatus && (matchesParent || matchesAnyChild)
    })
  }, [activeCategory, statusFilter, searchQuery, approvedPaths])

  // Conteo total de sub-rutas
  const totalSubRoutes = useMemo(() => {
    return hierarchicalRoutes.reduce((acc, curr) => acc + (curr.children ? curr.children.length : 0) + 1, 0)
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
    <main className="rutas-page pb-32">
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
              <Sliders className="w-3.5 h-3.5 text-[#fe6612]" />
              <span>/ Consola de Visibilidad & Rutas</span>
            </div>

            {/* Título Principal */}
            <h1
              className="text-[clamp(2.4rem,4.2vw,3.6rem)] font-extrabold text-white leading-[1.12] tracking-[-0.03em] mb-4 text-balance"
              style={{ fontWeight: 800 }}
            >
              Control de Rutas & Producción<span className="text-[#fe6612]">.</span>
            </h1>

            {/* Bajada */}
            <p className="text-zinc-300 text-base sm:text-lg max-w-2xl leading-relaxed mb-7 text-balance font-normal">
              Activa o desactiva con switches qué páginas están aprobadas para salir a producción en Hostinger (<code className="font-mono text-xs text-[#fe6612] bg-black/40 px-2 py-0.5 rounded">dist</code>) sin alterar tu entorno local.
            </p>

            {/* Buscador Integrado Centrado */}
            <div className="w-full max-w-xl">
              <div className="flex items-center gap-3 rounded-[12px] border border-white/20 bg-zinc-900/90 px-4 py-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-[#fe6612] focus-within:border-transparent">
                <Search className="h-5 w-5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por módulo, ruta padre o hijo (/blog, /editor, /vallet)..."
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
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#fe6612]" />
                <strong>{hierarchicalRoutes.length}</strong> mandos superiores
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-zinc-400" />
                <strong>{totalSubRoutes}</strong> rutas mapeadas
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <strong>{approvedPaths.size}</strong> aprobadas para producción (Dist)
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BARRA DE PÍLDORAS Y FILTRO DE ESTADO DE PRODUCCIÓN */}
      {/* ========================================================================= */}
      <div id="rutas-listado" className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur-md py-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="rutas-shell flex flex-col md:flex-row md:items-center justify-between gap-4">
          
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

          {/* Filtro por estado de Producción + Botones de colapsar */}
          <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-end">
            
            <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${statusFilter === 'all' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('approved')}
                className={`px-2.5 py-1 rounded-md transition-all ${statusFilter === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                En Producción ({approvedPaths.size})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('local')}
                className={`px-2.5 py-1 rounded-md transition-all ${statusFilter === 'local' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                Solo Local
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-1.5">
              <button
                type="button"
                onClick={expandAll}
                className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Desplegar
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Colapsar
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* LISTADO JERÁRQUICO DE TARJETAS CON SWITCHES */}
      {/* ========================================================================= */}
      <section className="rutas-listing py-10 sm:py-12">
        <div className="rutas-shell">
          
          {filteredParents.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg font-bold text-zinc-900 mb-1">No se encontraron rutas con los filtros aplicados</p>
              <p className="text-sm text-zinc-500 mb-6">Prueba seleccionando "Todas" o limpiando el término de búsqueda.</p>
              <button
                type="button"
                onClick={() => { setActiveCategory('Todos'); setStatusFilter('all'); setSearchQuery('') }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#fe6612] text-white text-xs font-bold hover:bg-[#e0550a] transition-all"
              >
                Restablecer filtros
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
                  isApproved={approvedPaths.has(parent.path)}
                  onToggleApproval={togglePathApproval}
                  isChildApproved={(childPath) => approvedPaths.has(childPath)}
                  onToggleChildApproval={togglePathApproval}
                />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* BARRA FLOTANTE DE CONTROL INFERIOR */}
      {/* ========================================================================= */}
      <div className="qw-floating-control-bar flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Indicador de estado en vivo */}
        <div className="flex items-center gap-3">
          <div className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">
              {approvedPaths.size} rutas aprobadas para Producción (Dist)
            </p>
            <p className="text-[11px] text-zinc-400">
              Sincronizado con tu almacenamiento local
            </p>
          </div>
        </div>

        {/* Botones de acción rápida */}
        <div className="flex items-center gap-2 flex-wrap">
          
          <button
            type="button"
            onClick={() => setShowCodeModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all"
          >
            <Code2 className="w-3.5 h-3.5 text-[#fe6612]" />
            <span>Ver Configuración</span>
          </button>

          <button
            type="button"
            onClick={copyConfigCode}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#fe6612] hover:bg-[#e0550a] text-white shadow-md shadow-[#fe6612]/25 transition-all active:translate-y-px"
          >
            {copiedAction === 'config' ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>¡Código Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-white" />
                <span>Copiar para siteVisibility.js</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={copyPowerShellCmd}
            title="Copiar comando de terminal de 1 línea"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all"
          >
            {copiedAction === 'ps' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>¡Comando Copiado!</span>
              </>
            ) : (
              <>
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                <span>PowerShell Cmd</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetToDefault}
            title="Restablecer a la configuración del archivo siteVisibility.js actual"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL DE CÓDIGO GENERADO */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showCodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
                <div className="flex items-center gap-2.5">
                  <Code2 className="w-5 h-5 text-[#fe6612]" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Código listo para siteVisibility.js</h3>
                    <p className="text-[11px] text-zinc-400">Generado a partir de tus switches seleccionados</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto font-mono text-xs text-zinc-300 bg-zinc-950/90 leading-relaxed">
                <pre className="whitespace-pre-wrap">{generatedCode}</pre>
              </div>

              <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between gap-3">
                <span className="text-xs text-zinc-400 font-mono">
                  {approvedPaths.size} rutas en lista blanca
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCodeModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={copyConfigCode}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#fe6612] hover:bg-[#e0550a] text-white transition-all shadow-md shadow-[#fe6612]/20"
                  >
                    {copiedAction === 'config' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar código completo</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  )
}

