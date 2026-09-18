import React, { useState } from 'react'
import { TenantAgentWorkspace, CorrectionLogItem, GoldenExample } from '../types/agent.types'
import {
  FileEdit,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface Props {
  workspace: TenantAgentWorkspace
  onUpdateWorkspace: (updater: (prev: TenantAgentWorkspace) => TenantAgentWorkspace) => void
}

export const AgentCorrectionLogStudio: React.FC<Props> = ({
  workspace,
  onUpdateWorkspace
}) => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [userQuery, setUserQuery] = useState('')
  const [badReply, setBadReply] = useState('')
  const [humanCorrection, setHumanCorrection] = useState('')

  const logs = workspace.correctionLogs || []

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userQuery.trim() || !humanCorrection.trim()) return

    const newLog: CorrectionLogItem = {
      id: `corr-${Date.now()}`,
      timestamp: Date.now(),
      dateString: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      userQuery: userQuery.trim(),
      badAgentReply: badReply.trim() || 'Respuesta imprecisa o fría.',
      humanCorrection: humanCorrection.trim(),
      status: 'pendiente'
    }

    onUpdateWorkspace(prev => ({
      ...prev,
      correctionLogs: [newLog, ...(prev.correctionLogs || [])]
    }))

    setUserQuery('')
    setBadReply('')
    setHumanCorrection('')
    setShowAddModal(false)
  }

  const handleDeleteLog = (id: string) => {
    onUpdateWorkspace(prev => ({
      ...prev,
      correctionLogs: (prev.correctionLogs || []).filter(l => l !== id as any)
    }))
  }

  // Convertir corrección humana en Ejemplo de Oro inyectado en el Prompt
  const handleApplyAsGoldenExample = (log: CorrectionLogItem) => {
    const newGold: GoldenExample = {
      id: `gold-from-log-${Date.now()}`,
      category: 'tecnica',
      userQuestion: log.userQuery,
      idealAnswer: log.humanCorrection,
      rationale: `Corrección humana registrada en bitácora el ${log.dateString}`,
      isApproved: true
    }

    onUpdateWorkspace(prev => ({
      ...prev,
      goldenExamples: [newGold, ...(prev.goldenExamples || [])],
      correctionLogs: (prev.correctionLogs || []).map(l =>
        l.id === log.id ? { ...l, status: 'aplicado' } : l
      )
    }))

    alert('¡Corrección convertida en Ejemplo de Oro e inyectada exitosamente en el prompt!')
  }

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold mb-1">
              <FileEdit className="w-3.5 h-3.5" />
              Alineación Humana Continua (RLHF)
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Bitácora de Notas de Corrección (Feedback Loop)
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl">
              Registra las respuestas insatisfactorias detectadas en tus pruebas con el cliente y anota la corrección ideal. Con 1 clic, conviértelas en Ejemplos de Oro para que el agente aprenda permanentemente.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Nueva Nota de Corrección
          </button>
        </div>
      </div>

      {/* Lista de Correcciones */}
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">
              No hay correcciones pendientes
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Cada vez que pruebes al agente y detectes una respuesta mejorable, regístrala aquí para perfeccionar su vocabulario y argumentos.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#4f46e5] text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Registrar primera nota
            </button>
          </div>
        ) : (
          logs.map((log) => {
            const isApplied = log.status === 'aplicado'

            return (
              <div
                key={log.id}
                className={`bg-white rounded-2xl p-5 border transition-all shadow-xs space-y-3.5 ${
                  isApplied ? 'border-slate-200/80' : 'border-amber-200 bg-amber-50/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {log.dateString}
                    </span>
                    {isApplied ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Inyectado en Prompt
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-sm">
                        Pendiente de Inyección
                      </span>
                    )}
                  </div>

                  {!isApplied && (
                    <button
                      type="button"
                      onClick={() => handleApplyAsGoldenExample(log)}
                      className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Inyectar como Ejemplo de Oro
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Consulta Usuario */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Pregunta del Cliente:
                    </span>
                    <p className="font-bold text-slate-800">
                      "{log.userQuery}"
                    </p>
                  </div>

                  {/* Lo que dijo el bot (malo) */}
                  <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Respuesta Insatisfactoria del Bot:
                    </span>
                    <p className="text-slate-700 italic">
                      "{log.badAgentReply}"
                    </p>
                  </div>

                  {/* Corrección humana */}
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Corrección Humana Ideal:
                    </span>
                    <p className="text-slate-900 font-medium">
                      "{log.humanCorrection}"
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* MODAL: Nueva Nota de Corrección */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Registrar Nota de Corrección
                </h3>
                <p className="text-xs text-slate-500">
                  Corrige una respuesta real del agente para perfeccionar su criterio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  ¿Qué preguntó el cliente? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. ¿Tienen sucursal en Arequipa?"
                  value={userQuery}
                  onChange={e => setUserQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  ¿Qué respondió el bot que no te gustó?
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Sí, atendemos en todo el Perú (Respuesta falsa / alucinada)"
                  value={badReply}
                  onChange={e => setBadReply(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  ¿Cómo debió responder exactamente? (Corrección Humana) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ej. Actualmente atendemos presencialmente en Lima, pero realizamos consultoría y proyectos 100% remotos para Arequipa y todo el país..."
                  value={humanCorrection}
                  onChange={e => setHumanCorrection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Guardar en Bitácora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
