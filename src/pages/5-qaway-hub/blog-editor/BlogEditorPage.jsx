import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Copy,
  FileJson,
  Link2,
  Plus,
  Rocket,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'

const categories = [
  { value: 'artificial', label: 'Artificial' },
  { value: 'productividad', label: 'Productividad' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'diseno', label: 'Diseno' },
  { value: 'automatizacion', label: 'Automatizacion' },
]

const blockTypes = [
  { value: 'paragraph', label: 'Parrafo' },
  { value: 'subheading', label: 'Subtitulo' },
  { value: 'list', label: 'Lista' },
  { value: 'image', label: 'Imagen' },
  { value: 'link', label: 'Enlace' },
]

const internalSuggestions = {
  canva: [
    { label: 'Landing Sistema Contenido Notion', path: '/landings/sistema-contenido-notion' },
    { label: 'Ruta Marca en Hub', path: '/hub/ruta-marca' },
  ],
  notion: [
    { label: 'Blog CRM y WhatsApp', path: '/blog/articulo/guia-crm-notion-whatsapp' },
    { label: 'Blog SOPs en Notion', path: '/blog/articulo/sops-notion-organizar-procesos-delegar' },
  ],
  whatsapp: [
    { label: 'Consola WABA + CRM', path: '/hub/waba-crm' },
    { label: 'CRM Comercial', path: '/hub/crm' },
  ],
}

function createBlock(type = 'paragraph') {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type,
    content: '',
    itemsText: '',
    src: '',
    alt: '',
    caption: '',
    href: '',
    label: '',
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function BlogEditorPage() {
  useSetNavbarVariant('light')

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [category, setCategory] = useState('marketing')
  const [featured, setFeatured] = useState(false)
  const [publishedAt, setPublishedAt] = useState('2026-07-12')
  const [readTime, setReadTime] = useState('5 min')
  const [coverImage, setCoverImage] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [formatLabel, setFormatLabel] = useState('Guia')
  const [keywords, setKeywords] = useState('')
  const [blocks, setBlocks] = useState([createBlock('paragraph')])
  const [copied, setCopied] = useState(false)

  const computedSlug = slugTouched ? slug : slugify(title)

  const articleObject = useMemo(() => {
    const cleanedBlocks = blocks
      .map((block) => {
        if (block.type === 'list') {
          const items = block.itemsText
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean)
          return items.length ? { type: 'list', items } : null
        }

        if (block.type === 'image') {
          if (!block.src.trim()) return null
          return {
            type: 'image',
            src: block.src.trim(),
            alt: block.alt.trim(),
            caption: block.caption.trim(),
          }
        }

        if (block.type === 'link') {
          if (!block.href.trim() || !block.label.trim()) return null
          return {
            type: 'link',
            href: block.href.trim(),
            label: block.label.trim(),
          }
        }

        if (!block.content.trim()) return null
        return {
          type: block.type,
          content: block.content.trim(),
        }
      })
      .filter(Boolean)

    return {
      slug: computedSlug,
      category,
      formatLabel,
      title,
      excerpt,
      featured,
      publishedAt,
      readTime,
      coverImage,
      keywords: keywords.split(',').map((item) => item.trim()).filter(Boolean),
      blocks: cleanedBlocks,
    }
  }, [blocks, category, computedSlug, coverImage, excerpt, featured, formatLabel, keywords, publishedAt, readTime, title])

  const generatedSnippet = `{
  slug: '${articleObject.slug}',
  category: '${articleObject.category}',
  formatLabel: '${articleObject.formatLabel}',
  title: '${articleObject.title.replace(/'/g, "\\'")}',
  excerpt: '${articleObject.excerpt.replace(/'/g, "\\'")}',
  featured: ${articleObject.featured},
  publishedAt: '${articleObject.publishedAt}',
  readTime: '${articleObject.readTime}',
  coverImage: '${articleObject.coverImage}',
  keywords: ${JSON.stringify(articleObject.keywords)},
  blocks: ${JSON.stringify(articleObject.blocks, null, 2)}
}`

  const suggestions = useMemo(() => {
    const haystack = `${title} ${excerpt} ${keywords} ${blocks.map((block) => `${block.content} ${block.itemsText}`).join(' ')}`.toLowerCase()
    return Object.entries(internalSuggestions)
      .filter(([term]) => haystack.includes(term))
      .flatMap(([, items]) => items)
  }, [blocks, excerpt, keywords, title])

  const updateBlock = (id, field, value) => {
    setBlocks((current) => current.map((block) => (block.id === id ? { ...block, [field]: value } : block)))
  }

  const addBlock = (type) => setBlocks((current) => [...current, createBlock(type)])
  const removeBlock = (id) => setBlocks((current) => current.filter((block) => block.id !== id))

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(generatedSnippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#f6f4ef] pb-20 pt-28 text-[#191918]">
      <div className="mx-auto max-w-[92rem] px-6 sm:px-10 lg:px-14">
        <Link to="/hub" className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#191918]/55 transition hover:text-[#191918]">
          <ArrowLeft className="h-4 w-4" />
          Volver al Hub
        </Link>

        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="rounded-[28px] border border-black/10 bg-white p-8 shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ff4b0b]/20 bg-[#ff4b0b]/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">
              <Sparkles className="h-3.5 w-3.5" />
              Editor interno de blog
            </div>
            <h1 className="text-[clamp(2rem,4vw,3.4rem)] font-black uppercase leading-[0.92] tracking-[-0.03em] text-[#191918]">
              Creador de articulos<span className="text-[#ff4b0b]">.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#191918]/65 sm:text-base">
              Esta pagina es interna. Sirve para preparar articulos del blog con categoria real, portada, bloques y snippet listo para integracion.
            </p>
          </div>

          <div className="rounded-[28px] border border-dashed border-black/10 bg-[#111111] p-8 text-white shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
            <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[#ffd166]">
              Beta
            </div>
            <h2 className="text-xl font-black uppercase tracking-[0.08em]">Publicacion directa con APIs</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/68">
              Visible desde ya como siguiente fase. Aqui luego podra conectarse el envio directo a base de datos o publicacion automatica.
            </p>
            <button type="button" disabled className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
              <Rocket className="h-4 w-4" />
              En prueba
            </button>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
          <div className="space-y-8">
            <section className="rounded-[24px] border border-black/10 bg-white p-8">
              <h2 className="mb-6 text-sm font-black uppercase tracking-[0.16em] text-[#191918]">Metadatos</h2>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 text-xs font-bold uppercase tracking-[0.14em] text-[#191918]/60 md:col-span-2">
                  Titulo
                  <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[#faf8f2] px-4 py-3 text-sm font-semibold normal-case tracking-normal text-[#191918] outline-none transition focus:border-[#ff4b0b]/45" placeholder="Ejemplo: Como estructurar un sistema editorial con IA" />
                </label>

                <label className="space-y-2 text-xs font-bold uppercase tracking-[0.14em] text-[#191918]/60">
                  Slug
                  <input value={computedSlug} onChange={(event) => { setSlugTouched(true); setSlug(event.target.value) }} className="w-full rounded-2xl border border-black/10 bg-[#faf8f2] px-4 py-3 text-sm font-semibold normal-case tracking-normal text-[#191918] outline-none transition focus:border-[#ff4b0b]/45" placeholder="como-estructurar-sistema-editorial" />
                </label>

                <label className="space-y-2 text-xs font-bold uppercase tracking-[0.14em] text-[#191918]/60">
                  Categoria
                  <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[#faf8f2] px-4 py-3 text-sm font-semibold normal-case tracking-normal text-[#191918] outline-none transition focus:border-[#ff4b0b]/45">
                    {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>

                <label className="space-y-2 text-xs font-bold uppercase tracking-[0.14em] text-[#191918]/60">
                  Fecha
                  <input type="date" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[#faf8f2] px-4 py-3 text-sm font-semibold normal-case tracking-normal text-[#191918] outline-none transition focus:border-[#ff4b0b]/45" />
                </label>

                <label className="space-y-2 text-xs font-bold uppercase tracking-[0.14em] text-[#191918]/60">
                  Tiempo de lectura
                  <input value={readTime} onChange={(event) => setReadTime(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[#faf8f2] px-4 py-3 text-sm font-semibold normal-case tracking-normal text-[#191918] outline-none transition focus:border-[#ff4b0b]/45" placeholder="6 min" />
                </label>

                <label className="space-y-2 text-xs font-bold uppercase tracking-[0.14em] text-[#191918]/60">
                  Formato
                  <input value={formatLabel} onChange={(event) => setFormatLabel(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[#faf8f2] px-4 py-3 text-sm font-semibold normal-case tracking-normal text-[#191918] outline-none transition focus:border-[#ff4b0b]/45" placeholder="Guia, Tutorial, Analisis" />
                </label>

                <label className="space-y-2 text-xs font-bold uppercase tracking-[0.14em] text-[#191918]/60 md:col-span-2">
                  Portada
                  <input value={coverImage} onChange={(event) => setCoverImage(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[#faf8f2] px-4 py-3 text-sm font-semibold normal-case tracking-normal text-[#191918] outline-none transition focus:border-[#ff4b0b]/45" placeholder="https://..." />
                </label>

                <label className="space-y-2 text-xs font-bold uppercase tracking-[0.14em] text-[#191918]/60 md:col-span-2">
                  Extracto
                  <textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} rows={3} className="w-full rounded-2xl border border-black/10 bg-[#faf8f2] px-4 py-3 text-sm font-semibold normal-case tracking-normal text-[#191918] outline-none transition focus:border-[#ff4b0b]/45" placeholder="Resumen corto del articulo" />
                </label>

                <label className="space-y-2 text-xs font-bold uppercase tracking-[0.14em] text-[#191918]/60 md:col-span-2">
                  Keywords
                  <input value={keywords} onChange={(event) => setKeywords(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[#faf8f2] px-4 py-3 text-sm font-semibold normal-case tracking-normal text-[#191918] outline-none transition focus:border-[#ff4b0b]/45" placeholder="canva, notion, whatsapp" />
                </label>

                <label className="inline-flex items-center gap-3 rounded-2xl border border-black/10 bg-[#faf8f2] px-4 py-3 text-sm font-semibold text-[#191918] md:col-span-2">
                  <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} className="h-4 w-4 accent-[#ff4b0b]" />
                  Marcar como destacado
                </label>
              </div>
            </section>

            <section className="rounded-[24px] border border-black/10 bg-white p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[#191918]">Bloques de contenido</h2>
                <div className="flex flex-wrap gap-2">
                  {blockTypes.map((type) => (
                    <button key={type.value} type="button" onClick={() => addBlock(type.value)} className="inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#191918]/70 transition hover:border-[#ff4b0b]/35 hover:text-[#ff4b0b]">
                      <Plus className="h-3.5 w-3.5" />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                {blocks.map((block, index) => (
                  <div key={block.id} className="rounded-[22px] border border-black/10 bg-[#faf8f2] p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#191918]/55">Bloque {index + 1}</span>
                        <select value={block.type} onChange={(event) => updateBlock(block.id, 'type', event.target.value)} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#191918] outline-none">
                          {blockTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                      </div>
                      {blocks.length > 1 ? <button type="button" onClick={() => removeBlock(block.id)} className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.16em] text-rose-500 transition hover:text-rose-600"><Trash2 className="h-4 w-4" />Quitar</button> : null}
                    </div>

                    {block.type === 'list' ? (
                      <textarea value={block.itemsText} onChange={(event) => updateBlock(block.id, 'itemsText', event.target.value)} rows={5} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[#191918] outline-none transition focus:border-[#ff4b0b]/45" placeholder="Una linea por item" />
                    ) : block.type === 'image' ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <input value={block.src} onChange={(event) => updateBlock(block.id, 'src', event.target.value)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[#191918] outline-none transition focus:border-[#ff4b0b]/45 md:col-span-2" placeholder="URL de imagen" />
                        <input value={block.alt} onChange={(event) => updateBlock(block.id, 'alt', event.target.value)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[#191918] outline-none transition focus:border-[#ff4b0b]/45" placeholder="Alt" />
                        <input value={block.caption} onChange={(event) => updateBlock(block.id, 'caption', event.target.value)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[#191918] outline-none transition focus:border-[#ff4b0b]/45" placeholder="Caption" />
                      </div>
                    ) : block.type === 'link' ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <input value={block.href} onChange={(event) => updateBlock(block.id, 'href', event.target.value)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[#191918] outline-none transition focus:border-[#ff4b0b]/45" placeholder="https://..." />
                        <input value={block.label} onChange={(event) => updateBlock(block.id, 'label', event.target.value)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[#191918] outline-none transition focus:border-[#ff4b0b]/45" placeholder="Texto del enlace" />
                      </div>
                    ) : (
                      <textarea value={block.content} onChange={(event) => updateBlock(block.id, 'content', event.target.value)} rows={block.type === 'paragraph' ? 5 : 3} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[#191918] outline-none transition focus:border-[#ff4b0b]/45" placeholder={block.type === 'subheading' ? 'Subtitulo del bloque' : 'Contenido del bloque'} />
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-[24px] border border-black/10 bg-white p-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[#191918]">Snippet listo</h2>
                <button type="button" onClick={copySnippet} className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#191918]/70 transition hover:border-[#ff4b0b]/35 hover:text-[#ff4b0b]">
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <pre className="overflow-x-auto rounded-[22px] bg-[#111111] p-5 text-[12px] leading-relaxed text-[#f3f3f3]">
                <code>{generatedSnippet}</code>
              </pre>
            </section>

            <section className="rounded-[24px] border border-black/10 bg-white p-8">
              <div className="mb-5 flex items-center gap-2">
                <FileJson className="h-4 w-4 text-[#ff4b0b]" />
                <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[#191918]">Resumen estructural</h2>
              </div>
              <div className="space-y-3 text-sm text-[#191918]/70">
                <p><strong className="text-[#191918]">Slug:</strong> {articleObject.slug || '-'}</p>
                <p><strong className="text-[#191918]">Categoria:</strong> {categories.find((item) => item.value === articleObject.category)?.label}</p>
                <p><strong className="text-[#191918]">Destacado:</strong> {articleObject.featured ? 'Si' : 'No'}</p>
                <p><strong className="text-[#191918]">Bloques validos:</strong> {articleObject.blocks.length}</p>
                <p><strong className="text-[#191918]">Portada:</strong> {articleObject.coverImage || 'Pendiente'}</p>
              </div>
            </section>

            <section className="rounded-[24px] border border-black/10 bg-white p-8">
              <div className="mb-5 flex items-center gap-2">
                <Link2 className="h-4 w-4 text-[#ff4b0b]" />
                <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[#191918]">Autovinculado sugerido</h2>
              </div>
              {suggestions.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {suggestions.map((item, index) => (
                    <Link key={`${item.path}-${index}`} to={item.path} className="rounded-full border border-black/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#191918]/70 transition hover:border-[#ff4b0b]/35 hover:text-[#ff4b0b]">
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-[#191918]/60">Cuando detectemos palabras como Canva, Notion o WhatsApp aqui apareceran sugerencias internas para enlazar articulos, rutas o herramientas.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}