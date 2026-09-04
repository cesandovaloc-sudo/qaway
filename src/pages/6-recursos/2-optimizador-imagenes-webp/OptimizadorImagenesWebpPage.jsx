import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, ArrowLeft, Check, CheckCircle2, MessageCircle,
  FileText, ArrowRight, Share2, Sparkles, Workflow, Layers,
  Terminal, ShieldCheck, Cpu, UserCheck, RefreshCw, Eye, BookOpen,
  ArrowDown, X, Lock, Mail, User, Phone, Inbox, Send, Zap, Image as ImageIcon, Gauge, Sliders
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import { supabase } from '@/config/supabase'
import heroImage from '../assets/script-backup.png'

const pipelineSteps = [
  {
    step: '01',
    name: 'Diagnóstico',
    desc: 'Escaneo y detección automática de imágenes pesadas en formato PNG y JPG dentro de tu proyecto.',
    icon: ImageIcon,
    iconBg: 'bg-amber-500/10 text-[#fe6612]',
  },
  {
    step: '02',
    name: 'Presets',
    desc: 'Selección del perfil de compresión inteligente según el rol del activo: Hero, Tarjetas o Logotipos.',
    icon: Sliders,
    iconBg: 'bg-zinc-500/10 text-zinc-700',
  },
  {
    step: '03',
    name: 'Motor Sharp',
    desc: 'Procesamiento multihilo en NodeJS que reescala y convierte a WebP de alta fidelidad en milisegundos.',
    icon: Cpu,
    iconBg: 'bg-[#fe6612] text-white shadow-xs',
    isHeroStep: true,
  },
  {
    step: '04',
    name: 'Verificación',
    desc: 'Reporte inmediato en consola comparando peso inicial vs final con porcentaje exacto de ahorro.',
    icon: ShieldCheck,
    iconBg: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    step: '05',
    name: 'Carga Veloz',
    desc: 'Despliegue de imágenes ultralivianas que mejoran el puntaje Google PageSpeed y reducen la tasa de rebote.',
    icon: Gauge,
    iconBg: 'bg-sky-500/10 text-sky-600',
  },
]

const displayFont = {
  fontFamily: '"Arial Narrow", "Roboto Condensed", "Helvetica Neue Condensed", Impact, sans-serif',
  letterSpacing: '-0.03em',
}

export default function OptimizadorImagenesWebpPage() {
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
    const unlocked = localStorage.getItem('recurso_desbloqueado_optimizador-imagenes-webp') === 'true'
    if (unlocked) {
      setIsUnlocked(true)
    }
  }, [])

  const triggerScriptDownload = () => {
    setDownloading(true)
    
    // Contenido del script y guía técnica
    const scriptContent = `#!/usr/bin/env node
/**
 * Qaway Lab - Optimizador y Conversor Inteligente de Imágenes a WebP
 * 
 * Presets configurados:
 * - hero:   Escala 95% | Calidad 95% (Imágenes principales y portadas)
 * - cards:  Escala 80% | Calidad 80% (Tarjetas, catálogos y fichas)
 * - small:  Escala 70% | Calidad 70% (Miniaturas y elementos compactos)
 * - logo:   Escala 100% | Calidad 100% (Transparencia perfecta sin pérdida)
 * 
 * Uso:
 *   node scripts/optimize-images.mjs --dir="./src/assets" --preset=cards
 *   node scripts/optimize-images.mjs --file="./src/assets/hero.png" --preset=hero
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PROFILES = {
  hero: { scale: 0.95, quality: 95, name: 'Hero / Grandes (95% escala, 95% calidad)' },
  cards: { scale: 0.80, quality: 80, name: 'Tarjetas Medianas (80% escala, 80% calidad)' },
  small: { scale: 0.70, quality: 70, name: 'Pequeñas / Miniaturas (70% escala, 70% calidad)' },
  logo: { scale: 1.00, quality: 100, lossless: true, name: 'Logotipos / Transparencias (100% fidelidad)' }
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { preset: 'cards', dir: null, file: null };
  for (const arg of args) {
    if (arg.startsWith('--preset=')) options.preset = arg.split('=')[1].toLowerCase();
    else if (arg.startsWith('--dir=')) options.dir = arg.split('=')[1];
    else if (arg.startsWith('--file=')) options.file = arg.split('=')[1];
  }
  return options;
}

async function optimizeFile(filePath, config) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) return null;

    const stat = fs.statSync(filePath);
    const originalSizeKb = (stat.size / 1024).toFixed(1);

    const image = sharp(filePath);
    const metadata = await image.metadata();

    const targetWidth = Math.round(metadata.width * config.scale);
    const targetHeight = Math.round(metadata.height * config.scale);

    let pipeline = image.resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: true });

    if (config.lossless) {
      pipeline = pipeline.webp({ lossless: true });
    } else {
      pipeline = pipeline.webp({ quality: config.quality, effort: 6 });
    }

    const outPath = filePath.replace(/\\.(png|jpg|jpeg|webp)$/i, '.webp');
    const buffer = await pipeline.toBuffer();
    fs.writeFileSync(outPath, buffer);

    const newStat = fs.statSync(outPath);
    const newSizeKb = (newStat.size / 1024).toFixed(1);
    const reduction = (((stat.size - newStat.size) / stat.size) * 100).toFixed(1);

    return { file: path.basename(filePath), originalSizeKb, newSizeKb, reduction };
  } catch (err) {
    console.error('Error al optimizar:', filePath, err.message);
    return null;
  }
}

async function run() {
  const opts = parseArgs();
  const config = PROFILES[opts.preset] || PROFILES.cards;
  console.log(\`\\n🚀 Qaway Lab Image Optimizer | Preset: \${config.name}\\n\`);

  if (opts.file) {
    const res = await optimizeFile(opts.file, config);
    if (res) console.log(\`✅ \${res.file} -> \${res.newSizeKb} KB (-\${res.reduction}%)\`);
  } else if (opts.dir) {
    const files = fs.readdirSync(opts.dir);
    for (const f of files) {
      const fullPath = path.join(opts.dir, f);
      if (fs.statSync(fullPath).isFile()) {
        const res = await optimizeFile(fullPath, config);
        if (res) console.log(\`✅ \${res.file} -> \${res.newSizeKb} KB (-\${res.reduction}%)\`);
      }
    }
  }
  console.log('\\n✨ Proceso de optimización finalizado.\\n');
}

run();
`

    const blob = new Blob([scriptContent], { type: 'text/javascript;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'optimize-images.mjs')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setTimeout(() => {
      setDownloading(false)
    }, 1500)
  }

  const handleDownloadClick = () => {
    if (isUnlocked) {
      triggerScriptDownload()
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
            resource_id: 'optimizador-imagenes-webp',
            name: leadName.trim(),
            email: leadEmail.trim().toLowerCase(),
            phone: leadPhone.trim()
          }
        ])

      if (error) {
        console.warn('[Supabase log]', error.message)
      }

      // 2. Enviar correo de notificación
      const emailSubject = `Nuevo Lead: Descarga Script Optimizador WebP`
      const emailBody = `Un usuario ha completado el formulario para descargar el Script Optimizador WebP.\n\n` +
        `Recurso: Script & Guía de Optimización de Imágenes a WebP\n` +
        `Nombre: ${leadName}\n` +
        `Correo: ${leadEmail}\n` +
        `WhatsApp / Teléfono: ${leadPhone}\n` +
        `Fecha: ${new Date().toLocaleString()}\n`

      await sendEmailNotification(emailSubject, emailBody)

      // 3. Desbloquear y recordar en localStorage
      localStorage.setItem('recurso_desbloqueado_optimizador-imagenes-webp', 'true')
      setIsUnlocked(true)
      setShowModal(false)

      // 4. Iniciar descarga automática
      triggerScriptDownload()

    } catch (err) {
      console.error('Error en el envío de lead:', err)
      setLeadError('Hubo un inconveniente al procesar tu solicitud. Por favor intenta de nuevo.')
    } finally {
      setIsSubmittingLead(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Script Optimizador de Imágenes WebP | Qaway Lab',
        text: 'Aprende a reducir hasta 95% el peso de tus imágenes sin pérdida de calidad con este script Node.js.',
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const waUrl = `https://wa.me/51930756781?text=${encodeURIComponent('Hola Qaway Lab, tengo una consulta sobre el Script Optimizador de Imágenes WebP.')}`

  return (
    <div className="bg-[#ffffff] text-[#191918] min-h-screen pt-20">
      
      {/* Barra de Navegación Contextual Superior */}
      <div className="border-b border-[#20201f]/10 bg-white sticky top-16 z-30 shadow-xs">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 lg:px-14 py-3.5 flex items-center justify-between">
          <Link
            to="/recursos"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/60 hover:text-[#fe6612] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Todos los Recursos</span>
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
              <span>{downloading ? 'Descargando...' : 'Descargar Script'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HERO OFICIAL QAWAY LAB: SPLIT CON TIPOGRAFÍA NATIVA                      */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-[#ffffff] px-6 pt-12 pb-16 sm:px-10 lg:px-14 lg:pt-16 lg:pb-24 border-b border-[#20201f]/10">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Columna Izquierda: Información Principal (50%) */}
            <div className="lg:col-span-6">
              <div className="mb-3.5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#ff4b0b]">
                <span>/ Recursos · Script & Guía Técnica</span>
              </div>

              <h1
                className="text-[#191918]"
                style={{
                  ...displayFont,
                  fontSize: 'clamp(2.35rem, 3.8vw, 3.35rem)',
                  fontWeight: 600,
                  lineHeight: 1.12,
                  letterSpacing: '-0.035em',
                }}
              >
                Cómo optimizar imágenes web y reducir hasta 95% su peso con <span className="text-[#ff4b0b]">WebP.</span>
              </h1>

              <p className="mt-4 max-w-lg text-[15px] sm:text-base leading-relaxed text-black/75">
                Acelera la carga de tu sitio web sin sacrificar nitidez visual. Aprende a usar nuestro script Node.js con motor Sharp para transformar carpetas enteras de JPG y PNG en WebP ultralivianos en segundos.
              </p>

              {/* Bullets institucionales con respiro calibrado */}
              <div className="mt-7 space-y-3 max-w-lg">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#fe6612]/15 text-[#fe6612]">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <p className="text-[14px] font-medium text-[#20201f]/85">
                    <strong>Reducción masiva probada:</strong> De 34.2 MB a 1.6 MB (-95.3% de ahorro de peso real).
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#fe6612]/15 text-[#fe6612]">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <p className="text-[14px] font-medium text-[#20201f]/85">
                    <strong>4 Presets de producción:</strong> Hero (alta fidelidad), Tarjetas, Miniaturas y Logos.
                  </p>
                </div>
              </div>

              {/* Acciones con respiro visual amplio */}
              <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-5">
                <button
                  onClick={handleDownloadClick}
                  disabled={downloading}
                  className="inline-flex items-center gap-2.5 rounded-[10px] bg-[#fe6612] px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-[0_14px_36px_rgba(254,102,18,0.28)] hover:bg-[#e05508] transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>{downloading ? 'Descargando...' : 'Descargar Script'}</span>
                </button>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[42px] items-center gap-2 border-b-2 border-[#fe6612] pb-1 text-xs sm:text-sm font-bold text-[#20201f] transition-colors hover:text-[#fe6612]"
                >
                  <span>Consultar por WhatsApp</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#fe6612]" />
                </a>
              </div>
            </div>

            {/* Columna Derecha: Imagen Flotante Agrandada (50%) */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-[560px] flex justify-center"
              >
                <img
                  src={heroImage}
                  alt="Script y Guía de Optimización de Imágenes a WebP - Qaway Lab"
                  className="w-full h-auto rounded-[12px] shadow-[0_24px_60px_rgba(0,0,0,0.14)] transition-transform duration-500 hover:scale-[1.01]"
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
              <span>/ Metodología de Optimización</span>
            </div>
            <h2
              className="text-[#191918]"
              style={{
                ...displayFont,
                fontSize: 'clamp(1.85rem, 2.8vw, 2.35rem)',
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
              }}
            >
              El flujo de compresión en 5 pasos<span className="text-[#fe6612]">.</span>
            </h2>
            <p className="mt-3.5 text-[15px] sm:text-base text-black/75 leading-relaxed max-w-xl mx-auto">
              La arquitectura técnica para convertir activos pesados en imágenes ultralivianas listas para producción.
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
          <div className="rounded-[20px] border border-[#20201f]/12 bg-white p-8 sm:p-12 shadow-[0_20px_60px_rgba(32,32,31,0.06)] flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14">
            <div className="max-w-xl">
              <span className="qw-section-kicker mb-2">
                Acceso Gratuito
              </span>
              <h3
                className="text-[#20201f] text-balance max-w-lg"
                style={{
                  ...displayFont,
                  fontSize: 'clamp(1.85rem, 2.8vw, 2.35rem)',
                  fontWeight: 600,
                  lineHeight: 1.18,
                  letterSpacing: '-0.03em',
                }}
              >
                Descarga el script Node.js <br className="hidden sm:inline" />y optimiza tus proyectos<span className="text-[#fe6612]">.</span>
              </h3>
              <p className="mt-2.5 max-w-md text-[15px] text-black/75 leading-relaxed">
                Script completo con motor Sharp, 4 presets configurados y comandos CLI listos para ejecutar.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <button
                onClick={handleDownloadClick}
                disabled={downloading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#fe6612] px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[0_14px_36px_rgba(254,102,18,0.28)] hover:bg-[#e05508] transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>{downloading ? 'Descargando...' : 'Descargar Script'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

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
                  Descarga el Optimizador WebP
                </h3>
                <p className="mt-2 text-xs sm:text-[13px] text-[#516f90]">
                  Completa tus datos para recibir el script oficial y la guía de comandos CLI.
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
