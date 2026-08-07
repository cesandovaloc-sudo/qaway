// Brief Branding Page (moved to 10-briefs)
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SectionTitle, Button } from '@/components/ui'
import {
  ChevronLeft, ChevronRight, Send, CheckCircle,
  Building2, Users, Palette, ArrowRight,
} from 'lucide-react'
import { submitBrief } from '@/services/brief'

const STEPS = [
  { id: 'contacto', label: 'Contacto', icon: Building2 },
  { id: 'organizacion', label: 'Organización', icon: Users },
  { id: 'branding', label: 'Branding', icon: Palette },
]

const PERSONALIDAD_OPTIONS = [
  'Alta Calidad', 'Práctico', 'Amigable',
  'Tecnológico', 'Atrevido', 'Dominante',
]

const INITIAL = {
  representante: '', empresa: '', rubro: '', ruc: '',
  ciudad: '', direccion: '', telefonoEmpresa: '', emailEmpresa: '',
  web: '', redes: '', contactoNombre: '', contactoCargo: '',
  contactoTelefono: '', origenNombre: '', motivacion: '',
  anioInicio: '', productosServicios: '', factorDiferencial: '',
  competidores: '', personalidad: [], personalidadDescripcion: '',
  coloresPreferidos: '', coloresRazon: '', coloresNoGustan: '', coloresNoRazon: '',
}

export default function BriefBrandingPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function set(field) {
    return (e) => setForm(p => ({ ...p, [field]: e.target.value }))
  }

  function togglePersonalidad(value) {
    setForm(p => ({
      ...p,
      personalidad: p.personalidad.includes(value)
        ? p.personalidad.filter(v => v !== value)
        : [...p.personalidad, value],
    }))
  }

  async function handleSubmit() {
    setSending(true)
    setError('')
    try {
      await submitBrief(form)
      setSent(true)
    } catch (e) {
      setError(e?.message || 'Error al enviar. Intenta de nuevo.')
    } finally {
      setSending(false)
    }
  }

  const canProceed = () => {
    if (step === 0) return form.representante && form.empresa && form.rubro && form.ciudad && form.direccion && form.telefonoEmpresa
    if (step === 1) return form.contactoNombre && form.contactoCargo && form.contactoTelefono && form.origenNombre && form.motivacion
    return true
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-qaway-accent/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-qaway-accent-dark" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">¡Brief recibido!</h2>
          <p className="text-gray-500 mb-8">
            Gracias por compartir la información de tu marca. Nos pondremos en contacto contigo pronto.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-qaway-accent-dark hover:text-qaway-accent font-medium transition-colors"
          >
            Volver al inicio <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <SectionTitle
          light
          badge="Brief de Marca"
          title="Cuéntanos sobre tu proyecto"
          description="Este formulario nos ayuda a entender tu marca, tu visión y tus necesidades para construir una identidad sólida."
        />

        <div className="flex items-center justify-center gap-2 mb-12">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider ${
                i === step
                  ? 'bg-qaway-accent text-gray-900'
                  : i < step
                    ? 'bg-qaway-accent/20 text-qaway-accent-dark'
                    : 'bg-gray-100 text-gray-400'
              }`}
                >
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? 'bg-qaway-accent/50' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xs border border-gray-100 p-8 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {step === 0 && (
                <>
                  <SectionTitle light size="sm" title="Datos de contacto" description="Información formal de tu empresa." />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nombre del Representante Legal *" value={form.representante} onChange={set('representante')} className="md:col-span-2" />
                    <Field label="Nombre de Empresa *" value={form.empresa} onChange={set('empresa')} />
                    <Field label="Rubro de Negocio *" value={form.rubro} onChange={set('rubro')} placeholder="Restaurante, farmacia, consultorio dental, etc." />
                    <Field label="RUC" value={form.ruc} onChange={set('ruc')} optional />
                    <Field label="Ciudad / País *" value={form.ciudad} onChange={set('ciudad')} placeholder="Indica si cuentas con sucursales" />
                    <Field label="Dirección de la empresa *" value={form.direccion} onChange={set('direccion')} />
                    <Field label="Teléfono de la empresa *" value={form.telefonoEmpresa} onChange={set('telefonoEmpresa')} type="tel" />
                    <Field label="Email de Empresa" value={form.emailEmpresa} onChange={set('emailEmpresa')} type="email" optional />
                    <Field label="Link de Página Web" value={form.web} onChange={set('web')} optional />
                    <Field label="Link de Facebook / Instagram" value={form.redes} onChange={set('redes')} optional className="md:col-span-2" />
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <SectionTitle light size="sm" title="Datos de la organización" description="Cuéntanos cómo imaginas tu proyecto." />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nombre de la persona de contacto *" value={form.contactoNombre} onChange={set('contactoNombre')} />
                    <Field label="Cargo de la persona de contacto *" value={form.contactoCargo} onChange={set('contactoCargo')} />
                    <Field label="Teléfono de la persona de contacto *" value={form.contactoTelefono} onChange={set('contactoTelefono')} type="tel" />
                    <FieldArea label="Origen del nombre de marca *" value={form.origenNombre} onChange={set('origenNombre')} placeholder="¿Qué te inspiró a darle nombre a tu marca?" />
                    <FieldArea label="¿Qué te motivó a empezar tu empresa? *" value={form.motivacion} onChange={set('motivacion')} />
                    <Field label="¿Desde qué año se puso en marcha?" value={form.anioInicio} onChange={set('anioInicio')} placeholder="Si aún es idea, ¿para cuándo proyectas inaugurarlo?" optional className="md:col-span-2" />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <SectionTitle light size="sm" title="Branding" description="Cómo proyectas tu marca." />
                  <FieldArea label="¿Qué productos o servicios ofreces?" value={form.productosServicios} onChange={set('productosServicios')} optional />
                  <FieldArea label="¿Por qué un cliente debería elegir tu empresa?" value={form.factorDiferencial} onChange={set('factorDiferencial')} optional />
                  <FieldArea label="¿Quiénes son tus principales competidores?" value={form.competidores} onChange={set('competidores')} optional />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      ¿Qué personalidad consideras que tiene o tendrá tu marca?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PERSONALIDAD_OPTIONS.map(opt => {
                        const active = form.personalidad.includes(opt)
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => togglePersonalidad(opt)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all ${
                              active
                                ? 'bg-qaway-accent text-gray-900 border-qaway-accent shadow-xs'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <FieldArea label="Describe esa personalidad como si fuera una persona" value={form.personalidadDescripcion} onChange={set('personalidadDescripcion')} placeholder="¿Qué ropa viste? ¿Qué música le gusta? ¿Cómo se comporta?" optional />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="¿Color(es) preferido(s)?" value={form.coloresPreferidos} onChange={set('coloresPreferidos')} optional />
                    <Field label="Razón" value={form.coloresRazon} onChange={set('coloresRazon')} optional />
                    <Field label="¿Color(es) que no te gustan?" value={form.coloresNoGustan} onChange={set('coloresNoGustan')} optional />
                    <Field label="Razón" value={form.coloresNoRazon} onChange={set('coloresNoRazon')} optional />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="mt-4 text-red-500 text-sm text-center">{error}</p>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <div>
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
              )}
            </div>
            <div>
              {step < STEPS.length - 1 ? (
                <button
                  disabled={!canProceed()}
                  onClick={() => setStep(s => s + 1)}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all ${
                    canProceed()
                      ? 'bg-qaway-accent text-gray-900 hover:bg-qaway-accent-light shadow-xs'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  disabled={sending}
                  onClick={handleSubmit}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all ${
                    sending
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-qaway-accent text-gray-900 hover:bg-qaway-accent-light shadow-xs'
                  }`}
                >
                  {sending ? 'Enviando...' : 'Enviar Brief'} <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', optional, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {optional && <span className="text-gray-400 font-normal">(opcional)</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-qaway-accent focus:ring-2 focus:ring-qaway-accent/20 transition-all"
      />
    </div>
  )
}

function FieldArea({ label, value, onChange, placeholder, optional, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {optional && <span className="text-gray-400 font-normal">(opcional)</span>}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-qaway-accent focus:ring-2 focus:ring-qaway-accent/20 transition-all resize-y"
      />
    </div>
  )
}
