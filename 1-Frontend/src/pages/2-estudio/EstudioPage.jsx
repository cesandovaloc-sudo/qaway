import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import { SectionPrimitive } from '@/components/typography'
import DigitalPresenceCopy from './DigitalPresenceCopy';
import {
  ArrowDown,
  ArrowRight,
  Brush,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Image,
  Layers3,
  LockKeyhole,
  MousePointer2,
  Users,
} from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import './estudio.css'


const ASSET = '/assets/pages/2-estudio'

const services = [
  {
    number: '01',
    title: 'Branding IA',
    copy: 'Construimos, optimizamos y transformamos marcas para entornos digitales mediante estrategia, dirección visual e IA aplicada.',
    icon: Brush,
    image: 'branding-hospitality-moodboard.png',
  },
  {
    number: '02',
    title: 'Contenido Visual',
    copy: 'Creamos piezas visuales estratégicas para plataformas digitales: reels, carruseles, edición y contenido que comunica y convierte.',
    icon: Layers3,
    image: 'sistema-contenido.png',
  },
  {
    number: '03',
    title: 'Estrategia Digital',
    copy: 'Diseñamos estructuras de posicionamiento, captación y crecimiento: contenido, funnels, landing pages, campañas y conexión con sistemas digitales.',
    icon: Image,
    image: 'branding-architecture-moodboard.png',
  },
  {
    number: '04',
    title: 'Presencia Profesional',
    copy: 'Construimos y optimizamos la imagen digital de profesionales, negocios y marcas personales para LinkedIn, web y redes.',
    icon: CircleUserRound,
    image: 'marca-personal-transformacion.png',
  },
]

const featuredServices = services

const phases = [
  ['01', 'Diagnóstico visual', 'Entendemos el proyecto, el uso final y el material disponible.'],
  ['02', 'Selección y dirección', 'Definimos qué conservar, mejorar, reconstruir o generar.'],
  ['03', 'Intervención híbrida', 'Integramos IA, diseño, edición y postproducción visual.'],
  ['04', 'Entrega adaptable', 'Organizamos los resultados por canal, formato y objetivo.'],
]

const brandingProjects = [
  {
    name: 'Hospitalidad',
    description: 'Identidad táctil, packaging y experiencia de marca.',
    image: `${ASSET}/study-replacements/study-branding-hospitality.png`,
    palette: ['#111111', '#f2f1ef', '#a86137', '#fd5605'],
  },
  {
    name: 'Arquitectura',
    description: 'Sistema visual aplicado a marca, soporte y presentación.',
    image: `${ASSET}/study-replacements/study-branding-architecture.png`,
    palette: ['#111111', '#f2f1ef', '#2850b8', '#fd5605'],
  },
  {
    name: 'Café de autor',
    description: 'Packaging, piezas editoriales y sistema de producto.',
    image: `${ASSET}/study-replacements/study-branding-coffee.png`,
    palette: ['#111111', '#f2f1ef', '#a86137', '#fd5605'],
  },
]

const reveal = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
}

function TiltPanel({ children, className = '' }) {
  return (
    <article className={`vl-tilt ${className}`}>
      {children}
    </article>
  )
}

function SplitVisual({ src, alt, dark = false }) {
  const [position, setPosition] = useState(50)

  return (
    <div
      className={`vl-comparison ${dark ? 'vl-comparison--dark' : ''}`}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setPosition(Math.max(8, Math.min(92, ((event.clientX - rect.left) / rect.width) * 100)))
      }}
      style={{ '--split-position': `${position}%` }}
    >
      <img src={src} alt={alt} />
      <div className="vl-comparison__shade" />
      <span className="vl-comparison__label vl-comparison__label--left">Original</span>
      <span className="vl-comparison__label vl-comparison__label--right">Resultado</span>
      <div className="vl-comparison__line">
        <span><MousePointer2 size={15} /></span>
      </div>
    </div>
  )
}

function Hero() {
  const [pointer, setPointer] = useState({ x: 72, y: 43 })

  return (
    <section
      className="vl-hero"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setPointer({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        })
      }}
      style={{ '--pointer-x': `${pointer.x}%`, '--pointer-y': `${pointer.y}%` }}
    >
      {/* Nav removed */}
      <img className="vl-hero__image" src={`${ASSET}/visual-lab-hero-v7.png`} alt="Transformación visual dirigida por Qaway Lab" />
      <div className="vl-hero__veil" />
      <div className="vl-hero__spotlight" />
      <div className="vl-hero__grid" />

      <motion.div initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85 }} className="vl-hero__content">
        <div className="vl-hero__main">
          <p className="vl-eyebrow">Visual Lab / dirección visual + contenido</p>
          <h1>
            Menos<br />
            piezas sueltas.<br />
            <em>Más<br />dirección<br />visual.</em>
          </h1>
          <p className="vl-hero__copy">
            Diseñamos imágenes, sistemas y contenido para que tu marca se vea clara, actual y coherente en web, redes y presentaciones.
          </p>
          <div className="vl-chips">
            <span>Branding</span>
            <span>Contenido Visual</span>
            <span>Estrategia Digital</span>
          </div>
          <div className="vl-actions">
            <a href="#servicios" className="vl-button vl-button--acid">Ver soluciones <ArrowDown size={16} /></a>
            <a href="#diagnostico" className="vl-text-link">Solicitar diagnóstico <ArrowRight size={15} /></a>
          </div>
        </div>
      </motion.div>

      <motion.a 
        href="#branding"
        className="vl-hero__badge vl-hero__badge--branding"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 0.5, scale: 1, y: [0, -10] }}
        whileHover={{ opacity: 1, y: -16, transition: { duration: 0.3, ease: 'easeOut' } }}
        transition={{ 
          opacity: { delay: 0.4, duration: 0.6 },
          scale: { delay: 0.4, duration: 0.6 },
          y: { repeat: Infinity, repeatType: "reverse", duration: 3.6, ease: "easeInOut", delay: 0.8 }
        }}
      >
        <span className="absolute h-px w-10 bg-[#ff4b0b]/80 -left-10 top-1/2 hidden lg:block" />
        <div className="vl-hero__badge-icon"><Brush size={22} /></div>
        <div>
          <strong>Branding digital</strong>
          <span>Identidad y sistemas visuales.</span>
        </div>
      </motion.a>

      <motion.a 
        href="#servicios"
        className="vl-hero__badge vl-hero__badge--academy"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 0.5, scale: 1, y: [0, -8] }}
        whileHover={{ opacity: 1, y: -16, transition: { duration: 0.3, ease: 'easeOut' } }}
        transition={{ 
          opacity: { delay: 0.55, duration: 0.6 },
          scale: { delay: 0.55, duration: 0.6 },
          y: { repeat: Infinity, repeatType: "reverse", duration: 4.5, ease: "easeInOut", delay: 1.5 }
        }}
      >
        <span className="absolute h-px w-10 bg-[#ff4b0b]/80 -left-10 top-1/2 hidden lg:block" />
        <div className="vl-hero__badge-icon"><Users size={22} /></div>
        <div>
          <strong>Aprende aplicando</strong>
          <span>Metodología clara, humana y accionable.</span>
        </div>
      </motion.a>

      <div className="vl-hero__rail">
        <span>01</span>
        <div />
        <p>Material original<br />Intervención<br />Resultado</p>
      </div>

      <div className="vl-hero__bar" />
    </section>
  )
}

function BrandingSpotlight() {
  const [activeProject, setActiveProject] = useState(0)
  const project = brandingProjects[activeProject]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveProject(current => (current + 1) % brandingProjects.length)
    }, 5200)
    return () => window.clearInterval(timer)
  }, [])

  const selectProject = (index) => {
    setActiveProject((index + brandingProjects.length) % brandingProjects.length)
  }

  const copyStagger = {
    hidden: {},
    visible: { transition: { staggerChildren: .11 } },
  }
  const copyItem = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: .65, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <section id="branding" className="vl-paper vl-section vl-branding">
      <div className="vl-shell vl-branding__grid">
        <motion.figure
          initial={{ opacity: 0, scale: .965, x: -34 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: true, amount: .18 }}
          transition={{ duration: .85, ease: [0.22, 1, 0.36, 1] }}
          className="vl-branding__visual"
        >
          <motion.img
            key={project.image}
            src={project.image}
            alt={`Moodboard y mockups de branding para ${project.name}`}
            initial={{ opacity: 0, scale: 1.035 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: .75, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="vl-branding__overlay">
            <figcaption>
              <span>{project.name} · Proyecto 0{activeProject + 1}</span>
              <strong>{project.description}</strong>
            </figcaption>
            <div className="vl-branding__palette" aria-label={`Paleta del proyecto ${project.name}`}>
              {project.palette.map(color => <i key={color} style={{ background: color }} />)}
            </div>
            <div className="vl-branding__controls">
              <button type="button" onClick={() => selectProject(activeProject - 1)} aria-label="Proyecto anterior"><ChevronLeft size={17} /></button>
              <div>
                {brandingProjects.map((item, index) => (
                  <button
                    key={item.name}
                    type="button"
                    className={index === activeProject ? 'is-active' : ''}
                    onClick={() => selectProject(index)}
                    aria-label={`Ver proyecto ${item.name}`}
                  />
                ))}
              </div>
              <button type="button" onClick={() => selectProject(activeProject + 1)} aria-label="Proyecto siguiente"><ChevronRight size={17} /></button>
            </div>
          </div>
        </motion.figure>

        <motion.div
          className="vl-branding__copy"
          variants={copyStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: .22 }}
        >
          <SectionPrimitive
            uppercase
            kicker="Branding digital / 01"
            title={<>TU MARCA NO ES<br />TU <span>LOGO.</span><br />ES LO QUE LA<br />HACE <span>RECONOCIBLE.</span></>}
            body="Construimos una dirección visual capaz de vivir en cada punto de contacto: identidad, paleta, moodboard, contenido y presencia digital."
            cta={
              <div className="flex flex-wrap items-center gap-6 mt-[36px]">
                <a
                  href="#diagnostico"
                  className="vl-button vl-button--acid vl-branding__cta"
                >
                  Construir mi marca <ArrowRight size={16} />
                </a>
                <Link
                  to="/estudio/branding-digital"
                  className="vl-text-link"
                >
                  Ver detalles <ArrowRight size={15} />
                </Link>
              </div>
            }
          />
          <motion.div className="vl-branding__deliverables">
            {['Logo e identidad', 'Moodboard', 'Paleta y tipografía', 'Sistema visual'].map((item, index) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut", delay: 0 } }}
                viewport={{ once: true }}
                transition={{
                  delay: .4 + index * .07,
                  duration: .5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <small>0{index + 1}</small>{item}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section id="servicios" className="vl-dark vl-section">
      <div className="vl-shell">
        <motion.div {...reveal} className="vl-services__heading">
          <div>
            
            <h2>Cuatro áreas<br /><span>para construir tu marca<span style={{ color: 'var(--vl-acid)' }}>.</span></span></h2>
          </div>
        </motion.div>

        <div className="vl-services-grid">
          {featuredServices.map((service, index) => {
            const Icon = service.icon
            const paths = [
              '/estudio/branding-digital',
              '/estudio/contenido-visual',
              '/estudio/presencia-profesional',
              '/estudio/estrategia-digital'
            ]
            return (
              <Link key={service.title} to={paths[index]} className="vl-service-link">
                <TiltPanel className={`vl-service vl-service--${index + 1}`}>
                  {service.image && <img src={`${ASSET}/${service.image}`} alt="" />}
                  <div className="vl-service__body">
                    <div className="vl-service__top"><span>{service.number}</span><Icon size={22} /></div>
                    <h3>{service.title}</h3>
                    <ArrowRight className="vl-service__arrow" size={18} />
                  </div>
                </TiltPanel>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Restoration() {
  return (
    <section className="vl-paper vl-section vl-restoration">
      <div className="vl-shell">
        <motion.div {...reveal} className="vl-restoration__title">
          <p className="vl-kicker">Transformación visual / 05</p>
          <h2>Recuperar.<br />Mejorar.<br /><span>Reconstruir.</span></h2>
          <p>No maquillamos defectos. Rediseñamos logos, objetos, piezas e imágenes para que funcionen mejor dentro de una marca real.</p>
          <a href="#diagnostico" className="vl-button vl-button--ink">Evaluar mi material <ArrowRight size={16} /></a>
        </motion.div>

        <div className="vl-restoration__visuals">
          <motion.div {...reveal}>
            <SplitVisual src={`${ASSET}/producto-antes-despues.png`} alt="Fotografía de producto optimizada" dark />
            <div className="vl-caption"><span>01</span> Objeto y presentación comercial</div>
          </motion.div>
          <motion.div {...reveal}>
            <SplitVisual src={`${ASSET}/restauracion-antes-despues.png`} alt="Fotografía antigua restaurada" />
            <div className="vl-caption"><span>02</span> Restauración de archivo cuando aplica</div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function PersonalBrand() {
  return (
    <section id="presencia" className="vl-personal">
      <img src={`${ASSET}/marca-personal-transformacion.png`} alt="Transformación de fotografías para presencia profesional y marca personal" />
      <div className="vl-personal__shade" />
      <motion.div {...reveal} className="vl-personal__content">
        <p className="vl-kicker vl-kicker--dark">Presencia profesional / 06</p>
        <h2>Tu experiencia ya existe.<br /><span>Hagamos que también se perciba.</span></h2>
        <p>
          Organizamos retratos, perfiles y presentación digital para proyectar una imagen coherente con tu trabajo, tu personalidad y el nivel al que quieres llegar.
        </p>
        <div className="vl-personal__formats">
          {['LinkedIn', 'Web', 'Prensa', 'Marca personal'].map(item => <span key={item}>{item}</span>)}
        </div>
        <Link to="/estudio/presencia-profesional" className="vl-button vl-button--acid">Profesionalizar mi imagen <ArrowRight size={16} /></Link>
      </motion.div>
    </section>
  )
}

function ContentSystem() {
  const formats = ['1:1', '4:5', '9:16', '16:9']

  return (
    <section id="contenido" className="vl-paper vl-section vl-social">
      <div className="vl-shell vl-content-system">
        <motion.div {...reveal} className="vl-content-system__copy">
          <p className="vl-kicker">Contenido para redes / 02</p>
          <h2>Una marca activa.<br /><span>Muchos formatos, una sola voz.</span></h2>
          <p>
            Diseñamos sistemas de contenido para que carruseles, reels, campañas y publicaciones se reconozcan como parte de la misma marca.
          </p>
          <Link to="/estudio/contenido-visual" className="vl-button vl-button--acid">Diseñar mi contenido <ArrowRight size={16} /></Link>
          <div className="vl-format-rail">
            {formats.map((item, index) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ x: 5.1 }}
                viewport={{ once: true }}
                transition={{
                  delay: .12 + index * .07,
                  x: { type: 'spring', stiffness: 260, damping: 22 },
                }}
              >
                {item}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <motion.div
          {...reveal}
          className="vl-content-showcase"
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect()
            event.currentTarget.style.setProperty('--showcase-x', `${((event.clientX - rect.left) / rect.width) * 100}%`)
            event.currentTarget.style.setProperty('--showcase-y', `${((event.clientY - rect.top) / rect.height) * 100}%`)
          }}
        >
          <video
            src="/assets/pages/2-estudio/estudio_portada_social_media.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-label="Proceso de concepto, producción y edición de contenido para redes sociales"
          />
          <div className="vl-content-showcase__veil" />
          <motion.div
            className="vl-content-showcase__header"
            initial={{ x: 120, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <span>Producción multimedia</span>
            <strong>Edición de reels y piezas<br />que detienen el scroll.</strong>
          </motion.div>

          <div className="vl-content-showcase__status">
            <span><i /> Reel</span>
            <span>Edición</span>
            <span>Social system</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function DigitalPresence() {
  return (
    <section id="estrategia" className="vl-dark vl-section vl-digital">
      <div className="vl-shell">
        <motion.div {...reveal} className="vl-heading-row vl-heading-row--dark vl-digital__heading">
          <div>
            <p className="vl-kicker vl-kicker--dark">Presencia digital / 04</p>
            <h2>De la identidad<br /><span>a una marca que ya vive online.</span></h2>
          </div>
          <p>Conectamos la imagen de la marca con sus perfiles, contenido y landing para construir una experiencia coherente de principio a fin.</p>
        </motion.div>

        <motion.div {...reveal} className="vl-digital__stage">
          <div className="vl-digital__browser">
            <div className="vl-digital__browser-bar"><i /><i /><i /><span>qaway.brand / inicio</span></div>
            <div className="vl-digital__landing">
              <motion.div
                className="vl-digital__site-scroll"
                initial={{ y: 0 }}
                whileInView={{ y: -360 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 11, delay: .35, ease: [0.33, 0, 0.12, 1] }}
              >
                <section className="vl-digital__site-hero">
                  <div className="vl-digital__site-copy">
                    <small>IDENTIDAD · CONTENIDO · CONVERSIÓN</small>
                    <strong>UNA MARCA QUE<br />SE ENTIENDE<br />Y CONVIERTE.</strong>
                    <span>Landing editorial pensada para presentar propuesta, reforzar confianza y guiar a la acción.</span>
                    <Link to="/estudio/estrategia-digital" className="font-bold flex items-center gap-1 mt-2 text-white hover:text-[#ff4b0b] transition-colors">Explorar estrategia <ArrowRight size={14} /></Link>
                  </div>
                  <div className="vl-digital__site-visual">
                    <img src={`${ASSET}/branding-architecture-moodboard.png`} alt="Identidad visual aplicada en una landing digital" />
                  </div>
                </section>

                <section className="vl-digital__site-band">
                  <span>Dirección visual consistente</span>
                  <span>Mensajes claros</span>
                  <span>Conversión</span>
                </section>

                <section className="vl-digital__site-grid">
                  <article>
                    <small>01</small>
                    <strong>Hero y propuesta</strong>
                    <p>Entrada clara, tono visual definido y llamada a la acción visible.</p>
                  </article>
                  <article>
                    <small>02</small>
                    <strong>Servicios</strong>
                    <p>Sistema de bloques para explicar oferta, proceso y entregables.</p>
                  </article>
                  <article>
                    <small>03</small>
                    <strong>Pruebas visuales</strong>
                    <p>Aplicaciones, mockups y piezas que refuerzan la credibilidad de la marca.</p>
                  </article>
                </section>

                <section className="vl-digital__site-gallery">
                  <img src={`${ASSET}/branding-botanical-moodboard.png`} alt="Sistema visual aplicado a piezas de marca" />
                  <img src={`${ASSET}/sistema-contenido.png`} alt="Sistema de contenido conectado con la landing" />
                </section>

                <section className="vl-digital__site-cta">
                  <div>
                    <small>Captación</small>
                    <strong>Una ruta completa<br />desde la marca hasta el contacto.</strong>
                  </div>
                  <span>Formulario · CTA · WhatsApp · Agenda</span>
                </section>
              </motion.div>
            </div>
          </div>

          <div className="vl-digital__social">
            <div className="vl-digital__profile">
              <span>QB</span>
              <div><strong>qaway.brand</strong><small>Dirección visual y contenido</small></div>
            </div>
            <img src={`${ASSET}/sistema-contenido.png`} alt="Sistema de contenido aplicado a redes sociales" />
            <div className="vl-digital__metrics"><span>24 piezas</span><span>4 formatos</span><span>1 sistema</span></div>
          </div>

          <div className="vl-digital__path">
            {['Identidad', 'Redes', 'Landing', 'Captación'].map((item, index) => (
              <span key={item}><small>0{index + 1}</small>{item}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Method() {
  return (
    <section className="vl-dark vl-section vl-method">
      <div className="vl-shell">
        <motion.div {...reveal} className="vl-heading-row vl-heading-row--dark">
          <div>
            <p className="vl-kicker vl-kicker--dark">Método híbrido / 07</p>
            <h2>IA para acelerar.<br /><span>Criterio humano para decidir.</span></h2>
          </div>
          <p>La herramienta amplía posibilidades. La dirección define cuáles tienen sentido para tu proyecto.</p>
        </motion.div>

        <div className="vl-method__body">
          <div className="vl-method__phases">
            {phases.map(([number, title, copy], index) => (
              <motion.div {...reveal} key={title} className="vl-phase">
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
                {index < phases.length - 1 && <ChevronDown size={18} />}
              </motion.div>
            ))}
          </div>
          <motion.figure {...reveal} className="vl-method__image">
            <img src={`${ASSET}/metodologia-estudio.png`} alt="Dirección humana de un proceso visual asistido por IA" />
          </motion.figure>
        </div>

        <div className="vl-trust">
          {[
            [LockKeyhole, 'Archivos protegidos'],
            [CircleUserRound, 'Revisión estética humana'],
            [Layers3, 'Entregables organizados'],
          ].map(([Icon, label]) => <div key={label}><Icon size={18} /><span>{label}</span></div>)}
        </div>
      </div>
    </section>
  )
}

function Diagnostic() {
  const options = useMemo(() => [
    'Una marca o identidad en construcción',
    'Contenido para redes',
    'Una landing o presencia digital',
    'Fotografías, productos o piezas visuales',
    'Archivos antiguos',
    'Referencias o una idea',
    'No estoy seguro',
  ], [])

  const [form, setForm] = useState({
    project: '',
    material: options[0],
    result: 'Construir una identidad visual',
    email: '',
  })

  const submit = (event) => {
    event.preventDefault()
    const message = [
      'Hola Qaway, quiero solicitar un diagnóstico de Visual Lab.',
      '',
      `Proyecto: ${form.project}`,
      `Material disponible: ${form.material}`,
      `Resultado buscado: ${form.result}`,
      `Correo: ${form.email}`,
    ].join('\n')
    window.open(`${WHATSAPP_LINK.split('?text=')[0]}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <section id="diagnostico" className="vl-diagnostic">
      <div className="vl-diagnostic__form">
        <motion.div {...reveal}>
          <p className="vl-kicker">Diagnóstico visual / 08</p>
          <h2>Cuéntanos qué tienes.<br /><span>Te diremos qué podemos transformar.</span></h2>
          <p className="vl-diagnostic__intro">
            Fotos, contenido, referencias, una marca en construcción o una idea todavía desordenada. No necesitas saber qué servicio elegir.
          </p>
        </motion.div>

        <form onSubmit={submit}>
          <label>
            Cuéntanos de qué va tu proyecto
            <textarea
              required
              value={form.project}
              onChange={event => setForm({ ...form, project: event.target.value })}
              placeholder="Ej: Tengo fotografías de mis productos tomadas con celular y quiero convertirlas en imágenes para una campaña."
            />
          </label>
          <div className="vl-form-row">
            <label>
              Qué material tienes
              <select value={form.material} onChange={event => setForm({ ...form, material: event.target.value })}>
                {options.map(item => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              Qué resultado buscas
              <select value={form.result} onChange={event => setForm({ ...form, result: event.target.value })}>
                <option>Construir una identidad visual</option>
                <option>Crear contenido para redes</option>
                <option>Conectar redes y landing</option>
                <option>Construir presencia profesional</option>
                <option>Mejorar material existente</option>
                <option>No estoy seguro, quiero orientación</option>
              </select>
            </label>
          </div>
          <label>
            Tu correo
            <input
              required
              type="email"
              value={form.email}
              onChange={event => setForm({ ...form, email: event.target.value })}
              placeholder="tu@correo.com"
            />
          </label>
          <button type="submit">Solicitar diagnóstico visual <ArrowRight size={17} /></button>
        </form>
      </div>

      <div className="vl-diagnostic__visual">
        <img src={`${ASSET}/diagnostico-visual.png`} alt="Universo visual creativo desarrollado por Visual Lab" />
        <div className="vl-diagnostic__frame" />
        <span>No necesitas saber qué servicio elegir.</span>
      </div>
    </section>
  )
}

export default function EstudioPage() {
  useSetNavbarVariant('dark')
  return (
    <div className="estudio-page">
      <Hero />
      <Services />
      <div className="vl-section-cut">
        <span className="vl-section-cut__bar" />
        <span className="vl-section-cut__label">02 / Branding</span>
        <span className="vl-section-cut__bar vl-section-cut__bar--fade" />
      </div>
      <BrandingSpotlight />
      <ContentSystem />
      <DigitalPresenceCopy />
      <DigitalPresence />
      <Restoration />
      <PersonalBrand />
      <Method />
      <Diagnostic />
    </div>
  )
}
