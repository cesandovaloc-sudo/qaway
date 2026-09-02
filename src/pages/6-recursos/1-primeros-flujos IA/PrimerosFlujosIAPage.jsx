import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Download, ArrowLeft, Check, CheckCircle2, MessageCircle,
  FileText, ArrowRight, Share2, Sparkles, BookOpen, Layers
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import heroImage from './ChatGPT Image 1 sept 2026, 19_04_24.png'
import pdfFile from './Guia_Qaway Lab_Primeros_Flujos_IA.pdf'

const displayFont = {
  fontFamily: "'Oswald', sans-serif",
  fontStretch: 'condensed',
}

const steps = [
  {
    number: '01',
    title: 'Empieza por una tarea concreta',
    subtitle: 'Criterio de selección',
    description: 'Elige una actividad que se repita constantemente, consuma tiempo valioso de tu equipo y pueda dividirse con claridad.',
    takeaway: 'Se repite · Quita tiempo · Es divisible'
  },
  {
    number: '02',
    title: 'Desarma la tarea en pasos visibles',
    subtitle: 'El flujo metodológico',
    description: 'Estructura el proceso lineal: Recibir información, Organizar los datos, Procesar con IA, Revisar críticamente y Aplicar el resultado final.',
    takeaway: 'Entrada ➔ Tarea ➔ IA ➔ Revisión ➔ Resultado'
  },
  {
    number: '03',
    title: 'Decide el rol: La IA ejecuta, tú decides',
    subtitle: 'Criterio sobre velocidad',
    description: 'La Inteligencia Artificial aporta velocidad y capacidad de procesamiento; tú aportas el contexto, la intención y el control de calidad.',
    takeaway: 'Velocidad de máquina + Criterio humano'
  },
  {
    number: '04',
    title: 'Estructura de instrucción CTR',
    subtitle: 'Prompts sin ambigüedad',
    description: 'Construye instrucciones operativas claras definiendo siempre: Contexto del negocio, Tarea puntual requerida y Formato exacto de salida.',
    takeaway: 'Contexto + Tarea + Formato de salida'
  },
  {
    number: '05',
    title: 'Revisión crítica antes de usar',
    subtitle: 'Control de calidad',
    description: 'Valida exactitud de datos, tono de voz de marca y coherencia lógica antes de incorporar el resultado a tu operación diaria.',
    takeaway: 'Verificación de datos · Tono · Coherencia'
  },
  {
    number: '06',
    title: 'Documenta, repite y escala',
    subtitle: 'Estandarización',
    description: 'Convierte la prueba exitosa en un procedimiento operativo estándar (SOP) reutilizable y delegable dentro de tu organización.',
    takeaway: 'Prueba validada ➔ Proceso documentado'
  }
]

const bullets = [
  'Metodología paso a paso en 10 páginas prácticas',
  'Plantilla de trabajo editable incluida para tu equipo',
  'Enfoque de criterio operativo y productividad real'
]

export default function PrimerosFlujosIAPage() {
  useSetNavbarVariant('light')
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleDownload = () => {
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
    <div className="flex min-h-screen flex-col justify-between bg-white selection:bg-[#ff4b0b] selection:text-white">
      <div>
        {/* ========================================================================= */}
        {/* HERO WORDPRESS STYLE: DEGRADADO SUAVE (IDÉNTICO AL BLOG DE QAWAY LAB)     */}
        {/* ========================================================================= */}
        <section className="relative z-20 overflow-hidden border-b border-black/5 bg-gradient-to-b from-white via-[#ffe6d8] to-[#ffd0b5] pb-12 pt-20 sm:pb-16 sm:pt-28">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-9">
            
            {/* Top Navigation & Breadcrumbs */}
            <div className="mb-8 flex items-center justify-between">
              <Link
                to="/recursos"
                className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#ff4b0b] hover:text-[#191918] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>/ Recursos · Guía Práctica</span>
              </Link>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#191918] shadow-xs backdrop-blur-xs hover:border-[#ff4b0b]/40 hover:text-[#ff4b0b] transition-all"
                title="Compartir recurso"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copiado' : 'Compartir'}</span>
              </button>
            </div>

            {/* Split Grid 50/50 Hero */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Columna Izquierda: Copy, Badges & CTAs */}
              <div className="lg:col-span-7">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#191918] shadow-xs">
                    Guía Práctica Oficial
                  </span>
                  <span className="rounded-full border border-white/20 bg-gradient-to-r from-[#ea580c] to-[#c2410c] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
                    Descarga Gratuita
                  </span>
                  <span className="font-mono text-xs text-zinc-600 ml-1">
                    10 Páginas · Formato PDF
                  </span>
                </div>

                <motion.h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#191918] leading-[1.1] mb-5"
                  style={displayFont}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Cómo estructurar tus primeros flujos de trabajo con <span className="text-[#ff4b0b]">IA.</span>
                </motion.h1>

                <motion.p
                  className="text-base sm:text-lg leading-relaxed text-black/75 max-w-2xl mb-6"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  No necesitas aprender diez herramientas. Empieza por una tarea que quieras mejorar y divídela en pasos para saber exactamente dónde y cómo aplicar Inteligencia Artificial con criterio.
                </motion.p>

                {/* Bullets de valor */}
                <motion.ul
                  className="space-y-2.5 mb-8"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  {bullets.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-sm font-medium text-[#191918]/85">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff4b0b]/15 text-[#ff4b0b]">
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </motion.ul>

                {/* Botones de Acción */}
                <motion.div
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-gradient-to-r from-[#ff703d] via-[#ff5a22] to-[#ff4b0b] px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-md shadow-[#ff4b0b]/25 transition-all hover:opacity-95 active:scale-[0.98]"
                  >
                    <Download className="h-5 w-5" />
                    <span>{downloading ? 'Descargando Guía...' : 'Descargar Guía Gratuita (PDF)'}</span>
                  </button>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-white/90 px-5 py-3.5 text-sm sm:text-base font-semibold text-[#191918] shadow-xs backdrop-blur-xs hover:border-[#ff4b0b]/40 hover:text-[#ff4b0b] transition-all"
                  >
                    <MessageCircle className="h-4 w-4 text-[#25D366]" />
                    <span>Consultar por WhatsApp</span>
                  </a>
                </motion.div>
              </div>

              {/* Columna Derecha: Mockup / Cover Visual */}
              <div className="lg:col-span-5 flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative group w-full max-w-[420px]"
                >
                  <div className="relative overflow-hidden rounded-[14px] border border-black/10 bg-white p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-400 group-hover:border-black/25 group-hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)]">
                    <img
                      src={heroImage}
                      alt="Guía Qaway Lab - Cómo estructurar tus primeros flujos de trabajo con IA"
                      className="w-full h-auto rounded-[10px] object-cover"
                    />
                    
                    {/* Badge sobre la portada */}
                    <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-lg bg-[#191918]/90 px-3.5 py-2 text-white backdrop-blur-md">
                      <span className="text-xs font-medium text-white/90">Metodología Qaway Lab</span>
                      <span className="text-[11px] font-bold text-[#ff4b0b] uppercase">Edición 2026</span>
                    </div>
                  </div>
                </motion.div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* RESUMEN TÁCTICO DE LOS 6 PASOS (CARDS LIMPIAS EN GRID)                     */}
        {/* ========================================================================= */}
        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-9">
            
            <div className="max-w-3xl mb-12">
              <div className="mb-2.5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#ff4b0b]">
                <span>/ Contenido de la Guía</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl font-bold tracking-tight text-[#191918]"
                style={displayFont}
              >
                Los 6 pasos prácticos para automatizar con criterio<span className="text-[#ff4b0b]">.</span>
              </h2>
              <p className="mt-3 text-base text-black/70 max-w-2xl leading-relaxed">
                Una estructura lógica diseñada para pasar del desorden manual a procesos fluidos y confiables sin depender de configuraciones complejas.
              </p>
            </div>

            {/* Grid 3x2 de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {steps.map((step, idx) => (
                <motion.article
                  key={step.number}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.07 }}
                  className="group flex flex-col justify-between rounded-[14px] border border-black/10 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:border-black/25 hover:shadow-[0_20px_45px_rgba(0,0,0,0.06)]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="font-mono text-2xl font-bold text-[#ff4b0b]"
                        style={displayFont}
                      >
                        {step.number}
                      </span>
                      <span className="rounded-full border border-black/5 bg-[#fafafa] px-2.5 py-0.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        {step.subtitle}
                      </span>
                    </div>

                    <h3
                      className="text-xl font-bold text-[#191918] mb-2.5 transition-colors group-hover:text-zinc-600"
                      style={displayFont}
                    >
                      {step.title}
                    </h3>

                    <p className="text-sm text-black/70 leading-relaxed mb-6 font-normal">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-black/5 flex items-center gap-2 text-xs font-mono font-medium text-zinc-500">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ff4b0b]" />
                    <span>{step.takeaway}</span>
                  </div>
                </motion.article>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* CALL TO ACTION FINAL CON CAJA CÁLIDA                                      */}
        {/* ========================================================================= */}
        <section className="bg-[#fafafa] border-t border-black/5 py-16">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-9">
            <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-white via-white to-[#ffe6d8]/60 p-8 sm:p-12 shadow-[0_10px_35px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#ff4b0b] mb-2 block">
                  Descarga Inmediata
                </span>
                <h3
                  className="text-2xl sm:text-3xl font-bold text-[#191918]"
                  style={displayFont}
                >
                  ¿Listo para estructurar tu primer flujo de trabajo?
                </h3>
                <p className="mt-2 text-sm sm:text-base text-black/70 leading-relaxed">
                  Descarga la guía completa en formato PDF sin registros y empieza a optimizar tus procesos con criterio hoy mismo.
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-lg bg-gradient-to-r from-[#ff703d] via-[#ff5a22] to-[#ff4b0b] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-[#ff4b0b]/25 hover:opacity-95 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>{downloading ? 'Descargando...' : 'Descargar PDF (10 Páginas)'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
