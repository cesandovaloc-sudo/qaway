import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, TrendingUp, Users, Percent,
  ArrowUpRight, Award, Megaphone, Settings2, Eye, EyeOff,
  Target, MessageSquare, Clock, BarChart3, Plus, Activity, X,
  FileText, Filter, MoreVertical, Calendar, ChevronDown
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
    status: 'Activa',
    spend: 340.00,
    revenue: 1490.00,
    leadsCount: 38,
    impressions: 24500,
    clicks: 1280
  },
  {
    id: 'camp-meta-2',
    name: 'Identidad Visual & Branding Digital',
    platform: 'Meta Ads (Click-to-WhatsApp CTWA)',
    status: 'Activa',
    spend: 210.00,
    revenue: 890.00,
    leadsCount: 24,
    impressions: 18200,
    clicks: 940
  },
  {
    id: 'camp-b2b-notion',
    name: 'Plantillas Notion B2B Enterprise',
    platform: 'TikTok Ads & Google Search',
    status: 'Pausada',
    spend: 150.00,
    revenue: 520.00,
    leadsCount: 16,
    impressions: 9800,
    clicks: 410
  }
]

const TIME_LABELS = {
  realtime: 'Tiempo Real',
  today: 'Hoy',
  '7days': 'Últimos 7 días',
  '30days': 'Últimos 30 días',
  all: 'Histórico Completo'
}

export default function DashboardView() {
  const { campaigns, leads, currentRole, customMetrics, removeCustomMetric } = useCRM()
  
  // Estado para el filtro de campañas
  const [selectedCampaignId, setSelectedCampaignId] = useState('all')
  const [timeRange, setTimeRange] = useState('realtime')
  const [showTimeMenu, setShowTimeMenu] = useState(false)
  const [channelFilter, setChannelFilter] = useState('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  // Colores premium de la marca
  const COLORS = ['#ff4b0b', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563']

  // Campañas efectivas (con fallback demostrativo si Supabase aún está vacío)
  const effectiveCampaigns = (campaigns && campaigns.length > 0) ? campaigns : DEMO_CAMPAIGNS

  // ----------------------------------------------------
  // LOGICA DINÁMICA DE KPIs (Reintegrada con filtros cruzados)
  // ----------------------------------------------------
  const filteredCampaigns = selectedCampaignId === 'all'
    ? effectiveCampaigns
    : effectiveCampaigns.filter(c => c.id === selectedCampaignId)

  const filteredLeads = leads.filter(l => {
    // 1. Filtro por Campaña
    if (selectedCampaignId !== 'all') {
      const targetCamp = effectiveCampaigns.find(c => c.id === selectedCampaignId)
      const leadCampId = l.campaignId || l.campaign_id
      const leadCampName = (l.campaignName || l.campaign_name || '').toLowerCase()
      const matchesId = leadCampId === selectedCampaignId
      const matchesName = targetCamp && leadCampName.includes(targetCamp.name.toLowerCase())
      if (!matchesId && !matchesName) return false
    }

    // 2. Filtro por Período de Tiempo
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

    // 3. Filtro por Canal
    if (channelFilter !== 'all') {
      const leadChan = (l.channel || l.metadata?.channel || (l.whatsapp ? 'whatsapp' : 'web')).toLowerCase()
      if (!leadChan.includes(channelFilter.toLowerCase())) return false
    }

    return true
  })

  const totalSpend = filteredCampaigns.reduce((sum, c) => sum + (c.spend || 0), 0)
  const totalRevenue = filteredCampaigns.reduce((sum, c) => sum + (c.revenue || 0), 0)
  const totalLeads = filteredLeads.length
  const wonLeads = filteredLeads.filter(l => l.status === 'ganado').length
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0.0'
  const ticketPromedio = wonLeads > 0 ? Math.round(totalRevenue / wonLeads) : 0
  const valorPipeline = filteredLeads.reduce((sum, l) => sum + (Number(l.budget) || 0), 0)

  // Mock data para gráficos (mantenidos para la estética, pero adaptables)
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
  
  // Limpiar vacíos para que el PieChart no falle
  const pieData = leadsByStatus.filter(l => l.value > 0)

  const formatCurrency = (val) => `S/${(val / 1000)}K`

  const displayFont = {
    fontFamily: "'Oswald', sans-serif",
    fontStretch: 'condensed',
  }

  // Componente de Filtro de Campañas
  const renderCampaignFilter = () => (
    <div className="flex flex-wrap items-center gap-2 mb-6 bg-white border border-black/5 p-2 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <span className="text-[10px] font-bold text-black/50 uppercase tracking-widest ml-2 mr-2">Filtrar por:</span>
      <button
        onClick={() => setSelectedCampaignId('all')}
        className={`px-4 py-1.5 text-xs font-semibold rounded-xs transition-colors ${
          selectedCampaignId === 'all'
            ? 'bg-[#ff4b0b] text-white shadow-xs'
            : 'bg-transparent text-[#191918] hover:bg-black/5'
        }`}
      >
        Todas las Campañas
      </button>
      {effectiveCampaigns.map(camp => (
        <button
          key={camp.id}
          onClick={() => setSelectedCampaignId(camp.id)}
          className={`px-4 py-1.5 text-xs font-semibold rounded-xs transition-colors ${
            selectedCampaignId === camp.id
              ? 'bg-[#ff4b0b] text-white shadow-xs'
              : 'bg-transparent text-[#191918] hover:bg-black/5'
          }`}
        >
          {camp.name}
        </button>
      ))}
    </div>
  )

  // =========================================================================
  // VISTA 1: DASHBOARD
  // =========================================================================
  if (currentRole === 'management' || currentRole === 'marketing' || currentRole === 'sales') {
    return (
      <div className="bg-[#f5f5f4] text-[#191918]">
        
        {/* ENCABEZADO: Título y Botones Auxiliares */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <h1 className="text-[32px] font-bold uppercase tracking-tight text-[#191918]" style={displayFont}>
              Analítica Comercial
            </h1>
            <p className="text-[13px] text-[#191918]/60 mt-1">
              Visualiza el rendimiento comercial y toma decisiones basadas en datos reales.
            </p>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Selector de Rango de Tiempo Interactivo */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowTimeMenu(!showTimeMenu)
                  setShowFilterMenu(false)
                }}
                className="flex items-center gap-2 bg-white border border-black/10 text-sm font-semibold px-4 py-2 rounded-md hover:bg-zinc-50 transition-colors shadow-xs"
              >
                <Calendar className="w-4 h-4 text-[#ff4b0b]" />
                <span>{TIME_LABELS[timeRange] || 'Tiempo Real'}</span>
                <ChevronDown className="w-4 h-4 text-black/40" />
              </button>

              {showTimeMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 py-1 text-xs">
                  {Object.entries(TIME_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setTimeRange(key)
                        setShowTimeMenu(false)
                      }}
                      className={`w-full text-left px-3.5 py-2 font-medium transition-colors flex items-center justify-between ${
                        timeRange === key ? 'bg-[#ff4b0b]/10 text-[#ff4b0b] font-bold' : 'text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      <span>{label}</span>
                      {timeRange === key && <span className="w-1.5 h-1.5 rounded-full bg-[#ff4b0b]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selector de Filtros Avanzados Interactivo */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowFilterMenu(!showFilterMenu)
                  setShowTimeMenu(false)
                }}
                className={`flex items-center gap-2 border text-sm font-semibold px-4 py-2 rounded-md transition-colors shadow-xs ${
                  channelFilter !== 'all'
                    ? 'bg-[#ff4b0b]/10 border-[#ff4b0b] text-[#ff4b0b]'
                    : 'bg-white border-black/10 text-zinc-800 hover:bg-zinc-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                {channelFilter !== 'all' && (
                  <span className="w-2 h-2 rounded-full bg-[#ff4b0b]" />
                )}
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 p-3 text-xs space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Canal de Origen</span>
                    <select
                      value={channelFilter}
                      onChange={(e) => {
                        setChannelFilter(e.target.value)
                        setShowFilterMenu(false)
                      }}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-[#ff4b0b]"
                    >
                      <option value="all">Todos los Canales</option>
                      <option value="whatsapp">WhatsApp Cloud API</option>
                      <option value="web">Formulario Web</option>
                      <option value="meta_ads">Meta Ads (CTWA)</option>
                    </select>
                  </div>

                  {channelFilter !== 'all' && (
                    <button
                      onClick={() => {
                        setChannelFilter('all')
                        setShowFilterMenu(false)
                      }}
                      className="w-full text-center py-1.5 text-[11px] font-semibold text-[#ff4b0b] hover:bg-[#ff4b0b]/10 rounded-md transition-colors"
                    >
                      Restablecer Filtros
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTROLES INTEGRADOS: Selector de Campañas devuelto a la vista */}
        {renderCampaignFilter()}

        {/* ── KPIs SUPERIORES DINÁMICOS ───────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {/* Leads Nuevos */}
          <div className="bg-white border border-black/5 rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-[#ff4b0b]/10 text-[#ff4b0b]">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-black/50 uppercase tracking-widest">LEADS TOTALES</span>
              </div>
            </div>
            <h3 className="text-3xl font-black mt-2">{totalLeads}</h3>
            <p className="text-xs font-semibold text-[#ff4b0b] mt-2 flex items-center gap-1">
              Data en Vivo
            </p>
            <svg className="w-full h-8 mt-3" viewBox="0 0 100 20" preserveAspectRatio="none">
              <polyline fill="none" stroke="#ff4b0b" strokeWidth="1.5" points="0,15 20,10 40,18 60,5 80,12 100,2" />
            </svg>
          </div>

          {/* Ingresos del Mes */}
          <div className="bg-white border border-black/5 rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-amber-50 text-amber-500">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-black/50 uppercase tracking-widest">INGRESOS (ADS)</span>
              </div>
            </div>
            <h3 className="text-3xl font-black mt-2">S/ {(totalRevenue).toLocaleString('es-PE')}</h3>
            <p className="text-xs font-semibold text-green-500 mt-2 flex items-center gap-1">
              Gasto: S/ {(totalSpend).toLocaleString('es-PE')}
            </p>
            <svg className="w-full h-8 mt-3" viewBox="0 0 100 20" preserveAspectRatio="none">
              <polyline fill="none" stroke="#ff4b0b" strokeWidth="1.5" points="0,18 20,14 40,16 60,8 80,10 100,2" />
            </svg>
          </div>

          {/* Tasa Conversión */}
          <div className="bg-white border border-black/5 rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-[#ff4b0b]/10 text-[#ff4b0b]">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-black/50 uppercase tracking-widest">TASA CONVERSIÓN</span>
              </div>
            </div>
            <h3 className="text-3xl font-black mt-2">{conversionRate}%</h3>
            <p className="text-xs font-semibold text-zinc-500 mt-2 flex items-center gap-1">
              Basado en leads ganados
            </p>
            <svg className="w-full h-8 mt-3" viewBox="0 0 100 20" preserveAspectRatio="none">
              <polyline fill="none" stroke="#ff4b0b" strokeWidth="1.5" points="0,12 20,15 40,8 60,10 80,4 100,2" />
            </svg>
          </div>

          {/* Ticket Promedio */}
          <div className="bg-white border border-black/5 rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-amber-50 text-amber-500">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-black/50 uppercase tracking-widest">TICKET PROMEDIO</span>
              </div>
            </div>
            <h3 className="text-3xl font-black mt-2">S/ {(ticketPromedio).toLocaleString('es-PE')}</h3>
            <p className="text-xs font-semibold text-zinc-500 mt-2 flex items-center gap-1">
              Ingresos / Cierres
            </p>
            <svg className="w-full h-8 mt-3" viewBox="0 0 100 20" preserveAspectRatio="none">
              <polyline fill="none" stroke="#ff4b0b" strokeWidth="1.5" points="0,15 20,12 40,14 60,9 80,10 100,4" />
            </svg>
          </div>

          {/* Valor Pipeline */}
          <div className="bg-white border border-black/5 rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-amber-50 text-amber-500">
                  <Filter className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-black/50 uppercase tracking-widest">VALOR PIPELINE</span>
              </div>
            </div>
            <h3 className="text-3xl font-black mt-2">S/ {(valorPipeline).toLocaleString('es-PE')}</h3>
            <p className="text-xs font-semibold text-zinc-500 mt-2 flex items-center gap-1">
              Suma de leads activos
            </p>
            <svg className="w-full h-8 mt-3" viewBox="0 0 100 20" preserveAspectRatio="none">
              <polyline fill="none" stroke="#ff4b0b" strokeWidth="1.5" points="0,20 20,15 40,10 60,12 80,4 100,2" />
            </svg>
          </div>
        </div>

        {/* ── GRAFICOS CENTRALES ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Rendimiento Comercial (LineChart) */}
          <div className="bg-white border border-black/5 rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] lg:col-span-1 xl:col-span-1">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[11px] font-bold text-black/60 uppercase tracking-widest">RENDIMIENTO COMERCIAL MENSUAL</h4>
              <button className="text-xs font-semibold flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded">Mensual <ChevronDown className="w-3 h-3" /></button>
            </div>
            <div className="flex items-center gap-4 mb-4 text-[10px] font-bold uppercase tracking-widest text-black/60">
              <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-[#ff4b0b]"></div> Ingresos (k)</div>
              <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-[#191918]"></div> Cierres</div>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rendimientoData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} tickFormatter={(val) => `$${val}`} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #eee', fontSize: '12px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="ingresos" stroke="#ff4b0b" strokeWidth={2} dot={{ r: 4, fill: '#ff4b0b', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="ganadas" stroke="#191918" strokeWidth={2} dot={{ r: 4, fill: '#191918', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ingresos por Canal (BarChart Horizontal) */}
          <div className="bg-white border border-black/5 rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] lg:col-span-1 xl:col-span-1">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[11px] font-bold text-black/60 uppercase tracking-widest">INGRESOS POR CANAL</h4>
              <button className="text-xs font-semibold flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded">Este mes <ChevronDown className="w-3 h-3" /></button>
            </div>
            <div className="flex items-center gap-4 mb-4 text-[10px] font-bold uppercase tracking-widest text-black/60">
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#ff4b0b]"></div> Ganado</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-zinc-200"></div> En curso</div>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#52525b' }} width={90} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #eee', fontSize: '12px' }} />
                  <Bar dataKey="ganado" stackId="a" fill="#ff4b0b" barSize={12} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="curso" stackId="a" fill="#e4e4e7" barSize={12} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribución PieChart */}
          <div className="bg-white border border-black/5 rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] lg:col-span-1 xl:col-span-1">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[11px] font-bold text-black/60 uppercase tracking-widest">OPORTUNIDADES POR ETAPA</h4>
              <button className="text-xs font-semibold flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded">Este mes <ChevronDown className="w-3 h-3" /></button>
            </div>
            <div className="flex items-center justify-between h-56">
              <div className="relative w-1/2 h-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={0} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-black/40 uppercase">Total</span>
                  <span className="text-2xl font-black">{filteredLeads.length}</span>
                </div>
              </div>
              <div className="w-1/2 pl-4 flex flex-col gap-3 justify-center">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="font-semibold text-zinc-700 truncate max-w-[80px]">{d.name}</span>
                    </div>
                    <span className="text-zinc-500">{((d.value/filteredLeads.length)*100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    )
  }

  return null
}
