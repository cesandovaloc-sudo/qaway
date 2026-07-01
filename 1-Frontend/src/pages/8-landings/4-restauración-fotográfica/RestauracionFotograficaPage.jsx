import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, MousePointer2, Image, Sparkles, ScanSearch, WandSparkles, Menu, X } from 'lucide-react'
import '@/pages/2-estudio/estudio.css'
import './restauracion.css'

const ASSET = '/assets/pages/8-landings/4-restauración-fotográfica'

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: .15 },
  transition: { duration: .65, ease: [0.22, 1, 0.36, 1] },
}

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: .1 } },
  viewport: { once: true, amount: .15 },
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: .6, ease: [0.22, 1, 0.36, 1] },
}

const services = [
  { icon: Image, title: 'Restauración de archivo', desc: 'Fotos antiguas, documentos dañados o imágenes de baja resolución recuperadas con precisión.' },
  { icon: Sparkles, title: 'Mejora de producto', desc: 'Corrección de color, iluminación y composición para catálogos y tiendas online.' },
  { icon: ScanSearch, title: 'Rediseño de logos', desc: 'Vectorizamos, limpiamos y actualizamos marcas existentes sin perder su esencia original.' },
  { icon: WandSparkles, title: 'Optimización creativa', desc: 'Piezas visuales, collages y composiciones que necesitan un ajuste profesional para brillar.' },
]

const steps = [
  { number: '01', title: 'Cuéntanos qué tienes', desc: 'Fotos, logos, archivos — cualquier formato. Una referencia basta para empezar.' },
  { number: '02', title: 'Evaluamos el trabajo', desc: 'Analizamos el estado del material y te proponemos el alcance de la intervención.' },
  { number: '03', title: 'Transformamos', desc: 'Aplicamos corrección, restauración o rediseño según lo que necesita cada pieza.' },
  { number: '04', title: 'Entregamos resultado', desc: 'Listo para usar en tu web, redes o catálogo. Con derecho a ajustes.' },
]

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
  return (
    <section className="vl-dark vl-section">
      <div className="vl-shell vl-hero__grid">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="vl-kicker vl-kicker--dark">Qaway Lab</p>
          <h2 style={{ fontSize: 'clamp(2.6rem, 5vw, 5rem)' }}>
            Restauración<br /><span>Fotográfica</span>
          </h2>
          <p style={{ maxWidth: 480, marginTop: 28, color: '#8b8c88', lineHeight: 1.7 }}>
            Recuperamos imágenes, logos y piezas visuales para que funcionen mejor dentro de tu marca.
          </p>
          <a
            href="https://wa.me/51930756781"
            target="_blank"
            rel="noopener noreferrer"
            className="vl-button vl-button--acid vl-hero__cta"
            style={{ marginTop: 40 }}
          >
            Solicitar diagnóstico <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

function ServiceCards() {
  return (
    <section className="vl-paper vl-section">
      <div className="vl-shell">
        <motion.div {...reveal} style={{ maxWidth: 640, marginBottom: 64 }}>
          <p className="vl-kicker">Qué hacemos</p>
          <h2>Devolvemos vida a tus<br /><span>imágenes y marcas.</span></h2>
        </motion.div>
        <motion.div {...stagger} className="vl-service-grid">
          {services.map((s, i) => (
            <motion.article key={i} {...fadeUp} className="vl-service-card">
              <div className="vl-service-card__icon"><s.icon size={22} /></div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function ComparisonShowcase() {
  return (
    <section className="vl-dark vl-section">
      <div className="vl-shell vl-showcase__grid">
        <motion.div {...reveal}>
          <p className="vl-kicker vl-kicker--dark">Antes y después</p>
          <h2>El resultado habla<br /><span>más que las palabras.</span></h2>
          <p style={{ maxWidth: 420, marginTop: 28, color: '#8b8c88', lineHeight: 1.7 }}>
            Desliza el control sobre cada imagen para ver la transformación. No retocamos — reconstruimos.
          </p>
        </motion.div>
        <div className="vl-showcase__pairs">
          <motion.div {...reveal}>
            <SplitVisual src={`${ASSET}/producto-antes-despues.png`} alt="Fotografía de producto optimizada" dark />
            <p className="vl-showcase__label"><span>01</span> Objeto y presentación comercial</p>
          </motion.div>
          <motion.div {...reveal}>
            <SplitVisual src={`${ASSET}/restauracion-antes-despues.png`} alt="Fotografía antigua restaurada" />
            <p className="vl-showcase__label"><span>02</span> Restauración de archivo</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Process() {
  return (
    <section className="vl-paper vl-section">
      <div className="vl-shell">
        <motion.div {...reveal} style={{ maxWidth: 600, marginBottom: 64 }}>
          <p className="vl-kicker">Cómo funciona</p>
          <h2>Simple, rápido y sin<br /><span>compromiso.</span></h2>
        </motion.div>
        <motion.div {...stagger} className="vl-process__grid">
          {steps.map((s, i) => (
            <motion.div key={i} {...fadeUp} className="vl-process__step">
              <span className="vl-process__number">0{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="vl-dark vl-section" style={{ paddingBottom: 180 }}>
      <div className="vl-shell" style={{ textAlign: 'center' }}>
        <motion.div {...reveal} style={{ maxWidth: 640, margin: '0 auto' }}>
          <p className="vl-kicker vl-kicker--dark">¿Listo para empezar?</p>
          <h2>Hablemos de lo que<br />necesitas <span>recuperar.</span></h2>
          <p style={{ maxWidth: 480, margin: '28px auto 0', color: '#8b8c88', lineHeight: 1.7 }}>
            Cuéntanos qué material tienes y te diremos cómo podemos transformarlo. Sin compromiso.
          </p>
          <a
            href="https://wa.me/51930756781"
            target="_blank"
            rel="noopener noreferrer"
            className="vl-button vl-button--acid"
            style={{ marginTop: 40 }}
          >
            Empezar ahora <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

function RestauracionNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-700 ${
        scrolled
          ? 'py-4 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/80'
          : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <span className="text-xl font-bold tracking-tight text-white">Qaway</span>
          <span className="text-xl font-bold tracking-tight text-[#ff4b0b] ml-1">LAB</span>
        </a>
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-zinc-300 hover:text-orange-400 transition-colors" aria-label="Menú">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </nav>
  )
}

export default function RestauracionFotograficaPage() {
  return (
    <div className="estudio-page restauracion-page">
      <RestauracionNavbar />
      <Hero />
      <ServiceCards />
      <ComparisonShowcase />
      <Process />
      <CTA />
    </div>
  )
}
