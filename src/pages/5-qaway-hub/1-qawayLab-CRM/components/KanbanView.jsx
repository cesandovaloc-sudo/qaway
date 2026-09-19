import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCRM } from '../context/CRMContext'
import { XCircle, Star, Settings2, Eye, EyeOff, X, Mail, Phone, Calendar } from 'lucide-react'

const COLUMNS = [
  { id: 'new', title: 'Nuevos', color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  { id: 'contactado', title: 'Contactados', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { id: 'propuesta', title: 'Propuesta', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  { id: 'negociacion', title: 'Negociación', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { id: 'ganado', title: 'Ganados', color: 'bg-green-50 text-green-700 border-green-100' }
]

export default function KanbanView() {
  const { leads, updateLeadStatus, setSelectedLeadId, currentRole, globalSearchQuery } = useCRM()
  
  // Estados para columnas visibles y panel de configuración
  const [showColConfig, setShowColConfig] = useState(false)

  // Inspector lateral del lead (patrón Twenty/Notion): abre el detalle apoyado
  // sobre el tablero, para mover la etapa sin perder el contexto del embudo.
  const [drawerLeadId, setDrawerLeadId] = useState(null)
  const drawerLead = leads.find(l => l.id === drawerLeadId) || null
  const [visibleCols, setVisibleCols] = useState({
    new: true,
    contactado: true,
    propuesta: true,
    negociacion: true,
    ganado: true
  })

  const toggleCol = (colId) => {
    setVisibleCols(prev => ({ ...prev, [colId]: !prev[colId] }))
  }

  const getLeadsByStatus = (statusId) => {
    return leads.filter(lead => {
      const matchesStatus = lead.status === statusId
      if (!matchesStatus) return false
      if (globalSearchQuery) {
        const query = globalSearchQuery.toLowerCase()
        const name = (lead.client_name || lead.name || '').toLowerCase()
        const phone = (lead.contact_info || lead.whatsapp || '').toLowerCase()
        const email = (lead.email || '').toLowerCase()
        return name.includes(query) || phone.includes(query) || email.includes(query)
      }
      return true
    })
  }

  const handleMarkLost = (leadId) => {
    updateLeadStatus(leadId, 'perdido')
  }

  // Filtrar solo las columnas seleccionadas como visibles
  const activeColumns = COLUMNS.filter(col => visibleCols[col.id])

  return (
    <div className="space-y-6 bg-transparent text-zinc-900 max-w-7xl mx-auto">
      
      {/* CABECERA DESENCAPSULADA Y CONFIGURACIÓN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Embudo Comercial</h1>
          <p className="text-[14px] text-zinc-500 font-medium mt-1">Control visual y progresión de los prospectos en el proceso de ventas.</p>
        </div>

        {/* Botón de Configurar Columnas */}
        <div className="relative">
          <button
            onClick={() => setShowColConfig(!showColConfig)}
            className="flex items-center justify-center gap-2 py-2 px-4 text-[13px] font-semibold rounded-xl border border-zinc-200/80 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 active:scale-95 transition-all shadow-xs"
          >
            <Settings2 className="w-4 h-4 text-zinc-500" />
            <span>Configurar Columnas</span>
          </button>
          
          {showColConfig && (
            <div className="absolute right-0 mt-2.5 w-64 bg-white border border-zinc-200/80 rounded-2xl shadow-xl p-4 z-50 space-y-3">
              <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-2">Mostrar / Ocultar Columnas</h5>
              <div className="space-y-1.5">
                {COLUMNS.map(col => (
                  <button
                    key={col.id}
                    onClick={() => toggleCol(col.id)}
                    className="w-full flex items-center justify-between text-[13px] text-zinc-700 hover:text-zinc-950 py-1.5 px-2 rounded-lg hover:bg-zinc-50 font-medium transition-colors"
                  >
                    <span>{col.title}</span>
                    {visibleCols[col.id] ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-zinc-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid de Columnas del Kanban en Lienzo Limpio */}
      <div className="grid grid-cols-1 gap-4 overflow-x-auto pb-6" style={{ gridTemplateColumns: `repeat(${activeColumns.length}, minmax(260px, 1fr))` }}>
        {activeColumns.map(col => {
          const colLeads = getLeadsByStatus(col.id)
          const totalBudget = colLeads.reduce((sum, l) => sum + Number(l.budget || 0), 0)

          return (
            <div
              key={col.id}
              className="bg-zinc-100/70 border border-zinc-200/80 rounded-2xl p-3.5 flex flex-col min-w-[270px] max-h-[78vh]"
            >
              {/* Encabezado de la columna */}
              <div className="flex justify-between items-center mb-3 px-1">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${col.color} uppercase tracking-wider`}>
                  {col.title} ({colLeads.length})
                </span>
                <span className="text-[12px] text-zinc-500 font-bold">${totalBudget.toFixed(0)}</span>
              </div>

              {/* Lista de Tarjetas en Blanco Puro */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                {colLeads.length === 0 ? (
                  <div className="border border-dashed border-zinc-200 rounded-xl py-12 text-center text-[12px] text-zinc-400 font-medium bg-white/50">
                    Sin prospectos
                  </div>
                ) : (
                  colLeads.map(lead => (
                    <motion.div
                      key={lead.id}
                      layoutId={lead.id}
                      whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}
                      onClick={() => {
                        setSelectedLeadId(lead.id)
                        setDrawerLeadId(lead.id)
                      }}
                      className="bg-white border border-zinc-200/80 rounded-xl p-4 cursor-pointer hover:border-zinc-300 transition-all duration-200 relative group shadow-xs"
                    >
                      {/* Atribución de campaña */}
                      <span className="text-[10px] bg-zinc-100/80 text-zinc-600 font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider block mb-2 max-w-fit truncate border border-zinc-200/50">
                        {lead.campaignName || 'General'}
                      </span>

                      {/* Nombre del Lead */}
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-[14px] font-bold text-zinc-900 group-hover:text-[#ff4b0b] transition-colors leading-snug">
                          {lead.name}
                        </h5>
                        {lead.priority === 'high' && (
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                        )}
                      </div>

                      {/* WhatsApp */}
                      <p className="text-[12px] text-zinc-500 font-mono">{lead.whatsapp}</p>

                      {/* Selector de Etapa Directa & Presupuesto */}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100 gap-2">
                        <span className="text-[14px] font-extrabold text-zinc-900">
                          ${Number(lead.budget || 0).toFixed(0)}
                        </span>
                        
                        {currentRole !== 'marketing' ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={lead.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                              className="text-[11px] font-semibold bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-zinc-700 focus:outline-none focus:border-[#ff4b0b]"
                            >
                              <option value="new">Nuevo</option>
                              <option value="contactado">Contactado</option>
                              <option value="propuesta">Propuesta</option>
                              <option value="negociacion">Negociación</option>
                              <option value="ganado">Ganado</option>
                            </select>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkLost(lead.id)
                              }}
                              title="Marcar como perdido"
                              className="p-1 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-0.5 text-zinc-400 cursor-not-allowed">
                            Sólo Lectura
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* =========================================================================
          INSPECTOR LATERAL DEL LEAD (patrón Twenty/Notion)
          ========================================================================= */}
      <AnimatePresence>
        {drawerLead && (
          <div
            className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm"
            style={{ marginTop: 0 }}
          >
            <div className="absolute inset-0" onClick={() => setDrawerLeadId(null)} />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white shadow-2xl border-l border-zinc-200 flex flex-col"
            >
              {/* Encabezado */}
              <div className="p-5 border-b border-zinc-100 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[8px] bg-zinc-50 text-zinc-400 font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-zinc-100">
                    {drawerLead.campaignName || 'Sin campaña'}
                  </span>
                  <h3 className="mt-2 text-sm font-bold text-zinc-950 truncate">{drawerLead.name}</h3>
                  <p className="text-[11px] text-zinc-400 font-semibold">{drawerLead.agent || 'Sin agente'}</p>
                </div>
                <button
                  onClick={() => setDrawerLeadId(null)}
                  aria-label="Cerrar inspector"
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Detalle */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-zinc-700">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[12px] border border-zinc-100 bg-zinc-50/60 px-3 py-2">
                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400">Presupuesto</p>
                    <p className="mt-0.5 font-black text-zinc-950">${Number(drawerLead.budget || 0).toFixed(0)}</p>
                  </div>
                  <div className="rounded-[12px] border border-zinc-100 bg-zinc-50/60 px-3 py-2">
                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400">Prioridad</p>
                    <p className="mt-0.5 font-semibold text-zinc-800">
                      {drawerLead.priority === 'high' ? 'Alta' : drawerLead.priority === 'low' ? 'Baja' : 'Media'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="flex items-center gap-2 font-semibold text-zinc-800">
                    <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    {drawerLead.whatsapp || '—'}
                  </p>
                  <p className="flex items-center gap-2 font-semibold text-zinc-800">
                    <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    {drawerLead.email || '—'}
                  </p>
                  <p className="flex items-center gap-2 font-semibold text-zinc-800">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    {drawerLead.created_at ? new Date(drawerLead.created_at).toLocaleDateString('es-PE') : '—'}
                  </p>
                </div>

                {drawerLead.lastMessage && (
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400">Último mensaje</p>
                    <p className="mt-1 leading-relaxed text-zinc-600">{drawerLead.lastMessage}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-zinc-100">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2">Etapa del embudo</p>
                  {currentRole !== 'marketing' ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={drawerLead.status || 'new'}
                        onChange={(e) => updateLeadStatus(drawerLead.id, e.target.value)}
                        className="flex-1 text-[11px] font-bold uppercase bg-white border border-zinc-200 rounded-[10px] px-3 py-2 text-zinc-700 focus:outline-none focus:border-zinc-300"
                      >
                        <option value="new">Nuevo</option>
                        <option value="contactado">Contactado</option>
                        <option value="propuesta">Propuesta</option>
                        <option value="negociacion">Negociación</option>
                        <option value="ganado">Ganado</option>
                      </select>
                      <button
                        onClick={() => handleMarkLost(drawerLead.id)}
                        title="Marcar como perdido"
                        className="p-2 rounded-[10px] border border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-200 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="inline-block text-[10px] font-bold uppercase bg-zinc-50 border border-zinc-200 rounded-[10px] px-3 py-1.5 text-zinc-400">
                      Sólo Lectura
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
