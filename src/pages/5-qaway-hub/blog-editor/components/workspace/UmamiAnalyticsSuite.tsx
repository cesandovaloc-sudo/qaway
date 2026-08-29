import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  Eye,
  Users,
  Clock,
  ArrowUpRight,
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
  MousePointerClick,
  BarChart3,
  LineChart as LineChartIcon,
} from 'lucide-react'
import { useBlog } from '../../context/BlogContext'

type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y' | 'all'
type ChartType = 'area' | 'bar'
type ActiveTabDetail = 'pages' | 'referrers' | 'browsers' | 'os' | 'devices' | 'countries' | 'events'

export interface ColorTheme {
  id: string
  name: string
  desc: string
  viewsColor: string // Primario (Vistas)
  visitorsColor: string // Secundario (Visitantes)
  leadsColor: string // Conversión / Eventos
  gradientFrom: string
  gradientTo: string
}

export const UMAMI_THEMES: ColorTheme[] = [
  {
    id: 'monochrome',
    name: 'Monocromático Grafito (Default)',
    desc: 'Sobrio, ultra-limpio, estilo Linear & Vercel',
    viewsColor: '#18181b', // Zinc 900
    visitorsColor: '#71717a', // Zinc 500
    leadsColor: '#52525b', // Zinc 600
    gradientFrom: 'rgba(24, 24, 27, 0.15)',
    gradientTo: 'rgba(24, 24, 27, 0.0)',
  },
  {
    id: 'indigo',
    name: 'Índigo Corporativo',
    desc: 'Estándar SaaS, elegante y armónico',
    viewsColor: '#2563eb', // Blue 600
    visitorsColor: '#60a5fa', // Blue 400
    leadsColor: '#3b82f6',
    gradientFrom: 'rgba(37, 99, 235, 0.18)',
    gradientTo: 'rgba(37, 99, 235, 0.0)',
  },
  {
    id: 'slate',
    name: 'Pizarra & Acero (Slate)',
    desc: 'Tonos fríos y descansados para la vista',
    viewsColor: '#334155', // Slate 700
    visitorsColor: '#94a3b8', // Slate 400
    leadsColor: '#475569',
    gradientFrom: 'rgba(51, 65, 85, 0.15)',
    gradientTo: 'rgba(51, 65, 85, 0.0)',
  },
  {
    id: 'emerald',
    name: 'Esmeralda & Menta (Growth)',
    desc: 'Armonía de crecimiento y frescura',
    viewsColor: '#059669', // Emerald 600
    visitorsColor: '#34d399', // Emerald 400
    leadsColor: '#10b981',
    gradientFrom: 'rgba(5, 150, 105, 0.18)',
    gradientTo: 'rgba(5, 150, 105, 0.0)',
  },
  {
    id: 'brand',
    name: 'Qaway Néctar Calibrado',
    desc: 'Naranja suave de marca con fondo carbón',
    viewsColor: '#ea580c', // Orange 600
    visitorsColor: '#71717a', // Zinc 500
    leadsColor: '#c2410c',
    gradientFrom: 'rgba(234, 88, 12, 0.15)',
    gradientTo: 'rgba(234, 88, 12, 0.0)',
  },
]

export default function UmamiAnalyticsSuite() {
  const { posts } = useBlog()

  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [chartType, setChartType] = useState<ChartType>('area')
  const [activeMetricSeries, setActiveMetricSeries] = useState<'both' | 'views' | 'visitors'>('both')
  const [activeTabDetail, setActiveTabDetail] = useState<ActiveTabDetail>('pages')
  const [searchQuery, setSearchQuery] = useState('')

  // Selector de Temas Visuales
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    return localStorage.getItem('qaway_umami_theme_id') || 'monochrome'
  })
  const [customViewsColor, setCustomViewsColor] = useState<string>(() => {
    return localStorage.getItem('qaway_umami_custom_views') || '#18181b'
  })
  const [customVisitorsColor, setCustomVisitorsColor] = useState<string>(() => {
    return localStorage.getItem('qaway_umami_custom_visitors') || '#71717a'
  })
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const themeMenuRef = useRef<HTMLDivElement>(null)

  // Cerrar menú al hacer clic fuera
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
    if (selectedThemeId === 'custom') {
      return {
        id: 'custom',
        name: 'Personalizado',
        desc: 'Colores elegidos a mano',
        viewsColor: customViewsColor,
        visitorsColor: customVisitorsColor,
        leadsColor: customViewsColor,
        gradientFrom: `${customViewsColor}25`,
        gradientTo: `${customViewsColor}00`,
      }
    }
    return UMAMI_THEMES.find(t => t.id === selectedThemeId) || UMAMI_THEMES[0]
  }, [selectedThemeId, customViewsColor, customVisitorsColor])

  const handleSelectTheme = (themeId: string) => {
    setSelectedThemeId(themeId)
    localStorage.setItem('qaway_umami_theme_id', themeId)
    setIsThemeMenuOpen(false)
  }

  const handleCustomTheme = (viewsColor: string, visitorsColor: string) => {
    setSelectedThemeId('custom')
    setCustomViewsColor(viewsColor)
    setCustomVisitorsColor(visitorsColor)
    localStorage.setItem('qaway_umami_theme_id', 'custom')
    localStorage.setItem('qaway_umami_custom_views', viewsColor)
    localStorage.setItem('qaway_umami_custom_visitors', visitorsColor)
  }

  // Generador de Métricas Multidimensionales Determinísticas Umami
  const analyticsData = useMemo(() => {
    const pubPosts = posts.filter(p => p.status === 'publicado')
    const rangeMultiplier =
      timeRange === '24h' ? 0.3 : timeRange === '7d' ? 1 : timeRange === '30d' ? 4.2 : timeRange === '90d' ? 11.5 : 22

    // 1. Métricas Totales
    const baseViews = Math.round(pubPosts.length * 680 * rangeMultiplier) + 1420
    const uniqueVisitors = Math.round(baseViews * 0.68)
    const bounceRate = 34.2
    const avgDurationSeconds = 194 // 3 min 14s
    const totalLeads = Math.round(baseViews * 0.034)
    const liveUsers = Math.max(3, (pubPosts.length * 2) + Math.round(Math.random() * 4))

    // 2. Desglose de Páginas / Artículos
    const pages = posts.map(post => {
      const words = (post.body || post.contentHtml || '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length
      const seed = (post.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 40) + 60
      const isPub = post.status === 'publicado'
      const views = isPub ? Math.round(seed * 45 * rangeMultiplier) : Math.round(seed * 2)
      const visitors = Math.round(views * 0.72)
      const leads = Math.round(views * 0.038)
      const avgDuration = `${Math.max(1, Math.round(words / 180))}m ${Math.round((words % 180) / 3)}s`

      return {
        id: post.id,
        title: post.title,
        slug: `/blog/${post.slug || 'articulo'}`,
        category: post.category,
        views,
        visitors,
        leads,
        avgDuration,
        bounce: `${(28 + (seed % 15))}%`,
      }
    }).sort((a, b) => b.views - a.views)

    // 3. Fuentes de Tráfico (Referrers)
    const referrers = [
      { name: 'Google (Orgánico)', icon: '🔍', views: Math.round(baseViews * 0.52), visitors: Math.round(uniqueVisitors * 0.54), percent: 52 },
      { name: 'Directo / Marcadores', icon: '🔗', views: Math.round(baseViews * 0.22), visitors: Math.round(uniqueVisitors * 0.20), percent: 22 },
      { name: 'LinkedIn', icon: '💼', views: Math.round(baseViews * 0.12), visitors: Math.round(uniqueVisitors * 0.13), percent: 12 },
      { name: 'WhatsApp & Telegram', icon: '💬', views: Math.round(baseViews * 0.08), visitors: Math.round(uniqueVisitors * 0.07), percent: 8 },
      { name: 'ChatGPT / Perplexity AI', icon: '🤖', views: Math.round(baseViews * 0.04), visitors: Math.round(uniqueVisitors * 0.04), percent: 4 },
      { name: 'Twitter / X', icon: '🐦', views: Math.round(baseViews * 0.02), visitors: Math.round(uniqueVisitors * 0.02), percent: 2 },
    ]

    // 4. Navegadores (Browsers)
    const browsers = [
      { name: 'Chrome', icon: '🌐', views: Math.round(baseViews * 0.64), percent: 64 },
      { name: 'Safari', icon: '🧭', views: Math.round(baseViews * 0.21), percent: 21 },
      { name: 'Edge', icon: '🌊', views: Math.round(baseViews * 0.08), percent: 8 },
      { name: 'Firefox', icon: '🦊', views: Math.round(baseViews * 0.05), percent: 5 },
      { name: 'Opera', icon: '⭕', views: Math.round(baseViews * 0.02), percent: 2 },
    ]

    // 5. Sistemas Operativos (OS)
    const osList = [
      { name: 'Windows', icon: '🪟', views: Math.round(baseViews * 0.48), percent: 48 },
      { name: 'Android', icon: '🤖', views: Math.round(baseViews * 0.26), percent: 26 },
      { name: 'iOS (iPhone/iPad)', icon: '🍎', views: Math.round(baseViews * 0.16), percent: 16 },
      { name: 'macOS', icon: '💻', views: Math.round(baseViews * 0.08), percent: 8 },
      { name: 'Linux', icon: '🐧', views: Math.round(baseViews * 0.02), percent: 2 },
    ]

    // 6. Dispositivos (Devices)
    const devices = [
      { name: 'Desktop (Computadora)', icon: Monitor, views: Math.round(baseViews * 0.58), percent: 58 },
      { name: 'Mobile (Smartphones)', icon: Smartphone, views: Math.round(baseViews * 0.38), percent: 38 },
      { name: 'Tablet', icon: Tablet, views: Math.round(baseViews * 0.04), percent: 4 },
    ]

    // 7. Países (Countries)
    const countries = [
      { code: 'PE', name: 'Perú', flag: '🇵🇪', views: Math.round(baseViews * 0.46), percent: 46 },
      { code: 'MX', name: 'México', flag: '🇲🇽', views: Math.round(baseViews * 0.22), percent: 22 },
      { code: 'CO', name: 'Colombia', flag: '🇨🇴', views: Math.round(baseViews * 0.12), percent: 12 },
      { code: 'ES', name: 'España', flag: '🇪🇸', views: Math.round(baseViews * 0.09), percent: 9 },
      { code: 'AR', name: 'Argentina', flag: '🇦🇷', views: Math.round(baseViews * 0.06), percent: 6 },
      { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', views: Math.round(baseViews * 0.05), percent: 5 },
    ]

    // 8. Eventos de Conversión (Custom Events / Goals)
    const events = [
      { name: 'lead_form_submitted', label: 'Formulario de Leads Enviado', count: totalLeads, category: 'Conversión' },
      { name: 'cta_button_click', label: 'Clic en Botón CTA Hero', count: Math.round(baseViews * 0.072), category: 'Interacción' },
      { name: 'passive_cta_click', label: 'Clic en CTA Pasivo (Texto)', count: Math.round(baseViews * 0.045), category: 'Interacción' },
      { name: 'pdf_guide_download', label: 'Descarga de Guía PDF', count: Math.round(totalLeads * 0.88), category: 'Descarga' },
      { name: 'social_share_click', label: 'Compartido en Redes Sociales', count: Math.round(baseViews * 0.018), category: 'Social' },
    ]

    // 9. Serie de Datos Temporales para el Gráfico
    const intervals = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : timeRange === '30d' ? 15 : 20
    const timeSeries = []
    const baseInterval = Math.round(baseViews / intervals)

    for (let i = intervals - 1; i >= 0; i--) {
      let label = ''
      if (timeRange === '24h') {
        const hour = (24 + new Date().getHours() - i) % 24
        label = `${hour}:00`
      } else {
        const d = new Date()
        d.setDate(d.getDate() - i)
        label = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
      }

      const variance = 0.75 + ((i * 23) % 45) / 100
      const pointViews = Math.round(baseInterval * variance)
      const pointVisitors = Math.round(pointViews * 0.68)
      const pointLeads = Math.round(pointViews * 0.035)

      timeSeries.push({
        label,
        views: pointViews,
        visitors: pointVisitors,
        leads: pointLeads,
      })
    }

    return {
      baseViews,
      uniqueVisitors,
      bounceRate,
      avgDurationSeconds,
      totalLeads,
      liveUsers,
      pages,
      referrers,
      browsers,
      osList,
      devices,
      countries,
      events,
      timeSeries,
    }
  }, [posts, timeRange])

  const maxPointViews = Math.max(...analyticsData.timeSeries.map(p => p.views), 1)

  // Generador de SVG Path para el gráfico de Área Suave (Spline)
  const splineAreaPath = useMemo(() => {
    const pts = analyticsData.timeSeries
    if (pts.length < 2) return { line: '', area: '', coords: [] as { x: number; y: number }[] }

    const width = 1000
    const height = 220
    const paddingBottom = 20
    const paddingTop = 20
    const usableHeight = height - paddingTop - paddingBottom

    const coords = pts.map((p, i) => {
      const x = (i / (pts.length - 1)) * width
      const y = height - paddingBottom - (p.views / maxPointViews) * usableHeight
      return { x, y }
    })

    // Construcción de curva Bezier suave
    let lineD = `M ${coords[0].x} ${coords[0].y}`
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i]
      const next = coords[i + 1]
      const cpX = (curr.x + next.x) / 2
      lineD += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`
    }

    const areaD = `${lineD} L ${width} ${height} L 0 ${height} Z`

    return { line: lineD, area: areaD, coords }
  }, [analyticsData.timeSeries, maxPointViews])

  // Exportar métricas completas a CSV
  const handleExportCsv = () => {
    const headers = 'Tipo,Etiqueta / Slug,Vistas / Eventos,Visitantes / Porcentaje\n'
    const rows = analyticsData.pages
      .map(p => `"Pagina","${p.title} (${p.slug})",${p.views},${p.visitors}`)
      .concat(analyticsData.referrers.map(r => `"Referrer","${r.name}",${r.views},"${r.percent}%"`))
      .concat(analyticsData.countries.map(c => `"Pais","${c.name}",${c.views},"${c.percent}%"`))
      .concat(analyticsData.events.map(e => `"Evento","${e.label}",${e.count},"${e.category}"`))
      .join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qaway_umami_analytics_${timeRange}.csv`
    a.click()
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#fafafc] p-6 lg:p-8 space-y-6 font-sans">
      {/* 1. Header Umami: Título, Filtro Activo y Controles de Rango */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-line shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Motor Analítico Umami (MIT) · Privacidad & Precisión</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-display font-extrabold text-primary tracking-tight">
              Analítica Web & Tráfico Editorial
            </h2>

            {/* Contador en Vivo Umami */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{analyticsData.liveUsers} en vivo</span>
            </div>
          </div>
        </div>

        {/* Barra de Herramientas Superior: Paleta, Tipos de Gráfico y Rango Temporal */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Selector de Paleta de Color Armónica */}
          <div className="relative" ref={themeMenuRef}>
            <button
              type="button"
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-line bg-white hover:bg-surface-muted text-xs font-semibold text-primary shadow-2xs transition-colors cursor-pointer"
              title="Personalizar colores armónicos del gráfico"
            >
              <div className="flex items-center gap-1">
                <span
                  style={{ backgroundColor: activeTheme.viewsColor }}
                  className="w-3 h-3 rounded-full border border-black/10"
                />
                <span
                  style={{ backgroundColor: activeTheme.visitorsColor }}
                  className="w-3 h-3 rounded-full border border-black/10 -ml-1.5"
                />
              </div>
              <span className="hidden md:inline text-xs">{activeTheme.name.split(' ')[0]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted" />
            </button>

            {/* Dropdown de Temas */}
            {isThemeMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-line shadow-xl z-40 p-3 space-y-2.5 animate-in fade-in duration-150">
                <div>
                  <span className="text-xs font-bold text-primary block">Paleta de Color Armónica</span>
                  <span className="text-[11px] text-muted block">Diseños descansados para la vista</span>
                </div>

                <div className="space-y-1">
                  {UMAMI_THEMES.map(theme => {
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
                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              style={{ backgroundColor: theme.viewsColor }}
                              className="w-4 h-4 rounded-full border border-black/10"
                            />
                            <span
                              style={{ backgroundColor: theme.visitorsColor }}
                              className="w-4 h-4 rounded-full border border-black/10 -ml-2"
                            />
                          </div>
                          <div>
                            <span className="text-xs block font-semibold text-primary">{theme.name}</span>
                            <span className="text-[10px] text-muted-light block leading-tight">{theme.desc}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </button>
                    )
                  })}
                </div>

                {/* Personalizador Manual */}
                <div className="pt-2 border-t border-line space-y-2">
                  <span className="text-[11px] font-bold text-primary block">Manual:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-muted block mb-0.5">Vistas:</span>
                      <div className="flex items-center gap-1.5 bg-surface-muted p-1 rounded-lg border border-line">
                        <input
                          type="color"
                          value={customViewsColor}
                          onChange={e => handleCustomTheme(e.target.value, customVisitorsColor)}
                          className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-[10px] font-mono font-semibold">{customViewsColor}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted block mb-0.5">Visitantes:</span>
                      <div className="flex items-center gap-1.5 bg-surface-muted p-1 rounded-lg border border-line">
                        <input
                          type="color"
                          value={customVisitorsColor}
                          onChange={e => handleCustomTheme(customViewsColor, e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-[10px] font-mono font-semibold">{customVisitorsColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Alternador de Tipo de Gráfico (Área vs Barras) */}
          <div className="flex items-center bg-surface-muted p-1 rounded-xl border border-line">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'area' ? 'bg-white text-primary shadow-2xs' : 'text-muted hover:text-primary'
              }`}
              title="Gráfico de Área Suave (Spline Area)"
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'bar' ? 'bg-white text-primary shadow-2xs' : 'text-muted hover:text-primary'
              }`}
              title="Gráfico de Barras Agrupadas"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Selector de Rango Temporal Umami */}
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
            title="Exportar reporte completo en CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Banner de 4 KPIs Maestros Estilo Umami */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Vistas Totales */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-1.5 hover:border-line/80 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-muted" /> Vistas Totales
            </span>
            <span className="text-[11px] font-bold text-success bg-success/10 px-1.5 py-0.2 rounded flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +16.2%
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl lg:text-3xl text-primary tracking-tight">
            {analyticsData.baseViews.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-light">
            En {posts.length} artículos del blog
          </p>
        </div>

        {/* KPI 2: Visitantes Únicos */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-1.5 hover:border-line/80 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-muted" /> Visitantes Únicos
            </span>
            <span className="text-[11px] font-bold text-success bg-success/10 px-1.5 py-0.2 rounded flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +14.8%
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl lg:text-3xl text-primary tracking-tight">
            {analyticsData.uniqueVisitors.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-light">
            Usuarios sin duplicidad de sesión
          </p>
        </div>

        {/* KPI 3: Tasa de Rebote */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-1.5 hover:border-line/80 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-muted" /> Tasa de Rebote
            </span>
            <span className="text-[11px] font-mono font-bold text-primary bg-surface-muted px-1.5 py-0.2 rounded border border-line">
              Baja
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl lg:text-3xl text-primary tracking-tight">
            {analyticsData.bounceRate}%
          </div>
          <p className="text-[11px] text-muted-light">
            65.8% interactúa con más de 1 post
          </p>
        </div>

        {/* KPI 4: Tiempo Promedio de Visita */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-1.5 hover:border-line/80 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-muted" /> Tiempo Promedio
            </span>
            <span className="text-[11px] font-bold text-success bg-success/10 px-1.5 py-0.2 rounded flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +19.4%
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl lg:text-3xl text-primary tracking-tight">
            3m 14s
          </div>
          <p className="text-[11px] text-muted-light">
            Alta permanencia de lectura en móvil y PC
          </p>
        </div>
      </div>

      {/* 3. Gráfico Principal Umami (Área Spline o Barras con Selector de Series) */}
      <div className="bg-white p-5 lg:p-6 rounded-2xl border border-line shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-base text-primary">
              Tendencia de Visitas & Audiencia
            </h3>
            <p className="text-xs text-muted">Comportamiento temporal de tráfico orgánico y directo</p>
          </div>

          {/* Selector de Series Activas */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveMetricSeries(activeMetricSeries === 'views' ? 'both' : 'views')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                activeMetricSeries === 'views' || activeMetricSeries === 'both'
                  ? 'bg-surface-muted border-line text-primary font-bold'
                  : 'text-muted border-transparent opacity-50'
              }`}
            >
              <span style={{ backgroundColor: activeTheme.viewsColor }} className="w-2.5 h-2.5 rounded-full" />
              <span>Vistas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMetricSeries(activeMetricSeries === 'visitors' ? 'both' : 'visitors')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                activeMetricSeries === 'visitors' || activeMetricSeries === 'both'
                  ? 'bg-surface-muted border-line text-primary font-bold'
                  : 'text-muted border-transparent opacity-50'
              }`}
            >
              <span style={{ backgroundColor: activeTheme.visitorsColor }} className="w-2.5 h-2.5 rounded-full" />
              <span>Visitantes</span>
            </button>
          </div>
        </div>

        {/* Renderizado de Gráficos */}
        {chartType === 'area' ? (
          /* Gráfico de Área Suave SVG */
          <div className="relative h-56 pt-4">
            <svg
              viewBox="0 0 1000 220"
              preserveAspectRatio="none"
              className="w-full h-44 overflow-visible"
            >
              <defs>
                <linearGradient id="umamiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeTheme.viewsColor} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={activeTheme.viewsColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Relleno de Área Suave */}
              <path d={splineAreaPath.area} fill="url(#umamiGradient)" />

              {/* Línea del Gráfico */}
              <path
                d={splineAreaPath.line}
                fill="none"
                stroke={activeTheme.viewsColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Puntos Interactivos */}
              {splineAreaPath.coords.map((c, i) => (
                <circle
                  key={i}
                  cx={c.x}
                  cy={c.y}
                  r="3.5"
                  fill="#ffffff"
                  stroke={activeTheme.viewsColor}
                  strokeWidth="2"
                  className="hover:r-6 transition-all cursor-pointer"
                />
              ))}
            </svg>

            {/* Eje X de Fechas / Horas */}
            <div className="flex items-center justify-between text-[10px] font-mono text-muted pt-3 border-t border-line">
              {analyticsData.timeSeries.filter((_, i) => i % (timeRange === '30d' ? 3 : 1) === 0).map((p, i) => (
                <span key={i}>{p.label}</span>
              ))}
            </div>
          </div>
        ) : (
          /* Gráfico de Barras Agrupadas */
          <div className="h-52 flex items-end gap-1.5 sm:gap-3 pt-6 border-b border-line pb-2">
            {analyticsData.timeSeries.map((p, idx) => {
              const heightViews = Math.max(12, Math.round((p.views / maxPointViews) * 100))
              const heightVisitors = Math.max(8, Math.round((p.visitors / maxPointViews) * 100))

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-[#18181b] text-white text-[10px] p-2 rounded-lg shadow-xl z-30 whitespace-nowrap pointer-events-none">
                    <span className="font-bold">{p.label}</span>
                    <span>{p.views.toLocaleString()} vistas</span>
                    <span className="text-muted-light">{p.visitors.toLocaleString()} visitantes</span>
                  </div>

                  <div className="w-full flex items-end justify-center gap-0.5 h-full">
                    {(activeMetricSeries === 'views' || activeMetricSeries === 'both') && (
                      <div
                        style={{ height: `${heightViews}%`, backgroundColor: activeTheme.viewsColor }}
                        className="w-full rounded-t-sm transition-all hover:opacity-90 shadow-2xs"
                      />
                    )}
                    {(activeMetricSeries === 'visitors' || activeMetricSeries === 'both') && (
                      <div
                        style={{ height: `${heightVisitors}%`, backgroundColor: activeTheme.visitorsColor }}
                        className="w-full rounded-t-sm transition-all hover:opacity-90 shadow-2xs"
                      />
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-muted truncate max-w-full block">
                    {p.label.split(' ')[0]}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. Matriz Multidimensional Umami (Desglose por Pestañas) */}
      <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
        {/* Pestañas de Dimensiones de Datos */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3 bg-[#fafafc] flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl border border-line flex-wrap">
            {[
              { id: 'pages', label: 'Artículos & URLs', icon: FileText },
              { id: 'referrers', label: 'Fuentes de Tráfico', icon: Globe },
              { id: 'countries', label: 'Países', icon: Compass },
              { id: 'devices', label: 'Dispositivos', icon: Monitor },
              { id: 'browsers', label: 'Navegadores', icon: Compass },
              { id: 'os', label: 'Sistemas Operativos', icon: Monitor },
              { id: 'events', label: 'Eventos & Leads', icon: MousePointerClick },
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

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar en tabla..."
              className="pl-8 pr-3 py-1 text-xs bg-white border border-line rounded-lg focus:outline-none focus:border-primary w-40"
            />
          </div>
        </div>

        {/* Cuerpo de la Dimensión Seleccionada */}
        <div className="p-5 lg:p-6">
          {/* Dimensión: Páginas / Artículos */}
          {activeTabDetail === 'pages' && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-muted pb-2 border-b border-line px-2">
                <span className="col-span-6 sm:col-span-7">Artículo / URL</span>
                <span className="col-span-2 text-right">Vistas</span>
                <span className="col-span-2 text-right">Visitantes</span>
                <span className="col-span-2 sm:col-span-1 text-right">Leads</span>
              </div>
              <div className="divide-y divide-line">
                {analyticsData.pages
                  .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.slug.includes(searchQuery.toLowerCase()))
                  .map(page => {
                    const barWidth = Math.round((page.views / (analyticsData.pages[0]?.views || 1)) * 100)
                    return (
                      <div key={page.id} className="py-2.5 px-2 hover:bg-surface-subtle transition-colors rounded-lg relative group">
                        {/* Barra de progreso de fondo discreta */}
                        <div
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: activeTheme.viewsColor,
                          }}
                          className="absolute inset-y-1 left-0 opacity-[0.04] rounded-md pointer-events-none"
                        />
                        <div className="grid grid-cols-12 items-center relative z-10 text-xs">
                          <div className="col-span-6 sm:col-span-7 pr-2">
                            <span className="font-bold text-primary block truncate group-hover:text-primary/70">
                              {page.title}
                            </span>
                            <span className="text-[11px] font-mono text-muted-light block truncate">
                              {page.slug}
                            </span>
                          </div>
                          <span className="col-span-2 text-right font-mono font-bold text-primary">
                            {page.views.toLocaleString()}
                          </span>
                          <span className="col-span-2 text-right font-mono text-muted">
                            {page.visitors.toLocaleString()}
                          </span>
                          <span className="col-span-2 sm:col-span-1 text-right font-mono font-bold text-primary">
                            {page.leads}
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Dimensión: Fuentes de Tráfico (Referrers) */}
          {activeTabDetail === 'referrers' && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-muted pb-2 border-b border-line px-2">
                <span className="col-span-7">Canal de Atribución</span>
                <span className="col-span-3 text-right">Vistas</span>
                <span className="col-span-2 text-right">Porcentaje</span>
              </div>
              <div className="divide-y divide-line">
                {analyticsData.referrers.map((ref, idx) => (
                  <div key={idx} className="py-3 px-2 hover:bg-surface-subtle transition-colors rounded-lg relative">
                    <div
                      style={{ width: `${ref.percent}%`, backgroundColor: activeTheme.viewsColor }}
                      className="absolute inset-y-1 left-0 opacity-[0.04] rounded-md pointer-events-none"
                    />
                    <div className="grid grid-cols-12 items-center relative z-10 text-xs">
                      <div className="col-span-7 flex items-center gap-2">
                        <span className="text-base">{ref.icon}</span>
                        <span className="font-bold text-primary">{ref.name}</span>
                      </div>
                      <span className="col-span-3 text-right font-mono font-bold text-primary">
                        {ref.views.toLocaleString()}
                      </span>
                      <span className="col-span-2 text-right font-mono font-semibold text-muted">
                        {ref.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dimensión: Países */}
          {activeTabDetail === 'countries' && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-muted pb-2 border-b border-line px-2">
                <span className="col-span-7">País</span>
                <span className="col-span-3 text-right">Vistas</span>
                <span className="col-span-2 text-right">Porcentaje</span>
              </div>
              <div className="divide-y divide-line">
                {analyticsData.countries.map((c, idx) => (
                  <div key={idx} className="py-3 px-2 hover:bg-surface-subtle transition-colors rounded-lg relative">
                    <div
                      style={{ width: `${c.percent}%`, backgroundColor: activeTheme.viewsColor }}
                      className="absolute inset-y-1 left-0 opacity-[0.04] rounded-md pointer-events-none"
                    />
                    <div className="grid grid-cols-12 items-center relative z-10 text-xs">
                      <div className="col-span-7 flex items-center gap-2">
                        <span className="text-base">{c.flag}</span>
                        <span className="font-bold text-primary">{c.name}</span>
                        <span className="text-[10px] font-mono text-muted-light">({c.code})</span>
                      </div>
                      <span className="col-span-3 text-right font-mono font-bold text-primary">
                        {c.views.toLocaleString()}
                      </span>
                      <span className="col-span-2 text-right font-mono font-semibold text-muted">
                        {c.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dimensión: Dispositivos */}
          {activeTabDetail === 'devices' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {analyticsData.devices.map((dev, idx) => {
                const Icon = dev.icon
                return (
                  <div key={idx} className="p-4 rounded-2xl border border-line bg-[#fafafc] space-y-2">
                    <div className="flex items-center justify-between">
                      <Icon className="w-5 h-5 text-muted" />
                      <span className="text-xs font-mono font-bold text-primary">{dev.percent}%</span>
                    </div>
                    <div className="font-bold text-primary text-sm">{dev.name}</div>
                    <div className="font-mono text-xs text-muted">
                      {dev.views.toLocaleString()} vistas
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-muted overflow-hidden">
                      <div
                        style={{ width: `${dev.percent}%`, backgroundColor: activeTheme.viewsColor }}
                        className="h-full rounded-full"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Dimensión: Navegadores */}
          {activeTabDetail === 'browsers' && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-muted pb-2 border-b border-line px-2">
                <span className="col-span-7">Navegador</span>
                <span className="col-span-3 text-right">Vistas</span>
                <span className="col-span-2 text-right">Porcentaje</span>
              </div>
              <div className="divide-y divide-line">
                {analyticsData.browsers.map((b, idx) => (
                  <div key={idx} className="py-3 px-2 hover:bg-surface-subtle transition-colors rounded-lg relative">
                    <div
                      style={{ width: `${b.percent}%`, backgroundColor: activeTheme.viewsColor }}
                      className="absolute inset-y-1 left-0 opacity-[0.04] rounded-md pointer-events-none"
                    />
                    <div className="grid grid-cols-12 items-center relative z-10 text-xs">
                      <div className="col-span-7 flex items-center gap-2">
                        <span className="text-base">{b.icon}</span>
                        <span className="font-bold text-primary">{b.name}</span>
                      </div>
                      <span className="col-span-3 text-right font-mono font-bold text-primary">
                        {b.views.toLocaleString()}
                      </span>
                      <span className="col-span-2 text-right font-mono font-semibold text-muted">
                        {b.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dimensión: Sistemas Operativos */}
          {activeTabDetail === 'os' && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-muted pb-2 border-b border-line px-2">
                <span className="col-span-7">Sistema Operativo</span>
                <span className="col-span-3 text-right">Vistas</span>
                <span className="col-span-2 text-right">Porcentaje</span>
              </div>
              <div className="divide-y divide-line">
                {analyticsData.osList.map((os, idx) => (
                  <div key={idx} className="py-3 px-2 hover:bg-surface-subtle transition-colors rounded-lg relative">
                    <div
                      style={{ width: `${os.percent}%`, backgroundColor: activeTheme.viewsColor }}
                      className="absolute inset-y-1 left-0 opacity-[0.04] rounded-md pointer-events-none"
                    />
                    <div className="grid grid-cols-12 items-center relative z-10 text-xs">
                      <div className="col-span-7 flex items-center gap-2">
                        <span className="text-base">{os.icon}</span>
                        <span className="font-bold text-primary">{os.name}</span>
                      </div>
                      <span className="col-span-3 text-right font-mono font-bold text-primary">
                        {os.views.toLocaleString()}
                      </span>
                      <span className="col-span-2 text-right font-mono font-semibold text-muted">
                        {os.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dimensión: Eventos Personalizados (Goals & Conversiones) */}
          {activeTabDetail === 'events' && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-muted pb-2 border-b border-line px-2">
                <span className="col-span-7">Evento / Objetivo</span>
                <span className="col-span-3 text-right">Disparos</span>
                <span className="col-span-2 text-right">Categoría</span>
              </div>
              <div className="divide-y divide-line">
                {analyticsData.events.map((ev, idx) => (
                  <div key={idx} className="py-3 px-2 hover:bg-surface-subtle transition-colors rounded-lg">
                    <div className="grid grid-cols-12 items-center text-xs">
                      <div className="col-span-7">
                        <span className="font-bold text-primary block">{ev.label}</span>
                        <span className="text-[10px] font-mono text-muted-light block">{ev.name}</span>
                      </div>
                      <span className="col-span-3 text-right font-mono font-bold text-primary">
                        {ev.count.toLocaleString()}
                      </span>
                      <div className="col-span-2 text-right">
                        <span className="text-[10px] font-semibold text-muted bg-surface-muted px-2 py-0.5 rounded border border-line">
                          {ev.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
