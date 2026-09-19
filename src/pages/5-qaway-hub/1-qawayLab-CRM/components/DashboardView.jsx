import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, TrendingUp, Users, Percent,
  ArrowUpRight, Award, Megaphone, Settings2, Eye, EyeOff,
  Target, MessageSquare, Clock, BarChart3, Plus, Activity, X,
  FileText, Filter, MoreVertical, Calendar, ChevronDown, Search, Check, Layers, Video, Globe
} from 'lucide-react'
import { useCRM } from '../context/CRMContext'
import MetricBuilderModal from './MetricBuilderModal'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const DEMO_CAMPAIGNS = [
  {
    id: 'camp-meta-1',
    name: 'Qaway Lab_Ventas_Individuales',
    platform: 'Meta Ads (Instagram & Facebook)',
    channel: 'meta_ads',
    status: 'Activa',
    spend: 340.00,
    revenue: 1490.00,
    leadsCount: 38,
    impressions: 24500,
    clicks: 1280,
    adSets: [
      { 
        id: 'adset-meta-1', 
        name: 'B2B Emprendedores (25-45 años)', 
        ads: [
          { id: 'ad-meta-1', name: 'Video Reel Alto Rendimiento' },
          { id: 'ad-meta-2', name: 'Carrusel Casos de Éxito' }
        ]
      },
      { 
        id: 'adset-meta-2', 
        name: 'Retargeting Visitantes Web', 
        ads: [
          { id: 'ad-meta-3', name: 'Banner Descuento Exclusivo' }
        ]
      }
    ]
  },
  {
    id: 'camp-meta-2',
    name: 'Identidad Visual & Branding Digital',
    platform: 'Meta Ads (Click-to-WhatsApp CTWA)',
    channel: 'whatsapp',
    status: 'Activa',
    spend: 210.00,
    revenue: 890.00,
    leadsCount: 24,
    impressions: 18200,
    clicks: 940,
    adSets: [
      { 
        id: 'adset-meta-3', 
        name: 'Intereses Diseño & Marcas', 
        ads: [
          { id: 'ad-meta-4', name: 'Video Testimonio Cliente' }
        ]
      }
    ]
  },
  {
    id: 'camp-b2b-notion',
    name: 'Plantillas Notion B2B Enterprise',
    platform: 'TikTok Ads & Google Search',
    channel: 'tiktok',
    status: 'Pausada',
    spend: 150.00,
    revenue: 520.00,
    leadsCount: 16,
    impressions: 9800,
    clicks: 410,
    adSets: [
      { 
        id: 'adset-notion-1', 
        name: 'Productividad Equipos Tech', 
        ads: [
          { id: 'ad-notion-1', name: 'Demo Pantalla Notion' }
        ]
      }
    ]
  }
]

const TIME_LABELS = {
  realtime: 'Tiempo Real',
  today: 'Hoy',
  '7days': 'Últimos 7 días',
  '30days': 'Últimos 30 días',
  all: 'Histórico Completo'
}

const CHANNEL_LABELS = {
  all: 'Todos los canales',
  meta_ads: 'Meta Ads (FB/IG)',
  whatsapp: 'WhatsApp Cloud API',
  web: 'Formulario Web',
  tiktok: 'TikTok Ads'
}

export default function DashboardView() {
  const { campaigns, leads, currentRole, customMetrics, removeCustomMetric } = useCRM()
  
  // 1. Estados y Refs para la Cascada de Filtros
  const [channelFilter, setChannelFilter] = useState('all')
  const [showChannelMenu, setShowChannelMenu] = useState(false)
  const channelMenuRef = useRef(null)

  const [selectedCampaignIds, setSelectedCampaignIds] = useState([])
  const [showCampaignMenu, setShowCampaignMenu] = useState(false)
  const [campaignSearch, setCampaignSearch] = useState('')
  const campaignMenuRef = useRef(null)

  const [selectedAdSetId, setSelectedAdSetId] = useState('all')
  const [showAdSetMenu, setShowAdSetMenu] = useState(false)
  const adSetMenuRef = useRef(null)

  const [selectedAdId, setSelectedAdId] = useState('all')
  const [showAdMenu, setShowAdMenu] = useState(false)
  const adMenuRef = useRef(null)

  // 2. Filtro temporal general
  const [timeRange, setTimeRange] = useState('realtime')
  const [showTimeMenu, setShowTimeMenu] = useState(false)
  const timeMenuRef = useRef(null)

  // 3. Modal de métricas personalizadas (Administrador)
  const [isMetricBuilderOpen, setIsMetricBuilderOpen] = useState(false)

  // 4. Estados y Refs interactivos para los 3 gráficos inferiores
  const [rendimientoPeriod, setRendimientoPeriod] = useState('Mensual')
  const [showRendimientoMenu, setShowRendimientoMenu] = useState(false)
  const rendimientoMenuRef = useRef(null)
  
  const [canalTimeframe, setCanalTimeframe] = useState('Este mes')
  const [showCanalMenu, setShowCanalMenu] = useState(false)
  const canalMenuRef = useRef(null)
  
  const [etapaTimeframe, setEtapaTimeframe] = useState('Este mes')
  const [showEtapaMenu, setShowEtapaMenu] = useState(false)
  const etapaMenuRef = useRef(null)

  // 5. Listener Global Click Outside (Cierre automático de menús al hacer clic fuera)
  useEffect(() => {
    function handleClickOutside(event) {
      if (campaignMenuRef.current && !campaignMenuRef.current.contains(event.target)) setShowCampaignMenu(false)
      if (channelMenuRef.current && !channelMenuRef.current.contains(event.target)) setShowChannelMenu(false)
      if (adSetMenuRef.current && !adSetMenuRef.current.contains(event.target)) setShowAdSetMenu(false)
      if (adMenuRef.current && !adMenuRef.current.contains(event.target)) setShowAdMenu(false)
      if (timeMenuRef.current && !timeMenuRef.current.contains(event.target)) setShowTimeMenu(false)
      if (rendimientoMenuRef.current && !rendimientoMenuRef.current.contains(event.target)) setShowRendimientoMenu(false)
      if (canalMenuRef.current && !canalMenuRef.current.contains(event.target)) setShowCanalMenu(false)
      if (etapaMenuRef.current && !etapaMenuRef.current.contains(event.target)) setShowEtapaMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Colores premium de la marca
  const COLORS = ['#ff4b0b', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563']

  // Campañas efectivas
  const effectiveCampaigns = (campaigns && campaigns.length > 0) ? campaigns : DEMO_CAMPAIGNS

  // ----------------------------------------------------
  // LOGICA DINÁMICA DE CASCADA Y MULTISELECCIÓN
  // ----------------------------------------------------
  // Paso 1: Campañas compatibles con el Canal seleccionado
  const campaignsMatchingChannel = effectiveCampaigns.filter(c => {
    if (channelFilter === 'all') return true
    return c.channel === channelFilter || (c.platform && c.platform.toLowerCase().includes(channelFilter.toLowerCase()))
  })

  // Paso 2: Multiselección de campañas (si está vacío, se consideran todas las del canal)
  const isAllCampaignsSelected = selectedCampaignIds.length === 0
  const activeCampaignsList = isAllCampaignsSelected
    ? campaignsMatchingChannel
    : campaignsMatchingChannel.filter(c => selectedCampaignIds.includes(c.id))

  // Paso 3: Obtener Conjuntos de Anuncios (AdSets) de las campañas seleccionadas
  const availableAdSets = activeCampaignsList.flatMap(c => (c.adSets || []).map(as => ({ ...as, campaignName: c.name })))

  // Paso 4: Obtener Anuncios individuales si hay un AdSet seleccionado
  const availableAds = selectedAdSetId === 'all'
    ? availableAdSets.flatMap(as => (as.ads || []).map(ad => ({ ...ad, adSetName: as.name })))
    : (availableAdSets.find(as => as.id === selectedAdSetId)?.ads || [])

  // Alternar selección múltiple de campañas
  const toggleCampaignSelection = (campId) => {
    setSelectedAdSetId('all')
    setSelectedAdId('all')
    if (campId === 'all') {
      setSelectedCampaignIds([])
      return
    }
    setSelectedCampaignIds(prev => 
      prev.includes(campId) ? prev.filter(id => id !== campId) : [...prev, campId]
    )
  }

  // Filtrado de Leads cruzado
  const filteredLeads = leads.filter(l => {
    // 1. Canal
    if (channelFilter !== 'all') {
      const leadChan = (l.channel || l.metadata?.channel || (l.whatsapp ? 'whatsapp' : 'web')).toLowerCase()
      if (!leadChan.includes(channelFilter.toLowerCase())) return false
    }

    // 2. Campañas (Multiselección)
    if (!isAllCampaignsSelected) {
      const leadCampId = l.campaignId || l.campaign_id
      const leadCampName = (l.campaignName || l.campaign_name || '').toLowerCase()
      const matchesAny = activeCampaignsList.some(c => 
        c.id === leadCampId || leadCampName.includes(c.name.toLowerCase())
      )
      if (!matchesAny) return false
    }

    // 3. Período de Tiempo
    if (timeRange === 'today') {
      const today = new Date().toDateString()
      if (new Date(l.created_at || Date.now()).toDateString() !== today) return false
    } else if (timeRange === '7days') {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      if (new Date(l.created_at || Date.now()).getTime() < weekAgo) return false
    } else if (timeRange === '30days') {
      const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
      if (new Date(l.created_at || Date.now()).getTime() < monthAgo) return false
    }

    return true
  })

  const totalSpend = activeCampaignsList.reduce((sum, c) => sum + (c.spend || 0), 0)
  const totalRevenue = activeCampaignsList.reduce((sum, c) => sum + (c.revenue || 0), 0)
  const totalLeads = filteredLeads.length
  const wonLeads = filteredLeads.filter(l => l.status === 'ganado').length
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0.0'
  const ticketPromedio = wonLeads > 0 ? Math.round(totalRevenue / wonLeads) : 0
  const valorPipeline = filteredLeads.reduce((sum, l) => sum + (Number(l.budget) || 0), 0)

  // Mock data para gráficos
  const rendimientoData = [
    { name: 'Dic', ingresos: 200, ganadas: 150 },
    { name: 'Ene', ingresos: 350, ganadas: 250 },
    { name: 'Feb', ingresos: 600, ganadas: 400 },
    { name: 'Mar', ingresos: 500, ganadas: 300 },
    { name: 'Abr', ingresos: 900, ganadas: 700 },
    { name: 'May', ingresos: totalRevenue / 1000, ganadas: wonLeads * 100 },
  ]

  const channelData = [
    { name: 'Referidos', ganado: 420000, curso: 180000 },
    { name: 'Inbound / Web', ganado: 312000, curso: 100000 },
    { name: 'Email Marketing', ganado: 198000, curso: 50000 },
    { name: 'Ads (Dinámico)', ganado: totalRevenue, curso: valorPipeline },
  ]

  // Distribución dinámica por etapa real
  const leadsByStatus = [
    { name: 'Nuevo Lead', value: filteredLeads.filter(l => l.status === 'new').length },
    { name: 'Calificación', value: filteredLeads.filter(l => l.status === 'contactado').length },
    { name: 'Propuesta', value: filteredLeads.filter(l => l.status === 'propuesta').length },
    { name: 'Negociación', value: filteredLeads.filter(l => l.status === 'negociacion').length },
    { name: 'Cierre', value: wonLeads }
  ]
  
  const pieData = leadsByStatus.filter(l => l.value > 0)
  const formatCurrency = (val) => `S/${(val / 1000)}K`

  // Barra de Filtros Encadenados Progresivos (Canal -> Campaña -> Conjunto -> Anuncio)
  const renderCascadingFilterBar = () => {
    const activeCount = activeCampaignsList.filter(c => c.status === 'Activa').length
    const hasAnyFilter = channelFilter !== 'all' || !isAllCampaignsSelected || selectedAdSetId !== 'all' || selectedAdId !== 'all'

    return (
      <div className="flex flex-wrap items-center justify-between gap-3 mb-7 bg-white border border-zinc-200/80 px-3.5 py-2.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap items-center gap-2 relative">
          
          {/* 1. CANAL DE ORIGEN */}
          <div className="relative" ref={channelMenuRef}>
            <button
              onClick={() => {
                setShowChannelMenu(!showChannelMenu)
                setShowCampaignMenu(false)
                setShowAdSetMenu(false)
                setShowAdMenu(false)
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-[0.98] ${
                channelFilter !== 'all' 
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs' 
                  : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200/80 text-zinc-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5 opacity-70" />
              <span>
                {channelFilter === 'all' ? 'Canal: Todos' : (CHANNEL_LABELS[channelFilter] || channelFilter)}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {showChannelMenu && (
              <div className="absolute left-0 top-[calc(100%+6px)] w-52 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 p-1.5 text-xs animate-in fade-in duration-150">
                <p className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Canal de Origen</p>
                {Object.entries(CHANNEL_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setChannelFilter(key)
                      setShowChannelMenu(false)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                      channelFilter === key ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <span>{label}</span>
                    {channelFilter === key && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-zinc-300 font-light hidden sm:inline">/</span>

          {/* 2. CAMPAÑAS (MULTISELECT) */}
          <div className="relative" ref={campaignMenuRef}>
            <button
              onClick={() => {
                setShowCampaignMenu(!showCampaignMenu)
                setShowChannelMenu(false)
                setShowAdSetMenu(false)
                setShowAdMenu(false)
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-[0.98] ${
                !isAllCampaignsSelected
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200/80 text-zinc-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${isAllCampaignsSelected ? 'bg-emerald-500' : 'bg-[#ff4b0b]'}`} />
              <span className="max-w-[200px] truncate text-left">
                {isAllCampaignsSelected 
                  ? 'Campañas: Todas' 
                  : selectedCampaignIds.length === 1 
                    ? effectiveCampaigns.find(c => c.id === selectedCampaignIds[0])?.name
                    : `${selectedCampaignIds.length} Campañas`}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
            </button>

            {showCampaignMenu && (
              <div className="absolute left-0 top-[calc(100%+6px)] w-80 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 p-2.5 text-xs animate-in fade-in duration-150">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar campaña..."
                    value={campaignSearch}
                    onChange={(e) => setCampaignSearch(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-800 outline-none focus:border-zinc-400 font-medium"
                    autoFocus
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar">
                  <button
                    onClick={() => toggleCampaignSelection('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                      isAllCampaignsSelected ? 'bg-zinc-100 text-zinc-900 font-bold' : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Todas las Campañas</span>
                    </div>
                    {isAllCampaignsSelected && <Check className="w-3.5 h-3.5 text-zinc-900" />}
                  </button>

                  {campaignsMatchingChannel
                    .filter(c => c.name.toLowerCase().includes(campaignSearch.toLowerCase()) || (c.platform && c.platform.toLowerCase().includes(campaignSearch.toLowerCase())))
                    .map(camp => {
                      const isSelected = selectedCampaignIds.includes(camp.id)
                      return (
                        <button
                          key={camp.id}
                          onClick={() => toggleCampaignSelection(camp.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                            isSelected ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-700 hover:bg-zinc-50'
                          }`}
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${camp.status === 'Activa' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                              <span className="truncate font-semibold">{camp.name}</span>
                            </div>
                            <span className={`text-[10px] truncate ${isSelected ? 'text-white/70' : 'text-zinc-400'}`}>
                              {camp.platform}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[11px] font-medium ${isSelected ? 'text-white/90' : 'text-zinc-500'}`}>
                              S/ {camp.spend}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </button>
                      )
                    })}
                </div>
              </div>
            )}
          </div>

          {/* 3. CONJUNTO DE ANUNCIOS (ADSETS) - Progresivo */}
          {availableAdSets.length > 0 && (
            <>
              <span className="text-zinc-300 font-light hidden sm:inline">/</span>
              <div className="relative" ref={adSetMenuRef}>
                <button
                  onClick={() => {
                    setShowAdSetMenu(!showAdSetMenu)
                    setShowChannelMenu(false)
                    setShowCampaignMenu(false)
                    setShowAdMenu(false)
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-[0.98] ${
                    selectedAdSetId !== 'all'
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200/80 text-zinc-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 opacity-70" />
                  <span className="max-w-[170px] truncate">
                    {selectedAdSetId === 'all' 
                      ? 'Conjunto: Todos' 
                      : availableAdSets.find(as => as.id === selectedAdSetId)?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {showAdSetMenu && (
                  <div className="absolute left-0 top-[calc(100%+6px)] w-64 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 p-2 text-xs animate-in fade-in duration-150">
                    <p className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Conjunto de Anuncios</p>
                    <button
                      onClick={() => {
                        setSelectedAdSetId('all')
                        setSelectedAdId('all')
                        setShowAdSetMenu(false)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                        selectedAdSetId === 'all' ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      <span>Todos los conjuntos</span>
                      {selectedAdSetId === 'all' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    {availableAdSets.map(as => (
                      <button
                        key={as.id}
                        onClick={() => {
                          setSelectedAdSetId(as.id)
                          setSelectedAdId('all')
                          setShowAdSetMenu(false)
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                          selectedAdSetId === as.id ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        <span className="truncate pr-2">{as.name}</span>
                        {selectedAdSetId === as.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* 4. ANUNCIOS / CREATIVOS - Progresivo */}
          {selectedAdSetId !== 'all' && availableAds.length > 0 && (
            <>
              <span className="text-zinc-300 font-light hidden sm:inline">/</span>
              <div className="relative" ref={adMenuRef}>
                <button
                  onClick={() => {
                    setShowAdMenu(!showAdMenu)
                    setShowChannelMenu(false)
                    setShowCampaignMenu(false)
                    setShowAdSetMenu(false)
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-[0.98] ${
                    selectedAdId !== 'all'
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200/80 text-zinc-800'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 opacity-70" />
                  <span className="max-w-[170px] truncate">
                    {selectedAdId === 'all' 
                      ? 'Anuncio: Todos' 
                      : availableAds.find(ad => ad.id === selectedAdId)?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {showAdMenu && (
                  <div className="absolute left-0 top-[calc(100%+6px)] w-64 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 p-2 text-xs animate-in fade-in duration-150">
                    <p className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Creativo / Anuncio</p>
                    <button
                      onClick={() => {
                        setSelectedAdId('all')
                        setShowAdMenu(false)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                        selectedAdId === 'all' ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      <span>Todos los anuncios</span>
                      {selectedAdId === 'all' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    {availableAds.map(ad => (
                      <button
                        key={ad.id}
                        onClick={() => {
                          setSelectedAdId(ad.id)
                          setShowAdMenu(false)
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                          selectedAdId === ad.id ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        <span className="truncate pr-2">{ad.name}</span>
                        {selectedAdId === ad.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* BOTÓN RESTABLECER FILTROS */}
          {hasAnyFilter && (
            <button
              onClick={() => {
                setChannelFilter('all')
                setSelectedCampaignIds([])
                setSelectedAdSetId('all')
                setSelectedAdId('all')
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg text-xs font-semibold transition-colors"
              title="Restablecer todos los filtros"
            >
              <span>Restablecer</span>
              <X className="w-3 h-3" />
            </button>
          )}

        </div>

        {/* Resumen a la derecha */}
        <div className="flex items-center gap-3 text-xs font-medium text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <strong className="text-zinc-800 font-bold">{activeCount}</strong> activas
          </span>
          <span className="text-zinc-300">|</span>
          <span>
            Leads filtrados: <strong className="text-zinc-800 font-bold">{filteredLeads.length}</strong>
          </span>
        </div>
      </div>
    )
  }

  // =========================================================================
  // VISTA 1: DASHBOARD
  // =========================================================================
  if (currentRole === 'management' || currentRole === 'marketing' || currentRole === 'sales') {
    return (
      <div className="bg-transparent text-zinc-900 max-w-7xl mx-auto">
        
        {/* ENCABEZADO: Título y Botones Auxiliares */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Resumen de Rendimiento
            </h1>
            <p className="text-[14px] text-zinc-500 mt-1 font-medium">
              Analiza las métricas clave y el estado general de tu ecosistema comercial.
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative">
            {/* Botón Nueva Métrica (Solo Administrador / Management) */}
            {currentRole === 'management' && (
              <button
                onClick={() => setIsMetricBuilderOpen(true)}
                className="flex items-center gap-1.5 bg-[#ff4b0b] hover:bg-[#e04108] text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all shadow-[0_2px_10px_rgba(255,75,11,0.25)] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Métrica</span>
              </button>
            )}

            {/* Selector de Rango de Tiempo Interactivo */}
            <div className="relative" ref={timeMenuRef}>
              <button 
                onClick={() => setShowTimeMenu(!showTimeMenu)}
                className="flex items-center gap-2 bg-white border border-zinc-200/80 text-xs font-semibold px-3.5 py-2.5 rounded-xl hover:bg-zinc-50 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span>{TIME_LABELS[timeRange] || 'Tiempo Real'}</span>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </button>

              {showTimeMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 py-1.5 text-xs overflow-hidden">
                  {Object.entries(TIME_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setTimeRange(key)
                        setShowTimeMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2 font-medium transition-colors flex items-center justify-between ${
                        timeRange === key ? 'bg-zinc-50 text-zinc-900 font-bold' : 'text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      <span>{label}</span>
                      {timeRange === key && <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BARRA DE FILTROS EN CASCADA (Canal -> Campañas [Multi] -> Conjuntos -> Anuncios) */}
        {renderCascadingFilterBar()}

        {/* ── KPIs SUPERIORES DINÁMICOS ───────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {/* Leads Nuevos */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-50 text-[#ff4b0b]">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-zinc-600">Leads totales</span>
              </div>
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-2">{totalLeads}</h3>
            <p className="text-xs font-semibold text-[#ff4b0b] mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4b0b] animate-pulse"></span> Data en vivo
            </p>
            <svg className="w-full h-8 mt-2.5" viewBox="0 0 100 20" preserveAspectRatio="none">
              <polyline fill="none" stroke="#ff4b0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points="0,15 20,10 40,18 60,5 80,12 100,2" />
            </svg>
          </div>

          {/* Ingresos del Mes */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-zinc-600">Ingresos generados</span>
              </div>
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-2">S/ {(totalRevenue).toLocaleString('es-PE')}</h3>
            <p className="text-xs font-semibold text-emerald-600 mt-1.5 flex items-center gap-1">
              Gasto total: S/ {(totalSpend).toLocaleString('es-PE')}
            </p>
            <svg className="w-full h-8 mt-2.5" viewBox="0 0 100 20" preserveAspectRatio="none">
              <polyline fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points="0,18 20,14 40,16 60,8 80,10 100,2" />
            </svg>
          </div>

          {/* Tasa Conversión */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-zinc-600">Tasa conversión</span>
              </div>
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-2">{conversionRate}%</h3>
            <p className="text-xs font-semibold text-zinc-500 mt-1.5 flex items-center gap-1">
              De lead a cierre
            </p>
            <svg className="w-full h-8 mt-2.5" viewBox="0 0 100 20" preserveAspectRatio="none">
              <polyline fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points="0,12 20,15 40,8 60,10 80,4 100,2" />
            </svg>
          </div>

          {/* Ticket Promedio */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-zinc-600">Ticket promedio</span>
              </div>
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-2">S/ {(ticketPromedio).toLocaleString('es-PE')}</h3>
            <p className="text-xs font-semibold text-zinc-500 mt-1.5 flex items-center gap-1">
              Por venta exitosa
            </p>
            <svg className="w-full h-8 mt-2.5" viewBox="0 0 100 20" preserveAspectRatio="none">
              <polyline fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points="0,15 20,12 40,14 60,9 80,10 100,4" />
            </svg>
          </div>

          {/* Valor Pipeline */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-zinc-600">Valor en pipeline</span>
              </div>
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-2">S/ {(valorPipeline).toLocaleString('es-PE')}</h3>
            <p className="text-xs font-semibold text-zinc-500 mt-1.5 flex items-center gap-1">
              Oportunidades activas
            </p>
            <svg className="w-full h-8 mt-2.5" viewBox="0 0 100 20" preserveAspectRatio="none">
              <polyline fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points="0,20 20,15 40,10 60,12 80,4 100,2" />
            </svg>
          </div>

          {/* MÉTRICAS PERSONALIZADAS (Creadas por el Administrador) */}
          {customMetrics && customMetrics.map(cm => {
            let val = 0
            if (cm.dataSource === 'leads') {
              if (cm.aggregation === 'sum') val = filteredLeads.reduce((acc, l) => acc + (Number(l[cm.field]) || 0), 0)
              else if (cm.aggregation === 'average') {
                const total = filteredLeads.reduce((acc, l) => acc + (Number(l[cm.field]) || 0), 0)
                val = filteredLeads.length > 0 ? (total / filteredLeads.length).toFixed(1) : 0
              } else if (cm.aggregation === 'count') val = filteredLeads.length
            } else if (cm.dataSource === 'campaigns') {
              if (cm.aggregation === 'sum') val = filteredCampaigns.reduce((acc, c) => acc + (Number(c[cm.field]) || 0), 0)
              else if (cm.aggregation === 'count') val = filteredCampaigns.length
            }

            return (
              <div key={cm.id} className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default relative group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700">
                      <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-600 truncate max-w-[120px]">{cm.name}</span>
                  </div>
                  {currentRole === 'management' && (
                    <button 
                      onClick={() => removeCustomMetric(cm.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all p-1"
                      title="Eliminar métrica"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <h3 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-2">
                  {typeof val === 'number' ? val.toLocaleString('es-PE') : val}
                </h3>
                <p className="text-xs font-semibold text-zinc-400 mt-1.5 flex items-center gap-1.5">
                  Personalizada por Admin
                </p>
                <svg className="w-full h-8 mt-2.5" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <polyline fill="none" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points="0,15 25,8 50,14 75,6 100,2" />
                </svg>
              </div>
            )
          })}
        </div>

        {/* ── GRAFICOS CENTRALES ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Rendimiento Comercial (LineChart) */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 lg:col-span-1 xl:col-span-1 cursor-default">
            <div className="flex justify-between items-center mb-5 relative">
              <h4 className="text-base font-bold text-zinc-900 tracking-tight">Rendimiento comercial</h4>
              
              {/* Dropdown Interactivo */}
              <div className="relative" ref={rendimientoMenuRef}>
                <button 
                  onClick={() => {
                    setShowRendimientoMenu(!showRendimientoMenu)
                    setShowCanalMenu(false)
                    setShowEtapaMenu(false)
                  }}
                  className="text-xs font-semibold flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700 px-2.5 py-1.5 rounded-lg active:scale-[0.98]"
                >
                  <span>{rendimientoPeriod}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {showRendimientoMenu && (
                  <div className="absolute right-0 mt-1.5 w-36 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 py-1 text-xs animate-in fade-in duration-150">
                    {['Diario', 'Semanal', 'Mensual', 'Trimestral'].map(p => (
                      <button
                        key={p}
                        onClick={() => {
                          setRendimientoPeriod(p)
                          setShowRendimientoMenu(false)
                        }}
                        className={`w-full text-left px-3 py-1.5 font-medium transition-colors ${
                          rendimientoPeriod === p ? 'bg-zinc-50 text-zinc-900 font-bold' : 'text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4 text-xs font-semibold text-zinc-500">
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded-full bg-[#ff4b0b]"></div> Ingresos (k)</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded-full bg-zinc-900"></div> Cierres</div>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rendimientoData} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(val) => `$${val}`} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e4e4e7', fontSize: '12px', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)' }} />
                  <Line yAxisId="left" type="monotone" dataKey="ingresos" stroke="#ff4b0b" strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 6, strokeWidth: 0, fill: '#ff4b0b' }} />
                  <Line yAxisId="right" type="monotone" dataKey="ganadas" stroke="#18181b" strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 6, strokeWidth: 0, fill: '#18181b' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ingresos por Canal (BarChart Horizontal) */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 lg:col-span-1 xl:col-span-1 cursor-default">
            <div className="flex justify-between items-center mb-5 relative">
              <h4 className="text-base font-bold text-zinc-900 tracking-tight">Ingresos por canal</h4>
              
              {/* Dropdown Interactivo */}
              <div className="relative" ref={canalMenuRef}>
                <button 
                  onClick={() => {
                    setShowCanalMenu(!showCanalMenu)
                    setShowRendimientoMenu(false)
                    setShowEtapaMenu(false)
                  }}
                  className="text-xs font-semibold flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700 px-2.5 py-1.5 rounded-lg active:scale-[0.98]"
                >
                  <span>{canalTimeframe}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {showCanalMenu && (
                  <div className="absolute right-0 mt-1.5 w-40 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 py-1 text-xs animate-in fade-in duration-150">
                    {['Este mes', 'Últimos 30 días', 'Este trimestre', 'Año actual'].map(t => (
                      <button
                        key={t}
                        onClick={() => {
                          setCanalTimeframe(t)
                          setShowCanalMenu(false)
                        }}
                        className={`w-full text-left px-3 py-1.5 font-medium transition-colors ${
                          canalTimeframe === t ? 'bg-zinc-50 text-zinc-900 font-bold' : 'text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4 text-xs font-semibold text-zinc-500">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#ff4b0b]"></div> Ganado</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-zinc-200"></div> En curso</div>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#52525b', fontWeight: 500 }} width={95} />
                  <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '10px', border: '1px solid #e4e4e7', fontSize: '12px', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)' }} />
                  <Bar dataKey="ganado" stackId="a" fill="#ff4b0b" barSize={16} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="curso" stackId="a" fill="#e4e4e7" barSize={16} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribución PieChart */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 lg:col-span-1 xl:col-span-1 cursor-default">
            <div className="flex justify-between items-center mb-5 relative">
              <h4 className="text-base font-bold text-zinc-900 tracking-tight">Oportunidades por etapa</h4>
              
              {/* Dropdown Interactivo */}
              <div className="relative" ref={etapaMenuRef}>
                <button 
                  onClick={() => {
                    setShowEtapaMenu(!showEtapaMenu)
                    setShowRendimientoMenu(false)
                    setShowCanalMenu(false)
                  }}
                  className="text-xs font-semibold flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700 px-2.5 py-1.5 rounded-lg active:scale-[0.98]"
                >
                  <span>{etapaTimeframe}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {showEtapaMenu && (
                  <div className="absolute right-0 mt-1.5 w-40 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 py-1 text-xs animate-in fade-in duration-150">
                    {['Este mes', 'Últimos 30 días', 'Este trimestre', 'Todo el histórico'].map(t => (
                      <button
                        key={t}
                        onClick={() => {
                          setEtapaTimeframe(t)
                          setShowEtapaMenu(false)
                        }}
                        className={`w-full text-left px-3 py-1.5 font-medium transition-colors ${
                          etapaTimeframe === t ? 'bg-zinc-50 text-zinc-900 font-bold' : 'text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between h-56">
              <div className="relative w-1/2 h-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none" cornerRadius={4}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-semibold text-zinc-400">Total</span>
                  <span className="text-3xl font-extrabold tracking-tight text-zinc-900">{filteredLeads.length}</span>
                </div>
              </div>
              <div className="w-1/2 pl-4 flex flex-col gap-3 justify-center">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="font-semibold text-zinc-700 truncate max-w-[85px]">{d.name}</span>
                    </div>
                    <span className="text-zinc-600 font-semibold">{((d.value/filteredLeads.length)*100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* MODAL DE CONSTRUCTOR DE MÉTRICAS (Administrador) */}
        {isMetricBuilderOpen && (
          <MetricBuilderModal onClose={() => setIsMetricBuilderOpen(false)} />
        )}

      </div>
    )
  }

  return null
}
