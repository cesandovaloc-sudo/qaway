import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Kanban,
  Table as TableIcon,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShoppingBag,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Briefcase,
  SlidersHorizontal,
  FileText,
  Mail,
  Phone,
  Tag
} from 'lucide-react'

// Local storage key for Twenty CRM engine
const STORAGE_KEY = 'qaway_twenty_crm_os_v1'

const PIPELINE_STAGES = [
  { id: 'lead', name: '1. Nuevo Lead', color: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500', hubspotStage: 'TOFU' },
  { id: 'contacted', name: '2. Contactado', color: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500', hubspotStage: 'TOFU' },
  { id: 'qualified', name: '3. Calificado (MQL)', color: 'bg-purple-50 text-purple-700 border-purple-200', dotColor: 'bg-purple-500', hubspotStage: 'MOFU' },
  { id: 'proposal', name: '4. Propuesta / Demo', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', dotColor: 'bg-indigo-500', hubspotStage: 'MOFU' },
  { id: 'won', name: '5. Cerrado Ganado', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500', hubspotStage: 'BOFU' }
]

const INITIAL_DEALS = [
  {
    id: 'deal-1',
    name: 'Carlos Mendoza',
    company: 'Logística Andina S.A.C.',
    title: 'CEO / Director General',
    type: 'B2B',
    stage: 'qualified',
    value: 3800,
    priority: 'Alta',
    email: 'carlos@andinalogistics.com',
    phone: '+51 987 654 321',
    formatOrigin: 'Ebook / Guía de Automatización (HubSpot MOFU)',
    channel: 'LinkedIn Inbound',
    jtbd: 'Automatizar captura y trazabilidad de pedidos para no perder clientes en WhatsApp.',
    nextAction: 'Presentar demo técnica de integración el viernes a las 10:00 AM.',
    updatedAt: 'Hace 2 horas',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'deal-2',
    name: 'Valeria Ramos',
    company: 'Studio Beauty Concept',
    title: 'Fundadora & Directora',
    type: 'B2C',
    stage: 'proposal',
    value: 1250,
    priority: 'Alta',
    email: 'valeria@beautyconcept.pe',
    phone: '+51 991 223 344',
    formatOrigin: 'Webinar / Masterclass de Conversión (HubSpot MOFU)',
    channel: 'Instagram Ads',
    jtbd: 'Tienda online con pasarela de pagos integrada y WhatsApp automatizado.',
    nextAction: 'Enviar propuesta económica de desarrollo web acelerado.',
    updatedAt: 'Hace 4 horas',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'deal-3',
    name: 'Martín Paredes',
    company: 'Inmobiliaria Horizonte',
    title: 'Gerente Comercial',
    type: 'B2B',
    stage: 'lead',
    value: 5200,
    priority: 'Media',
    email: 'mparedes@horizonte.com',
    phone: '+51 977 889 900',
    formatOrigin: 'Infografía: 5 Errores en Landing Pages (HubSpot TOFU)',
    channel: 'Google Search SEO',
    jtbd: 'Captar leads calificados para venta de departamentos en Miraflores.',
    nextAction: 'Llamada de prospección y diagnóstico de funnel.',
    updatedAt: 'Hace 1 día',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'deal-4',
    name: 'Elena Quispe',
    company: 'Consultora Tributaria Q&A',
    title: 'Socia Principal',
    type: 'B2B',
    stage: 'won',
    value: 4500,
    priority: 'Alta',
    email: 'elena@consultoresqa.com',
    phone: '+51 944 332 211',
    formatOrigin: 'Caso de Éxito: Empresa B2B x3 Ventas (HubSpot BOFU)',
    channel: 'Referido Directo',
    jtbd: 'Web corporativa con portal de clientes y panel de reportes mensuales.',
    nextAction: 'Kick-off de proyecto y levantamiento de requerimientos.',
    updatedAt: 'Ayer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
]

export default function MarketingStudioTwentyPage() {
  const [deals, setDeals] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : INITIAL_DEALS
  })

  const [viewMode, setViewMode] = useState('kanban') // 'kanban' | 'table'
  const [modelFilter, setModelFilter] = useState('ALL') // 'ALL' | 'B2B' | 'B2C'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [showNewDealModal, setShowNewDealModal] = useState(false)

  const [newDeal, setNewDeal] = useState({
    name: '',
    company: '',
    title: '',
    type: 'B2B',
    stage: 'lead',
    value: 2500,
    priority: 'Media',
    email: '',
    phone: '',
    formatOrigin: 'Ebook / Guía (HubSpot)',
    channel: 'LinkedIn',
    jtbd: '',
    nextAction: ''
  })

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deals))
  }, [deals])

  // Filtered Deals
  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      const matchModel = modelFilter === 'ALL' || d.type === modelFilter
      const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.email.toLowerCase().includes(searchQuery.toLowerCase())
      return matchModel && matchSearch
    })
  }, [deals, modelFilter, searchQuery])

  // KPIs Calculations (Twenty Standard)
  const totalPipelineValue = useMemo(() => {
    return filteredDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
  }, [filteredDeals])

  const wonDealsValue = useMemo(() => {
    return filteredDeals.filter(d => d.stage === 'won').reduce((sum, d) => sum + (Number(d.value) || 0), 0)
  }, [filteredDeals])

  const winRate = useMemo(() => {
    if (filteredDeals.length === 0) return 0
    const wonCount = filteredDeals.filter(d => d.stage === 'won').length
    return ((wonCount / filteredDeals.length) * 100).toFixed(1)
  }, [filteredDeals])

  const avgTicket = useMemo(() => {
    if (filteredDeals.length === 0) return 0
    return Math.round(totalPipelineValue / filteredDeals.length)
  }, [totalPipelineValue, filteredDeals])

  // Move deal to next or specific stage
  const handleMoveStage = (dealId, nextStage) => {
    setDeals(prev => prev.map(d => (d.id === dealId ? { ...d, stage: nextStage, updatedAt: 'Ahora' } : d)))
    if (selectedDeal && selectedDeal.id === dealId) {
      setSelectedDeal(prev => ({ ...prev, stage: nextStage, updatedAt: 'Ahora' }))
    }
  }

  // Delete deal
  const handleDeleteDeal = (dealId) => {
    setDeals(prev => prev.filter(d => d.id !== dealId))
    if (selectedDeal && selectedDeal.id === dealId) {
      setSelectedDeal(null)
    }
  }

  // Create deal
  const handleCreateDeal = (e) => {
    e.preventDefault()
    if (!newDeal.name || !newDeal.company) return

    const created = {
      id: `deal-${Date.now()}`,
      ...newDeal,
      value: Number(newDeal.value) || 0,
      updatedAt: 'Ahora',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }

    setDeals(prev => [created, ...prev])
    setShowNewDealModal(false)
    setNewDeal({
      name: '',
      company: '',
      title: '',
      type: 'B2B',
      stage: 'lead',
      value: 2500,
      priority: 'Media',
      email: '',
      phone: '',
      formatOrigin: 'Ebook / Guía (HubSpot)',
      channel: 'LinkedIn',
      jtbd: '',
      nextAction: ''
    })
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-slate-900 selection:text-white font-sans text-xs pb-20">
      
      {/* TWENTY TOP NAVIGATION BAR (Linear & Twenty Style) */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Breadcrumb & Project Tag */}
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-slate-900 font-bold">
              <span className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center text-[10px] font-black tracking-tighter">
                20
              </span>
              <span>Twenty Revenue OS</span>
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600 font-semibold">Pipelines & Oportunidades</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              v2.0
            </span>
          </div>

          {/* Quick Controls: Search, Model Filter & View Toggle */}
          <div className="flex items-center gap-2.5">
            
            {/* Search Input */}
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar lead, cuenta... ⌘K"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
            </div>

            {/* Model Filter (ALL | B2B | B2C) */}
            <div className="p-0.5 bg-slate-100 rounded-lg border border-slate-200 flex items-center">
              {['ALL', 'B2B', 'B2C'].map((m) => (
                <button
                  key={m}
                  onClick={() => setModelFilter(m)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    modelFilter === m
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {m === 'ALL' ? 'Todos' : m}
                </button>
              ))}
            </div>

            {/* View Switcher (Kanban | Table) */}
            <div className="p-0.5 bg-slate-100 rounded-lg border border-slate-200 flex items-center">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista Tablero Kanban"
              >
                <Kanban className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista Tabla Relacional"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => setShowNewDealModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Lead</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* 1. TWENTY KPIS STRIP (METRIC CARDS) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span>Valor Total Pipeline</span>
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 tracking-tight">
              ${totalPipelineValue.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">USD</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12.4% vs mes anterior
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span>Oportunidades Activas</span>
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 tracking-tight">
              {filteredDeals.length} <span className="text-[10px] font-normal text-slate-400">leads</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Distribuidos en 5 etapas
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span>Tasa de Cierre (Win Rate)</span>
              <Activity className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-600 tracking-tight">
              {winRate}%
            </div>
            <div className="text-[10px] text-slate-500">
              Valor ganado: ${wonDealsValue.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span>Ticket Promedio (AOV)</span>
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 tracking-tight">
              ${avgTicket.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">USD</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Basado en cartera activa
            </div>
          </div>
        </div>

        {/* 2. PIPELINE CONTAINER (KANBAN OR TABLE) */}
        {viewMode === 'kanban' ? (
          
          /* KANBAN BOARD VIEW */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
            {PIPELINE_STAGES.map((stage) => {
              const stageDeals = filteredDeals.filter(d => d.stage === stage.id)
              const stageTotal = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0)

              return (
                <div key={stage.id} className="bg-slate-100/70 border border-slate-200/80 rounded-xl p-2.5 space-y-2.5 min-h-[500px]">
                  
                  {/* Stage Header */}
                  <div className="flex items-center justify-between px-1 py-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                      <span className="font-bold text-slate-800 text-[11px]">{stage.name}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-600 font-bold text-[9px]">
                        {stageDeals.length}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[10px] text-slate-500">
                      ${stageTotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Deals Cards List */}
                  <div className="space-y-2">
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        onClick={() => setSelectedDeal(deal)}
                        className={`group p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-400/80 hover:shadow-sm cursor-pointer transition-all space-y-2 ${
                          selectedDeal?.id === deal.id ? 'ring-2 ring-slate-900 border-transparent' : ''
                        }`}
                      >
                        {/* Company & Model Badge */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs truncate max-w-[120px]">
                            {deal.company}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            deal.type === 'B2B' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {deal.type}
                          </span>
                        </div>

                        {/* Contact Name & Title */}
                        <div>
                          <div className="text-[11px] font-medium text-slate-700">{deal.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{deal.title}</div>
                        </div>

                        {/* Format & Value Footer */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            ${deal.value.toLocaleString()}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                            deal.priority === 'Alta' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {deal.priority}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Quick Add Placeholder */}
                    <button
                      onClick={() => {
                        setNewDeal(prev => ({ ...prev, stage: stage.id }))
                        setShowNewDealModal(true)
                      }}
                      className="w-full py-2 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 text-slate-400 hover:text-slate-600 font-semibold text-[11px] flex items-center justify-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Añadir
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

        ) : (

          /* TABLE VIEW (RELATIONAL SPREADSHEET STYLE) */
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Contacto / Cuenta</th>
                    <th className="py-3 px-4">Modelo</th>
                    <th className="py-3 px-4">Etapa Pipeline</th>
                    <th className="py-3 px-4">Valor ($)</th>
                    <th className="py-3 px-4">Prioridad</th>
                    <th className="py-3 px-4">Origen HubSpot</th>
                    <th className="py-3 px-4">Última Actividad</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredDeals.map((deal) => {
                    const currentStageObj = PIPELINE_STAGES.find(s => s.id === deal.stage)
                    return (
                      <tr
                        key={deal.id}
                        onClick={() => setSelectedDeal(deal)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{deal.company}</div>
                          <div className="text-[11px] text-slate-500">{deal.name} • {deal.title}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            deal.type === 'B2B' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {deal.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentStageObj?.color}`}>
                            {currentStageObj?.name}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ${deal.value.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            deal.priority === 'Alta' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {deal.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-500 max-w-[180px] truncate">
                          {deal.formatOrigin}
                        </td>
                        <td className="py-3 px-4 text-[10px] text-slate-400">
                          {deal.updatedAt}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteDeal(deal.id)
                            }}
                            className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* 3. TWENTY SIDE DRAWER (INSPECTOR PANEL) */}
      <AnimatePresence>
        {selectedDeal && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                
                {/* Header with Close */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedDeal.avatar}
                      alt={selectedDeal.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{selectedDeal.company}</h3>
                      <p className="text-xs text-slate-500">{selectedDeal.name} • {selectedDeal.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDeal(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Pipeline Stage Quick Shift */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Fase en el Pipeline
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PIPELINE_STAGES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleMoveStage(selectedDeal.id, s.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-left border transition-all ${
                          selectedDeal.stage === s.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Financial Value & Model */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Valor del Trato</div>
                    <div className="text-base font-bold font-mono text-slate-900">${selectedDeal.value.toLocaleString()} USD</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Modelo</div>
                    <div className="text-xs font-bold text-indigo-600">{selectedDeal.type} (Mercado)</div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contacto</div>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedDeal.email}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedDeal.phone}</span>
                    </div>
                  </div>
                </div>

                {/* HubSpot Methodology Attribution */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Atribución HubSpot (Pág. 6)</div>
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Formato de Conversión:</span>
                    </div>
                    <div className="text-[11px] text-purple-700">{selectedDeal.formatOrigin}</div>
                    <div className="text-[10px] text-purple-500 pt-1">Canal: {selectedDeal.channel}</div>
                  </div>
                </div>

                {/* JTBD & Next Action */}
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Job To Be Done</div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 italic">
                      "{selectedDeal.jtbd}"
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Próxima Acción Clave</div>
                    <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100 text-xs text-emerald-900 font-medium">
                      {selectedDeal.nextAction}
                    </div>
                  </div>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => handleDeleteDeal(selectedDeal.id)}
                  className="px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 font-semibold text-xs transition-colors"
                >
                  Eliminar Registro
                </button>
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Cerrar
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. NEW DEAL MODAL */}
      {showNewDealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Crear Nueva Oportunidad</h3>
                <p className="text-[11px] text-slate-400">Twenty Revenue OS & HubSpot Attribution</p>
              </div>
              <button onClick={() => setShowNewDealModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nombre del Contacto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Rodrigo Silva"
                    value={newDeal.name}
                    onChange={(e) => setNewDeal(d => ({ ...d, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Empresa / Cuenta</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Nova Corp S.A."
                    value={newDeal.company}
                    onChange={(e) => setNewDeal(d => ({ ...d, company: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Cargo / Rol</label>
                  <input
                    type="text"
                    placeholder="Ej. Director Comercial"
                    value={newDeal.title}
                    onChange={(e) => setNewDeal(d => ({ ...d, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Valor Estimado ($ USD)</label>
                  <input
                    type="number"
                    value={newDeal.value}
                    onChange={(e) => setNewDeal(d => ({ ...d, value: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Modelo de Negocio</label>
                  <select
                    value={newDeal.type}
                    onChange={(e) => setNewDeal(d => ({ ...d, type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 font-semibold"
                  >
                    <option value="B2B">B2B (Empresas)</option>
                    <option value="B2C">B2C (Consumo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fase Inicial</label>
                  <select
                    value={newDeal.stage}
                    onChange={(e) => setNewDeal(d => ({ ...d, stage: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 font-semibold"
                  >
                    {PIPELINE_STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={newDeal.email}
                    onChange={(e) => setNewDeal(d => ({ ...d, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="+51 900 000 000"
                    value={newDeal.phone}
                    onChange={(e) => setNewDeal(d => ({ ...d, phone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Formato de Conversión HubSpot (Pág. 6)</label>
                <select
                  value={newDeal.formatOrigin}
                  onChange={(e) => setNewDeal(d => ({ ...d, formatOrigin: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 font-semibold"
                >
                  <option value="Infografía (HubSpot TOFU)">Infografía (HubSpot TOFU)</option>
                  <option value="Video Corto (HubSpot TOFU)">Video Corto (HubSpot TOFU)</option>
                  <option value="Ebook / Guía (HubSpot MOFU)">Ebook / Guía (HubSpot MOFU)</option>
                  <option value="Muestra Gratis / Demo (HubSpot MOFU)">Muestra Gratis / Demo (HubSpot MOFU)</option>
                  <option value="Webinar / Masterclass (HubSpot MOFU)">Webinar / Masterclass (HubSpot MOFU)</option>
                  <option value="Caso de Éxito (HubSpot BOFU)">Caso de Éxito (HubSpot BOFU)</option>
                  <option value="Testimonio Directo (HubSpot BOFU)">Testimonio Directo (HubSpot BOFU)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Job To Be Done (Dolor a resolver)</label>
                <textarea
                  rows="2"
                  placeholder="Qué solución busca resolver el cliente..."
                  value={newDeal.jtbd}
                  onChange={(e) => setNewDeal(d => ({ ...d, jtbd: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewDealModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Guardar Oportunidad
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  )
}
