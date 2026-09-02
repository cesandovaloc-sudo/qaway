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
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="qw-hero-kicker mb-0">
                    Recursos & Formación · Guía Oficial
                  </span>
                  <span className="inline-block rounded-full bg-[#fe6612]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#fe6612] border border-[#fe6612]/20">
                    10 Páginas · PDF
                  </span>
                </div>

                <h1 className="qw-hero-title text-[#20201f]">
                  Cómo estructurar tus primeros flujos de trabajo con <span className="text-[#fe6612]">IA.</span>
                </h1>

                <p className="qw-hero-copy">
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
                      <strong>Plantilla de trabajo editable:</strong> Lista para duplicar y aplicar en tu equipo.
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
                    className="inline-flex items-center gap-2 rounded-[10px] border border-[#20201f]/15 bg-white px-6 py-4 text-sm font-bold text-[#20201f] shadow-xs hover:border-[#fe6612] hover:text-[#fe6612] transition-all"
                  >
                    <MessageCircle className="h-4 w-4 text-[#25D366]" />
                    <span>Consultar por WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Columna Derecha: Mockup de la Portada */}
              <div className="lg:col-span-5 flex justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full max-w-[420px]"
                >
                  <div className="relative overflow-hidden rounded-[16px] border border-[#20201f]/15 bg-[#f8f9fc] p-3 shadow-[0_24px_70px_rgba(32,32,31,0.12)]">
                    <img
                      src={heroImage}
                      alt="Guía Qaway Lab - Cómo estructurar tus primeros flujos de trabajo con IA"
                      className="w-full h-auto rounded-[12px] object-cover shadow-sm"
                    />
                    <div className="mt-3 flex items-center justify-between px-1 text-xs text-[#20201f]/60 font-mono">
                      <span>DOC-QAWAY-2026-V1</span>
                      <span className="text-[#fe6612] font-bold">DESCARGA DIRECTA</span>
                    </div>
                  </div>
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
        {/* BENTO OPERATIVO: LOS 6 PASOS TÁCTICOS CON RIQUEZA TÉCNICA                */}
        {/* ========================================================================= */}
        <section className="bg-white py-16 sm:py-24 px-6 sm:px-10 lg:px-14">
          <div className="mx-auto max-w-[1240px]">
            
            <div className="max-w-3xl mb-14">
              <span className="qw-section-kicker">
                Metodología Detallada
              </span>
              <h2 className="qw-section-title text-[#20201f]">
                Los 6 pasos prácticos para automatizar con criterio<span className="text-[#fe6612]">.</span>
              </h2>
              <p className="qw-section-copy">
                Cada paso responde a un criterio de ingeniería de procesos. No se trata de conectar herramientas al azar, sino de construir un sistema repetible y seguro.
              </p>
            </div>

            {/* Bento Grid 3x2 con identidad técnica */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* PASO 01: Matriz de Tarea Concreta */}
              <div className="rounded-[16px] border border-[#20201f]/12 bg-[#fdfdfd] p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[#fe6612]/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-[#fe6612] uppercase tracking-wider">
                      01 · Selección
                    </span>
                    <span className="h-2 w-2 rounded-full bg-[#fe6612]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#20201f] mb-2 font-display-condensed">
                    Empieza por una tarea concreta
                  </h3>
                  <p className="text-xs text-[#4e4d4a] leading-relaxed mb-6">
                    Aplica el filtro de viabilidad. Si no cumple estos 3 factores, no intentes automatizar todavía.
                  </p>

                  <div className="space-y-2 rounded-xl bg-white border border-[#20201f]/8 p-3.5 text-xs font-mono text-[#20201f]/80">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Check className="h-3.5 w-3.5" /> <span>Se repite semanalmente</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Check className="h-3.5 w-3.5" /> <span>Consume tiempo operativo</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Check className="h-3.5 w-3.5" /> <span>Se puede dividir en fases</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PASO 02: Desarmar pasos */}
              <div className="rounded-[16px] border border-[#20201f]/12 bg-[#fdfdfd] p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[#fe6612]/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-[#fe6612] uppercase tracking-wider">
                      02 · Mapeo
                    </span>
                    <Workflow className="h-4 w-4 text-[#20201f]/40" />
                  </div>
                  <h3 className="text-xl font-bold text-[#20201f] mb-2 font-display-condensed">
                    Desarma la tarea en pasos visibles
                  </h3>
                  <p className="text-xs text-[#4e4d4a] leading-relaxed mb-6">
                    Mapea la cadena de datos antes de tocar cualquier software:
                  </p>

                  <div className="flex flex-col gap-1.5 text-xs font-mono text-[#20201f]/75">
                    <div className="p-2 rounded-md bg-white border border-[#20201f]/8 flex items-center justify-between">
                      <span>1. Recibir</span> <span className="text-[10px] text-zinc-400">Webhook / Form</span>
                    </div>
                    <div className="p-2 rounded-md bg-white border border-[#20201f]/8 flex items-center justify-between">
                      <span>2. Procesar</span> <span className="text-[10px] text-[#fe6612] font-bold">Módulo IA</span>
                    </div>
                    <div className="p-2 rounded-md bg-white border border-[#20201f]/8 flex items-center justify-between">
                      <span>3. Aplicar</span> <span className="text-[10px] text-zinc-400">CRM / Salida</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PASO 03: Roles Claros */}
              <div className="rounded-[16px] border border-[#20201f]/12 bg-[#fdfdfd] p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[#fe6612]/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-[#fe6612] uppercase tracking-wider">
                      03 · Gobernanza
                    </span>
                    <UserCheck className="h-4 w-4 text-[#20201f]/40" />
                  </div>
                  <h3 className="text-xl font-bold text-[#20201f] mb-2 font-display-condensed">
                    Decide el rol: La IA ejecuta, tú decides
                  </h3>
                  <p className="text-xs text-[#4e4d4a] leading-relaxed mb-6">
                    Evita la automatización ciega asignando responsabilidades:
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-[#20201f]/8">
                      <strong className="block text-[#fe6612] font-mono text-[11px] mb-1">ROL DE IA</strong>
                      <p className="text-[11px] text-[#4e4d4a]">Búsqueda, redacción preliminar y formateo veloz.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#20201f] text-white">
                      <strong className="block text-[#fe6612] font-mono text-[11px] mb-1">TU ROL</strong>
                      <p className="text-[11px] text-white/80">Estrategia, contexto real y decisión final.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PASO 04: Estructura CTR (Terminal Preview) */}
              <div className="rounded-[16px] border border-[#20201f]/12 bg-[#fdfdfd] p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[#fe6612]/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-[#fe6612] uppercase tracking-wider">
                      04 · Prompting
                    </span>
                    <Terminal className="h-4 w-4 text-[#20201f]/40" />
                  </div>
                  <h3 className="text-xl font-bold text-[#20201f] mb-2 font-display-condensed">
                    Estructura CTR de Instrucción
                  </h3>
                  <p className="text-xs text-[#4e4d4a] leading-relaxed mb-4">
                    Elimina alucinaciones usando el estándar de 3 componentes:
                  </p>

                  <div className="rounded-xl bg-[#191918] p-3 text-[11px] font-mono text-white/80 space-y-1.5">
                    <div><span className="text-[#fe6612] font-bold">[C] Contexto:</span> Tipo de negocio y rol.</div>
                    <div><span className="text-sky-400 font-bold">[T] Tarea:</span> Acción específica sin rodeos.</div>
                    <div><span className="text-emerald-400 font-bold">[R] Resultado:</span> Formato exacto (JSON/Tabla).</div>
                  </div>
                </div>
              </div>

              {/* PASO 05: Check de Revisión */}
              <div className="rounded-[16px] border border-[#20201f]/12 bg-[#fdfdfd] p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[#fe6612]/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-[#fe6612] uppercase tracking-wider">
                      05 · Calidad
                    </span>
                    <ShieldCheck className="h-4 w-4 text-[#20201f]/40" />
                  </div>
                  <h3 className="text-xl font-bold text-[#20201f] mb-2 font-display-condensed">
                    Check de revisión crítica
                  </h3>
                  <p className="text-xs text-[#4e4d4a] leading-relaxed mb-4">
                    Puntos de control obligatorios antes de enviar o publicar:
                  </p>

                  <div className="space-y-2 text-xs font-medium text-[#20201f]/80">
                    <div className="p-2 rounded-lg bg-white border border-[#20201f]/8 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>¿Las cifras y datos clave son exactos?</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-[#20201f]/8 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>¿El tono coincide con la marca?</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-[#20201f]/8 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>¿Aporta valor real o es texto genérico?</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PASO 06: Documentar y Escalar */}
              <div className="rounded-[16px] border border-[#20201f]/12 bg-[#fdfdfd] p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[#fe6612]/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-[#fe6612] uppercase tracking-wider">
                      06 · Escala
                    </span>
                    <Layers className="h-4 w-4 text-[#20201f]/40" />
                  </div>
                  <h3 className="text-xl font-bold text-[#20201f] mb-2 font-display-condensed">
                    Documenta, repite y escala
                  </h3>
                  <p className="text-xs text-[#4e4d4a] leading-relaxed mb-4">
                    La meta final: convertir una prueba en un activo delegable.
                  </p>

                  <div className="rounded-xl bg-white border border-[#20201f]/8 p-3 text-xs text-[#4e4d4a] space-y-1.5">
                    <div className="font-mono font-bold text-[#20201f]">SOP ESTANDARIZADO:</div>
                    <p className="text-[11px]">Guarda el prompt, las entradas requeridas y el criterio de revisión en Notion para que cualquier miembro del equipo pueda ejecutarlo.</p>
                  </div>
                </div>
              </div>

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
