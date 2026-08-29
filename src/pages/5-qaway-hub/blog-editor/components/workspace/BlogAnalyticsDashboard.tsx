import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  Eye,
  Clock,
  ArrowUpRight,
  Download,
  Search,
  BarChart3,
  FileText,
  MousePointerClick,
  Mail,
  Zap,
  Check,
  ChevronDown,
} from 'lucide-react'
import { useBlog } from '../../context/BlogContext'
import { useNavigate } from 'react-router-dom'

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all'

export interface ColorPalettePreset {
  id: string
  name: string
  desc: string
  primary: string // Color para Lecturas / Vistas principales
  secondary: string // Color armónico para Leads / Conversión
  funnel: string // Color para barras de scroll y KPIs
}

export const PRESET_PALETTES: ColorPalettePreset[] = [
  {
    id: 'monochrome',
    name: 'Monocromático Grafito',
    desc: 'Máximo confort visual, sobrio estilo Apple & Linear',
    primary: '#27272a', // Zinc 800
    secondary: '#71717a', // Zinc 500
    funnel: '#3f3f46',
  },
  {
    id: 'indigo',
    name: 'Índigo / Océano',
    desc: 'Armonía analógica azul, estándar SaaS corporativo',
    primary: '#3b82f6', // Blue 500
    secondary: '#93c5fd', // Blue 300
    funnel: '#2563eb',
  },
  {
    id: 'slate',
    name: 'Pizarra & Acero',
    desc: 'Tonos fríos, limpios y equilibrados',
    primary: '#475569', // Slate 600
    secondary: '#94a3b8', // Slate 400
    funnel: '#334155',
  },
  {
    id: 'emerald',
    name: 'Esmeralda & Menta',
    desc: 'Armonía de crecimiento suave y descansada',
    primary: '#059669', // Emerald 600
    secondary: '#6ee7b7', // Emerald 300
    funnel: '#047857',
  },
  {
    id: 'brand',
    name: 'Qaway Calibrado',
    desc: 'Néctar editorial suave con base carbón neutra',
    primary: '#ea580c', // Orange 600 suave
    secondary: '#71717a', // Zinc 500
    funnel: '#c2410c',
  },
]

export default function BlogAnalyticsDashboard() {
  const { posts, categories } = useBlog()
  const navigate = useNavigate()

  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'views' | 'leads' | 'ctr' | 'score' | 'time'>('views')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Sistema de Paleta de Colores de Gráficos (Persistente)
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(() => {
    return localStorage.getItem('qaway_analytics_palette_id') || 'monochrome'
  })
  const [customPrimary, setCustomPrimary] = useState<string>(() => {
    return localStorage.getItem('qaway_analytics_custom_primary') || '#27272a'
  })
  const [customSecondary, setCustomSecondary] = useState<string>(() => {
    return localStorage.getItem('qaway_analytics_custom_secondary') || '#71717a'
  })
  const [isPaletteMenuOpen, setIsPaletteMenuOpen] = useState(false)
  const paletteMenuRef = useRef<HTMLDivElement>(null)

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (paletteMenuRef.current && !paletteMenuRef.current.contains(e.target as Node)) {
        setIsPaletteMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Paleta activa calculada
  const activePalette = useMemo(() => {
    if (selectedPaletteId === 'custom') {
      return {
        id: 'custom',
        name: 'Personalizado Manual',
        desc: 'Colores elegidos a medida',
        primary: customPrimary,
        secondary: customSecondary,
        funnel: customPrimary,
      }
    }
    return PRESET_PALETTES.find(p => p.id === selectedPaletteId) || PRESET_PALETTES[0]
  }, [selectedPaletteId, customPrimary, customSecondary])

  const handleSelectPreset = (presetId: string) => {
    setSelectedPaletteId(presetId)
    localStorage.setItem('qaway_analytics_palette_id', presetId)
    setIsPaletteMenuOpen(false)
  }

  const handleCustomColorChange = (primary: string, secondary: string) => {
    setSelectedPaletteId('custom')
    setCustomPrimary(primary)
    setCustomSecondary(secondary)
    localStorage.setItem('qaway_analytics_palette_id', 'custom')
    localStorage.setItem('qaway_analytics_custom_primary', primary)
    localStorage.setItem('qaway_analytics_custom_secondary', secondary)
  }

  // Generador determinístico de métricas realistas basado en la longitud, fecha y calidad de cada post
  const postsWithMetrics = useMemo(() => {
    return posts.map(post => {
      const words = (post.body || post.contentHtml || '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length
      const charCount = post.title.length
      const hasBrackets = /\[.*\]/.test(post.title)
      const hasCta = /data-type="cta-block"|<a[^>]*href=/i.test(post.contentHtml || '')
      const hasLeadForm = /lead-form-block/i.test(post.contentHtml || '')
      const hasInfographic = /data-infographic|infographic-block/i.test(post.contentHtml || '')

      // Cálculo de calidad HubSpot
      let qualityScore = 65
      if (charCount >= 20 && charCount <= 60) qualityScore += 10
      if (hasBrackets) qualityScore += 10
      if (words >= 300) qualityScore += 5
      if (hasCta) qualityScore += 5
      if (hasInfographic) qualityScore += 5

      // Vistas base escaladas por calidad y estado
      const isPub = post.status === 'publicado'
      const baseMultiplier = isPub ? (timeRange === '7d' ? 1 : timeRange === '30d' ? 3.8 : timeRange === '90d' ? 9.5 : 18) : 0.05
      const seed = (post.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 50) + 50
      const views = Math.round(seed * 32 * baseMultiplier * (qualityScore / 75))
      const avgTimeMinutes = Math.max(1.5, Math.min(6.2, Number((words / 190).toFixed(1))))
      const readRate = Math.min(88, Math.round(55 + (qualityScore / 4)))

      // Clics y leads
      const ctr = hasCta ? Number((4.5 + (seed % 6)).toFixed(1)) : 1.2
      const ctaClicks = Math.round(views * (ctr / 100))
      const conversionRate = hasLeadForm ? Number((2.8 + (seed % 4) * 0.5).toFixed(1)) : Number(((ctr * 0.35)).toFixed(1))
      const leads = Math.round(views * (conversionRate / 100))

      return {
        ...post,
        words,
        qualityScore,
        views,
        avgTimeMinutes,
        readRate,
        ctaClicks,
        ctr,
        leads,
        conversionRate,
      }
    })
  }, [posts, timeRange])

  // Filtrado y ordenación
  const filteredPosts = useMemo(() => {
    return postsWithMetrics
      .filter(p => {
        const matchesCat = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase()
        const matchesSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.slug.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCat && matchesSearch
      })
      .sort((a, b) => {
        let valA = 0
        let valB = 0
        if (sortBy === 'views') {
          valA = a.views
          valB = b.views
        } else if (sortBy === 'leads') {
          valA = a.leads
          valB = b.leads
        } else if (sortBy === 'ctr') {
          valA = a.ctr
          valB = b.ctr
        } else if (sortBy === 'score') {
          valA = a.qualityScore
          valB = b.qualityScore
        } else if (sortBy === 'time') {
          valA = a.avgTimeMinutes
          valB = b.avgTimeMinutes
        }
        return sortOrder === 'desc' ? valB - valA : valA - valB
      })
  }, [postsWithMetrics, selectedCategory, searchQuery, sortBy, sortOrder])

  // Totales de KPIs
  const totals = useMemo(() => {
    const totalViews = postsWithMetrics.reduce((acc, p) => acc + p.views, 0)
    const totalLeads = postsWithMetrics.reduce((acc, p) => acc + p.leads, 0)
    const totalClicks = postsWithMetrics.reduce((acc, p) => acc + p.ctaClicks, 0)
    const avgScore = Math.round(
      postsWithMetrics.reduce((acc, p) => acc + p.qualityScore, 0) / Math.max(1, postsWithMetrics.length)
    )
    const avgReadTime = (
      postsWithMetrics.reduce((acc, p) => acc + p.avgTimeMinutes, 0) / Math.max(1, postsWithMetrics.length)
    ).toFixed(1)
    const avgCtr = (
      postsWithMetrics.reduce((acc, p) => acc + p.ctr, 0) / Math.max(1, postsWithMetrics.length)
    ).toFixed(1)

    return {
      totalViews,
      totalLeads,
      totalClicks,
      avgScore,
      avgReadTime,
      avgCtr,
    }
  }, [postsWithMetrics])

  // Días para el gráfico de barras interactivo
  const trafficChartDays = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 14 : 20
    const data = []
    const baseDaily = Math.round(totals.totalViews / days)
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayName = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
      const variance = 0.75 + ((i * 17) % 50) / 100
      const dayViews = Math.round(baseDaily * variance)
      const dayLeads = Math.round(dayViews * 0.038)
      data.push({ label: dayName, views: dayViews, leads: dayLeads })
    }
    return data
  }, [totals.totalViews, timeRange])

  const maxDailyViews = Math.max(...trafficChartDays.map(d => d.views), 1)

  // Exportar métricas a CSV
  const handleExportCsv = () => {
    const headers = 'ID,Título,Slug,Categoría,Estado,Palabras,Score HubSpot,Vistas,Tiempo Lectura (min),Tasa Lectura (%),Clics CTA,CTR (%),Leads,Tasa Conversión (%)\n'
    const rows = filteredPosts
      .map(p =>
        `"${p.id}","${p.title.replace(/"/g, '""')}","${p.slug}","${p.category}","${p.status}",${p.words},${p.qualityScore},${p.views},${p.avgTimeMinutes},${p.readRate},${p.ctaClicks},${p.ctr},${p.leads},${p.conversionRate}`
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qaway_blog_analytics_${timeRange}.csv`
    a.click()
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#fafafc] p-6 lg:p-8 space-y-6 font-sans">
      {/* 1. Header del Módulo de Métricas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-line shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted mb-1">
            <BarChart3 className="w-4 h-4 text-muted" />
            <span>Suite de Analítica & Rendimiento Editorial</span>
          </div>
          <h2 className="text-xl font-display font-extrabold text-primary tracking-tight">
            Métricas de Contenidos & Conversión
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Analiza el impacto orgánico, la profundidad de lectura y la captación de leads de tus artículos.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Selector de Paleta y Armonía de Color de Gráficos */}
          <div className="relative" ref={paletteMenuRef}>
            <button
              type="button"
              onClick={() => setIsPaletteMenuOpen(!isPaletteMenuOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-line bg-white hover:bg-surface-muted text-xs font-semibold text-primary shadow-2xs transition-colors cursor-pointer"
              title="Personalizar paleta y armonía de color de los gráficos"
            >
              <div className="flex items-center gap-1">
                <span
                  style={{ backgroundColor: activePalette.primary }}
                  className="w-3 h-3 rounded-full border border-black/10"
                />
                <span
                  style={{ backgroundColor: activePalette.secondary }}
                  className="w-3 h-3 rounded-full border border-black/10 -ml-1.5"
                />
              </div>
              <span className="hidden sm:inline text-xs">{activePalette.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted" />
            </button>

            {/* Dropdown de Temas Armónicos */}
            {isPaletteMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-line shadow-xl z-40 p-3 space-y-3 animate-in fade-in duration-150">
                <div>
                  <span className="text-xs font-bold text-primary block">Paleta de Color de Gráficos</span>
                  <span className="text-[11px] text-muted block">Diseños armónicos y descansados para la vista</span>
                </div>

                {/* Lista de Presets */}
                <div className="space-y-1.5">
                  {PRESET_PALETTES.map(preset => {
                    const isSelected = selectedPaletteId === preset.id
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-surface-muted border border-line font-bold text-primary shadow-2xs'
                            : 'hover:bg-surface-subtle text-muted hover:text-primary'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              style={{ backgroundColor: preset.primary }}
                              className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                            />
                            <span
                              style={{ backgroundColor: preset.secondary }}
                              className="w-4 h-4 rounded-full border border-black/10 shadow-2xs -ml-2"
                            />
                          </div>
                          <div>
                            <span className="text-xs block font-semibold text-primary">{preset.name}</span>
                            <span className="text-[10px] text-muted-light block leading-tight">{preset.desc}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </button>
                    )
                  })}
                </div>

                {/* Personalizador Manual */}
                <div className="pt-2 border-t border-line space-y-2">
                  <span className="text-[11px] font-bold text-primary block">Personalizar a Medida:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-muted block mb-1">Lecturas (Principal):</span>
                      <div className="flex items-center gap-1.5 bg-surface-muted p-1 rounded-lg border border-line">
                        <input
                          type="color"
                          value={customPrimary}
                          onChange={e => handleCustomColorChange(e.target.value, customSecondary)}
                          className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-[10px] font-mono text-primary font-semibold">{customPrimary}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted block mb-1">Leads (Secundario):</span>
                      <div className="flex items-center gap-1.5 bg-surface-muted p-1 rounded-lg border border-line">
                        <input
                          type="color"
                          value={customSecondary}
                          onChange={e => handleCustomColorChange(customPrimary, e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-[10px] font-mono text-primary font-semibold">{customSecondary}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selector de Rango Temporal */}
          <div className="flex items-center bg-surface-muted p-1 rounded-xl border border-line text-xs font-semibold">
            {[
              { id: '7d', label: '7 Días' },
              { id: '30d', label: '30 Días' },
              { id: '90d', label: '90 Días' },
              { id: '1y', label: 'Año' },
              { id: 'all', label: 'Total' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeRange(tab.id as TimeRange)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  timeRange === tab.id
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-muted hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-line bg-white hover:bg-surface-muted text-xs font-bold text-primary shadow-2xs transition-colors cursor-pointer"
            title="Descargar reporte completo en formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-muted" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Master KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Lecturas Totales */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-2 hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-muted" /> Vistas Totales
            </span>
            <span className="inline-flex items-center text-[11px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +18.4%
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl lg:text-3xl text-primary tracking-tight">
            {totals.totalViews.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-light">
            En {posts.length} artículos ({posts.filter(p => p.status === 'publicado').length} publicados).
          </p>
        </div>

        {/* KPI 2: Tiempo Medio de Lectura */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-2 hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-muted" /> Tiempo de Lectura
            </span>
            <span className="inline-flex items-center text-[11px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +12.1%
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl lg:text-3xl text-primary tracking-tight">
            ~{totals.avgReadTime} min
          </div>
          <p className="text-[11px] text-muted-light">
            74.8% de tasa promedio de finalización completa.
          </p>
        </div>

        {/* KPI 3: Leads & Suscriptores */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-2 hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-muted" /> Leads Captados
            </span>
            <span className="inline-flex items-center text-[11px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +24.6%
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl lg:text-3xl text-primary tracking-tight">
            {totals.totalLeads.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-light">
            Desde formularios de suscripción y descarga.
          </p>
        </div>

        {/* KPI 4: Clics en CTA & Score */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-xs space-y-2 hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <MousePointerClick className="w-4 h-4 text-muted" /> Clics en CTAs
            </span>
            <span className="inline-flex items-center text-[11px] font-bold text-primary bg-surface-muted border border-line px-1.5 py-0.5 rounded font-mono">
              CTR {totals.avgCtr}%
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl lg:text-3xl text-primary tracking-tight">
            {totals.totalClicks.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-light">
            Score editorial promedio: <strong>{totals.avgScore}/100</strong>.
          </p>
        </div>
      </div>

      {/* 3. Gráficos Interactivos con Colores Armónicos y Descansados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Evolución Temporal de Lecturas */}
        <div className="lg:col-span-2 bg-white p-5 lg:p-6 rounded-2xl border border-line shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base text-primary">
                Evolución de Tráfico & Lecturas Diarias
              </h3>
              <p className="text-xs text-muted">Lecturas efectivas y leads generados por día</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span
                  style={{ backgroundColor: activePalette.primary }}
                  className="w-2.5 h-2.5 rounded-full"
                />
                <span className="text-muted font-medium">Lecturas</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  style={{ backgroundColor: activePalette.secondary }}
                  className="w-2.5 h-2.5 rounded-full"
                />
                <span className="text-muted font-medium">Leads</span>
              </span>
            </div>
          </div>

          {/* Barras de tráfico responsivas con paleta armónica */}
          <div className="h-48 flex items-end gap-1.5 sm:gap-2.5 pt-6 border-b border-line pb-2">
            {trafficChartDays.map((d, idx) => {
              const heightPercent = Math.max(12, Math.round((d.views / maxDailyViews) * 100))
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                  {/* Tooltip hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-[#18181b] text-white text-[10px] p-2 rounded-lg shadow-xl z-30 whitespace-nowrap pointer-events-none">
                    <span className="font-bold">{d.label}</span>
                    <span>{d.views.toLocaleString()} lecturas</span>
                    <span className="text-white/80 font-semibold">{d.leads} leads</span>
                  </div>

                  <div
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: activePalette.primary,
                    }}
                    className="w-full rounded-t-md transition-all cursor-pointer relative hover:opacity-90 shadow-2xs"
                  >
                    {/* Barra de leads armónica proporcional */}
                    <div
                      style={{
                        height: `${Math.min(100, Math.max(15, (d.leads / (d.views * 0.05 || 1)) * 30))}%`,
                        backgroundColor: activePalette.secondary,
                      }}
                      className="w-full rounded-t-md absolute bottom-0 opacity-95"
                    />
                  </div>
                  <span className="text-[9px] font-mono text-muted truncate max-w-full block">
                    {d.label.split(' ')[0]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Gráfico 2: Embudo de Retención y Scroll Depth */}
        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-line shadow-xs space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm sm:text-base text-primary">
              Embudo de Retención de Lectura
            </h3>
            <p className="text-xs text-muted">Profundidad de scroll a lo largo del post</p>
          </div>

          <div className="space-y-3 pt-1 text-xs font-medium">
            {[
              { label: '1. Entrada / Titular', percent: 100, desc: 'Aterrizan en la portada' },
              { label: '2. Primeros Párrafos (25%)', percent: 84, desc: 'Pasan el gancho inicial' },
              { label: '3. Núcleo & CTA Pasivo (50%)', percent: 68, desc: 'Leen contenido clave' },
              { label: '4. Infografías & Formulario (75%)', percent: 52, desc: 'Interactúan con recursos' },
              { label: '5. Conclusión & CTA Hero (100%)', percent: 41, desc: 'Llegan al final del post' },
            ].map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-primary font-semibold">{step.label}</span>
                  <span className="font-mono font-bold text-primary">{step.percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
                  <div
                    style={{
                      width: `${step.percent}%`,
                      backgroundColor: activePalette.funnel,
                    }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-surface-muted rounded-xl border border-line text-[11px] text-muted flex items-start gap-2">
            <Zap className="w-4 h-4 text-muted shrink-0 mt-0.5" />
            <span>
              <strong>Tip de HubSpot:</strong> Ubicar un <em>CTA Pasivo</em> en el 50% duplica la conversión respecto a ponerlo solo al final.
            </span>
          </div>
        </div>
      </div>

      {/* 4. Tabla Detallada de Rendimiento por Artículo */}
      <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden space-y-4 p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
          <div>
            <h3 className="font-display font-bold text-base text-primary">
              Rendimiento Detallado por Artículo
            </h3>
            <p className="text-xs text-muted">
              Mostrando {filteredPosts.length} de {posts.length} publicaciones.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Buscador de artículos */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por título..."
                className="pl-8 pr-3 py-1.5 text-xs bg-surface-muted border border-line rounded-lg focus:outline-none focus:border-primary w-48"
              />
            </div>

            {/* Filtro por Categoría */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-surface-muted border border-line rounded-lg font-semibold text-primary focus:outline-none cursor-pointer"
            >
              <option value="all">Todas las Categorías</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla responsive con scroll horizontal suave */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-line text-muted font-bold uppercase tracking-wider text-[10px] bg-[#fafafc]">
                <th className="py-3 px-3">Artículo & Categoría</th>
                <th
                  onClick={() => {
                    if (sortBy === 'score') setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))
                    else {
                      setSortBy('score')
                      setSortOrder('desc')
                    }
                  }}
                  className="py-3 px-3 cursor-pointer hover:text-primary text-center"
                >
                  Score HubSpot {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'views') setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))
                    else {
                      setSortBy('views')
                      setSortOrder('desc')
                    }
                  }}
                  className="py-3 px-3 cursor-pointer hover:text-primary text-right"
                >
                  Vistas {sortBy === 'views' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'time') setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))
                    else {
                      setSortBy('time')
                      setSortOrder('desc')
                    }
                  }}
                  className="py-3 px-3 cursor-pointer hover:text-primary text-right"
                >
                  Tiempo Medio {sortBy === 'time' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'ctr') setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))
                    else {
                      setSortBy('ctr')
                      setSortOrder('desc')
                    }
                  }}
                  className="py-3 px-3 cursor-pointer hover:text-primary text-right"
                >
                  Clics CTA (CTR) {sortBy === 'ctr' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'leads') setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))
                    else {
                      setSortBy('leads')
                      setSortOrder('desc')
                    }
                  }}
                  className="py-3 px-3 cursor-pointer hover:text-primary text-right"
                >
                  Leads ({sortBy === 'leads' ? (sortOrder === 'desc' ? '↓' : '↑') : ''})
                </th>
                <th className="py-3 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredPosts.map(post => (
                <tr key={post.id} className="hover:bg-surface-subtle transition-colors group">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      {post.coverUrl ? (
                        <img
                          src={post.coverUrl}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-line shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface-muted border border-line flex items-center justify-center text-[10px] text-muted shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0 max-w-[260px] sm:max-w-sm">
                        <span className="font-bold text-primary block truncate group-hover:text-primary/70 transition-colors">
                          {post.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-semibold text-muted bg-surface-muted px-1.5 py-0.2 rounded border border-line">
                            {post.category}
                          </span>
                          <span className="text-[10px] font-mono text-muted-light">
                            {post.words} pal.
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block font-mono font-bold text-[11px] px-2 py-0.5 rounded-full ${
                        post.qualityScore >= 80
                          ? 'bg-success/15 text-success'
                          : post.qualityScore >= 50
                          ? 'bg-warning/15 text-amber-700'
                          : 'bg-danger/15 text-danger'
                      }`}
                    >
                      {post.qualityScore}/100
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-primary">
                    {post.views.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-muted">
                    ~{post.avgTimeMinutes} min
                  </td>

                  <td className="py-3 px-3 text-right">
                    <span className="font-mono font-bold text-primary">{post.ctaClicks}</span>{' '}
                    <span className="text-[10px] font-mono text-muted-light">({post.ctr}%)</span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-primary">
                    {post.leads}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => navigate(`/editor/${post.id}`)}
                      className="px-2.5 py-1 rounded-lg border border-line bg-white hover:bg-surface-muted text-xs font-bold text-primary transition-all cursor-pointer shadow-2xs"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
