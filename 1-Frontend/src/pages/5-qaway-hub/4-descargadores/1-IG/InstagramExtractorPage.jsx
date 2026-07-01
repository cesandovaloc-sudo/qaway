import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Link2,
  Download,
  Copy,
  Image,
  Video,
  FileText,
  AlertCircle,
  Check,
  ArrowLeft,
  Loader2,
} from 'lucide-react'

export default function InstagramExtractorPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleExtract = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const res = await fetch('/api/tools/instagram/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al extraer')
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleDownload = (imgUrl, index) => {
    const a = document.createElement('a')
    a.href = imgUrl
    a.download = `instagram-${Date.now()}-${index}.jpg`
    a.target = '_blank'
    a.click()
  }

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#2F3437] selection:bg-qaway-accent selection:text-black font-sans antialiased">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back */}
        <Link
          to="/hub"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-zinc-400 hover:text-zinc-600 transition-colors mb-10 uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al Hub
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-200/40 flex items-center justify-center mb-5">
                            <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" />
              </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111] mb-3">
            Extractor de Instagram
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-lg font-medium">
            Pegá un link de Instagram (post, reel o carrusel) y obtené las imágenes, videos y texto al instante.
          </p>
        </div>

        {/* Input */}
        <div className="bg-white border border-[#EAEAEA] rounded-2xl p-2 flex items-center gap-2 shadow-sm mb-6">
          <div className="flex-1 flex items-center gap-3 px-4">
            <Link2 className="w-4 h-4 text-zinc-300 flex-shrink-0" strokeWidth={1.5} />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
              placeholder="https://www.instagram.com/p/..."
              className="w-full bg-transparent text-sm text-[#111111] placeholder:text-zinc-300 outline-none py-3 font-medium"
            />
          </div>
          <button
            onClick={handleExtract}
            disabled={loading || !url.trim()}
            className="px-6 py-3 rounded-xl bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2F3437] disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extrayendo
              </>
            ) : (
              'Extraer'
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 flex items-start gap-3 mb-6"
          >
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-sm text-red-600 font-medium">{error}</span>
          </motion.div>
        )}

        {/* Results */}
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Caption */}
            {data.caption && (
              <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                    <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">
                      Caption
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(data.caption)}
                    className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-zinc-400 hover:text-zinc-600 transition-colors uppercase"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                  {data.caption}
                </p>
              </div>
            )}

            {/* Images */}
            {data.images && data.images.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Image className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                  <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">
                    {data.images.length > 1
                      ? `${data.images.length} imágenes`
                      : '1 imagen'}
                  </span>
                </div>

                <div className="grid gap-4" style={{
                  gridTemplateColumns: `repeat(auto-fill, minmax(${data.images.length === 1 ? '300' : '220'}px, 1fr))`
                }}>
                  {data.images.map((img, i) => (
                    <div
                      key={i}
                      className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden group"
                    >
                      <div className="aspect-square bg-[#fcfcfb] relative overflow-hidden">
                        <img
                          src={img}
                          alt={`Imagen ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3 flex items-center justify-between border-t border-[#EAEAEA]">
                        <span className="text-[10px] font-mono text-zinc-400 font-medium">
                          {i + 1} / {data.images.length}
                        </span>
                        <button
                          onClick={() => handleDownload(img, i)}
                          className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-zinc-500 hover:text-[#111111] transition-colors uppercase"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {data.video && (
              <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Video className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                  <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">
                    Video
                  </span>
                </div>
                <video
                  src={data.video}
                  controls
                  className="w-full rounded-xl bg-black max-h-[500px]"
                  controlsList="nodownload"
                />
                <div className="mt-3 flex justify-end">
                  <a
                    href={data.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-zinc-500 hover:text-[#111111] transition-colors uppercase"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar Video
                  </a>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!data.images?.length && !data.video && !data.caption && (
              <div className="text-center py-12">
                <p className="text-sm text-zinc-400 font-medium">
                  No se pudo extraer contenido de esta URL.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
