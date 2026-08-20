import { useState, useRef } from 'react'
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  CreditCard,
  Gauge,
  Globe2,
  HelpCircle,
  LayoutTemplate,
  MessageCircle,
  Monitor,
  Palette,
  Rocket,
  ShieldCheck,
  Smartphone,
  ShoppingBag,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { WHATSAPP_LINK } from '@/data/navigation'
import './src/styles.css'

const ease = [0.16, 1, 0.3, 1]

const techStack = [
  'React 19',
  'Next.js',
  'Vite & Rolldown',
  'Tailwind CSS',
  'TypeScript',
  'WhatsApp Business API',
  'Stripe Payments',
  'Figma UI/UX',
  'Node.js Fastify',
  'Vercel Edge',
  'Google SEO Pro',
]

const trustAvatars = [
  { name: 'Mariana R.', img: '/assets/pages/4-academy/testimonials/mariana.png' },
  { name: 'Diego M.', img: '/assets/pages/4-academy/testimonials/diego.png' },
  { name: 'Lucía V.', img: '/assets/pages/4-academy/testimonials/lucia.png' },
  { name: 'Renzo S.', img: '/assets/pages/4-academy/testimonials/renzo.png' },
]

const strategyPillars = [
  {
    icon: Palette,
    title: 'Dirección Visual & UI Exclusivo',
    desc: 'Diseñamos una presencia digital a la medida de tu marca. Sin plantillas genéricas: cada tipografía, paleta de color y micro-animación está calibrada para transmitir autoridad y confianza inmediata.',
    pills: ['Identidad de Marca', 'Micro-Animaciones', 'UI a Medida', 'Mobile First'],
  },
  {
    icon: Target,
    title: 'Copywriting & Embudos de Conversión',
    desc: 'Una web bonita que no vende no sirve. Estructuramos tus textos y secciones con copywriting persuasivo y botones de WhatsApp estratégicos que transforman visitantes curiosos en clientes que compran.',
    pills: ['Copy Persuasivo', 'Conexión a WhatsApp', 'Velocidad < 1s', 'Optimización SEO'],
  },
]

const projects = [
  {
    name: 'Clínica Bienestar',
    type: 'Sitio web institucional & citas',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=85',
    className: 'project-blue',
  },
  {
    name: 'Café Origen',
    type: 'Tienda online & suscripciones',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85',
    className: 'project-coffee',
  },
  {
    name: 'Altaria Inmobiliaria',
    type: 'Portal comercial & proyectos',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85',
    className: 'project-house',
  },
  {
    name: 'Educa+',
    type: 'Plataforma educativa & cursos',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=85',
    className: 'project-purple',
  },
]

const webShowcases = [
  {
    title: 'Cloudy Platform',
    category: 'Landing Page & SaaS de Alta Conversión',
    url: 'cloudy.app',
    tag: 'SaaS & Tech UI',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Express Digital',
    category: 'Sitio Web Comercial & Corporativo',
    url: 'express-agency.com',
    tag: 'Business & Trust',
    image: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Galaxy Suite',
    category: 'Arquitectura Web & Experiencia Personalizada',
    url: 'galaxy-systems.io',
    tag: 'Ecosistema UI/UX',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  },
]

const testimonials = [
  {
    name: 'Mariana Ríos',
    role: 'Fundadora, Studio Glow',
    img: '/assets/pages/4-academy/testimonials/mariana.png',
    quote: 'La web cambió totalmente la percepción de nuestro estudio. Los clientes llegan directo a WhatsApp convencidos y listos para contratar.',
    metric: '+140% contactos en WhatsApp',
  },
  {
    name: 'Diego Morales',
    role: 'Director Comercial, Innova Corp',
    img: '/assets/pages/4-academy/testimonials/diego.png',
    quote: 'Entregaron en los 7 días prometidos. La velocidad de carga en celulares es instantánea y el diseño superó todas nuestras expectativas.',
    metric: 'Entrega récord en 7 días',
  },
  {
    name: 'Lucía Vargas',
    role: 'CEO, BioHealth',
    img: '/assets/pages/4-academy/testimonials/lucia.png',
    quote: 'El nivel de detalle visual y la claridad del copy nos permitió cerrar alianzas corporativas con marcas que antes no nos consideraban.',
    metric: 'Autoridad de marca 10/10',
  },
]

const included = [
  [Globe2, 'Dominio y hosting', '1 año de servidor cloud de alta velocidad incluido'],
  [Smartphone, '100% responsive', 'Experiencia fluida y adaptada a celulares'],
  [MessageCircle, 'WhatsApp integrado', 'Botones directos para cerrar ventas'],
  [Rocket, 'Velocidad ultra rápida', 'Optimización de assets para carga en < 1s'],
  [ShieldCheck, 'Seguridad SSL', 'Certificado HTTPS y protección de datos'],
  [BarChart3, 'SEO técnico', 'Estructura lista para indexar en Google'],
  [Zap, 'Formularios interactivos', 'Captación de datos y cotizaciones'],
  [Gauge, 'Soporte y asesoría', 'Acompañamiento post-lanzamiento'],
]

const pricingPlans = [
  {
    title: 'Landing de Conversión',
    desc: 'Ideal para campañas de pauta digital, lanzamientos de productos o captación directa por WhatsApp.',
    features: [
      '1 Página de alto impacto visual',
      'Copywriting persuasivo enfocado en venta',
      'Botones de contacto directo a WhatsApp',
      'Dominio .com + Hosting Cloud por 1 año',
      'Carga instantánea optimizada en móviles',
      'Certificado de seguridad SSL incluido',
    ],
    btnText: 'Cotizar Landing',
    featured: false,
  },
  {
    title: 'Web Comercial & Marca',
    desc: 'Sitio multi-sección para empresas que buscan proyectar autoridad y captar clientes calificados.',
    features: [
      'Hasta 5 secciones completas (Inicio, Nosotros, Servicios, Casos, Contacto)',
      'Dirección visual & UI personalizada',
      'Catálogo interactivo de servicios o productos',
      'Formularios inteligentes conectados a WhatsApp',
      'Estructura SEO optimizada para Google',
      'Capacitación grabada para autoadministración',
      'Soporte prioritario por 30 días',
    ],
    btnText: 'Quiero mi Web Comercial',
    featured: true,
  },
  {
    title: 'Web a Medida / E-commerce',
    desc: 'Para proyectos con requerimientos avanzados, catálogo de ventas o integraciones personalizadas.',
    features: [
      'Tienda online con pasarela de pagos integrada',
      'Panel de control fácil para subir productos',
      'Automatizaciones por correo y WhatsApp',
      'Filtros, buscador dinámico y carrito de compras',
      'Integraciones con CRM y herramientas externas',
      'Soporte técnico y mantenimiento dedicado',
    ],
    btnText: 'Cotizar a Medida',
    featured: false,
  },
]

const steps = [
  ['01', 'Diagnóstico & Estrategia', 'Analizamos tu negocio, público y propuesta de valor.'],
  ['02', 'Dirección de Arte & UI', 'Diseñamos la estructura, el copy persuasivo y el estilo visual.'],
  ['03', 'Desarrollo & Optimización', 'Programamos con tecnología rápida y responsive a 60fps.'],
  ['04', 'Lanzamiento & Crecimiento', 'Publicamos tu web con dominio, hosting y soporte continuo.'],
]

const faqs = [
  {
    q: '¿Cuánto tiempo toma tener mi web lista y publicada?',
    a: 'Una Landing Page de conversión se entrega entre 5 y 7 días hábiles. Una Web Comercial multi-sección toma entre 10 y 14 días hábiles, garantizando revisiones y calibración final de cada detalle.',
  },
  {
    q: '¿Incluye el dominio y el hosting?',
    a: 'Sí, todos nuestros planes incluyen el registro de dominio .com y hosting en servidores cloud de alta velocidad durante el primer año sin ningún costo adicional.',
  },
  {
    q: '¿Podré editar los textos e imágenes yo mismo después?',
    a: 'Por supuesto. Te entregamos la web lista y te brindamos una videocapacitación paso a paso para que tu equipo pueda actualizar textos, imágenes o productos de forma sencilla sin depender de programadores.',
  },
  {
    q: '¿Cómo es el proceso de trabajo y la forma de pago?',
    a: 'Iniciamos con un 50% de anticipo para arrancar la conceptualización y diseño visual. Una vez aprobado y publicado todo a tu entera satisfacción, se abona el 50% restante.',
  },
  {
    q: '¿La web estará optimizada para teléfonos móviles?',
    a: '100%. Más del 80% de los clientes visitan desde un celular, por lo que diseñamos bajo enfoque Mobile-First para garantizar velocidad inmediata y botones de WhatsApp siempre al alcance.',
  },
]

function DeviceMockup() {
  return (
    <div className="device-stage">
      <div className="orbit orbit-a" />
      <div className="orbit orbit-b" />

      <motion.div
        className="floating-card card-top"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 1, ease }}
      >
        <Sparkles size={18} />
        <span>Diseño estratégico<br />que convierte</span>
      </motion.div>

      <motion.div
        className="laptop"
        initial={{ opacity: 0, y: 40, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: -1 }}
        transition={{ duration: 0.8, delay: 0.2, ease }}
      >
        <div className="screen">
          <div className="mock-nav">
            <strong>Nexo</strong>
            <span>Inicio</span><span>Nosotros</span><span>Proyectos</span><span>Servicios</span>
            <button>Cotizar proyecto</button>
          </div>
          <div className="mock-hero">
            <div>
              <small>PROYECTO WEB</small>
              <h3>Espacios que<br /><em>inspiran vida.</em></h3>
              <p>Diseñamos y construimos espacios modernos, funcionales y únicos.</p>
              <button>Ver proyecto</button>
            </div>
            <div className="house-image" />
          </div>
          <div className="mock-strip">
            <span>Proyectos</span><span>Experiencia</span><span>Servicios</span><span>Contacto</span>
          </div>
        </div>
        <div className="base" />
      </motion.div>

      <motion.div
        className="phone"
        initial={{ opacity: 0, x: 50, rotate: 8 }}
        animate={{ opacity: 1, x: 0, rotate: 4 }}
        transition={{ duration: 0.7, delay: 0.5, ease }}
      >
        <div className="phone-screen">
          <div className="phone-top">Nexo <span>☰</span></div>
          <div className="phone-image" />
          <h4>Espacios que<br /><em>inspiran vida.</em></h4>
          <button>Ver proyecto</button>
          <div className="phone-cards">
            <i /><i /><i />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="floating-card card-bottom"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.2, ease }}
      >
        <span className="number">25+</span>
        <span>Proyectos<br />entregados</span>
      </motion.div>
    </div>
  )
}

function HeroTrustBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      className="trust-badge-wrap"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        marginTop: '36px',
        paddingTop: '22px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {trustAvatars.map((av, index) => (
          <motion.div
            key={av.name}
            whileHover={{ scale: 1.08, zIndex: 10, y: -1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              marginLeft: index === 0 ? '0' : '-10px',
              border: '2.5px solid #061016',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.35)'
            }}
            title={av.name}
          >
            <img
              src={av.img}
              alt={av.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy"
            />
          </motion.div>
        ))}
        <motion.div
          whileHover={{ scale: 1.06, zIndex: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            marginLeft: '-10px',
            border: '2.5px solid #061016',
            background: 'rgba(255, 75, 11, 0.16)',
            color: '#ff4b0b',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: 'default',
            boxShadow: '0 4px 14px rgba(0,0,0,0.35)'
          }}
        >
          +50
        </motion.div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '3px', color: '#ffb020' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="currentColor" stroke="none" />
            ))}
          </div>
          <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '13px', lineHeight: 1 }}>5.0</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', lineHeight: 1 }}>/ 5.0</span>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#b2bcc2', lineHeight: 1.35, fontWeight: 500 }}>
          Más de 50 negocios confían en nosotros
        </p>
      </div>
    </motion.div>
  )
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease },
  }),
}

function ShowcaseCardItem({ item, i }) {
  const videoRef = useRef(null)

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <motion.article
      className="showcase-card"
      key={item.title}
      custom={i}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerItem}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="showcase-canvas">
        <div className="showcase-mockup-inner">
          {item.video ? (
            <video
              ref={videoRef}
              src={item.video}
              poster={item.image}
              muted
              loop
              playsInline
              className="showcase-img showcase-video"
            />
          ) : (
            <img src={item.image} alt={item.title} className="showcase-img" loading="lazy" decoding="async" />
          )}
        </div>
      </div>
      <div className="showcase-footer-clean">
        <h3>{item.title}</h3>
      </div>
    </motion.article>
  )
}

export default function DesarrolloWebLandingPage() {
  const [openFaq, setOpenFaq] = useState(null)
  const [clientName, setClientName] = useState('')
  const [webService, setWebService] = useState('Web Comercial & Marca')

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const handleDiagnosisSubmit = (e) => {
    e.preventDefault()
    const message = `Hola Qaway Lab! Mi nombre es ${clientName || 'un cliente'} y me gustaría cotizar una ${webService} para mi negocio.`
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/51987654321?text=${encoded}`, '_blank')
  }

  return (
    <main className="desarrollo-web-landing">
      {/* ─── Hero Section ────────────────────────── */}
      <section className="hero" id="inicio">
        <div className="hero-copy">
          <motion.div
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
          >
            CREACIÓN DE WEBS
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
          >
            Creamos webs
            <br />que hacen crecer
            <br /><span>tu negocio.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease }}
          >
            Diseñamos sitios web modernos, rápidos y estratégicos que atraen clientes y generan resultados.
          </motion.p>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease }}
          >
            <a className="primary-btn" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">Quiero crear mi web <ArrowRight size={18} /></a>
            <a className="text-btn light" href="#proyectos">Ver proyectos <ArrowRight size={17} /></a>
          </motion.div>
          <HeroTrustBadge />
        </div>
        <DeviceMockup />
      </section>

      {/* ─── Feature Bar ─────────────────────────── */}
      <motion.section
        className="feature-bar"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {[
          [Monitor, <>Diseño<br />personalizado</>],
          [Smartphone, <>100%<br />responsive</>],
          [MessageCircle, <>WhatsApp<br />integrado</>],
          [Rocket, <>Rápidas y<br />optimizadas</>],
        ].map(([Icon, title], i) => (
          <motion.div key={i} custom={i} variants={staggerItem}>
            <Icon size={28} strokeWidth={2} />
            <strong>{title}</strong>
          </motion.div>
        ))}
      </motion.section>

      {/* ─── Web Showcase & Project Types ────────────── */}
      <section className="web-showcase-section section-light" id="tipos">
        <div className="section-intro showcase-intro">
          <div className="eyebrow">PORTAFOLIO & MODELOS WEB</div>
          <h2>Diseñamos la web exacta que <span>tu negocio</span> necesita.</h2>
          <p>
            Desde landing pages de alta conversión hasta plataformas corporativas con arquitectura digital de vanguardia.
          </p>
        </div>

        <div className="showcase-cards-grid">
          {webShowcases.map((item, i) => (
            <ShowcaseCardItem key={item.title} item={item} i={i} />
          ))}
        </div>
      </section>

      {/* ─── Brand & Strategy (Más que Código) ───── */}
      <section className="strategy-section" id="estrategia">
        <div className="section-intro" style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
          <div className="eyebrow">MÁS QUE CÓDIGO</div>
          <h2 style={{ fontSize: '38px', lineHeight: 1.15 }}>Diseñamos webs que venden,<br /><span>no solo que funcionan.</span></h2>
          <p style={{ margin: '14px auto 0', fontSize: '15px' }}>
            La mayoría de páginas web fallan porque usan plantillas genéricas sin alma ni estrategia. En Qaway Lab unimos dirección de arte, copywriting persuasivo y tecnología ultra rápida.
          </p>
        </div>
        <div className="strategy-grid">
          {strategyPillars.map(({ icon: Icon, title, desc, pills }, i) => (
            <motion.div
              key={title}
              className="strategy-card"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerItem}
            >
              <div className="strategy-icon-box">
                <Icon size={26} strokeWidth={2} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <div className="strategy-pill-list">
                {pills.map((pill) => (
                  <span key={pill} className="strategy-pill">{pill}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Tech & Trust Marquee (Puente a Proyectos) ── */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...techStack, ...techStack].map((tech, idx) => (
            <div className="marquee-item" key={idx}>
              <span className="dot" />
              <span>{tech}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── BLOQUE OSCURO EMPAQUETADO 1 (Identidad + Proyectos + Testimonios) ─── */}
      <div className="dark-packaged-block" id="proyectos">
        {/* Identidad Visual & Selección Fotográfica */}
        <section className="brand-identity-showcase" id="identidad">
          <div className="section-heading">
            <div>
              <div className="eyebrow">DIRECCIÓN DE ARTE & MARCA</div>
              <h2>Identidad Visual & Curaduría</h2>
            </div>
            <p className="brand-identity-subtitle">
              Cada proyecto web parte de una base estética sólida: tipografía con carácter, paleta cromática exclusiva y selección fotográfica de alto impacto.
            </p>
          </div>

          {/* Grid de Tipografía + Paleta */}
          <div className="brand-identity-grid">
            <div className="typography-box">
              <div className="type-specimen">
                <span className="type-label">Tipografía Primaria</span>
                <div className="font-primary-display">Playfair Display</div>
              </div>
              <div className="type-specimen">
                <span className="type-label">Tipografía Secundaria</span>
                <div className="font-secondary-display">DM Sans</div>
              </div>
            </div>

            <div className="colors-box">
              <span className="type-label">Patrones de Color</span>
              <div className="color-swatches-grid">
                <div className="color-swatch" style={{ background: '#0D1B17', color: '#F6F4F1' }}>
                  <span className="swatch-name">Bosque</span>
                  <span className="swatch-hex">#0D1B17</span>
                </div>
                <div className="color-swatch" style={{ background: '#1E2A25', color: '#F6F4F1' }}>
                  <span className="swatch-name">Oliva</span>
                  <span className="swatch-hex">#1E2A25</span>
                </div>
                <div className="color-swatch" style={{ background: '#C49A44', color: '#0D1B17' }}>
                  <span className="swatch-name">Dorado</span>
                  <span className="swatch-hex">#C49A44</span>
                </div>
                <div className="color-swatch" style={{ background: '#F6F4F1', color: '#0D1B17' }}>
                  <span className="swatch-name">Crema</span>
                  <span className="swatch-hex">#F6F4F1</span>
                </div>
              </div>
            </div>
          </div>

          <div className="packaged-block-divider" style={{ margin: '38px 0' }} />

          {/* Selección Fotográfica */}
          <div className="photo-selection-wrapper">
            <div className="photo-selection-header">
              <span className="type-label">Selección Fotográfica & Moodboard</span>
              <p>Composición fotográfica curada para transmitir confianza, modernidad y sofisticación.</p>
            </div>
            <div className="photo-grid-showcase">
              <div className="photo-item photo-tall">
                <img
                  src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Arquitectura & Espacios"
                  loading="lazy"
                />
              </div>
              <div className="photo-subgrid">
                <div className="photo-item photo-wide">
                  <img
                    src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                    alt="Diseño de Interiores"
                    loading="lazy"
                  />
                </div>
                <div className="photo-item photo-square">
                  <img
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Detalles & Acabados"
                    loading="lazy"
                  />
                </div>
                <div className="photo-item photo-square">
                  <img
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Estructura & Modernidad"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="packaged-block-divider" />

        {/* Proyectos Destacados */}
        <section className="portfolio">
          <div className="section-heading">
            <div>
              <div className="eyebrow">PROYECTOS DESTACADOS</div>
              <h2>Algunas webs que<br />hemos creado.</h2>
            </div>
            <a className="text-btn light" href="#contacto">Ver todos los proyectos <ArrowRight size={17} /></a>
          </div>
          <div className="project-grid">
            {projects.map((project, i) => (
              <motion.article
                className="project-card"
                key={project.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={staggerItem}
              >
                <div className={`project-visual ${project.className}`}>
                  <img src={project.image} alt={project.name} />
                  <div className="project-window">
                    <div className="window-bar"><b>{project.name}</b><span>Inicio　Proyectos　Contacto</span></div>
                    <div className="window-content"><strong>{project.name}</strong><em>Una presencia digital pensada para crecer.</em></div>
                  </div>
                </div>
                <h3>{project.name}</h3>
                <p>{project.type}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <div className="packaged-block-divider" />

        {/* Testimonios & Casos de Éxito */}
        <section className="testimonials-section" id="testimonios">
          <div className="section-heading">
            <div>
              <div className="eyebrow">RESULTADOS COMPROBADOS</div>
              <h2>Lo que dicen las marcas<br />que confían en nosotros.</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffb020' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" stroke="none" />
              ))}
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700, marginLeft: '6px' }}>5.0 / 5.0 Rating</span>
            </div>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testi, i) => (
              <motion.div
                key={testi.name}
                className="testimonial-card"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={staggerItem}
              >
                <span className="testimonial-metric-badge">
                  <Sparkles size={13} /> {testi.metric}
                </span>
                <p className="testimonial-quote">"{testi.quote}"</p>
                <div className="testimonial-author">
                  <img src={testi.img} alt={testi.name} className="testimonial-avatar" />
                  <div className="testimonial-info">
                    <strong>{testi.name}</strong>
                    <span>{testi.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* ─── What's Included ─────────────────────── */}
      <section className="included section-light" id="incluye">
        <div className="eyebrow">LO QUE TU WEB NECESITA</div>
        <h2>Incluye todo lo que tu web necesita.</h2>
        <div className="included-grid">
          {included.map(([Icon, title, text], i) => (
            <motion.div
              className="included-item"
              key={title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerItem}
            >
              <Icon size={24} />
              <strong>{title}</strong>
              <span>{text}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Pricing Plans ───────────────────────── */}
      <section className="pricing-section" id="planes">
        <div className="section-intro" style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
          <div className="eyebrow">PLANES Y SERVICIOS</div>
          <h2 style={{ fontSize: '38px', lineHeight: 1.15 }}>Elige el plan ideal<br /><span>para tu negocio.</span></h2>
          <p style={{ margin: '14px auto 0', fontSize: '15px' }}>
            Inversión clara, entregables definidos y tiempos de entrega garantizados. Sin costos ocultos.
          </p>
        </div>
        <div className="pricing-grid">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={plan.title}
              className={`pricing-card ${plan.featured ? 'featured' : ''}`}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerItem}
            >
              {plan.featured && (
                <div className="pricing-badge-popular">Más Solicitado</div>
              )}
              <h3>{plan.title}</h3>
              <p className="plan-desc">{plan.desc}</p>
              <ul className="pricing-features">
                {plan.features.map((feat) => (
                  <li key={feat}>
                    <Check size={16} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <a
                className="plan-btn"
                href={`https://wa.me/51987654321?text=${encodeURIComponent(`Hola Qaway Lab! Deseo consultar detalles y cotización sobre el plan: ${plan.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {plan.btnText} <ArrowRight size={16} />
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── BLOQUE OSCURO EMPAQUETADO 2 (Proceso + FAQ) ─── */}
      <div className="dark-packaged-block" id="proceso">
        {/* Nuestro Proceso */}
        <section className="process">
          <div className="process-copy">
            <div className="eyebrow">NUESTRO PROCESO</div>
            <h2>Así trabajamos<br />tu proyecto.</h2>
            <p>Un proceso claro, colaborativo y enfocado en resultados.</p>
            <a className="text-btn light" href="#contacto">Conoce más <ArrowRight size={17} /></a>
          </div>
          <div className="steps">
            {steps.map(([num, title, text], index) => (
              <motion.div
                className="step"
                key={num}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={staggerItem}
              >
                <div className="step-line"><span>{num}</span>{index < steps.length - 1 && <i />}</div>
                <strong>{title}</strong>
                <p>{text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="packaged-block-divider" />

        {/* Preguntas Frecuentes */}
        <section className="faq-section" id="faq">
          <div className="section-intro" style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <div className="eyebrow">PREGUNTAS FRECUENTES</div>
            <h2 style={{ fontSize: '38px', lineHeight: 1.15 }}>Resolvemos tus dudas<br /><span>antes de empezar.</span></h2>
            <p style={{ margin: '14px auto 0', fontSize: '15px' }}>
              Todo lo que necesitas saber sobre plazos, entregas, dominios y formas de pago.
            </p>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div key={index} className={`faq-item ${isOpen ? 'active' : ''}`}>
                  <button
                    className="faq-question"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={20} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        className="faq-answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease }}
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* ─── 05. PREÁMBULO SELECCIÓN FOTOGRÁFICA ─── */}
      <section className="bg-[#f8f9f7] text-[#111210] py-12 px-6 border-t border-[#111210]/5">
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-2"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">05</span>
              <span className="w-8 h-px bg-[#ff4b0b]"></span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">
                Dirección de Arte
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight max-w-3xl text-[#111210]">
              Selección Fotográfica
            </h2>
          </motion.div>
        </div>
      </section>

      {/* ─── 05. SELECCIÓN FOTOGRÁFICA INMERSIVA ─── */}
      <section className="relative min-h-[90vh] w-full flex flex-col justify-center pt-12 pb-12 md:pb-24 px-6 md:px-12 text-white border-y border-white/5">
        {/* Fondo inmersivo parallax (Fotografía principal) */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
        />

        {/* Contenedor central flotante oscuro */}
        <div className="relative z-10 max-w-[1440px] mx-auto w-full flex-grow flex flex-col justify-center mt-12 rounded-[16px] overflow-hidden shadow-2xl">
          <div className="absolute inset-0 z-0 overflow-hidden rounded-[16px] ring-1 ring-white/10 bg-[#0D1B17]/90 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#C49A44]/10 to-transparent opacity-50 rounded-[16px]" />
          </div>

          <div className="relative z-10 p-8 md:p-12 lg:p-16 h-full flex flex-col justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-[#C49A44]"></span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C49A44]">
                  Estilo de vida & Arquitectura
                </span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="col-span-1">
                <div className="aspect-[4/5] rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group">
                  <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Fotografía" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                </div>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }} className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4 md:gap-8">
                <div className="col-span-2 aspect-[21/9] rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group">
                  <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Fotografía" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                </div>
                <div className="col-span-1 aspect-square rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group">
                  <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Fotografía" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                </div>
                <div className="col-span-1 aspect-square rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group">
                  <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Fotografía" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 06. PREÁMBULO SHOWCASE VISUAL ─── */}
      <section className="bg-[#f8f9f7] text-[#111210] py-12 px-6 border-t border-[#111210]/5">
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-2"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">06</span>
              <span className="w-8 h-px bg-[#ff4b0b]"></span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">
                Ecosistema Digital
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight max-w-3xl text-[#111210]">
              Visualización de interfaces
            </h2>
          </motion.div>
        </div>
      </section>

      {/* ─── 06. SHOWCASE VISUAL INMERSIVO ─── */}
      <section className="relative min-h-[90vh] w-full flex flex-col justify-center pt-12 pb-12 md:pb-24 px-6 md:px-12 text-white border-y border-white/5">
        {/* Fondo inmersivo parallax */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
        />

        {/* Contenedor central flotante oscuro */}
        <div className="relative z-10 max-w-[1440px] mx-auto w-full flex-grow flex flex-col justify-center mt-12 rounded-[16px] overflow-hidden shadow-2xl">
          <div className="absolute inset-0 z-0 overflow-hidden rounded-[16px] ring-1 ring-white/10 bg-[#0D1B17]/90 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#C49A44]/10 to-transparent opacity-50 rounded-[16px]" />
          </div>

          <div className="relative z-10 p-8 md:p-12 lg:p-16 h-full flex flex-col justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-[#C49A44]"></span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C49A44]">
                  Diseño UI / UX
                </span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Desktop Mockup Principal */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-8 relative">
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                  <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-2 border-b border-white/10">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    </div>
                    <div className="mx-auto font-mono text-[9px] text-white/30 tracking-widest">horizonte-inmobiliaria.com</div>
                  </div>
                  <div className="aspect-[16/10] relative bg-[#0D1B17]">
                    <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Desktop UI" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-700" />
                  </div>
                </div>
              </motion.div>

              {/* Mobile Mockup */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }} className="lg:col-span-4 lg:-ml-12 z-10 mt-8 lg:mt-0">
                <div className="rounded-[2rem] p-2 border border-white/10 bg-[#1a1a1a] shadow-2xl w-[220px] lg:w-[260px] mx-auto">
                  <div className="aspect-[9/19] rounded-[1.5rem] overflow-hidden relative bg-[#0D1B17]">
                    <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Mobile UI" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 07. PREÁMBULO SHOWCASE MÓVIL ─── */}
      <section className="bg-[#f8f9f7] text-[#111210] py-12 px-6 border-t border-[#111210]/5">
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-2"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">07</span>
              <span className="w-8 h-px bg-[#ff4b0b]"></span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">
                Estrategia de Navegación
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight max-w-3xl text-[#111210]">
              Cada pantalla tiene un propósito claro.
            </h2>
          </motion.div>
        </div>
      </section>

      {/* ─── 07. SHOWCASE MÓVIL INMERSIVO ─── */}
      <section className="relative min-h-[90vh] w-full flex flex-col justify-center pt-12 pb-12 md:pb-24 px-6 md:px-12 text-white border-y border-white/5 overflow-hidden">
        {/* Fondo inmersivo parallax */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
        />

        {/* Contenedor central flotante oscuro */}
        <div className="relative z-10 max-w-[1440px] mx-auto w-full flex-grow flex flex-col justify-center mt-12 rounded-[16px] overflow-hidden shadow-2xl">
          <div className="absolute inset-0 z-0 overflow-hidden rounded-[16px] ring-1 ring-white/10 bg-[#0D1B17]/90 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1E2A25]/50 to-transparent opacity-80 rounded-[16px]" />
          </div>

          <div className="relative z-10 p-8 md:p-12 lg:p-16 h-full flex flex-col justify-center items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center w-full"
            >
              <div className="inline-flex items-center justify-center gap-3 w-full">
                <span className="w-8 h-px bg-[#C49A44]"></span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C49A44]">
                  Arquitectura de Flujos Móviles
                </span>
                <span className="w-8 h-px bg-[#C49A44]"></span>
              </div>
            </motion.div>

            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
              {[
                { img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", delay: 0 },
                { img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", delay: 0.2 },
                { img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", delay: 0.4 },
                { img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", delay: 0.6 }
              ].map((mock, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 40 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: "-100px" }} 
                  transition={{ duration: 0.8, delay: mock.delay, type: "spring", bounce: 0.4 }} 
                  className={`z-10 ${i % 2 !== 0 ? 'md:mt-24' : ''}`}
                >
                  <div className="rounded-[2rem] p-2 border border-white/10 bg-[#1a1a1a] shadow-2xl w-[200px] lg:w-[240px] hover:-translate-y-4 transition-transform duration-500 cursor-pointer">
                    <div className="aspect-[9/19] rounded-[1.5rem] overflow-hidden relative bg-[#0D1B17]">
                      <img src={mock.img} alt={`Mobile UI ${i+1}`} loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-500 hover:scale-105" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA + Quick Diagnosis Form ──────────── */}
      <motion.section
        className="cta-wrapper"
        id="contacto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease }}
      >
        <div className="cta-left">
          <div className="eyebrow">¿LISTO PARA CREAR TU WEB?</div>
          <h2>Hablemos de tu proyecto</h2>
          <p>
            Completa este breve diagnóstico o escríbenos directamente. Te asesoramos sin costo para definir la mejor solución para tu negocio.
          </p>
          <div className="cta-perks">
            <div><ShieldCheck size={18} /> Asesoría estratégica sin compromiso</div>
            <div><Zap size={18} /> Respuesta rápida por WhatsApp en minutos</div>
            <div><Star size={18} /> Garantía de satisfacción y soporte dedicado</div>
          </div>
        </div>

        <div className="cta-right">
          <form className="cta-form" onSubmit={handleDiagnosisSubmit}>
            <div className="form-group">
              <label>Tu Nombre o Nombre de tu Empresa</label>
              <input
                type="text"
                placeholder="Ej. Carlos Mendoza / Studio Lima"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>¿Qué tipo de solución buscas?</label>
              <select
                value={webService}
                onChange={(e) => setWebService(e.target.value)}
              >
                <option value="Landing de Conversión">Landing de Conversión (1 página)</option>
                <option value="Web Comercial & Marca">Web Comercial & Marca (Multi-página)</option>
                <option value="Web a Medida / E-commerce">Web a Medida / Tienda E-commerce</option>
                <option value="Rediseño de Web Existente">Rediseño y Optimización de mi Web actual</option>
              </select>
            </div>
            <button type="submit" className="form-submit-btn">
              Cotizar mi proyecto vía WhatsApp <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </motion.section>
    </main>
  )
}
