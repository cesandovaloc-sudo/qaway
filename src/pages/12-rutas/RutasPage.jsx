import { useState, useMemo, useEffect, useRef } from 'react'
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
  Zap,
  Flame,
  LayoutGrid,
  Clock,
  Briefcase,
  GraduationCap,
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import './rutas.css'
import { hierarchicalRoutes, categoriesList } from '@/config/routesRegistry'
import { publicPaths } from '@/config/siteVisibility'

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
// TARJETA DE SUITE MULTI-PÁGINA (ANIDADA CON SUB-PÁGINAS)
// =========================================================================
function SuiteProjectItem({
  child,
  isChildApproved,
  onToggleChildApproval,
  onToggleMultiApproval,
  onCopy,
  copiedPath,
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const subPages = child.subPages || []
  const allApproved = subPages.length > 0 && subPages.every((sp) => isChildApproved(sp.path))
  const someApproved = subPages.some((sp) => isChildApproved(sp.path))

  return (
    <div
      className={`md:col-span-2 rounded-xl border bg-gradient-to-b from-white to-zinc-50/50 p-4 transition-all ${
        allApproved
          ? 'border-emerald-300 shadow-xs ring-1 ring-emerald-500/15'
          : someApproved
          ? 'border-amber-300 shadow-xs'
          : 'border-zinc-200/90 hover:border-[#fe6612]/40 hover:shadow-xs'
      }`}
    >
      {/* Encabezado de la Suite */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/70">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[14px] font-bold text-zinc-950 tracking-[-0.01em]">
                {child.title}
              </span>
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border bg-orange-50 text-[#fe6612] border-orange-200">
                {child.suiteBadge || `Suite ${subPages.length} páginas`}
              </span>
              {child.tag && (
                <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-1.5 py-0.2 rounded shrink-0">
                  {child.tag}
                </span>
              )}
            </div>
            <p className="text-[12px] leading-relaxed text-zinc-500 line-clamp-2">
              {child.description}
            </p>
          </div>
        </div>

        {/* Controles de la Suite: Master Switch + Accordion Toggle */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-zinc-400">
              {allApproved ? 'Toda la Suite en Dist' : someApproved ? 'Parcial' : 'Local'}
            </span>
            <SwitchToggle
              size="small"
              isChecked={allApproved}
              onChange={() => onToggleMultiApproval(subPages.map((sp) => sp.path))}
              label={`Toda la suite ${child.title}`}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isExpanded
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <span>{isExpanded ? 'Ocultar páginas' : `Ver páginas (${subPages.length})`}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
          </button>
        </div>
      </div>

      {/* Lista de Páginas Anidadas de la Suite */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden pt-3 space-y-2"
          >
            {subPages.map((sub) => {
              const isSubApproved = isChildApproved(sub.path)
              return (
                <div
                  key={sub.path + sub.title}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border bg-white p-2.5 sm:px-3.5 sm:py-2 transition-all ${
                    isSubApproved
                      ? 'border-emerald-300 ring-1 ring-emerald-500/10'
                      : 'border-zinc-200/80 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12.5px] font-bold text-zinc-900 truncate">
                        {sub.title}
                      </span>
                      {sub.tag && (
                        <span className="text-[9.5px] font-semibold text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded">
                          {sub.tag}
                        </span>
                      )}
                      <code className="text-[10.5px] font-mono text-zinc-500 hidden md:inline">
                        {sub.path}
                      </code>
                    </div>
                    {sub.description && (
                      <p className="text-[11.5px] text-zinc-500 line-clamp-1 mt-0.5">
                        {sub.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                    <button
                      type="button"
                      onClick={(e) => onCopy(sub.path, e)}
                      title="Copiar URL"
                      className="p-1 text-zinc-400 hover:text-[#fe6612] transition-colors"
                    >
                      {copiedPath === sub.path ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[9.5px] font-semibold text-zinc-400">
                        {isSubApproved ? 'Dist' : 'Local'}
                      </span>
                      <SwitchToggle
                        size="small"
                        isChecked={isSubApproved}
                        onChange={() => onToggleChildApproval(sub.path)}
                        label={sub.title}
                      />
                    </div>

                    <Link
                      to={sub.path}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#fe6612] hover:text-[#e0550a] transition-colors px-2 py-0.5 rounded-md hover:bg-orange-50"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// =========================================================================
// TARJETA DE RUTA CON SWITCH DE PRODUCCIÓN Y SUB-RUTAS
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
  onToggleMultiApproval,
}) {
  const IconComponent = item.icon || Sparkles

  return (
    <div
      className={`rounded-2xl border bg-white transition-all duration-200 ${
        isApproved
          ? 'border-emerald-300 shadow-[0_4px_16px_rgba(16,185,129,0.06)] ring-1 ring-emerald-500/15'
          : 'border-zinc-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-zinc-300'
      } ${
        isExpanded ? 'shadow-[0_10px_30px_rgba(0,0,0,0.06)]' : ''
      }`}
    >
      {/* CABECERA DE LA TARJETA */}
      <div className="p-5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Lado izquierdo: Ícono + Título + Descripción + Badge */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="shrink-0 mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200/80">
            <IconComponent className="h-5 w-5 text-[#fe6612]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-[16px] sm:text-[17px] font-bold text-zinc-950 tracking-[-0.02em] truncate">
                {item.title}
              </h3>
              <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeStyle(item.badgeType)}`}>
                {item.badge}
              </span>
              <code className="hidden xl:inline-block text-[11px] font-mono text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200/60">
                {item.path}
              </code>
            </div>

            <p className="text-[13px] leading-relaxed text-zinc-500 line-clamp-2 sm:line-clamp-1">
              {item.summary}
            </p>
          </div>
        </div>

        {/* Lado derecho: Controles en 2 Filas */}
        <div className="flex flex-col items-end gap-2.5 shrink-0 self-stretch sm:self-center justify-between sm:justify-center pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
          
          {/* Fila Superior: Switch de Producción (Dist) + Botón Desplegable */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-zinc-500">
                {isApproved ? 'Dist' : 'Local'}
              </span>
              <SwitchToggle
                isChecked={isApproved}
                onChange={() => onToggleApproval(item.path)}
                label={item.title}
              />
            </div>

            {item.children && item.children.length > 0 && (
              <button
                type="button"
                onClick={onToggle}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isExpanded
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <span>{isExpanded ? 'Ocultar' : `${item.children.length}`}</span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>
            )}
          </div>

          {/* Fila Inferior: Botón Abrir */}
          <div className="w-full flex justify-end">
            <Link
              to={item.path}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-xl text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-950 transition-colors w-full sm:w-auto"
            >
              <span>Abrir</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#fe6612]" />
            </Link>
          </div>

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
            <div className="p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Sub-rutas de {item.title}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {item.children.length} elementos asociados
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {item.children.map((child) => {
                  if (child.isSuite || (child.subPages && child.subPages.length > 0)) {
                    return (
                      <SuiteProjectItem
                        key={child.path + child.title}
                        child={child}
                        isChildApproved={isChildApproved}
                        onToggleChildApproval={onToggleChildApproval}
                        onToggleMultiApproval={onToggleMultiApproval}
                        onCopy={onCopy}
                        copiedPath={copiedPath}
                      />
                    )
                  }

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
                            <span className="text-[13px] font-bold text-zinc-900 tracking-[-0.01em] truncate">
                              {child.title}
                            </span>
                            {child.tag && (
                              <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-1.5 py-0.2 rounded shrink-0">
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

                        <p className="text-[12px] leading-relaxed text-zinc-500 mb-2.5">
                          {child.description}
                        </p>
                      </div>

                      {/* Fila de Path y Acciones */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100/80">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <code className="text-[11px] font-mono text-zinc-800 truncate">
                            {child.path}
                          </code>
                          <button
                            type="button"
                            onClick={(e) => onCopy(child.path, e)}
                            title="Copiar URL"
                            className="shrink-0 p-1 text-zinc-400 hover:text-[#fe6612] transition-colors"
                          >
                            {copiedPath === child.path ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        <Link
                          to={child.path}
                          className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#fe6612] hover:text-[#e0550a] transition-colors shrink-0"
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
// COMPONENTE PRINCIPAL REORGANIZADO
// =========================================================================
export default function RutasPage() {
  useSetNavbarVariant('transparent')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'approved' | 'local'
  const [sortBy, setSortBy] = useState('default') // 'default' | 'name' | 'routesCount'
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCards, setExpandedCards] = useState(() => ({}))
  const [copiedPath, setCopiedPath] = useState(null)
  const [copiedAction, setCopiedAction] = useState(null)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const searchInputRef = useRef(null)

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

  // Atajo de teclado (Cmd+K o Ctrl+K para enfocar el buscador)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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

  const toggleMultiPathsApproval = (paths, forceState = null) => {
    setApprovedPaths((prev) => {
      const next = new Set(prev)
      const allEnabled = paths.every((p) => next.has(p))
      const targetState = forceState !== null ? forceState : !allEnabled
      paths.forEach((p) => {
        if (targetState) {
          next.add(p)
        } else {
          next.delete(p)
        }
      })
      return next
    })
  }

  const resetToDefault = () => {
    setApprovedPaths(new Set(publicPaths || ['/', '/proyectos', '/landings/desarrollo-web']))
  }

  const selectAllPaths = () => {
    const all = new Set()
    hierarchicalRoutes.forEach((parent) => {
      all.add(parent.path)
      if (parent.children) {
        parent.children.forEach((child) => {
          all.add(child.path)
          if (child.subPages) {
            child.subPages.forEach((sub) => all.add(sub.path))
          }
        })
      }
    })
    setApprovedPaths(all)
  }

  const deselectAllPaths = () => {
    setApprovedPaths(new Set(['/']))
  }

  const handleCopy = (path, e) => {
    e.preventDefault()
    e.stopPropagation()
    const fullUrl = `${window.location.origin}${path}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  // Scroll suave al directorio de rutas
  const scrollToDirectory = (category = null) => {
    if (category) {
      setActiveCategory(category)
    }
    const element = document.getElementById('rutas-directorio')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Generar código para siteVisibility.js
  const generatedCode = useMemo(() => {
    const pathsArray = Array.from(approvedPaths).sort()
    const pathsFormatted = pathsArray.map((p) => `  '${p}',`).join('\n')

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

  // Comando PowerShell de 1 línea
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

  // Filtrado y ordenamiento de rutas
  const filteredParents = useMemo(() => {
    let result = hierarchicalRoutes.filter((parent) => {
      const matchesCategory = activeCategory === 'Todos' || parent.category === activeCategory
      const isParentApproved = approvedPaths.has(parent.path)
      const hasAnyChildApproved =
        parent.children &&
        parent.children.some((c) => {
          if (approvedPaths.has(c.path)) return true
          if (c.subPages && c.subPages.some((sub) => approvedPaths.has(sub.path))) return true
          return false
        })
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

      const matchesAnyChild =
        parent.children &&
        parent.children.some(
          (child) =>
            child.title.toLowerCase().includes(q) ||
            child.path.toLowerCase().includes(q) ||
            child.description.toLowerCase().includes(q) ||
            (child.tag && child.tag.toLowerCase().includes(q)) ||
            (child.subPages &&
              child.subPages.some(
                (sub) =>
                  sub.title.toLowerCase().includes(q) ||
                  sub.path.toLowerCase().includes(q) ||
                  sub.description.toLowerCase().includes(q) ||
                  (sub.tag && sub.tag.toLowerCase().includes(q))
              ))
        )

      return matchesCategory && matchesStatus && (matchesParent || matchesAnyChild)
    })

    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === 'routesCount') {
      result = [...result].sort((a, b) => (b.children?.length || 0) - (a.children?.length || 0))
    }

    return result
  }, [activeCategory, statusFilter, sortBy, searchQuery, approvedPaths])

  const totalSubRoutes = useMemo(() => {
    return hierarchicalRoutes.reduce((acc, curr) => {
      let count = 1 // parent
      if (curr.children) {
        curr.children.forEach((c) => {
          if (c.subPages && c.subPages.length > 0) {
            count += c.subPages.length
          } else {
            count += 1
          }
        })
      }
      return acc + count
    }, 0)
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

  // Tarjetas del Ecosistema (Sección 1)
  const ecosystemAreas = [
    {
      title: 'Estudio',
      desc: 'Estrategia, diseño, brief y construcción digital.',
      count: '7 rutas',
      category: 'Estudio',
      icon: Palette,
      gradient: 'from-zinc-100 to-zinc-200',
    },
    {
      title: 'Sistemas Digitales',
      desc: 'Soluciones para automatizar y escalar negocios.',
      count: '7 rutas',
      category: 'Sistemas Digitales',
      icon: Cpu,
      gradient: 'from-orange-50 to-orange-100',
      highlight: true,
    },
    {
      title: 'Proyectos',
      desc: 'Casos reales, suites inmobiliarias y arquitectura web.',
      count: '9 proyectos',
      category: 'Proyectos',
      icon: FolderKanban,
      gradient: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Blog',
      desc: 'Publicaciones editoriales, artículos y consola de redacción.',
      count: '9 rutas',
      category: 'Blog',
      icon: Sparkles,
      gradient: 'from-amber-50 to-amber-100',
    },
    {
      title: 'Recursos',
      desc: 'Guías PDF, optimizadores y plantillas de diseño.',
      count: '4 recursos',
      category: 'Recursos',
      icon: BookOpen,
      gradient: 'from-emerald-50 to-emerald-100',
    },
    {
      title: 'Academy',
      desc: 'Formación aplicada, metodologías y cursos.',
      count: '1 plataforma',
      category: 'Academy',
      icon: GraduationCap,
      gradient: 'from-purple-50 to-purple-100',
    },
    {
      title: 'Qaway Hub',
      desc: 'Operaciones, portal de cliente y herramientas internas.',
      count: '10 rutas',
      category: 'Qaway Hub',
      icon: Layers,
      gradient: 'from-zinc-100 to-zinc-200',
    },
    {
      title: 'Landings',
      desc: 'Embudos de captación publicitaria y ventas directas.',
      count: '6 landings',
      category: 'Landings',
      icon: Globe,
      gradient: 'from-purple-50 to-purple-100',
    },
  ]

  return (
    <main className="rutas-page pb-36">
      
      {/* ========================================================================= */}
      {/* SECCIÓN 1: HERO SOFISTICADO CON DOS COLUMNAS */}
      {/* ========================================================================= */}
      <section className="rutas-hero border-b border-white/10">
        <div className="rutas-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Columna Izquierda: Mensaje y Buscador */}
            <motion.div
              className="lg:col-span-8 flex flex-col items-start"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Kicker en Cápsula Blanca translúcida idéntica a Proyectos */}
              <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/30 bg-white/15 text-white text-[11px] font-bold uppercase tracking-widest backdrop-blur-xs shadow-xs">
                <span>/ Directorio & Control</span>
              </div>

              {/* Título Principal con escala y peso idéntico a Proyectos */}
              <h1
                className="text-[clamp(2.4rem,4vw,3.4rem)] font-extrabold text-white leading-[1.12] tracking-[-0.03em] mb-4 text-balance"
                style={{ fontWeight: 800 }}
              >
                Todo Qaway Lab <br className="hidden sm:inline" />
                <span className="text-[#fe6612]">en un solo lugar.</span>
              </h1>

              {/* Subtítulo idéntico a Proyectos */}
              <p className="text-white/90 text-base sm:text-lg max-w-2xl leading-relaxed mb-7 text-balance font-normal">
                Explora nuestras soluciones, herramientas, contenidos y proyectos, y encuentra el camino que necesitas.
              </p>

              {/* Buscador Integrado con Atajo de Teclado */}
              <div className="w-full max-w-2xl">
                <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-zinc-900/90 px-4 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-[#fe6612] focus-within:border-transparent">
                  <Search className="h-5 w-5 text-zinc-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar rutas, herramientas, proyectos o secciones..."
                    className="w-full bg-transparent text-[14.5px] text-white outline-none placeholder:text-zinc-500 font-medium"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-bold text-zinc-400 hover:text-[#fe6612] transition-colors p-1"
                    >
                      ✕
                    </button>
                  ) : (
                    <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-400">
                      <span>⌘</span>
                      <span>K</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Métricas del Hero */}
              <div className="mt-7 flex flex-wrap items-center gap-6 text-xs text-zinc-400">
                <span className="inline-flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-[#fe6612]" />
                  <strong className="text-zinc-200">8 áreas activas</strong>
                </span>
                <span className="text-zinc-600">•</span>
                <span className="inline-flex items-center gap-2">
                  <Compass className="w-4 h-4 text-zinc-400" />
                  <strong className="text-zinc-200">{totalSubRoutes} rutas totales</strong>
                </span>
                <span className="text-zinc-600">•</span>
                <span className="inline-flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <strong>{approvedPaths.size} en producción (Dist)</strong>
                </span>
              </div>
            </motion.div>

            {/* Columna Derecha: Tarjeta Visual Arquitectónica con Tipografía Editorial */}
            <motion.div
              className="lg:col-span-4 hidden lg:flex flex-col justify-between h-[340px] rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-7 shadow-2xl relative overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="space-y-3 relative z-10">
                <p className="text-[11px] uppercase tracking-[0.25em] text-[#fe6612] font-mono font-bold">
                  Manifiesto Editorial
                </p>
                <div className="space-y-1 text-2xl font-bold text-white tracking-tight leading-tight">
                  <p className="text-zinc-400">IDEAS</p>
                  <p className="text-white">SISTEMAS</p>
                  <p className="text-zinc-400">PERSONAS</p>
                  <p className="text-[#fe6612]">RESULTADOS</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 relative z-10 flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                  Tecnología con propósito
                </span>
                <span className="h-2 w-2 rounded-full bg-[#fe6612]"></span>
              </div>

              {/* Sombra de fondo ambiental */}
              <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#fe6612]/15 rounded-full blur-3xl pointer-events-none"></div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: EXPLORA POR ÁREA (NAVEGA EL ECOSISTEMA) */}
      {/* ========================================================================= */}
      <section className="py-14 bg-white border-b border-zinc-200/80">
        <div className="rutas-shell">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#fe6612] mb-1.5">
                Explora por área
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
                Navega el ecosistema<span className="text-[#fe6612]">.</span>
              </h2>
            </div>
            <p className="text-sm text-zinc-500 max-w-md">
              Cada área reúne secciones, herramientas y contenidos diseñados para ayudarte a avanzar.
            </p>
          </div>

          {/* Grid de 7 Tarjetas Visuales de Áreas (2 Filas con Mayor Ancho y Proporción) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ecosystemAreas.map((area) => {
              const AreaIcon = area.icon

              return (
                <div
                  key={area.title}
                  onClick={() => scrollToDirectory(area.category)}
                  className={`qw-ecosystem-card group ${area.highlight ? 'border-orange-200 ring-1 ring-[#fe6612]/20' : ''}`}
                >
                  {/* Encabezado visual de la tarjeta */}
                  <div className={`qw-ecosystem-card__img bg-gradient-to-br ${area.gradient} flex items-center justify-center p-5 transition-transform duration-500 group-hover:scale-105`}>
                    <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-zinc-900 border border-black/5">
                      <AreaIcon className="h-7 w-7 text-[#fe6612]" />
                    </div>
                  </div>

                  {/* Cuerpo de la tarjeta */}
                  <div className="qw-ecosystem-card__body p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-base font-bold text-zinc-950 mb-1 tracking-tight group-hover:text-[#fe6612] transition-colors truncate">
                        {area.title}
                      </h3>
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-4">
                        {area.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs font-semibold text-zinc-700">
                      <span className="truncate">{area.count}</span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 group-hover:bg-[#fe6612] group-hover:text-white transition-colors">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN 3: BANNER INTERACTIVO DE AYUDA (BRÚJULA) */}
      {/* ========================================================================= */}
      <section className="py-10 bg-[#fbfbfb] border-b border-zinc-200/80">
        <div className="rutas-shell">
          
          <div className="qw-help-banner flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#fe6612]">
                ¿No sabes por dónde empezar?
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Te ayudamos a encontrar la ruta ideal<span className="text-[#fe6612]">.</span>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                Usa el buscador o navega los mandos organizados por área para acceder a las soluciones del laboratorio.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <button
                type="button"
                onClick={() => scrollToDirectory('Todos')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#fe6612] hover:bg-[#e0550a] text-white text-xs font-bold shadow-lg shadow-[#fe6612]/30 transition-all active:translate-y-px cursor-pointer"
              >
                <span>Explorar todas las rutas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN 4: TODAS LAS RUTAS & SWITCHES DE PRODUCCIÓN */}
      {/* ========================================================================= */}
      <section id="rutas-directorio" className="py-12 bg-white">
        <div className="rutas-shell">
          
          {/* Cabecera del Listado */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-200/80">
            <div>
              <h2 className="text-2xl font-extrabold text-zinc-950 tracking-tight">
                Todas las rutas
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                Listado completo de rutas organizadas por área con switch de producción (<code className="font-mono text-xs text-[#fe6612]">dist</code>).
              </p>
            </div>

            {/* Contador / Resumen */}
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700">
                {filteredParents.length} secciones mostradas
              </span>
            </div>
          </div>

          {/* Barra de Filtros Sticky en 2 Filas (Sin solapamientos) */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md pt-3.5 pb-4 -mx-4 px-4 border-b border-zinc-200/80 shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-3.5 mb-8 rounded-b-2xl transition-all">
            
            {/* FILA 1: Píldoras de Categorías */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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
                    className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#fe6612] text-white shadow-sm shadow-[#fe6612]/20'
                        : 'border border-zinc-200 bg-white text-zinc-700 hover:border-[#fe6612]/40 hover:text-[#fe6612]'
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

            {/* FILA 2: Selector de Estado (Izquierda) + Desplegar/Colapsar y Ordenar (Derecha) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100">
              
              {/* Selector de Estado de Producción + Master Toggles */}
              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-100 p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${statusFilter === 'all' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                    Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('approved')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${statusFilter === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                    En Producción ({approvedPaths.size})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('local')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${statusFilter === 'local' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                    Solo Local
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={selectAllPaths}
                    title="Aprobar todas las rutas para Producción (Dist)"
                    className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    Activar todos
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllPaths}
                    title="Desactivar todas las rutas (Solo Local)"
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-[11px] font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    Desactivar todos
                  </button>
                </div>
              </div>

              {/* Controles de expansión y orden */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={expandAll}
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    Desplegar
                  </button>
                  <button
                    type="button"
                    onClick={collapseAll}
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    Colapsar
                  </button>
                </div>

                <div className="h-4 w-px bg-zinc-200 hidden sm:block"></div>

                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <span>Ordenar:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-800 outline-none focus:border-[#fe6612]"
                  >
                    <option value="default">Por defecto</option>
                    <option value="name">Alfabético</option>
                    <option value="routesCount">Mayor número de sub-rutas</option>
                  </select>
                </div>
              </div>

            </div>

          </div>

          {/* Grid de 2 Columnas de Tarjetas de Rutas */}
          {filteredParents.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-zinc-200 rounded-2xl">
              <p className="text-base font-bold text-zinc-900 mb-1">No se encontraron rutas con los filtros aplicados</p>
              <p className="text-xs text-zinc-500 mb-5">Prueba seleccionando "Todos" o limpiando el término de búsqueda.</p>
              <button
                type="button"
                onClick={() => { setActiveCategory('Todos'); setStatusFilter('all'); setSearchQuery('') }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#fe6612] text-white text-xs font-bold hover:bg-[#e0550a] transition-all"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  onToggleMultiApproval={toggleMultiPathsApproval}
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
              Sincronizado automáticamente en tu navegador
            </p>
          </div>
        </div>

        {/* Botones de acción rápida */}
        <div className="flex items-center gap-2 flex-wrap">
          
          <button
            type="button"
            onClick={selectAllPaths}
            title="Aprobar todas las rutas del laboratorio para Producción"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/30 transition-all cursor-pointer"
          >
            <span>Activar todos</span>
          </button>

          <button
            type="button"
            onClick={deselectAllPaths}
            title="Desactivar todas las rutas (Solo Local)"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 transition-all cursor-pointer"
          >
            <span>Desactivar todos</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCodeModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-[#fe6612]" />
            <span>Ver Configuración</span>
          </button>

          <button
            type="button"
            onClick={copyConfigCode}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#fe6612] hover:bg-[#e0550a] text-white shadow-md shadow-[#fe6612]/25 transition-all active:translate-y-px cursor-pointer"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all cursor-pointer"
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
            title="Restablecer a la configuración de siteVisibility.js actual"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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


