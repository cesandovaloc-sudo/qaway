/**
 * ========================================================
 * COMPONENTE: PANEL DE INVESTIGACIÓN Y TENDENCIAS (03A)
 * QAWAY CAMPAIGN CONSOLE
 * ========================================================
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  RefreshCw, 
  ArrowUpRight, 
  Check, 
  Flame, 
  BookOpen, 
  ShieldAlert, 
  Maximize2 
} from 'lucide-react'

export default function OrganicResearchPanel({
  opportunities,
  onGenerate,
  onUpdate,
  onImprove,
  onSelectOpportunity,
  selectedOpportunityId,
  isGenerating
}) {
  const [filter, setFilter] = useState('todos') // 'todos', 'seleccionada', 'pendiente'

  const filteredOps = opportunities.filter(op => {
    if (filter === 'todos') return true
    if (filter === 'seleccionada') return op.estado === 'seleccionada'
    if (filter === 'pendiente') return op.estado === 'pendiente'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Módulo 03A: Header y Controles */}
      <div className="bg-zinc-50/50 border border-zinc-200/80 p-5 rounded-[12px] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-zinc-900 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FFD200]" />
            03A · Investigación y Oportunidades de Contenido
          </h3>
          <p className="text-[11px] text-zinc-500 max-w-xl leading-relaxed">
            Identifica temas estratégicos y tendencias actuales del sector. Evita el contenido genérico promoviendo ángulos disruptivos que eduquen y posicionen autoridad antes de empujar la oferta.
          </p>
        </div>
        
        {/* Acciones de Investigación */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onGenerate()}
            disabled={isGenerating}
            className="bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 text-[10px] font-black uppercase tracking-wider px-3.5 py-2.5 rounded-[8px] flex items-center gap-1.5 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Investigar Tendencias
          </button>
          
          <button
            onClick={() => onUpdate()}
            disabled={isGenerating}
            className="bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 text-[10px] font-black uppercase tracking-wider px-3.5 py-2.5 rounded-[8px] flex items-center gap-1.5 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isGenerating ? 'animate-spin' : ''}`} />
            Actualizar Tendencias
          </button>

          <button
            onClick={() => {
              if (selectedOpportunityId) {
                onImprove(selectedOpportunityId)
              } else {
                alert('Selecciona primero una oportunidad haciendo clic en "Seleccionar Oportunidad" para mejorar su impacto.')
              }
            }}
            disabled={isGenerating || !selectedOpportunityId}
            className="bg-white border border-zinc-250 hover:border-zinc-350 text-zinc-800 text-[10px] font-black uppercase tracking-wider px-3.5 py-2.5 rounded-[8px] flex items-center gap-1.5 transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            Mejorar Impacto
          </button>
        </div>
      </div>

      {/* Grid de Oportunidades */}
      {opportunities.length === 0 ? (
        <div className="bg-white border border-dashed border-zinc-200 rounded-[12px] p-12 text-center space-y-4">
          <p className="text-zinc-450 text-xs font-semibold">
            Aún no has investigado las tendencias para esta campaña. Haz clic en "Investigar Tendencias" para que la IA proponga rutas.
          </p>
          <button
            onClick={() => onGenerate()}
            disabled={isGenerating}
            className="bg-zinc-900 text-white text-[10px] font-black uppercase tracking-wider px-5 py-3 rounded-[8px] inline-flex items-center gap-2 hover:bg-zinc-850 transition"
          >
            {isGenerating ? 'Procesando...' : 'Comenzar Investigación Estratégica'}
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filtros de visualización */}
          <div className="flex items-center gap-2 border-b border-zinc-150 pb-2">
            {['todos', 'pendiente', 'seleccionada'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`text-[9px] uppercase tracking-widest font-black px-3 py-1.5 rounded-[12px] border transition ${
                  filter === t 
                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-xs' 
                    : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
                }`}
              >
                {t === 'todos' ? 'Todas' : t === 'pendiente' ? 'Pendientes' : 'Seleccionadas'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredOps.map((op) => {
              const isSelected = op.estado === 'seleccionada' || selectedOpportunityId === op.id
              return (
                <motion.div
                  key={op.id}
                  layout
                  className={`bg-white border rounded-[10px] p-5 space-y-4 transition-all duration-200 hover:shadow-xs relative flex flex-col justify-between ${
                    isSelected 
                      ? 'border-zinc-850 ring-1 ring-zinc-850 bg-zinc-50/10' 
                      : 'border-zinc-200'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Badge de Impacto y Formatos */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-[4px] ${
                        op.nivelImpacto === 'alto' 
                          ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                          : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        Impacto: {op.nivelImpacto}
                      </span>
                      
                      <div className="flex gap-1 text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                        {op.formatosSugeridos?.map((f, i) => (
                          <span key={i} className="bg-zinc-50 border border-zinc-150 px-1.5 py-0.5 rounded-[3px]">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Titulo */}
                    <h4 className="text-zinc-950 font-black text-xs leading-snug tracking-tight">
                      {op.tituloOportunidad}
                    </h4>

                    {/* Fichas de Razonamiento (Bento Style) */}
                    <div className="grid grid-cols-1 gap-2 pt-1 text-[11px] leading-relaxed">
                      
                      <div className="bg-[#f8fafc] border border-zinc-150 p-2.5 rounded-[8px] space-y-1">
                        <span className="text-[8px] font-black text-zinc-450 uppercase tracking-widest block flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-zinc-500" />
                          Tendencia Detectada
                        </span>
                        <p className="text-zinc-650 font-medium">{op.tendenciaDetectada}</p>
                      </div>

                      <div className="bg-white border border-zinc-150 p-2.5 rounded-[8px] space-y-1">
                        <span className="text-[8px] font-black text-zinc-450 uppercase tracking-widest block flex items-center gap-1">
                          <Maximize2 className="w-3 h-3 text-zinc-500" />
                          Ángulo Disruptivo Recomendado
                        </span>
                        <p className="text-zinc-700 font-bold italic">{op.anguloRecomendado}</p>
                      </div>

                      <div className="bg-rose-50/30 border border-rose-150 p-2.5 rounded-[8px] space-y-1">
                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest block flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-rose-450" />
                          Riesgo del Contenido Básico de la Competencia
                        </span>
                        <p className="text-rose-800 font-semibold">{op.riesgoDeContenidoBasico}</p>
                      </div>
                      
                      <div className="text-[10px] text-zinc-400 font-medium pt-1">
                        👉 <strong>Por qué importa:</strong> {op.porQueImporta}
                      </div>
                      
                      <div className="text-[10px] text-zinc-400 font-medium">
                        🔗 <strong>Relación indirecta con la oferta:</strong> {op.relacionConLaOferta}
                      </div>

                    </div>
                  </div>

                  {/* Acciones de la oportunidad */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2 mt-2">
                    <button
                      onClick={() => onSelectOpportunity(op.id)}
                      className={`flex-1 text-[10px] font-black uppercase tracking-wider py-2.5 rounded-[8px] flex items-center justify-center gap-1.5 transition active:scale-[0.98] ${
                        isSelected 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Oportunidad Seleccionada
                        </>
                      ) : (
                        'Seleccionar Oportunidad'
                      )}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
