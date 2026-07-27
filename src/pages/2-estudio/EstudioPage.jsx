import { useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Navbar, { useSetNavbarVariant } from '@/components/layout/Navbar'
import { SectionPrimitive, Kicker } from '@/components/typography'
import DigitalPresenceCopy from './DigitalPresenceCopy';
import SEO from '../../components/seo/SEO';
import {
  ArrowDown,
  ArrowRight,
  Brush,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Image as ImageIcon,
  Layers3,
  LockKeyhole,
  MousePointer2,
  PenTool,
  Sparkles,
  Users,
  Check,
  Send
} from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import { supabase } from '@/config/supabase'
import './estudio.css'


const ASSET = '/assets/pages/2-estudio'
const displayFont = {
  fontFamily: "'Arial Narrow', 'Roboto Condensed', 'Helvetica Neue Condensed', Impact, sans-serif",
  fontStretch: 'condensed',
  fontWeight: 700,
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

const services = [
  {
    number: '01',
    title: 'Branding digital',
    copy: 'Diseñamos identidades visuales desde cero o renovamos tu marca actual (Rebranding) aplicando estrategia y diseño asistido por IA.',
    icon: Brush,
    image: 'estudio-proyecto-cafe.webp',
  },
  {
    number: '02',
    title: 'Contenido Visual',
    copy: 'Producimos contenido visual para redes y canales: reels de alto impacto, carruseles educativos y edición de video lista para publicar.',
    icon: Layers3,
    image: 'estudio-servicio-contenido.webp',
    position: 'center 90%',
  },
  {
    number: '03',
    title: 'Estrategia Digital',
    copy: 'Trazamos la estrategia digital para conectar tu marca: páginas web, embudos de venta (funnels) y campañas estructuradas para captar leads.',
    icon: ImageIcon,
    image: 'estudio-servicio-estrategia.webp',
  },
  {
    number: '04',
    title: 'Presencia Profesional',
    copy: 'Optimizamos tu imagen profesional en canales clave (como LinkedIn e Instagram): retratos, biografías y perfiles que proyectan autoridad.',
    icon: CircleUserRound,
    image: 'estudio-servicio-presencia.webp',
  },
]

const featuredServices = services

const phases = [
  ['01', 'Diagnóstico de marca', 'Qué comunica, a quién habla y cómo debe verse.'],
  ['02', 'Dirección visual', 'Estilo, tono y criterios para mantener coherencia.'],
  ['03', 'Piezas clave', 'Identidad, contenido y materiales comerciales.'],
  ['04', 'Formatos finales', 'Listos para redes, web, presentación o venta.'],
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
  const reduceMotion = useReducedMotion()

  return (
    <section
      className="relative min-h-[100dvh] overflow-hidden pt-20 text-[#20201f]"
      style={{
        background:
          'radial-gradient(circle at 76% 14%, rgba(255, 75, 11, 0.05), transparent 24rem), linear-gradient(135deg, #f8f9f7 0%, #efeeeb 100%)',
      }}
    >
      <Navbar variant="light" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 180 180%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.74%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.44%22/%3E%3C/svg%3E")',
        }}
      />

      <div className="relative mx-auto grid min-h-[calc(100dvh-5rem)] max-w-[96rem] lg:grid-cols-[1.03fr_0.97fr_0.70fr]">
        {/* Columna 1: Texto Principal */}
        <div className="relative flex flex-col justify-center bg-[#f8f9f7] px-6 py-10 sm:px-10 lg:min-h-[28rem] lg:justify-center lg:py-10 lg:px-10 before:pointer-events-none before:absolute before:inset-y-0 before:right-full before:w-[50vw] before:bg-[#f8f9f7] before:content-['']">
          <motion.div
            initial={reduceMotion ? false : 'hidden'}
            animate={reduceMotion ? undefined : 'show'}
            variants={fadeUp}
            custom={0}
            className="relative z-10"
          >
            <p className="mb-4 text-[0.75rem] font-bold uppercase tracking-[0.015em] text-[#73716d]">
              Estudio creativo / Branding, contenido y presencia digital
            </p>
            <h1
              className="max-w-[58rem] text-[clamp(3.2rem,5.5vw,6.5rem)] leading-[0.82] tracking-[-0.055em] text-[#20201f]"
              style={{ ...displayFont, fontWeight: 760 }}
            >
              <span className="block">Creamos la identidad y <span className="text-[#ff4b0b]">presencia digital para tu marca.</span></span>
            </h1>
            <p className="mt-4 max-w-[34rem] text-[clamp(0.88rem,1vw,1rem)] leading-[1.5] text-[#4e4d4a]">
              Desarrollamos el branding y contenido digital para que tu proyecto o marca tenga una presencia profesional, confiable y lista para vender.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-5">
              <a
                href="#diagnostico"
                className="group inline-flex min-h-[46px] items-center gap-2.5 bg-[#ff4b0b] px-6 py-3 text-[0.82rem] font-bold text-white shadow-[0_14px_36px_rgba(168,53,8,0.16)] transition-colors hover:bg-[#df3900] active:translate-y-px vl-branding__cta"
              >
                Quiero mejorar mi marca
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Columna 2: Imagen Central con Tarjetas Ancladas */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.95, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[40vh] overflow-visible border-[#20201f]/10 lg:min-h-[30rem] lg:border-x"
        >
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={`${ASSET}/estudio-hero-visual6.webp`}
              alt="Transformación visual dirigida por Qaway Lab"
              className="absolute inset-0 h-full w-full object-cover object-[52%_18%] grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/12" />
          </div>

          <div className="absolute inset-0 z-10 hidden lg:block">
            {/* Tarjeta 1: Branding */}
            <motion.div
              className="absolute left-[2%] top-[40%] w-[15rem]"
              animate={reduceMotion ? {} : { y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
            >
              <a
                href="#branding"
                className="group block border border-[#ff4b0b]/50 bg-[#fbfaf8]/75 p-3 text-[#20201f] shadow-[0_24px_70px_rgba(32,32,31,0.16)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#ff4b0b] hover:bg-white"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center bg-[#ff4b0b] text-white shadow-[0_16px_34px_rgba(255,75,11,0.22)]">
                    <PenTool size={22} strokeWidth={1.65} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#5c5a57]">
                      Branding
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-[#3e3d3b]">
                      Identidad clara y propia
                    </span>
                  </span>
                </span>
                <span className="absolute -left-6 top-1/2 h-px w-6 bg-[#ff4b0b]/80" />
              </a>
            </motion.div>

            {/* Tarjeta 2: Contenido Visual */}
            <motion.div
              className="absolute right-[-2%] bottom-32 w-[15.5rem]"
              animate={reduceMotion ? {} : { y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
            >
              <a
                href="#contenido"
                className="group block border border-[#ff4b0b]/50 bg-[#fbfaf8]/75 p-3 text-[#20201f] shadow-[0_24px_70px_rgba(32,32,31,0.16)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#ff4b0b] hover:bg-white"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center bg-[#ff4b0b] text-white shadow-[0_16px_34px_rgba(255,75,11,0.22)]">
                    <ImageIcon size={22} strokeWidth={1.65} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#5c5a57]">
                      Contenido Visual
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-[#3e3d3b]">
                      Piezas y videos profesionales
                    </span>
                  </span>
                </span>
                <span className="absolute -right-6 top-1/2 h-px w-6 bg-[#ff4b0b]/80" />
              </a>
            </motion.div>
          </div>

          {/* Bloque Móvil Responsivo (Idéntico a Inicio - Ubicado en la parte final de la foto) */}
          <div className="relative z-10 mt-[calc(38vh-1rem)] sm:mt-[calc(46vh-1rem)] grid gap-2 px-4 pb-4 sm:grid-cols-2 lg:hidden">
            <a
              href="#branding"
              className="flex items-center gap-3 border border-[#ff4b0b]/45 bg-[#fbfaf8]/75 p-3 text-[#20201f] shadow-[0_16px_45px_rgba(32,32,31,0.12)]"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center bg-[#ff4b0b] text-white">
                <PenTool size={21} strokeWidth={1.65} />
              </span>
              <span>
                <span className="block text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#5c5a57]">Branding</span>
                <span className="mt-1 block text-xs text-[#3e3d3b]">Identidad clara y propia</span>
              </span>
            </a>

            <a
              href="#contenido"
              className="flex items-center gap-3 border border-[#ff4b0b]/45 bg-[#fbfaf8]/75 p-3 text-[#20201f] shadow-[0_16px_45px_rgba(32,32,31,0.12)]"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center bg-[#ff4b0b] text-white">
                <ImageIcon size={21} strokeWidth={1.65} />
              </span>
              <span>
                <span className="block text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#5c5a57]">Contenido Visual</span>
                <span className="mt-1 block text-xs text-[#3e3d3b]">Piezas y videos profesionales</span>
              </span>
            </a>
          </div>
        </motion.div>

        {/* Columna 3: Panel Derecho */}
        <div className="relative hidden lg:flex flex-col justify-center bg-[#f8f9f7] px-6 py-10 sm:px-10 lg:min-h-[28rem] lg:justify-center lg:py-10 lg:px-10 after:pointer-events-none after:absolute after:inset-y-0 after:left-full after:w-[50vw] after:bg-[#f8f9f7] after:content-['']">
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-4 text-[0.75rem] font-bold uppercase tracking-[0.015em] text-[#73716d]">ESTUDIO VISUAL</p>
            <h2 className="text-[clamp(1.8rem,2.8vw,3.6rem)] leading-[0.87] tracking-[-0.055em] text-[#20201f]" style={{ ...displayFont, fontWeight: 760 }}>
              Identidad visual<br />
              lista para vender.
            </h2>
            <div className="my-4 h-0.5 w-10 bg-[#ff4b0b]" />
            <p className="text-[clamp(0.88rem,1vw,1rem)] leading-[1.65] text-[#6d6b68]">
              Creamos identidad de marca y piezas gráficas para que tu marca se vea clara, actual y profesional en cada punto de contacto.
            </p>
          </motion.div>
        </div>
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
        <motion.div
          className="vl-branding__copy order-1 lg:order-2"
          variants={copyStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: .22 }}
        >
          <div>
            <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Branding digital / 01</p>
            <h2
              className="text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em]"
              style={{ ...displayFont, fontWeight: 760 }}
            >
              Branding para que tu marca<br />se vea <span className="text-[#ff4b0b]">clara y profesional.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[clamp(0.94rem,1.05vw,1.06rem)] leading-[1.5] text-[#4e4d4a]">
              Desarrollamos una identidad visual coherente para aplicar en redes, web, presentaciones y piezas comerciales.
            </p>
          </div>
          <motion.div className="vl-branding__deliverables">
            {['Logo e identidad', 'Moodboard', 'Paleta y tipografía', 'Sistema visual'].map((item, index) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -1, transition: { duration: 0.06, ease: "linear", delay: 0 } }}
                viewport={{ once: true }}
                transition={{
                  delay: .32 + index * .05,
                  duration: .08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <small>0{index + 1}</small>{item}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        <motion.figure
          initial={{ opacity: 0, scale: .965, x: -34 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: true, amount: .18 }}
          transition={{ duration: .85, ease: [0.22, 1, 0.36, 1] }}
          className="vl-branding__visual order-2 lg:order-1"
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
            <div>
              <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Servicios Creativos</p>
              <h2
                className="mx-auto text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em]"
                style={{ ...displayFont, fontWeight: 760 }}
              >
                Servicios creativos<br />para <span className="text-white">construir tu marca.</span>
              </h2>
            </div>
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
      title: 'Catálogo y Producto',
      beforeImage: `${ASSET}/estudio-transformacion-producto-antes.webp`,
      afterImage: `${ASSET}/estudio-transformacion-producto-despues.webp`,
      alt: 'Transformación visual de catálogo y producto'
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
      <div className="vl-shell vl-content-system grid grid-cols-1 lg:grid-cols-[.95fr_.95fr] gap-8 lg:gap-20">
        <motion.div {...reveal} className="vl-content-system__copy">
          <div>
            <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Transformación visual / 04</p>
            <h2
              className="text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em]"
              style={{ ...displayFont, fontWeight: 760 }}
            >
              Tu imagen también<br /><span className="text-[#ff4b0b]">comunica profesionalismo.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[clamp(0.94rem,1.05vw,1.06rem)] leading-[1.5] text-[#4e4d4a]">
              Transformamos tus imágenes de productos, servicios y perfiles comerciales en un portafolio visual moderno, profesional y listo para transmitir autoridad y confianza a tus clientes.
            </p>
          </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '380px', marginTop: '24px' }}>
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

        <motion.div {...reveal} className="vl-content-showcase w-full h-[380px] lg:h-[75vh] min-h-[380px] lg:min-h-[550px]" style={{ padding: 0, background: 'none' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
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
  const formats = ['Feed', 'Carrusel', 'Reels', 'Stories', 'Web']

  return (
    <section id="contenido" className="vl-section vl-social" style={{ backgroundColor: '#ffffff', color: '#191918', paddingTop: '60px' }}>
      <div className="vl-shell vl-content-system">
        <motion.div {...reveal} className="vl-content-system__copy">
          <div>
            <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Contenido para redes sociales / 02</p>
            <h2
              className="text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em]"
              style={{ ...displayFont, fontWeight: 760 }}
            >
              Diseñamos contenido visual<br />para una <span className="text-[#ff4b0b]">marca coherente.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[clamp(0.94rem,1.05vw,1.06rem)] leading-[1.5] text-[#4e4d4a]">
              Creamos contenido visual para que tus reels, carruseles y publicaciones mantengan una misma dirección visual y te ayuden a posicionarte.
            </p>
          </div>
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
            <div className="flex flex-col gap-10">
              <div className="border-b border-red-500/20 pb-6">
                <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Método híbrido / 05</p>
                <h2
                  className="text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em]"
                  style={{ ...displayFont, fontWeight: 760 }}
                >
                  IA para acelerar el proceso.<br /><span className="text-[#ff4b0b]">Dirección para cuidar el resultado.</span>
                </h2>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="vl-method__body" style={{ marginTop: '32px', alignItems: 'flex-start' }}>
          <div className="vl-method__phases" style={{ gap: '0px', display: 'flex', flexDirection: 'column' }}>
            {phases.map(([number, title, copy], index) => (
              <motion.div
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
                  <motion.p
                    animate={{
                      maxHeight: activePhase === index ? 88 : 0,
                      opacity: activePhase === index ? 1 : 0,
                      y: activePhase === index ? 0 : -3,
                      paddingTop: activePhase === index ? 10 : 0,
                    }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{ overflow: 'hidden', margin: 0, color: '#aaa99f', fontSize: '15px', lineHeight: 1.6 }}
                  >
                    {copy}
                  </motion.p>
                </div>
                <motion.div
                  animate={{ rotate: activePhase === index ? 180 : 0 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
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
            <div>
              <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Contacto</p>
              <h2
                className="text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em]"
                style={{ ...displayFont, fontWeight: 760 }}
              >
                Hablemos de tu <span className="text-[#ff4b0b]">proyecto.</span>
              </h2>
            </div>
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
                        <option value="Profesional">Profesional</option>
                        <option value="Emprendedor o dueño de negocio">Emprendedor o dueño de negocio</option>
                        <option value="Marca personal">Marca personal</option>
                        <option value="Creador de contenido">Creador de contenido</option>
                        <option value="Equipo comercial o de marketing">Equipo comercial o de marketing</option>
                        <option value="Empresa o institución">Empresa o institución</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div className="academy-field">
                      <label htmlFor="academy-interest">¿En qué servicio estás interesado/a?</label>
                      <select id="academy-interest" name="interest" required>
                        <option value="">Selecciona un interés</option>
                        <option value="Branding digital">Branding digital</option>
                        <option value="Contenido visual">Contenido visual</option>
                        <option value="Estrategia digital">Estrategia digital</option>
                        <option value="Presencia profesional">Presencia profesional</option>
                        <option value="Transformación visual">Transformación visual</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>

                  <div className="academy-field">
                    <label htmlFor="academy-message">Cuéntanos un poco más</label>
                    <textarea id="academy-message" name="message" rows="4" placeholder="¿Qué quieres lograr o qué dificultad estás intentando resolver?" />
                  </div>
                  <button type="submit" className="academy-submit-button" disabled={submitting}>
                    {submitting ? 'ENVIANDO CONSULTA...' : 'QUIERO ORIENTACIÓN'}
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

  const estudioSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Estudio Creativo y Dirección Visual",
    "provider": {
      "@type": "Organization",
      "name": "Qaway Lab",
      "url": "https://qaway.pe"
    },
    "description": "Desarrollamos la identidad visual, branding y contenido digital para que tu proyecto o marca tenga una presencia profesional y confiable.",
    "areaServed": "PE",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Servicios Creativos",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Branding digital"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Contenido Visual"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Estrategia Digital"
          }
        }
      ]
    }
  };

  return (
    <div className="estudio-page">
      <SEO
        title="Estudio Creativo y Dirección Visual | Qaway Lab"
        description="Creamos la identidad visual, branding y contenido digital para que tu proyecto tenga una presencia profesional y confiable."
        canonical="https://qaway.pe/estudio"
        schema={estudioSchema}
      />
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










