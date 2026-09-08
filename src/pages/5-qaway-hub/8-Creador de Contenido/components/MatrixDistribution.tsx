import React, { useState } from 'react'
import { ScriptItem } from '../types/content.types'
import { GitFork, Sparkles, Layers, Video, ArrowRight, CheckCircle2, Copy } from 'lucide-react'

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

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopyCombo = (hookIdx: number, ctaIdx: number) => {
    const text = `--- TOMA MODULAR ---\n[HOOK #${hookIdx + 1} (5s)]\n${hooks[hookIdx]}\n\n[CUERPO PRINCIPAL (35s)]\n${baseScript?.coreBody}\n\n[CTA #${ctaIdx + 1}]\n${ctas[ctaIdx]}`
    navigator.clipboard.writeText(text)
    setCopiedIndex(hookIdx * 10 + ctaIdx)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner (Clean Minimalist White) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Skill 03 · Combinatorial Matrix
            </span>
            <span className="text-xs text-slate-400 font-medium">Multiplicación 5x1x3</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Matriz de Multiplicación de Contenido
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Reutiliza el mismo cuerpo de video grabado y combínalo con 5 ganchos verbales distintos para probar diferentes ángulos algorítmicos sin volver a grabar todo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Guión Base:</span>
          <select
            value={activeBaseId}
            onChange={e => setActiveBaseId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#ff4b0b] max-w-xs"
          >
            {scripts.map(s => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* The Combinatorial Pipeline View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: 5 Hooks List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff4b0b]" />
              5 Hooks Alternativos (0 a 3s)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">5 Tomas de 5s</span>
          </div>

          <div className="space-y-3">
            {hooks.map((h, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2 shadow-2xs hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="font-bold text-[#ff4b0b]">HOOK #{idx + 1}</span>
                  <span>Variante {['Curiosidad', 'Resultado', 'Contrarian', 'Error', 'Urgencia'][idx]}</span>
                </div>
                <textarea
                  rows={2}
                  value={h}
                  onChange={e => {
                    const newH = [...hooks]
                    newH[idx] = e.target.value
                    setHooks(newH)
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#ff4b0b]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Center Col: The Single Core Body (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              1 Solo Cuerpo Grabado
            </h3>
            <span className="text-[11px] text-indigo-600 font-mono font-bold">1 Sola Toma</span>
          </div>

          <div className="bg-white border border-indigo-100 rounded-2xl p-5 space-y-3 h-[calc(100%-2rem)] flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs text-indigo-700 font-semibold">
                <Video className="w-4 h-4" />
                <span>Base Reutilizable (35 a 45s)</span>
              </div>
              <p className="text-xs text-slate-700 font-mono leading-relaxed line-clamp-12 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {baseScript?.coreBody || 'Cuerpo no definido.'}
              </p>
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-center">
              <span className="text-xs text-indigo-800 font-semibold block">
                ⚡ Ahorro del 80% de tiempo
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Grabas el cuerpo una vez y lo montas con los 5 ganchos.
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: 3 CTAs & Final Combinations (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              Combinaciones Listas para Grabar
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">{hooks.length * ctas.length} variantes</span>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {hooks.map((h, hIdx) => {
              const cIdx = hIdx % ctas.length
              const comboKey = hIdx * 10 + cIdx
              const isCopied = copiedIndex === comboKey

              return (
                <div
                  key={hIdx}
                  className="bg-white border border-slate-200/90 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-300 shadow-2xs transition"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-[#ff4b0b] border border-orange-200">
                        H{hIdx + 1}
                      </span>
                      <span className="text-slate-300">+</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Cuerpo
                      </span>
                      <span className="text-slate-300">+</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        CTA {cIdx + 1}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate max-w-[200px]">
                      "{h}"
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyCombo(hIdx, cIdx)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                      title="Copiar combinación completa"
                    >
                      {isCopied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        onAddToCalendar({
                          title: `Reel Var ${hIdx + 1}: ${baseScript.title}`,
                          hook: h,
                          format: baseScript.format
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#ff4b0b] hover:text-white text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                    >
                      + Agenda
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
