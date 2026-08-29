import React, { useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import {
  Pencil,
  Trash2,
  Workflow,
  BarChart3,
  TrendingUp,
  Clock,
  LayoutGrid,
  Quote,
  ArrowRight,
  ArrowDown,
} from 'lucide-react'
import InfographicModal, { type InfographicData } from '../modals/InfographicModal'

export default function InfographicBlockComponent(props: any) {
  const { node, updateAttributes, deleteNode, selected } = props
  const data: InfographicData = node.attrs.infographicData || {
    type: 'flow',
    title: '',
    accentColor: '#ff4b0b',
  }

  const [isEditing, setIsEditing] = useState(false)
  const color = data.accentColor || '#ff4b0b'

  const handleUpdate = (newData: InfographicData) => {
    updateAttributes({ infographicData: newData })
    setIsEditing(false)
  }

  return (
    <NodeViewWrapper className="infographic-node-view my-6 clear-both select-none font-sans">
      <div
        className={`relative group rounded-3xl border border-line bg-surface-subtle p-5 sm:p-7 shadow-xs transition-all ${
          selected ? 'ring-2 ring-accent ring-offset-2 shadow-md' : ''
        }`}
      >
        {/* Barra Flotante de Herramientas */}
        <div className="absolute -top-3.5 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1.5 bg-[#18181b] text-white px-2.5 py-1 rounded-xl shadow-xl border border-line/20 text-xs">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-white/20 text-zinc-200 font-bold transition-colors cursor-pointer"
            title="Editar datos y estilos del gráfico"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Editar Gráfico</span>
          </button>
          <div className="w-[1px] h-3 bg-white/20" />
          <button
            type="button"
            onClick={deleteNode}
            className="p-1 rounded-lg text-zinc-400 hover:text-danger hover:bg-white/20 transition-colors cursor-pointer"
            title="Eliminar gráfico"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Título Principal del Diagrama si existe */}
        {data.title && (
          <div className="mb-5 pb-3 border-b border-line flex items-center gap-2">
            <span
              style={{ backgroundColor: `${color}18`, color: color }}
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
            >
              {data.type === 'flow' && <Workflow className="w-4 h-4" />}
              {data.type === 'stats' && <TrendingUp className="w-4 h-4" />}
              {data.type === 'bars' && <BarChart3 className="w-4 h-4" />}
              {data.type === 'timeline' && <Clock className="w-4 h-4" />}
              {data.type === 'features' && <LayoutGrid className="w-4 h-4" />}
              {data.type === 'author_quote' && <Quote className="w-4 h-4" />}
            </span>
            <h4 className="font-display font-bold text-base sm:text-lg text-primary tracking-tight m-0">
              {data.title}
            </h4>
          </div>
        )}

        {/* 1. TIPO: FLUJO LINEAL DE PASOS */}
        {data.type === 'flow' && (
          <div
            className={`grid gap-3 ${
              data.flowLayout === 'vertical'
                ? 'grid-cols-1'
                : data.flowSteps && data.flowSteps.length <= 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : data.flowSteps && data.flowSteps.length === 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {(data.flowSteps || []).map((step, idx, arr) => (
              <div key={idx} className="relative flex flex-col justify-between">
                <div
                  style={{ borderTopColor: color }}
                  className="bg-white border border-line border-t-3 rounded-2xl p-3.5 sm:p-4 shadow-2xs h-full flex flex-col justify-between space-y-1.5"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        style={{ backgroundColor: color }}
                        className="w-5 h-5 rounded-full text-white font-bold text-[10px] flex items-center justify-center shadow-2xs"
                      >
                        {step.stepNumber || idx + 1}
                      </span>
                      <span className="text-[9px] font-bold text-muted uppercase tracking-wider">
                        Paso {idx + 1}
                      </span>
                    </div>
                    <strong className="font-bold text-primary text-xs sm:text-sm block leading-snug">
                      {step.title}
                    </strong>
                  </div>
                  {step.desc && (
                    <p className="text-[11px] text-muted leading-relaxed m-0">{step.desc}</p>
                  )}
                </div>

                {/* Flecha conectora para desktop horizontal */}
                {data.flowLayout !== 'vertical' && idx < arr.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-line shadow-2xs items-center justify-center text-muted">
                    <ArrowRight className="w-3 h-3" style={{ color }} />
                  </div>
                )}

                {/* Flecha conectora para vertical */}
                {data.flowLayout === 'vertical' && idx < arr.length - 1 && (
                  <div className="flex justify-center my-1 text-muted">
                    <ArrowDown className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 2. TIPO: MÉTRICAS / KPIS */}
        {data.type === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(data.statsItems || []).map((st, idx) => (
              <div
                key={idx}
                className="bg-white border border-line rounded-2xl p-5 shadow-2xs text-center space-y-1.5 hover:border-line-subtle transition-colors"
              >
                <div
                  style={{ color }}
                  className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-none"
                >
                  {st.value}
                </div>
                <div className="font-bold text-xs sm:text-sm text-primary leading-snug">
                  {st.label}
                </div>
                {st.subtext && (
                  <p className="text-[11px] text-muted leading-relaxed m-0">{st.subtext}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 3. TIPO: BARRAS COMPARATIVAS DE DATOS */}
        {data.type === 'bars' && (
          <div className="space-y-3.5 bg-white border border-line rounded-2xl p-5 shadow-2xs">
            {(data.barItems || []).map((b, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-primary">{b.label}</span>
                  <span className="font-mono font-bold" style={{ color }}>
                    {b.displayValue || `${b.percentage}%`}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${Math.max(4, Math.min(100, b.percentage))}%`,
                      backgroundColor: color,
                    }}
                    className="h-full rounded-full transition-all duration-500 ease-out"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. TIPO: LÍNEA DE TIEMPO (TIMELINE) */}
        {data.type === 'timeline' && (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
            {(data.timelineItems || []).map((tm, idx) => (
              <div key={idx} className="relative space-y-1">
                <span
                  style={{ backgroundColor: color }}
                  className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-2xs"
                />
                <div className="flex items-center gap-2">
                  <span
                    style={{ color, backgroundColor: `${color}15` }}
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  >
                    {tm.phase}
                  </span>
                  {tm.dateOrBadge && (
                    <span className="text-[10px] text-muted font-medium">
                      • {tm.dateOrBadge}
                    </span>
                  )}
                </div>
                <strong className="font-bold text-xs sm:text-sm text-primary block">
                  {tm.title}
                </strong>
                <p className="text-xs text-muted leading-relaxed m-0">{tm.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* 5. TIPO: CUADRÍCULA DE CARACTERÍSTICAS */}
        {data.type === 'features' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(data.featureItems || []).map((ft, idx) => (
              <div
                key={idx}
                className="bg-white border border-line rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2 hover:border-line-subtle transition-colors"
              >
                <span className="text-2xl block">{ft.iconEmoji || '✨'}</span>
                <strong className="font-bold text-xs sm:text-sm text-primary block leading-snug">
                  {ft.title}
                </strong>
                <p className="text-xs text-muted leading-relaxed m-0">{ft.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* 6. TIPO: CITA CON AUTOR Y PERFIL */}
        {data.type === 'author_quote' && (
          <div
            style={{ borderLeftColor: color }}
            className="bg-white border border-line border-l-4 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4"
          >
            <p className="text-sm sm:text-base italic text-primary font-medium leading-relaxed m-0">
              "{data.authorQuote?.quote}"
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-line">
              {data.authorQuote?.avatarUrl ? (
                <img
                  src={data.authorQuote.avatarUrl}
                  alt={data.authorQuote.name}
                  className="w-10 h-10 rounded-full object-cover border border-line"
                />
              ) : (
                <span
                  style={{ backgroundColor: `${color}18`, color }}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                >
                  {data.authorQuote?.name?.charAt(0) || 'A'}
                </span>
              )}
              <div>
                <strong className="text-xs font-bold text-primary block">
                  {data.authorQuote?.name}
                </strong>
                <span className="text-[11px] text-muted block">
                  {data.authorQuote?.role}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Re-edición */}
      {isEditing && (
        <InfographicModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onInsert={handleUpdate}
          initialData={data}
        />
      )}
    </NodeViewWrapper>
  )
}
