import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ASSET = '/assets/pages/2-estudio'; // Base asset path

const SLIDE_IMAGES = [
  { src: `${ASSET}/ChatGPT Image 1 jul 2026, 12_34_12.png`,     label: '24 piezas', position: 'center 20%' },
  { src: `${ASSET}/ChatGPT Image 1 jul 2026, 12_34_24 (1).png`, label: '4 formatos', position: 'center 5%' },
  { src: `${ASSET}/ChatGPT Image 1 jul 2026, 12_34_24 (2).png`, label: '1 sistema',  position: 'center 95%' },
];

// Duplicate of DigitalPresence component with modified scroll image
export default function DigitalPresenceCopy() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % SLIDE_IMAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);
  return (
    <section id="estrategia-copy" className="vl-dark vl-section vl-digital">
      <div className="vl-shell">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-16 xl:gap-24 items-stretch">
          {/* Columna izquierda: Título + tarjeta */}
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.16 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'block', marginBottom: '0' }}
            >
              <p className="vl-kicker vl-kicker--dark">Estrategia digital / 03</p>
              <h2 className="vl-heading-row__h2" style={{ marginTop: '20px', fontSize: 'clamp(2.6rem, 4.8vw, 5rem)', lineHeight: '.84', textTransform: 'uppercase', fontFamily: "'Arial Narrow','Roboto Condensed',sans-serif", fontWeight: 700 }}>
                De la identidad<br />
                <span style={{ color: 'var(--vl-acid)' }}>a una marca que ya vive online.</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.16 }}
              transition={{ duration: 0.72, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="vl-digital__social w-full mt-auto"
              style={{ position: 'relative', top: 'auto', right: 'auto', transform: 'none' }}
            >
              <div className="vl-digital__profile">
                <span>QB</span>
                <div><strong>qaway.brand</strong><small>Dirección visual y contenido</small></div>
              </div>
              <div style={{ position: 'relative', overflow: 'hidden', height: '340px' }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeSlide}
                    src={SLIDE_IMAGES[activeSlide].src}
                    alt={SLIDE_IMAGES[activeSlide].label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: SLIDE_IMAGES[activeSlide].position, display: 'block', position: 'absolute', top: 0, left: 0 }}
                  />
                </AnimatePresence>
              </div>
              <div className="vl-digital__metrics">
                {SLIDE_IMAGES.map((slide, i) => (
                  <span
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    style={{
                      cursor: 'pointer',
                      color: activeSlide === i ? 'var(--vl-acid)' : 'rgba(255,255,255,.5)',
                      borderBottom: activeSlide === i ? '2px solid var(--vl-acid)' : '2px solid transparent',
                      transition: 'color 0.4s ease, border-color 0.4s ease',
                      fontWeight: activeSlide === i ? 700 : 400,
                    }}
                  >
                    {slide.label}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Columna derecha: Mini web + path */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.16 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4"
          >
            <div className="vl-digital__browser" style={{ width: '100%', height: '72vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="vl-digital__browser-bar">
                <i></i><i></i><i></i><span>qaway.brand / inicio</span>
              </div>
              <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <motion.div
                  initial={{ y: 0, scale: 1 }}
                  whileInView={{
                    y: ['0%', '-15%', '-15%', '-15%', '-30%'],
                    scale: [1, 1, 1.05, 1, 1]
                  }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 16,
                    delay: 0.5,
                    times: [0, 0.3, 0.4, 0.5, 1],
                    ease: 'easeInOut'
                  }}
                  style={{ width: '100%', transformOrigin: 'center top' }}
                >
                  <img src="/assets/pages/2-estudio/web-completa.png" alt="Full web mockup" style={{ width: '100%', display: 'block', height: 'auto' }} />
                </motion.div>
              </div>
            </div>

            <div className="vl-digital__path w-full flex justify-between">
              {['Identidad', 'Redes', 'Landing', 'Captación'].map((item, index) => (
                <span key={item} className="flex-1 justify-center"><small>0{index + 1}</small>{item}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
