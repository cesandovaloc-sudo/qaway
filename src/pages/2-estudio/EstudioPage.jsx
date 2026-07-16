import { useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
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
  Sparkles,
  Users,
  Check,
  Send
} from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import { supabase } from '@/config/supabase'
import './estudio.css'


const ASSET = '/assets/pages/2-estudio'

const services = [
  {
    number: '01',
    title: 'Branding digital',
    copy: 'Construimos, optimizamos y transformamos marcas para entornos digitales mediante estrategia, dirección visual e IA aplicada.',
    icon: Brush,
    image: 'estudio-proyecto-cafe.webp',
  },
  {
    number: '02',
    title: 'Contenido Visual',
    copy: 'Creamos piezas visuales estratégicas para plataformas digitales: reels, carruseles, edición y contenido que comunica y convierte.',
    icon: Layers3,
    image: 'estudio-servicio-contenido.webp',
    position: 'center 90%',
  },
  {
    number: '03',
    title: 'Estrategia Digital',
    copy: 'Diseñamos estructuras de posicionamiento, captación y crecimiento: contenido, funnels, landing pages, campañas y conexión con sistemas digitales.',
    icon: Image,
    image: 'estudio-servicio-estrategia.webp',
  },
  {
    number: '04',
    title: 'Presencia Profesional',
    copy: 'Construimos y optimizamos la imagen digital de profesionales, negocios y marcas personales para LinkedIn, web y redes.',
    icon: CircleUserRound,
    image: 'estudio-servicio-presencia.webp',
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
    image: `${ASSET}/estudio-proyecto-hospitalidad.webp`,
    palette: ['#111111', '#f2f1ef', '#a86137', '#fd5605'],
  },
  {
    name: 'Arquitectura',
    description: 'Sistema visual aplicado a marca, soporte y presentación.',
    image: `${ASSET}/estudio-proyecto-arquitectura.webp`,
    palette: ['#111111', '#f2f1ef', '#2850b8', '#fd5605'],
  },
  {
    name: 'Café de autor',
    description: 'Packaging, piezas editoriales y sistema de producto.',
    image: `${ASSET}/estudio-proyecto-cafe.webp`,
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

function SplitVisual({ beforeImage, afterImage, alt, dark = false }) {
  const containerRef = useRef(null)

  return (
    <div
      ref={containerRef}
      className={`vl-comparison ${dark ? 'vl-comparison--dark' : ''}`}
      onMouseMove={(event) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect()
        const position = Math.max(8, Math.min(92, ((event.clientX - rect.left) / rect.width) * 100));
        containerRef.current.style.setProperty('--split-position', `${position}%`);
      }}
      style={{ '--split-position': `50%`, width: '100%', height: '100%' }}
    >
      <img src={beforeImage} alt={`Original - ${alt}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
      <img src={afterImage} alt={`Resultado - ${alt}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, clipPath: `inset(0 0 0 var(--split-position))` }} />
      
      <span className="vl-comparison__label vl-comparison__label--left">Original</span>
      <span className="vl-comparison__label vl-comparison__label--right">Resultado</span>
      <div className="vl-comparison__line">
        <span><MousePointer2 size={15} /></span>
      </div>
    </div>
  )
}

function Hero() {
  const heroRef = useRef(null)
  const reduceMotion = useReducedMotion()

  return (
    <section
      ref={heroRef}
      className="vl-hero"
      onMouseMove={(event) => {
        if (!heroRef.current) return;
        const rect = heroRef.current.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        heroRef.current.style.setProperty('--pointer-x', `${x}%`);
        heroRef.current.style.setProperty('--pointer-y', `${y}%`);
      }}
      style={{ '--pointer-x': `72%`, '--pointer-y': `43%` }}
    >
      {/* Nav removed */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.95, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
      >
        <img className="vl-hero__image" src={`${ASSET}/estudio-hero-visual.webp`} alt="Transformación visual dirigida por Qaway Lab" style={{ transform: 'scale(1.10) translate(2%, 19%)' }} />
      </motion.div>
      
      <div className="vl-hero__right-pane">
        <motion.div
          className="vl-hero__panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="vl-hero__panel-mark" />
          <p className="vl-hero__panel-kicker">Visual Lab</p>
          <h2>
            Dirección visual<br />
            para conectar.
          </h2>
          <div className="vl-hero__panel-rule" />
          <p>Diseñamos identidades modernas e imágenes con IA para que tu marca se presente con coherencia y claridad.</p>

          <div className="vl-hero__panel-card">
            <div className="vl-hero__panel-icon"><Sparkles size={20} strokeWidth={1.6} /></div>
            <div>
              <strong>Criterio estético</strong>
              <span>Diseño que eleva tu marca.</span>
            </div>
          </div>


        </motion.div>
      </div>


      <motion.div initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85 }} className="vl-hero__content">
        <div className="vl-hero__main">
          <p className="vl-eyebrow">Visual Lab / dirección visual + contenido</p>
          <h1>
            Menos<br />
            piezas sueltas.<br />
            <em>Más<br />Dirección<br />Visual.</em>
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
              <a
                href="#diagnostico"
                className="vl-button vl-button--acid vl-branding__cta">
                Construir mi marca <ArrowRight size={16} />
              </a>
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
    <section id="branding" className="vl-section vl-branding" style={{ backgroundColor: '#f3f1ee', paddingBottom: '60px' }}>
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
                {/*
                <Link
                  to="/estudio/branding-digital"
                  className="vl-text-link">
                  Ver detalles <ArrowRight size={15} />
                </Link>
                */}
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
    <section id="servicios" className="vl-dark vl-section" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="vl-shell w-full">
        <motion.div {...reveal} className="vl-services__heading" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center', width: '100%', maxWidth: 'none' }}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            
            <h2 style={{ fontSize: 'clamp(2.2rem, 3.6vw, 4rem)', textAlign: 'center', margin: '0 auto' }}>Cuatro áreas<br /><span>para construir tu marca<span style={{ color: 'var(--vl-acid)' }}>.</span></span></h2>
          </div>
        </motion.div>

        <div className="vl-services-grid" style={{ width: '85%', margin: '0 auto' }}>
          {featuredServices.map((service, index) => {
            const Icon = service.icon
            const paths = [
              '#branding',
              '#contenido',
              '#estrategia-digital',
              '#transformacion'
            ]
            return (
              <a key={service.title} href={paths[index]} className="vl-service-link">
                <TiltPanel className={`vl-service vl-service--${index + 1}`}>
                  {service.image && <img src={`${ASSET}/${service.image}`} alt={`Servicio de ${service.title}`} loading="lazy" style={{ objectPosition: service.position || 'center' }} />}
                  <div className="vl-service__body">
                    <div className="vl-service__top"><span>{service.number}</span><Icon size={22} /></div>
                    <h3>{service.title}</h3>
                    <ArrowRight className="vl-service__arrow" size={18} />
                  </div>
                </TiltPanel>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function TransformacionVisualCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  
  const slides = [
    {
      id: 'presencia',
      title: 'Presencia Profesional',
      beforeImage: `${ASSET}/estudio-transformacion-presencia-antes.webp`,
      afterImage: `${ASSET}/estudio-transformacion-presencia-despues.webp`,
      alt: 'Transformación de presencia profesional'
    },
    {
      id: 'producto',
      title: 'Optimización Visual',
      beforeImage: `${ASSET}/estudio-transformacion-producto-antes.webp`, 
      afterImage: `${ASSET}/estudio-transformacion-producto-despues.webp`,
      alt: 'Optimización de producto y visuales'
    },
    {
      id: 'restauracion',
      title: 'Restauración',
      beforeImage: `${ASSET}/estudio-transformacion-restauracion-antes.webp`, 
      afterImage: `${ASSET}/estudio-transformacion-restauracion-despues.webp`,
      alt: 'Fotografía antigua restaurada'
    }
  ];

  return (
    <section id="transformacion" className="vl-section" style={{ backgroundColor: '#ffffff', color: '#191918', paddingTop: '60px' }}>
      <div className="vl-shell vl-content-system" style={{ gridTemplateColumns: '.95fr .95fr', gap: '80px' }}>
        <motion.div {...reveal} className="vl-content-system__copy">
          <p className="vl-kicker" style={{ color: 'var(--vl-acid)', fontSize: '12px', fontWeight: 'bold' }}>Transformación visual / 04</p>
          <h2>TU IMAGEN TAMBIÉN<br /><span>COMUNICA PROFESIONALISMO.</span></h2>
          <p>
            Mejoramos la forma en que profesionales, negocios y marcas se presentan en medios digitales: perfiles, fotografías, productos, piezas comerciales y material visual que necesita verse más claro, cuidado y confiable.
          </p>

          {/* Navigation Tabs (Vertical Stack) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '380px', marginTop: '32px' }}>
            {slides.map((slide, index) => (
              <motion.button
                key={slide.id}
                onClick={() => setActiveSlide(index)}
                whileInView={
                  activeSlide === index 
                    ? { boxShadow: ["0px 0px 0px rgba(255,75,11,0)", "0px 0px 25px rgba(255,75,11,0.25)", "0px 0px 0px rgba(255,75,11,0)"] }
                    : { boxShadow: "0px 0px 0px rgba(255,75,11,0)" }
                }
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 2, repeat: 4, ease: "easeInOut" }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  border: '1px solid',
                  borderColor: activeSlide === index ? 'var(--vl-acid)' : 'rgba(0,0,0,0.08)',
                  backgroundColor: activeSlide === index ? '#fcfbf7' : 'transparent',
                  color: activeSlide === index ? 'var(--vl-acid)' : '#8b8c88',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 'bold', opacity: activeSlide === index ? 1 : 0.5 }}>
                  0{index + 1}
                </span>
                <span style={{ fontSize: '15px', fontWeight: activeSlide === index ? 'bold' : 'normal' }}>
                  {slide.title}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div {...reveal} className="vl-content-showcase" style={{ padding: 0, background: 'none' }}>
          <div
            style={{
              width: '100%',
              height: '75vh',
              minHeight: '550px',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: '6px',
              backgroundColor: '#f3f1ee'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
              >
                <SplitVisual 
                  beforeImage={slides[activeSlide].beforeImage} 
                  afterImage={slides[activeSlide].afterImage} 
                  alt={slides[activeSlide].alt} 
                  dark={false} 
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ContentSystem() {
  const formats = ['1:1', '4:5', '9:16', '16:9']

  return (
    <section id="contenido" className="vl-section vl-social" style={{ backgroundColor: '#ffffff', color: '#191918', paddingTop: '60px' }}>
      <div className="vl-shell vl-content-system">
        <motion.div {...reveal} className="vl-content-system__copy">
          <p className="vl-kicker" style={{ color: 'var(--vl-acid)', fontSize: '12px', fontWeight: 'bold' }}>Contenido para redes / 02</p>
          <h2>Una marca activa.<br /><span>Muchos formatos, una sola voz.</span></h2>
          <p>
            Diseñamos sistemas de contenido para que carruseles, reels, campañas y publicaciones se reconozcan como parte de la misma marca.
          </p>
          {/* 
          <Link to="/estudio/contenido-visual" className="vl-button vl-button--acid">Diseñar mi contenido <ArrowRight size={16} /></Link>
          */}
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
            src="/assets/pages/2-estudio/estudio-social-media-reel.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-label="Proceso de concepto, producción y edición de contenido para redes sociales"
          />
          <div className="vl-content-showcase__veil" />

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

function Method() {
  const [activePhase, setActivePhase] = useState(0)

  return (
    <section id="metodo" className="vl-dark vl-section vl-method">
      <div className="vl-shell">
        <motion.div {...reveal} className="vl-heading-row vl-heading-row--dark" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '5px', marginBottom: '0' }}>
          <div>
            <p className="vl-kicker vl-kicker--dark">Método híbrido / 05</p>
            <h2 style={{ marginBottom: 0 }}>IA para acelerar.<br /><span style={{ color: '#fff' }}>Criterio humano para decidir.</span></h2>
          </div>
        </motion.div>

        <div className="vl-method__body" style={{ marginTop: '32px', alignItems: 'flex-start' }}>
          <div className="vl-method__phases" style={{ gap: '0px', display: 'flex', flexDirection: 'column' }}>
            {phases.map(([number, title, copy], index) => (
              <motion.div
                {...reveal}
                key={title}
                className="vl-phase"
                onClick={() => setActivePhase(activePhase === index ? -1 : index)}
                style={{
                  cursor: 'pointer',
                  padding: '16px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '24px'
                }}
              >
                <span style={{ color: activePhase === index ? 'var(--vl-acid)' : '#666', font: 'bold 13px monospace' }}>{number}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: activePhase === index ? '#fff' : '#8b8c88', transition: 'color 0.3s' }}>
                    {title}
                  </h3>
                  <AnimatePresence>
                    {activePhase === index && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', margin: 0, color: '#aaa99f', fontSize: '15px', lineHeight: 1.6, paddingTop: '10px' }}
                      >
                        {copy}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <motion.div
                  animate={{ rotate: activePhase === index ? 180 : 0 }}
                  style={{ color: activePhase === index ? 'var(--vl-acid)' : '#666' }}
                >
                  <ChevronDown size={18} />
                </motion.div>
              </motion.div>
            ))}
          </div>
          <motion.figure {...reveal} className="vl-method__image" style={{ minHeight: 'unset', height: '350px', borderRadius: '8px', marginTop: '-20px' }}>
            <img src={`${ASSET}/estudio-servicio-contenido.webp`} alt="Dirección humana de un proceso visual asistido por IA" loading="lazy" style={{ borderRadius: '8px' }} />
          </motion.figure>
        </div>

        <div className="vl-trust" style={{ marginTop: '20px' }}>
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
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const submit = async (event) => {
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
        source: 'Estudio',
        stage: 'new',
        metadata: {
          email: lead.email,
          profile: lead.profile,
          interest: lead.interest,
          message: lead.message || 'Sin mensaje adicional',
        },
      }])
      if (error) throw error

      const apiKey = import.meta.env.VITE_WEB3FORMS_VENTAS_KEY || ''
      if (apiKey.trim()) {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: apiKey.trim(),
            subject: `Nueva consulta Estudio: ${lead.interest || 'Orientación'}`,
            from_name: 'Visual Lab Estudio',
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            profile: lead.profile,
            interest: lead.interest,
            message: lead.message || 'Sin mensaje adicional',
          }),
        })
      }
      setSubmitted(true)
    } catch (e) {
      console.error(e)
      setSubmitError('Hubo un error al enviar tu solicitud. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => setSubmitted(false)

  return (
    <section id="diagnostico" className="vl-diagnostic">
      <div className="vl-diagnostic__form academy-section academy-form-section" style={{ padding: '0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ padding: 'clamp(30px, 4vh, 70px) clamp(28px, 6vw, 100px)' }}>
          <motion.div {...reveal} className="academy-form-intro" style={{ marginBottom: '20px' }}>
            <h2 style={{ textTransform: 'none' }}>Hablemos de tu <span>Proyecto.</span></h2>
          </motion.div>

          <motion.div {...reveal}>
            <form onSubmit={submit} className="academy-interest-form">
              {submitted ? (
                <div className="academy-form-success">
                  <div><Check size={28} /></div>
                  <h3>¡Consulta enviada!</h3>
                  <p>Te responderemos lo antes posible para ayudarte a elegir tu siguiente paso.</p>
                  <button type="button" onClick={resetForm}>Enviar otro mensaje</button>
                </div>
              ) : (
                <>
                  <div className="academy-field">
                    <label htmlFor="academy-name">¿Cómo te llamas?</label>
                    <input type="text" id="academy-name" name="name" required placeholder="Tu nombre completo" />
                  </div>
                  <div className="academy-field-row">
                    <div className="academy-field">
                      <label htmlFor="academy-phone">Teléfono</label>
                      <input type="tel" id="academy-phone" name="phone" required placeholder="+51 999 999 999" />
                    </div>
                    <div className="academy-field">
                      <label htmlFor="academy-email">Correo</label>
                      <input type="email" id="academy-email" name="email" required placeholder="tucorreo@empresa.com" />
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
                      <label htmlFor="academy-interest">¿Qué Servicio te interesa?</label>
                      <select id="academy-interest" name="interest" required>
                        <option value="">Selecciona un interés</option>
                        <option value="Identidad Visual">Identidad Visual</option>
                        <option value="Landing Page o Web">Landing Page o Web</option>
                        <option value="Contenido para Redes">Contenido para Redes</option>
                        <option value="Presencia Digital Completa">Presencia Digital Completa</option>
                        <option value="Orientación general / Otro">Orientación general / Otro</option>
                      </select>
                    </div>
                  </div>

                  <div className="academy-field">
                    <label htmlFor="academy-message">Cuéntanos un poco más</label>
                    <textarea id="academy-message" name="message" rows="4" placeholder="¿Qué quieres lograr o qué dificultad estás intentando resolver?" />
                  </div>
                  <button type="submit" className="academy-submit-button" disabled={submitting}>
                    {submitting ? 'ENVIANDO CONSULTA...' : 'SOLICITAR ORIENTACIÓN'}
                    <Send size={17} />
                  </button>
                  {submitError && <p className="academy-form-error" role="alert">{submitError}</p>}
                </>
              )}
            </form>
          </motion.div>
        </div>
      </div>

      <div className="vl-diagnostic__visual">
        <img src={`${ASSET}/diagnostico-visual.webp`} alt="Contacto creativo desarrollado por Visual Lab" loading="lazy" />
        <div className="vl-diagnostic__frame" />
      </div>
    </section>
  )
}

export default function EstudioPage() {
  useSetNavbarVariant('light')

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])
  return (
    <div className="estudio-page">
      <Hero />
      <Services />

      <BrandingSpotlight />
      <ContentSystem />
      <DigitalPresenceCopy />
      <TransformacionVisualCarousel />
      <Method />
      <Diagnostic />
    </div>
  )
}
