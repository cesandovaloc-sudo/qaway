/**
 * ========================================================
 * COMPONENTE: GENERADOR DE CONTENIDO ORGÁNICO (03B)
 * QAWAY CAMPAIGN CONSOLE
 * ========================================================
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Layers, 
  FileText, 
  Sliders, 
  MessageSquare, 
  Check, 
  Trash2, 
  Copy, 
  RefreshCw, 
  Image as ImageIcon,
  BookOpen,
  Calendar,
  PenTool,
  Clock
} from 'lucide-react'

export default function OrganicContentGenerator({
  selectedOpportunity,
  onGeneratePiece,
  approvedPieces,
  onApprovePiece,
  onDiscardPiece,
  isGenerating,
  onFinishModule
}) {
  const [format, setFormat] = useState('Post individual')
  const [style, setStyle] = useState('Profesional Editorial')
  const [generatedPiece, setGeneratedPiece] = useState(null)
  
  // Local state for live edits
  const [editedText, setEditedText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')

  const formats = [
    'Post individual',
    'Carrusel',
    'Reel',
    'Historia',
    'Video corto',
    'Hilo / comentarios'
  ]

  const styles = [
    'Profesional Editorial',
    'Creativo Natural',
    'Alto Impacto'
  ]

  const handleGenerate = async () => {
    if (!selectedOpportunity) {
      alert('Por favor selecciona primero una oportunidad estratégica en el Panel 03A.')
      return
    }
    const piece = await onGeneratePiece(format, style, selectedOpportunity)
    if (piece) {
      setGeneratedPiece(piece)
      setEditedText(JSON.stringify(piece.data, null, 2))
      setIsEditing(false)
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopyStatus('¡Texto copiado!')
    setTimeout(() => setCopyStatus(''), 2000)
  }

  const handleApprove = () => {
    if (!generatedPiece) return
    onApprovePiece({
      id: `piece-${Date.now()}`,
      oportunidadBase: selectedOpportunity.tituloOportunidad,
      formato: format,
      estilo: style,
      piezaGenerada: generatedPiece.data,
      estado: 'aprobado',
      fechaCreacion: new Date().toLocaleDateString()
    })
    setGeneratedPiece(null)
    alert('¡Pieza aprobada y guardada con éxito en la biblioteca de campaña!')
  }

  return (
    <div className="space-y-6">
      
      {/* Módulo 03B: Header */}
      <div className="bg-zinc-50/50 border border-zinc-200/80 p-5 rounded-[12px] space-y-1">
        <h3 className="text-zinc-900 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
          <PenTool className="w-4 h-4 text-[#FFD200]" />
          03B · Crear Contenido Orgánico Estratégico
        </h3>
        <p className="text-[11px] text-zinc-500 max-w-xl leading-relaxed">
          Diseña las piezas tácticas usando la oportunidad de contenido seleccionada. Ajusta el formato y estilo visual idóneo para conectar con tu audiencia.
        </p>
      </div>

      {/* Panel de Configuración y Generación */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Selector de Opciones (Left) */}
        <div className="lg:col-span-4 bg-white border border-zinc-200 p-5 rounded-[10px] space-y-5 h-fit shadow-xs">
          
          {/* Oportunidad Seleccionada */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-zinc-450 uppercase tracking-widest block">Oportunidad Activa</span>
            {selectedOpportunity ? (
              <div className="bg-[#f8fafc] border border-zinc-200/60 p-3.5 rounded-[8px] space-y-1">
                <span className="text-[9px] font-black text-zinc-400 block uppercase">Tema estratégico</span>
                <p className="text-xs text-zinc-800 font-extrabold leading-snug">{selectedOpportunity.tituloOportunidad}</p>
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-[8px] text-[11px] text-rose-800 font-medium">
                ⚠️ Ninguna oportunidad seleccionada. Por favor regresa a la pestaña 03A y selecciona una oportunidad para habilitar la generación.
              </div>
            )}
          </div>

          {/* Formatos */}
          <div className="space-y-2">
            <span className="text-[9px] font-black text-zinc-450 uppercase tracking-widest block">1. Seleccionar Formato</span>
            <div className="grid grid-cols-2 gap-1.5">
              {formats.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`text-[10px] font-bold py-2 px-3 rounded-[6px] text-left transition ${
                    format === f 
                      ? 'bg-zinc-900 text-white shadow-xs' 
                      : 'bg-[#f8fafc] border border-zinc-150 text-zinc-650 hover:bg-zinc-100/50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Estilos */}
          <div className="space-y-2">
            <span className="text-[9px] font-black text-zinc-450 uppercase tracking-widest block">2. Seleccionar Estilo Visual y Tono</span>
            <div className="space-y-1.5">
              {styles.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={`w-full text-xs font-black py-2.5 px-3.5 rounded-[8px] text-left transition flex items-center justify-between border ${
                    style === s 
                      ? 'bg-zinc-50 border-zinc-900 text-zinc-900 font-black' 
                      : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {s}
                  {style === s && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </button>
              ))}
            </div>
            
            <div className="bg-zinc-50 p-2.5 rounded-[6px] text-[10px] text-zinc-400 font-medium leading-relaxed mt-2 border border-zinc-150">
              {style === 'Profesional Editorial' && '💡 Premium, jerárquico, limpio. Ideal para posicionar autoridad de marca.'}
              {style === 'Creativo Natural' && '💡 Cercano, humano, cotidiano. Conecta a nivel personal sin fotos de stock falsas.'}
              {style === 'Alto Impacto' && '💡 Scroll stopper. Alto contraste, frases poderosas y tensión visual sin vulgaridades.'}
            </div>
          </div>

          {/* Botón de Generación */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedOpportunity}
            className="w-full bg-zinc-900 hover:bg-zinc-850 text-white font-extrabold py-3.5 rounded-[8px] flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-[11px] uppercase tracking-wider shadow-xs mt-3"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Generando Pieza Orgánica...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Generar Pieza Orgánica
              </>
            )}
          </button>
        </div>

        {/* Visualizador de Contenido Generado (Right) */}
        <div className="lg:col-span-8 space-y-5">
          <AnimatePresence mode="wait">
            {generatedPiece ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-zinc-200 rounded-[10px] p-5 space-y-4 shadow-xs"
              >
                
                {/* Header Preview */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h4 className="text-zinc-900 text-xs font-black uppercase tracking-wider">
                      Vista Previa: {format} ({style})
                    </h4>
                  </div>
                  
                  {copyStatus && (
                    <span className="text-[10px] text-emerald-600 font-extrabold animate-bounce">
                      {copyStatus}
                    </span>
                  )}
                </div>

                {/* Previews según Formato */}
                <div className="space-y-4 text-xs">
                  
                  {/* CASO: POST INDIVIDUAL */}
                  {generatedPiece.data.corePost && (
                    <div className="space-y-4">
                      {/* Ficha Estratégica */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-50 border border-zinc-150 p-3 rounded-[8px]">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Dolor Central</span>
                          <p className="text-zinc-800 font-semibold leading-relaxed">{generatedPiece.data.corePost.problema}</p>
                        </div>
                        <div className="bg-zinc-50 border border-zinc-150 p-3 rounded-[8px]">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Mensaje Fuerza</span>
                          <p className="text-zinc-800 font-semibold leading-relaxed">{generatedPiece.data.corePost.mensajeFuerza}</p>
                        </div>
                      </div>

                      {/* Mockup de Redes */}
                      <div className="border border-zinc-200 rounded-[8px] bg-zinc-50/50 overflow-hidden shadow-xs">
                        <div className="bg-white border-b border-zinc-150 p-3 flex items-center justify-between">
                          <span className="font-bold text-zinc-700 text-[10px]">Previsualización Social (LinkedIn / Instagram)</span>
                          <button 
                            onClick={() => handleCopy(generatedPiece.data.copy)}
                            className="text-zinc-400 hover:text-zinc-700 transition"
                            title="Copiar Copy"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="p-4 space-y-3 font-sans text-[11px] leading-relaxed text-zinc-700 select-all whitespace-pre-line bg-white">
                          {generatedPiece.data.copy}
                        </div>
                      </div>

                      {/* Prompt Visual y Concepto */}
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-[8px] space-y-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                          Concepto Gráfico e Indicación Visual
                        </span>
                        <p className="text-zinc-750 italic leading-relaxed font-semibold">
                          "{generatedPiece.data.versionVisual.concepto}"
                        </p>
                        <div className="bg-white border border-slate-200 p-2.5 rounded-[6px] font-mono text-[9px] text-slate-700 select-all">
                          <strong>Midjourney Prompt:</strong> {generatedPiece.data.versionVisual.promptImagen}
                        </div>
                      </div>

                      {/* Hilos Comentarios */}
                      {generatedPiece.data.hilosComentarios && generatedPiece.data.hilosComentarios.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-zinc-450 uppercase tracking-widest block flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                            Estrategia de Comentarios / Hilos de Continuidad
                          </span>
                          <div className="space-y-1.5">
                            {generatedPiece.data.hilosComentarios.map((cmt, ci) => (
                              <div key={ci} className="bg-white border border-zinc-150 p-3 rounded-[6px] font-sans flex gap-2">
                                <span className="text-[10px] font-black text-zinc-400">#{ci + 1}</span>
                                <p className="text-zinc-650 leading-relaxed font-medium flex-1">{cmt}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CASO: CARRUSEL */}
                  {generatedPiece.data.coreCarrusel && (
                    <div className="space-y-4">
                      {/* Portada, Desarrollo, Cierre Bento grids */}
                      <div className="bg-zinc-50 border border-zinc-150 p-3 rounded-[8px] grid grid-cols-3 gap-3">
                        <div>
                          <span className="text-[9px] font-black text-zinc-400 uppercase block mb-0.5">Problema central</span>
                          <p className="text-zinc-700 font-bold leading-relaxed">{generatedPiece.data.coreCarrusel.problema}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-zinc-400 uppercase block mb-0.5">Mensaje de fuerza</span>
                          <p className="text-zinc-700 font-bold leading-relaxed">{generatedPiece.data.coreCarrusel.mensajeFuerza}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-zinc-400 uppercase block mb-0.5">Llamado a la acción (CTA)</span>
                          <p className="text-zinc-700 font-bold leading-relaxed">{generatedPiece.data.coreCarrusel.cta}</p>
                        </div>
                      </div>

                      {/* Slides Reales */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-zinc-450 uppercase block">Estructura Secuencial de Slides</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {generatedPiece.data.estructuraSlides?.map((slide, si) => (
                            <div key={si} className="bg-zinc-900 text-white border border-zinc-800 rounded-[8px] p-4 flex flex-col justify-between h-44 shadow-xs relative">
                              <span className="absolute top-3 right-3 text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-[4px] font-mono">
                                Slide {slide.slide}
                              </span>
                              <div className="space-y-1 mt-1">
                                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                                  {slide.objetivo}
                                </span>
                                <h5 className="text-[12px] font-black leading-tight tracking-tight mt-1 text-[#FFD200]">
                                  {slide.textoPrincipal}
                                </h5>
                                <p className="text-[10px] text-zinc-350 leading-relaxed font-semibold mt-1">
                                  {slide.textoSecundario}
                                </p>
                              </div>
                              <div className="bg-zinc-850 p-2 rounded-[4px] text-[8px] text-zinc-400 italic">
                                <strong>Visual:</strong> {slide.indicacionVisual}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Prompt Visual General */}
                      <div className="bg-indigo-50/50 border border-indigo-150 p-3.5 rounded-[8px] space-y-1">
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block">Estilo Visual y Composición General del Carrusel</span>
                        <p className="text-zinc-750 font-medium italic">"{generatedPiece.data.promptVisualGeneral}"</p>
                      </div>

                      {/* Caption */}
                      <div className="border border-zinc-200 rounded-[8px] bg-white overflow-hidden shadow-xs">
                        <div className="bg-zinc-55 border-b border-zinc-150 p-3.5 flex items-center justify-between">
                          <span className="font-bold text-zinc-700 text-[10px]">Caption del Carrusel</span>
                          <button 
                            onClick={() => handleCopy(generatedPiece.data.copyCaption)}
                            className="text-zinc-400 hover:text-zinc-700 transition"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-3.5 font-sans leading-relaxed text-zinc-700 select-all whitespace-pre-line text-[11px] max-h-40 overflow-y-auto bg-[#f8fafc]/30">
                          {generatedPiece.data.copyCaption}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CASO: REEL */}
                  {generatedPiece.data.coreReel && (
                    <div className="space-y-4">
                      {/* Timeline del Guion */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-zinc-450 uppercase block">Cronograma Secuencial del Guion</span>
                        <div className="space-y-2.5">
                          {[
                            { step: 'Gancho (0-3s)', content: generatedPiece.data.guion.hookInicial, color: 'border-l-rose-500 bg-rose-50/20' },
                            { step: 'Problema (3-15s)', content: generatedPiece.data.guion.escena1, color: 'border-l-amber-500 bg-amber-50/10' },
                            { step: 'Solución (15-30s)', content: generatedPiece.data.guion.escena2, color: 'border-l-indigo-500 bg-indigo-50/10' },
                            { step: 'Contraste (30-45s)', content: generatedPiece.data.guion.escena3, color: 'border-l-blue-500 bg-blue-50/10' },
                            { step: 'Cierre / CTA (45-60s)', content: generatedPiece.data.guion.cierre, color: 'border-l-emerald-500 bg-emerald-50/20' }
                          ].map((sc, sci) => (
                            <div key={sci} className={`border-l-4 p-3 rounded-[6px] ${sc.color} flex flex-col md:flex-row md:items-center justify-between gap-3`}>
                              <div className="space-y-0.5 md:max-w-xl">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-450">{sc.step}</span>
                                <p className="text-zinc-750 font-bold leading-relaxed">{sc.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Textos en Pantalla */}
                      <div className="bg-zinc-900 border border-zinc-800 rounded-[8px] p-4 space-y-2 text-white">
                        <span className="text-[9px] font-black text-zinc-450 uppercase tracking-widest block">Textos Overlay en Pantalla (Subtítulos rápidos)</span>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {generatedPiece.data.textoEnPantalla?.map((t, ti) => (
                            <span key={ti} className="bg-zinc-800 text-[#FFD200] px-3 py-1.5 rounded-[6px] font-mono text-[9px] font-bold shadow-xs border border-zinc-700">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Indicaciones visuales */}
                      <div className="bg-[#f8fafc] border border-zinc-200 p-3.5 rounded-[8px]">
                        <span className="text-[9px] font-black text-zinc-450 uppercase tracking-widest block mb-0.5">Indicaciones de Grabación y Audio</span>
                        <p className="text-zinc-650 leading-relaxed font-semibold italic">"{generatedPiece.data.indicacionesVisuales}"</p>
                      </div>

                      {/* Caption */}
                      <div className="border border-zinc-200 rounded-[8px] bg-white overflow-hidden shadow-xs">
                        <div className="bg-zinc-55 border-b border-zinc-150 p-3.5 flex items-center justify-between">
                          <span className="font-bold text-zinc-700 text-[10px]">Caption del Video</span>
                          <button 
                            onClick={() => handleCopy(generatedPiece.data.caption)}
                            className="text-zinc-400 hover:text-zinc-700 transition"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-3.5 font-sans leading-relaxed text-zinc-700 select-all whitespace-pre-line text-[11px] bg-[#f8fafc]/30">
                          {generatedPiece.data.caption}
                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* Acciones de Aprobación */}
                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-150">
                  <button
                    onClick={handleGenerate}
                    className="bg-white border border-zinc-250 hover:border-zinc-350 text-zinc-800 text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-[8px] flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
                    Regenerar Pieza
                  </button>
                  
                  <button
                    onClick={handleApprove}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-black uppercase tracking-wider px-5 py-2.5 rounded-[8px] flex items-center gap-1.5 transition shadow-xs active:scale-[0.98]"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Aprobar y Guardar Pieza
                  </button>
                </div>

              </motion.div>
            ) : (
              <div className="bg-zinc-50/50 border border-dashed border-zinc-200 rounded-[10px] py-24 text-center space-y-2">
                <Sliders className="w-7 h-7 text-zinc-300 mx-auto" />
                <p className="text-zinc-450 text-xs font-semibold">
                  Selecciona la oportunidad activa en el panel izquierdo y haz clic en "Generar Pieza Orgánica".
                </p>
                <p className="text-[10px] text-zinc-400">
                  Las piezas se adaptarán al estilo seleccionado y a tu público objetivo sin sonar a venta directa.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Biblioteca de Piezas Aprobadas (Campaign Library) */}
      <div className="bg-white border border-zinc-200 p-5 rounded-[10px] space-y-4 shadow-xs">
        <h4 className="text-zinc-850 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b border-zinc-100 pb-2.5">
          <BookOpen className="w-4 h-4 text-zinc-500" />
          Biblioteca de Contenido Orgánico Aprobado ({approvedPieces.length})
        </h4>

        {approvedPieces.length === 0 ? (
          <div className="text-center py-6 text-zinc-400 text-xs font-medium italic">
            Ninguna pieza aprobada todavía para esta campaña. Las piezas que apruebes se guardarán aquí automáticamente.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-black text-[9px] uppercase tracking-wider">
                  <th className="pb-2">Fecha</th>
                  <th className="pb-2">Oportunidad Base</th>
                  <th className="pb-2">Formato</th>
                  <th className="pb-2">Estilo</th>
                  <th className="pb-2">Estado</th>
                  <th className="pb-2 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                {approvedPieces.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 text-[10px] text-zinc-450 block flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {p.fechaCreacion}
                    </td>
                    <td className="py-3 font-bold text-zinc-800 max-w-[200px] truncate" title={p.oportunidadBase}>
                      {p.oportunidadBase}
                    </td>
                    <td className="py-3 font-mono text-[10px] text-zinc-600 uppercase tracking-widest">{p.formato}</td>
                    <td className="py-3 font-bold text-zinc-650">{p.estilo}</td>
                    <td className="py-3">
                      <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded-[4px]">
                        {p.estado}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onDiscardPiece(p.id)}
                        className="text-rose-600 hover:text-rose-800 p-1.5 hover:bg-rose-50 rounded-[4px] transition"
                        title="Eliminar de biblioteca"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Acciones del Módulo */}
      <div className="flex justify-end pt-3 border-t border-zinc-150 mt-5">
        <button
          onClick={onFinishModule}
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold px-6 py-3.5 rounded-[10px] flex items-center gap-2 transition shadow-xs active:scale-[0.98] text-xs uppercase"
        >
          Aprobar contenido orgánico y pasar a Embudo de Atracción
          <Check className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

    </div>
  )
}
