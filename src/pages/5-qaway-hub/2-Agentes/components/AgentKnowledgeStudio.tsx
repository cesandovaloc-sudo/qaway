import React, { useState } from 'react'
import { TenantAgentWorkspace, KnowledgeItem, FaqItem } from '../types/agent.types'
import {
  Database,
  Plus,
  Trash2,
  HelpCircle,
  PhoneForwarded,
  Tag,
  BookOpen,
  DollarSign,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface Props {
  workspace: TenantAgentWorkspace
  onUpdateWorkspace: (updater: (prev: TenantAgentWorkspace) => TenantAgentWorkspace) => void
}

export const AgentKnowledgeStudio: React.FC<Props> = ({
  workspace,
  onUpdateWorkspace
}) => {
  // Estado para nuevo ítem de conocimiento
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [showAddKbModal, setShowAddKbModal] = useState(false)

  // Estado para nueva FAQ
  const [newFaqQ, setNewFaqQ] = useState('')
  const [newFaqA, setNewFaqA] = useState('')
  const [showAddFaqModal, setShowAddFaqModal] = useState(false)

  // Estado para nueva keyword de handoff
  const [newKeyword, setNewKeyword] = useState('')

  const handleAddKb = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newDesc.trim()) return

    const newItem: KnowledgeItem = {
      id: `kb-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory.trim() || 'Servicios',
      description: newDesc.trim(),
      referencePrice: newPrice.trim() || undefined
    }

    onUpdateWorkspace(prev => ({
      ...prev,
      knowledgeBase: [newItem, ...prev.knowledgeBase]
    }))

    setNewTitle('')
    setNewCategory('')
    setNewDesc('')
    setNewPrice('')
    setShowAddKbModal(false)
  }

  const handleDeleteKb = (id: string) => {
    onUpdateWorkspace(prev => ({
      ...prev,
      knowledgeBase: prev.knowledgeBase.filter(k => k.id !== id)
    }))
  }

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFaqQ.trim() || !newFaqA.trim()) return

    const newFaq: FaqItem = {
      id: `faq-${Date.now()}`,
      question: newFaqQ.trim(),
      answer: newFaqA.trim()
    }

    onUpdateWorkspace(prev => ({
      ...prev,
      faqs: [newFaq, ...prev.faqs]
    }))

    setNewFaqQ('')
    setNewFaqA('')
    setShowAddFaqModal(false)
  }

  const handleDeleteFaq = (id: string) => {
    onUpdateWorkspace(prev => ({
      ...prev,
      faqs: prev.faqs.filter(f => f.id !== id)
    }))
  }

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = newKeyword.trim().toLowerCase()
    if (!clean) return

    const current = workspace.aiSettings.human_handoff_keywords || []
    if (current.includes(clean)) return

    onUpdateWorkspace(prev => ({
      ...prev,
      aiSettings: {
        ...prev.aiSettings,
        human_handoff_keywords: [...current, clean]
      }
    }))
    setNewKeyword('')
  }

  const handleRemoveKeyword = (kw: string) => {
    onUpdateWorkspace(prev => ({
      ...prev,
      aiSettings: {
        ...prev.aiSettings,
        human_handoff_keywords: (prev.aiSettings.human_handoff_keywords || []).filter(k => k !== kw)
      }
    }))
  }

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold mb-1">
            <Database className="w-3.5 h-3.5" />
            Capa 2 & Memoria de Negocio
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Base de Conocimiento y Disparadores de Traspaso Humano
          </h2>
          <p className="text-xs text-slate-500">
            Alimenta el catálogo de servicios, precios de referencia y las palabras que activan el Handover inmediato conforme a la Ley 31814.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Catálogo y FAQs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Catálogo de Servicios y Productos */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#4f46e5]" />
                  1. Portafolio de Productos y Servicios Autorizados
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  La IA solo ofrecerá y hablará de los ítems registrados en esta base oficial.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddKbModal(true)}
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir Ítem
              </button>
            </div>

            {/* Modal para añadir ítem */}
            {showAddKbModal && (
              <form onSubmit={handleAddKb} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800">Nuevo Ítem de Catálogo</span>
                  <button
                    type="button"
                    onClick={() => setShowAddKbModal(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Título del Servicio / Producto *"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                  />
                  <input
                    type="text"
                    placeholder="Categoría (ej. Desarrollo, Salud, Proyectos)"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                  />
                </div>

                <textarea
                  required
                  rows={2}
                  placeholder="Descripción detallada de la solución o características *"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                />

                <input
                  type="text"
                  placeholder="Precio o rango orientativo (ej. Desde $49 USD, Consulta S/ 45)"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                />

                <button
                  type="submit"
                  className="w-full bg-[#4f46e5] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#4338ca] transition-all cursor-pointer"
                >
                  Guardar en Base de Conocimiento
                </button>
              </form>
            )}

            <div className="space-y-3">
              {workspace.knowledgeBase.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-all flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm border border-indigo-100">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-black text-slate-800">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                    {item.referencePrice && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm mt-1">
                        <DollarSign className="w-3 h-3" /> {item.referencePrice}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteKb(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-all cursor-pointer"
                    title="Eliminar ítem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Preguntas Frecuentes (FAQs) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#4f46e5]" />
                  2. Preguntas Frecuentes y Políticas
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Respuestas inmediatas a objeciones y consultas recurrentes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddFaqModal(true)}
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir FAQ
              </button>
            </div>

            {/* Modal para añadir FAQ */}
            {showAddFaqModal && (
              <form onSubmit={handleAddFaq} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800">Nueva Pregunta Frecuente</span>
                  <button
                    type="button"
                    onClick={() => setShowAddFaqModal(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Cancelar
                  </button>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Pregunta formulada por el cliente *"
                  value={newFaqQ}
                  onChange={e => setNewFaqQ(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                />

                <textarea
                  required
                  rows={2}
                  placeholder="Respuesta oficial autorizada por la empresa *"
                  value={newFaqA}
                  onChange={e => setNewFaqA(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                />

                <button
                  type="submit"
                  className="w-full bg-[#4f46e5] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#4338ca] transition-all cursor-pointer"
                >
                  Guardar Pregunta Frecuente
                </button>
              </form>
            )}

            <div className="space-y-3">
              {workspace.faqs.map(faq => (
                <div
                  key={faq.id}
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-all flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-800">P: {faq.question}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">R: {faq.answer}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-all cursor-pointer"
                    title="Eliminar FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Columna Derecha: Matriz de Palabras Clave de Handover (Ley 31814) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <PhoneForwarded className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Disparadores de Handover Humano
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Si el cliente escribe cualquiera de estos términos en el chat, el agente congelará su auto-respuesta y activará la derivación inmediata.
            </p>

            {/* Input para agregar keyword */}
            <form onSubmit={handleAddKeyword} className="flex gap-2">
              <input
                type="text"
                placeholder="Nueva palabra clave..."
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Agregar
              </button>
            </form>

            {/* Píldoras de Keywords */}
            <div className="flex flex-wrap gap-2 pt-2">
              {(workspace.aiSettings.human_handoff_keywords || []).map(kw => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 transition-all"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer text-sm font-black"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-2 mt-4">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                El Reglamento D.S. 066-2024-PCM sanciona el encierro del consumidor en bucles automatizados sin opción a atención con personas.
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
