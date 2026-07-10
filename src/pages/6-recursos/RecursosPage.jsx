import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useParams, useLocation } from 'react-router-dom'
import {
  FileText, BookMarked, MessageSquare, ClipboardCheck,
  Terminal, ArrowRight, ArrowLeft, Star, TrendingUp, Sparkles, ChevronRight, Menu
} from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'

const categories = [
  { icon: FileText, title: 'Plantillas', key: 'plantillas', description: 'Materiales editables y organizados listos para estandarizar la operaciÃ³n de tu negocio.' },
  { icon: BookMarked, title: 'Ebooks', key: 'ebooks', description: 'Experiencias de lectura digital, descargables y conectadas con tu ecosistema de recursos.' },
  { icon: MessageSquare, title: 'Prompts', key: 'prompts', description: 'Instrucciones avanzadas para procesos creativos y operativos con Inteligencia Artificial.' },
  { icon: ClipboardCheck, title: 'Checklists', key: 'checklists', description: 'Listas de control tÃ¡cticas para ejecutar lanzamientos y flujos de trabajo sin fallas.' },
  { icon: Terminal, title: 'Scripts', key: 'scripts', description: 'Pasos de configuraciÃ³n tÃ©cnica para workflows de automatizaciÃ³n e integraciones IA.' },
]

const resources = [
  {
    id: 'google-calendar-dominado',
    category: 'ebooks',
    categoryLabel: 'Ebooks',
    title: 'Google Calendar Dominado',
    description: 'Nuestra guÃ­a completa y plantilla para integrar Inteligencia Artificial en tu agenda diaria y automatizar flujos semanales.',
    type: 'Ebook Digital Interactivo',
    badge: 'Gratis',
    path: '/recursos/ebooks/google-calendar-dominado',
    image: '/recursos/qaway-calendar.png'
  },
  {
    id: 'notion-manual-sops',
    category: 'plantillas',
    categoryLabel: 'Plantillas',
    title: 'Plantilla Notion: Manual de SOPs',
    description: 'Estructura lista para documentar procesos y automatizaciones de tu negocio, facilitando la delegaciÃ³n sin fricciones.',
    type: 'Plantilla Notion',
    badge: 'Premium',
    path: '/recursos/plantillas/notion-manual-sops',
    image: '/recursos/notion-sop.png'
  },
  {
    id: 'sheets-calculadora-leads',
    category: 'plantillas',
    categoryLabel: 'Plantillas',
    title: 'Plantilla Google Sheets: Calculadora de ROI',
    description: 'Calcula el retorno de inversiÃ³n de tus campaÃ±as publicitarias y proyecta el costo de adquisiciÃ³n de leads de forma sencilla.',
    type: 'Google Sheets',
    badge: 'Gratis',
    path: '/recursos/plantillas/sheets-calculadora-leads',
    image: '/recursos/qaway-calculadora-roi.png'
  },
  {
    id: 'prompt-generador-copys',
    category: 'prompts',
    categoryLabel: 'Prompts',
    title: 'Mega-Prompt: Generador de Copys de Venta',
    description: 'InstrucciÃ³n avanzada estructurada bajo tÃ©cnicas de copywriting (AIDA) para redactar correos y landing pages altamente persuasivas.',
    type: 'Prompt Claude/ChatGPT',
    badge: 'Gratis',
    path: '/recursos/prompts/prompt-generador-copys',
    image: '/recursos/qaway-prompt-copys.png'
  },
  {
    id: 'prompt-calibracion-soporte',
    category: 'prompts',
    categoryLabel: 'Prompts',
    title: 'Prompt: Asistente IA de AtenciÃ³n al Cliente',
    description: 'Prompt de sistema para entrenar a tus agentes IA de WhatsApp, asegurando respuestas seguras y alineadas al tono del negocio.',
    type: 'Prompt System',
    badge: 'Gratis',
    path: '/recursos/prompts/prompt-calibracion-soporte',
    image: '/recursos/qaway-prompt-ia.png'
  },
  {
    id: 'checklist-campana-ads',
    category: 'checklists',
    categoryLabel: 'Checklists',
    title: 'Checklist: ConfiguraciÃ³n de CampaÃ±a Meta Ads',
    description: 'Lista de verificaciÃ³n obligatoria antes de encender tus anuncios. Evita errores de pÃ­xel, presupuestos y segmentaciones.',
    type: 'PDF / Checklist',
    badge: 'Gratis',
    path: '/recursos/checklists/checklist-campana-ads',
    image: '/recursos/qaway-checklist-ads.png'
  },
  {
    id: 'checklist-auditoria-seguridad',
    category: 'checklists',
    categoryLabel: 'Checklists',
    title: 'Checklist: Seguridad en Sitios Web y APIs',
    description: 'Puntos clave para proteger tu hosting, base de datos de Supabase y tokens de Web3Forms de accesos maliciosos.',
    type: 'PDF / Checklist',
    badge: 'Gratis',
    path: '/recursos/checklists/checklist-auditoria-seguridad',
    image: '/recursos/qaway-checklist-seguridad.png'
  },
  {
    id: 'script-whatsapp-notion',
    category: 'scripts',
    categoryLabel: 'Scripts',
    title: 'Script Node.js: WhatsApp a Notion CRM',
    description: 'CÃ³digo de servidor listo para recibir webhooks de Meta y volcar los contactos y mensajes entrantes a un tablero de Notion.',
    type: 'CÃ³digo JavaScript',
    badge: 'Premium',
    path: '/recursos/scripts/script-whatsapp-notion',
    image: '/recursos/qaway-script-whatsapp.png'
  },
  {
    id: 'script-sheets-backup',
    category: 'scripts',
    categoryLabel: 'Scripts',
    title: 'Google Apps Script: Backup Diario AutomÃ¡tico',
    description: 'CÃ³digo sencillo de automatizaciÃ³n para respaldar todas sus hojas de cÃ¡lculo clave en Google Drive en formato CSV diariamente.',
    type: 'Apps Script',
    badge: 'Gratis',
    path: '/recursos/scripts/script-sheets-backup',
    image: '/recursos/qaway-script-backup.png'
  }
]

const displayFont = {
  fontFamily: "'Oswald', sans-serif",
  fontStretch: 'condensed',
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const pathname = location.pathname

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const links = [
    ['Estudio', '/estudio'],
    ['Sistemas digitales', '/sistemas-digitales'],
    ['Academy', '/academy'],
    ['Recursos', '/recursos'],
    ['Blog', '/blog'],
  ]

  return (
    <header className={`fixed inset-x-0 top-0 z-30 h-20 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-black/5' 
        : 'bg-transparent'
    }`}>
      <div className="mx-auto flex h-full max-w-[96rem] items-center justify-between px-6 sm:px-10 lg:px-14">
        <Link to="/" className="text-xl font-semibold tracking-[-0.055em] text-[#191918]">
          Qaway <span className="text-[#ff4b0b]">Lab</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex xl:gap-10">
          {links.map(([label, href]) => {
            const isActive = pathname === href || 
              (href === '/recursos' && pathname.startsWith('/recursos')) ||
              (href === '/blog' && pathname.startsWith('/blog'))
            return (
              <Link
                key={label}
                to={href}
                className={`relative py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  isActive
                    ? 'text-[#191918] after:absolute after:inset-x-0 after:-bottom-[2px] after:h-[3px] after:bg-[#ff4b0b]'
                    : 'text-[#191918]/60 hover:text-[#191918]'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-md bg-[#ff4b0b] px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#dc3d00] active:translate-y-px sm:inline-flex"
        >
          CuÃ©ntanos tu proyecto
        </a>

        <button
          type="button"
          aria-label={menuOpen ? 'Cerrar navegaciÃ³n' : 'Abrir navegaciÃ³n'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
          className="text-[#191918] sm:hidden"
        >
          <Menu size={22} />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border-b border-black/10 bg-[#f5f5f4] px-6 py-5 sm:hidden"
          >
            <div className="flex flex-col">
              {links.map(([label, href]) => {
                const isActive = pathname === href || 
                  (href === '/recursos' && pathname.startsWith('/recursos')) ||
                  (href === '/blog' && pathname.startsWith('/blog'))
                return (
                  <Link
                    key={label}
                    to={href}
                    onClick={() => setMenuOpen(false)}
                    className={`border-b border-black/5 py-3 text-sm font-semibold transition-colors ${
                      isActive ? 'text-[#ff4b0b]' : 'text-[#191918]/70 hover:text-black'
                    } last:border-b-0`}
                  >
                    {label}
                  </Link>
                )
              })}
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex justify-center rounded-md bg-[#ff4b0b] px-5 py-3 text-sm font-semibold text-white"
              >
                CuÃ©ntanos tu proyecto
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

export default function RecursosPage() {
  const { category } = useParams()
  const [activeCategory, setActiveCategory] = useState(category || null)

  useEffect(() => {
    setActiveCategory(category || null)
  }, [category])

  const filteredResources = activeCategory
    ? resources.filter(res => res.category === activeCategory)
    : resources

  const categoriesWithCounts = categories.map(cat => {
    const count = resources.filter(res => res.category === cat.key).length
    return { ...cat, count: `${count} recurso${count !== 1 ? 's' : ''}` }
  })

  const activeCategoryObj = categoriesWithCounts.find(cat => cat.key === activeCategory)
  const categoryTitle = activeCategoryObj ? activeCategoryObj.title : 'CategorÃ­a'

  const featured = [
    resources.find(r => r.id === 'notion-manual-sops'),
    resources.find(r => r.id === 'sheets-calculadora-leads'),
  ]

  const highlighted = resources.filter(r =>
    ['prompt-generador-copys', 'prompt-calibracion-soporte', 'checklist-campana-ads', 'script-whatsapp-notion'].includes(r.id)
  )

  const newResources = resources.filter(r =>
    ['script-sheets-backup', 'checklist-auditoria-seguridad', 'google-calendar-dominado', 'sheets-calculadora-leads'].includes(r.id)
  )

  const GalleryCard = ({ res, idx }) => {
    const isExternal = res.path.startsWith('http')
    const CardWrapper = isExternal ? 'a' : Link
    const wrapperProps = isExternal
      ? { href: res.path, target: '_blank', rel: 'noopener noreferrer' }
      : { to: res.path }

    return (
      <CardWrapper {...wrapperProps} className="group flex flex-col justify-between overflow-hidden rounded-md border border-black/10 bg-white transition-all hover:border-[#ff4b0b]/40 hover:shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: idx * 0.07 }}
          className="flex h-full flex-col"
        >
          <div className="relative w-full overflow-hidden bg-[#f2f1ef] pt-[65%]">
            <img 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
              src={res.image} 
              alt={res.title} 
              loading="lazy" 
            />
          </div>
          <div className="flex flex-1 flex-col items-start justify-between p-5">
            <p className="text-sm font-bold leading-snug text-[#191918]">{res.title}</p>
            <span className={`mt-3 inline-block rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
              res.badge === 'Premium' ? 'bg-[#ff4b0b]/10 text-[#ff4b0b]' : 'bg-[#191918]/5 text-[#191918]'
            }`}>
              {res.badge}
            </span>
          </div>
        </motion.div>
      </CardWrapper>
    )
  }

  const ListCard = ({ res, idx }) => {
    const isExternal = res.path.startsWith('http')
    const CardWrapper = isExternal ? 'a' : Link
    const wrapperProps = isExternal
      ? { href: res.path, target: '_blank', rel: 'noopener noreferrer' }
      : { to: res.path }
    const catObj = categories.find(c => c.key === res.category)
    const Icon = catObj ? catObj.icon : FileText

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: idx * 0.05 }}
      >
        <CardWrapper {...wrapperProps} className="group mb-3 flex items-center justify-between gap-6 rounded-md border border-black/10 bg-white p-5 transition-all hover:border-[#ff4b0b]/40 hover:shadow-lg">
          <div className="flex flex-1 items-center gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-black/10 bg-[#f2f1ef] text-black/60 transition-colors group-hover:border-[#ff4b0b]/30 group-hover:bg-[#ff4b0b]/10 group-hover:text-[#ff4b0b]">
              <Icon size={20} />
            </div>
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="rounded-md bg-[#191918]/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#191918]/70">
                  {res.categoryLabel}
                </span>
                <span className="rounded-md bg-[#ff4b0b]/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-[#ff4b0b]">
                  {res.type}
                </span>
              </div>
              <p className="text-[15px] font-bold leading-snug text-[#191918]">{res.title}</p>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-black/60">{res.description}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-md bg-[#191918] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors group-hover:bg-[#ff4b0b]">
            <span>Abrir</span>
            <ArrowRight size={14} />
          </div>
        </CardWrapper>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f2f1ef] selection:bg-[#ff4b0b] selection:text-white">
      
      <section className="relative overflow-hidden bg-[#f5f5f4] pt-28 pb-16 text-[#191918] sm:pt-36 sm:pb-24 border-b border-black/10">
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#f5f5f4]">
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.7),transparent_70%)]" />
          <div 
            className="absolute right-0 top-0 bottom-0 w-[42%] md:w-[34%] lg:w-[28%] bg-[#1a1918] transition-all duration-300 shadow-2xl"
            style={{
              clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%)'
            }}
          >
            <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:55px_75px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,0,0,0.5),transparent_70%)]" />
            <div className="absolute inset-0 bg-gradient-to-l from-black/30 via-transparent to-transparent" />
            <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
          </div>
        </div>
        <Header />
        <div className="relative z-10 mx-auto max-w-[94rem] px-6 text-left sm:px-10 lg:px-14">
          <div className="min-h-[190px] sm:h-[220px]">
            <div className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#ff4b0b]">
              <span>/ Recursos</span>
            </div>
            <motion.h1
              className="text-[clamp(3rem,6.5vw,5rem)] font-bold uppercase leading-[0.85] tracking-[-0.03em] text-[#191918]"
              style={displayFont}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Recursos<span className="text-[#ff4b0b]">.</span>
            </motion.h1>
            <motion.p
              className="mt-6 max-w-xl text-[15px] sm:text-base leading-relaxed text-[#191918]/70"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Explora herramientas, plantillas, ebooks y recursos prácticos sobre IA, sistemas y productividad aplicada.
            </motion.p>
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-3 max-w-4xl relative">
            <Link
              to="/recursos"
              className={`group flex flex-1 items-center justify-center min-w-[110px] gap-2 rounded-md border border-black/10 px-5 py-3 transition-all hover:border-[#ff4b0b]/40 hover:shadow-sm ${
                activeCategory === null ? 'bg-[#191918] text-[#ff4b0b]' : 'bg-white text-[#191918]'
              }`}
            >
              <span className={`text-[11px] font-bold uppercase tracking-widest ${activeCategory === null ? 'text-[#ff4b0b]' : 'text-[#191918]'}`}>Todos</span>
            </Link>
            {categories.map((cat, i) => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.key
              return (
                <Link
                  key={i}
                  to={`/recursos/${cat.key}`}
                  className={`group flex flex-1 items-center justify-center min-w-[130px] gap-2 rounded-md border border-black/10 px-5 py-3 transition-all hover:border-[#ff4b0b]/40 hover:shadow-sm ${
                    isActive ? 'bg-[#191918] text-[#ff4b0b]' : 'bg-white text-[#191918]'
                  }`}
                >
                  <Icon size={16} className={`transition-colors ${isActive ? 'text-[#ff4b0b]' : 'text-[#191918]/40 group-hover:text-[#ff4b0b]'}`} />
                  <span className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? 'text-[#ff4b0b]' : 'text-[#191918]'}`}>{cat.title}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
      <section className="pb-12 pt-10 lg:pb-24 lg:pt-16">
        <div className="mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
          {!activeCategory ? (
            /* â”€â”€ VIEW: NO FILTER SELECTED â”€â”€ */
            <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="mb-14 grid gap-6 md:grid-cols-2">
                <Link to={featured[0]?.path || '#'} className="block">
                  <motion.div
                    className="group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-2xl p-10 transition-all cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 40%, #c4b5fd 100%)' }}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55 }}
                    whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(139,92,246,0.15)' }}
                  >
                    <img 
                      src={featured[0]?.image} 
                      alt="" 
                      className="absolute -right-2 top-1/2 w-[52%] max-w-[320px] -translate-y-1/2 rotate-3 rounded-xl object-cover shadow-2xl transition-transform duration-500 group-hover:-translate-y-1/2 group-hover:rotate-0 group-hover:scale-105" 
                    />
                    <div className="relative z-10 w-[60%]">
                      <span className="mb-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest" style={{ background: 'rgba(124,58,237,0.15)', color: '#5b21b6' }}>
                        <TrendingUp size={12} strokeWidth={3} /> MÃ¡s Descargada
                      </span>
                      <p className="mb-1 text-[13px] font-medium" style={{ color: '#6d28d9' }}>{featured[0]?.type}</p>
                      <h3 className="text-[clamp(1.4rem,3vw,1.8rem)] font-bold leading-[1.15]" style={{ color: '#3b0764' }}>
                        {featured[0]?.title}
                      </h3>
                    </div>
                  </motion.div>
                </Link>
                <Link to={featured[1]?.path || '#'} className="block">
                  <motion.div
                    className="group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-2xl p-10 transition-all cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 40%, #80deea 100%)' }}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55 }}
                    whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(6,182,212,0.15)' }}
                  >
                    <img 
                      src={featured[1]?.image} 
                      alt="" 
                      className="absolute -right-2 top-1/2 w-[52%] max-w-[320px] -translate-y-1/2 rotate-3 rounded-xl object-cover shadow-2xl transition-transform duration-500 group-hover:-translate-y-1/2 group-hover:rotate-0 group-hover:scale-105" 
                    />
                    <div className="relative z-10 w-[60%]">
                      <span className="mb-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest" style={{ background: 'rgba(14,116,144,0.15)', color: '#155e75' }}>
                        <Star size={12} strokeWidth={3} /> SÃºper Destacada
                      </span>
                      <p className="mb-1 text-[13px] font-medium" style={{ color: '#0e7490' }}>{featured[1]?.type}</p>
                      <h3 className="text-[clamp(1.4rem,3vw,1.8rem)] font-bold leading-[1.15]" style={{ color: '#064e3b' }}>
                        {featured[1]?.title}
                      </h3>
                    </div>
                  </motion.div>
                </Link>
              </div>
              <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
                <h2 className="text-2xl font-bold uppercase tracking-tight text-[#191918]" style={displayFont}>Para empezar</h2>
                <Link to="/recursos/prompts" className="flex items-center gap-2 text-sm font-bold text-[#191918]/60 transition-colors hover:text-[#ff4b0b]">
                  Ver mÃ¡s <ArrowRight size={16} />
                </Link>
              </div>
              <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {highlighted.map((res, idx) => (
                  <GalleryCard key={idx} res={res} idx={idx} />
                ))}
              </div>
              <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
                <h2 className="text-2xl font-bold uppercase tracking-tight text-[#191918]" style={displayFont}>ReciÃ©n agregados</h2>
              </div>
              <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {newResources.map((res, idx) => (
                  <GalleryCard key={idx} res={res} idx={idx} />
                ))}
              </div>
            </motion.div>
          ) : (
            /* â”€â”€ VIEW: FILTERED RESULTS â”€â”€ */
            <motion.div key="filtered" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-6">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#191918]/50">
                    <span>Recursos</span> <ChevronRight size={12} /> <span>{activeCategoryObj?.title}</span>
                  </div>
                  <h2 className="text-4xl font-bold uppercase tracking-tight text-[#191918]" style={displayFont}>
                    {activeCategoryObj?.title} <span className="text-[#ff4b0b]">.</span>
                  </h2>
                  <p className="mt-2 text-sm text-[#191918]/60">{activeCategoryObj?.description}</p>
                </div>
                <Link to="/recursos" className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#191918] transition-all hover:bg-black/5">
                  <ArrowLeft size={14} /> Volver a todos
                </Link>
              </div>
              {filteredResources.length > 0 ? (
                <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredResources.map((res, idx) => (
                    <GalleryCard key={idx} res={res} idx={idx} />
                  ))}
                </div>
              ) : (
                <div className="mb-16 rounded-md border border-dashed border-black/20 py-24 text-center">
                  <p className="text-[#191918]/50 font-bold uppercase tracking-widest text-sm">No hay recursos en esta categorÃ­a todavÃ­a.</p>
                </div>
              )}
            </motion.div>
          )}
          <div className="flex flex-wrap items-center gap-10 rounded-md border border-[#ff4b0b]/20 bg-[#ff4b0b]/5 px-10 py-12">
            <div className="flex-1 min-w-[300px]">
              <h2 className="mb-3 text-[clamp(1.4rem,3vw,2rem)] font-bold uppercase leading-tight tracking-tight text-[#ff4b0b]" style={{ ...displayFont }}>
                Acelera con Qaway Academy
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-[#191918]/70">
                Aprende a integrar herramientas de automatizaciÃ³n, IA y marketing en flujos reales. Menos teorÃ­a suelta, mÃ¡s capacidad instalada.
              </p>
              <Link to="/academy" className="inline-flex items-center gap-2 rounded-md bg-[#ff4b0b] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#dc3d00]">
                Explorar Programas <ArrowRight size={16} />
              </Link>
            </div>
            <img src="/assets/pages/9-pruebas/academy/curso-productividad-ia.png" alt="Academy" className="w-[320px] max-w-full rounded-md object-contain" />
          </div>
        </div>
      </section>
    </div>
  )
}
