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
  const [activeTab, setActiveTab] = useState<'guion' | 'descripcion' | 'blog'>('guion')

  // Calculate live metrics
  const hookWords = current.hook.text.trim() ? current.hook.text.trim().split(/\s+/).length : 0
  const hookEstimatedSec = (hookWords / 2.6).toFixed(1)

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
    <div className="space-y-6 text-slate-800">
      {/* Top Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-[#4f46e5] border border-indigo-100">
              Skill 02 · Retention Copy
            </span>
            <span className="text-xs text-slate-400 font-medium">Script Studio & Artículos</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Constructor Modular de Guiones & Posts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Estructura palabra por palabra con tiempos de retención medidos. Soporte para Reels, Carruseles, Posts y Blog.
          </p>
        </div>

        {/* Script selector & actions */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={current.id}
            onChange={e => {
              const found = scripts.find(s => s.id === e.target.value)
              if (found) setCurrent(found)
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#4f46e5] max-w-xs"
          >
            {scripts.map(s => (
              <option key={s.id} value={s.id}>
                [{s.format.toUpperCase()}] {s.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleCopyFullScript}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold transition shadow-sm shadow-[#4f46e5]/20 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Editor & Diagnostic Teleprompter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Metadata bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-4 border-b border-slate-100">
              <div className="md:col-span-6">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Título del Proyecto</label>
                <input
                  type="text"
                  value={current.title}
                  onChange={e => setCurrent({ ...current, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#4f46e5]"
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Formato</label>
                <select
                  value={current.format}
                  onChange={e => setCurrent({ ...current, format: e.target.value as ContentFormat })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                >
                  <option value="reel">Reel / Short</option>
                  <option value="carrusel">Carrusel</option>
                  <option value="post">Post Individual</option>
                  <option value="blog">Artículo de Blog</option>
                  <option value="story">Historia</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Canal Destino</label>
                <select
                  value={current.platform}
                  onChange={e => setCurrent({ ...current, platform: e.target.value as PlatformTarget })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                >
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="blog_qaway">Blog Qaway Lab</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
            </div>

            {/* Navigation tabs inside editor */}
            <div className="flex border-b border-slate-100 gap-4">
              <button
                onClick={() => setActiveTab('guion')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                  activeTab === 'guion' ? 'border-[#4f46e5] text-[#4f46e5]' : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Guión Modular (Hook/Cuerpo/CTA)
              </button>
              <button
                onClick={() => setActiveTab('descripcion')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                  activeTab === 'descripcion' ? 'border-[#4f46e5] text-[#4f46e5]' : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Descripción & Copy de Redes
              </button>
              {(current.format === 'blog' || current.format === 'post') && (
                <button
                  onClick={() => setActiveTab('blog')}
                  className={`pb-2.5 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'blog' ? 'border-[#4f46e5] text-[#4f46e5]' : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  {current.format === 'blog' ? 'Artículo de Blog & SEO' : 'Texto Visual Post'}
                </button>
              )}
            </div>

            {/* TAB 1: GUION MODULAR */}
            {activeTab === 'guion' && (
              <div className="space-y-4 pt-1">
                {/* 1. Hook Section */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4f46e5]">
                      <span className="w-2 h-2 rounded-full bg-[#4f46e5]" />
                      1. Hook Verbal (0 a 3 Segundos)
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span>{hookWords} palabras</span>
                      <span>·</span>
                      <span className="text-[#4f46e5] font-bold">~{hookEstimatedSec}s</span>
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
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-[#4f46e5] shadow-2xs leading-relaxed"
                  />

                  <div className="flex items-center gap-2 text-xs text-slate-500">
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
                      className="px-2 py-1 bg-white rounded-lg text-slate-700 text-xs border border-slate-200 focus:outline-none"
                    >
                      <option value="curiosidad">Curiosidad</option>
                      <option value="resultado_especifico">Resultado Específico</option>
                      <option value="contrarian">Contrarian (Creencia opuesta)</option>
                      <option value="pregunta_abierta">Pregunta Abierta</option>
                      <option value="urgencia">Urgencia / Error Común</option>
                    </select>
                  </div>
                </div>

                {/* 2. Retention Bridge */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    2. Puente de Retención (3 a 15s)
                  </span>
                  <p className="text-[11px] text-slate-500">Plantea el conflicto o por qué el 90% lo hace mal.</p>
                  <textarea
                    rows={2}
                    value={current.retentionBridge}
                    onChange={e => setCurrent({ ...current, retentionBridge: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#4f46e5] shadow-2xs leading-relaxed"
                  />
                </div>

                {/* 3. Core Body */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4f46e5]">
                      <span className="w-2 h-2 rounded-full bg-[#4f46e5]" />
                      3. Cuerpo de Alto Valor (15 a 45s)
                    </span>
                    <span className="text-xs text-slate-400 font-mono">~{bodyEstimatedSec}s</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Paso 1, 2, 3 o la lección nuclear que vas a enseñar.</p>
                  <textarea
                    rows={4}
                    value={current.coreBody}
                    onChange={e => setCurrent({ ...current, coreBody: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#4f46e5] shadow-2xs leading-relaxed"
                  />
                </div>

                {/* 4. CTA + ManyChat */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4f46e5]">
                    <span className="w-2 h-2 rounded-full bg-[#4f46e5]" />
                    4. Call to Action & Trigger de Conversión (ManyChat)
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
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#4f46e5] shadow-2xs"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1 font-medium">Palabra Clave (Trigger DM)</label>
                      <input
                        type="text"
                        value={current.cta.triggerKeyword}
                        onChange={e =>
                          setCurrent({
                            ...current,
                            cta: { ...current.cta, triggerKeyword: e.target.value.toUpperCase() }
                          })
                        }
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-[#4f46e5] uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1 font-medium">Recurso a Entregar</label>
                      <input
                        type="text"
                        value={current.cta.leadMagnetName}
                        onChange={e =>
                          setCurrent({
                            ...current,
                            cta: { ...current.cta, leadMagnetName: e.target.value }
                          })
                        }
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DESCRIPCIÓN & COPY */}
            {activeTab === 'descripcion' && (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    Copy del Post / Pie de Foto (Instagram / TikTok / LinkedIn)
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Estructura: Gancho en primera línea + Desarrollo de 2 a 3 párrafos + Llamada a comentar la palabra clave.
                  </p>
                  <textarea
                    rows={8}
                    value={current.descriptionCopy}
                    onChange={e => setCurrent({ ...current, descriptionCopy: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#4f46e5] font-mono leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: ARTÍCULO DE BLOG & POST */}
            {activeTab === 'blog' && (
              <div className="space-y-4 pt-1">
                {current.format === 'blog' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-600 block mb-1 font-medium">Título SEO (H1)</label>
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
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-600 block mb-1 font-medium">Meta Descripción SEO</label>
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
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-600 block mb-1 font-medium">Contenido del Artículo (Markdown)</label>
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
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#4f46e5]"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-xs text-slate-600 block mb-1 font-medium">Texto Visual para Post (Imagen o Carrusel)</label>
                    <textarea
                      rows={6}
                      value={current.postVisualText || ''}
                      onChange={e => setCurrent({ ...current, postVisualText: e.target.value })}
                      placeholder="Texto que irá incrustado dentro de la imagen o gráfica..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#4f46e5]"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Teleprompter / Diagnostics Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#4f46e5]" />
              Diagnóstico de Ritmo
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Duración Estimada:</span>
                <span className="text-base font-bold text-slate-900 font-mono">{totalEstimatedSec}s</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#4f46e5] h-full"
                  style={{ width: `${Math.min(100, (parseInt(totalEstimatedSec) / 60) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {parseInt(totalEstimatedSec) <= 60 
                  ? '✅ Duración óptima para retención máxima (<60s).'
                  : '⚠️ Supera 1 minuto. Considera recortar el cuerpo.'}
              </p>
            </div>

            {/* Teleprompter Clean View */}
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-2">Teleprompter de Grabación:</span>
              <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs leading-relaxed space-y-2 max-h-56 overflow-y-auto shadow-inner">
                <div className="text-indigo-300 font-bold">1. [{current.hook.variant.toUpperCase()}]</div>
                <div className="text-slate-100">{current.hook.text}</div>
                <div className="text-slate-400 font-bold mt-2">2. [PUENTE]</div>
                <div className="text-slate-200">{current.retentionBridge}</div>
                <div className="text-indigo-300 font-bold mt-2">3. [CUERPO]</div>
                <div className="text-slate-200">{current.coreBody}</div>
                <div className="text-indigo-300 font-bold mt-2">4. [CTA: {current.cta.triggerKeyword}]</div>
                <div className="text-slate-200">{current.cta.text}</div>
              </div>
            </div>

            {/* Direct button: Send to Matrix */}
            <button
              onClick={() => onSendToMatrix(current)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs transition shadow-sm shadow-[#4f46e5]/20 cursor-pointer"
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
