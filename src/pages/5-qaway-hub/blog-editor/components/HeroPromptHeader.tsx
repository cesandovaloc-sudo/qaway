import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Search } from 'lucide-react'

interface HeroPromptHeaderProps {
  searchQuery?: string
  onSearchChange: (query: string) => void
}

export default function HeroPromptHeader({
  onSearchChange,
}: HeroPromptHeaderProps) {
  const navigate = useNavigate()
  const [promptInput, setPromptInput] = useState('')

  const quickIdeas = [
    { label: 'Estrategias de IA en tu negocio', category: 'I. Artificial' },
    { label: 'Automatizar WhatsApp para ventas', category: 'Automatización' },
    { label: 'Productividad sin fricción para equipos', category: 'Productividad' },
    { label: 'Diseño UX de alta conversión', category: 'Diseño' },
    { label: 'Embudos de Marketing digital', category: 'Marketing' },
  ]

  const handleStartWithPrompt = (title: string, category: string = 'General') => {
    if (!title.trim()) {
      navigate('/editor')
      return
    }
    // Navegar al editor pasando el título sugerido en state o query
    const params = new URLSearchParams()
    params.set('title', title)
    params.set('category', category)
    navigate(`/editor?${params.toString()}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (promptInput.trim()) {
      handleStartWithPrompt(promptInput)
    }
  }

  return (
    <div className="relative pt-12 pb-14 sm:pt-16 sm:pb-16 text-center px-4 overflow-hidden">
      {/* Resplandor ambiental de fondo (Ambient Glow suave de Qaway) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-accent/10 via-[#fff2eb]/60 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. Isotipo / Logo Superior */}
      <div className="inline-flex items-center justify-center mb-6">
        <div className="w-11 h-11 rounded-2xl bg-[#111111] text-white flex items-center justify-center shadow-lg shadow-black/10 border border-black/5">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
      </div>

      {/* 2. Titular Principal en Tipografía Condensed Qaway */}
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-primary leading-[1.05] mb-2">
          Comparte tu idea.
        </h1>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight bg-gradient-to-r from-accent via-accent-dark to-[#111111] bg-clip-text text-transparent leading-[1.1]">
          Qaway Blog se encarga de darle impacto.
        </h2>
      </div>

      {/* 3. Barra Flotante de Acción / Creación Rápida */}
      <div className="max-w-2xl mx-auto mb-4">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center bg-white rounded-full p-2 border border-line shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:border-accent/40 focus-within:border-accent transition-all group"
        >
          <div className="pl-4 pr-2 text-muted-light">
            <Search className="w-5 h-5 group-focus-within:text-accent transition-colors" />
          </div>

          <input
            type="text"
            value={promptInput}
            onChange={e => {
              setPromptInput(e.target.value)
              onSearchChange(e.target.value)
            }}
            placeholder="¿De qué quieres escribir hoy? Ej: WhatsApp para ventas..."
            className="flex-1 bg-transparent py-2.5 px-2 text-sm sm:text-base text-primary placeholder:text-muted-light focus:outline-none font-sans"
          />

          <button
            type="submit"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-accent hover:bg-accent-dark text-white flex items-center justify-center transition-all shadow-md shadow-accent/30 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            title="Crear artículo con esta idea"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Subtítulo Descriptivo */}
      <p className="text-xs sm:text-sm text-muted-light max-w-lg mx-auto mb-6">
        Redacta con fotos, formato enriquecido y publica en el blog en menos de un minuto.
      </p>

      {/* 4. Píldoras de Sugerencias Rápidas */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
        {quickIdeas.map((idea, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleStartWithPrompt(idea.label, idea.category)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-line hover:border-accent/60 text-xs font-semibold text-primary/80 hover:text-accent shadow-xs hover:shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <span>{idea.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
