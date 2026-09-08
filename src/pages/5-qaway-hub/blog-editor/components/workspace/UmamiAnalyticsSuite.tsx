import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import {
  Eye,
  Users,
  Clock,
  Download,
  Search,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Compass,
  ChevronDown,
  Check,
  Activity,
  FileText,
  BarChart3,
  LineChart as LineChartIcon,
  Flame,
  MapPin,
  Info,
  RotateCw,
  X,
  Filter,
  CheckCircle2
} from 'lucide-react'
import { useBlog } from '../../context/BlogContext'
import { supabase } from '@/config/supabase'
import AreaChartPro from '@/components/analytics/charts/AreaChartPro'
import DonutChartPro from '@/components/analytics/charts/DonutChartPro'
import BarChartPro from '@/components/analytics/charts/BarChartPro'

type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all'
type ChartType = 'area' | 'bar'
type ActiveTabDetail = 'pages' | 'referrers' | 'devices' | 'browsers' | 'os' | 'countries' | 'engagement'

export interface ColorTheme {
  id: string
  name: string
  desc: string
  primaryColor: string
  secondaryColor: string
}

export const ANALYTICS_THEMES: ColorTheme[] = [
  {
    id: 'brand',
    name: 'Qaway Néctar Brand',
    desc: 'Naranja identitario Qaway con contraste grafito',
    primaryColor: '#ff4b0b',
    secondaryColor: '#24262e',
  },
  {
    id: 'monochrome',
    name: 'Grafito Monocromo',
    desc: 'Sobrio, minimalista, estilo Linear & Vercel',
    primaryColor: '#18181b',
    secondaryColor: '#71717a',
  },
  {
    id: 'indigo',
    name: 'Índigo Corporativo',
    desc: 'Estándar SaaS tecnológico y analítico',
    primaryColor: '#2563eb',
    secondaryColor: '#60a5fa',
  },
  {
    id: 'emerald',
    name: 'Esmeralda Crecimiento',
    desc: 'Enfoque de métricas de crecimiento y conversión',
    primaryColor: '#059669',
    secondaryColor: '#34d399',
  },
  {
    id: 'slate',
    name: 'Pizarra & Acero',
    desc: 'Tonos fríos y descansados para lectura prolongada',
    primaryColor: '#334155',
    secondaryColor: '#94a3b8',
  },
]

interface RawTelemetryEvent {
  id?: string
  visitor_id?: string
  session_id?: string
  slug: string
  title?: string
  category?: string
  referrer?: string
  raw_referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  fbclid?: string
  device?: string
  browser?: string
  os?: string
  created_at?: string
}

export default function UmamiAnalyticsSuite() {
  const { posts } = useBlog()

  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [chartType, setChartType] = useState<ChartType>('area')
  const [activeTabDetail, setActiveTabDetail] = useState<ActiveTabDetail>('pages')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Segmentación por Artículo Específico (null = vista global del blog)
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null)

  // Selector de Temas Visuales
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    return localStorage.getItem('qaway_umami_theme_id') || 'brand'
  })
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const themeMenuRef = useRef<HTMLDivElement>(null)

  // Lista de eventos de telemetría reales (de Supabase o buffer local)
  const [events, setEvents] = useState<RawTelemetryEvent[]>([])

  // Función de carga de telemetría real (reutilizable para polling y refresco manual)
  const loadTelemetry = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true)

    let realEvents: RawTelemetryEvent[] = []

    // 1. Intentar cargar desde Supabase si está disponible
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('blog_pageviews')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(2500)

        if (!error && data && Array.isArray(data)) {
          realEvents = data as RawTelemetryEvent[]
        }
      } catch {
        // Fallo silencioso no bloqueante
      }
    }

    // 2. Si Supabase no tiene datos o aún no existe la tabla, consultar buffer local
    if (realEvents.length === 0 && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('qaway_blog_real_events_v1')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) realEvents = parsed
        }
      } catch {}
    }

    setEvents(realEvents)
    if (!isSilent) {
      setTimeout(() => setIsRefreshing(false), 350)
    }
  }, [])

  // Carga inicial y sondeo periódico cada 15 segundos (Live Polling)
  useEffect(() => {
    loadTelemetry(false)

    // Polling silencioso en segundo plano cada 15 segundos
    const pollInterval = setInterval(() => {
      loadTelemetry(true)
    }, 15000)

    return () => clearInterval(pollInterval)
  }, [loadTelemetry])

  // Cerrar menú de temas al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Tema activo
  const activeTheme = useMemo(() => {
    return ANALYTICS_THEMES.find(t => t.id === selectedThemeId) || ANALYTICS_THEMES[0]
  }, [selectedThemeId])

  const handleSelectTheme = (themeId: string) => {
    setSelectedThemeId(themeId)
    localStorage.setItem('qaway_umami_theme_id', themeId)
    setIsThemeMenuOpen(false)
  }

  // Artículo actualmente seleccionado para segmentación (si existe)
  const selectedArticle = useMemo(() => {
    if (!selectedArticleSlug) return null
    return posts.find(p => p.slug === selectedArticleSlug || p.id === selectedArticleSlug) || null
  }, [selectedArticleSlug, posts])

  // 1. Filtrado temporal estricto
  const timeFilteredEvents = useMemo(() => {
    if (events.length === 0) return []
    const now = Date.now()

    let cutoff = 0
    if (timeRange === '24h') cutoff = now - 24 * 60 * 60 * 1000
    else if (timeRange === '7d') cutoff = now - 7 * 24 * 60 * 60 * 1000
    else if (timeRange === '30d') cutoff = now - 30 * 24 * 60 * 60 * 1000
    else if (timeRange === '90d') cutoff = now - 90 * 24 * 60 * 60 * 1000

    if (cutoff === 0) return events // 'all'

    return events.filter(ev => {
      if (!ev.created_at) return true
      return new Date(ev.created_at).getTime() >= cutoff
    })
  }, [events, timeRange])

  // 2. Filtrado por artículo (Segmentación)
  const scopedEvents = useMemo(() => {
    if (!selectedArticleSlug) return timeFilteredEvents
    return timeFilteredEvents.filter(ev => {
      const matchSlug = ev.slug === selectedArticleSlug
      const matchId = selectedArticle && (ev.slug === selectedArticle.id || ev.slug === selectedArticle.slug)
      return matchSlug || matchId
    })
  }, [timeFilteredEvents, selectedArticleSlug, selectedArticle])

  // 3. Cálculo de Métricas (100% Real, Cero Datos Sintéticos)
  const metrics = useMemo(() => {
    const totalViews = scopedEvents.length

    // Conteo de identificadores únicos (con fallback a session_id para eventos previos sin visitor_id)
    const uniqueVisitorSet = new Set<string>()
    scopedEvents.forEach(ev => {
      const vid = ev.visitor_id || ev.session_id || 'vis_local'
      uniqueVisitorSet.add(vid)
    })
    const uniqueVisitors = totalViews > 0 ? Math.max(1, uniqueVisitorSet.size) : 0

    // Visitas recientes en las últimas 24 horas dentro del ámbito actual
    const now = Date.now()
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000
    const recentViews24h = scopedEvents.filter(ev => {
      if (!ev.created_at) return false
      return new Date(ev.created_at).getTime() >= twentyFourHoursAgo
    }).length

    // Mapeo general de vistas por artículo (usando eventos de todo el blog para el desglose)
    const globalViewsMap: Record<string, number> = {}
    const globalVisitorsMap: Record<string, Set<string>> = {}

    timeFilteredEvents.forEach(ev => {
      const s = ev.slug || 'articulo'
      globalViewsMap[s] = (globalViewsMap[s] || 0) + 1
      if (!globalVisitorsMap[s]) globalVisitorsMap[s] = new Set()
      const vid = ev.visitor_id || ev.session_id || 'vis_local'
      globalVisitorsMap[s].add(vid)
    })

    const globalTotalViews = timeFilteredEvents.length

    // Desglose de rendimiento de artículos
    const articlesPerformance = posts.map(post => {
      const views = globalViewsMap[post.slug] || globalViewsMap[post.id] || 0
      const visitors = (globalVisitorsMap[post.slug] || globalVisitorsMap[post.id])?.size || 0
      const percent = globalTotalViews > 0 ? Math.round((views / globalTotalViews) * 100) : 0
      const isSelected = selectedArticleSlug === post.slug || selectedArticleSlug === post.id
      return {
        id: post.id,
        title: post.title,
        slug: post.slug || post.id,
        category: post.category,
        status: post.status,
        views,
        visitors,
        percent,
        isSelected,
      }
    }).sort((a, b) => b.views - a.views)

    const postsWithTrafficCount = articlesPerformance.filter(a => a.views > 0).length

    // Agrupación de Referrers (Canales de adquisición del ámbito activo)
    const referrerMap: Record<string, number> = {}
    const deviceMap: Record<string, number> = {}
    const browserMap: Record<string, number> = {}
    const osMap: Record<string, number> = {}

    scopedEvents.forEach(ev => {
      const ref = ev.referrer || 'Directo / Marcadores'
      referrerMap[ref] = (referrerMap[ref] || 0) + 1

      const dev = ev.device || 'Desktop'
      deviceMap[dev] = (deviceMap[dev] || 0) + 1

      const br = ev.browser || 'Chrome'
      browserMap[br] = (browserMap[br] || 0) + 1

      const os = ev.os || 'Otro'
      osMap[os] = (osMap[os] || 0) + 1
    })

    const formatBreakdown = (map: Record<string, number>) =>
      Object.entries(map)
        .map(([name, count]) => ({
          name,
          views: count,
          percent: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
        }))
        .sort((a, b) => b.views - a.views)

    const referrers = formatBreakdown(referrerMap)
    const devices = formatBreakdown(deviceMap)
    const browsers = formatBreakdown(browserMap)
    const osList = formatBreakdown(osMap)

    // Serie Temporal Real para Recharts
    const timeSeriesData: { date: string; visitas: number; visitantes: number }[] = []

    if (timeRange === '24h') {
      const buckets: Record<string, { views: number; visitors: Set<string> }> = {}
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now - i * 60 * 60 * 1000)
        const key = `${String(d.getHours()).padStart(2, '0')}:00`
        buckets[key] = { views: 0, visitors: new Set() }
      }

      scopedEvents.forEach(ev => {
        if (!ev.created_at) return
        const d = new Date(ev.created_at)
        const key = `${String(d.getHours()).padStart(2, '0')}:00`
        if (buckets[key]) {
          buckets[key].views += 1
          const vid = ev.visitor_id || ev.session_id || 'vis_local'
          buckets[key].visitors.add(vid)
        }
      })

      Object.entries(buckets).forEach(([date, data]) => {
        timeSeriesData.push({
          date,
          visitas: data.views,
          visitantes: data.visitors.size,
        })
      })
    } else {
      const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30
      const buckets: Record<string, { views: number; visitors: Set<string> }> = {}

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now - i * 24 * 60 * 60 * 1000)
        const key = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
        buckets[key] = { views: 0, visitors: new Set() }
      }

      scopedEvents.forEach(ev => {
        if (!ev.created_at) return
        const d = new Date(ev.created_at)
        const key = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
        if (buckets[key]) {
          buckets[key].views += 1
          const vid = ev.visitor_id || ev.session_id || 'vis_local'
          buckets[key].visitors.add(vid)
        }
      })

      Object.entries(buckets).forEach(([date, data]) => {
        timeSeriesData.push({
          date,
          visitas: data.views,
          visitantes: data.visitors.size,
        })
      })
    }

    return {
      totalViews,
      uniqueVisitors,
      recentViews24h,
      postsWithTrafficCount,
      articlesPerformance,
      referrers,
      devices,
      browsers,
      osList,
      timeSeriesData,
    }
  }, [scopedEvents, timeFilteredEvents, posts, timeRange, selectedArticleSlug, selectedArticle])

  // Exportar reporte real en CSV
  const handleExportCsv = () => {
    const rows = [
      ['Título', 'Slug', 'Vistas Reales', 'Visitantes Únicos', 'Porcentaje del Total'],
      ...metrics.articlesPerformance.map(a => [
        `"${a.title.replace(/"/g, '""')}"`,
        a.slug,
        a.views,
        a.visitors,
        `${a.percent}%`
      ])
    ]
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `qaway_telemetria_${selectedArticleSlug ? `post_${selectedArticleSlug}` : 'blog'}_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtrar artículos por búsqueda en la pestaña
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return metrics.articlesPerformance
    const q = searchQuery.toLowerCase()
    return metrics.articlesPerformance.filter(
      a => a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    )
  }, [metrics.articlesPerformance, searchQuery])

  // Toggle de selección de artículo
  const handleToggleArticleFilter = (slug: string) => {
    if (selectedArticleSlug === slug) {
      setSelectedArticleSlug(null) // Quitar filtro
    } else {
      setSelectedArticleSlug(slug) // Filtrar por este artículo
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. Encabezado Global de Métricas & Controles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-primary tracking-tight">
              Analítica Web & Tráfico Editorial
            </h2>

            {/* Badge de Telemetría en Vivo con Botón de Refresco Manual */}
            <div className="flex items-center gap-1.5">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${
                  metrics.totalViews > 0
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700'
                    : 'bg-surface-muted border-line text-muted'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    metrics.totalViews > 0 ? 'bg-emerald-500 animate-ping' : 'bg-muted-light'
                  }`}
                />
                <span>{metrics.totalViews > 0 ? 'Telemetría en Vivo' : 'Esperando Lecturas'}</span>
              </div>

              <button
                type="button"
                onClick={() => loadTelemetry(false)}
                disabled={isRefreshing}
                className="p-1.5 rounded-lg border border-line bg-white hover:bg-surface-muted text-muted hover:text-primary transition-all cursor-pointer shadow-2xs"
                title="Actualizar datos ahora (Sondeo automático activo cada 15s)"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-accent' : ''}`} />
              </button>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Datos reales de lectura, campañas de adquisición y comportamiento de usuarios sin valores sintéticos.
          </p>
        </div>

        {/* Barra de Herramientas: Paleta, Alternador de Gráfica, Rango de Fecha y Exportación */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Selector de Paleta de Color */}
          <div className="relative" ref={themeMenuRef}>
            <button
              type="button"
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-line bg-white hover:bg-surface-muted text-xs font-semibold text-primary shadow-2xs transition-colors cursor-pointer"
              title="Personalizar color del gráfico"
            >
              <div className="flex items-center gap-1">
                <span
                  style={{ backgroundColor: activeTheme.primaryColor }}
                  className="w-3 h-3 rounded-full border border-black/10"
                />
                <span
                  style={{ backgroundColor: activeTheme.secondaryColor }}
                  className="w-3 h-3 rounded-full border border-black/10 -ml-1.5"
                />
              </div>
              <span className="hidden sm:inline text-xs">{activeTheme.name.split(' ')[0]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted" />
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-line shadow-xl z-40 p-3 space-y-1.5 animate-in fade-in duration-150">
                <div className="px-2 py-1">
                  <span className="text-xs font-bold text-primary block">Paleta de Color Recharts</span>
                  <span className="text-[11px] text-muted block">Gradientes armónicos del panel</span>
                </div>
                {ANALYTICS_THEMES.map(theme => {
                  const isSelected = selectedThemeId === theme.id
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-surface-muted border border-line font-bold text-primary shadow-2xs'
                          : 'hover:bg-surface-subtle text-muted hover:text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          style={{ backgroundColor: theme.primaryColor }}
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        />
                        <div>
                          <span className="text-xs block font-semibold text-primary">{theme.name}</span>
                          <span className="text-[10px] text-muted block leading-tight">{theme.desc}</span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Alternador de Tipo de Gráfica */}
          <div className="flex items-center bg-surface-muted p-1 rounded-xl border border-line">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'area' ? 'bg-white text-primary shadow-2xs' : 'text-muted hover:text-primary'
              }`}
              title="Gráfico de Área Suave Recharts"
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'bar' ? 'bg-white text-primary shadow-2xs' : 'text-muted hover:text-primary'
              }`}
              title="Gráfico de Barras Recharts"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Selector de Rango Temporal */}
          <div className="flex items-center bg-surface-muted p-1 rounded-xl border border-line text-xs font-semibold">
            {[
              { id: '24h', label: '24h' },
              { id: '7d', label: '7 Días' },
              { id: '30d', label: '30 Días' },
              { id: '90d', label: '90 Días' },
              { id: 'all', label: 'Todo' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeRange(tab.id as TimeRange)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  timeRange === tab.id
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-muted hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Exportar CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="p-2 rounded-xl border border-line bg-white hover:bg-surface-muted text-muted hover:text-primary shadow-2xs transition-colors cursor-pointer"
            title="Descargar reporte real en CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Banner Contextual de Segmentación por Artículo */}
      {selectedArticle && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 bg-amber-500 text-white rounded-lg shrink-0">
              <Filter className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Métricas Segmentadas de Artículo
                </span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-amber-500/20 font-mono text-amber-800 font-bold">
                  {metrics.totalViews} vistas
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-primary truncate max-w-2xl mt-0.5">
                {selectedArticle.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedArticleSlug(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-50 border border-amber-500/30 text-amber-900 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Ver todo el blog</span>
          </button>
        </div>
      )}

      {/* 2. Banner de 4 Tarjetas KPI Reales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Vistas Totales */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-1.5 hover:border-line/80 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-muted" /> Vistas {selectedArticle ? 'del Artículo' : 'Totales'}
            </span>
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                metrics.totalViews > 0
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-surface-muted text-muted'
              }`}
            >
              {metrics.totalViews > 0 ? `${metrics.totalViews} hits` : 'Sin registros'}
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl lg:text-3xl text-primary tracking-tight">
            {metrics.totalViews.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted">
            {selectedArticle ? `En /blog/${selectedArticle.slug}` : `En ${posts.length} artículos del blog`}
          </p>
        </div>

        {/* KPI 2: Navegadores Únicos */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-1.5 hover:border-line/80 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-muted" /> Navegadores Únicos
            </span>
            <span className="text-[11px] font-mono font-bold text-primary bg-surface-muted px-2 py-0.5 rounded border border-line">
              Anónimo
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl lg:text-3xl text-primary tracking-tight">
            {metrics.uniqueVisitors.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted">
            Identificadores técnicos por dispositivo
          </p>
        </div>

        {/* KPI 3: Visitas Recientes (24 horas) */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-1.5 hover:border-line/80 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-muted" /> Visitas Recientes (24h)
            </span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                metrics.recentViews24h > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-muted-light'
              }`}
            />
          </div>
          <div className="font-display font-extrabold text-2xl lg:text-3xl text-primary tracking-tight">
            {metrics.recentViews24h.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted">
            Páginas vistas en las últimas 24 horas
          </p>
        </div>

        {/* KPI 4: Artículos con Lecturas */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-1.5 hover:border-line/80 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-muted" /> {selectedArticle ? 'Participación' : 'Con Tráfico'}
            </span>
            <span className="text-[11px] font-mono font-bold text-primary bg-surface-muted px-2 py-0.5 rounded border border-line">
              {selectedArticle ? 'Segmentado' : `${posts.length > 0 ? `${Math.round((metrics.postsWithTrafficCount / posts.length) * 100)}%` : '0%'}`}
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl lg:text-3xl text-primary tracking-tight">
            {selectedArticle
              ? `${metrics.articlesPerformance.find(a => a.id === selectedArticle.id || a.slug === selectedArticle.slug)?.percent || 0}%`
              : `${metrics.postsWithTrafficCount} / ${posts.length}`}
          </div>
          <p className="text-[11px] text-muted">
            {selectedArticle ? 'Del tráfico total del blog' : 'Artículos con al menos 1 visita real'}
          </p>
        </div>
      </div>

      {/* 3. Gráfica Principal de Tendencia con Recharts */}
      <div className="bg-white p-5 lg:p-6 rounded-2xl border border-line shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-base text-primary">
              {selectedArticle ? `Tendencia de Lectura: ${selectedArticle.title}` : 'Tendencia Temporal de Tráfico'}
            </h3>
            <p className="text-xs text-muted">
              Páginas vistas y navegadores únicos registrados en el período ({timeRange})
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeTheme.primaryColor }} />
              <span className="text-primary font-bold">Vistas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeTheme.secondaryColor }} />
              <span className="text-muted">Navegadores</span>
            </div>
          </div>
        </div>

        {/* Contenedor del Gráfico */}
        <div className="relative w-full h-[280px]">
          {metrics.totalViews === 0 && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-xl text-center p-4">
              <Info className="w-6 h-6 text-muted mb-2" />
              <p className="text-sm font-semibold text-primary">Aún no hay visitas registradas en este período</p>
              <p className="text-xs text-muted max-w-md mt-0.5">
                La gráfica comenzará a dibujar curvas automáticamente en cuanto tus lectores visiten los artículos en el blog.
              </p>
            </div>
          )}

          {chartType === 'area' ? (
            <AreaChartPro
              data={metrics.timeSeriesData}
              xAxisKey="date"
              height={280}
              showGrid={true}
              showLegend={false}
              series={[
                { key: 'visitas', name: 'Vistas', color: activeTheme.primaryColor },
                { key: 'visitantes', name: 'Navegadores Únicos', color: activeTheme.secondaryColor },
              ]}
              valueFormatter={(val: number) => `${val} visitas`}
            />
          ) : (
            <BarChartPro
              data={metrics.timeSeriesData}
              xAxisKey="date"
              height={280}
              showGrid={true}
              showLegend={false}
              series={[
                { key: 'visitas', name: 'Vistas', color: activeTheme.primaryColor },
                { key: 'visitantes', name: 'Navegadores Únicos', color: activeTheme.secondaryColor },
              ]}
              valueFormatter={(val: number) => `${val} visitas`}
            />
          )}
        </div>
      </div>

      {/* 4. Desglose Multidimensional de Métricas Reales */}
      <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
        {/* Pestañas de Dimensiones */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3 bg-[#fafafc] flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl border border-line flex-wrap">
            {[
              { id: 'pages', label: 'Artículos & URLs', icon: FileText },
              { id: 'referrers', label: 'Fuentes de Tráfico', icon: Globe },
              { id: 'devices', label: 'Dispositivos', icon: Monitor },
              { id: 'browsers', label: 'Navegadores', icon: Compass },
              { id: 'os', label: 'Sistemas Operativos', icon: Activity },
              { id: 'countries', label: 'Países', icon: MapPin },
              { id: 'engagement', label: 'Permanencia & Rebote', icon: Clock },
            ].map(tab => {
              const Icon = tab.icon
              const isActive = activeTabDetail === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabDetail(tab.id as ActiveTabDetail)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-primary shadow-xs font-bold'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {activeTabDetail === 'pages' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar artículo..."
                className="pl-8 pr-3 py-1 text-xs bg-white border border-line rounded-lg focus:outline-none focus:border-primary w-44"
              />
            </div>
          )}
        </div>

        {/* Contenido de la Dimensión Seleccionada */}
        <div className="p-5 lg:p-6">
          {/* Dimensión 1: Artículos & URLs con Segmentación Interactiva al Clic */}
          {activeTabDetail === 'pages' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted pb-1">
                <span>Haz clic en cualquier artículo para segmentar el panel completo:</span>
                {selectedArticleSlug && (
                  <button
                    type="button"
                    onClick={() => setSelectedArticleSlug(null)}
                    className="text-accent font-bold hover:underline"
                  >
                    Restablecer a todo el blog
                  </button>
                )}
              </div>

              {filteredArticles.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted">
                  No hay artículos que coincidan con la búsqueda.
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {filteredArticles.map(art => {
                    const isSelected = selectedArticleSlug === art.slug || selectedArticleSlug === art.id
                    return (
                      <div
                        key={art.id}
                        onClick={() => handleToggleArticleFilter(art.slug)}
                        className={`py-3 flex items-center justify-between gap-4 px-3 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/10 border border-amber-500/30 shadow-xs'
                            : 'hover:bg-surface-subtle'
                        }`}
                        title={isSelected ? 'Clic para quitar filtro' : 'Clic para ver métricas exclusivas de este artículo'}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                            )}
                            <span className={`text-xs font-bold truncate max-w-md ${isSelected ? 'text-amber-900' : 'text-primary'}`}>
                              {art.title}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-muted text-muted font-medium border border-line shrink-0">
                              {art.category}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded shrink-0">
                                Filtrado
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-muted truncate mt-0.5">
                            /blog/{art.slug}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 shrink-0">
                          {/* Barra de Proporción */}
                          <div className="hidden sm:block w-28 bg-surface-muted h-2 rounded-full overflow-hidden border border-line">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${art.percent}%`,
                                backgroundColor: isSelected ? '#f59e0b' : activeTheme.primaryColor,
                              }}
                            />
                          </div>

                          <div className="text-right min-w-[70px]">
                            <div className="text-xs font-bold font-mono text-primary">
                              {art.views} <span className="text-[10px] font-normal text-muted">vistas</span>
                            </div>
                            <div className="text-[10px] text-muted font-mono">
                              {art.visitors} nav. ({art.percent}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Dimensión 2: Fuentes de Tráfico (Referrers) */}
          {activeTabDetail === 'referrers' && (
            <div>
              {metrics.referrers.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted space-y-1">
                  <Globe className="w-6 h-6 text-muted mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-primary">
                    {selectedArticle ? `Aún no hay fuentes registradas para "${selectedArticle.title}"` : 'Aún no hay fuentes de tráfico registradas'}
                  </p>
                  <p className="text-[11px] text-muted">
                    Los canales (Google, Facebook Ads, Directo, LinkedIn) aparecerán cuando los lectores ingresen al blog.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-2.5">
                    {metrics.referrers.map(ref => (
                      <div key={ref.name} className="flex items-center justify-between p-2.5 rounded-xl border border-line bg-surface-subtle">
                        <span className="text-xs font-semibold text-primary">{ref.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold font-mono text-primary">{ref.views}</span>
                          <span className="text-[10px] font-mono text-muted bg-white px-1.5 py-0.5 rounded border border-line">
                            {ref.percent}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="h-64 flex items-center justify-center">
                    <DonutChartPro
                      data={metrics.referrers.map(r => ({ name: r.name, value: r.views }))}
                      height={240}
                      centerLabel="Total Fuentes"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dimensión 3: Dispositivos */}
          {activeTabDetail === 'devices' && (
            <div>
              {metrics.devices.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted space-y-1">
                  <Monitor className="w-6 h-6 text-muted mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-primary">Aún no hay datos de dispositivos registrados</p>
                  <p className="text-[11px] text-muted">
                    El desglose (Desktop, Mobile, Tablet) se calculará a partir de los user agents de tus lectores.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-2.5">
                    {metrics.devices.map(dev => (
                      <div key={dev.name} className="flex items-center justify-between p-2.5 rounded-xl border border-line bg-surface-subtle">
                        <div className="flex items-center gap-2">
                          {dev.name === 'Mobile' ? <Smartphone className="w-4 h-4 text-muted" /> : dev.name === 'Tablet' ? <Tablet className="w-4 h-4 text-muted" /> : <Monitor className="w-4 h-4 text-muted" />}
                          <span className="text-xs font-semibold text-primary">{dev.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold font-mono text-primary">{dev.views}</span>
                          <span className="text-[10px] font-mono text-muted bg-white px-1.5 py-0.5 rounded border border-line">
                            {dev.percent}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="h-64 flex items-center justify-center">
                    <DonutChartPro
                      data={metrics.devices.map(d => ({ name: d.name, value: d.views }))}
                      height={240}
                      centerLabel="Dispositivos"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dimensión 4: Navegadores */}
          {activeTabDetail === 'browsers' && (
            <div>
              {metrics.browsers.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted space-y-1">
                  <Compass className="w-6 h-6 text-muted mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-primary">Aún no hay datos de navegadores registrados</p>
                  <p className="text-[11px] text-muted">
                    Se detectarán automáticamente (Chrome, Safari, Edge, Firefox, etc.).
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {metrics.browsers.map(br => (
                    <div key={br.name} className="p-3.5 rounded-xl border border-line bg-surface-subtle flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary">{br.name}</span>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono block text-primary">{br.views}</span>
                        <span className="text-[10px] text-muted font-mono">{br.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dimensión 5: Sistemas Operativos */}
          {activeTabDetail === 'os' && (
            <div>
              {metrics.osList.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted space-y-1">
                  <Activity className="w-6 h-6 text-muted mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-primary">Aún no hay datos de sistemas operativos registrados</p>
                  <p className="text-[11px] text-muted">
                    Se clasificarán según el sistema del lector (Windows, Android, iOS, macOS, Linux).
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {metrics.osList.map(os => (
                    <div key={os.name} className="p-3.5 rounded-xl border border-line bg-surface-subtle flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary">{os.name}</span>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono block text-primary">{os.views}</span>
                        <span className="text-[10px] text-muted font-mono">{os.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dimensión 6: Países (Honestidad: Requiere GeoIP) */}
          {activeTabDetail === 'countries' && (
            <div className="py-10 text-center max-w-lg mx-auto space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-surface-muted border border-line flex items-center justify-center mx-auto text-muted">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-primary">
                Aún no hay datos de ubicación geográfica
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                El navegador del cliente no tiene acceso directo a la ubicación del lector sin un servicio externo de resolución de IP (GeoIP) o encabezados CDN (como Cloudflare). Esta dimensión se activará en la siguiente fase de infraestructura.
              </p>
              <span className="inline-block text-[11px] font-mono text-muted bg-surface-muted px-2.5 py-1 rounded-lg border border-line">
                Estado: Reservado para Fase GeoIP
              </span>
            </div>
          )}

          {/* Dimensión 7: Permanencia & Rebote (Honestidad: Requiere Balizas) */}
          {activeTabDetail === 'engagement' && (
            <div className="py-10 text-center max-w-lg mx-auto space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-surface-muted border border-line flex items-center justify-center mx-auto text-muted">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-primary">
                Aún no hay datos suficientes de permanencia
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                El cálculo exacto del tiempo promedio de lectura y la tasa de rebote requiere balizas de salida (heartbeat de presencia o <code>navigator.sendBeacon</code> al cerrar la pestaña). Para no inventar datos, esta métrica se mantiene en espera de telemetría de sesión prolongada.
              </p>
              <span className="inline-block text-[11px] font-mono text-muted bg-surface-muted px-2.5 py-1 rounded-lg border border-line">
                Estado: Reservado para Fase Balizas de Permanencia
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
