import React, { useState } from 'react'
import { ScriptItem, ContentFormat, PlatformTarget } from '../types/content.types'
import { Clock, Sparkles, Copy, Check, Send, BookOpen, Layers, Save, Tag, FileText, Globe, ArrowRight } from 'lucide-react'

interface ScriptStudioProps {
  scripts: ScriptItem[]
  activeScriptId?: string
  onSaveScript: (script: ScriptItem) => void
  onSendToMatrix: (script: ScriptItem) => void
}

export const ScriptStudio: React.FC<ScriptStudioProps> = ({
  scripts,
  activeScriptId,
  onSaveScript,
  onSendToMatrix
}) => {
  const initialScript = scripts.find(s => s.id === activeScriptId) || scripts[0]

  const [current, setCurrent] = useState<ScriptItem>(initialScript)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'guion' | 'descripcion' | 'blog' | 'preview'>('guion')

  // Calculate live metrics
  const hookWords = current.hook.text.trim() ? current.hook.text.trim().split(/\s+/).length : 0
  const hookEstimatedSec = (hookWords / 2.6).toFixed(1) // velocidad media hablada en video

  const bodyWords = current.coreBody.trim() ? current.coreBody.trim().split(/\s+/).length : 0
  const bodyEstimatedSec = (bodyWords / 2.6).toFixed(1)

  const totalEstimatedSec = (parseFloat(hookEstimatedSec) + parseFloat(bodyEstimatedSec) + 4).toFixed(0)

  const handleCopyFullScript = () => {
    let text = `TITULO: ${current.title}\nFORMATO: ${current.format.toUpperCase()} (${current.platform})\n\n[HOOK 0-3s]\n${current.hook.text}\n\n[PUENTE RETENCIÓN 3-15s]\n${current.retentionBridge}\n\n[CUERPO DE VALOR]\n${current.coreBody}\n\n[CALL TO ACTION]\n${current.cta.text}\n(Trigger ManyChat: "${current.cta.triggerKeyword}")\n\n[DESCRIPCIÓN]\n${current.descriptionCopy}`
    
    if (current.format === 'blog' && current.blogMeta) {
      text += `\n\n--- ARTÍCULO DE BLOG ---\nSEO Title: ${current.blogMeta.seoTitle}\nKeywords: ${current.blogMeta.targetKeywords.join(', ')}\n\n${current.blogMeta.contentMarkdown}`
    }

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    onSaveScript({
      ...current,
      hook: {
        ...current.hook,
        wordCount: hookWords,
        durationSec: parseFloat(hookEstimatedSec)
      },
      updatedAt: new Date().toISOString()
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Header with script switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#191918]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ff4b0b]/20 text-[#ff4b0b] border border-[#ff4b0b]/30">
              Skill 02 · High Retention Copy
            </span>
            <span className="text-xs text-white/50">Script Studio & Artículos</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Constructor Modular de Guiones & Posts
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Estructura palabra por palabra con tiempos de retención medidos. Soporte para Reels, Carruseles, Posts y Blog.
          </p>
        </div>

        {/* Script selector */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={current.id}
            onChange={e => {
              const found = scripts.find(s => s.id === e.target.value)
              if (found) setCurrent(found)
            }}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#fe6612] max-w-xs"
          >
            {scripts.map(s => (
              <option key={s.id} value={s.id} className="bg-[#1e1e1d]">
                [{s.format.toUpperCase()}] {s.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleCopyFullScript}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition cursor-pointer"
            title="Copiar guión al portapapeles"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar Todo'}</span>
          </button>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#fe6612] hover:bg-[#ff4b0b] text-white text-xs font-medium transition shadow-lg shadow-[#fe6612]/20 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Editor (Left 8 cols) & Metrics/Action (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form */}
        <div className="lg:col-span-8 space-y-5">
          {/* Metadata bar: Title, Format, Platform */}
          <div className="bg-[#191918] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <label className="text-xs font-medium text-white/60 block mb-1">Título del Proyecto</label>
                <input
                  type="text"
                  value={current.title}
                  onChange={e => setCurrent({ ...current, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-[#fe6612]"
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-medium text-white/60 block mb-1">Formato</label>
                <select
                  value={current.format}
                  onChange={e => setCurrent({ ...current, format: e.target.value as ContentFormat })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#fe6612]"
                >
                  <option value="reel" className="bg-[#1e1e1d]">Reel / Short</option>
                  <option value="carrusel" className="bg-[#1e1e1d]">Carrusel</option>
                  <option value="post" className="bg-[#1e1e1d]">Post Individual</option>
                  <option value="blog" className="bg-[#1e1e1d]">Artículo de Blog</option>
                  <option value="story" className="bg-[#1e1e1d]">Historia</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-medium text-white/60 block mb-1">Canal Destino</label>
                <select
                  value={current.platform}
                  onChange={e => setCurrent({ ...current, platform: e.target.value as PlatformTarget })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#fe6612]"
                >
                  <option value="instagram" className="bg-[#1e1e1d]">Instagram</option>
                  <option value="linkedin" className="bg-[#1e1e1d]">LinkedIn</option>
                  <option value="blog_qaway" className="bg-[#1e1e1d]">Blog Qaway Lab</option>
                  <option value="tiktok" className="bg-[#1e1e1d]">TikTok</option>
                  <option value="youtube" className="bg-[#1e1e1d]">YouTube</option>
                </select>
              </div>
            </div>

            {/* Navigation tabs inside editor */}
            <div className="flex border-b border-white/10 gap-4 pt-2">
              <button
                onClick={() => setActiveTab('guion')}
                className={`pb-2 text-xs font-medium border-b-2 transition cursor-pointer ${
                  activeTab === 'guion' ? 'border-[#fe6612] text-[#fe6612]' : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                Guión Modular (Hook/Cuerpo/CTA)
              </button>
              <button
                onClick={() => setActiveTab('descripcion')}
                className={`pb-2 text-xs font-medium border-b-2 transition cursor-pointer ${
                  activeTab === 'descripcion' ? 'border-[#fe6612] text-[#fe6612]' : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                Descripción & Copy de Redes
              </button>
              {(current.format === 'blog' || current.format === 'post') && (
                <button
                  onClick={() => setActiveTab('blog')}
                  className={`pb-2 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'blog' ? 'border-[#fe6612] text-[#fe6612]' : 'border-transparent text-white/50 hover:text-white'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  {current.format === 'blog' ? 'Artículo de Blog & SEO' : 'Texto Visual Post'}
                </button>
              )}
            </div>

            {/* TAB 1: GUION MODULAR */}
            {activeTab === 'guion' && (
              <div className="space-y-4 pt-2">
                {/* 1. Hook Section */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#fe6612]">
                      <span className="w-2 h-2 rounded-full bg-[#fe6612]" />
                      1. Hook Verbal (0 a 3 Segundos)
                    </span>
                    <div className="flex items-center gap-3 text-xs text-white/50 font-mono">
                      <span>{hookWords} palabras</span>
                      <span className="text-[#fe6612] font-semibold">~{hookEstimatedSec}s</span>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={current.hook.text}
                    onChange={e =>
                      setCurrent({
                        ...current,
                        hook: { ...current.hook, text: e.target.value }
                      })
                    }
                    placeholder="Escribe la frase exacta que detiene el scroll..."
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#fe6612]"
                  />

                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <span>Tipo de gancho:</span>
                    <select
                      value={current.hook.variant}
                      onChange={e =>
                        setCurrent({
                          ...current,
                          hook: {
                            ...current.hook,
                            variant: e.target.value as any
                          }
                        })
                      }
                      className="px-2 py-1 bg-white/10 rounded text-white text-xs border border-white/10 focus:outline-none"
                    >
                      <option value="curiosidad" className="bg-[#1e1e1d]">Curiosidad</option>
                      <option value="resultado_especifico" className="bg-[#1e1e1d]">Resultado Específico</option>
                      <option value="contrarian" className="bg-[#1e1e1d]">Contrarian (Creencia opuesta)</option>
                      <option value="pregunta_abierta" className="bg-[#1e1e1d]">Pregunta Abierta</option>
                      <option value="urgencia" className="bg-[#1e1e1d]">Urgencia / Error Común</option>
                    </select>
                  </div>
                </div>

                {/* 2. Retention Bridge */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    2. Puente de Retención (3 a 15s)
                  </span>
                  <p className="text-xs text-white/40">Plantea el conflicto o por qué el 90% lo hace mal.</p>
                  <textarea
                    rows={2}
                    value={current.retentionBridge}
                    onChange={e => setCurrent({ ...current, retentionBridge: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#fe6612]"
                  />
                </div>

                {/* 3. Core Body */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      3. Cuerpo de Alto Valor (15 a 45s)
                    </span>
                    <span className="text-xs text-white/50 font-mono">~{bodyEstimatedSec}s</span>
                  </div>
                  <p className="text-xs text-white/40">Paso 1, 2, 3 o la lección nuclear que vas a enseñar.</p>
                  <textarea
                    rows={4}
                    value={current.coreBody}
                    onChange={e => setCurrent({ ...current, coreBody: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#fe6612]"
                  />
                </div>

                {/* 4. CTA + ManyChat */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    4. Call to Action & Trigger de Conversión
                  </span>

                  <textarea
                    rows={2}
                    value={current.cta.text}
                    onChange={e =>
                      setCurrent({
                        ...current,
                        cta: { ...current.cta, text: e.target.value }
                      })
                    }
                    placeholder="Ej. Comenta la palabra SKILL y te envío las 5 por privado..."
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#fe6612]"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/50 block mb-1">Palabra Clave (ManyChat)</label>
                      <input
                        type="text"
                        value={current.cta.triggerKeyword}
                        onChange={e =>
                          setCurrent({
                            ...current,
                            cta: { ...current.cta, triggerKeyword: e.target.value.toUpperCase() }
                          })
                        }
                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono font-bold text-emerald-400 uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 block mb-1">Recurso a Entregar</label>
                      <input
                        type="text"
                        value={current.cta.leadMagnetName}
                        onChange={e =>
                          setCurrent({
                            ...current,
                            cta: { ...current.cta, leadMagnetName: e.target.value }
                          })
                        }
                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DESCRIPCIÓN & COPY */}
            {activeTab === 'descripcion' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1">
                    Copy del Post / Pie de Foto (Instagram / TikTok / LinkedIn)
                  </label>
                  <p className="text-xs text-white/40 mb-2">
                    Estructura: Gancho en primera línea + Desarrollo de 2 a 3 párrafos + Llamada a comentar la palabra clave.
                  </p>
                  <textarea
                    rows={8}
                    value={current.descriptionCopy}
                    onChange={e => setCurrent({ ...current, descriptionCopy: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#fe6612] font-mono leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: ARTÍCULO DE BLOG & POST */}
            {activeTab === 'blog' && (
              <div className="space-y-4 pt-2">
                {current.format === 'blog' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-white/60 block mb-1">Título SEO (H1)</label>
                        <input
                          type="text"
                          value={current.blogMeta?.seoTitle || ''}
                          onChange={e =>
                            setCurrent({
                              ...current,
                              blogMeta: {
                                seoTitle: e.target.value,
                                metaDescription: current.blogMeta?.metaDescription || '',
                                targetKeywords: current.blogMeta?.targetKeywords || [],
                                readingTimeMin: current.blogMeta?.readingTimeMin || 5,
                                contentMarkdown: current.blogMeta?.contentMarkdown || ''
                              }
                            })
                          }
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#fe6612]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/60 block mb-1">Meta Descripción SEO</label>
                        <input
                          type="text"
                          value={current.blogMeta?.metaDescription || ''}
                          onChange={e =>
                            setCurrent({
                              ...current,
                              blogMeta: {
                                seoTitle: current.blogMeta?.seoTitle || '',
                                metaDescription: e.target.value,
                                targetKeywords: current.blogMeta?.targetKeywords || [],
                                readingTimeMin: current.blogMeta?.readingTimeMin || 5,
                                contentMarkdown: current.blogMeta?.contentMarkdown || ''
                              }
                            })
                          }
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#fe6612]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-white/60 block mb-1">Contenido del Artículo (Markdown)</label>
                      <textarea
                        rows={10}
                        value={current.blogMeta?.contentMarkdown || ''}
                        onChange={e =>
                          setCurrent({
                            ...current,
                            blogMeta: {
                              seoTitle: current.blogMeta?.seoTitle || '',
                              metaDescription: current.blogMeta?.metaDescription || '',
                              targetKeywords: current.blogMeta?.targetKeywords || [],
                              readingTimeMin: current.blogMeta?.readingTimeMin || 5,
                              contentMarkdown: e.target.value
                            }
                          })
                        }
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-[#fe6612]"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Texto Visual para Post (Imagen o Carrusel)</label>
                    <textarea
                      rows={6}
                      value={current.postVisualText || ''}
                      onChange={e => setCurrent({ ...current, postVisualText: e.target.value })}
                      placeholder="Texto que irá incrustado dentro de la imagen o gráfica..."
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#fe6612]"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Teleprompter / Diagnostics Panel (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Time and pacing diagnostic */}
          <div className="bg-[#191918] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#fe6612]" />
              Diagnóstico de Ritmo & Grabación
            </h3>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Duración Estimada:</span>
                <span className="text-base font-bold text-white font-mono">{totalEstimatedSec}s</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#fe6612] to-[#ff4b0b] h-full"
                  style={{ width: `${Math.min(100, (parseInt(totalEstimatedSec) / 60) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed">
                {parseInt(totalEstimatedSec) <= 60 
                  ? '✅ Duración óptima para retención máxima en Reels y Shorts (<60s).'
                  : '⚠️ Supera 1 minuto. Considera recortar el cuerpo para evitar fatiga de audiencia.'}
              </p>
            </div>

            {/* Teleprompter Clean View */}
            <div>
              <span className="text-xs font-semibold text-white/60 block mb-2">Vista Teleprompter:</span>
              <div className="p-4 rounded-xl bg-black/60 border border-white/5 max-h-56 overflow-y-auto font-mono text-xs leading-relaxed space-y-2 text-white/90">
                <div className="text-[#fe6612] font-bold">1. [{current.hook.variant.toUpperCase()}]</div>
                <div>{current.hook.text}</div>
                <div className="text-amber-400 font-bold mt-2">2. [PUENTE]</div>
                <div>{current.retentionBridge}</div>
                <div className="text-blue-400 font-bold mt-2">3. [CUERPO]</div>
                <div>{current.coreBody}</div>
                <div className="text-emerald-400 font-bold mt-2">4. [CTA: {current.cta.triggerKeyword}]</div>
                <div>{current.cta.text}</div>
              </div>
            </div>

            {/* Direct button: Send to Matrix */}
            <button
              onClick={() => onSendToMatrix(current)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#fe6612] to-[#ff4b0b] text-white font-semibold text-xs transition shadow-lg shadow-[#fe6612]/20 hover:brightness-110 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Multiplicar en Matriz (Skill 3)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
