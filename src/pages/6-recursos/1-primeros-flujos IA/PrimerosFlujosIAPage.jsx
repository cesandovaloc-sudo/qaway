import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Download, ArrowLeft, Check, CheckCircle2, MessageCircle,
  FileText, ArrowRight, Share2, Sparkles, Workflow, Layers,
  Terminal, ShieldCheck, Cpu, UserCheck, RefreshCw, Eye, BookOpen,
  ArrowDown
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import heroImage from './ChatGPT Image 1 sept 2026, 19_04_24.png'
import pdfFile from './Guia_Qaway Lab_Primeros_Flujos_IA.pdf'

const pipelineSteps = [
  { step: '01', name: 'Entrada', desc: 'Datos en bruto, correos, formularios o solicitudes de clientes.' },
  { step: '02', name: 'Tarea', desc: 'Descomposición en pasos atómicos y predecibles.' },
  { step: '03', name: 'IA', desc: 'Procesamiento semántico, síntesis y estructuración rápida.' },
  { step: '04', name: 'Revisión', desc: 'Validación de criterio, precisión de datos y tono de marca.' },
  { step: '05', name: 'Resultado', desc: 'Entrega final en CRM, Notion, WhatsApp o correo.' },
]

const displayFont = {
  fontFamily: '"Arial Narrow", "Roboto Condensed", "Helvetica Neue Condensed", Impact, sans-serif',
  letterSpacing: '-0.03em',
}

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
                onClick={handleDownload}
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
                  className="text-4xl font-bold tracking-tight text-[#191918] sm:text-5xl lg:text-6xl"
                  style={displayFont}
                >
                  Cómo estructurar tus primeros flujos de trabajo con <span className="text-[#ff4b0b]">IA.</span>
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/70 sm:text-lg">
                  No necesitas aprender diez herramientas. Empieza por una tarea que quieras mejorar y divídela en pasos para saber exactamente dónde y cómo aplicar Inteligencia Artificial con criterio.
                </p>

                {/* Bullets institucionales */}
                <div className="mt-6 space-y-2.5 max-w-xl">
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

                {/* Acciones */}
                <div className="qw-hero-actions">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="inline-flex items-center gap-2.5 rounded-[10px] bg-[#fe6612] px-7 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[0_14px_36px_rgba(254,102,18,0.28)] hover:bg-[#e05508] transition-all active:scale-[0.98]"
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
                  className="relative w-full max-w-[420px] flex justify-center"
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
        {/* PIPELINE VISUAL METODOLÓGICO: ENTRADA ➔ TAREA ➔ IA ➔ REVISIÓN ➔ RESULTADO */}
        {/* ========================================================================= */}
        <section className="bg-[#f8f9fc] py-14 px-6 sm:px-10 lg:px-14 border-b border-[#20201f]/10">
          <div className="mx-auto max-w-[1240px]">
            <div className="mb-8">
              <span className="qw-section-kicker mb-2">
                Arquitectura del Flujo
              </span>
              <h2 className="qw-section-title text-[#20201f]" style={{ fontSize: 'clamp(1.8rem, 2.8vw, 2.6rem)' }}>
                El ciclo operativo de 5 fases<span className="text-[#fe6612]">.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {pipelineSteps.map((item, idx) => (
                <div
                  key={item.step}
                  className="relative rounded-[12px] border border-[#20201f]/10 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-[#fe6612] bg-[#fe6612]/10 px-2 py-0.5 rounded-md">
                        FASE {item.step}
                      </span>
                      {idx < pipelineSteps.length - 1 && (
                        <ArrowRight className="hidden lg:block h-3.5 w-3.5 text-[#20201f]/30" />
                      )}
                    </div>
                    <h3 className="text-base font-bold text-[#20201f] mb-1.5">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#4e4d4a] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
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
                  onClick={handleDownload}
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
    </div>
  )
}
