import React, { useState } from 'react'
import { ScriptItem } from '../types/content.types'
import {
  GitFork,
  Sparkles,
  Layers,
  Video,
  ArrowRight,
  CheckCircle2,
  Copy,
  Plus,
  Play,
  Share2,
  Calendar,
  Eye,
  Workflow
} from 'lucide-react'

interface MatrixDistributionProps {
  scripts: ScriptItem[]
  selectedScriptId?: string
  onAddToCalendar: (item: { title: string; hook: string; format: any }) => void
}

export const MatrixDistribution: React.FC<MatrixDistributionProps> = ({
  scripts,
  selectedScriptId,
  onAddToCalendar
}) => {
  const [activeBaseId, setActiveBaseId] = useState<string>(selectedScriptId || scripts[0]?.id || '')
  const baseScript = scripts.find(s => s.id === activeBaseId) || scripts[0]

  // 5 Alternative Hooks
  const [hooks, setHooks] = useState<string[]>([
    baseScript?.hook?.text || 'Hook 1: La mayoría de empresas comete este error garrafal.',
    'Hook 2: Si tuviera que empezar de cero hoy, esta sería la única herramienta que usaría.',
    'Hook 3: El 90% de los creadores ignora esto y por eso no tienen conversiones.',
    'Hook 4: Cómo logramos multiplicar resultados sin duplicar el presupuesto.',
    'Hook 5: Deja de hacer esto si quieres crecer de forma consistente este mes.'
  ])

  // 3 Alternative CTAs
  const [ctas, setCtas] = useState<string[]>([
    baseScript?.cta?.text || 'Comenta la palabra SKILL y te lo envío por DM.',
    'Guarda este video para cuando vayas a grabar tu próximo contenido.',
    'Escríbeme por mensaje directo con la palabra PROMPT para darte acceso gratis.'
  ])

  // Active node selection for interactive node graph
  const [activeHookIndex, setActiveHookIndex] = useState<number>(0)
  const [activeCtaIndex, setActiveCtaIndex] = useState<number>(0)
  const [viewMode, setViewMode] = useState<'nodes' | 'table'>('nodes')

  const [copiedCombo, setCopiedCombo] = useState<boolean>(false)

  const hookAngles = ['Curiosidad', 'Resultado Específico', 'Contrarian / Disruptivo', 'Error Fatal', 'Urgencia']
  const ctaTypes = ['Trigger ManyChat (DM)', 'Guardado / Bookmark', 'Lead Magnet Exclusivo']

  const handleCopyCurrentCombo = () => {
    const text = `--- TOMA MODULAR ENSAMBLADA ---\n[NIVEL 1: HOOK #${activeHookIndex + 1} (${hookAngles[activeHookIndex]})]\n${hooks[activeHookIndex]}\n\n[NIVEL 2: CUERPO MODULAR (Base 1 Sola Toma)]\n${baseScript?.coreBody}\n\n[NIVEL 3: CTA #${activeCtaIndex + 1} (${ctaTypes[activeCtaIndex]})]\n${ctas[activeCtaIndex]}`
    navigator.clipboard.writeText(text)
    setCopiedCombo(true)
    setTimeout(() => setCopiedCombo(false), 2000)
  }

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner (Purple/Indigo Accent Theme) */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-[#4f46e5] border border-indigo-100">
              Skill 03 · Combinatorial Node Graph
            </span>
            <span className="text-xs text-[#4f46e5] font-mono font-bold">15 Variaciones con 1 Grabación</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Workflow className="w-6 h-6 text-[#4f46e5]" />
            <span>Matriz de Nodos: Multiplicación Modular</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Graba el cuerpo nuclear una sola vez. Conecta dinámicamente diferentes ganchos (Hooks) y llamados a la acción (CTAs) mediante nodos de producción.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('nodes')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'nodes' ? 'bg-[#4f46e5] text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Árbol de Nodos
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'table' ? 'bg-[#4f46e5] text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tabla 5x1x3
            </button>
          </div>

          {/* Script selector */}
          <div className="flex items-center gap-2">
            <select
              value={activeBaseId}
              onChange={e => setActiveBaseId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#4f46e5] max-w-xs"
            >
              {scripts.map(s => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {viewMode === 'nodes' ? (
        /* VISTA DE ÁRBOL DE NODOS (Inspirada fielmente en media_1788862167690.png) */
        <div className="space-y-6">
          {/* Node Canvas Surface */}
          <div className="relative bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
            {/* Subtle background dot grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.35] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#818cf8 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            {/* Canvas Header info */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#4f46e5] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Flujo de Conexión Activo:
                </span>
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-[#4f46e5] border border-indigo-100">
                  Hook #{activeHookIndex + 1} ➔ Cuerpo Nuclear ➔ CTA #{activeCtaIndex + 1}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Haz clic en cualquier tarjeta para alternar la ruta activa
              </span>
            </div>

            {/* 3 Node Columns Layout */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* LEVEL 1: HOOKS (Left Column, 4 cols) */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4f46e5]" />
                    Nivel 1: Ganchos (0-3s)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">5 Variantes</span>
                </div>

                <div className="space-y-2.5">
                  {hooks.map((hookText, idx) => {
                    const isSelected = activeHookIndex === idx
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveHookIndex(idx)}
                        className={`group relative rounded-xl p-3.5 border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#4f46e5] text-white border-[#4f46e5] shadow-lg shadow-[#4f46e5]/20 ring-2 ring-indigo-300'
                            : 'bg-white hover:bg-indigo-50/40 border-slate-200 text-slate-700 shadow-2xs hover:border-indigo-200'
                        }`}
                      >
                        {/* Node Card Header */}
                        <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider ${
                                isSelected
                                  ? 'bg-white text-[#4f46e5]'
                                  : 'bg-indigo-50 text-[#4f46e5]'
                              }`}
                            >
                              Level 1
                            </span>
                            <span className={isSelected ? 'text-indigo-100' : 'text-slate-400'}>
                              Hook #{idx + 1}
                            </span>
                          </div>
                          <span
                            className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {hookAngles[idx]}
                          </span>
                        </div>

                        {/* Node Card Content */}
                        <p className={`text-xs leading-relaxed line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                          "{hookText}"
                        </p>

                        {/* Right connector anchor dot */}
                        <div
                          className={`absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#4f46e5] border-white shadow-xs scale-110'
                              : 'bg-white border-slate-300 group-hover:border-[#4f46e5]'
                          }`}
                        >
                          {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* LEVEL 2: CORE BODY (Center Column, 4 cols) */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4f46e5]" />
                    Nivel 2: Cuerpo Modular
                  </span>
                  <span className="text-[11px] font-mono text-[#4f46e5] font-bold">1 Sola Grabación</span>
                </div>

                {/* The Core Body Center Node */}
                <div className="relative bg-white border-2 border-[#4f46e5] rounded-2xl p-5 shadow-lg shadow-indigo-500/10 space-y-4">
                  {/* Left connector anchor dot */}
                  <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#4f46e5] border-2 border-white shadow-md flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  {/* Right connector anchor dot */}
                  <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#4f46e5] border-2 border-white shadow-md flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#4f46e5] text-white">
                      Level 2 · Core
                    </span>
                    <span className="text-xs text-indigo-700 font-mono flex items-center gap-1 font-semibold">
                      <Video className="w-3.5 h-3.5 text-[#4f46e5]" />
                      35 - 45 seg
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                      {baseScript?.title || 'Título del Video'}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Formato: {baseScript?.format.toUpperCase()} · Toma Nuclear Reutilizable
                    </p>
                  </div>

                  {/* Script body excerpt */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-mono line-clamp-6">
                    {baseScript?.coreBody || 'Cuerpo del guión no definido.'}
                  </div>

                  {/* Efficiency badge */}
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
                    <span className="text-[11px] font-bold text-[#4f46e5] block">
                      ⚡ 1 Cuerpo = 15 Salidas Listas
                    </span>
                    <span className="text-[10px] text-indigo-600/80 block">
                      Ahorro estimado: 80% de fatiga frente a la cámara
                    </span>
                  </div>
                </div>
              </div>

              {/* LEVEL 3: CTAs & TRIGGERS (Right Column, 4 cols) */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4f46e5]" />
                    Nivel 3: Llamado a la Acción
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">3 Rutas de Conversión</span>
                </div>

                <div className="space-y-3">
                  {ctas.map((ctaText, idx) => {
                    const isSelected = activeCtaIndex === idx
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveCtaIndex(idx)}
                        className={`group relative rounded-xl p-3.5 border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#4f46e5] text-white border-[#4f46e5] shadow-lg shadow-[#4f46e5]/20 ring-2 ring-indigo-300'
                            : 'bg-white hover:bg-indigo-50/40 border-slate-200 text-slate-700 shadow-2xs hover:border-indigo-200'
                        }`}
                      >
                        {/* Left connector anchor dot */}
                        <div
                          className={`absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#4f46e5] border-white shadow-xs scale-110'
                              : 'bg-white border-slate-300 group-hover:border-[#4f46e5]'
                          }`}
                        >
                          {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                        </div>

                        {/* Node Card Header */}
                        <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider ${
                                isSelected
                                  ? 'bg-white text-[#4f46e5]'
                                  : 'bg-indigo-50 text-[#4f46e5]'
                              }`}
                            >
                              Level 3
                            </span>
                            <span className={isSelected ? 'text-indigo-100' : 'text-slate-400'}>
                              CTA #{idx + 1}
                            </span>
                          </div>
                          <span
                            className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {ctaTypes[idx]}
                          </span>
                        </div>

                        {/* Node Card Content */}
                        <p className={`text-xs leading-relaxed line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                          "{ctaText}"
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* ASSEMBLED OUTPUT NODE CARD (Vista del Guión Ensamblado) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#4f46e5] block mb-0.5">
                  Salida Ensamblada en Tiempo Real
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Toma Combinada: [H{activeHookIndex + 1}] + [Cuerpo Base] + [CTA {activeCtaIndex + 1}]
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCurrentCombo}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold shadow-sm shadow-[#4f46e5]/20 transition cursor-pointer"
                >
                  {copiedCombo ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>¡Copiado al portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Toma Completa</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    onAddToCalendar({
                      title: `[H${activeHookIndex + 1}] ${baseScript.title}`,
                      hook: hooks[activeHookIndex],
                      format: baseScript.format
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] text-xs font-bold transition cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>+ Agendar a Calendario</span>
                </button>
              </div>
            </div>

            {/* Assembled Script Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  1. Gancho Seleccionado (3s)
                </span>
                <p className="text-xs text-slate-800 font-mono leading-relaxed">
                  "{hooks[activeHookIndex]}"
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  2. Cuerpo Grabado (40s)
                </span>
                <p className="text-xs text-slate-800 font-mono leading-relaxed line-clamp-3">
                  {baseScript?.coreBody}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  3. Llamado a la Acción (4s)
                </span>
                <p className="text-xs text-slate-800 font-mono leading-relaxed">
                  "{ctas[activeCtaIndex]}"
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VISTA DE TABLA 5x1x3 TRADICIONAL */
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Todas las Combinaciones Listas ({hooks.length * ctas.length} Variantes)
            </h3>
            <span className="text-xs text-[#4f46e5] font-mono font-semibold">Exportación Rápida</span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {hooks.map((h, hIdx) => {
              const cIdx = hIdx % ctas.length
              return (
                <div
                  key={hIdx}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-indigo-50/30 transition"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-[#4f46e5]">
                        H{hIdx + 1}
                      </span>
                      <span className="text-slate-300">+</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        Cuerpo Nuclear
                      </span>
                      <span className="text-slate-300">+</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-[#4f46e5]">
                        CTA {cIdx + 1}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">"{h}"</p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => {
                        const text = `[H${hIdx + 1}]\n${h}\n\n[CUERPO]\n${baseScript?.coreBody}\n\n[CTA ${cIdx + 1}]\n${ctas[cIdx]}`
                        navigator.clipboard.writeText(text)
                        alert('¡Copiado!')
                      }}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                      title="Copiar combinación"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        onAddToCalendar({
                          title: `Reel Var ${hIdx + 1}: ${baseScript.title}`,
                          hook: h,
                          format: baseScript.format
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold transition cursor-pointer"
                    >
                      + Agenda
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
