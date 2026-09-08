import React, { useState } from 'react'
import { CarouselDeck, LeadMagnetResource } from '../types/content.types'
import { ChevronLeft, ChevronRight, Download, Copy, Check, Sparkles, BookOpen, Layers, FileDown, CheckCircle2 } from 'lucide-react'

interface AssetStudioProps {
  carousels: CarouselDeck[]
  leadMagnets: LeadMagnetResource[]
}

export const AssetStudio: React.FC<AssetStudioProps> = ({
  carousels,
  leadMagnets
}) => {
  const [activeDeckIndex, setActiveDeckIndex] = useState(0)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [activeLeadMagnetIndex, setActiveLeadMagnetIndex] = useState(0)
  const [copiedResource, setCopiedResource] = useState(false)

  const activeDeck = carousels[activeDeckIndex] || carousels[0]
  const currentSlide = activeDeck?.slides[currentSlideIndex] || activeDeck?.slides[0]
  const activeLM = leadMagnets[activeLeadMagnetIndex] || leadMagnets[0]

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) setCurrentSlideIndex(currentSlideIndex - 1)
  }

  const handleNextSlide = () => {
    if (activeDeck && currentSlideIndex < activeDeck.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  const handleCopyLeadMagnet = () => {
    navigator.clipboard.writeText(activeLM.contentMarkdown)
    setCopiedResource(true)
    setTimeout(() => setCopiedResource(false), 2000)
  }

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner (Purple/Indigo Theme) */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-[#4f46e5] border border-indigo-100">
              Skill 05 · Design & Assets
            </span>
            <span className="text-xs text-slate-400 font-medium">Carruseles & Recursos ManyChat</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Diseñador de Carruseles & Creador de Recursos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Genera carruseles visuales de alta retención para Instagram/LinkedIn y maquetador de Lead Magnets para entregar automáticamente por ManyChat al comentar una palabra clave.
          </p>
        </div>
      </div>

      {/* Grid: Carousel Previewer & Lead Magnet Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CAROUSEL STUDIO (Left 6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#4f46e5]" />
              Simulador de Carrusel (Instagram / LinkedIn)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Slide {currentSlideIndex + 1} de {activeDeck?.slides.length}
            </span>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 shadow-sm">
            {/* Visual Canvas */}
            <div className="w-full max-w-[340px] aspect-[4/5] bg-gradient-to-br from-slate-900 to-[#1e1b4b] text-white rounded-2xl p-6 flex flex-col justify-between relative shadow-xl overflow-hidden border border-slate-800">
              {/* Top bar on slide */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-wider uppercase text-indigo-300 font-bold">
                  QAWAY CONTENT SUITE
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentSlideIndex + 1} / {activeDeck?.slides.length}
                </span>
              </div>

              {/* Slide Content */}
              <div className="space-y-3 my-auto">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/10">
                  {currentSlide?.type}
                </span>

                <h4 className="text-lg font-black text-white leading-tight tracking-tight">
                  {currentSlide?.title}
                </h4>

                {currentSlide?.subtitle && (
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {currentSlide.subtitle}
                  </p>
                )}

                {currentSlide?.bullets && currentSlide.bullets.length > 0 && (
                  <ul className="space-y-2 pt-1">
                    {currentSlide.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                        <span className="text-[#4f46e5] font-bold">›</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Bottom footer on slide */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <span>{currentSlide?.footerNote || 'Desliza →'}</span>
                <span className="font-mono">@qawaylab</span>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-1.5">
                {activeDeck?.slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`w-2 h-2 rounded-full transition cursor-pointer ${
                      currentSlideIndex === i ? 'bg-[#4f46e5] w-5' : 'bg-slate-200 hover:bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextSlide}
                disabled={currentSlideIndex === (activeDeck?.slides.length || 1) - 1}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* LEAD MAGNET / FREE RESOURCES STUDIO (Right 6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#4f46e5]" />
              Recursos Gratuitos (Lead Magnets ManyChat)
            </h3>
            <button
              onClick={handleCopyLeadMagnet}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-[#4f46e5] text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              {copiedResource ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedResource ? 'Copiado' : 'Copiar Markdown'}</span>
            </button>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between min-h-[480px]">
            <div className="space-y-3">
              {/* Lead Magnet selector */}
              <div>
                <select
                  value={activeLeadMagnetIndex}
                  onChange={e => setActiveLeadMagnetIndex(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                >
                  {leadMagnets.map((lm, idx) => (
                    <option key={lm.id} value={idx}>
                      [{lm.triggerKeyword}] {lm.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Meta Tag: Trigger Keyword */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50 border border-indigo-100">
                <div>
                  <span className="text-[10px] text-[#4f46e5] uppercase font-bold block">
                    Palabra Clave para ManyChat:
                  </span>
                  <span className="text-sm font-mono font-extrabold text-[#4f46e5]">
                    "{activeLM.triggerKeyword}"
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-indigo-200 text-[#4f46e5]">
                  {activeLM.category}
                </span>
              </div>

              {/* Resource Content Preview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-h-[290px] overflow-y-auto text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-wrap">
                {activeLM.contentMarkdown}
              </div>
            </div>

            {/* Bottom info */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Formato: <strong className="text-slate-700">{activeLM.targetFormat}</strong></span>
              <span className="text-[#4f46e5] font-semibold">Listo para disparar en DMs de Instagram</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
