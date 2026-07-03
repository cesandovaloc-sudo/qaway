import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useAnimation } from 'framer-motion';

const ASSET = '/assets/pages/2-estudio';

const SLIDE_IMAGES = [
  { src: `${ASSET}/estudio-copy-24-piezas.webp`,     label: '24 piezas', position: 'center 20%' },
  { src: `${ASSET}/estudio-copy-4-formatos.webp`, label: '4 formatos', position: 'center 5%' },
  { src: `${ASSET}/estudio-copy-1-sistema.webp`, label: '1 sistema',  position: 'center 95%' },
];

export default function DigitalPresenceCopy() {
  const [activeSlide, setActiveSlide] = useState(0);
  const webRef = useRef(null);
  const inView = useInView(webRef, { amount: 0.6, once: false });
  const controls = useAnimation();

  // Loop animation whenever the browser card enters view
  useEffect(() => {
    let cancelled = false;
    async function runLoop() {
      while (!cancelled) {
        await controls.start({
          y: ['0%', '0%', '-10%', '-10%', '-25%', '-25%', '-42%', '-42%', '-58%', '-58%', '0%'],
          scale: [1, 1.07, 1.07, 1, 1, 1.05, 1.05, 1, 1, 1, 1],
          transition: {
            duration: 22,
            times: [0, 0.06, 0.18, 0.28, 0.38, 0.46, 0.56, 0.65, 0.75, 0.9, 1],
            ease: 'easeInOut',
          },
        });
        if (cancelled) break;
        await new Promise(r => setTimeout(r, 3000));
      }
    }
    if (inView) {
      runLoop();
    } else {
      controls.stop();
      controls.set({ y: '0%', scale: 1 });
    }
    return () => { cancelled = true; controls.stop(); };
  }, [inView, controls]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % SLIDE_IMAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="estrategia-digital" className="vl-section vl-digital" style={{ backgroundColor: '#f3f1ee', color: '#191918' }}>
      <div className="vl-shell">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-16 xl:gap-24 items-stretch">

          {/* Columna izquierda: Título + tarjeta slideshow */}
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.16 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="vl-kicker" style={{ color: '#8b8c88', fontSize: '12px', fontWeight: 'bold' }}>Estrategia digital / 03</p>
              <h2 className="vl-heading-row__h2" style={{ marginTop: '20px', fontSize: 'clamp(2.6rem, 4.8vw, 5rem)', lineHeight: '.84', textTransform: 'uppercase', fontFamily: "'Arial Narrow','Roboto Condensed',sans-serif", fontWeight: 700 }}>
                De la identidad<br />
                <span style={{ color: '#666860' }}>a una marca que ya vive online.</span>
              </h2>
            </motion.div>

            {/* Tarjeta slideshow con borde gris claro */}
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.16 }}
              transition={{ duration: 0.72, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="vl-digital__social w-full mt-auto"
              style={{
                position: 'relative', top: 'auto', right: 'auto', transform: 'none',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: '6px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
              }}
            >
              <div className="vl-digital__profile">
                <span style={{ color: '#ffffff' }}>Q</span>
                <div><strong>qaway.lab</strong><small style={{ color: '#666860' }}>Dirección visual y contenido</small></div>
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
            </motion.div>
          </div>

          {/* Columna derecha: Mini web + path con bordes grises */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.16 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4"
          >
            {/* Browser mockup con borde gris claro */}
            <div
              className="vl-digital__browser"
              style={{ width: '100%', height: '72vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '6px', backgroundColor: '#ffffff' }}
            >
              <div className="vl-digital__browser-bar">
                <i></i><i></i><i></i><span>qaway.lab / inicio</span>
              </div>
              <div ref={webRef} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <motion.div
                  animate={controls}
                  initial={{ y: '0%', scale: 1 }}
                  style={{ width: '100%', transformOrigin: 'center top' }}
                >
                  <img
                    src="/assets/pages/2-estudio/estudio-copy-showcase-web.webp"
                    alt="Full web mockup"
                    style={{ width: '100%', display: 'block', height: 'auto' }}
                  />
                </motion.div>
                {/* Overlay difuminado blanco para ocultar imperfecciones en bordes */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  pointerEvents: 'none',
                  boxShadow: 'inset 0 0 30px 15px rgba(255,255,255,0.9)'
                }} />
              </div>
            </div>

            {/* Path bar con borde gris claro */}
            <div
              className="vl-digital__path w-full flex justify-between"
              style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: '6px', padding: '10px 16px' }}
            >
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
