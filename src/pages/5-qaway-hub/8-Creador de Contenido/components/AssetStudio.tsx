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
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[#191918]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Skill 05 · Design & Lead Magnet Studio
              </span>
              <span className="text-xs text-white/50">Carruseles & Recursos Gratuitos</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Diseñador de Carruseles & Creador de Recursos
            </h2>
            <p className="text-sm text-white/60 mt-1 max-w-2xl">
              Genera carruseles visuales de alta retención para Instagram/LinkedIn y maquetador de Lead Magnets para entregar automáticamente por ManyChat al comentar una palabra clave.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Left (Carousel Live Previewer) & Right (Lead Magnet Viewer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CAROUSEL STUDIO (Left 6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#fe6612]" />
              Simulador de Carrusel (Instagram / LinkedIn)
            </h3>
            <span className="text-xs text-white/40">
              Slide {currentSlideIndex + 1} de {activeDeck?.slides.length}
            </span>
          </div>

          {/* Interactive Phone / Card Container */}
          <div className="bg-[#191918] border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center space-y-4 shadow-2xl">
            {/* Visual Canvas (Aspect 4:5 or 1:1) */}
            <div className="w-full max-w-[360px] aspect-[4/5] bg-gradient-to-br from-[#121212] to-[#1f1f1e] border-2 border-white/10 rounded-2xl p-6 flex flex-col justify-between relative shadow-inner overflow-hidden">
              {/* Top bar on slide */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#fe6612] font-semibold">
                  QAWAY CONTENT SUITE
                </span>
                <span className="text-[10px] font-mono text-white/40">
                  {currentSlideIndex + 1} / {activeDeck?.slides.length}
                </span>
              </div>

              {/* Slide Content */}
              <div className="space-y-3 my-auto">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-white/80">
                  {currentSlide?.type}
                </span>

                <h4 className="text-xl font-bold text-white leading-tight tracking-tight">
                  {currentSlide?.title}
                </h4>

                {currentSlide?.subtitle && (
                  <p className="text-xs text-white/70 leading-relaxed font-medium">
                    {currentSlide.subtitle}
                  </p>
                )}

                {currentSlide?.bullets && currentSlide.bullets.length > 0 && (
                  <ul className="space-y-2 pt-2">
                    {currentSlide.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-white/80">
                        <span className="text-[#fe6612] font-bold">›</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Bottom footer on slide */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
                <span>{currentSlide?.footerNote || 'Desliza →'}</span>
                <span className="font-mono">@qawaylab</span>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-1.5">
                {activeDeck?.slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`w-2 h-2 rounded-full transition cursor-pointer ${
                      currentSlideIndex === i ? 'bg-[#fe6612] w-5' : 'bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextSlide}
                disabled={currentSlideIndex === (activeDeck?.slides.length || 1) - 1}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* LEAD MAGNET / FREE RESOURCES STUDIO (Right 6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Recursos Gratuitos (Lead Magnets ManyChat)
            </h3>
            <button
              onClick={handleCopyLeadMagnet}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition cursor-pointer"
            >
              {copiedResource ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedResource ? 'Copiado' : 'Copiar Markdown'}</span>
            </button>
          </div>

          <div className="bg-[#191918] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl flex flex-col justify-between min-h-[480px]">
            <div className="space-y-3">
              {/* Lead Magnet selector */}
              <div className="flex items-center gap-2">
                <select
                  value={activeLeadMagnetIndex}
                  onChange={e => setActiveLeadMagnetIndex(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-[#fe6612]"
                >
                  {leadMagnets.map((lm, idx) => (
                    <option key={lm.id} value={idx} className="bg-[#1e1e1d]">
                      [{lm.triggerKeyword}] {lm.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Meta Tag: Trigger Keyword */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div>
                  <span className="text-[10px] text-emerald-300 uppercase font-bold block">
                    Palabra Clave para ManyChat:
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    "{activeLM.triggerKeyword}"
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/20 text-emerald-300">
                  {activeLM.category}
                </span>
              </div>

              {/* Resource Content Preview */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/5 max-h-[290px] overflow-y-auto text-xs text-white/80 font-mono leading-relaxed space-y-2 whitespace-pre-wrap">
                {activeLM.contentMarkdown}
              </div>
            </div>

            {/* Bottom info */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between text-xs text-white/60">
              <span>Formato: {activeLM.targetFormat}</span>
              <span className="text-emerald-400">Listo para ManyChat DMs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
