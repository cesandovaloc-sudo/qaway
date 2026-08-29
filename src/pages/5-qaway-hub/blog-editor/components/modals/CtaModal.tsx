import React, { useState } from 'react'
import { X, Sparkles, Send, Palette, Link as LinkIcon, Layers } from 'lucide-react'

export type CtaType = 'card' | 'passive' | 'button'

export interface CtaData {
  type?: CtaType
  title: string
  description?: string
  buttonText: string
  buttonUrl: string
  cardBgColor?: string
  cardTextColor?: string
  buttonBgColor?: string
  buttonTextColor?: string
  passiveText?: string
}

interface CtaModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (data: CtaData) => void
  initialData?: CtaData
}

export default function CtaModal({ isOpen, onClose, onInsert, initialData }: CtaModalProps) {
  const [ctaType, setCtaType] = useState<CtaType>(initialData?.type || 'card')
  const [title, setTitle] = useState(initialData?.title || '¿Listo para escalar tus resultados?')
  const [description, setDescription] = useState(
    initialData?.description || 'Automatiza tus tareas y centraliza tus procesos con nuestras soluciones a medida.'
  )
  const [buttonText, setButtonText] = useState(initialData?.buttonText || 'Hablar con un Asesor')
  const [buttonUrl, setButtonUrl] = useState(initialData?.buttonUrl || 'https://wa.me/51999999999')
  const [cardBgColor, setCardBgColor] = useState(initialData?.cardBgColor || '#18181b')
  const [cardTextColor, setCardTextColor] = useState(initialData?.cardTextColor || '#ffffff')
  const [buttonBgColor, setButtonBgColor] = useState(initialData?.buttonBgColor || '#ff4b0b')
  const [buttonTextColor, setButtonTextColor] = useState(initialData?.buttonTextColor || '#ffffff')
  const [passiveText, setPassiveText] = useState(
    initialData?.passiveText || 'Guía gratuita: Cómo estructurar tus primeros flujos de trabajo'
  )

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (buttonUrl.trim()) {
      onInsert({
        type: ctaType,
        title: title.trim(),
        description: description.trim(),
        buttonText: buttonText.trim() || 'Ver Más',
        buttonUrl: buttonUrl.trim(),
        cardBgColor,
        cardTextColor,
        buttonBgColor,
        buttonTextColor,
        passiveText: passiveText.trim(),
      })
      onClose()
    }
  }

  const isLightCard = cardBgColor.toLowerCase() === '#ffffff' || cardBgColor.toLowerCase() === '#fafafc'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-line rounded-2xl shadow-2xl max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
          <h3 className="font-display font-bold text-base text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Configurar Llamado a la Acción (CTA)
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Selector de Formato de CTA */}
          <div>
            <label className="font-bold text-muted uppercase tracking-wider block mb-1.5">
              Tipo de Llamado a la Acción:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCtaType('passive')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  ctaType === 'passive'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-line bg-surface-muted text-muted hover:text-primary'
                }`}
              >
                <LinkIcon className="w-4 h-4 mx-auto mb-1" />
                <span>1. CTA Pasivo</span>
                <span className="block text-[10px] font-normal text-muted-light">Para párrafos</span>
              </button>

              <button
                type="button"
                onClick={() => setCtaType('button')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  ctaType === 'button'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-line bg-surface-muted text-muted hover:text-primary'
                }`}
              >
                <Send className="w-4 h-4 mx-auto mb-1" />
                <span>2. Botón Destacado</span>
                <span className="block text-[10px] font-normal text-muted-light">Entre secciones</span>
              </button>

              <button
                type="button"
                onClick={() => setCtaType('card')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  ctaType === 'card'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-line bg-surface-muted text-muted hover:text-primary'
                }`}
              >
                <Layers className="w-4 h-4 mx-auto mb-1" />
                <span>3. Tarjeta Hero</span>
                <span className="block text-[10px] font-normal text-muted-light">Cierre de artículo</span>
              </button>
            </div>
          </div>

          {/* Formulario según tipo */}
          {ctaType === 'passive' ? (
            <div className="space-y-3 p-3 bg-surface-muted rounded-xl border border-line">
              <div>
                <label className="font-bold text-muted block mb-1">Texto del Recurso Enlazado:</label>
                <input
                  type="text"
                  required
                  value={passiveText}
                  onChange={e => setPassiveText(e.target.value)}
                  placeholder="Ej: Descarga la plantilla gratuita de flujos..."
                  className="w-full bg-white border border-line rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {ctaType === 'card' && (
                <>
                  <div>
                    <label className="font-bold text-muted block mb-1">Título del CTA:</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Ej: ¿Listo para automatizar tus ventas?"
                      className="w-full bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs font-bold text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-muted block mb-1">Descripción / Propuesta de Valor:</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Ej: Aumenta un 40% tu productividad hoy mismo..."
                      className="w-full bg-surface-muted border border-line rounded-lg p-2.5 text-xs text-muted leading-relaxed focus:outline-none focus:border-accent resize-none"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Botón y Enlace */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-muted block mb-1">Texto del Botón:</label>
              <input
                type="text"
                required
                value={buttonText}
                onChange={e => setButtonText(e.target.value)}
                placeholder="Ej: Hablar con Asesor →"
                className="w-full bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="font-bold text-muted block mb-1">Enlace de Destino (URL o WhatsApp):</label>
              <input
                type="text"
                required
                value={buttonUrl}
                onChange={e => setButtonUrl(e.target.value)}
                placeholder="https://wa.me/... o /contacto"
                className="w-full bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* SELECTORES DE COLOR 100% PERSONALIZABLES */}
          <div className="p-3.5 bg-surface-subtle border border-line rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-primary text-xs">
              <Palette className="w-3.5 h-3.5 text-accent" />
              <span>Personalización de Colores:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ctaType === 'card' && (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-muted block mb-1">Fondo de Tarjeta:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={cardBgColor}
                        onChange={e => setCardBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={cardBgColor}
                        onChange={e => setCardBgColor(e.target.value)}
                        className="w-20 bg-white border border-line rounded px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted block mb-1">Texto de Tarjeta:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={cardTextColor}
                        onChange={e => setCardTextColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={cardTextColor}
                        onChange={e => setCardTextColor(e.target.value)}
                        className="w-20 bg-white border border-line rounded px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-bold text-muted block mb-1">
                  {ctaType === 'passive' ? 'Color de Enlace:' : 'Fondo del Botón:'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={buttonBgColor}
                    onChange={e => setButtonBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={buttonBgColor}
                    onChange={e => setButtonBgColor(e.target.value)}
                    className="w-20 bg-white border border-line rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>

              {ctaType !== 'passive' && (
                <div>
                  <label className="text-[11px] font-bold text-muted block mb-1">Texto del Botón:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={buttonTextColor}
                      onChange={e => setButtonTextColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={buttonTextColor}
                      onChange={e => setButtonTextColor(e.target.value)}
                      className="w-20 bg-white border border-line rounded px-2 py-1 text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vista previa en vivo del CTA */}
          <div className="pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1 block">
              Vista previa en tiempo real:
            </span>

            {ctaType === 'passive' ? (
              <div className="py-2 px-1 text-left">
                <p className="font-bold text-xs sm:text-sm m-0 hover:underline cursor-pointer" style={{ color: buttonBgColor }}>
                  &lt;&lt; {passiveText || 'Nombre del recurso'} [{buttonText || 'Descargar'}] &gt;&gt;
                </p>
              </div>
            ) : ctaType === 'button' ? (
              <div className="p-4 bg-[#fafafc] rounded-xl border border-line text-center sm:text-left">
                <span
                  className="inline-flex items-center gap-2 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
                  style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
                >
                  <span>{buttonText || 'Botón de Acción'}</span>
                  <span>→</span>
                </span>
              </div>
            ) : (
              <div
                className={`p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md ${
                  isLightCard ? 'border border-line shadow-sm' : 'border border-line/20'
                }`}
                style={{ backgroundColor: cardBgColor, color: cardTextColor }}
              >
                <div>
                  <h4 className="font-display font-bold text-sm tracking-tight" style={{ color: cardTextColor }}>
                    {title || 'Título CTA'}
                  </h4>
                  <p className="text-[11px] line-clamp-1 mt-0.5 opacity-90" style={{ color: cardTextColor }}>
                    {description || 'Descripción...'}
                  </p>
                </div>
                <span
                  className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-xs flex items-center gap-1.5 shrink-0"
                  style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
                >
                  <Send className="w-3 h-3" /> {buttonText || 'Botón'}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted hover:text-primary rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-accent hover:bg-accent-dark text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Insertar en el Editor
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
