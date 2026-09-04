import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud, Download, ArrowLeft, Check, CheckCircle2,
  Trash2, RefreshCw, FileImage, Sparkles, Zap, ShieldCheck,
  ArrowRight, Sliders, Layers, Eye, Gauge, Share2, HelpCircle,
  ImageIcon
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'

const PRESETS = [
  {
    id: 'cards',
    name: 'Tarjetas & Catálogo',
    badge: 'Recomendado',
    scale: 0.80,
    quality: 0.80,
    desc: 'Equilibrio perfecto entre nitidez y peso ultraliviano (-90% a -95%).',
  },
  {
    id: 'hero',
    name: 'Portadas & Hero',
    badge: 'Máxima Calidad',
    scale: 0.95,
    quality: 0.92,
    desc: 'Para banners grandes y fotos a pantalla completa de alta fidelidad.',
  },
  {
    id: 'small',
    name: 'Miniaturas & Redes',
    badge: 'Ultraliviano',
    scale: 0.70,
    quality: 0.70,
    desc: 'Para avatares, fotos de clientes y elementos compactos.',
  },
  {
    id: 'logo',
    name: 'Logos & Transparencias',
    badge: '100% Fidelidad',
    scale: 1.00,
    quality: 1.00,
    desc: 'Conserva transparencias nítidas y vectores rasterizados.',
  },
]

const displayFont = {
  fontFamily: '"Arial Narrow", "Roboto Condensed", "Helvetica Neue Condensed", Impact, sans-serif',
  letterSpacing: '-0.03em',
}

export default function OptimizadorWebpHubPage() {
  useSetNavbarVariant('light')
  
  const [selectedPreset, setSelectedPreset] = useState('cards')
  const [images, setImages] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef(null)

  const activePresetConfig = PRESETS.find(p => p.id === selectedPreset) || PRESETS[0]

  // Función de compresión en el cliente vía Canvas
  const processImageFile = async (file, config) => {
    return new Promise((resolve) => {
      const originalSize = file.size
      const originalSizeKb = (originalSize / 1024).toFixed(1)
      const reader = new FileReader()

      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d', { alpha: true })

          const targetWidth = Math.round(img.naturalWidth * config.scale)
          const targetHeight = Math.round(img.naturalHeight * config.scale)

          canvas.width = targetWidth
          canvas.height = targetHeight

          // Suavizado de imagen de alta calidad
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(null)
                return
              }
              const newSize = blob.size
              const newSizeKb = (newSize / 1024).toFixed(1)
              const savedPercent = (((originalSize - newSize) / originalSize) * 100).toFixed(1)
              const newUrl = URL.createObjectURL(blob)
              const outName = file.name.replace(/\.[^/.]+$/, '') + '.webp'

              resolve({
                id: Math.random().toString(36).substring(2, 9),
                file,
                fileName: file.name,
                outName,
                originalSizeKb,
                newSizeKb,
                savedPercent: Math.max(0, parseFloat(savedPercent)),
                originalWidth: img.naturalWidth,
                originalHeight: img.naturalHeight,
                targetWidth,
                targetHeight,
                previewUrl: e.target.result,
                optimizedUrl: newUrl,
                blob,
                status: 'completed'
              })
            },
            'image/webp',
            config.quality
          )
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFilesSelected = async (fileList) => {
    const validFiles = Array.from(fileList).filter(f => 
      ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(f.type) ||
      /\.(png|jpe?g|webp)$/i.test(f.name)
    )

    if (validFiles.length === 0) return

    setIsProcessing(true)
    const newItems = []

    for (const file of validFiles) {
      const result = await processImageFile(file, activePresetConfig)
      if (result) {
        newItems.push(result)
      }
    }

    setImages(prev => [...newItems, ...prev])
    setIsProcessing(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files)
    }
  }

  const handlePresetChange = async (presetId) => {
    setSelectedPreset(presetId)
    const newConfig = PRESETS.find(p => p.id === presetId) || PRESETS[0]
    
    // Si ya hay imágenes, reprocesarlas con el nuevo preset
    if (images.length > 0) {
      setIsProcessing(true)
      const updated = []
      for (const item of images) {
        const result = await processImageFile(item.file, newConfig)
        if (result) updated.push(result)
      }
      setImages(updated)
      setIsProcessing(false)
    }
  }

  const removeImage = (id) => {
    setImages(prev => prev.filter(item => item.id !== id))
  }

  const clearAll = () => {
    setImages([])
  }

  const downloadSingle = (item) => {
    const a = document.createElement('a')
    a.href = item.optimizedUrl
    a.download = item.outName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const downloadAll = () => {
    images.forEach((item, idx) => {
      setTimeout(() => {
        downloadSingle(item)
      }, idx * 250)
    })
  }

  // Totales y estadísticas acumuladas
  const totalOriginalKb = images.reduce((acc, curr) => acc + parseFloat(curr.originalSizeKb), 0)
  const totalOptimizedKb = images.reduce((acc, curr) => acc + parseFloat(curr.newSizeKb), 0)
  const totalSavedKb = Math.max(0, totalOriginalKb - totalOptimizedKb)
  const totalSavedPercent = totalOriginalKb > 0 ? ((totalSavedKb / totalOriginalKb) * 100).toFixed(1) : 0

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Optimizador WebP | Qaway Hub',
        text: 'Reduce hasta 95% el peso de tus imágenes al instante en tu navegador.',
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-[#ffffff] text-[#191918] min-h-screen pt-20">
      
      {/* Barra de Navegación Contextual del Hub */}
      <div className="border-b border-[#20201f]/10 bg-white sticky top-16 z-30 shadow-xs">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 lg:px-14 py-3.5 flex items-center justify-between">
          <Link
            to="/hub"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/60 hover:text-[#fe6612] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a Qaway Hub</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#20201f]/15 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#20201f] shadow-xs hover:border-[#fe6612] hover:text-[#fe6612] transition-all cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copied ? 'Enlace copiado' : 'Compartir'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HERO & CABECERA DE LA HERRAMIENTA                                         */}
      {/* ========================================================================= */}
      <section className="bg-white px-6 pt-12 pb-10 sm:px-10 lg:px-14 border-b border-[#20201f]/10">
        <div className="mx-auto max-w-[1240px] text-center">
          <div className="mb-3.5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#ff4b0b]">
            <span>/ Qaway Hub · Herramientas & Productividad</span>
          </div>

          <h1
            className="text-[#191918] max-w-4xl mx-auto"
            style={{
              ...displayFont,
              fontSize: 'clamp(2.35rem, 3.8vw, 3.35rem)',
              fontWeight: 600,
              lineHeight: 1.12,
              letterSpacing: '-0.035em',
            }}
          >
            Optimizador de Imágenes a <span className="text-[#ff4b0b]">WebP.</span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-[15px] sm:text-base leading-relaxed text-black/75">
            Reduce hasta un <strong>95% de peso</strong> en tus fotos JPG y PNG sin perder nitidez visual. 100% privado en tu navegador, sin límites de uso y sin registro obligatorio.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-black/60">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Tus fotos nunca salen de tu equipo
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              Conversión multihilo instantánea
            </span>
            <span className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-[#fe6612]" />
              Mejora tu puntaje Google PageSpeed
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* APLICACIÓN INTERACTIVA: SELECTOR DE PRESETS + DROPZONE                     */}
      {/* ========================================================================= */}
      <section className="bg-[#f8f9fc] py-12 px-6 sm:px-10 lg:px-14 border-b border-[#20201f]/10">
        <div className="mx-auto max-w-[1240px]">
          
          {/* 1. Selector de Presets de Calidad */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-black/70 mb-3">
              1. Selecciona el perfil de compresión:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.id
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetChange(preset.id)}
                    type="button"
                    className={`relative rounded-[12px] p-5 text-left transition-all duration-200 border cursor-pointer ${
                      isSelected
                        ? 'border-[#fe6612] bg-white shadow-[0_10px_30px_rgba(254,102,18,0.14)] ring-2 ring-[#fe6612]'
                        : 'border-black/10 bg-white hover:border-black/20 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-[#fe6612] text-white' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {preset.badge}
                      </span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-[#fe6612]" />}
                    </div>
                    <h3 className="text-base font-bold text-[#191918] mb-1">{preset.name}</h3>
                    <p className="text-xs text-black/60 leading-relaxed">{preset.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Zona de Arrastre (Dropzone) */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="group relative rounded-[16px] border-2 border-dashed border-[#fe6612]/40 hover:border-[#fe6612] bg-white p-10 sm:p-14 text-center transition-all duration-300 shadow-[0_12px_36px_rgba(0,0,0,0.04)] hover:shadow-[0_18px_48px_rgba(254,102,18,0.10)] cursor-pointer"
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fe6612]/10 text-[#fe6612] group-hover:scale-110 transition-transform">
              {isProcessing ? (
                <RefreshCw className="h-8 w-8 animate-spin" />
              ) : (
                <UploadCloud className="h-8 w-8 stroke-[1.8]" />
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-[#191918] mb-2" style={displayFont}>
              {isProcessing ? 'Optimizando tus imágenes...' : 'Arrastra tus fotos aquí o haz clic para seleccionarlas'}
            </h3>
            <p className="text-sm text-black/60 max-w-md mx-auto">
              Soporta archivos <strong>PNG, JPG, JPEG y WebP</strong> de cualquier resolución.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#fe6612] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs group-hover:bg-[#e05508] transition-colors">
              <FileImage className="h-4 w-4" />
              <span>Seleccionar desde mi equipo</span>
            </div>
          </div>

          {/* 3. Panel de Resultados & Estadísticas de Ahorro */}
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10"
            >
              {/* Barra de Resumen Acumulado */}
              <div className="rounded-[12px] border border-black/10 bg-white p-6 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-black/70 mb-1">
                    Balance de Optimización:
                  </h4>
                  <p className="text-sm text-black/80">
                    <span className="line-through text-black/40 font-mono">{(totalOriginalKb / 1024).toFixed(2)} MB</span>{' '}
                    ➔ <strong className="text-emerald-600 font-mono font-bold">{(totalOptimizedKb / 1024).toFixed(2)} MB</strong>{' '}
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                      -{totalSavedPercent}% de ahorro
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={clearAll}
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/15 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black/70 hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Limpiar</span>
                  </button>

                  <button
                    onClick={downloadAll}
                    type="button"
                    className="inline-flex flex-1 md:flex-none items-center justify-center gap-2.5 rounded-lg bg-[#fe6612] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#e05508] transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Descargar Todo ({images.length})</span>
                  </button>
                </div>
              </div>

              {/* Lista de Imágenes Optimizadas */}
              <div className="space-y-3.5">
                {images.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[12px] border border-black/10 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:border-black/20"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-black/10 bg-[#f8f9fc]">
                        <img
                          src={item.optimizedUrl}
                          alt={item.fileName}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="overflow-hidden">
                        <h4 className="text-sm font-bold text-[#191918] truncate max-w-xs sm:max-w-md">
                          {item.fileName}
                        </h4>
                        <div className="mt-1 flex items-center gap-3 text-xs text-black/60">
                          <span>Original: <strong>{item.originalSizeKb} KB</strong></span>
                          <span>➔</span>
                          <span className="text-emerald-600 font-bold">WebP: {item.newSizeKb} KB</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            -{item.savedPercent}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => removeImage(item.id)}
                        type="button"
                        className="h-9 w-9 rounded-lg border border-black/10 hover:border-red-300 hover:text-red-600 flex items-center justify-center text-black/40 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => downloadSingle(item)}
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#191918] hover:bg-[#fe6612] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Descargar WebP</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* BENEFICIOS TÉCNICOS & PREGUNTAS FRECUENTES                                */}
      {/* ========================================================================= */}
      <section className="bg-white py-16 px-6 sm:px-10 lg:px-14 border-b border-[#20201f]/10">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="rounded-[12px] border border-black/10 p-7 bg-[#fafbfc]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#fe6612]/10 text-[#fe6612]">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[#191918] mb-2">Carga hasta 3x más rápida</h3>
              <p className="text-xs sm:text-sm text-black/70 leading-relaxed">
                El formato WebP fue desarrollado por Google para entregar la misma calidad fotográfica con archivos hasta 95% más livianos.
              </p>
            </div>

            <div className="rounded-[12px] border border-black/10 p-7 bg-[#fafbfc]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#fe6612]/10 text-[#fe6612]">
                <Gauge className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[#191918] mb-2">Impacto Directo en SEO</h3>
              <p className="text-xs sm:text-sm text-black/70 leading-relaxed">
                Google premia los sitios web veloces en los Core Web Vitals (LCP y CLS), reduciendo la tasa de rebote y aumentando las conversiones.
              </p>
            </div>

            <div className="rounded-[12px] border border-black/10 p-7 bg-[#fafbfc]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#fe6612]/10 text-[#fe6612]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[#191918] mb-2">100% Privado y Seguro</h3>
              <p className="text-xs sm:text-sm text-black/70 leading-relaxed">
                A diferencia de otros conversores online, tus fotos nunca viajan por internet ni se guardan en servidores externos.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BANNER CTA INFERIOR                                                      */}
      {/* ========================================================================= */}
      <section className="bg-[#f8f9fc] py-16 px-6 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-[1240px]">
          <div className="rounded-[20px] border border-[#20201f]/12 bg-white p-8 sm:p-12 shadow-[0_20px_60px_rgba(32,32,31,0.06)] flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14">
            <div className="max-w-xl">
              <span className="qw-section-kicker mb-2">
                Sistemas Digitales Qaway Lab
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
                ¿Quieres una web ultra veloz <br className="hidden sm:inline" />para tu negocio<span className="text-[#fe6612]">?</span>
              </h3>
              <p className="mt-2.5 max-w-md text-[15px] text-black/75 leading-relaxed">
                Diseñamos y desarrollamos sitios web de alto rendimiento optimizados para posicionar en Google y convertir visitantes en clientes.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <a
                href="https://wa.me/51930756781?text=Hola%20Qaway%20Lab,%20quisiera%20cotizar%20un%20sitio%20web%20optimizado."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#fe6612] px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[0_14px_36px_rgba(254,102,18,0.28)] hover:bg-[#e05508] transition-all cursor-pointer"
              >
                <span>Consultar Proyecto</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
