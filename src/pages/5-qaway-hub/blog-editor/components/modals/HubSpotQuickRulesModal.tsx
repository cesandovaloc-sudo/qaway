import React from 'react'
import { X, BookOpen, Target, Link2, Type } from 'lucide-react'

interface HubSpotQuickRulesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HubSpotQuickRulesModal({
  isOpen,
  onClose,
}: HubSpotQuickRulesModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-line rounded-2xl shadow-2xl max-w-xl w-full p-6 relative max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
          <h3 className="font-display font-bold text-base text-primary flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            Checklist Rápido: 11 Normas HubSpot
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Títulos & URLs */}
          <div className="p-3.5 rounded-xl bg-accent/5 border border-accent/20 space-y-1.5">
            <h4 className="font-bold text-accent text-xs flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Título & URL
            </h4>
            <ul className="space-y-1 pl-4 list-disc text-muted">
              <li><strong>Título ≤ 60 caracteres</strong> para que no se corte en Google.</li>
              <li>Usa corchetes <code>[Guía 2026]</code> para aumentar el CTR un +38%.</li>
              <li><strong>URL sin números</strong> (evita redirecciones 301 al actualizar listas).</li>
            </ul>
          </div>

          {/* Introducción & Ganchos */}
          <div className="p-3.5 rounded-xl bg-[#fafafc] border border-line space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-primary text-xs flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-accent" /> Introducción: Los 4 Ganchos de Apertura
              </h4>
              <span className="text-[10px] font-bold text-accent">Primeras 2-3 frases</span>
            </div>
            <ul className="space-y-1 pl-4 list-disc text-muted">
              <li><strong>Empatía con su dolor:</strong> Conecta con una frustración real.</li>
              <li><strong>Estadística impactante:</strong> Inicia con un dato o número revelador.</li>
              <li><strong>Humor o anécdota:</strong> Situación cotidiana que genere cercanía.</li>
              <li><strong>Pregunta retadora:</strong> Desafía una creencia común.</li>
              <li><em>💡 Secreto HubSpot:</em> Si te bloqueas, <strong>redacta el cuerpo primero y la intro al final</strong>.</li>
            </ul>
          </div>

          {/* Normas de Redacción */}
          <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1.5">
            <h4 className="font-bold text-primary text-xs flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-accent" /> Redacción y Ritmo
            </h4>
            <ul className="space-y-1 pl-4 list-disc text-muted">
              <li><strong>Tutea al lector:</strong> Usa "tú" (más empático y cercano).</li>
              <li><strong>Voz activa:</strong> <em>"El equipo automatizó el flujo"</em>.</li>
              <li><strong>Párrafos cortos:</strong> Máximo 2 a 3 líneas (crear espacio en blanco).</li>
              <li><strong>Negritas selectivas:</strong> Solo 1 oración destacada cada 2-3 párrafos.</li>
              <li><strong>Elimina palabras vacías:</strong> Evita "muy", "realmente", "totalmente".</li>
            </ul>
          </div>

          {/* Enlaces y CTAs */}
          <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1.5">
            <h4 className="font-bold text-primary text-xs flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-accent" /> Enlaces & Conversión
            </h4>
            <ul className="space-y-1 pl-4 list-disc text-muted">
              <li>Coloca un <strong>CTA de texto pasivo</strong> en los primeros párrafos.</li>
              <li>Enlaces externos siempre en pestaña nueva (<code>target="_blank"</code>).</li>
              <li>Cierra con un <strong>CTA visual</strong> hacia WhatsApp o formulario.</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-line mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#24262e] hover:bg-[#2f323c] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
