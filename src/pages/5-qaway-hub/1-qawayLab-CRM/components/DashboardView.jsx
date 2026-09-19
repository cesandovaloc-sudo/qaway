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



  // Componente de Filtro de Campañas
  const renderCampaignFilter = () => (
    <div className="flex flex-wrap items-center gap-2 mb-8 bg-white border border-zinc-200/60 p-2 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <span className="text-[11px] font-semibold text-zinc-400 ml-2 mr-2">Filtrar por campaña:</span>
      <button
        onClick={() => setSelectedCampaignId('all')}
        className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
          selectedCampaignId === 'all'
            ? 'bg-zinc-900 text-white shadow-sm'
            : 'bg-transparent text-zinc-600 hover:bg-zinc-100'
        }`}
      >
        Todas
      </button>
      {effectiveCampaigns.map(camp => (
        <button
          key={camp.id}
          onClick={() => setSelectedCampaignId(camp.id)}
          className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
            selectedCampaignId === camp.id
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'bg-transparent text-zinc-600 hover:bg-zinc-100'
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

          <div className="flex items-center gap-3 relative">
            {/* Selector de Rango de Tiempo Interactivo */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowTimeMenu(!showTimeMenu)
                  setShowFilterMenu(false)
                }}
                className="flex items-center gap-2 bg-white border border-zinc-200/80 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-50 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
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

            {/* Selector de Filtros Avanzados Interactivo */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowFilterMenu(!showFilterMenu)
                  setShowTimeMenu(false)
                }}
                className={`flex items-center gap-2 border text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${
                  channelFilter !== 'all'
                    ? 'bg-zinc-900 border-zinc-900 text-white'
                    : 'bg-white border-zinc-200/80 text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                {channelFilter !== 'all' && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 p-4 text-xs space-y-4">
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-500 block mb-2">Canal de Origen</span>
                    <select
                      value={channelFilter}
                      onChange={(e) => {
                        setChannelFilter(e.target.value)
                        setShowFilterMenu(false)
                      }}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 font-medium focus:outline-none focus:border-zinc-400 transition-colors"
                    >
                      <option value="all">Todos los canales</option>
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
                      className="w-full text-center py-2 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
                    >
                      Limpiar filtros
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {/* Leads Nuevos */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 text-[#ff4b0b]">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[12px] font-semibold text-zinc-500">Leads totales</span>
              </div>
            </div>
            <h3 className="text-[32px] font-bold tracking-tight text-zinc-900">{totalLeads}</h3>
            <p className="text-sm font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Data en vivo
            </p>
          </div>

          {/* Ingresos del Mes */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-[12px] font-semibold text-zinc-500">Ingresos generados</span>
              </div>
            </div>
            <h3 className="text-[32px] font-bold tracking-tight text-zinc-900">S/ {(totalRevenue).toLocaleString('es-PE')}</h3>
            <p className="text-sm font-medium text-emerald-600 mt-1 flex items-center gap-1">
              Gasto total: S/ {(totalSpend).toLocaleString('es-PE')}
            </p>
          </div>

          {/* Tasa Conversión */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-[12px] font-semibold text-zinc-500">Tasa conversión</span>
              </div>
            </div>
            <h3 className="text-[32px] font-bold tracking-tight text-zinc-900">{conversionRate}%</h3>
            <p className="text-sm font-medium text-zinc-400 mt-1 flex items-center gap-1">
              De lead a cierre
            </p>
          </div>

          {/* Ticket Promedio */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[12px] font-semibold text-zinc-500">Ticket promedio</span>
              </div>
            </div>
            <h3 className="text-[32px] font-bold tracking-tight text-zinc-900">S/ {(ticketPromedio).toLocaleString('es-PE')}</h3>
            <p className="text-sm font-medium text-zinc-400 mt-1 flex items-center gap-1">
              Por venta exitosa
            </p>
          </div>

          {/* Valor Pipeline */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-[12px] font-semibold text-zinc-500">Valor en pipeline</span>
              </div>
            </div>
            <h3 className="text-[32px] font-bold tracking-tight text-zinc-900">S/ {(valorPipeline).toLocaleString('es-PE')}</h3>
            <p className="text-sm font-medium text-zinc-400 mt-1 flex items-center gap-1">
              Oportunidades activas
            </p>
          </div>
        </div>

        {/* ── GRAFICOS CENTRALES ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Rendimiento Comercial (LineChart) */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] lg:col-span-1 xl:col-span-1">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[14px] font-bold text-zinc-800 tracking-tight">Rendimiento mensual</h4>
              <button className="text-xs font-semibold flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700 px-2.5 py-1.5 rounded-lg">Mensual <ChevronDown className="w-3 h-3" /></button>
            </div>
            <div className="flex items-center gap-4 mb-4 text-[11px] font-semibold text-zinc-500">
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded-full bg-[#ff4b0b]"></div> Ingresos (k)</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded-full bg-zinc-900"></div> Cierres</div>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rendimientoData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} tickFormatter={(val) => `$${val}`} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line yAxisId="left" type="monotone" dataKey="ingresos" stroke="#ff4b0b" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6, strokeWidth: 0, fill: '#ff4b0b' }} />
                  <Line yAxisId="right" type="monotone" dataKey="ganadas" stroke="#18181b" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6, strokeWidth: 0, fill: '#18181b' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ingresos por Canal (BarChart Horizontal) */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] lg:col-span-1 xl:col-span-1">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[14px] font-bold text-zinc-800 tracking-tight">Ingresos por canal</h4>
              <button className="text-xs font-semibold flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700 px-2.5 py-1.5 rounded-lg">Este mes <ChevronDown className="w-3 h-3" /></button>
            </div>
            <div className="flex items-center gap-4 mb-4 text-[11px] font-semibold text-zinc-500">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#ff4b0b]"></div> Ganado</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-zinc-200"></div> En curso</div>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#52525b', fontWeight: 500 }} width={90} />
                  <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="ganado" stackId="a" fill="#ff4b0b" barSize={16} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="curso" stackId="a" fill="#e4e4e7" barSize={16} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribución PieChart */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] lg:col-span-1 xl:col-span-1">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[14px] font-bold text-zinc-800 tracking-tight">Oportunidades por etapa</h4>
              <button className="text-xs font-semibold flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700 px-2.5 py-1.5 rounded-lg">Este mes <ChevronDown className="w-3 h-3" /></button>
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
                  <span className="text-[11px] font-semibold text-zinc-400">Total</span>
                  <span className="text-3xl font-bold tracking-tight text-zinc-900">{filteredLeads.length}</span>
                </div>
              </div>
              <div className="w-1/2 pl-4 flex flex-col gap-3 justify-center">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="font-semibold text-zinc-700 truncate max-w-[80px]">{d.name}</span>
                    </div>
                    <span className="text-zinc-500 font-medium">{((d.value/filteredLeads.length)*100).toFixed(1)}%</span>
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
