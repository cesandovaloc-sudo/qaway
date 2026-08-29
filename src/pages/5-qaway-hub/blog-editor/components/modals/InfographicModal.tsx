import React, { useState } from 'react'
import {
  X,
  Workflow,
  BarChart3,
  TrendingUp,
  Clock,
  LayoutGrid,
  Quote,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react'

export type InfographicType =
  | 'flow'
  | 'stats'
  | 'bars'
  | 'timeline'
  | 'features'
  | 'author_quote'

export interface InfographicData {
  type: InfographicType
  title?: string
  accentColor?: string
  flowSteps?: { stepNumber: number; title: string; desc?: string }[]
  flowLayout?: 'horizontal' | 'vertical'
  statsItems?: { value: string; label: string; subtext?: string }[]
  barItems?: { label: string; percentage: number; displayValue?: string }[]
  timelineItems?: { phase: string; title: string; desc: string; dateOrBadge?: string }[]
  featureItems?: { iconEmoji: string; title: string; desc: string }[]
  authorQuote?: { quote: string; name: string; role: string; avatarUrl?: string }
}

interface InfographicModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (data: InfographicData) => void
  initialData?: InfographicData | null
}

const PRESET_COLORS = ['#ff4b0b', '#2563eb', '#10b981', '#8b5cf6', '#d97706', '#dc2626', '#3f3f46']

export default function InfographicModal({
  isOpen,
  onClose,
  onInsert,
  initialData,
}: InfographicModalProps) {
  const [activeTab, setActiveTab] = useState<InfographicType>(initialData?.type || 'flow')
  const [title, setTitle] = useState(initialData?.title || 'Metodología de 4 Pasos para Trabajar con IA')
  const [accentColor, setAccentColor] = useState(initialData?.accentColor || '#ff4b0b')

  // 1. Flujo de Pasos
  const [flowSteps, setFlowSteps] = useState(
    initialData?.flowSteps || [
      { stepNumber: 1, title: 'Aprende a utilizarla', desc: 'Domina una sola función clave.' },
      { stepNumber: 2, title: 'Prueba en tu rutina', desc: 'Aplica en tareas repetitivas reales.' },
      { stepNumber: 3, title: 'Revisa el resultado', desc: 'Evalúa la calidad y el tiempo ahorrado.' },
      { stepNumber: 4, title: 'Incorpora el flujo', desc: 'Conviértelo en tu estándar de trabajo.' },
    ]
  )
  const [flowLayout, setFlowLayout] = useState<'horizontal' | 'vertical'>(
    initialData?.flowLayout || 'horizontal'
  )

  // 2. Métricas / KPIs
  const [statsItems, setStatsItems] = useState(
    initialData?.statsItems || [
      { value: '+74%', label: 'Aumento en Productividad', subtext: 'En tareas de redacción y análisis' },
      { value: '15 min', label: 'Tiempo de Configuración', subtext: 'Para tu primer asistente' },
      { value: '3.5x', label: 'Mayor Velocidad de Entrega', subtext: 'Medido en flujos editoriales' },
    ]
  )

  // 3. Barras de Porcentaje
  const [barItems, setBarItems] = useState(
    initialData?.barItems || [
      { label: 'Uso de IA para Investigación y Esquematizado', percentage: 88, displayValue: '88%' },
      { label: 'Automatización de Tareas Repetitivas', percentage: 72, displayValue: '72%' },
      { label: 'Redacción y Pulido Final', percentage: 65, displayValue: '65%' },
    ]
  )

  // 4. Timeline
  const [timelineItems, setTimelineItems] = useState(
    initialData?.timelineItems || [
      { phase: 'Semana 1', title: 'Diagnóstico y Detección de Fricción', desc: 'Identifica las 3 tareas que más tiempo te quitan.', dateOrBadge: 'Fase Inicial' },
      { phase: 'Semana 2', title: 'Piloto con 1 Herramienta', desc: 'Prueba una sola solución sin cambiar todo tu flujo.', dateOrBadge: 'En Progreso' },
      { phase: 'Semana 3', title: 'Estandarización y Escala', desc: 'Integra la automatización en tu rutina diaria.', dateOrBadge: 'Objetivo' },
    ]
  )

  // 5. Cuadrícula de Características
  const [featureItems, setFeatureItems] = useState(
    initialData?.featureItems || [
      { iconEmoji: '⚡', title: 'Velocidad de Respuesta', desc: 'Respuestas estructuradas en segundos.' },
      { iconEmoji: '🎯', title: 'Precisión Editorial', desc: 'Tono adaptado a las normas de tu marca.' },
      { iconEmoji: '🔒', title: 'Privacidad de Datos', desc: 'Flujos seguros y almacenamiento local.' },
    ]
  )

  // 6. Cita con Autor
  const [authorQuote, setAuthorQuote] = useState(
    initialData?.authorQuote || {
      quote: 'La tecnología no reemplaza el criterio; amplifica a quienes saben formular las preguntas correctas.',
      name: 'Equipo Qaway Lab',
      role: 'Especialistas en Automatización & Contenido',
      avatarUrl: '',
    }
  )

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onInsert({
      type: activeTab,
      title: title.trim(),
      accentColor,
      flowSteps,
      flowLayout,
      statsItems,
      barItems,
      timelineItems,
      featureItems,
      authorQuote,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-line w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface-subtle shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-display font-bold text-lg text-primary leading-tight">
                Suite de Gráficos & Infografías Editoriales
              </h3>
              <p className="text-xs text-muted">
                Inserta diagramas visuales, flujos de pasos, métricas y comparativas sin código.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de Pestañas / Tipo de Gráfico */}
        <div className="px-6 py-3 border-b border-line bg-[#fafafc] flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: 'flow', label: 'Flujo de Pasos', icon: Workflow },
            { id: 'stats', label: 'Métricas / KPI', icon: TrendingUp },
            { id: 'bars', label: 'Barras de Datos', icon: BarChart3 },
            { id: 'timeline', label: 'Línea de Tiempo', icon: Clock },
            { id: 'features', label: 'Cuadrícula Cards', icon: LayoutGrid },
            { id: 'author_quote', label: 'Cita con Autor', icon: Quote },
          ].map(tab => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as InfographicType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white text-muted hover:text-primary border border-line hover:border-muted-light'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Formulario y Previsualización */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
          {/* Fila de Título y Color de Acento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-primary block mb-1">
                Título del Gráfico / Diagrama (Opcional):
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej: Metodología de Implementación Paso a Paso..."
                className="w-full bg-surface-muted border border-line rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-primary block mb-1">
                Color de Acento del Gráfico:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0 shrink-0"
                  title="Elegir color personalizado"
                />
                <div className="flex items-center gap-1 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAccentColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-4 h-4 rounded-full border cursor-pointer hover:scale-125 transition-transform ${
                        accentColor === c ? 'ring-2 ring-accent ring-offset-1 border-white' : 'border-black/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Formulario Específico según pestaña */}
          {activeTab === 'flow' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted">
                  Pasos del Flujo ({flowSteps.length}):
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex bg-surface-muted p-0.5 rounded-lg border border-line text-[11px]">
                    <button
                      type="button"
                      onClick={() => setFlowLayout('horizontal')}
                      className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                        flowLayout === 'horizontal' ? 'bg-white shadow-2xs text-primary' : 'text-muted'
                      }`}
                    >
                      Horizontal
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlowLayout('vertical')}
                      className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                        flowLayout === 'vertical' ? 'bg-white shadow-2xs text-primary' : 'text-muted'
                      }`}
                    >
                      Vertical
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFlowSteps(prev => [
                        ...prev,
                        { stepNumber: prev.length + 1, title: `Paso ${prev.length + 1}`, desc: 'Descripción breve.' },
                      ])
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-accent bg-accent/10 hover:bg-accent hover:text-white px-2.5 py-1 rounded-lg border border-accent/20 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Paso</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {flowSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surface-muted border border-line rounded-2xl flex items-center gap-3 text-xs"
                  >
                    <span
                      style={{ backgroundColor: accentColor }}
                      className="w-6 h-6 rounded-full text-white font-bold flex items-center justify-center shrink-0"
                    >
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={e => {
                        const copy = [...flowSteps]
                        copy[idx].title = e.target.value
                        setFlowSteps(copy)
                      }}
                      placeholder="Título del paso..."
                      className="flex-1 bg-white border border-line rounded-lg px-2.5 py-1.5 font-bold"
                    />
                    <input
                      type="text"
                      value={step.desc || ''}
                      onChange={e => {
                        const copy = [...flowSteps]
                        copy[idx].desc = e.target.value
                        setFlowSteps(copy)
                      }}
                      placeholder="Explicación concisa..."
                      className="flex-1 bg-white border border-line rounded-lg px-2.5 py-1.5 text-muted"
                    />
                    {flowSteps.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setFlowSteps(flowSteps.filter((_, i) => i !== idx))}
                        className="text-muted hover:text-danger p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted">
                  Tarjetas de Métricas ({statsItems.length}):
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setStatsItems(prev => [
                      ...prev,
                      { value: '100%', label: 'Nueva Métrica', subtext: 'Descripción del impacto' },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-xs font-bold text-accent bg-accent/10 hover:bg-accent hover:text-white px-2.5 py-1 rounded-lg border border-accent/20 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Métrica</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {statsItems.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surface-muted border border-line rounded-2xl flex items-center gap-3 text-xs"
                  >
                    <input
                      type="text"
                      value={st.value}
                      onChange={e => {
                        const copy = [...statsItems]
                        copy[idx].value = e.target.value
                        setStatsItems(copy)
                      }}
                      placeholder="+80% o 10x"
                      className="w-24 bg-white border border-line rounded-lg px-2.5 py-1.5 font-bold font-mono text-center"
                    />
                    <input
                      type="text"
                      value={st.label}
                      onChange={e => {
                        const copy = [...statsItems]
                        copy[idx].label = e.target.value
                        setStatsItems(copy)
                      }}
                      placeholder="Etiqueta principal..."
                      className="flex-1 bg-white border border-line rounded-lg px-2.5 py-1.5 font-bold"
                    />
                    <input
                      type="text"
                      value={st.subtext || ''}
                      onChange={e => {
                        const copy = [...statsItems]
                        copy[idx].subtext = e.target.value
                        setStatsItems(copy)
                      }}
                      placeholder="Contexto o detalle..."
                      className="flex-1 bg-white border border-line rounded-lg px-2.5 py-1.5 text-muted"
                    />
                    {statsItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setStatsItems(statsItems.filter((_, i) => i !== idx))}
                        className="text-muted hover:text-danger p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bars' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted">
                  Barras de Porcentaje ({barItems.length}):
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setBarItems(prev => [
                      ...prev,
                      { label: 'Nueva Variable', percentage: 50, displayValue: '50%' },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-xs font-bold text-accent bg-accent/10 hover:bg-accent hover:text-white px-2.5 py-1 rounded-lg border border-accent/20 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Barra</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {barItems.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surface-muted border border-line rounded-2xl flex items-center gap-3 text-xs"
                  >
                    <input
                      type="text"
                      value={b.label}
                      onChange={e => {
                        const copy = [...barItems]
                        copy[idx].label = e.target.value
                        setBarItems(copy)
                      }}
                      placeholder="Nombre de la variable o métrica..."
                      className="flex-1 bg-white border border-line rounded-lg px-2.5 py-1.5 font-bold"
                    />
                    <div className="flex items-center gap-2 w-48">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={b.percentage}
                        onChange={e => {
                          const copy = [...barItems]
                          const val = parseInt(e.target.value, 10) || 0
                          copy[idx].percentage = val
                          copy[idx].displayValue = `${val}%`
                          setBarItems(copy)
                        }}
                        className="flex-1 accent-accent cursor-pointer"
                      />
                      <span className="font-mono font-bold w-10 text-right">{b.percentage}%</span>
                    </div>
                    {barItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setBarItems(barItems.filter((_, i) => i !== idx))}
                        className="text-muted hover:text-danger p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted">
                  Hitos de la Línea de Tiempo ({timelineItems.length}):
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setTimelineItems(prev => [
                      ...prev,
                      { phase: `Fase ${prev.length + 1}`, title: 'Nuevo Hito', desc: 'Descripción del hito.', dateOrBadge: 'Próximo' },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-xs font-bold text-accent bg-accent/10 hover:bg-accent hover:text-white px-2.5 py-1 rounded-lg border border-accent/20 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Hito</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {timelineItems.map((tm, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surface-muted border border-line rounded-2xl flex items-center gap-3 text-xs"
                  >
                    <input
                      type="text"
                      value={tm.phase}
                      onChange={e => {
                        const copy = [...timelineItems]
                        copy[idx].phase = e.target.value
                        setTimelineItems(copy)
                      }}
                      placeholder="Fase o Fecha..."
                      className="w-28 bg-white border border-line rounded-lg px-2.5 py-1.5 font-bold"
                    />
                    <input
                      type="text"
                      value={tm.title}
                      onChange={e => {
                        const copy = [...timelineItems]
                        copy[idx].title = e.target.value
                        setTimelineItems(copy)
                      }}
                      placeholder="Título del hito..."
                      className="flex-1 bg-white border border-line rounded-lg px-2.5 py-1.5 font-bold"
                    />
                    <input
                      type="text"
                      value={tm.desc}
                      onChange={e => {
                        const copy = [...timelineItems]
                        copy[idx].desc = e.target.value
                        setTimelineItems(copy)
                      }}
                      placeholder="Descripción..."
                      className="flex-1 bg-white border border-line rounded-lg px-2.5 py-1.5 text-muted"
                    />
                    {timelineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setTimelineItems(timelineItems.filter((_, i) => i !== idx))}
                        className="text-muted hover:text-danger p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted">
                  Cuadrícula de Elementos ({featureItems.length}):
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFeatureItems(prev => [
                      ...prev,
                      { iconEmoji: '✨', title: 'Nuevo Elemento', desc: 'Descripción del elemento.' },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-xs font-bold text-accent bg-accent/10 hover:bg-accent hover:text-white px-2.5 py-1 rounded-lg border border-accent/20 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Elemento</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {featureItems.map((ft, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surface-muted border border-line rounded-2xl flex items-center gap-3 text-xs"
                  >
                    <input
                      type="text"
                      value={ft.iconEmoji}
                      onChange={e => {
                        const copy = [...featureItems]
                        copy[idx].iconEmoji = e.target.value
                        setFeatureItems(copy)
                      }}
                      placeholder="Emoji/Icono"
                      className="w-12 text-center bg-white border border-line rounded-lg px-1.5 py-1.5 text-sm"
                    />
                    <input
                      type="text"
                      value={ft.title}
                      onChange={e => {
                        const copy = [...featureItems]
                        copy[idx].title = e.target.value
                        setFeatureItems(copy)
                      }}
                      placeholder="Título..."
                      className="w-48 bg-white border border-line rounded-lg px-2.5 py-1.5 font-bold"
                    />
                    <input
                      type="text"
                      value={ft.desc}
                      onChange={e => {
                        const copy = [...featureItems]
                        copy[idx].desc = e.target.value
                        setFeatureItems(copy)
                      }}
                      placeholder="Descripción..."
                      className="flex-1 bg-white border border-line rounded-lg px-2.5 py-1.5 text-muted"
                    />
                    {featureItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFeatureItems(featureItems.filter((_, i) => i !== idx))}
                        className="text-muted hover:text-danger p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'author_quote' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-primary block mb-1">Frase o Cita Testimonial:</label>
                <textarea
                  rows={2}
                  value={authorQuote.quote}
                  onChange={e => setAuthorQuote({ ...authorQuote, quote: e.target.value })}
                  placeholder="Escribe la cita inspiradora..."
                  className="w-full bg-surface-muted border border-line rounded-xl p-3 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-primary block mb-1">Nombre del Autor:</label>
                  <input
                    type="text"
                    value={authorQuote.name}
                    onChange={e => setAuthorQuote({ ...authorQuote, name: e.target.value })}
                    placeholder="Ej: Sam Altman / Equipo Qaway"
                    className="w-full bg-surface-muted border border-line rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-primary block mb-1">Cargo / Especialidad:</label>
                  <input
                    type="text"
                    value={authorQuote.role}
                    onChange={e => setAuthorQuote({ ...authorQuote, role: e.target.value })}
                    placeholder="Ej: CEO OpenAI / Especialista IA"
                    className="w-full bg-surface-muted border border-line rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-primary block mb-1">URL Avatar (Opcional):</label>
                  <input
                    type="text"
                    value={authorQuote.avatarUrl || ''}
                    onChange={e => setAuthorQuote({ ...authorQuote, avatarUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-surface-muted border border-line rounded-xl px-3 py-2"
                  />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-line bg-surface-subtle flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-line rounded-xl text-xs font-bold text-muted hover:text-primary cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-accent hover:bg-accent-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Insertar Gráfico Editorial</span>
          </button>
        </div>
      </div>
    </div>
  )
}
