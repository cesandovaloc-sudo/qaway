import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Check, Minus, Plus, Quote } from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'

const displayFont = { fontFamily: "'Arial Narrow', 'Roboto Condensed', Impact, sans-serif", fontStretch: 'condensed' }
const reveal = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.14 }, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
const base = '/assets/pages/8-landings/5-fotografia-linkedin/'

function BookingButton({ label = 'Reservar sesión' }) {
  return (
    <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 bg-[#ff4b0b] px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-[#dd3c00]">
      <CalendarDays size={16} /> {label} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
    </a>
  )
}

export default function FotografiaLinkedinSections() {
  const gallery = [
    ['01', 'Ejecutivo', `${base}galeria-ejecutivo.png`],
    ['02', 'Cercano', `${base}galeria-cercana.png`],
    ['03', 'Editorial', `${base}galeria-editorial.png`],
  ]
  const faqs = [
    ['¿Necesito saber posar?', 'No. Te guiamos en postura, mirada y expresión durante toda la sesión.'],
    ['¿Dónde se realiza?', 'En un espacio coordinado previamente en Lima. También evaluamos sesiones en oficinas.'],
    ['¿Puedo cambiar de vestuario?', 'Sí. La sesión individual permite hasta dos cambios de vestuario.'],
    ['¿Cuándo recibo las fotos?', 'Los archivos finales se entregan aproximadamente siete días después de la selección.'],
  ]

  return (
    <>
      <section className="overflow-hidden bg-[#efede8] px-6 py-24 text-[#171716] sm:px-10 lg:px-16 lg:py-36">
        <div className="mx-auto max-w-[94rem]">
          <motion.div {...reveal} className="grid items-end gap-14 lg:grid-cols-[.82fr_1.18fr] lg:gap-20">
            <div>
              <p className="mb-7 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">La primera impresión</p>
              <h2 className="text-[clamp(4rem,7vw,7.6rem)] uppercase leading-[0.86] tracking-[-0.035em]" style={displayFont}>
                No es solo una foto.<span className="block">Es la primera impresión<span className="text-[#ff4b0b]">.</span></span>
              </h2>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-black/55 sm:text-lg">Antes de leer tu experiencia, una persona ya recibió señales sobre tu seguridad, tu criterio y el cuidado que pones en tu trabajo.</p>
            </div>
            <div className="relative grid h-[34rem] grid-cols-2 lg:h-[42rem]">
              <div className="relative overflow-hidden bg-[#d8d4cd]"><img src={`${base}retrato-perfil-masculino.png`} alt="Retrato sin dirección visual" className="absolute inset-0 h-full w-full object-cover object-[35%_center] grayscale contrast-75 opacity-65" /><span className="absolute bottom-5 left-5 bg-[#efede8] px-3 py-2 text-[10px] uppercase tracking-[0.18em]">Sin dirección</span></div>
              <div className="relative overflow-hidden bg-black"><img src={`${base}galeria-ejecutivo.png`} alt="Retrato profesional dirigido" className="absolute inset-0 h-full w-full object-cover grayscale" /><span className="absolute bottom-5 left-5 bg-[#ff4b0b] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white">Con intención</span></div>
              <div className="absolute bottom-12 left-[-1rem] top-12 w-2 bg-[#ff4b0b]" />
            </div>
          </motion.div>
          <div className="mt-16 grid border-t border-black/25 sm:grid-cols-3">{['Se ve improvisada', 'No comunica tu nivel', 'Ya no te representa'].map((item, index) => <div key={item} className={`flex items-center gap-4 py-6 ${index ? 'sm:border-l sm:border-black/25 sm:pl-8' : ''}`}><span className="font-mono text-xs text-[#ff4b0b]">0{index + 1}</span><span className="text-sm font-medium">{item}</span></div>)}</div>
        </div>
      </section>

      <section className="grid min-h-[50rem] bg-[#191918] text-white lg:grid-cols-[58%_42%]">
        <div className="relative min-h-[34rem] overflow-hidden"><img src={`${base}galeria-cercana.png`} alt="Retrato profesional cercano" className="absolute inset-0 h-full w-full object-cover grayscale" /><div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-black/40" /></div>
        <motion.div {...reveal} className="flex flex-col justify-center bg-[#efede8] px-8 py-20 text-[#171716] sm:px-12 lg:px-14 lg:py-28">
          <p className="mb-7 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">El resultado</p>
          <h2 className="text-[clamp(3.6rem,5.5vw,6.2rem)] uppercase leading-[0.88] tracking-[-0.035em]" style={displayFont}>Una imagen a la altura de tu trabajo<span className="text-[#ff4b0b]">.</span></h2>
          <div className="mt-10">{[['Confianza', 'Una presencia segura, natural y profesional.'], ['Coherencia', 'Una imagen alineada con tu sector y objetivos.'], ['Versatilidad', 'Retratos útiles para LinkedIn, web, prensa y presentaciones.']].map(([title, text]) => <div key={title} className="grid gap-3 border-t border-black/20 py-6 sm:grid-cols-[8rem_1fr]"><strong className="text-sm">{title}</strong><p className="text-sm leading-relaxed text-black/55">{text}</p></div>)}</div>
          <a href="#galeria-linkedin" className="mt-7 inline-flex self-start items-center gap-4 border-b border-[#ff4b0b] pb-2 text-sm font-medium">Ver estilos de sesión <ArrowRight size={15} /></a>
        </motion.div>
      </section>

      <section id="proceso-completo" className="bg-[#efede8] px-6 py-24 text-[#171716] sm:px-10 lg:px-16 lg:py-36">
        <div className="mx-auto max-w-[94rem]">
          <motion.div {...reveal} className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <div><p className="mb-7 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Cómo funciona</p><h2 className="text-[clamp(4rem,7vw,7rem)] uppercase leading-[0.86] tracking-[-0.035em]" style={displayFont}>Una sesión guiada,<span className="block">de principio a fin<span className="text-[#ff4b0b]">.</span></span></h2></div>
            <p className="max-w-md text-base leading-relaxed text-black/55">No necesitas llegar sabiendo posar. Construimos el contexto y te guiamos durante cada momento.</p>
          </motion.div>
          <div className="mt-16 grid border-t border-black/25 md:grid-cols-2 xl:grid-cols-4">{[['01', 'Dirección', 'Definimos tono, vestuario, usos y la impresión que quieres proyectar.'], ['02', 'Sesión', 'Trabajamos postura, mirada y expresión con indicaciones simples.'], ['03', 'Selección', 'Elegimos contigo las imágenes que mejor cumplen el objetivo.'], ['04', 'Entrega', 'Recibes archivos retocados para LinkedIn, web y comunicación.']].map(([number, title, text], index) => <motion.article {...reveal} key={title} className={`flex min-h-80 flex-col justify-between border-b border-black/25 py-8 xl:border-b-0 xl:px-8 ${index ? 'xl:border-l' : ''}`}><span className="font-mono text-xs text-[#ff4b0b]">{number}</span><div><h3 className="text-4xl uppercase tracking-[-0.03em]" style={displayFont}>{title}</h3><p className="mt-4 max-w-xs text-sm leading-relaxed text-black/55">{text}</p></div></motion.article>)}</div>
        </div>
      </section>

      <section id="galeria-linkedin" className="relative overflow-hidden bg-[#191918] px-6 py-24 text-white sm:px-10 lg:px-16 lg:py-36">
        <span className="pointer-events-none absolute right-[-1rem] top-16 select-none text-[18rem] leading-none text-[#ff4b0b]/10 sm:text-[26rem]" style={displayFont}>03</span>
        <div className="relative mx-auto max-w-[94rem]">
          <motion.div {...reveal} className="mb-14 grid items-end gap-10 lg:grid-cols-[.8fr_1.2fr]"><h2 className="text-[clamp(3.8rem,6.4vw,7rem)] uppercase leading-[0.87] tracking-[-0.035em]" style={displayFont}>No hay una sola forma de verte profesional<span className="text-[#ff4b0b]">.</span></h2><p className="max-w-lg text-base leading-relaxed text-white/52 lg:justify-self-end">Elegimos una dirección que se parezca a ti, no una pose que se parezca a todos.</p></motion.div>
          <div className="grid items-end gap-2 md:grid-cols-3">{gallery.map(([number, label, image], index) => <motion.figure {...reveal} key={label} className={`group relative overflow-hidden ${index === 1 ? 'h-[38rem] border-4 border-[#ff4b0b] md:h-[45rem]' : 'h-[32rem] md:h-[39rem]'}`}><img src={image} alt={`Retrato de estilo ${label}`} className="absolute inset-0 h-full w-full object-cover grayscale transition-transform duration-700 group-hover:scale-[1.025]" /><div className="absolute inset-0 bg-linear-to-t from-black/75 via-transparent to-transparent" /><figcaption className="absolute bottom-6 left-6 right-6 flex items-end justify-between"><span className="text-3xl uppercase" style={displayFont}>{label}</span><span className="font-mono text-xs text-[#ff4b0b]">{number}</span></figcaption></motion.figure>)}</div>
        </div>
      </section>

      <section id="incluye" className="bg-[#efede8] px-6 py-24 text-[#171716] sm:px-10 lg:px-16 lg:py-36">
        <div className="mx-auto max-w-[94rem]">
          <motion.h2 {...reveal} className="max-w-6xl text-[clamp(4rem,7vw,7.4rem)] uppercase leading-[0.86] tracking-[-0.04em]" style={displayFont}>Todo lo necesario para salir con una imagen lista<span className="text-[#ff4b0b]">.</span></motion.h2>
          <div className="mt-16 grid border-t border-black/25 lg:grid-cols-[1.45fr_.55fr]">
            <div className="grid sm:grid-cols-2">{['Reunión breve de dirección', 'Guía de vestuario', 'Sesión fotográfica dirigida', 'Selección acompañada', 'Retoque profesional', 'Archivos para LinkedIn y web'].map((item, index) => <div key={item} className={`flex min-h-28 items-center gap-5 border-b border-black/25 px-1 py-7 sm:px-7 ${index % 2 ? 'sm:border-l' : ''}`}><span className="grid h-7 w-7 shrink-0 place-items-center bg-[#ff4b0b] text-white"><Check size={14} /></span><span className="text-sm font-medium">{item}</span></div>)}</div>
            <motion.aside {...reveal} className="flex min-h-[34rem] flex-col justify-between bg-[#191918] p-8 text-white sm:p-10 lg:p-12"><div><p className="text-[10px] uppercase tracking-[0.2em] text-[#ff4b0b]">Sesión individual</p><div className="mt-8 flex items-start gap-2"><span className="mt-2 text-xl text-white/50">S/</span><strong className="text-[6rem] leading-none tracking-[-0.07em] sm:text-[7.5rem]" style={displayFont}>490</strong></div><p className="mt-6 text-sm leading-relaxed text-white/52">Hasta 60 minutos<br />Dos cambios de vestuario<br />Ocho fotografías finales</p></div><div><BookingButton /><p className="mt-5 text-[11px] leading-relaxed text-white/38">Consulta disponibilidad y tarifas especiales para equipos.</p></div></motion.aside>
          </div>
        </div>
      </section>

      <section className="grid min-h-[48rem] bg-[#191918] lg:grid-cols-[54%_46%]">
        <div className="relative min-h-[36rem] overflow-hidden"><img src={`${base}retrato-profesional-femenino.png`} alt="Profesional retratada por Qaway Lab" className="absolute inset-0 h-full w-full object-cover object-[63%_center] grayscale" /><div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/20 to-transparent" /><motion.blockquote {...reveal} className="absolute bottom-10 left-7 right-8 max-w-xl sm:bottom-16 sm:left-12 lg:left-16"><Quote size={30} className="mb-6 text-[#ff4b0b]" /><p className="text-4xl uppercase leading-[0.93] tracking-[-0.03em] sm:text-5xl lg:text-6xl" style={displayFont}>Por fin tengo una foto en la que me reconozco y que también representa mi trabajo.</p><footer className="mt-6 text-xs text-white/55">Mariana R. · Consultora independiente</footer></motion.blockquote></div>
        <div className="bg-[#efede8] px-8 py-20 text-[#171716] sm:px-12 lg:px-14 lg:py-24"><p className="mb-7 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Preguntas frecuentes</p><h2 className="text-[clamp(3.7rem,5vw,5.8rem)] uppercase leading-[0.88] tracking-[-0.035em]" style={displayFont}>Antes de reservar<span className="text-[#ff4b0b]">.</span></h2><div className="mt-10">{faqs.map(([question, answer], index) => <details key={question} open={index === 0} className="group border-t border-black/25 py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-sm font-semibold">{question}<span className="text-[#ff4b0b]"><Plus size={17} className="group-open:hidden" /><Minus size={17} className="hidden group-open:block" /></span></summary><p className="pr-9 pt-4 text-sm leading-relaxed text-black/52">{answer}</p></details>)}</div><a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-4 border-b border-[#ff4b0b] pb-2 text-sm font-medium">Conversar antes de reservar <ArrowRight size={15} /></a></div>
      </section>

      <section className="relative flex min-h-[52rem] items-end overflow-hidden bg-[#101010]">
        <img src={`${base}cierre-equipo.png`} alt="Equipo de profesionales retratado en estudio" className="absolute inset-0 h-full w-full object-cover object-center grayscale" /><div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/48 to-black/15" /><div className="pointer-events-none absolute bottom-20 left-5 top-20 w-20 sm:left-12 sm:w-28"><span className="absolute left-0 top-0 h-2 w-full bg-[#ff4b0b]" /><span className="absolute left-0 top-0 h-28 w-2 bg-[#ff4b0b]" /><span className="absolute bottom-0 left-0 h-2 w-full bg-[#ff4b0b]" /><span className="absolute bottom-0 left-0 h-28 w-2 bg-[#ff4b0b]" /></div>
        <motion.div {...reveal} className="relative z-10 max-w-6xl px-8 pb-20 pt-32 sm:px-16 lg:px-24"><p className="mb-7 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Tu próxima imagen</p><h2 className="text-[clamp(4rem,7.5vw,8rem)] uppercase leading-[0.84] tracking-[-0.04em]" style={displayFont}>Que tu próxima oportunidad encuentre una imagen a tu altura<span className="text-[#ff4b0b]">.</span></h2><div className="mt-9 flex flex-wrap items-center gap-7"><BookingButton /><a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 border-b border-[#ff4b0b] pb-2 text-sm">Consultar sesiones de equipo <ArrowRight size={15} /></a></div></motion.div>
      </section>

      <footer className="border-t border-black/15 bg-[#efede8] px-6 py-8 text-[#171716] sm:px-10 lg:px-16"><div className="mx-auto flex max-w-[94rem] flex-col items-start justify-between gap-7 md:flex-row md:items-center"><Link to="/" className="text-2xl font-semibold tracking-[-0.05em]">Qaway Lab</Link><nav className="flex flex-wrap gap-x-7 gap-y-3 text-[11px] text-black/55"><Link to="/estudio">Estudio</Link><Link to="/sistemas-digitales">Sistemas digitales</Link><Link to="/academy">Academy</Link><a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">Contacto</a></nav><span className="text-[10px] uppercase tracking-[0.18em] text-black/38">Lima · Perú</span></div></footer>
    </>
  )
}
