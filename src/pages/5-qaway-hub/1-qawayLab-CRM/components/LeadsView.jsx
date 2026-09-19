import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCRM } from '../context/CRMContext'
import { 
  Users, Search, Filter, MessageSquare, Phone, Mail, 
  Calendar, DollarSign, ChevronRight, X, ArrowUpRight, 
  CheckCircle2, Clock, AlertTriangle, Sparkles, Tag,
  ExternalLink, UserCheck
} from 'lucide-react'

const STATUS_CONFIG = {
  new: { label: 'Nuevo', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  contactado: { label: 'Contactado', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  propuesta: { label: 'Propuesta', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  negociacion: { label: 'Negociación', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  ganado: { label: 'Ganado', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  perdido: { label: 'Perdido', bg: 'bg-zinc-100', text: 'text-zinc-500', border: 'border-zinc-200' },
}

export default function LeadsView({ onNavigateToChat }) {
  const { leads, updateLeadStatus, setSelectedLeadId, globalSearchQuery, setGlobalSearchQuery } = useCRM()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [channelFilter, setChannelFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedLeadDrawer, setSelectedLeadDrawer] = useState(null)

  const effectiveSearch = globalSearchQuery || searchTerm

  // Métricas rápidas de cabecera
  const stats = useMemo(() => {
    const total = leads.length
    const nuevos = leads.filter(l => l.status === 'new' || l.stage === 'new').length
    const enNegociacion = leads.filter(l => l.status === 'negociacion' || l.isHumanRequested).length
    const ganados = leads.filter(l => l.status === 'ganado').length
    return { total, nuevos, enNegociacion, ganados }
  }, [leads])

  // Filtrado reactivo de prospectos
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const name = (lead.client_name || lead.name || '').toLowerCase()
      const phone = (lead.contact_info || lead.whatsapp || '').toLowerCase()
      const email = (lead.email || '').toLowerCase()
      const query = effectiveSearch.toLowerCase()

      const matchesSearch = !query || name.includes(query) || phone.includes(query) || email.includes(query)
      
      const leadChannel = (lead.channel || lead.metadata?.channel || (lead.whatsapp ? 'whatsapp' : 'web')).toLowerCase()
      const matchesChannel = channelFilter === 'all' || leadChannel.includes(channelFilter)

      const leadStatus = lead.status || lead.stage || 'new'
      const matchesStatus = statusFilter === 'all' || leadStatus === statusFilter

      return matchesSearch && matchesChannel && matchesStatus
    })
  }, [leads, effectiveSearch, channelFilter, statusFilter])

  const handleOpenChat = (lead) => {
    if (setSelectedLeadId) setSelectedLeadId(lead.id)
    if (onNavigateToChat) onNavigateToChat(lead.id)
  }

  return (
    <div className="bg-transparent text-zinc-900 max-w-7xl mx-auto space-y-6">
      
      {/* ── 1. ENCABEZADO LIBRE SOBRE EL LIENZO ────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Gestión Maestra de Leads
          </h1>
          <p className="text-[14px] text-zinc-500 font-medium mt-1">
            Base centralizada de prospectos sincronizada con Supabase Cloud y WhatsApp WABA.
          </p>
        </div>
      </div>

      {/* ── 2. CUATRO TARJETAS KPI INDEPENDIENTES CON LÍNEA DE TENDENCIA ──────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Leads */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Leads</span>
            <p className="text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">{stats.total}</p>
          </div>
          <div className="h-8 w-full mt-3 -mb-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#ff4b0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,22 15,20 30,23 45,15 60,17 75,10 90,13 100,6"
              />
            </svg>
          </div>
        </div>

        {/* Por Atender */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">Por Atender</span>
            <p className="text-3xl font-extrabold text-cyan-700 tracking-tight mt-1">{stats.nuevos}</p>
          </div>
          <div className="h-8 w-full mt-3 -mb-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,24 15,21 30,22 45,17 60,18 75,12 90,14 100,9"
              />
            </svg>
          </div>
        </div>

        {/* Negociación */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Negociación</span>
            <p className="text-3xl font-extrabold text-blue-700 tracking-tight mt-1">{stats.enNegociacion}</p>
          </div>
          <div className="h-8 w-full mt-3 -mb-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,25 15,22 30,24 45,19 60,20 75,15 90,16 100,11"
              />
            </svg>
          </div>
        </div>

        {/* Ganados */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Ganados</span>
            <p className="text-3xl font-extrabold text-emerald-700 tracking-tight mt-1">{stats.ganados}</p>
          </div>
          <div className="h-8 w-full mt-3 -mb-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,23 15,22 30,18 45,20 60,14 75,16 90,9 100,5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ── 3. BARRA DE HERRAMIENTAS STICKY: BÚSQUEDA Y FILTROS ──────────── */}
      <div className="sticky top-0 z-30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-md border border-zinc-200/80 px-4 py-3 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono o correo..."
            value={effectiveSearch}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              if (setGlobalSearchQuery) setGlobalSearchQuery(e.target.value)
            }}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs sm:text-[13px] text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#ff4b0b]/20 focus:border-[#ff4b0b] transition-all"
          />
          {effectiveSearch && (
            <button 
              onClick={() => {
                setSearchTerm('')
                if (setGlobalSearchQuery) setGlobalSearchQuery('')
              }} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros Dropdown */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Canal */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-3.5 py-2 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs sm:text-[13px] text-zinc-700 focus:outline-none focus:border-zinc-400 cursor-pointer font-semibold"
          >
            <option value="all">Todos los Canales</option>
            <option value="whatsapp">WhatsApp Cloud API</option>
            <option value="web">Formulario Web</option>
            <option value="meta_ads">Meta Ads (CTWA)</option>
          </select>

          {/* Etapa */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs sm:text-[13px] text-zinc-700 focus:outline-none focus:border-zinc-400 cursor-pointer font-semibold"
          >
            <option value="all">Todas las Etapas</option>
            <option value="new">Nuevos</option>
            <option value="contactado">Contactados</option>
            <option value="propuesta">Propuesta</option>
            <option value="negociacion">Negociación</option>
            <option value="ganado">Ganados</option>
            <option value="perdido">Perdidos</option>
          </select>
        </div>
      </div>

      {/* ── 4. TABLA PRINCIPAL DE DATOS CALIBRADA ────────────────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/80 border-b border-zinc-200/60 text-[12px] font-bold text-zinc-500 uppercase tracking-wider select-none">
              <th className="py-3.5 px-4">Cliente / Contacto</th>
              <th className="py-3.5 px-4">Canal / Origen</th>
              <th className="py-3.5 px-4">Etapa del Embudo</th>
              <th className="py-3.5 px-4">Último Mensaje</th>
              <th className="py-3.5 px-4">Fecha</th>
              <th className="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-700">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-14 text-center text-zinc-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="w-8 h-8 text-zinc-300 stroke-[1.5]" />
                    <p className="font-semibold text-zinc-700 text-sm">No se encontraron leads registrados</p>
                    <p className="text-xs text-zinc-400 max-w-xs">
                      {searchTerm ? 'Intenta ajustar tus filtros o término de búsqueda.' : 'Los prospectos que lleguen por WhatsApp o formulario web aparecerán aquí en tiempo real.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const displayName = lead.client_name || lead.name || 'Sin Nombre'
                const displayPhone = lead.contact_info || lead.whatsapp || ''
                const currentStatus = lead.status || lead.stage || 'new'
                const statusMeta = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.new
                const rawDate = lead.created_at || lead.updated_at
                const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : '—'

                const isWhatsApp = Boolean(lead.whatsapp || lead.channel === 'whatsapp' || lead.source === 'whatsapp_cloud_api')
                const referralAd = lead.metadata?.referral?.headline || lead.campaign_name || lead.campaignName

                return (
                  <tr 
                    key={lead.id} 
                    onClick={() => setSelectedLeadDrawer(lead)}
                    className="hover:bg-zinc-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Cliente */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200/80 flex items-center justify-center font-bold text-zinc-700 text-[13px] shrink-0 group-hover:border-[#ff4b0b]/40 group-hover:text-[#ff4b0b] transition-colors">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-zinc-900 truncate flex items-center gap-1.5">
                            {displayName}
                            {lead.isHumanRequested && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-amber-100 text-amber-800" title="Asesor humano requerido">
                                ⚠️ Asesor
                              </span>
                            )}
                          </p>
                          <p className="text-[12px] text-zinc-500 font-mono truncate mt-0.5">{displayPhone || lead.email || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Canal / Origen */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-start gap-1">
                        {isWhatsApp ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            WhatsApp WABA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Web Form
                          </span>
                        )}
                        {referralAd && (
                          <span className="text-[11px] text-purple-600 font-medium truncate max-w-[170px]" title={referralAd}>
                            📢 {referralAd}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Etapa del Embudo (Selector Interactivo) */}
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={currentStatus}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className={`text-[12px] font-bold px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer transition-all ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                      >
                        <option value="new">Nuevo</option>
                        <option value="contactado">Contactado</option>
                        <option value="propuesta">Propuesta</option>
                        <option value="negociacion">Negociación</option>
                        <option value="ganado">Ganado</option>
                        <option value="perdido">Perdido</option>
                      </select>
                    </td>

                    {/* Último Mensaje */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-zinc-700 truncate text-[13px] font-medium">
                        {lead.last_message || lead.lastMessage || 'Sin mensajes aún'}
                      </p>
                      <span className="text-[11.5px] text-zinc-400 font-medium block mt-0.5">
                        Agente: {lead.agent || 'Qaway Lab AI'}
                      </span>
                    </td>

                    {/* Fecha */}
                    <td className="py-4 px-4 text-zinc-600 font-mono text-[12px] font-medium whitespace-nowrap">
                      {formattedDate}
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {isWhatsApp && displayPhone && (
                          <button
                            onClick={() => handleOpenChat(lead)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-zinc-900 text-white hover:bg-[#ff4b0b] transition-colors shadow-xs"
                            title="Abrir conversación en Inbox"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chatear</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedLeadDrawer(lead)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                          title="Ver ficha completa"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>

      {/* ── 4. DRAWER LATERAL DE DETALLE COMPLETO (SLIDE-OVER) ─────── */}
      <AnimatePresence>
        {selectedLeadDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white h-full shadow-2xl border-l border-zinc-200 flex flex-col"
            >
              {/* Header Drawer */}
              <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">
                    Ficha de Prospecto
                  </span>
                  <h3 className="text-base font-bold text-zinc-900 mt-1">
                    {selectedLeadDrawer.client_name || selectedLeadDrawer.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedLeadDrawer(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Drawer */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                
                {/* Datos de Contacto */}
                <div className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-200/60 space-y-2">
                  <p className="flex items-center gap-2 text-zinc-700 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{selectedLeadDrawer.contact_info || selectedLeadDrawer.whatsapp || 'Sin teléfono'}</span>
                  </p>
                  <p className="flex items-center gap-2 text-zinc-700 font-semibold">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{selectedLeadDrawer.email || 'Sin correo registrado'}</span>
                  </p>
                  <p className="flex items-center gap-2 text-zinc-700 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Registrado: {new Date(selectedLeadDrawer.created_at || Date.now()).toLocaleString('es-PE')}</span>
                  </p>
                </div>

                {/* Atribución & Campaña */}
                {(selectedLeadDrawer.campaign_name || selectedLeadDrawer.metadata?.referral) && (
                  <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Atribución Publicitaria (CTWA)</span>
                    <p className="font-bold text-zinc-900 text-xs">
                      {selectedLeadDrawer.metadata?.referral?.headline || selectedLeadDrawer.campaign_name}
                    </p>
                    {selectedLeadDrawer.metadata?.referral?.source_url && (
                      <a 
                        href={selectedLeadDrawer.metadata.referral.source_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[11px] text-purple-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        Ver anuncio origen <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Historial de Mensajes Recientes */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Historial Conversacional</span>
                  <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200/60 max-h-56 overflow-y-auto space-y-2">
                    {(selectedLeadDrawer.history || []).length === 0 ? (
                      <p className="text-zinc-400 italic text-[11px] text-center py-4">No hay mensajes previos en el historial.</p>
                    ) : (
                      selectedLeadDrawer.history.map((msg, idx) => (
                        <div 
                          key={idx} 
                          className={`p-2 rounded-lg text-[11px] ${msg.sender === 'agent' ? 'bg-zinc-900 text-white ml-4' : 'bg-white border border-zinc-200 text-zinc-800 mr-4'}`}
                        >
                          <div className="flex justify-between items-center text-[9px] opacity-70 mb-0.5">
                            <span>{msg.sender === 'agent' ? 'Agente Qaway' : 'Cliente'}</span>
                            <span>{msg.time || ''}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Footer Drawer */}
              <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center gap-2">
                <button
                  onClick={() => {
                    const leadToOpen = selectedLeadDrawer
                    setSelectedLeadDrawer(null)
                    handleOpenChat(leadToOpen)
                  }}
                  className="w-full py-2.5 bg-[#ff4b0b] text-white rounded-xl font-bold text-xs hover:bg-[#e04008] transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Abrir Conversación en WhatsApp Inbox</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
