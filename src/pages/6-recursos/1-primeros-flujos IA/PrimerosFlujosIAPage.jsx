import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, ArrowLeft, Check, CheckCircle2, MessageCircle,
  FileText, ArrowRight, Share2, Sparkles, Workflow, Layers,
  Terminal, ShieldCheck, Cpu, UserCheck, RefreshCw, Eye, BookOpen,
  ArrowDown, X, Lock, Mail, User, Phone, Inbox, Send, Zap
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import { supabase } from '@/config/supabase'
import heroImage from './ChatGPT Image 1 sept 2026, 19_04_24.png'
import pdfFile from './Guia_Qaway Lab_Primeros_Flujos_IA.pdf'

const pipelineSteps = [
  {
    step: '01',
    name: 'Entrada',
    tag: 'Trigger Inicial',
    desc: 'Datos en bruto, correos, formularios o solicitudes de clientes.',
    icon: Inbox,
    iconBg: 'bg-amber-500/10 text-[#fe6612]',
    tags: ['Webhook', 'Typeform', 'Gmail']
  },
  {
    step: '02',
    name: 'Tarea',
    tag: 'Mapeo Lógico',
    desc: 'Descomposición en pasos atómicos, secuenciales y predecibles.',
    icon: Workflow,
    iconBg: 'bg-zinc-500/10 text-zinc-700',
    tags: ['Estructura', 'SOPs']
  },
  {
    step: '03',
    name: 'IA (Motor)',
    tag: 'Procesamiento',
    desc: 'Procesamiento semántico, síntesis y estructuración rápida.',
    icon: Sparkles,
    iconBg: 'bg-[#fe6612] text-white shadow-xs',
    isHeroStep: true,
    tags: ['Prompt CTR', 'LLM']
  },
  {
    step: '04',
    name: 'Revisión',
    tag: 'Control Calidad',
    desc: 'Validación de criterio humano, datos clave y tono de marca.',
    icon: ShieldCheck,
    iconBg: 'bg-emerald-500/10 text-emerald-600',
    tags: ['Criterio', 'Checklist']
  },
  {
    step: '05',
    name: 'Resultado',
    tag: 'Output Final',
    desc: 'Entrega final en CRM, Notion, WhatsApp o correo listo para usar.',
    icon: Send,
    iconBg: 'bg-sky-500/10 text-sky-600',
    tags: ['Notion', 'WhatsApp']
  },
]

const displayFont = {
  fontFamily: '"Arial Narrow", "Roboto Condensed", "Helvetica Neue Condensed", Impact, sans-serif',
  letterSpacing: '-0.03em',
}

export default function PrimerosFlujosIAPage() {
  useSetNavbarVariant('light')
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [leadName, setLeadName] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [isSubmittingLead, setIsSubmittingLead] = useState(false)
  const [leadError, setLeadError] = useState(null)

  // Comprobar estado de desbloqueo en localStorage
  useEffect(() => {
    const unlocked = localStorage.getItem('recurso_desbloqueado_primeros-flujos-ia') === 'true'
    if (unlocked) {
      setIsUnlocked(true)
    }
  }, [])

  const triggerPdfDownload = () => {
    setDownloading(true)
    const link = document.createElement('a')
    link.href = pdfFile || 'https://drive.google.com/uc?export=download&id=1gmFiKNyFNyoO6PpnqwZcV2Xlwx5JKMKq'
    link.setAttribute('download', 'Guia_Qaway_Lab_Primeros_Flujos_IA.pdf')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      setDownloading(false)
    }, 2000)
  }

  const handleDownloadClick = () => {
    if (isUnlocked) {
      triggerPdfDownload()
    } else {
      setShowModal(true)
    }
  }

  // Notificación vía Web3Forms
  const sendEmailNotification = async (subject, messageDetails) => {
    const primaryKey = import.meta.env.VITE_WEB3FORMS_MARKETING_KEY || ''
    const backupKey = import.meta.env.VITE_WEB3FORMS_BACKUP_KEY || ''
    
    const keysToSend = []
    if (primaryKey.trim()) keysToSend.push(primaryKey.trim())
    if (backupKey.trim()) keysToSend.push(backupKey.trim())

    if (keysToSend.length === 0) return

    try {
      await Promise.all(
        keysToSend.map(key =>
          fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              access_key: key,
              subject: subject,
              from_name: 'Qaway Lab Recursos',
              message: messageDetails
            })
          })
        )
      )
    } catch (err) {
      console.error('Error al enviar notificaciones Web3Forms:', err)
    }
  }

  const handleLeadSubmit = async (e) => {
    e.preventDefault()
    if (!leadName.trim() || !leadEmail.trim() || !leadPhone.trim()) return

    setIsSubmittingLead(true)
    setLeadError(null)

    try {
      // 1. Guardar registro en Supabase
      const { error } = await supabase
        .from('resource_downloads')
        .insert([
          {
            resource_id: 'primeros-flujos-ia',
            name: leadName.trim(),
            email: leadEmail.trim().toLowerCase(),
            phone: leadPhone.trim()
          }
        ])

      if (error) {
        console.warn('[Supabase log]', error.message)
      }

      // 2. Enviar correo de notificación
      const emailSubject = `Nuevo Lead: Descarga Guía Primeros Flujos IA`
      const emailBody = `Un usuario ha completado el formulario para descargar la guía en PDF.\n\n` +
        `Recurso: Cómo estructurar tus primeros flujos de trabajo con IA\n` +
        `Nombre: ${leadName}\n` +
        `Correo: ${leadEmail}\n` +
        `WhatsApp / Teléfono: ${leadPhone}\n` +
        `Fecha: ${new Date().toLocaleString()}\n`

      await sendEmailNotification(emailSubject, emailBody)

      // 3. Desbloquear y recordar en localStorage
      localStorage.setItem('recurso_desbloqueado_primeros-flujos-ia', 'true')
      setIsUnlocked(true)
      setShowModal(false)

      // 4. Iniciar descarga automática del PDF
      triggerPdfDownload()
    } catch (err) {
      console.error('Error en captura de lead:', err)
      setLeadError('Hubo un inconveniente al procesar la solicitud. Por favor intenta de nuevo.')
    } finally {
      setIsSubmittingLead(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Guía Práctica: Primeros Flujos IA | Qaway Lab',
        text: 'Cómo estructurar tus primeros flujos de trabajo con IA - Guía oficial de Qaway Lab.',
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  const waUrl = 'https://wa.me/51930756781?text=' + encodeURIComponent('Hola Qaway Lab, descargué la Guía de Primeros Flujos IA y me gustaría consultar sobre automatizaciones para mi negocio.')

  return (
    <div className="flex min-h-screen flex-col justify-between bg-white text-[#20201f] selection:bg-[#fe6612] selection:text-white">
      <div>
        {/* ========================================================================= */}
        {/* BARRA SUPERIOR DE NAVEGACIÓN & RETORNO                                   */}
        {/* ========================================================================= */}
        <div className="border-b border-[#20201f]/10 bg-white/90 backdrop-blur-md sticky top-0 z-30">
          <div className="mx-auto max-w-[1240px] px-6 py-3.5 flex items-center justify-between sm:px-10 lg:px-14">
            <Link
              to="/recursos"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#20201f]/70 hover:text-[#fe6612] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Volver a Recursos</span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#20201f]/15 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#20201f] shadow-xs hover:border-[#fe6612] hover:text-[#fe6612] transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
                <span>{copied ? 'Enlace copiado' : 'Compartir'}</span>
              </button>
              
              <button
                onClick={handleDownloadClick}
                disabled={downloading}
                className="hidden sm:inline-flex items-center gap-2 rounded-[10px] bg-[#fe6612] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-[0_10px_25px_rgba(254,102,18,0.22)] hover:bg-[#e05508] transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{downloading ? 'Descargando...' : 'Descargar PDF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HERO OFICIAL QAWAY LAB: SPLIT CON TIPOGRAFÍA NATIVA                      */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden bg-[#ffffff] px-6 pt-12 pb-16 sm:px-10 lg:px-14 lg:pt-16 lg:pb-24 border-b border-[#20201f]/10">
          <div className="mx-auto max-w-[1240px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Columna Izquierda: Información Principal */}
              <div className="lg:col-span-7">
                <div className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#ff4b0b]">
                  <span>/ Recursos · Guía Práctica</span>
                </div>

                <h1
                  className="text-3xl font-bold tracking-tight text-[#191918] sm:text-4xl lg:text-5xl"
                  style={displayFont}
                >
                  Cómo estructurar tus primeros flujos de trabajo con <span className="text-[#ff4b0b]">IA.</span>
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/70 sm:text-lg">
                  No necesitas aprender diez herramientas. Empieza por una tarea que quieras mejorar y divídela en pasos para saber exactamente dónde y cómo aplicar Inteligencia Artificial con criterio.
                </p>

                {/* Bullets institucionales con respiro calibrado */}
                <div className="mt-8 sm:mt-9 space-y-3.5 max-w-xl">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#fe6612]/15 text-[#fe6612]">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                    <p className="text-sm font-medium text-[#20201f]/80">
                      <strong>Metodología paso a paso:</strong> 10 páginas con arquitectura real de trabajo.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#fe6612]/15 text-[#fe6612]">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                    <p className="text-sm font-medium text-[#20201f]/80">
                      <strong>Enfoque de criterio:</strong> La IA ejecuta la tarea, tú mantienes la dirección.
                    </p>
                  </div>
                </div>

                {/* Acciones con respiro visual amplio */}
                <div className="mt-9 sm:mt-11 flex flex-wrap items-center gap-5 sm:gap-6">
                  <button
                    onClick={handleDownloadClick}
                    disabled={downloading}
                    className="inline-flex items-center gap-2.5 rounded-[10px] bg-[#fe6612] px-7 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[0_14px_36px_rgba(254,102,18,0.28)] hover:bg-[#e05508] transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>{downloading ? 'Descargando Guía...' : 'Descargar Guía Gratuita (PDF)'}</span>
                  </button>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[46px] items-center gap-2 border-b-2 border-[#fe6612] pb-1.5 pt-1 text-sm font-bold text-[#20201f] transition-colors hover:text-[#fe6612]"
                  >
                    <span>Consultar por WhatsApp</span>
                    <ArrowRight className="h-4 w-4 text-[#fe6612]" />
                  </a>
                </div>
              </div>

              {/* Columna Derecha: Imagen Flotante */}
              <div className="lg:col-span-5 flex justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full max-w-[475px] flex justify-center"
                >
                  <img
                    src={heroImage}
                    alt="Guía Qaway Lab - Cómo estructurar tus primeros flujos de trabajo con IA"
                    className="w-full h-auto rounded-[12px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-transform duration-500 hover:scale-[1.01]"
                  />
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PIPELINE VISUAL METODOLÓGICO: CICLO OPERATIVO DE 5 PASOS                  */}
        {/* ========================================================================= */}
        <section className="bg-white py-16 sm:py-20 px-6 sm:px-10 lg:px-14 border-b border-[#20201f]/10">
          <div className="mx-auto max-w-[1240px]">
            
            {/* Encabezado centrado */}
            <div className="mx-auto max-w-2xl text-center mb-12">
              <div className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#ff4b0b]">
                <span>/ Metodología de Flujo</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#191918]"
                style={displayFont}
              >
                El ciclo operativo de 5 pasos<span className="text-[#fe6612]">.</span>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-black/70 leading-relaxed max-w-xl mx-auto">
                La estructura lógica para transformar tareas manuales en procesos automatizados con criterio.
              </p>
            </div>

            {/* Grid del Ciclo Operativo con Hover Naranja de Marca (#fe6612) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-stretch">
              {pipelineSteps.map((item) => {
                const IconComponent = item.icon
                return (
                  <div
                    key={item.step}
                    className="group relative flex flex-col justify-between rounded-[10px] border border-black/10 bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:bg-[#fe6612] hover:border-[#fe6612] hover:shadow-[0_16px_36px_rgba(254,102,18,0.22)] cursor-default text-left"
                  >
                    <div>
                      {/* Contenedor del Icono */}
                      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#fe6612]/10 text-[#fe6612] transition-colors duration-300 group-hover:bg-white group-hover:text-[#fe6612]">
                        <IconComponent className="h-6 w-6 stroke-[2]" />
                      </div>

                      {/* Título del Paso */}
                      <h3
                        className="text-lg sm:text-xl font-bold text-[#191918] transition-colors duration-300 group-hover:text-white mb-2.5"
                        style={displayFont}
                      >
                        {item.step}. {item.name}
                      </h3>

                      {/* Descripción */}
                      <p className="text-xs sm:text-[13px] text-black/70 leading-relaxed transition-colors duration-300 group-hover:text-white/90">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* BLOQUE CTA INFERIOR INSTITUCIONAL                                        */}
        {/* ========================================================================= */}
        <section className="bg-[#f8f9fc] border-t border-[#20201f]/10 py-16 px-6 sm:px-10 lg:px-14">
          <div className="mx-auto max-w-[1240px]">
            <div className="rounded-[20px] border border-[#20201f]/12 bg-white p-8 sm:p-14 shadow-[0_20px_60px_rgba(32,32,31,0.06)] flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <span className="qw-section-kicker mb-2">
                  Acceso Gratuito
                </span>
                <h3 className="qw-section-title text-[#20201f]" style={{ fontSize: 'clamp(2rem, 3.2vw, 3rem)' }}>
                  Descarga la guía en PDF y empieza hoy mismo<span className="text-[#fe6612]">.</span>
                </h3>
                <p className="qw-section-copy mt-2">
                  Documento completo de 10 páginas con plantillas de trabajo y metodología lista para ejecutar en tu negocio.
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                <button
                  onClick={handleDownloadClick}
                  disabled={downloading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#fe6612] px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[0_14px_36px_rgba(254,102,18,0.28)] hover:bg-[#e05508] transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>{downloading ? 'Descargando...' : 'Descargar PDF (10 Páginas)'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ========================================================================= */}
      {/* MODAL OFICIAL DE CAPTURA DE LEADS (LEAD GATE)                            */}
      {/* ========================================================================= */}
      {/* LEAD CAPTURE MODAL (DISEÑO MINIMALISTA ESTILO HUBSPOT)                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showModal && !isUnlocked && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg rounded-[14px] bg-white p-8 sm:p-10 shadow-2xl border border-black/10 text-left"
            >
              {/* Botón Cerrar */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Cerrar ventana"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Cabecera limpia estilo HubSpot */}
              <div className="text-center mb-7 pr-3 pl-3">
                <h3 className="text-2xl sm:text-3xl font-bold text-[#191918] tracking-tight">
                  Descarga la guía en PDF
                </h3>
                <p className="mt-2 text-xs sm:text-[13px] text-[#516f90]">
                  Completa tus datos para recibir el acceso directo e inmediato.
                </p>
              </div>

              {/* Formulario minimalista */}
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <label htmlFor="modalLeadName" className="block text-xs font-semibold text-[#33475b] mb-1.5">
                    Nombre completo
                  </label>
                  <input
                    id="modalLeadName"
                    type="text"
                    required
                    placeholder="Ej. Carlos Mendoza"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    disabled={isSubmittingLead}
                    className="w-full rounded-[6px] border border-[#cbd6e2] bg-[#f4f7f9] px-3.5 py-2.5 text-sm text-[#191918] placeholder:text-zinc-400 focus:border-[#fe6612] focus:bg-white focus:ring-2 focus:ring-[#fe6612]/15 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="modalLeadEmail" className="block text-xs font-semibold text-[#33475b] mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    id="modalLeadEmail"
                    type="email"
                    required
                    placeholder="carlos@empresa.com"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    disabled={isSubmittingLead}
                    className="w-full rounded-[6px] border border-[#cbd6e2] bg-[#f4f7f9] px-3.5 py-2.5 text-sm text-[#191918] placeholder:text-zinc-400 focus:border-[#fe6612] focus:bg-white focus:ring-2 focus:ring-[#fe6612]/15 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="modalLeadPhone" className="block text-xs font-semibold text-[#33475b] mb-1.5">
                    Número de teléfono / WhatsApp
                  </label>
                  <input
                    id="modalLeadPhone"
                    type="tel"
                    required
                    placeholder="+51 987 654 321"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    disabled={isSubmittingLead}
                    className="w-full rounded-[6px] border border-[#cbd6e2] bg-[#f4f7f9] px-3.5 py-2.5 text-sm text-[#191918] placeholder:text-zinc-400 focus:border-[#fe6612] focus:bg-white focus:ring-2 focus:ring-[#fe6612]/15 focus:outline-none transition-all"
                  />
                </div>

                {leadError && (
                  <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-md border border-red-200">
                    {leadError}
                  </p>
                )}

                {/* Pie con botón estilo HubSpot */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-[#516f90] flex items-center gap-1.5 order-2 sm:order-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Tus datos están protegidos.
                  </span>

                  <button
                    type="submit"
                    disabled={isSubmittingLead}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#fe6612] py-2.5 px-6 text-sm font-bold text-white shadow-xs hover:bg-[#e05508] transition-all disabled:opacity-70 cursor-pointer order-1 sm:order-2"
                  >
                    {isSubmittingLead ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <span>Descargar ahora</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
