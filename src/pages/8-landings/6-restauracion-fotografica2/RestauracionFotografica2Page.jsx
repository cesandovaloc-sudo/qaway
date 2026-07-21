import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  FileImage,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import './restauracion-fotografica2.css'

const ASSET = '/assets/pages/8-landings/6-restauraci%C3%B3n-fotogr%C3%A1fica2'
const images = {
  hero: `${ASSET}/01-hero-restauracion-familiar.webp`,
  detail: `${ASSET}/02-detalle-identidad-realista.webp`,
  damage: `${ASSET}/03-diagnostico-danos-fotograficos.webp`,
  process: `${ASSET}/04-proceso-restauracion-digital.webp`,
  before: `${ASSET}/05-resultado-antes-dano.webp`,
  after: `${ASSET}/06-resultado-despues-moderno.webp`,
  delivery: `${ASSET}/07-entrega-archivo-premium.webp`,
}

const fadeIn = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
}

const detailHotspots = [
  {
    id: 'identidad',
    title: 'Identidad',
    text: 'Conservamos rasgos, mirada y expresion sin reemplazar a la persona.',
    x: 50,
    y: 48,
    zoomX: 52,
    zoomY: 48,
  },
  {
    id: 'textura',
    title: 'Textura',
    text: 'Recuperamos piel, poros y microdetalle con acabado natural.',
    x: 58,
    y: 64,
    zoomX: 57,
    zoomY: 62,
  },
  {
    id: 'color',
    title: 'Color',
    text: 'Ajustamos tonos reales sin sepia, sin amarillo y sin piel artificial.',
    x: 42,
    y: 40,
    zoomX: 43,
    zoomY: 40,
  },
  {
    id: 'contraste',
    title: 'Contraste',
    text: 'Devolvemos profundidad, luz y definicion sin exagerar el rostro.',
    x: 66,
    y: 38,
    zoomX: 65,
    zoomY: 38,
  },
]
const damages = [
  {
    id: 'manchas',
    title: 'Manchas y hongos',
    text: 'Limpieza digital por zonas sin borrar textura real.',
    signal: 'Humedad, manchas circulares y veladuras sobre el papel.',
    x: 50,
    y: 56,
    w: 22,
    h: 24,
    zoomX: 54,
    zoomY: 62,
  },
  {
    id: 'roturas',
    title: 'Roturas y papel perdido',
    text: 'Reconstruccion visual controlada con bordes naturales.',
    signal: 'Quiebres, esquinas faltantes y cortes visibles en el soporte.',
    x: 31,
    y: 24,
    w: 24,
    h: 26,
    zoomX: 35,
    zoomY: 28,
  },
  {
    id: 'color',
    title: 'Color y contraste',
    text: 'Correccion tonal para recuperar profundidad y piel.',
    signal: 'Imagen lavada, negros debiles y perdida de volumen.',
    x: 66,
    y: 27,
    w: 24,
    h: 24,
    zoomX: 68,
    zoomY: 30,
  },
  {
    id: 'definicion',
    title: 'Baja definicion',
    text: 'Preparacion nitida para archivo digital e impresion.',
    signal: 'Detalle suave, grano deteriorado y poca lectura del rostro.',
    x: 80,
    y: 56,
    w: 18,
    h: 30,
    zoomX: 81,
    zoomY: 64,
  },
]

const process = [
  ['01', 'Evaluacion', 'Revisamos la foto y definimos que partes se pueden recuperar sin inventar identidad.'],
  ['02', 'Diagnostico', 'Clasificamos el dano, el nivel de intervencion y el tipo de entrega recomendada.'],
  ['03', 'Restauracion', 'Reconstruimos manchas, quiebres, color y detalle con criterio visual.'],
  ['04', 'Entrega', 'Recibes archivo final en alta resolucion, listo para guardar, compartir o imprimir.'],
]

const plans = [
  ['01', 'Esencial', 'S/ 11.50', 'Manchas leves, pliegues menores, limpieza y definicion.', 'Limpieza base', 'Archivo digital listo para guardar'],
  ['02', 'Recuperacion', 'S/ 15.00', 'Roturas visibles, perdida de color y deterioro medio.', 'Mas solicitado', 'Restauracion equilibrada para imprimir'],
  ['03', 'Reconstruccion', 'S/ 18.50', 'Dano severo, zonas perdidas y trabajo de maxima precision.', 'Alta precision', 'Reconstruccion visual avanzada'],
]

const faqs = [
  ['La restauracion cambia la identidad de la persona?', 'No. El criterio es conservar rasgos, expresion y textura original.'],
  ['Pueden colorear una fotografia antigua?', 'Si, cuando la imagen lo permite. Primero evaluamos si conviene colorizar o mantener blanco y negro.'],
  ['En que formato entregan el archivo final?', 'Entregamos imagen digital en alta resolucion, preparada para archivo o impresion.'],
  ['Cuanto tarda el proceso?', 'Depende del nivel de dano. La evaluacion inicial permite darte un plazo real antes de iniciar.'],
]

function CtaButton({ children = 'Enviar fotografia para evaluacion', compact = false }) {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className={`rf2-button ${compact ? 'rf2-button--compact' : ''}`}
    >
      <MessageCircle size={compact ? 15 : 17} />
      {children}
      <ArrowRight size={compact ? 15 : 17} />
    </a>
  )
}

function Header() {
  return (
    <header className="rf2-header">
      <a href="/" className="rf2-brand" aria-label="Qaway Lab inicio">
        <span>Qaway Lab</span>
        <small>Estudio visual</small>
      </a>
      <nav className="rf2-nav" aria-label="Navegacion principal">
        <a href="#proceso">Proceso</a>
        <a href="#niveles">Niveles</a>
        <CtaButton compact>Solicitar evaluacion</CtaButton>
        <Menu size={20} />
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section className="rf2-hero">
      <Header />
      <div className="rf2-hero__content">
        <motion.div
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          className="rf2-hero__copy"
        >
          <p className="rf2-kicker">Restauracion fotografica - Qaway Lab</p>
          <h1>Tu historia no deberia perderse con el papel.</h1>
          <p>
            Recuperamos fotografias danadas con precision, criterio visual y respeto por cada rostro.
          </p>
          <div className="rf2-actions">
            <CtaButton />
            <a href="#resultados">Explorar restauraciones</a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="rf2-hero__visual"
        >
          <div className="rf2-hero-compare" aria-label="Comparacion animada de antes y despues">
            <img className="rf2-hero-compare__before" src={images.before} alt="Fotografia deteriorada antes de restauracion" />
            <img className="rf2-hero-compare__after" src={images.after} alt="Fotografia restaurada despues del proceso" />
            <span className="rf2-hero-compare__line" aria-hidden="true"><span /></span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Principle() {
  return (
    <section className="rf2-band rf2-principle">
      <motion.div {...fadeIn}>
        <h2>No creamos otra persona. Recuperamos la que esta en la fotografia.</h2>
      </motion.div>
      <motion.div {...fadeIn} className="rf2-eye-card">
        <img src={images.detail} alt="Detalle realista de identidad preservada" />
        <ul>
          <li><strong>Identidad</strong><span>Rasgos fieles, no genericos.</span></li>
          <li><strong>Textura</strong><span>Piel, poros y detalles reales.</span></li>
          <li><strong>Color</strong><span>Tonos naturales y estables.</span></li>
          <li><strong>Contraste</strong><span>Profundidad sin exagerar.</span></li>
        </ul>
      </motion.div>
    </section>
  )
}

function PrincipleCopy() {
  const [activeId, setActiveId] = useState(detailHotspots[0].id)
  const activeHotspot = detailHotspots.find((item) => item.id === activeId) || detailHotspots[0]

  return (
    <section className="rf2-band rf2-principle rf2-principle--copy">
      <motion.div {...fadeIn} className="rf2-principle__copy">
        <p className="rf2-kicker">Fidelidad visual</p>
        <h2>No creamos otra persona. Recuperamos la que esta en la fotografia.</h2>
        <p>
          Pasa el mouse por cada punto para ver que parte se recupera y como se conserva la identidad real.
        </p>
      </motion.div>

      <motion.div {...fadeIn} className="rf2-detail-lab">
        <div className="rf2-detail-lab__stage" style={{ '--active-x': `${activeHotspot.x}%`, '--active-y': `${activeHotspot.y}%` }}>
          <img src={images.detail} alt="Detalle realista de identidad preservada" />
          {detailHotspots.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rf2-hotspot ${activeId === item.id ? 'is-active' : ''}`}
              style={{ '--x': `${item.x}%`, '--y': `${item.y}%` }}
              onMouseEnter={() => setActiveId(item.id)}
              onFocus={() => setActiveId(item.id)}
              onClick={() => setActiveId(item.id)}
              aria-label={`Ver detalle de ${item.title}`}
            >
              <span className="rf2-hotspot__dot" />
              <span className="rf2-hotspot__card">
                <strong>{item.title}</strong>
                <small>{item.text}</small>
              </span>
            </button>
          ))}
        </div>

        <div className="rf2-detail-lab__panel">
          <div
            className="rf2-detail-lab__zoom"
            style={{
              backgroundImage: `url(${images.detail})`,
              backgroundPosition: `${activeHotspot.zoomX}% ${activeHotspot.zoomY}%`,
            }}
            aria-hidden="true"
          />
        </div>
      </motion.div>
    </section>
  )
}
function DamageMatrix() {
  const [activeDamageId, setActiveDamageId] = useState(damages[0].id)
  const activeDamage = damages.find((item) => item.id === activeDamageId) || damages[0]

  return (
    <section className="rf2-band rf2-damage">
      <div className="rf2-damage__grid">
        <motion.div {...fadeIn} className="rf2-damage__heading">
          <p className="rf2-kicker">Diagnostico visual</p>
          <h2>Cada dano pide un tratamiento distinto.</h2>
          <p>El diagnostico define limpieza, reconstruccion, color y nitidez antes de tocar la imagen.</p>
          <CtaButton compact>Enviar foto para diagnostico</CtaButton>
        </motion.div>
        <motion.div {...fadeIn} className="rf2-damage__media">
          <div
            className="rf2-damage__visual"
            style={{ '--damage-x': `${activeDamage.x}%`, '--damage-y': `${activeDamage.y}%`, '--damage-w': `${activeDamage.w}%`, '--damage-h': `${activeDamage.h}%` }}
          >
            <img src={images.damage} alt="Diagnostico de danos fotograficos en mesa de restauracion" />
            <div className="rf2-damage-scan" aria-hidden="true" />
            <div className="rf2-damage__inspector">
              <strong>{activeDamage.title}</strong>
              <p>{activeDamage.signal}</p>
            </div>
          </div>
          <div className="rf2-damage__tabs" aria-label="Tipos de dano fotografico">
            {damages.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={activeDamageId === item.id ? 'is-active' : ''}
                onMouseEnter={() => setActiveDamageId(item.id)}
                onFocus={() => setActiveDamageId(item.id)}
                onClick={() => setActiveDamageId(item.id)}
              >
                <em>{String(index + 1).padStart(2, '0')}</em>
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Process() {
  return (
    <section id="proceso" className="rf2-process">
      <div className="rf2-process__intro">
        <p className="rf2-kicker">Nuestro proceso</p>
        <h2>Primero revisamos. Despues restauramos.</h2>
        <p>Precision, criterio y respeto por la identidad.</p>
      </div>
      <motion.img {...fadeIn} className="rf2-process__image" src={images.process} alt="Proceso profesional de restauracion digital" />
      <div className="rf2-process__steps">
        {process.map(([number, title, text]) => (
          <motion.article key={title} {...fadeIn}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

function Results() {
  return (
    <section id="resultados" className="rf2-band rf2-results">
      <motion.div {...fadeIn} className="rf2-section-title rf2-section-title--center">
        <p className="rf2-kicker">Resultados reales</p>
        <h2>Resultados que se ven. Identidades que se conservan.</h2>
      </motion.div>
      <div className="rf2-results__grid">
        <motion.article {...fadeIn}>
          <img src={images.before} alt="Fotografia antigua danada antes de restauracion" />
          <div>
            <strong>Tipo de dano:</strong>
            <p>Manchas, pliegues, roturas y perdida de contraste.</p>
            <strong>Tratamiento:</strong>
            <p>Reconstruccion de zonas danadas, limpieza y correccion cromatica.</p>
          </div>
        </motion.article>
        <motion.article {...fadeIn}>
          <img src={images.after} alt="Retrato restaurado con acabado moderno y luz neutra" />
          <div>
            <strong>Resultado:</strong>
            <p>Archivo digital equilibrado, natural y listo para impresion.</p>
            <strong>Criterio:</strong>
            <p>Rostros preservados sin suavizado artificial ni rasgos inventados.</p>
          </div>
        </motion.article>
      </div>
    </section>
  )
}

function Guarantees() {
  return (
    <section className="rf2-band rf2-guarantees">
      <motion.div {...fadeIn} className="rf2-seal">
        <span>Fidelidad antes que invencion</span>
      </motion.div>
      <motion.div {...fadeIn} className="rf2-guarantees__list">
        <article><ShieldCheck /><strong>Rostros y expresiones preservados</strong><p>No suavizamos ni cambiamos identidad.</p></article>
        <article><Sparkles /><strong>Color moderno, sin acabado artificial</strong><p>Tonos reales, equilibrio y coherencia visual.</p></article>
        <article><FileImage /><strong>Archivo final preparado para imprimir</strong><p>Nitidez, escala y formato profesional.</p></article>
      </motion.div>
    </section>
  )
}

function Pricing() {
  return (
    <section id="niveles" className="rf2-band rf2-pricing">
      <motion.div {...fadeIn} className="rf2-section-title rf2-pricing__title">
        <p className="rf2-kicker">Elige segun el nivel de dano</p>
        <h2>Una evaluacion clara antes de empezar.</h2>
        <p>El precio se confirma al revisar la imagen. Primero miramos el dano, luego recomendamos el nivel justo.</p>
      </motion.div>
      <div className="rf2-price-cards">
        {plans.map(([number, title, price, text, badge, delivery], index) => (
          <motion.a
            key={title}
            {...fadeIn}
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={`rf2-price-card ${index === 1 ? 'is-featured' : ''}`}
          >
            <div className="rf2-price-card__top">
              <span>{number}</span>
              <em>{badge}</em>
            </div>
            <strong>{title}</strong>
            <div className="rf2-price-card__price">{price}</div>
            <p>{text}</p>
            <small>{delivery}</small>
            <div className="rf2-price-card__action">
              Evaluar mi fotografia
              <ArrowRight size={17} />
            </div>
          </motion.a>
        ))}
      </div>
      <p className="rf2-pricing__note">El nivel final se confirma despues de revisar la imagen.</p>
    </section>
  )
}

function Faq() {
  return (
    <section className="rf2-band rf2-faq">
      <motion.div {...fadeIn} className="rf2-section-title">
        <p className="rf2-kicker">Preguntas frecuentes</p>
        <h2>Lo importante antes de enviar tu fotografia.</h2>
      </motion.div>
      <div>
        {faqs.map(([question, answer], index) => (
          <motion.details key={question} {...fadeIn} open={index === 0}>
            <summary><span>{String(index + 1).padStart(2, '0')}</span>{question}</summary>
            <p>{answer}</p>
          </motion.details>
        ))}
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="rf2-final">
      <div>
        <p className="rf2-kicker">Antes de darla por perdida, envianosla.</p>
        <h2>Revisamos el dano y te indicamos que recuperacion es posible.</h2>
      </div>
      <img src={images.delivery} alt="Entrega premium de archivos restaurados" />
      <CtaButton>Solicitar evaluacion</CtaButton>
    </section>
  )
}

export default function RestauracionFotografica2Page() {
  return (
    <main className="rf2-page">
      <Hero />
      <PrincipleCopy />
      <DamageMatrix />
      <Process />
      <Results />
      <Guarantees />
      <Pricing />
      <Faq />
      <FinalCta />
      <footer className="rf2-footer">
        <span>Qaway Lab / Estudio visual</span>
        <span>Restauracion fotografica de alta precision</span>
      </footer>
    </main>
  )
}
