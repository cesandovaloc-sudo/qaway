import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  Layers3,
  MessageCircle,
  Play,
  Quote,
  Send,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import { supabase } from '@/config/supabase'
import { featuredCourses, courseCatalog } from '@/data/academyCourses'
import './academy.css'

const heroImage = '/assets/pages/4-academy/academy-hero-educator.png'



const courseTopics = ['Todos', 'Inteligencia artificial', 'Productividad', 'Marketing', 'Diseño', 'Automatización']

const testimonials = [
  {
    quote: 'No sentí que estaba aprendiendo a usar un programa. Terminé con un sistema claro para coordinar mis proyectos y presupuestos que ya uso todos los días con mis clientes.',
    name: 'Mariana Torres',
    role: 'Arquitecta',
    city: 'Lima',
    portrait: '/assets/pages/4-academy/testimonials/mariana.png',
    accent: '#f0672f',
    tint: 'rgba(240, 103, 47, 0.16)',
  },
  {
    quote: 'El enfoque fue muy práctico. Pude ordenar el flujo de pedidos por WhatsApp y atender a mis proveedores sin estar pegada al celular las 24 horas.',
    name: 'Lucía Rojas',
    role: 'Administradora de tienda',
    city: 'Arequipa',
    portrait: '/assets/pages/4-academy/testimonials/lucia.png',
    accent: '#df5a2a',
    tint: 'rgba(223, 90, 42, 0.16)',
  },
  {
    quote: 'Las clases explican el porqué antes de ir al paso a paso. Eso me dio la confianza necesaria para adaptar lo que aprendí a mis propios proyectos y para mis clientes.',
    name: 'Diego Salvatierra',
    role: 'Freelance',
    city: 'Cusco',
    portrait: '/assets/pages/4-academy/testimonials/diego.png',
    accent: '#c77427',
    tint: 'rgba(199, 116, 39, 0.16)',
  },
  {
    quote: 'Aprendí a convertir el caos de las reservas y seguimientos de pacientes en algo ordenado. Ahora tengo un proceso que me da muchísima más tranquilidad.',
    name: 'Paola Vargas',
    role: 'Psicóloga',
    city: 'Bogotá',
    portrait: '/assets/pages/4-academy/testimonials/paola.png',
    accent: '#b96a35',
    tint: 'rgba(185, 106, 53, 0.16)',
  },
  {
    quote: 'Me gustó que todo aterriza en problemas del día a día. No sentí teoría aburrida, sentí acompañamiento y me llevé herramientas que empecé a aplicar desde la primera semana.',
    name: 'Renzo Medina',
    role: 'Asesor contable',
    city: 'Trujillo',
    portrait: '/assets/pages/4-academy/testimonials/renzo.png',
    accent: '#92552f',
    tint: 'rgba(146, 85, 47, 0.18)',
  },
]

const learningPaths = [
  {
    icon: BriefcaseBusiness,
    title: 'Profesionales',
    text: 'Mejora tu trabajo, tu criterio y tu capacidad de ejecución.',
  },
  {
    icon: Layers3,
    title: 'Negocios',
    text: 'Ordena procesos, comunicación y herramientas para avanzar.',
  },
  {
    icon: Sparkles,
    title: 'Creadores',
    text: 'Convierte ideas en contenido, productos y una presencia consistente.',
  },
]

const displayFont = {
  fontFamily: "'Arial Narrow', 'Roboto Condensed', 'Helvetica Neue Condensed', Impact, sans-serif",
  fontStretch: 'condensed',
}

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
}

const copyStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: .11 } },
}

const copyItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: .65, ease: [0.22, 1, 0.36, 1] } },
}

function MagneticLink({ children, className = '', ...props }) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 20 })
  const springY = useSpring(y, { stiffness: 260, damping: 20 })

  function move(event) {
    if (reduceMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((event.clientX - rect.left - rect.width / 2) * 0.16)
    y.set((event.clientY - rect.top - rect.height / 2) * 0.16)
  }

  function reset() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      ref={ref}
      style={{ x: springX, y: springY }}
      onPointerMove={move}
      onPointerLeave={reset}
      className={className}
      {...props}
    >
      {children}
    </motion.a>
  )
}

function SpotlightCard({ children, className = '' }) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const mouseX = useMotionValue(50)
  const mouseY = useMotionValue(50)
  const rotateX = useSpring(useTransform(mouseY, [0, 100], [2.5, -2.5]), {
    stiffness: 180,
    damping: 22,
  })
  const rotateY = useSpring(useTransform(mouseX, [0, 100], [-2.5, 2.5]), {
    stiffness: 180,
    damping: 22,
  })

  function move(event) {
    if (reduceMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mouseX.set(((event.clientX - rect.left) / rect.width) * 100)
    mouseY.set(((event.clientY - rect.top) / rect.height) * 100)
    ref.current.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`)
    ref.current.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`)
  }

  function reset() {
    mouseX.set(50)
    mouseY.set(50)
  }

  return (
    <motion.article
      ref={ref}
      onPointerMove={move}
      onPointerLeave={reset}
      style={reduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 1000 }}
      className={`academy-spotlight ${className}`}
    >
      {children}
    </motion.article>
  )
}

function CourseCard({ course, compact = false }) {
  return (
    <article className={`academy-course-card ${compact ? 'is-compact' : ''}`}>
      <div className="academy-course-image">
        <img src={course.image} alt="" loading="lazy" decoding="async" />
        {course.featured && <span>{course.featured}</span>}
      </div>
      <div className="academy-course-content">
        <p>{course.category}</p>
        <h3>{course.title}</h3>
        <div className="academy-course-description">{course.text}</div>
        <div className="academy-course-meta">
          <span>{course.format}</span>
          <span><Clock3 size={13} /> {course.duration}</span>
        </div>
        <a
          href={course.href}
          target={course.external ? '_blank' : undefined}
          rel={course.external ? 'noopener noreferrer' : undefined}
        >
          Ver contenido
          <ArrowRight size={16} />
        </a>
      </div>
    </article>
  )
}

function getTestimonialPosition(index, activeIndex, total) {
  const raw = (index - activeIndex + total) % total
  if (raw === 0) return 0
  if (raw <= Math.floor(total / 2)) return raw
  return raw - total
}

function leadEmailHtml(lead) {
  const date = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const rows = [
    { label: 'Nombre', value: lead.name },
    { label: 'Teléfono', value: lead.phone },
    { label: 'Correo', value: lead.email },
    { label: 'Perfil', value: lead.profile },
    { label: 'Interés', value: lead.interest },
    { label: 'Mensaje', value: lead.message || 'Sin mensaje adicional' },
  ].map((f) =>
    `<tr><td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#666;font-size:13px;vertical-align:top;white-space:nowrap;width:1%;font-weight:500">${f.label}</td><td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#111;font-size:14px;vertical-align:top">${f.value}</td></tr>`
  ).join('')

  return [
    '<table cellpadding="0" cellspacing="0" style="width:100%;background:#f7f6f3;padding:48px 16px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif">',
    '<tr><td align="center">',
    '<table cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06)">',
    '<tr><td style="background:#0d0e0d;padding:32px 36px 28px">',
    '<table cellpadding="0" cellspacing="0" style="width:100%">',
    '<tr><td style="font-size:20px;font-weight:700;color:#fff;letter-spacing:-.02em">Qaway<span style="color:rgba(255,255,255,.3)"> Lab</span></td>',
    `<td align="right" style="font-size:10px;color:#ff4b0b;text-transform:uppercase;letter-spacing:.15em;font-weight:600">Nuevo contacto</td></tr>`,
    '</table></td></tr>',
    '<tr><td style="padding:32px 36px 8px">',
    '<h2 style="margin:0 0 2px;font-size:17px;color:#0d0e0d;font-weight:700;letter-spacing:-.02em">Nueva consulta web</h2>',
    `<p style="margin:0 0 24px;font-size:12px;color:#999">${date}</p>`,
    '<table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #eee;border-radius:8px;overflow:hidden">',
    rows,
    '</table></td></tr>',
    '<tr><td style="padding:24px 36px 28px;border-top:1px solid #f0f0f0;color:#bbb;font-size:11px;text-align:center">',
    'Qaway Lab &mdash; Sistema de gesti&oacute;n de leads</td></tr>',
    '</table></td></tr></table>',
  ].join('')
}

export default function AcademyPage() {
  const reduceMotion = useReducedMotion()
  const carouselRef = useRef(null)
  const [activeTopic, setActiveTopic] = useState('Todos')
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const visibleCourses = activeTopic === 'Todos'
    ? courseCatalog
    : courseCatalog.filter((course) => course.category === activeTopic)

  // Auto-rotate testimonials
  useEffect(() => {
    if (reduceMotion) return undefined

    const timer = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length)
    }, 5600)

    return () => window.clearInterval(timer)
  }, [reduceMotion])

  // Auto-scroll course carousel
  useEffect(() => {
    if (reduceMotion) return undefined
    const el = carouselRef.current
    if (!el) return undefined

    const timer = window.setInterval(() => {
      const cardWidth = Math.min(el.clientWidth * 0.78, 520)
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' })
      }
    }, 4000)

    return () => window.clearInterval(timer)
  }, [reduceMotion, visibleCourses])

  function moveTestimonials(direction) {
    setActiveTestimonial((current) => (
      (current + direction + testimonials.length) % testimonials.length
    ))
  }

  function moveCarousel(direction) {
    carouselRef.current?.scrollBy({
      left: direction * Math.min(carouselRef.current.clientWidth * 0.78, 520),
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  async function submitInterest(event) {
    event.preventDefault()
    setSubmitting(true)
    setSubmitError('')

    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const lead = {
      name: String(form.get('name') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      email: String(form.get('email') || '').trim().toLowerCase(),
      profile: String(form.get('profile') || '').trim(),
      interest: String(form.get('interest') || '').trim(),
      message: String(form.get('message') || '').trim(),
    }

    try {
      const { error } = await supabase.from('leads').insert([{
        client_name: lead.name,
        contact_info: lead.phone,
        source: 'Academy',
        stage: 'new',
        metadata: {
          email: lead.email,
          profile: lead.profile,
          interest: lead.interest,
          message: lead.message || 'Sin mensaje adicional',
        },
      }])
      if (error) throw error

      const academyKey = import.meta.env.VITE_WEB3FORMS_VENTAS_KEY || ''
      if (academyKey.trim()) {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            access_key: academyKey.trim(),
            subject: `Nueva consulta Web: ${lead.interest || 'Orientación'}`,
            from_name: 'Qaway Lab Academy',
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            profile: lead.profile,
            interest: lead.interest,
            message: lead.message || 'Sin mensaje adicional',
            html: leadEmailHtml(lead),
          }),
        })
      }

      const backupKey = import.meta.env.VITE_WEB3FORMS_BACKUP_KEY || ''
      if (backupKey.trim()) {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: backupKey.trim(),
            subject: `[Copia] Nueva consulta Web: ${lead.interest || 'Orientación'}`,
            from_name: 'Qaway Lab Web',
            to_email: 'qaway.myc@gmail.com',
            html: leadEmailHtml(lead),
          }),
        })
      }

      setSubmitted(true)
      formElement.reset()
    } catch (error) {
      console.error('Error al enviar consulta de Academy:', error)
      setSubmitError(error.message || 'No pudimos enviar tu consulta. Inténtalo nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="academy-page">
      <section className="academy-hero">
        <div className="relative mx-auto grid min-h-[100dvh] w-full max-w-[96rem] lg:grid-cols-[1.13fr_0.86fr_0.58fr]">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
            className="academy-hero-copy"
          >
            <p className="academy-eyebrow">Academy <span>IA aplicada</span> Aprendizaje práctico</p>
            <h1 style={displayFont} className="qw-hero-title">
              Aprende a crear
              <span>sistemas, contenido</span>
              <span>y <b>soluciones con IA</b></span>
            </h1>
            <p className="academy-hero-intro">
              Formación práctica para aplicar IA con criterio, estructura y resultados reales.
            </p>

            <div className="academy-hero-actions">
              <a href="#programas" className="academy-primary-button">
                Ver programas
                <ArrowRight size={17} />
              </a>
              <a href="#metodo" className="academy-text-link">
                Conocer Academy
                <ArrowRight size={16} />
              </a>
            </div>


          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 1.025 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="academy-hero-portrait max-h-[50vh] overflow-hidden lg:max-h-none"
          >
            <span className="academy-frame-corner academy-frame-corner-top" />
            <span className="academy-frame-corner academy-frame-corner-bottom" />
            <img
              src={heroImage}
              alt="Educadora especializada en inteligencia artificial aplicada"
              fetchPriority="high"
              decoding="async"
            />
            <div className="academy-portrait-glow" />
          </motion.div>

          <motion.aside
            initial={reduceMotion ? false : { opacity: 0, x: 26 }}
            animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            transition={{ delay: 0.18, duration: 0.78 }}
            className="academy-hero-panel hidden lg:flex"
          >
            <p className="qw-panel-kicker">Academy</p>
            <h4 className="text-[#20201f] text-balance" style={{ ...displayFont, fontWeight: 760 }}>
              Formación para avanzar con <span className="academy-title-emphasis">claridad</span><span className="academy-title-punct">.</span>
            </h4>
            <div className="academy-small-rule" />


          </motion.aside>
        </div>
      </section>

      <section id="programas" className="academy-section academy-programs">
        <motion.div
          className="vl-branding__copy mx-auto max-w-[92rem] w-full"
          variants={copyStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: .22 }}
        >
          <div>
            <motion.p variants={copyItem} className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">
              Cursos destacados
            </motion.p>
            <motion.h2
              variants={copyItem}
              className="text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em]"
              style={{ ...displayFont, fontWeight: 760 }}
            >
              Empieza por una <span className="text-[#ff4b0b]">habilidad concreta.</span>
            </motion.h2>
            <motion.p variants={copyItem} className="mt-4 max-w-xl text-[clamp(0.94rem,1.05vw,1.06rem)] leading-[1.5] text-[#4e4d4a]">
              Cursos visuales, cercanos y construidos alrededor de situaciones que ya forman parte de tu trabajo.
            </motion.p>
          </div>
        </motion.div>
        <div className="academy-featured-courses mt-12">
          {featuredCourses.map((course, index) => (
            <motion.div
              key={course.title}
              {...reveal}
              transition={{ ...reveal.transition, delay: index * 0.08 }}
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="academy-section academy-catalog">
        <motion.div className="vl-branding__copy mx-auto max-w-[92rem] w-full" variants={copyStagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .22 }}>
          <div>
            <motion.p variants={copyItem} className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Explora por tema</motion.p>
            <motion.h2 variants={copyItem} className="text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em]" style={{ ...displayFont, fontWeight: 760 }}>
              Encuentra tu <span className="text-[#ff4b0b]">siguiente curso.</span>
            </motion.h2>
          </div>
        </motion.div>

        <motion.div {...reveal} className="flex items-center justify-between mb-8 mt-6 max-w-[92rem] mx-auto">
          <div className="academy-topic-filters m-0" aria-label="Filtrar cursos por tema">
            {courseTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                className={activeTopic === topic ? 'is-active' : ''}
                onClick={() => setActiveTopic(topic)}
              >
                {topic}
              </button>
            ))}
            <a
              href={`${import.meta.env.VITE_ACADEMY_URL || 'http://localhost:7000'}/cursos`}
              className="academy-topic-filter-all"
            >
              Ver todos los cursos
              <ArrowRight size={14} />
            </a>
          </div>
          <div className="academy-carousel-controls">
            <button type="button" onClick={() => moveCarousel(-1)} aria-label="Ver cursos anteriores"><ChevronLeft size={20} /></button>
            <button type="button" onClick={() => moveCarousel(1)} aria-label="Ver más cursos"><ChevronRight size={20} /></button>
          </div>
        </motion.div>

        <motion.div {...reveal} ref={carouselRef} className="academy-course-carousel is-medium">
          {visibleCourses.map((course) => (
            <CourseCard key={`${activeTopic}-${course.title}`} course={course} compact />
          ))}
        </motion.div>
      </section>

      <section id="metodo" className="academy-section academy-method">
        <div className="academy-method-layout">
          <motion.div className="vl-branding__copy self-center" variants={copyStagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .22 }}>
            <div>
              <motion.p variants={copyItem} className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Método Qaway</motion.p>
              <motion.h2 variants={copyItem} className="text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em]" style={{ ...displayFont, fontWeight: 760 }}>
                Menos teoría suelta. Más <span className="text-[#ff4b0b]">capacidad instalada.</span>
              </motion.h2>
              <motion.p variants={copyItem} className="mt-4 max-w-xl text-[clamp(0.94rem,1.05vw,1.06rem)] leading-[1.5] text-[#4e4d4a]">
                Cada experiencia combina contexto, demostración, práctica guiada y una aplicación directa a tu trabajo.
              </motion.p>
            </div>
            <motion.div variants={copyItem} style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <a href={`${import.meta.env.VITE_ACADEMY_URL || 'http://localhost:7000'}/cursos`} className="academy-primary-button">
                Ver todos los cursos
                <ArrowRight size={17} />
              </a>
              <motion.a
                href="#formulario"
                className="academy-text-link"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ff4b0b', fontWeight: 'bold', textDecoration: 'none' }}
                whileHover="hovered"
                initial="rest"
                animate="rest"
              >
                Solicitar asesoría
                <motion.span
                  variants={{ rest: { x: 0 }, hovered: { x: 5 } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ display: 'inline-flex' }}
                >
                  <ArrowRight size={16} />
                </motion.span>
              </motion.a>
            </motion.div>
          </motion.div>

          <div className="academy-method-steps">
            {[
              { title: 'Entiende', text: 'Primero ves el problema completo y el criterio detrás de cada decisión.', dir: { x: -60 } },
              { title: 'Construye', text: 'Después aplicas el método con herramientas y ejemplos cercanos.', dir: { y: 60 } },
              { title: 'Implementa', text: 'Terminas con un sistema, flujo o recurso que puedes seguir usando.', dir: { x: 60 } },
            ].map(({ title, text, dir }, index) => (
              <motion.div
                key={title}
                className="academy-method-step group"
                initial={reduceMotion ? false : { opacity: 0, ...dir }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, delay: index * 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 select-none text-[8.5rem] font-bold leading-none text-[#191918]/[0.08] transition-colors duration-500 group-hover:text-[#ff4b0b]/[0.1]">
                  0{index + 1}
                </span>
                <div className="relative z-10 ml-[7rem]">
                  <span className="mb-[0.4rem] block text-[0.77rem] font-bold text-[#ff4b0b]">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonios" className="academy-section academy-testimonials tst-ver-a">
        <div className="tst-a-layout">
          <motion.div className="tst-a-stage" {...reveal}>
            <div className="tst-a-viewport">
              {testimonials.map((t, index) => (
                <motion.article
                  key={t.name}
                  className="tst-a-card"
                  initial={false}
                  animate={{
                    opacity: index === activeTestimonial ? 1 : 0,
                    x: index === activeTestimonial ? 0 : index < activeTestimonial ? -40 : 40,
                    pointerEvents: index === activeTestimonial ? 'auto' : 'none',
                  }}
                  transition={{ duration: 0.45, ease: [0.32, 0, 0.67, 0] }}
                  style={{ '--testimonial-accent': t.accent, '--testimonial-tint': t.tint }}
                >
                  <div className="tst-a-portrait">
                    <img src={t.portrait} alt={t.name} loading="lazy" />
                    <span>{t.name.charAt(0)}</span>
                  </div>
                  <div className="tst-a-copy">
                    <div className="academy-stars mb-3">
                      {Array.from({ length: 5 }).map((_, s) => <Star key={s} size={13} fill="currentColor" />)}
                    </div>
                    <blockquote>"{t.quote}"</blockquote>
                    <footer>
                      <strong>{t.name}</strong>
                      <small>{t.role}</small>
                    </footer>
                  </div>
                </motion.article>
              ))}
            </div>

            <div className="tst-a-nav">
              <button type="button" onClick={() => moveTestimonials(-1)} aria-label="Anterior">
                <ChevronLeft size={18} />
              </button>
              <div className="tst-a-dots">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={i === activeTestimonial ? 'is-active' : ''}
                    onClick={() => setActiveTestimonial(i)}
                    aria-label={`Testimonio ${i + 1}`}
                  />
                ))}
              </div>
              <button type="button" onClick={() => moveTestimonials(1)} aria-label="Siguiente">
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>

          <motion.div className="vl-branding__copy self-center" variants={copyStagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .22 }}>
            <div>
              <motion.p variants={copyItem} className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Experiencias reales</motion.p>
              <motion.h2 variants={copyItem} className="text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em]" style={{ ...displayFont, fontWeight: 760 }}>
                Ellos ya <span className="text-[#ff4b0b]">aprendieron</span> con nosotros.
              </motion.h2>
              <motion.p variants={copyItem} className="mt-4 max-w-xl text-[clamp(0.94rem,1.05vw,1.06rem)] leading-[1.5] text-[#4e4d4a]">
                Historias breves de personas que aplicaron lo aprendido y vieron cambios concretos.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="formulario" className="academy-section academy-form-section">
        <div className="academy-form-layout">
          <motion.div className="vl-branding__copy self-center" variants={copyStagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .22 }}>
            <div>
              <motion.p variants={copyItem} className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Contacto</motion.p>
              <motion.h2 variants={copyItem} className="text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em]" style={{ ...displayFont, fontWeight: 760 }}>
                Inscripciones y <span className="text-[#ff4b0b]">orientación académica.</span>
              </motion.h2>
              <motion.p variants={copyItem} className="mt-4 max-w-xl text-[clamp(0.94rem,1.05vw,1.06rem)] leading-[1.5] text-[#4e4d4a]">
                Escríbenos para resolver dudas sobre el contenido de los cursos, fechas de talleres o solicitar asesoría sobre qué programa se adapta a tus metas.
              </motion.p>
            </div>
            <motion.div variants={copyItem} className="academy-form-points" style={{ marginTop: '2rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} /> Respuesta en menos de 24 horas</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} /> Orientación sin compromiso</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} /> Opciones personalizadas para empresas</span>
            </motion.div>
          </motion.div>

          <motion.form
            onSubmit={submitInterest}
            className="academy-interest-form"
            {...reveal}
          >
            {submitted ? (
              <div className="academy-form-success">
                <div><Check size={28} /></div>
                <h3>¡Consulta enviada!</h3>
                <p>Te responderemos lo antes posible para ayudarte a elegir tu siguiente paso.</p>
                <button type="button" onClick={() => setSubmitted(false)}>Enviar otro mensaje</button>
              </div>
            ) : (
              <>
                <div className="academy-field">
                  <label htmlFor="academy-name">¿Cómo te llamas?</label>
                  <input
                    type="text"
                    id="academy-name"
                    name="name"
                    required
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div className="academy-field-row">
                  <div className="academy-field">
                    <label htmlFor="academy-phone">Teléfono</label>
                    <input
                      type="tel"
                      id="academy-phone"
                      name="phone"
                      required
                      placeholder="+51 999 999 999"
                    />
                  </div>
                  <div className="academy-field">
                    <label htmlFor="academy-email">Correo</label>
                    <input
                      type="email"
                      id="academy-email"
                      name="email"
                      required
                      placeholder="tucorreo@empresa.com"
                    />
                  </div>
                </div>

                <div className="academy-field-row">
                  <div className="academy-field">
                    <label htmlFor="academy-profile">¿A qué te dedicas?</label>
                    <select id="academy-profile" name="profile" required>
                      <option value="">Selecciona tu perfil</option>
                      <option value="Profesional / Consultor">Profesional / Consultor</option>
                      <option value="Emprendedor / Dueño de negocio">Emprendedor / Dueño de negocio</option>
                      <option value="Creador de contenido / Freelancer">Creador de contenido / Freelancer</option>
                      <option value="Equipo / Empresa (Capacitación a medida)">Equipo / Empresa (Capacitación a medida)</option>
                      <option value="Estudiante / Aprendo desde cero">Estudiante / Aprendo desde cero</option>
                    </select>
                  </div>
                  <div className="academy-field">
                    <label htmlFor="academy-interest">¿Qué programa o curso te interesa?</label>
                    <select id="academy-interest" name="interest" required>
                      <option value="">Selecciona un curso o programa</option>
                      <option value="Diseño — Identidad Visual con IA">Diseño — Identidad Visual con IA</option>
                      <option value="Marketing — WhatsApp Business para negocios">Marketing — WhatsApp Business para negocios</option>
                      <option value="IA — Antigravity desde cero">IA — Antigravity desde cero</option>
                      <option value="Productividad — IA para equipos pequeños">Productividad — IA para equipos pequeños</option>
                      <option value="IA — Sistema de contenido con IA">IA — Sistema de contenido con IA</option>
                      <option value="Automatización — Workflows sin código">Automatización — Workflows sin código</option>
                      <option value="Marketing — Presencia digital para emprender">Marketing — Presencia digital para emprender</option>
                      <option value="Capacitación Corporativa para Empresas">Capacitación Corporativa para Empresas</option>
                      <option value="Orientación general / No sé por dónde empezar">Orientación general / No sé por dónde empezar</option>
                    </select>
                  </div>
                </div>

                <div className="academy-field">
                  <label htmlFor="academy-message">Cuéntanos un poco más</label>
                  <textarea
                    id="academy-message"
                    name="message"
                    rows="4"
                    placeholder="¿Qué quieres lograr o qué dificultad estás intentando resolver?"
                  />
                </div>
                <button type="submit" className="academy-submit-button" disabled={submitting}>
                  {submitting ? 'ENVIANDO CONSULTA...' : 'SOLICITAR INFORMACIÓN DEL CURSO'}
                  <Send size={17} />
                </button>
                {submitError && <p className="academy-form-error" role="alert">{submitError}</p>}
                <small>Usaremos esta información únicamente para responder tu consulta.</small>
              </>
            )}
          </motion.form>
        </div>
      </section>

      <section className="academy-final-cta">
        <div className="academy-final-layout">
          <motion.div className="vl-branding__copy max-w-xl" variants={copyStagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .22 }}>
            <div>
              <motion.p variants={copyItem} className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-white/90">Empieza con claridad</motion.p>
              <motion.h2 variants={copyItem} className="text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em] text-white" style={{ ...displayFont, fontWeight: 760 }}>
                Aprende. Aplica. Hazlo parte de tu <span className="text-white/90">trabajo.</span>
              </motion.h2>
              <motion.p variants={copyItem} className="mt-4 max-w-xl text-[clamp(0.94rem,1.05vw,1.06rem)] leading-[1.5] text-white/80">
                Explora cursos, talleres y programas diseñados para producir cambios visibles desde la primera semana.
              </motion.p>
            </div>
            <motion.div variants={copyItem} style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <MagneticLink href="#programas" className="academy-dark-button">
                Explorar Academy
                <ArrowRight size={18} />
              </MagneticLink>
              <a href={`${import.meta.env.VITE_ACADEMY_URL || 'http://localhost:7000'}/cursos`} className="academy-white-button">
                Ver todos los cursos
                <ArrowRight size={17} />
              </a>
            </motion.div>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10 pt-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
            }}
          >
            {[
              { title: 'Cursos a tu ritmo', text: 'Aprende a tu velocidad con contenido práctico y directo.', icon: Play },
              { title: 'Talleres en vivo', text: 'Sesiones interactivas para aplicar herramientas en tiempo real.', icon: Users },
              { title: 'Programas guiados', text: 'Rutas de aprendizaje con acompañamiento paso a paso.', icon: GraduationCap },
              { title: 'Comunidad y recursos', text: 'Acceso a plantillas, foros y una red de profesionales.', icon: MessageCircle }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className={`group relative sm:pr-6 ${index % 2 === 0 ? 'sm:border-r sm:border-white/20' : ''}`}
                >
                  <Icon className="h-7 w-7 text-white mb-4 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-0.5" strokeWidth={1.5} />
                  <h3 className="text-[1.15rem] font-bold leading-tight text-white transition-colors duration-300 group-hover:text-white/80">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-[1.5] text-white/70">
                    {item.text}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>
    </main>
  )
}
