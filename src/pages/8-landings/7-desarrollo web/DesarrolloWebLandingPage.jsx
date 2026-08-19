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

const ease = [0.16, 1, 0.3, 1]

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

export default function DesarrolloWebLandingPage() {
  return (
    <main className="desarrollo-web-landing">
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

      <motion.section
        className="feature-bar"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {[
          [Monitor, 'Diseño personalizado'],
          [Smartphone, '100% responsive'],
          [MessageCircle, 'WhatsApp integrado'],
          [Rocket, 'Rápidas y optimizadas'],
        ].map(([Icon, title], i) => (
          <motion.div key={i} custom={i} variants={staggerItem}>
            <Icon size={24} strokeWidth={2} />
            <strong>{title}</strong>
          </motion.div>
        ))}
      </motion.section>

      <section className="types section-light" id="tipos">
        <div className="section-intro">
          <div className="eyebrow">TIPOS DE WEBS</div>
          <h2>Tenemos el tipo<br />de web que <span>tu negocio</span><br />necesita.</h2>
          <p>Soluciones pensadas para cada etapa de tu proyecto.</p>
          <a className="text-btn orange" href="#contacto">Ver todas las opciones <ArrowRight size={17} /></a>
        </div>
        <div className="type-grid">
          {webTypes.map(({ icon: Icon, title, text }, i) => (
            <motion.article
              className="type-card"
              key={title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerItem}
            >
              <div className="icon-circle"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
              <a href="#contacto">Saber más <ArrowRight size={16} /></a>
            </motion.article>
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
                <img src={project.image} alt="" />
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
              <Icon />
              <strong>{title}</strong>
              <span>{text}</span>
            </motion.div>
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

      <motion.section
        className="cta"
        id="contacto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease }}
      >
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
      </motion.section>
    </main>
  )
}
