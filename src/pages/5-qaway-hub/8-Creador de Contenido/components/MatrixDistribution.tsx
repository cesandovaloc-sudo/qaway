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
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#191918]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Skill 03 · Combinatorial Distribution
              </span>
              <span className="text-xs text-white/50">Matriz Modular 5x1x3</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Matriz de Multiplicación de Contenido
            </h2>
            <p className="text-sm text-white/60 mt-1 max-w-2xl">
              Reutiliza el mismo cuerpo de video grabado y combínalo con 5 ganchos verbales distintos para probar diferentes ángulos algorítmicos sin volver a grabar todo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">Guión Base:</span>
            <select
              value={activeBaseId}
              onChange={e => setActiveBaseId(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#fe6612] max-w-xs"
            >
              {scripts.map(s => (
                <option key={s.id} value={s.id} className="bg-[#1e1e1d]">
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* The Combinatorial Pipeline View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: 5 Hooks List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fe6612]" />
              5 Hooks Alternativos (0 a 3s)
            </h3>
            <span className="text-xs text-white/40">5 Grabaciones de 5s</span>
          </div>

          <div className="space-y-3">
            {hooks.map((h, idx) => (
              <div
                key={idx}
                className="bg-[#191918] border border-white/10 rounded-xl p-3.5 space-y-2 focus-within:border-[#fe6612] transition"
              >
                <div className="flex items-center justify-between text-xs text-white/50 font-mono">
                  <span className="font-bold text-[#fe6612]">HOOK #{idx + 1}</span>
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
                  className="w-full bg-white/5 border border-white/5 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-[#fe6612]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Center Col: The Single Core Body */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              1 Solo Cuerpo Grabado
            </h3>
            <span className="text-xs text-emerald-400 font-mono font-semibold">1 Sola Toma</span>
          </div>

          <div className="bg-[#191918] border border-blue-500/30 rounded-2xl p-5 space-y-3 h-[calc(100%-2rem)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs text-blue-400 font-semibold">
                <Video className="w-4 h-4" />
                <span>Base Reutilizable (35 a 45s)</span>
              </div>
              <p className="text-xs text-white/80 font-mono leading-relaxed line-clamp-12 bg-black/40 p-3 rounded-xl border border-white/5">
                {baseScript?.coreBody || 'Cuerpo no definido.'}
              </p>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
              <span className="text-xs text-blue-300 font-medium block">
                ⚡ Ahorro del 80% de tiempo
              </span>
              <span className="text-[11px] text-white/50 block mt-0.5">
                Grabas el cuerpo una vez y lo montas con los 5 ganchos.
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: 3 CTAs & Final Combinations */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Combinaciones Listas para Grabar
            </h3>
            <span className="text-xs text-white/40">{hooks.length * ctas.length} variantes</span>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {hooks.map((h, hIdx) => {
              const cIdx = hIdx % ctas.length
              const comboKey = hIdx * 10 + cIdx
              const isCopied = copiedIndex === comboKey

              return (
                <div
                  key={hIdx}
                  className="bg-[#191918] border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-white/20 transition"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#fe6612]/20 text-[#fe6612]">
                        H{hIdx + 1}
                      </span>
                      <span className="text-white/40">+</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400">
                        Cuerpo
                      </span>
                      <span className="text-white/40">+</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        CTA {cIdx + 1}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/70 truncate max-w-[200px]">
                      "{h}"
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyCombo(hIdx, cIdx)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                      title="Copiar combinación completa"
                    >
                      {isCopied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
                      className="px-2.5 py-1.5 rounded-lg bg-[#fe6612]/20 hover:bg-[#fe6612] text-[#fe6612] hover:text-white text-[11px] font-semibold transition cursor-pointer"
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
