import {
  ArrowRight,
  BarChart3,
  Gauge,
  Globe2,
  LayoutTemplate,
  MessageCircle,
  Monitor,
  Rocket,
  ShieldCheck,
  Smartphone,
  ShoppingBag,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { WHATSAPP_LINK } from '@/data/navigation'
import './src/styles.css'

const trustAvatars = [
  { name: 'Mariana R.', img: '/assets/pages/4-academy/testimonials/mariana.png' },
  { name: 'Diego M.', img: '/assets/pages/4-academy/testimonials/diego.png' },
  { name: 'Lucía V.', img: '/assets/pages/4-academy/testimonials/lucia.png' },
  { name: 'Renzo S.', img: '/assets/pages/4-academy/testimonials/renzo.png' },
]

const projects = [
  {
    name: 'Clínica Bienestar',
    type: 'Sitio web institucional',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=85',
    className: 'project-blue',
  },
  {
    name: 'Café Origen',
    type: 'Tienda online',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85',
    className: 'project-coffee',
  },
  {
    name: 'Altaria Inmobiliaria',
    type: 'Sitio web comercial',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85',
    className: 'project-house',
  },
  {
    name: 'Educa+',
    type: 'Plataforma educativa',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=85',
    className: 'project-purple',
  },
]

const webTypes = [
  { icon: LayoutTemplate, title: 'Landing Pages', text: 'Una página enfocada en un producto, servicio o campaña.' },
  { icon: Globe2, title: 'Web Comercial', text: 'Un sitio completo para presentar tu negocio y recibir consultas.' },
  { icon: Sparkles, title: 'Web Personalizada', text: 'Una solución diseñada para proyectos con necesidades específicas.' },
  { icon: ShoppingBag, title: 'E-commerce', text: 'Una tienda online preparada para mostrar y vender productos.' },
]

const included = [
  [Globe2, 'Dominio y hosting', 'Asesoría incluida'],
  [Smartphone, '100% responsive', 'Diseño para todos los dispositivos'],
  [MessageCircle, 'WhatsApp integrado', 'Contacto directo'],
  [Rocket, 'Velocidad', 'Carga y rendimiento'],
  [ShieldCheck, 'Seguridad SSL', 'Protección básica'],
  [BarChart3, 'SEO básico', 'Base técnica optimizada'],
  [Zap, 'Formularios', 'Captación de consultas'],
  [Gauge, 'Soporte inicial', 'Acompañamiento'],
]

const steps = [
  ['01', 'Descubrimos', 'Entendemos tu negocio y objetivo.'],
  ['02', 'Diseñamos', 'Definimos estructura, contenido y experiencia.'],
  ['03', 'Desarrollamos', 'Construimos la web y sus funciones.'],
  ['04', 'Publicamos', 'Ponemos tu web online y te acompañamos.'],
]

function DeviceMockup() {
  return (
    <div className="device-stage">
      <div className="orbit orbit-a" />
      <div className="orbit orbit-b" />
      <div className="floating-card card-top">
        <Sparkles size={18} />
        <span>Diseño estratégico<br />que convierte</span>
      </div>
      <div className="laptop">
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
      </div>
      <div className="phone">
        <div className="phone-screen">
          <div className="phone-top">Nexo <span>☰</span></div>
          <div className="phone-image" />
          <h4>Espacios que<br /><em>inspiran vida.</em></h4>
          <button>Ver proyecto</button>
          <div className="phone-cards">
            <i /><i /><i />
          </div>
        </div>
      </div>
      <div className="floating-card card-bottom">
        <span className="number">25+</span>
        <span>Proyectos<br />entregados</span>
      </div>
    </div>
  )
}

function HeroTrustBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="trust-badge-wrap"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginTop: '36px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {trustAvatars.map((av, index) => (
          <motion.div
            key={av.name}
            whileHover={{ scale: 1.2, zIndex: 10, y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              marginLeft: index === 0 ? '0' : '-8px',
              border: '2px solid #061016',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
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
          whileHover={{ scale: 1.15, zIndex: 10 }}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            marginLeft: '-8px',
            border: '2px solid #061016',
            background: 'rgba(255, 75, 11, 0.16)',
            color: '#ff4b0b',
            fontSize: '11px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: 'default'
          }}
        >
          +50
        </motion.div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', gap: '2px', color: '#ffb020' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} fill="currentColor" stroke="none" />
            ))}
          </div>
          <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '11px', lineHeight: 1 }}>5.0</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', lineHeight: 1 }}>/ 5.0</span>
        </div>
        <p style={{ margin: 0, fontSize: '11px', color: '#adb6bb', lineHeight: 1.3, fontWeight: 500 }}>
          Más de 50 negocios confían en nosotros
        </p>
      </div>
    </motion.div>
  )
}

export default function DesarrolloWebLandingPage() {
  return (
    <main className="desarrollo-web-landing">
      <section className="hero" id="inicio">
        <div className="hero-copy">
          <div className="eyebrow">CREACIÓN DE WEBS</div>
          <h1>
            Creamos webs
            <br />que hacen crecer
            <br /><span>tu negocio.</span>
          </h1>
          <p>Diseñamos sitios web modernos, rápidos y estratégicos que atraen clientes y generan resultados.</p>
          <div className="hero-actions">
            <a className="primary-btn" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">Quiero crear mi web <ArrowRight size={18} /></a>
            <a className="text-btn light" href="#proyectos">Ver proyectos <ArrowRight size={17} /></a>
          </div>
          <HeroTrustBadge />
        </div>
        <DeviceMockup />
      </section>

      <section className="feature-bar">
        <div><Monitor /><strong>Diseño<br />personalizado</strong><span>A la medida de tu marca y objetivos.</span></div>
        <div><Smartphone /><strong>100%<br />responsive</strong><span>Tu web se ve perfecta en cualquier dispositivo.</span></div>
        <div><MessageCircle /><strong>WhatsApp<br />integrado</strong><span>Conecta con tus clientes en un clic.</span></div>
        <div><Rocket /><strong>Rápidas y<br />optimizadas</strong><span>Cargan rápido y están listas para escalar.</span></div>
      </section>

      <section className="types section-light" id="tipos">
        <div className="section-intro">
          <div className="eyebrow">TIPOS DE WEBS</div>
          <h2>Tenemos el tipo<br />de web que <span>tu negocio</span><br />necesita.</h2>
          <p>Soluciones pensadas para cada etapa de tu proyecto.</p>
          <a className="text-btn orange" href="#contacto">Ver todas las opciones <ArrowRight size={17} /></a>
        </div>
        <div className="type-grid">
          {webTypes.map(({ icon: Icon, title, text }) => (
            <article className="type-card" key={title}>
              <div className="icon-circle"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
              <a href="#contacto">Saber más <ArrowRight size={16} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="portfolio dark-section" id="proyectos">
        <div className="section-heading">
          <div>
            <div className="eyebrow">PROYECTOS DESTACADOS</div>
            <h2>Algunas webs que<br />hemos creado.</h2>
          </div>
          <a className="text-btn light" href="#contacto">Ver todos los proyectos <ArrowRight size={17} /></a>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.name}>
              <div className={`project-visual ${project.className}`}>
                <img src={project.image} alt="" />
                <div className="project-window">
                  <div className="window-bar"><b>{project.name}</b><span>Inicio　Proyectos　Contacto</span></div>
                  <div className="window-content"><strong>{project.name}</strong><em>Una presencia digital pensada para crecer.</em></div>
                </div>
              </div>
              <h3>{project.name}</h3>
              <p>{project.type}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="included section-light" id="incluye">
        <div className="eyebrow">LO QUE TU WEB NECESITA</div>
        <h2>Incluye todo lo que tu web necesita.</h2>
        <div className="included-grid">
          {included.map(([Icon, title, text]) => (
            <div className="included-item" key={title}>
              <Icon />
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="process dark-section">
        <div className="process-copy">
          <div className="eyebrow">NUESTRO PROCESO</div>
          <h2>Así trabajamos<br />tu proyecto.</h2>
          <p>Un proceso claro, colaborativo y enfocado en resultados.</p>
          <a className="text-btn light" href="#contacto">Conoce más <ArrowRight size={17} /></a>
        </div>
        <div className="steps">
          {steps.map(([num, title, text], index) => (
            <div className="step" key={num}>
              <div className="step-line"><span>{num}</span>{index < steps.length - 1 && <i />}</div>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta" id="contacto">
        <div className="cta-image" />
        <div className="cta-content">
          <div className="eyebrow">¿LISTO PARA CREAR TU WEB?</div>
          <h2>Hablemos de tu proyecto</h2>
          <p>Cuéntanos tu idea y te ayudamos a crear una web que impulse tu negocio.</p>
          <a className="primary-btn" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">Cuéntanos tu proyecto <ArrowRight size={18} /></a>
        </div>
        <div className="cta-laptop">
          <div>Qaway <span>Lab</span></div>
        </div>
      </section>
    </main>
  )
}
