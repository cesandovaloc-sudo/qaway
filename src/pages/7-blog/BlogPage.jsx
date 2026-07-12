import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, BookOpen, Calendar, Clock, Cpu, Newspaper, Search, Sparkles, Target, TrendingUp } from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import { BLOG_CATEGORIES } from './0-shared/blog.data'
import {
  filterPosts,
  formatBlogDate,
  getCategoryBySlug,
  getFeaturedPosts,
  getSecondaryPosts,
  getSuggestionsByTerm,
  normalizeCategorySlug,
} from './0-shared/blog.utils'

const displayFont = {
  fontFamily: "'Oswald', sans-serif",
  fontStretch: 'condensed',
}

const categoryIcons = { Sparkles, BookOpen, TrendingUp, Target, Cpu }

export default function BlogPage() {
  const { category } = useParams()
  const [activeCategory, setActiveCategory] = useState(normalizeCategorySlug(category))
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setActiveCategory(normalizeCategorySlug(category))
  }, [category])

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const isSearchActive = normalizedSearch.length > 0

  const filteredArticles = useMemo(
    () => filterPosts({ category: activeCategory, query: normalizedSearch }),
    [activeCategory, normalizedSearch]
  )

  const categoryCounts = useMemo(
    () => Object.fromEntries(BLOG_CATEGORIES.map((item) => [item.slug, filterPosts({ category: item.slug }).length])),
    []
  )

  const activeCategoryObj = getCategoryBySlug(activeCategory)
  const highlightedArticles = getFeaturedPosts()
  const secondaryArticles = getSecondaryPosts()
  const suggestions = normalizedSearch.includes('canva') ? getSuggestionsByTerm('canva') : []

  const renderArticleCard = (article, idx) => (
    <Link to={`/blog/articulo/${article.slug}`} key={article.slug} className="block">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, delay: idx * 0.06 }}
        className="group flex h-full flex-col justify-between overflow-hidden rounded-[14px] border border-black/10 bg-white transition-all duration-500 hover:border-[#ff4b0b]/40 hover:shadow-[0_24px_60px_rgba(0,0,0,0.08)]"
      >
        <div>
          <div className="relative h-48 overflow-hidden bg-zinc-950">
            <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100" loading="lazy" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-[#191918] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white">{article.categoryLabel}</span>
              <span className="rounded-full border border-[#ff4b0b]/20 bg-[#ff4b0b]/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white">{article.formatLabel}</span>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-3 flex items-center gap-4 font-mono text-[10px] text-zinc-400">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-[#ff4b0b]" />{formatBlogDate(article.publishedAt)}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[#ff4b0b]" />{article.readTime}</span>
            </div>
            <h3 className="mb-2 text-base font-bold leading-tight text-[#191918] transition-colors group-hover:text-[#ff4b0b]">{article.title}</h3>
            <p className="line-clamp-3 text-xs leading-relaxed text-black/60">{article.excerpt}</p>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-xs font-bold text-[#191918] transition-colors group-hover:text-[#ff4b0b]">
            <span>Leer articulo completo</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </motion.article>
    </Link>
  )

  const categoryButtons = BLOG_CATEGORIES.map((item) => {
    const Icon = categoryIcons[item.icon] ?? Sparkles
    const isActive = activeCategory === item.slug
    return (
      <Link
        key={item.slug}
        to={item.path}
        className={`group flex min-w-[130px] flex-1 items-center justify-center gap-2 rounded-md border border-black/10 px-5 py-3 transition-all hover:border-[#ff4b0b]/40 hover:shadow-sm ${isActive ? 'bg-[#191918] text-[#ff4b0b]' : 'bg-white text-[#191918]'}`}
      >
        <Icon size={16} className={`transition-colors ${isActive ? 'text-[#ff4b0b]' : 'text-[#191918]/40 group-hover:text-[#ff4b0b]'}`} />
        <span className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? 'text-[#ff4b0b]' : 'text-[#191918]'}`}>{item.label}</span>
      </Link>
    )
  })

  return (
    <div className="min-h-screen bg-[#f2f1ef] selection:bg-[#ff4b0b] selection:text-white">
      <section className="relative overflow-hidden border-b border-black/10 bg-[#f5f5f4] pb-16 pt-28 text-[#191918] sm:pb-24 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.02]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[42%] bg-[#1a1918] md:w-[34%] lg:w-[28%]" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%)' }} />

        <div className="relative z-10 mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
          <div className="mb-6 text-[11px] font-bold uppercase tracking-widest text-[#ff4b0b]">/ Blog</div>
          <motion.h1 className="text-[clamp(3rem,6.5vw,5rem)] font-bold uppercase leading-[0.85] tracking-[-0.03em] text-[#191918]" style={displayFont} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Blog<span className="text-[#ff4b0b]">.</span>
          </motion.h1>
          <motion.p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[#191918]/70 sm:text-base" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            Explora ideas por <strong className="font-bold text-[#ff4b0b]">categorias reales</strong>, con destacados, portada y orden natural por fecha.
          </motion.p>

          <div className="mt-12 flex max-w-5xl flex-wrap items-center gap-3">
            <Link to="/blog" className={`group flex min-w-[110px] flex-1 items-center justify-center gap-2 rounded-md border border-black/10 px-5 py-3 transition-all hover:border-[#ff4b0b]/40 hover:shadow-sm ${activeCategory === null ? 'bg-[#191918] text-[#ff4b0b]' : 'bg-white text-[#191918]'}`}>
              <span className={`text-[11px] font-bold uppercase tracking-widest ${activeCategory === null ? 'text-[#ff4b0b]' : 'text-[#191918]'}`}>Todos</span>
            </Link>
            {categoryButtons}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]">
            <div>
              <label className="group flex items-center gap-3 rounded-md border border-black/10 bg-white/90 px-4 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.04)] transition-all focus-within:border-[#ff4b0b]/50 focus-within:shadow-[0_18px_44px_rgba(0,0,0,0.08)]">
                <Search className="h-4 w-4 text-[#191918]/40 transition-colors group-focus-within:text-[#ff4b0b]" />
                <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Buscar por tema, formato o palabra clave" className="w-full bg-transparent text-sm text-[#191918] outline-none placeholder:text-[#191918]/45" />
              </label>
              {suggestions.length > 0 ? (
                <div className="mt-3 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_16px_40px_rgba(0,0,0,0.04)]">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Sugerencias internas</p>
                  <div className="flex flex-wrap gap-2">{suggestions.map((article) => <Link key={article.slug} to={`/blog/articulo/${article.slug}`} className="rounded-full border border-black/10 px-3 py-1.5 text-[11px] font-semibold text-[#191918] transition hover:border-[#ff4b0b]/40 hover:text-[#ff4b0b]">{article.title}</Link>)}</div>
                </div>
              ) : null}
            </div>

            <div className="rounded-[18px] border border-dashed border-black/10 bg-white/70 p-5">
              <div className="mb-3 inline-flex items-center rounded-full border border-[#ff4b0b]/20 bg-[#ff4b0b]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Beta</div>
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-[#191918]">Publicacion directa</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#191918]/60">Visible desde ya. La publicacion directa con APIs queda marcada como en prueba mientras cerramos el flujo.</p>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#191918] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-black">Ver roadmap<ArrowRight className="h-3.5 w-3.5" /></a>
            </div>
          </div>
        </div>
      </section>      <section className="bg-[#f2f1ef] pb-12 pt-10 lg:pb-24 lg:pt-16">
        <div className="mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
          {activeCategory || isSearchActive ? (
            <>
              <div className="mb-8 flex flex-col justify-between gap-4 border-b border-black/10 pb-4 md:flex-row md:items-center">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40"><span className="h-1.5 w-1.5 rounded-full bg-[#ff4b0b]" />{activeCategoryObj ? activeCategoryObj.label : 'Resultados'}{isSearchActive ? <span className="text-black/35">/ busqueda</span> : null}</div>
                  <h2 className="text-2xl font-bold uppercase tracking-tight text-[#191918]" style={displayFont}>{activeCategoryObj ? activeCategoryObj.label : 'Resultados'}</h2>
                  <p className="mt-2 text-sm text-[#191918]/60">{activeCategoryObj ? activeCategoryObj.description : 'Explora coincidencias dentro del blog por palabra clave, categoria o formato.'}</p>
                </div>
                <Link to="/blog" className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#191918] transition-all duration-300 hover:bg-zinc-50"><Newspaper className="h-3.5 w-3.5" />Ver todo el blog</Link>
              </div>

              {filteredArticles.length > 0 ? (
                <>
                  <p className="mb-6 text-xs font-bold uppercase tracking-widest text-[#191918]/45">{filteredArticles.length} resultado{filteredArticles.length !== 1 ? 's' : ''}</p>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{filteredArticles.map((article, idx) => renderArticleCard(article, idx))}</div>
                </>
              ) : (
                <div className="rounded-xl border border-black/10 bg-white py-20 text-center"><Newspaper className="mx-auto mb-4 h-12 w-12 text-[#191918]/30" /><p className="text-sm font-bold uppercase tracking-wider text-[#191918]/60">No encontramos publicaciones con ese criterio.</p></div>
              )}
            </>
          ) : (
            <>
              <div className="mb-8 border-b border-black/10 pb-4"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40"><span className="h-1.5 w-1.5 rounded-full bg-[#ff4b0b]" />Destacados</div></div>
              <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">{highlightedArticles.map((article, idx) => renderArticleCard(article, idx))}</div>
              <div className="mb-8 border-b border-black/10 pb-4"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40"><span className="h-1.5 w-1.5 rounded-full bg-[#ff4b0b]" />Mas publicaciones</div></div>
              <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {BLOG_CATEGORIES.map((item) => (
                  <div key={item.slug} className="rounded-2xl border border-black/10 bg-white px-4 py-5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff4b0b]">{item.label}</p>
                    <p className="mt-2 text-xs text-[#191918]/60">{categoryCounts[item.slug]} publicacion{categoryCounts[item.slug] !== 1 ? 'es' : ''}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{secondaryArticles.map((article, idx) => renderArticleCard(article, idx))}</div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}