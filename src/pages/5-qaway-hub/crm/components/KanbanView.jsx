import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useCRM } from '../context/CRMContext'
import { XCircle, Star, Settings2, Eye, EyeOff } from 'lucide-react'

const COLUMNS = [
  { id: 'new', title: 'Nuevos', color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  { id: 'contactado', title: 'Contactados', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { id: 'propuesta', title: 'Propuesta', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  { id: 'negociacion', title: 'Negociación', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { id: 'ganado', title: 'Ganados', color: 'bg-green-50 text-green-700 border-green-100' }
]

export default function KanbanView() {
  const { leads, updateLeadStatus, setSelectedLeadId, currentRole } = useCRM()
  
  // Estados para columnas visibles y panel de configuración
  const [showColConfig, setShowColConfig] = useState(false)
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
    return leads.filter(lead => lead.status === statusId)
  }

  const handleMarkLost = (leadId) => {
    updateLeadStatus(leadId, 'perdido')
  }

  // Filtrar solo las columnas seleccionadas como visibles
  const activeColumns = COLUMNS.filter(col => visibleCols[col.id])

  return (
    <div className="space-y-4 bg-white text-zinc-900">
      
      {/* CABECERA Y PANEL DE CONFIGURACIÓN DE COLUMNAS */}
      <div className="flex justify-between items-center bg-zinc-50 p-5 rounded-[15px] border border-zinc-200/60 shadow-xs">
        <div>
          <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Embudo Comercial</h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">Control visual y progresión de los prospectos en el proceso de ventas.</p>
        </div>

        {/* Botón de Configurar Columnas */}
        <div className="relative">
          <button
            onClick={() => setShowColConfig(!showColConfig)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3.5 text-xs font-bold rounded-[15px] border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 active:scale-95 transition-all shadow-2xs"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Configurar Columnas</span>
          </button>
          
          {showColConfig && (
            <div className="absolute right-0 mt-2.5 w-60 bg-white border border-zinc-200 rounded-[15px] shadow-lg p-4 z-50 space-y-3">
              <h5 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-2">Mostrar / Ocultar Columnas</h5>
              <div className="space-y-2">
                {COLUMNS.map(col => (
                  <button
                    key={col.id}
                    onClick={() => toggleCol(col.id)}
                    className="w-full flex items-center justify-between text-xs text-zinc-700 hover:text-zinc-950 py-1 font-semibold"
                  >
                    <span>{col.title}</span>
                    {visibleCols[col.id] ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-zinc-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid de Columnas del Kanban en Gris/Blanco Minimalista */}
      <div className={`grid grid-cols-1 gap-4 overflow-x-auto pb-4`} style={{ gridTemplateColumns: `repeat(${activeColumns.length}, minmax(230px, 1fr))` }}>
        {activeColumns.map(col => {
          const colLeads = getLeadsByStatus(col.id)
          const totalBudget = colLeads.reduce((sum, l) => sum + Number(l.budget || 0), 0)

          return (
            <div
              key={col.id}
              className="bg-zinc-50 border border-zinc-100 rounded-[15px] p-4 flex flex-col min-w-[230px] max-h-[75vh]"
            >
              {/* Encabezado de la columna */}
              <div className="flex justify-between items-center mb-4">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${col.color} uppercase tracking-wider`}>
                  {col.title} ({colLeads.length})
                </span>
                <span className="text-[10px] text-zinc-400 font-bold">${totalBudget.toFixed(0)}</span>
              </div>

              {/* Lista de Tarjetas en Blanco Puro */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                {colLeads.length === 0 ? (
                  <div className="border border-dashed border-zinc-200 rounded-[15px] py-10 text-center text-[10px] text-zinc-400 font-medium bg-white/40">
                    Sin leads
                  </div>
                ) : (
                  colLeads.map(lead => (
                    <motion.div
                      key={lead.id}
                      layoutId={lead.id}
                      whileHover={{ y: -3, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className="bg-white border border-zinc-200/80 rounded-[15px] p-4 cursor-pointer transition-all duration-300 relative group"
                    >
                      {/* Atribución de campaña */}
                      <span className="text-[8px] bg-zinc-50 text-zinc-400 font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider block mb-2 max-w-fit truncate border border-zinc-100">
                        {lead.campaignName}
                      </span>

                      {/* Nombre del Lead */}
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-sm font-bold text-zinc-950 group-hover:text-green-600 transition-colors">
                          {lead.name}
                        </h5>
                        {lead.priority === 'high' && (
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                        )}
                      </div>

                      {/* WhatsApp */}
                      <p className="text-[10px] text-zinc-400 font-semibold">{lead.whatsapp}</p>

                      {/* Selector de Etapa Directa & Presupuesto */}
                      <div className="flex justify-between items-center mt-3.5 pt-3 border-t border-zinc-100 gap-2">
                        <span className="text-xs font-black text-zinc-950">
                          ${Number(lead.budget || 0).toFixed(0)}
                        </span>
                        
                        {currentRole !== 'marketing' ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={lead.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                              className="text-[9px] font-bold uppercase bg-zinc-50 border border-zinc-200/80 rounded-md px-1 py-0.5 text-zinc-600 focus:outline-none focus:border-zinc-300"
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
                              className="p-1 hover:bg-red-50 rounded-md text-zinc-400 hover:text-red-500 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[9px] font-bold uppercase bg-zinc-50 border border-zinc-200/80 rounded-md px-2 py-0.5 text-zinc-400 cursor-not-allowed">
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
    </div>
  )
}
