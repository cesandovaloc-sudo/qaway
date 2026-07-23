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
  BookOpen,
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
import './academy.css'

const heroImage = '/assets/pages/9-pruebas/academy/academy-hero-educator.png'

const featuredCourses = [
  {
    image: '/assets/pages/4-academy/curso-identidad-visual-ia2.png',
    category: 'Diseño',
    title: 'Identidad Visual con IA',
    text: 'Construye una identidad coherente usando criterio visual, herramientas de IA y un sistema que puedas seguir aplicando.',
    format: 'Curso práctico',
    duration: '6 módulos',
    featured: 'Más solicitado',
    href: '/landings/identidad-visual',
  },
  {
    image: '/assets/pages/4-academy/curso-whatsapp-business2.png',
    category: 'Marketing',
    title: 'WhatsApp Business para negocios',
    text: 'Organiza consultas, respuestas, catálogo y seguimiento para convertir conversaciones en una mejor experiencia comercial.',
    format: 'Taller guiado',
    duration: '4 sesiones',
    featured: 'Aplicación inmediata',
    href: '#formulario',
  },
  {
    image: '/assets/pages/4-academy/curso-antigravity-youtube2.png',
    category: 'Inteligencia artificial',
    title: 'Antigravity desde cero',
    text: 'Una ruta audiovisual para comprender la herramienta, experimentar con ella y llevarla a proyectos creativos reales.',
    format: 'Serie gratuita',
    duration: 'En YouTube',
    featured: 'Nuevo',
    href: 'https://youtube.com/@qawaymyc?si=V1E5A54vbxPbDmIF',
    external: true,
  },
]

const courseCatalog = [
  ...featuredCourses,
  {
    image: '/assets/pages/9-pruebas/academy/curso-productividad-ia.png',
    category: 'Productividad',
    title: 'IA para equipos pequeños',
    text: 'Organiza tareas, reuniones e información con un sistema sencillo y colaborativo.',
    format: 'Programa',
    duration: '5 semanas',
    href: '#formulario',
  },
  {
    image: '/assets/pages/4-academy/curso-identidad-visual-ia2.png',
    category: 'Inteligencia artificial',
    title: 'Sistema de contenido con IA',
    text: 'Diseña una ruta sostenible para investigar, crear y adaptar contenido sin improvisar.',
    format: 'Curso',
    duration: '7 módulos',
    href: '#formulario',
  },
  {
    image: '/assets/pages/9-pruebas/academy/curso-productividad-ia.png',
    category: 'Automatización',
    title: 'Workflows sin código',
    text: 'Conecta herramientas y construye automatizaciones útiles sin depender de desarrollo complejo.',
    format: 'Taller',
    duration: 'En vivo',
    href: '#formulario',
  },
  {
    image: '/assets/pages/4-academy/curso-whatsapp-business2.png',
    category: 'Marketing',
    title: 'Presencia digital para emprender',
    text: 'Ordena tu propuesta, tus canales y tu comunicación para presentarte con claridad.',
    format: 'Ruta',
    duration: '4 semanas',
    href: '#formulario',
  },
]

const courseTopics = ['Todos', 'Inteligencia artificial', 'Productividad', 'Marketing', 'Diseño', 'Automatización']

const testimonials = [
  {
    quote: 'No sentí que estaba aprendiendo una herramienta aislada. Terminé con un sistema que ya uso cada semana.',
    name: 'Mariana Torres',
    role: 'Consultora de marca',
    city: 'Lima',
    portrait: '/assets/pages/9-pruebas/academy/testimonials/mariana.png',
    accent: '#f0672f',
    tint: 'rgba(240, 103, 47, 0.16)',
  },
  {
    quote: 'El enfoque fue directo y cercano. Pude ordenar WhatsApp Business y responder mejor sin pasar todo el día conectada.',
    name: 'Lucía Rojas',
    role: 'Emprendedora',
    city: 'Arequipa',
    portrait: '/assets/pages/9-pruebas/academy/testimonials/lucia.png',
    accent: '#df5a2a',
    tint: 'rgba(223, 90, 42, 0.16)',
  },
  {
    quote: 'Las clases explican el porqué antes del paso a paso. Eso me dio confianza para adaptar lo aprendido a mi trabajo.',
    name: 'Diego Salvatierra',
    role: 'Creador de contenido',
    city: 'Cusco',
    portrait: '/assets/pages/9-pruebas/academy/testimonials/diego.png',
    accent: '#c77427',
    tint: 'rgba(199, 116, 39, 0.16)',
  },
  {
    quote: 'Aprendí a convertir ideas sueltas en una propuesta clara. Ahora tengo un proceso que me da más seguridad para vender.',
    name: 'Paola Vargas',
    role: 'Fundadora de estudio',
    city: 'Bogotá',
    portrait: '/assets/pages/9-pruebas/academy/testimonials/paola.png',
    accent: '#b96a35',
    tint: 'rgba(185, 106, 53, 0.16)',
  },
  {
    quote: 'Me gustó que todo aterriza en casos reales. No sentí distancia técnica, sentí acompañamiento y criterio.',
    name: 'Renzo Medina',
    role: 'Director comercial',
    city: 'Trujillo',
    portrait: '/assets/pages/9-pruebas/academy/testimonials/renzo.png',
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
  const date = new Date().toLocaleDateString('es-PE',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})
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
        <div className="academy-hero-grid">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
            className="academy-hero-copy"
          >
            <p className="academy-eyebrow">Academy <span>IA aplicada</span> Aprendizaje práctico</p>
            <h1 style={displayFont}>
              Aprende a crear
              <span>sistemas, contenido</span>
              <span>y soluciones con <b>IA</b></span>
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

            <div className="academy-hero-benefits">
              {[
                [GraduationCap, 'Aprendizaje práctico'],
                [BookOpen, 'Recursos accionables'],
                [Users, 'Enfoque para no desarrolladores'],
              ].map(([Icon, text]) => (
                <div key={text}>
                  <Icon size={21} strokeWidth={1.6} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 1.025 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="academy-hero-portrait"
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
            className="academy-hero-panel"
          >
            <div className="academy-panel-mark" />
            <h2 style={displayFont}>
              Formación para avanzar con <span className="academy-title-emphasis">claridad</span><span className="academy-title-punct">.</span>
            </h2>
            <div className="academy-small-rule" />
            <p>Convierte herramientas, ideas y procesos en capacidades reales para tu trabajo y tu negocio.</p>

            <SpotlightCard className="academy-student-card">
              <div className="academy-student-icon"><Users size={25} /></div>
              <div>
                <strong>Aprende aplicando</strong>
                <span>Metodología clara, humana y accionable.</span>
              </div>
            </SpotlightCard>

            <a href="#programas" className="academy-available">
              <Play size={13} fill="currentColor" />
              Programas disponibles
            </a>
          </motion.aside>
        </div>
      </section>

      <section id="programas" className="academy-section academy-programs">
        <motion.div {...reveal} className="academy-section-heading">
          <div>
            <p className="academy-kicker">Cursos destacados</p>
            <h2 style={displayFont}>Empieza por una <span className="academy-title-emphasis">habilidad concreta</span><span className="academy-title-punct">.</span></h2>
          </div>
          <p>Cursos visuales, cercanos y construidos alrededor de situaciones que ya forman parte de tu trabajo.</p>
        </motion.div>

        <div className="academy-featured-courses">
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
        <motion.div {...reveal} className="academy-catalog-heading">
          <div>
            <p className="academy-kicker">Explora por tema</p>
            <h2 style={displayFont}>Encuentra tu <span className="academy-title-emphasis">siguiente curso</span><span className="academy-title-punct">.</span></h2>
          </div>
          <div className="academy-carousel-controls">
            <button type="button" onClick={() => moveCarousel(-1)} aria-label="Ver cursos anteriores">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => moveCarousel(1)} aria-label="Ver más cursos">
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>

        <div className="academy-topic-filters" aria-label="Filtrar cursos por tema">
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
        </div>

        <div ref={carouselRef} className="academy-course-carousel">
          {visibleCourses.map((course) => (
            <CourseCard key={`${activeTopic}-${course.title}`} course={course} compact />
          ))}
        </div>
      </section>

      <section id="metodo" className="academy-section academy-method">
        <motion.div {...reveal} className="academy-method-copy">
          <p className="academy-kicker">Método Qaway</p>
          <h2 style={displayFont}>
            Menos teoría suelta<span className="academy-title-punct">.</span> Más <span className="academy-title-emphasis">capacidad instalada</span><span className="academy-title-punct">.</span>
          </h2>
          <p>
            Cada experiencia combina contexto, demostración, práctica guiada y una aplicación directa a tu trabajo.
          </p>
          <a href="#formulario" className="academy-text-link">
            Ver cómo aprendemos
            <ArrowRight size={16} />
          </a>
        </motion.div>

        <motion.div {...reveal} className="academy-method-steps">
          {[
            ['Entiende', 'Primero ves el problema completo y el criterio detrás de cada decisión.'],
            ['Construye', 'Después aplicas el método con herramientas y ejemplos cercanos.'],
            ['Implementa', 'Terminas con un sistema, flujo o recurso que puedes seguir usando.'],
          ].map(([title, text], index) => (
            <div key={title} className="academy-method-step">
              <span>0{index + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="academy-section academy-paths">
        <motion.div {...reveal} className="academy-path-title">
          <p className="academy-kicker">Elige tu punto de partida</p>
          <h2 style={displayFont}>Una Academy para <span className="academy-title-emphasis">quienes construyen</span><span className="academy-title-punct">.</span></h2>
        </motion.div>
        <div className="academy-path-grid">
          {learningPaths.map(({ icon: Icon, title, text }, index) => (
            <motion.article
              key={title}
              {...reveal}
              transition={{ ...reveal.transition, delay: index * 0.08 }}
              className="academy-path-item"
            >
              <Icon size={24} strokeWidth={1.5} />
              <h3>{title}</h3>
              <p>{text}</p>
              <a href="#formulario" className="academy-path-link">
                Explorar ruta
                <ChevronRight size={15} />
              </a>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="testimonios" className="academy-section academy-testimonials">
        <div className="academy-testimonials-layout">
        <motion.div {...reveal} className="academy-testimonial-heading">
          <div>
            <p className="academy-kicker">Experiencias reales</p>
            <h2 style={displayFont}>Ellos ya <span className="academy-title-emphasis">aprendieron</span> con nosotros<span className="academy-title-punct">.</span></h2>
          </div>
          <p>Historias breves de personas que aplicaron lo aprendido y vieron cambios concretos en su trabajo, negocio o contenido.</p>
        </motion.div>

        <div className="academy-testimonial-showcase">
        <div className="academy-testimonial-stage">
          {testimonials.map((testimonial, index) => (
            <motion.article
              key={testimonial.name}
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              animate={(() => {
                const position = getTestimonialPosition(index, activeTestimonial, testimonials.length)

                if (reduceMotion) {
                  return {
                    x: `${position * 15}%`,
                    opacity: position === 0 ? 1 : 0.7,
                  }
                }

                return {
                  x:
                    position === 0 ? '0%'
                    : position === -1 ? '-35%'
                    : position === 1 ? '35%'
                    : position === -2 ? '-58%'
                    : '58%',
                  y:
                    position === 0 ? 0
                    : Math.abs(position) === 1 ? 30
                    : 48,
                  scale:
                    position === 0 ? 1
                    : Math.abs(position) === 1 ? 0.9
                    : 0.8,
                  opacity:
                    position === 0 ? 1
                    : Math.abs(position) === 1 ? 0.76
                    : 0.46,
                  rotateZ:
                    position === 0 ? 0
                    : position < 0 ? -1.4
                    : 1.4,
                }
              })()}
              transition={{ type: 'spring', stiffness: 92, damping: 22, mass: 0.95 }}
              className={`academy-testimonial-card ${index === activeTestimonial ? 'is-active' : ''}`}
              style={{
                zIndex: 10 - Math.abs(getTestimonialPosition(index, activeTestimonial, testimonials.length)),
                '--testimonial-accent': testimonial.accent,
                '--testimonial-tint': testimonial.tint,
              }}
              onClick={() => setActiveTestimonial(index)}
            >
              <div className="academy-testimonial-card-shell">
                <div className="academy-testimonial-portrait" aria-hidden="true">
                  <img src={testimonial.portrait} alt="" loading="lazy" decoding="async" />
                  <span>{testimonial.name.charAt(0)}</span>
                </div>
                <div className="academy-testimonial-card-copy">
                  <Quote size={31} strokeWidth={1.3} />
                  <div className="academy-stars" aria-label="5 de 5 estrellas">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Star key={star} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <blockquote>{testimonial.quote}</blockquote>
                  <footer>
                    <div>
                      <strong>{testimonial.name}</strong>
                      <small>{testimonial.role}</small>
                    </div>
                    <span>{testimonial.city}</span>
                  </footer>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="academy-testimonial-navigation">
          <button type="button" onClick={() => moveTestimonials(-1)} aria-label="Anterior testimonio">
            <ChevronLeft size={20} />
          </button>
          <div>
            {testimonials.map((_, index) => (
              <button
                key={index}
                type="button"
                className={index === activeTestimonial ? 'is-active' : ''}
                onClick={() => setActiveTestimonial(index)}
                aria-label={`Ir al testimonio ${index + 1}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => moveTestimonials(1)} aria-label="Siguiente testimonio">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      </div>
      </section>

      <section id="formulario" className="academy-section academy-form-section">
        <motion.div {...reveal} className="academy-form-intro">
          <p className="academy-kicker">Contacto</p>
          <h2 style={displayFont}>Resuelve tus <span className="academy-title-emphasis">dudas</span><span className="academy-title-punct">.</span></h2>
          <p>Escríbenos para consultar detalles sobre los programas, metodologías o coordinar capacitación para tu equipo.</p>
          <div className="academy-form-points">
            <span><Check size={16} /> Respuesta en menos de 24 horas</span>
            <span><Check size={16} /> Orientación sin compromiso</span>
            <span><Check size={16} /> Opciones personalizadas para empresas</span>
          </div>
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
                    <option value="Equipo de empresa">Equipo de empresa</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="academy-field">
                  <label htmlFor="academy-interest">¿Qué Servicio o Curso te interesa?</label>
                  <select id="academy-interest" name="interest" required>
                    <option value="">Selecciona un interés</option>
                    <option value="Identidad Visual con IA">Diseño — Identidad Visual con IA</option>
                    <option value="WhatsApp Business para negocios">Marketing — WhatsApp Business para negocios</option>
                    <option value="Antigravity desde cero">IA — Antigravity desde cero</option>
                    <option value="IA para equipos pequeños">Productividad — IA para equipos pequeños</option>
                    <option value="Sistema de contenido con IA">IA — Sistema de contenido con IA</option>
                    <option value="Workflows sin código">Automatización — Workflows sin código</option>
                    <option value="Presencia digital para emprender">Marketing — Presencia digital para emprender</option>
                    <option value="Orientación general / Otro">Orientación general / Otro</option>
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
                {submitting ? 'ENVIANDO CONSULTA...' : 'SOLICITAR ORIENTACIÓN'}
                <Send size={17} />
              </button>
              {submitError && <p className="academy-form-error" role="alert">{submitError}</p>}
              <small>Usaremos esta información únicamente para responder tu consulta.</small>
            </>
          )}
        </motion.form>
      </section>

      <section className="academy-final-cta">
        <motion.div {...reveal}>
          <p className="academy-kicker">Empieza con claridad</p>
          <h2 style={displayFont}>
            Aprende<span className="academy-title-punct">.</span> Aplica<span className="academy-title-punct">.</span> Hazlo parte de tu <span className="academy-title-emphasis">trabajo</span><span className="academy-title-punct">.</span>
          </h2>
          <p>Explora cursos, talleres y programas diseñados para producir cambios visibles desde la primera semana.</p>
          <MagneticLink href="#programas" className="academy-dark-button">
            Explorar Academy
            <ArrowRight size={18} />
          </MagneticLink>
        </motion.div>
        <div className="academy-final-list">
          {['Cursos a tu ritmo', 'Talleres en vivo', 'Programas guiados', 'Comunidad y recursos'].map((item) => (
            <span key={item}><Check size={16} /> {item}</span>
          ))}
        </div>
      </section>
    </main>
  )
}
