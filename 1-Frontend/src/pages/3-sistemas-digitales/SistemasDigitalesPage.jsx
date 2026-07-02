import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Workflow,
  Radio,
  Globe,
  BarChart3,
  BrainCircuit,
  Settings,
  Compass,
  ArrowRight,
  Check,
  LayoutDashboard,
  Users,
  Brain,
  TrendingUp,
  Sparkles,
  Clock,
  Database,
  Cpu,
  ChevronRight,
  CheckCircle2,
  ArrowDown,
  Gauge,
  GitBranch,
  Layers3,
  Network,
} from "lucide-react";
import { useSetNavbarVariant } from "@/components/layout/Navbar"
import HeroPrimitive from "@/components/typography/HeroPrimitive";
import './digital-presence.css'

const ASSET = '/assets/pages/2-estudio'

function CounterValue({ value }) {
  const [current, setCurrent] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          let target = 0;
          if (value === "01") {
            target = 1;
            animateCount(0, target, (val) => {
              setCurrent(val < 10 ? `0${val}` : val);
            }, 800);
          } else if (value === "-42%") {
            target = -42;
            animateCount(0, target, (val) => {
              setCurrent(`${val}%`);
            }, 1000);
          } else if (value === "24/7") {
            target = 24;
            animateCount(0, target, (val) => {
              setCurrent(`${val}/7`);
            }, 900);
          } else {
            setCurrent(value);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [value]);

  const animateCount = (start, end, updateFn, duration) => {
    const startTime = performance.now();
    
    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.round(start + (end - start) * easeProgress);
      
      updateFn(currentVal);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  return (
    <span ref={elementRef} className="inline-block">
      {current || (value === "01" ? "00" : value === "-42%" ? "0%" : "0/7")}
    </span>
  );
}


const reveal = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
}

const items = [
  {
    title: 'Automatización administrativa',
    desc: 'Crea facturas, registra gastos, archiva documentos y gestiona correos de forma automática.',
    icon: Database,
    image: '/assets/pages/3-sistemas-digitales/1-automatizacion/bloque4_1.webp',
  },
  {
    title: 'Dashboards operativos',
    desc: 'Mide tiempos de entrega, cuellos de botella y rendimiento del equipo en tiempo real.',
    icon: Gauge,
    image: '/assets/pages/3-sistemas-digitales/1-automatizacion/bloque4_3.webp',
  },
  {
    title: 'CRM y seguimiento comercial',
    desc: 'Asigna prospectos, envía recordatorios automatizados por WhatsApp y actualiza estados de venta.',
    icon: GitBranch,
    image: '/assets/pages/3-sistemas-digitales/1-automatizacion/bloque4_2.webp',
  },
  {
    title: 'Agentes para atención y soporte',
    desc: 'IA que responde preguntas frecuentes, califica leads y deriva casos complejos a humanos.',
    icon: BrainCircuit,
    image: '/assets/pages/3-sistemas-digitales/1-automatizacion/bloque4_4.webp',
  },
  {
    title: 'Sistemas de contenido con IA',
    desc: 'Estructura calendarios, genera borradores para posts y optimiza tus activos de marketing.',
    icon: Layers3,
    image: '/assets/pages/3-sistemas-digitales/1-automatizacion/bloque4_5.webp',
  },
  {
    title: 'Procesos internos documentados',
    desc: 'SOPs en Notion para que tu equipo ejecute cada automatización sin depender de ti.',
    icon: Network,
    image: '/assets/pages/3-sistemas-digitales/1-automatizacion/bloque4_6.webp',
  },
]

const displayFont = {
  fontFamily:
    "'Arial Narrow', 'Roboto Condensed', 'Helvetica Neue Condensed', Impact, sans-serif",
  fontStretch: "condensed",
  fontWeight: 700,
};

function SectionLabel({ children, inverse = false }) {
  const tone = inverse ? "text-[#ff4b0b]" : "text-[#ff4b0b]";
  const dot = inverse ? "bg-[#ff4b0b]" : "bg-[#ff4b0b]";

  return (
    <div
      className={[
        "inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em]",
        tone,
      ].join(" ")}
    >
      <span className={["h-2 w-2 rounded-full", dot].join(" ")} />
      {children}
    </div>
  );
}

const revealUp = {
  hidden: { opacity: 0, y: 24 },
  show: function (delay) {
    const wait = typeof delay === "number" ? delay : 0;
    return {
      opacity: 1,
      y: 0,
      transition: { duration: 0.62, delay: wait, ease: [0.22, 1, 0.36, 1] },
    };
  },
};

function Hero() {
  return (
    <div className="relative w-full min-h-screen flex flex-col font-sans overflow-hidden bg-[#161616]">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage:
            'url("https://www.transparenttextures.com/patterns/stardust.png")',
        }}
      ></div>

      <div className="flex flex-1 w-full z-10 relative">
        <div className="w-16 md:w-20 bg-[#f8f9f7] text-[#1a1a1a] flex flex-col items-center justify-between py-10 shrink-0 relative z-20">
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <span className="text-2xl font-light">+</span>
            <span className="w-px h-12 bg-gray-300"></span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="rotate-180" style={{ writingMode: "vertical-rl" }}>
              <span className="uppercase tracking-[0.3em] text-[10px] md:text-xs font-semibold text-gray-500 whitespace-nowrap">
                Sistemas que escalan contigo
              </span>
            </p>
          </div>
          <div className="w-full flex justify-start pl-2">
            <div className="w-6 h-6 border-l-[3px] border-b-[3px] border-[#ff4b0b]"></div>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative bg-[#161616]">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div
              className="w-[120%] aspect-square"
              style={{
                background:
                  "radial-gradient(circle at 55% 40%, rgba(255,255,255,0.06) 0%, transparent 50%)",
              }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div
              className="w-[100%] aspect-square"
              style={{
                background:
                  "radial-gradient(circle at 55% 45%, rgba(255,75,11,0.12) 0%, transparent 50%)",
              }}
            />
          </div>
          <div className="absolute left-0 top-0 w-12 h-12 bg-gradient-to-br from-black/40 to-transparent pointer-events-none opacity-50"></div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 relative px-8 md:px-16 pt-16 pb-8">
            <div className="lg:col-span-5 flex flex-col justify-center z-20 pb-12 lg:pb-0">
              <div className="text-white [&_p]:!text-gray-400 [&_a:last-child]:!text-gray-300">
                <HeroPrimitive
                  title={
                    <>
                      Automatización, Canales Y<br />
                      Sistemas
                      <br />
                      <span className="text-[#ff4b0b]">Con IA</span>
                    </>
                  }
                  subtitle="Implementamos estructuras, herramientas y procesos digitales con IA para mejorar la operación diaria de tu negocio, equipo o marca personal."
                />
                <div className="flex flex-wrap items-center gap-6 mt-8">
                  <a href="#soluciones" className="inline-flex items-center justify-center gap-2 bg-[#ff4b0b] text-white px-8 py-3.5 font-bold text-[14px] hover:-translate-y-1 hover:bg-[#e04400] transition-all duration-300">
                    Ver soluciones <ArrowDown size={16} />
                  </a>
                  <a href="/" className="inline-flex items-center gap-2 text-white font-medium text-[14px] border-b border-[#ff4b0b] pb-1 hover:text-[#ff4b0b] transition-colors duration-300">
                    Conocer Qaway Lab <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 relative flex items-end justify-center pt-10 min-h-[400px]">
              <div className="absolute left-0 top-[20%] bottom-[25%] w-24 md:w-32 border-l-4 border-t-4 border-b-4 border-[#ff4b0b] z-0"></div>
              <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[1px] bg-white/5 rotate-[15deg] origin-bottom-right"></div>
              <div className="absolute right-[8%] top-[20%] bottom-[25%] w-12 border-r-4 border-t-4 border-b-4 border-[#ff4b0b] z-20"></div>
              <img
                src="/assets/pages/3-sistemas-digitales/Hero-sistemas-digitales.png"
                alt="Sistemas Digitales Qaway"
                className="relative z-10 w-full max-w-[320px] xl:max-w-[380px] h-auto object-cover object-bottom grayscale contrast-125 scale-[1.19] lg:scale-[1.14] xl:scale-[1.19] 2xl:scale-[1.34] origin-bottom [@media(min-width:1536px)_and_(max-height:900px)]:max-w-[320px] [@media(min-width:1536px)_and_(max-height:900px)]:scale-[1.14]"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, black 60%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 60%, transparent 100%)",
                }}
              />
            </div>

            <div className="lg:col-span-3 flex flex-col justify-center lg:pl-10 lg:border-l border-white/5 z-20 mt-12 lg:mt-0">
              <div className="mb-12">
                <div className="w-6 h-1 bg-[#ff4b0b] mb-6"></div>
                <p className="text-[1.35rem] font-medium leading-snug text-white">
                  Automatización y productividad para negocios que necesitan
                  operar mejor.
                </p>
              </div>

              <div className="mb-12">
                <div className="w-6 h-[1px] bg-[#ff4b0b] mb-6"></div>
                <p className="text-gray-400 text-sm leading-relaxed pr-4">
                  Unimos estrategia, tecnología e inteligencia para construir
                  sistemas que escalan contigo.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: [0, -10],
                  transition: {
                    y: { repeat: Infinity, repeatType: "reverse", duration: 3.6, ease: "easeInOut", delay: 0.8 },
                    opacity: { delay: 0.4, duration: 0.6 },
                    scale: { delay: 0.4, duration: 0.6 }
                  }
                }}
                style={{ willChange: "transform", width: "100%" }}
              >
                <motion.div 
                  className="bg-white border border-[#ff4b0b]/40 rounded-[5px] p-5 flex flex-col gap-2 w-full shadow-xl relative overflow-hidden"
                  initial={{ opacity: 0.6, y: 0 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  whileHover={{ 
                    opacity: 1, 
                    y: -10, 
                    transition: { duration: 0.3, ease: 'easeOut' } 
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#ff4b0b]/10 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-[#ff4b0b] p-3 rounded text-white shadow-lg shadow-[#ff4b0b]/20">
                      <TrendingUp className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold tracking-tight text-[#161616]">
                        +127%
                      </div>
                      <div className="text-xs text-[#161616]/80 leading-tight mt-0.5 font-medium">
                        Aumento promedio
                        <br />
                        en productividad
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          <div className="w-full border-t-[3px] border-[#f8f9f7]/10 grid grid-cols-2 lg:grid-cols-4 bg-[#161616]">
            <div className="group flex flex-col lg:flex-row items-center gap-3 lg:gap-4 justify-center lg:justify-start lg:border-r-[3px] border-[#f8f9f7]/10 py-6 lg:pl-16 transition-all duration-300 cursor-pointer hover:bg-white/[0.02]">
              <Settings
                className="w-7 h-7 text-[#ff4b0b] transition-all duration-300 group-hover:scale-110 group-hover:text-white"
                strokeWidth={1.5}
              />
              <span className="text-sm text-gray-300 font-medium transition-colors duration-300 group-hover:text-white">
                Automatización
              </span>
            </div>
            <div className="group flex flex-col lg:flex-row items-center gap-3 lg:gap-4 justify-center lg:border-r-[3px] border-[#f8f9f7]/10 py-6 transition-all duration-300 cursor-pointer hover:bg-white/[0.02]">
              <LayoutDashboard
                className="w-7 h-7 text-[#ff4b0b] transition-all duration-300 group-hover:scale-110 group-hover:text-white"
                strokeWidth={1.5}
              />
              <span className="text-sm text-gray-300 font-medium transition-colors duration-300 group-hover:text-white">
                Dashboards
              </span>
            </div>
            <div className="group flex flex-col lg:flex-row items-center gap-3 lg:gap-4 justify-center lg:border-r-[3px] border-[#f8f9f7]/10 py-6 transition-all duration-300 cursor-pointer hover:bg-white/[0.02]">
              <Users
                className="w-7 h-7 text-[#ff4b0b] transition-all duration-300 group-hover:scale-110 group-hover:text-white"
                strokeWidth={1.5}
              />
              <span className="text-sm text-gray-300 font-medium transition-colors duration-300 group-hover:text-white">
                CRM
              </span>
            </div>
            <div className="group flex flex-col lg:flex-row items-center gap-3 lg:gap-4 justify-center lg:justify-end py-6 lg:pr-12 transition-all duration-300 cursor-pointer hover:bg-white/[0.02]">
              <Brain
                className="w-7 h-7 text-[#ff4b0b] transition-all duration-300 group-hover:scale-110 group-hover:text-white"
                strokeWidth={1.5}
              />
              <span className="text-sm text-gray-300 font-medium transition-colors duration-300 group-hover:text-white">
                IA aplicada
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const operatingSignals = [
  {
    value: "01",
    title: "Sistema central",
    text: "Ideas, piezas y responsables en un mismo lugar.",
  },
  {
    value: "-42%",
    title: "Menos fricción operativa",
    text: "Reducimos pasos manuales en la gestión diaria.",
  },
  {
    value: "24/7",
    title: "Seguimiento constante",
    text: "Automatizaciones, dashboards y alertas eficientes",
  },
];

const systemStages = [
  {
    id: 0,
    tag: "Radar editorial",
    title: "Diagnóstico y mapa del sistema",
    description:
      "Tomamos lo que hoy vive entre WhatsApp, ideas sueltas, documentos y aprobaciones, y lo convertimos en una arquitectura clara.",
    image: "/assets/pages/8-landings/1-sistema-contenido-notion/notion_modulo_control.webp",
    bullets: [
      "Inventario de canales, piezas y puntos de fuga operativa.",
      "Lectura de cuellos de botella antes de automatizar.",
      "Vista maestra para responsables, activos y prioridades.",
    ],
  },
  {
    id: 1,
    tag: "Ideación guiada",
    title: "Laboratorio de ideas con IA",
    description:
      "Estructuramos la investigación, la ideación y la priorización para que el contenido deje de depender del impulso del día.",
    image: "/assets/pages/8-landings/1-sistema-contenido-notion/notion_modulo_generador.webp",
    bullets: [
      "Prompts, criterios y plantillas para generar ideas útiles.",
      "Priorización por objetivo, formato y etapa del embudo.",
      "Base reutilizable para campañas, lanzamientos y series.",
    ],
  },
  {
    id: 2,
    tag: "Planificación visual",
    title: "Calendario, producción y seguimiento",
    description:
      "Cada pieza entra a un flujo con estado, responsable, fecha y dependencias. Así el equipo produce con orden y no por memoria.",
    image: "/assets/pages/8-landings/1-sistema-contenido-notion/notion_modulo_planificacion.webp",
    bullets: [
      "Plan editorial conectado a tareas y entregables reales.",
      "Cronograma visible para grabación, diseño, copy y publicación.",
      "Estados de avance para saber qué bloquea y qué avanza.",
    ],
  },
  {
    id: 3,
    tag: "Ejecución conectada",
    title: "Automatización, medición y control",
    description:
      "Conectamos el sistema con formularios, CRM, dashboards y recordatorios para que la ejecución mantenga velocidad y trazabilidad.",
    image: "/assets/pages/8-landings/1-sistema-contenido-notion/notion_modulo_ejecucion.webp",
    bullets: [
      "Automatizaciones para briefs, aprobaciones y handoffs.",
      "Integración con CRM, bases de datos y reporting operativo.",
      "Lectura de desempeño para iterar sin improvisación.",
    ],
  },
];

const digitalAreas = [
  {
    title: "Automatización y workflows",
    description:
      "Procesos repetitivos que se convierten en flujos conectados y medibles.",
    icon: Workflow,
    path: "/sistemas-digitales/automatizacion",
  },
  {
    title: "Canales digitales",
    description:
      "WhatsApp, redes y entornos comerciales listos para captar y responder mejor.",
    icon: Radio,
    path: "/sistemas-digitales/canales-digitales",
  },
  {
    title: "Webs y landings",
    description:
      "Páginas conectadas a formularios, medición y rutas de conversión reales.",
    icon: Globe,
    path: "/sistemas-digitales/webs-y-landings",
  },

  {
    title: "CRM, datos y dashboards",
    description:
      "Seguimiento comercial y control operativo desde un tablero comprensible.",
    icon: BarChart3,
    path: "/sistemas-digitales/crm-datos-dashboards",
  },
  {
    title: "Agentes IA",
    description:
      "Asistentes para clasificar, resumir, responder y acelerar decisiones.",
    icon: BrainCircuit,
    path: "/sistemas-digitales/agentes-ia",
  },
  {
    title: "Estrategia digital",
    description:
      "Ruta de implementación para definir qué ordenar primero y cómo escalarlo.",
    icon: Compass,
    path: "/sistemas-digitales/estrategia-digital",
  },
];

const profileCards = [
  {
    title: "Marcas personales y creadores",
    tag: "Contenido sostenido",
    image: "/assets/pages/3-sistemas-digitales/content-ops-creator-studio.png",
    points: [
      "Ideas, guiones, tomas y publicaciones bajo una misma lógica.",
      "Menos desgaste mental para sostener presencia y campañas.",
    ],
  },
  {
    title: "Equipos comerciales y marketing",
    tag: "Operación visible",
    image: "/assets/pages/3-sistemas-digitales/content-ops-team-dashboard.png",
    points: [
      "Seguimiento conjunto entre contenido, leads y performance.",
      "Handoffs más limpios entre campañas, ventas y atención.",
    ],
  },
  {
    title: "Fundadores, consultores y proyectos",
    tag: "Criterio y estructura",
    image:
      "/assets/pages/3-sistemas-digitales/content-ops-consulting-session.png",
    points: [
      "Prioridad clara sobre qué digitalizar y qué automatizar primero.",
      "Un sistema que ayuda a vender, enseñar y operar mejor.",
    ],
  },
];

const implementationFlow = [
  {
    step: "01",
    title: "Leemos la operación",
    text: "Detectamos qué parte del flujo de contenido ya funciona y dónde se rompe la continuidad.",
    icon: Clock,
  },
  {
    step: "02",
    title: "Diseñamos la arquitectura",
    text: "Definimos tableros, vistas, responsables, automatizaciones y puntos de control.",
    icon: Database,
  },
  {
    step: "03",
    title: "Integramos herramientas",
    text: "Conectamos creación, CRM, dashboards, WhatsApp y tareas para que el sistema respire solo.",
    icon: Cpu,
  },
  {
    step: "04",
    title: "Instalamos criterio",
    text: "Dejamos una forma de trabajo que el equipo entiende, usa y puede seguir escalando.",
    icon: CheckCircle2,
  },
];

const advisoryCases = [
  "Quiero dejar de improvisar mi contenido cada semana.",
  "Necesito conectar contenido, leads y seguimiento comercial.",
  "Mi equipo produce, pero no tiene un sistema claro para coordinarse.",
  "Quiero automatizar briefs, aprobaciones o reportes sin volver todo más complejo.",
];

function DigitalPresence() {
  return (
    <section className="vl-digital-copy vl-dark vl-section vl-digital">
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
                    <b>Explorar landing <ArrowRight size={14} /></b>
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

export default function SistemasDigitalesPage() {
useSetNavbarVariant('brand')
  const reduceMotion = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="min-h-screen bg-[#f3f1ee] text-[#191918] selection:bg-[#ff4b0b] selection:text-white">
      <Hero />

      <section className="border-b border-black/6 bg-[#f3f1ee] py-20 lg:py-28">
        <div className="mx-auto grid max-w-[94rem] gap-12 px-6 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-14">
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "show"}
            viewport={{ once: true, amount: 0.2 }}
            variants={revealUp}
            custom={0}
          >
            <p className="text-[#ff4b0b] text-[12px] font-bold uppercase tracking-[0.12em]">
              SISTEMA DE CONTENIDO / 01
            </p>
            <h2
              className="mt-3 text-[clamp(2.5rem,5.5vw,4.2rem)] uppercase leading-[0.9] tracking-[-0.04em] text-[#191918]"
              style={displayFont}
            >
              No basta con publicar.
              <br />
              <span className="text-[#ff4b0b]">
                Hay que operar con sistema.
              </span>
            </h2>
            <p className="mt-3 max-w-xl text-[16px] leading-[1.62] text-[#666] sm:text-[17px]">
              Conectamos sistemas de contenidos con automatización, CRM y
              seguimiento operativo. El resultado es una estructura con orden,
              menos fricción y mejor lectura del negocio.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {operatingSignals.map(function (signal, index) {
                return (
                  <motion.article
                    key={signal.title}
                    initial={reduceMotion ? false : "hidden"}
                    whileInView={reduceMotion ? undefined : "show"}
                    viewport={{ once: true, amount: 0.3 }}
                    variants={revealUp}
                    custom={0.08 * (index + 1)}
                    className="border border-black/8 bg-white px-6 py-5 shadow-[0_18px_44px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out cursor-default"
                  >
                    <span 
                      className="block text-center text-[29px] sm:text-[38px] font-bold uppercase tracking-tight text-[#ff4b0b]"
                      style={displayFont}
                    >
                      <CounterValue value={signal.value} />
                    </span>
                    <h3 className="mt-4 text-[17px] font-bold leading-tight text-[#191918]">
                      {signal.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-black/60">
                      {signal.text}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden bg-[#121212] shadow-[0_26px_80px_rgba(0,0,0,0.16)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,75,11,0.18),transparent_34%)]" />
            <img
              src="/assets/pages/3-sistemas-digitales/content-ops-command-center.png"
              alt="Centro de control de contenido y operaciones digitales"
              className="relative z-10 h-full min-h-[28rem] w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute bottom-8 left-8 right-8 z-20 border border-white/12 bg-black/55 px-6 py-5 backdrop-blur-md">
              <div className="flex items-center gap-3 text-white">
                <Sparkles className="h-4 w-4 text-[#ff4b0b]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/76">
                  Operación con criterio
                </span>
              </div>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
                Planeación, producción, seguimiento y automatización dentro de
                una misma lectura operativa. Eso permite producir mejor sin
                multiplicar el caos.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative bg-black py-24 text-white overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_80%_80%,rgba(255,210,0,0.06),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-stretch">
            {/* Left Column: Title and 2-column Buttons Grid */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              <div className="mb-8">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Sistema Completo</div>
                <h2 className="mt-4 text-4xl lg:text-[45px] font-bold tracking-tight text-white leading-[0.95]" style={displayFont}>
                  Lo que puede quedar funcionando <br />
                  dentro de <span className="italic text-[#ff4b0b]">tu proyecto.</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {items.map((item, idx) => {
                  const Icon = item.icon
                  const isActive = idx === activeIdx
                  return (
                    <button
                      key={item.title}
                      onClick={() => setActiveIdx(idx)}
                      className={`text-left flex items-start gap-3 py-3 px-4 border-l-2 transition-all duration-300 ${
                        isActive
                          ? 'border-[#ff4b0b] bg-white/[0.02] text-white font-bold'
                          : 'border-white/10 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 mt-0.5 shrink-0 transition-colors ${isActive ? 'text-[#ff4b0b]' : 'text-zinc-500'}`} />
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-[14px] font-bold tracking-tight transition-colors ${isActive ? 'text-white' : 'text-zinc-500 font-medium'}`}>
                          {item.title}
                        </h3>
                        <motion.div
                          initial={false}
                          animate={{
                            height: isActive ? 'auto' : 0,
                            opacity: isActive ? 1 : 0,
                            marginTop: isActive ? 6 : 0,
                          }}
                          transition={{
                            duration: 0.3,
                            ease: [0.16, 1, 0.3, 1]
                          }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-[340px] text-[11px] font-light leading-relaxed text-zinc-400">
                            {item.desc}
                          </p>
                        </motion.div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right Column: Widened preview image column */}
            <div className="lg:col-span-7">
              <div className="sticky top-28 h-full flex items-start justify-center rounded-3xl border border-white/10 bg-zinc-950/40 p-4 md:p-6 shadow-2xl overflow-hidden relative pt-2">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none" />
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff4b0b]/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 w-full flex items-center justify-center min-h-[500px]" style={{ perspective: 1000 }}>
                  <div className="relative w-full max-w-[360px]" style={{ aspectRatio: '1080/1350' }}>
                    {items.map((item, idx) => {
                      const isPast = idx < activeIdx
                      const isActive = idx === activeIdx
                      const isNext = idx === activeIdx + 1
                      
                      let x = 0
                      let y = 0
                      let scale = 1
                      let opacity = 0
                      let rotate = 0
                      let pointerEvents = 'none'
                      
                      if (isPast) {
                        x = 0
                        y = 12
                        scale = 1.10
                        rotate = 0
                        opacity = 0
                      } else if (isActive) {
                        x = 0
                        y = 0
                        scale = 1
                        rotate = 0
                        opacity = 1
                        pointerEvents = 'auto'
                      } else if (isNext) {
                        x = 0
                        y = -32
                        scale = 0.88
                        rotate = 0
                        opacity = 0.75
                        pointerEvents = 'none'
                      } else {
                        x = 0
                        y = -32
                        scale = 0.82
                        rotate = 0
                        opacity = 0
                        pointerEvents = 'none'
                      }

                      return (
                        <motion.div
                          key={item.title}
                          className="absolute inset-0 rounded-[12px] border border-white/10 bg-black/80 p-2.5 shadow-2xl overflow-hidden"
                          style={{
                            transformOrigin: 'top center',
                            pointerEvents,
                            zIndex: items.length - idx,
                          }}
                          animate={{
                            x,
                            y,
                            scale,
                            opacity,
                            rotate,
                          }}
                          transition={{
                            default: {
                              type: 'spring',
                              stiffness: 110,
                              damping: 18,
                              mass: 1.0
                            },
                            opacity: { duration: 0.45, ease: 'easeInOut' }
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover rounded-[8px]"
                            style={{
                              aspectRatio: '1080/1350',
                            }}
                          />
                          <div
                            className="absolute inset-0 bg-black pointer-events-none rounded-[8px] transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                            style={{
                              opacity: isActive ? 0 : (isNext ? 0.3 : 0.55),
                            }}
                          />
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/8 bg-[#121212] py-20 text-white lg:py-28">
        <div className="mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <motion.div
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "show"}
              viewport={{ once: true, amount: 0.2 }}
              variants={revealUp}
              custom={0}
            >
              <SectionLabel inverse>Arquitectura conectada</SectionLabel>
              <h2
                className="mt-6 text-[clamp(3rem,5.2vw,5rem)] uppercase leading-[0.86] tracking-[-0.05em] text-white"
                style={displayFont}
              >
                El sistema de contenido
                <br />
                no vive solo<span className="text-[#ff4b0b]">.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/64 sm:text-lg">
                Cuando el contenido se conecta con CRM, dashboards, landings,
                agentes IA y canales de atención, deja de ser una pieza aislada
                y se convierte en infraestructura real del negocio.
              </p>

              <div className="mt-8 overflow-hidden border border-white/10 bg-white/[0.03] p-3 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
                <img
                  src="/assets/pages/3-sistemas-digitales/content-ops-team-dashboard.png"
                  alt="Equipo revisando dashboards, CRM y flujos digitales"
                  className="h-full min-h-[24rem] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:pt-16">
              {digitalAreas.map(function (area, index) {
                const Icon = area.icon;
                return (
                  <motion.div
                    key={area.title}
                    initial={reduceMotion ? false : "hidden"}
                    whileInView={reduceMotion ? undefined : "show"}
                    viewport={{ once: true, amount: 0.2 }}
                    variants={revealUp}
                    custom={0.08 * index}
                    className="group border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:border-[#ff4b0b]/25 hover:bg-white/[0.05] hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid h-12 w-12 place-items-center border border-white/10 bg-white/5 text-[#ff4b0b]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/34">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold leading-tight text-white">
                      {area.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/56">
                      {area.description}
                    </p>
                    <Link
                      to={area.path}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/82 transition-colors hover:text-[#ff4b0b]"
                    >
                      Explorar módulo
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/6 bg-[#f6f4f1] py-20 lg:py-28">
        <div className="mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "show"}
            viewport={{ once: true, amount: 0.2 }}
            variants={revealUp}
            custom={0}
            className="mb-14 max-w-3xl"
          >
            <SectionLabel>Aplicaciones reales</SectionLabel>
            <h2
              className="mt-6 text-[clamp(3rem,5.4vw,5.1rem)] uppercase leading-[0.86] tracking-[-0.05em]"
              style={displayFont}
            >
              Diseñado para proyectos que quieren{" "}
              <span className="text-[#ff4b0b]">sostener</span>,<br />
              vender y coordinar mejor.
            </h2>
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr_0.92fr]">
            {profileCards.map(function (card, index) {
              return (
                <motion.article
                  key={card.title}
                  initial={reduceMotion ? false : "hidden"}
                  whileInView={reduceMotion ? undefined : "show"}
                  viewport={{ once: true, amount: 0.16 }}
                  variants={revealUp}
                  custom={0.1 * index}
                  className="group overflow-hidden border border-black/8 bg-white shadow-[0_18px_52px_rgba(0,0,0,0.05)]"
                >
                  <div className="relative">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-[18rem] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-5 left-5 border border-white/20 bg-black/45 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                      {card.tag}
                    </div>
                  </div>
                  <div className="px-6 py-6">
                    <h3 className="text-[1.55rem] font-semibold leading-tight text-[#191918]">
                      {card.title}
                    </h3>
                    <ul className="mt-5 space-y-3">
                      {card.points.map(function (point) {
                        return (
                          <li
                            key={point}
                            className="flex items-start gap-3 text-sm leading-relaxed text-black/60"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff4b0b]" />
                            <span>{point}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-black/6 bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "show"}
            viewport={{ once: true, amount: 0.2 }}
            variants={revealUp}
            custom={0}
            className="mb-14 max-w-3xl"
          >
            <SectionLabel>Método de implementación</SectionLabel>
            <h2
              className="mt-6 text-[clamp(3rem,5vw,4.8rem)] uppercase leading-[0.86] tracking-[-0.05em]"
              style={displayFont}
            >
              De la intuición dispersa
              <br />a una operación que se puede{" "}
              <span className="text-[#ff4b0b]">repetir</span>.
            </h2>
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-4">
            {implementationFlow.map(function (item, index) {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.step}
                  initial={reduceMotion ? false : "hidden"}
                  whileInView={reduceMotion ? undefined : "show"}
                  viewport={{ once: true, amount: 0.2 }}
                  variants={revealUp}
                  custom={0.08 * index}
                  className="border border-black/8 bg-[#f7f5f2] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff4b0b]">
                      {item.step}
                    </span>
                    <span className="grid h-11 w-11 place-items-center bg-white text-[#ff4b0b] shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="mt-6 text-[1.35rem] font-semibold leading-tight text-[#191918]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-black/58">
                    {item.text}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f1ee] py-20 lg:py-28">
        <div className="mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
          <div className="overflow-hidden border border-black/8 bg-white shadow-[0_24px_74px_rgba(0,0,0,0.06)]">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative overflow-hidden border-b border-black/8 lg:border-b-0 lg:border-r">
                <img
                  src="/assets/pages/3-sistemas-digitales/content-ops-consulting-session.png"
                  alt="Sesión de consultoría para diseñar un sistema digital y de contenido"
                  className="h-full min-h-[22rem] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 border border-white/16 bg-black/45 px-5 py-4 backdrop-blur-md">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff4b0b]">
                    Asesoría y acompañamiento
                  </span>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/72">
                    Definimos qué parte del sistema conviene ordenar primero
                    para que el siguiente paso ya tenga impacto real en ventas,
                    producción o coordinación interna.
                  </p>
                </div>
              </div>

              <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                <SectionLabel>Consultoría estratégica</SectionLabel>
                <h2
                  className="mt-6 text-[clamp(2.6rem,4.8vw,4.4rem)] uppercase leading-[0.86] tracking-[-0.05em]"
                  style={displayFont}
                >
                  Si el contenido ya existe,
                  <br />
                  el siguiente paso es darle{" "}
                  <span className="text-[#ff4b0b]">sistema</span>.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-black/60">
                  Acompañamos procesos relacionados con automatización,
                  contenido, IA, dashboards, CRM, herramientas internas y
                  estructura operativa para que todo respire dentro de una misma
                  lógica de negocio.
                </p>

                <ul className="mt-8 space-y-3">
                  {advisoryCases.map(function (item) {
                    return (
                      <li
                        key={item}
                        className="flex items-start gap-3 border border-black/6 bg-[#f8f6f2] px-4 py-4 text-sm leading-relaxed text-black/62"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ff4b0b]" />
                        <span>{item}</span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="https://wa.me/51930756781?text=Hola%20Qaway,%20quiero%20ordenar%20mi%20sistema%20de%20contenido%20y%20operaci%C3%B3n%20digital"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#ff4b0b] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e03a00]"
                  >
                    Agendar diagnóstico
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <Link
                    to="/sistemas-digitales/automatizacion"
                    className="inline-flex items-center gap-2 border border-black/10 px-6 py-3 text-sm font-semibold text-[#191918] transition-colors hover:border-[#ff4b0b]/30 hover:text-[#ff4b0b]"
                  >
                    Ver un módulo ya armado
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DigitalPresence />
    </div>
  );
}
