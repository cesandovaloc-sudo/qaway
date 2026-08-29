import React, { useState } from 'react'
import { X, Sparkles, Mail, Sliders, Palette, Download, ShieldCheck } from 'lucide-react'
import type { LeadFormData, LeadFormType } from '../../types'

interface LeadFormModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (data: LeadFormData) => void
  initialData?: LeadFormData
}

export default function LeadFormModal({ isOpen, onClose, onInsert, initialData }: LeadFormModalProps) {
  const [type, setType] = useState<LeadFormType>(initialData?.type || 'inline')
  const [title, setTitle] = useState(initialData?.title || 'Descarga la Guía Completa de Automatización')
  const [description, setDescription] = useState(
    initialData?.description || 'Ingresa tus datos y recibe gratis la plantilla lista para importar en tu sistema.'
  )
  const [buttonText, setButtonText] = useState(initialData?.buttonText || 'Obtener Guía Gratis →')
  const [successMessage, setSuccessMessage] = useState(
    initialData?.successMessage || '¡Listo! Te hemos enviado el acceso a tu correo.'
  )
  const [downloadUrl, setDownloadUrl] = useState(initialData?.downloadUrl || 'https://qawaylab.com/recursos/guia.pdf')
  const [themeColor, setThemeColor] = useState(initialData?.themeColor || '#ff4b0b')
  const [textColor, setTextColor] = useState(initialData?.textColor || '#ffffff')
  const [fields, setFields] = useState({
    name: initialData?.fields?.name ?? true,
    email: true,
    phone: initialData?.fields?.phone ?? false,
    company: initialData?.fields?.company ?? false,
  })
  const [triggerScrollPercent, setTriggerScrollPercent] = useState(initialData?.triggerScrollPercent || 50)
  const [activeTab, setActiveTab] = useState<'content' | 'fields' | 'thankyou' | 'design'>('content')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onInsert({
      type,
      title: title.trim() || 'Suscríbete a nuestro boletín',
      description: description.trim(),
      buttonText: buttonText.trim() || 'Enviar',
      successMessage: successMessage.trim(),
      downloadUrl: downloadUrl.trim(),
      themeColor,
      textColor,
      fields,
      triggerScrollPercent,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-line rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
          <h3 className="font-display font-bold text-base text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Configurar Formulario de Captación de Leads (HubSpot Video 5)
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de configuración */}
        <div className="flex bg-surface-muted p-1 rounded-xl border border-line mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'content' ? 'bg-white text-primary shadow-xs font-bold' : 'text-muted hover:text-primary'
            }`}
          >
            1. Formato & Llamada
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fields')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'fields' ? 'bg-white text-primary shadow-xs font-bold' : 'text-muted hover:text-primary'
            }`}
          >
            2. Campos del Lead
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('thankyou')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'thankyou' ? 'bg-white text-primary shadow-xs font-bold' : 'text-muted hover:text-primary'
            }`}
          >
            3. Página de Gracias
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('design')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'design' ? 'bg-white text-accent shadow-xs font-bold' : 'text-muted hover:text-primary'
            }`}
          >
            4. Colores & Disparo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Pestaña 1: Formato y Textos */}
          {activeTab === 'content' && (
            <div className="space-y-3.5">
              <div>
                <label className="font-bold text-muted uppercase tracking-wider block mb-1.5">
                  Tipo de Formulario Emergente:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'inline', name: 'Embebido', desc: 'Dentro del post' },
                    { id: 'popup', name: 'Pop-up Modal', desc: 'Al centro' },
                    { id: 'slide-in', name: 'Deslizante', desc: 'Inferior derecho' },
                    { id: 'top-banner', name: 'Top Banner', desc: 'Barra superior' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setType(item.id as LeadFormType)}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                        type === item.id
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-line bg-surface-muted text-muted hover:text-primary'
                      }`}
                    >
                      <span className="block text-xs">{item.name}</span>
                      <span className="block text-[10px] font-normal text-muted-light">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-muted block mb-1">Título de la Oferta / Llamada:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej: Descarga la Guía Completa de IA para tu Negocio"
                  className="w-full bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs font-bold text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="font-bold text-muted block mb-1">Descripción / Propuesta de Valor:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ej: Aprende el paso a paso para reducir 5 horas semanales de trabajo manual..."
                  className="w-full bg-surface-muted border border-line rounded-lg p-2.5 text-xs text-muted leading-relaxed focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div>
                <label className="font-bold text-muted block mb-1">Texto del Botón de Envío:</label>
                <input
                  type="text"
                  required
                  value={buttonText}
                  onChange={e => setButtonText(e.target.value)}
                  placeholder="Ej: Obtener Plantilla Gratis →"
                  className="w-full bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          )}

          {/* Pestaña 2: Campos del Lead */}
          {activeTab === 'fields' && (
            <div className="space-y-3 p-3.5 bg-surface-muted rounded-xl border border-line">
              <span className="font-bold text-primary block text-xs">Campos a solicitar al visitante:</span>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-line opacity-90">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-accent" />
                    <div>
                      <span className="font-bold text-xs text-primary block">Correo Electrónico</span>
                      <span className="text-[10px] text-muted block">Requerido por defecto por HubSpot</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-accent/15 text-accent px-2 py-0.5 rounded">Obligatorio</span>
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-line cursor-pointer hover:border-primary/40 transition-colors">
                  <div>
                    <span className="font-bold text-xs text-primary block">Nombre Completo</span>
                    <span className="text-[10px] text-muted block">Para personalizar emails de seguimiento</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={fields.name}
                    onChange={e => setFields(f => ({ ...f, name: e.target.checked }))}
                    className="w-4 h-4 rounded text-accent cursor-pointer accent-accent"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-line cursor-pointer hover:border-primary/40 transition-colors">
                  <div>
                    <span className="font-bold text-xs text-primary block">Teléfono / WhatsApp</span>
                    <span className="text-[10px] text-muted block">Ideal para contacto directo comercial</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={fields.phone}
                    onChange={e => setFields(f => ({ ...f, phone: e.target.checked }))}
                    className="w-4 h-4 rounded text-accent cursor-pointer accent-accent"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-line cursor-pointer hover:border-primary/40 transition-colors">
                  <div>
                    <span className="font-bold text-xs text-primary block">Empresa / Negocio</span>
                    <span className="text-[10px] text-muted block">Para prospección B2B</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={fields.company}
                    onChange={e => setFields(f => ({ ...f, company: e.target.checked }))}
                    className="w-4 h-4 rounded text-accent cursor-pointer accent-accent"
                  />
                </label>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-muted-light pt-2 border-t border-line/60">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                <span>Cumple con RGPD y aviso de privacidad de datos.</span>
              </div>
            </div>
          )}

          {/* Pestaña 3: Página de Gracias */}
          {activeTab === 'thankyou' && (
            <div className="space-y-3.5">
              <div>
                <label className="font-bold text-muted block mb-1">Mensaje de Éxito / Agradecimiento:</label>
                <textarea
                  rows={2}
                  value={successMessage}
                  onChange={e => setSuccessMessage(e.target.value)}
                  placeholder="¡Gracias por registrarte! Revisa tu bandeja de entrada..."
                  className="w-full bg-surface-muted border border-line rounded-lg p-2.5 text-xs text-primary focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div>
                <label className="font-bold text-muted block mb-1">Enlace de Descarga Inmediata (Opcional):</label>
                <div className="flex items-center bg-surface-muted border border-line rounded-lg px-2.5 py-1.5 text-xs">
                  <Download className="w-3.5 h-3.5 text-accent mr-1.5 shrink-0" />
                  <input
                    type="text"
                    value={downloadUrl}
                    onChange={e => setDownloadUrl(e.target.value)}
                    placeholder="https://tudominio.com/descarga.pdf"
                    className="w-full bg-transparent focus:outline-none font-mono text-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Pestaña 4: Colores y Reglas de Disparo */}
          {activeTab === 'design' && (
            <div className="space-y-4">
              <div className="p-3 bg-surface-subtle border border-line rounded-xl space-y-3">
                <span className="font-bold text-primary block text-xs flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-accent" /> Personalización Libre de Colores:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-muted block mb-1">Color del Tema / Botón:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeColor}
                        onChange={e => setThemeColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={themeColor}
                        onChange={e => setThemeColor(e.target.value)}
                        className="w-24 bg-white border border-line rounded px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted block mb-1">Color de Texto del Botón:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={e => setTextColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-line cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={e => setTextColor(e.target.value)}
                        className="w-24 bg-white border border-line rounded px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {type !== 'inline' && (
                <div className="p-3 bg-surface-muted border border-line rounded-xl space-y-2">
                  <span className="font-bold text-primary block text-xs flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-accent" /> Regla de Disparo Automático (Targeting):
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted font-medium">Mostrar al desplazarse hasta el:</span>
                    <span className="font-bold font-mono text-accent bg-accent/10 px-2 py-0.5 rounded">
                      {triggerScrollPercent}% del post
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={triggerScrollPercent}
                    onChange={e => setTriggerScrollPercent(parseInt(e.target.value, 10))}
                    className="w-full accent-accent cursor-pointer"
                  />
                  <p className="text-[10px] text-muted-light">
                    HubSpot recomienda activar formularios deslizantes al llegar al 50% de lectura del contenido.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Vista previa en vivo */}
          <div className="p-4 bg-[#fafafc] rounded-xl border border-line space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
              Vista previa interactiva del formulario:
            </span>

            <div className="p-4 bg-white rounded-xl border border-line shadow-xs space-y-3 text-left">
              <div>
                <h4 className="font-display font-bold text-sm text-primary">{title || 'Título del Formulario'}</h4>
                <p className="text-[11px] text-muted mt-0.5 leading-relaxed">{description || 'Descripción...'}</p>
              </div>

              <div className="space-y-1.5">
                {fields.name && (
                  <input
                    type="text"
                    disabled
                    placeholder="Tu nombre completo"
                    className="w-full bg-surface-muted border border-line rounded-lg px-2.5 py-1.5 text-[11px] text-muted cursor-not-allowed"
                  />
                )}
                <input
                  type="email"
                  disabled
                  placeholder="tu.correo@empresa.com"
                  className="w-full bg-surface-muted border border-line rounded-lg px-2.5 py-1.5 text-[11px] text-muted cursor-not-allowed"
                />
                {fields.phone && (
                  <input
                    type="tel"
                    disabled
                    placeholder="+51 999 999 999"
                    className="w-full bg-surface-muted border border-line rounded-lg px-2.5 py-1.5 text-[11px] text-muted cursor-not-allowed"
                  />
                )}
                {fields.company && (
                  <input
                    type="text"
                    disabled
                    placeholder="Nombre de tu empresa"
                    className="w-full bg-surface-muted border border-line rounded-lg px-2.5 py-1.5 text-[11px] text-muted cursor-not-allowed"
                  />
                )}
              </div>

              <button
                type="button"
                className="w-full py-2 px-4 rounded-xl text-xs font-bold transition-transform shadow-xs"
                style={{ backgroundColor: themeColor, color: textColor }}
              >
                {buttonText || 'Enviar Formulario'}
              </button>
            </div>
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
              Insertar Formulario de Leads
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
