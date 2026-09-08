import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FileText, ChevronDown, ChevronRight, Check, Sparkles, Copy,
  Download, Cloud, CheckCircle, Sliders, Hash, Info, Layers
} from 'lucide-react'

export default function NotionInteractiveWorkspaceForm() {
  const [openSections, setOpenSections] = useState({
    general: true,
    identity: true,
    channels: true,
    budget: true,
  })

  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'Servicios Profesionales / B2B',
    mission: '',
    brandTone: ['Sofisticado', 'Tecnológico'],
    colors: '#ff4b0b, #0f172a, #ffffff',
    channels: ['Sitio Web Corporativo', 'WhatsApp CRM'],
    budgetUsd: 2500,
    launchWeeks: 4,
    notes: '',
  })

  const [savedStatus, setSavedStatus] = useState('Guardado en la nube')
  const [copied, setCopied] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const toggleSection = (sectionKey) => {
    setOpenSections((p) => ({ ...p, [sectionKey]: !p[sectionKey] }))
  }

  const handleFieldChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }))
    setSavedStatus('Guardando cambios...')
    setTimeout(() => setSavedStatus('Guardado en la nube ✓'), 600)
  }

  const handleToggleBrandTone = (tone) => {
    const current = formData.brandTone
    const updated = current.includes(tone)
      ? current.filter((t) => t !== tone)
      : [...current, tone]
    handleFieldChange('brandTone', updated)
  }

  const handleToggleChannel = (chan) => {
    const current = formData.channels
    const updated = current.includes(chan)
      ? current.filter((c) => c !== chan)
      : [...current, chan]
    handleFieldChange('channels', updated)
  }

  const handleCopyMarkdown = () => {
    const md = `# BRIEF ESTRATÉGICO NOTION OS
**Empresa:** ${formData.companyName || 'Sin definir'}
**Industria:** ${formData.industry}
**Propósito:** ${formData.mission || 'Sin definir'}
**Tono de Marca:** ${formData.brandTone.join(', ')}
**Canales:** ${formData.channels.join(', ')}
**Presupuesto Estimado:** $${formData.budgetUsd} USD
**Tiempo de Entrega:** ${formData.launchWeeks} semanas
`
    navigator.clipboard.writeText(md)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3] text-slate-800 font-sans selection:bg-amber-200 selection:text-slate-900 flex flex-col justify-between">
      {/* Header Bar */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-lg font-black tracking-tight text-slate-950">QAWAY</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              NOTION OS
            </span>
          </Link>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Documento de Brief Vivo e Interactivo
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <Cloud className="w-3 h-3" />
            <span>{savedStatus}</span>
          </div>
          <Link
            to="/formularios"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white transition-colors"
          >
            ← Ver los 6 Modelos
          </Link>
        </div>
      </header>

      {/* Notion Document Canvas */}
      <main className="flex-1 max-w-4xl w-full mx-auto my-6 sm:my-10 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        {/* Document Cover Banner */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-slate-900 via-indigo-950 to-[#ff4b0b]/80 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        </div>

        {/* Page Body */}
        <div className="px-6 sm:px-14 pb-14 -mt-10 relative z-10 space-y-8">
          {/* Notion Page Icon & Title Header */}
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-3xl">
              ⚡
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Brief de Estrategia, Branding & Sistemas
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Documento de trabajo interactivo. Completa los bloques desplegables para estructurar la visión de tu proyecto.
              </p>
            </div>
          </div>

          {/* Callout Box */}
          <div className="p-4 rounded-2xl bg-[#f7f6f3] border border-slate-200 flex items-start gap-3">
            <div className="text-lg">💡</div>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong>Tip de llenado:</strong> Cada bloque se guarda automáticamente. Puedes contraer o expandir secciones según el avance de tu equipo.
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* SECTION 1: DATOS GENERALES */}
          {/* ------------------------------------------------------------- */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('general')}
              className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {openSections.general ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                <span className="text-sm font-extrabold text-slate-900">
                  1. Datos Generales & Propuesta de Valor
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {formData.companyName ? formData.companyName : 'Pendiente'}
              </span>
            </button>

            <AnimatePresence>
              {openSections.general && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-5 space-y-4 bg-white border-t border-slate-100"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nombre de la Empresa o Marca</label>
                      <input
                        type="text"
                        placeholder="Ej. Estudio Jurídico Morales / Clínica Dental Nova"
                        value={formData.companyName}
                        onChange={(e) => handleFieldChange('companyName', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-slate-800"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Sector o Rubro Principal</label>
                      <select
                        value={formData.industry}
                        onChange={(e) => handleFieldChange('industry', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-slate-800 bg-white"
                      >
                        <option>Servicios Profesionales / B2B</option>
                        <option>Salud / Medicina / Skincare</option>
                        <option>Inmobiliaria / Arquitectura</option>
                        <option>Gastronomía / Retail</option>
                        <option>Tecnología / SaaS</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">¿Qué problema resuelven y para quién?</label>
                    <textarea
                      rows={2}
                      placeholder="Describe brevemente la transformación que entregas a tus clientes..."
                      value={formData.mission}
                      onChange={(e) => handleFieldChange('mission', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-slate-800 resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* SECTION 2: PERSONALIDAD & IDENTIDAD DE MARCA */}
          {/* ------------------------------------------------------------- */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('identity')}
              className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {openSections.identity ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                <span className="text-sm font-extrabold text-slate-900">
                  2. Personalidad de Marca & Estilo Visual
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {formData.brandTone.length} adjetivos
              </span>
            </button>

            <AnimatePresence>
              {openSections.identity && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-5 space-y-4 bg-white border-t border-slate-100"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">
                      Tono de comunicación que mejor representa a tu marca:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Sofisticado & Exclusivo', 'Tecnológico & Moderno', 'Cálido & Cercano', 'Directo & Minimalista', 'Audaz & Vanguardista', 'Institucional & Seguro'].map((tone) => {
                        const isSelected = formData.brandTone.includes(tone)
                        return (
                          <button
                            key={tone}
                            type="button"
                            onClick={() => handleToggleBrandTone(tone)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                            <span>{tone}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-slate-700">Paleta o colores de preferencia (opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej. Azul marino, blanco cálido y detalles en cobre"
                      value={formData.colors}
                      onChange={(e) => handleFieldChange('colors', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* SECTION 3: CANALES & SISTEMAS */}
          {/* ------------------------------------------------------------- */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('channels')}
              className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {openSections.channels ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                <span className="text-sm font-extrabold text-slate-900">
                  3. Canales & Sistemas Digitales a Implementar
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {formData.channels.length} canales
              </span>
            </button>

            <AnimatePresence>
              {openSections.channels && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-5 space-y-3 bg-white border-t border-slate-100"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      'Sitio Web Corporativo',
                      'Landing Page de Conversión',
                      'WhatsApp CRM & Chatbots',
                      'Automatización de Correos',
                      'Pasarela de Pagos Online',
                      'Agente IA de Atención',
                    ].map((chan) => {
                      const isChecked = formData.channels.includes(chan)
                      return (
                        <div
                          key={chan}
                          onClick={() => handleToggleChannel(chan)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-orange-50/50 border-[#ff4b0b] text-slate-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs">{chan}</span>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked ? 'bg-[#ff4b0b] border-[#ff4b0b] text-white' : 'border-slate-300'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* SECTION 4: INVERSIÓN Y TIEMPOS (SLIDERS) */}
          {/* ------------------------------------------------------------- */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('budget')}
              className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {openSections.budget ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                <span className="text-sm font-extrabold text-slate-900">
                  4. Presupuesto Estimado & Ventana de Lanzamiento
                </span>
              </div>
              <span className="text-xs font-bold text-[#ff4b0b]">
                ${formData.budgetUsd} USD • {formData.launchWeeks} sem.
              </span>
            </button>

            <AnimatePresence>
              {openSections.budget && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-5 space-y-6 bg-white border-t border-slate-100"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Rango de Inversión Previsto</span>
                      <span className="font-extrabold text-sm text-[#ff4b0b] font-mono">
                        ${formData.budgetUsd.toLocaleString()} USD
                      </span>
                    </div>
                    <input
                      type="range"
                      min={800}
                      max={8000}
                      step={200}
                      value={formData.budgetUsd}
                      onChange={(e) => handleFieldChange('budgetUsd', Number(e.target.value))}
                      className="w-full accent-[#ff4b0b] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>$800 USD (Esencial)</span>
                      <span>$4,000 USD (Integral)</span>
                      <span>$8,000+ USD (A Medida)</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Plazo Deseado de Salida a Producción</span>
                      <span className="font-extrabold text-sm text-slate-900 font-mono">
                        {formData.launchWeeks} Semanas
                      </span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={12}
                      step={1}
                      value={formData.launchWeeks}
                      onChange={(e) => handleFieldChange('launchWeeks', Number(e.target.value))}
                      className="w-full accent-slate-900 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>2 semanas (Rápido)</span>
                      <span>6 semanas (Estándar)</span>
                      <span>12 semanas (Complejo)</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Markdown Copiado!' : 'Copiar Documento (.md)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-[#ff4b0b] text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enviar Documento a Qaway Lab</span>
            </button>
          </div>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5"
            >
              <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-950">
                ¡Brief de Notion sincronizado exitosamente!
              </h4>
              <p className="text-xs text-emerald-700">
                Tu documento ha sido registrado en nuestro sistema central para la fase de propuesta técnica.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white px-6 py-3 text-center text-xs text-slate-400">
        Qaway Lab Studio OS • Documentos Vivos y Especificaciones de Producto
      </footer>
    </div>
  )
}
