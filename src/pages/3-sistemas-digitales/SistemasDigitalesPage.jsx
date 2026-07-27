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
  Brush,
  Bell,
  ListChecks,
  FileText,
  Cloud,
  User,
} from "lucide-react";
import { useSetNavbarVariant } from "@/components/layout/Navbar"
import HeroPrimitive from "@/components/typography/HeroPrimitive";
import '@/pages/4-academy/academy.css'
import SEO from "@/components/seo/SEO";
import { WHATSAPP_LINK } from "@/data/navigation";

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
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] },
  }),
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
  hidden: { opacity: 0, y: 32 },
  show: function (delay) {
    const wait = typeof delay === "number" ? delay : 0;
    return {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, delay: wait, ease: [0.22, 1, 0.36, 1] },
    };
  },
};

const scaleUpImage = {
  hidden: { opacity: 0, scale: 0.95, y: 28 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
};

function HeroInicioBlockPractice() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-[#161616] pt-20 font-sans text-white">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage:
            'url("https://www.transparenttextures.com/patterns/stardust.png")',
        }}
      ></div>

      <div className="relative z-10 flex min-h-[calc(100dvh-5rem)] w-full">
        <div className="relative flex min-w-0 flex-1 flex-col bg-[#161616]">
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

          <div className="relative mx-auto grid flex-1 w-full max-w-[96rem] grid-cols-1 lg:grid-cols-[.95fr_1.05fr_.7fr]">
            <div className="relative flex flex-col justify-center px-6 py-10 sm:px-10 lg:min-h-[28rem] lg:justify-center lg:pt-6 lg:pb-10 lg:px-10">
              <motion.div
                initial={reduceMotion ? false : 'hidden'}
                animate={reduceMotion ? undefined : 'show'}
                variants={fadeUp}
                custom={0}
                className="relative z-10"
              >
                <p className="mb-4 text-[0.75rem] font-bold uppercase tracking-[0.015em] text-[#a3a19b]">
                  Sistemas Digitales y Automatización con IA
                </p>
                <h1
                  className="max-w-[58rem] text-[clamp(3.2rem,5.5vw,6.5rem)] leading-[0.82] tracking-[-0.055em] text-[#20201f]"
                  style={{ ...displayFont, fontWeight: 700 }}
                >
                  <span className="block text-white">Diseñamos sistemas digitales <span className="text-[#ff4b0b]">para tu proyecto.</span></span>
                </h1>
                <p className="mt-6 max-w-[34rem] text-[clamp(0.88rem,1vw,1rem)] leading-[1.5] text-[#a8a6a2]">
                  Implementamos automatizaciones, CRM, herramientas y procesos digitales para mejorar la operación de tu proyecto.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-5">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-[46px] items-center gap-2.5 bg-[#ff4b0b] px-6 py-3 text-[0.82rem] font-bold text-white shadow-[0_14px_36px_rgba(168,53,8,0.16)] transition-colors hover:bg-[#df3900] active:translate-y-px"
                  >
                    Cuéntanos tu proyecto
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </a>
                  <a
                    href="#estrategia-digital"
                    className="inline-flex items-center gap-4 border-b-2 border-[#ff4b0b] pb-2 text-sm font-bold text-white/85 transition-colors hover:text-[#ff4b0b]"
                  >
                    Elige por dónde empezar
                  </a>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.95, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="relative min-h-[40vh] mt-6 lg:mt-0 overflow-visible border-white/10 lg:min-h-[30rem] lg:border-x"
            >
              <div className="absolute inset-0 overflow-visible lg:overflow-hidden flex items-end justify-center pt-4 lg:pt-0">
                <div className="absolute left-0 top-[20%] bottom-[25%] w-24 md:w-32 border-l-4 border-t-4 border-b-4 border-[#ff4b0b] z-0"></div>
                <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[1px] bg-white/5 rotate-[15deg] origin-bottom-right"></div>
                <div className="absolute right-[8%] top-[20%] bottom-[25%] w-12 border-r-4 border-t-4 border-b-4 border-[#ff4b0b] z-20"></div>
                <img
                  src="/assets/pages/3-sistemas-digitales/Hero-sistemas-digitales.png"
                  alt="Sistemas Digitales Qaway"
                  className="relative z-10 h-[25rem] sm:h-[29rem] lg:h-[92%] xl:h-[96%] w-auto max-w-none object-contain object-bottom origin-bottom grayscale"
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, black 75%, transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 75%, transparent 100%)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>
            </motion.div>

            <div className="relative z-20 hidden lg:flex flex-col justify-center lg:mt-0 lg:border-l lg:border-white/5 lg:pl-10">
              <div className="mb-8 text-center">
                <div className="mb-5 h-[3px] w-7 bg-[#ff4b0b]"></div>
                <p className="mb-[14px] text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">
                  Sistemas digitales
                </p>
                <p
                  className="text-[clamp(1.34rem,1.9vw,1.94rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-[#ececec]"
                  style={{ ...displayFont, fontWeight: 600 }}
                >
                  Automatización para negocios que necesitan operar mejor.
                </p>
              </div>

              <motion.div
                className="mb-8 hidden lg:block"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
              >
                <div
                  className="block border border-[#ff4b0b]/50 bg-[#fbfaf8]/55 p-3 text-[#20201f] shadow-[0_24px_70px_rgba(32,32,31,0.16)] backdrop-blur-md transition-all duration-300 hover:border-[#ff4b0b] hover:bg-white w-[250px] rounded"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center bg-[#ff4b0b] text-white shadow-[0_16px_34px_rgba(255,75,11,0.22)] rounded-sm">
                      <Brush size={22} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[1.35rem] font-bold tracking-tight text-[#161616]">
                        +127%
                      </span>
                      <span className="mt-1 block text-xs leading-snug text-[#3e3d3b]">
                        Aumento promedio<br />en productividad
                      </span>
                    </span>
                  </span>
                  <span className="absolute h-px w-10 bg-[#ff4b0b]/80 -left-10 top-1/2 hidden lg:block" />
                </div>
              </motion.div>
            </div>
          </div>

          <div className="hidden lg:grid w-full border-t-[3px] border-black/5 lg:grid-cols-4 bg-[#f8f9f7]">
            <div className="group flex flex-col lg:flex-row items-center gap-3 lg:gap-4 justify-center lg:border-r-[3px] border-black/5 py-6 px-4 transition-all duration-300 hover:bg-black/[0.02]">
              <Settings
                className="w-7 h-7 text-[#ff4b0b] transition-transform duration-300 group-hover:scale-110"
                strokeWidth={1.5}
              />
              <span className="text-sm text-gray-500 font-medium transition-colors duration-300 group-hover:text-[#191918]">
                Automatización
              </span>
            </div>
            <div className="group flex flex-col lg:flex-row items-center gap-3 lg:gap-4 justify-center lg:border-r-[3px] border-black/5 py-6 px-4 transition-all duration-300 hover:bg-black/[0.02]">
              <LayoutDashboard
                className="w-7 h-7 text-[#ff4b0b] transition-transform duration-300 group-hover:scale-110"
                strokeWidth={1.5}
              />
              <span className="text-sm text-gray-500 font-medium transition-colors duration-300 group-hover:text-[#191918]">
                Dashboards
              </span>
            </div>
            <div className="group flex flex-col lg:flex-row items-center gap-3 lg:gap-4 justify-center lg:border-r-[3px] border-black/5 py-6 px-4 transition-all duration-300 hover:bg-black/[0.02]">
              <Users
                className="w-7 h-7 text-[#ff4b0b] transition-transform duration-300 group-hover:scale-110"
                strokeWidth={1.5}
              />
              <span className="text-sm text-gray-500 font-medium transition-colors duration-300 group-hover:text-[#191918]">
                CRM
              </span>
            </div>
            <div className="group flex flex-col lg:flex-row items-center gap-3 lg:gap-4 justify-center py-6 px-4 lg:pr-20 transition-all duration-300 hover:bg-black/[0.02]">
              <Brain
                className="w-7 h-7 text-[#ff4b0b] transition-transform duration-300 group-hover:scale-110"
                strokeWidth={1.5}
              />
              <span className="text-sm text-gray-500 font-medium transition-colors duration-300 group-hover:text-[#191918]">
                IA aplicada
              </span>
            </div>
          </div>
        </div>

        <div className="absolute inset-y-0 right-0 z-20 hidden w-16 shrink-0 flex-col items-center justify-between bg-[#f8f9f7] py-10 text-[#1a1a1a] md:w-20 lg:flex">
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
          <div className="w-full flex justify-end pr-2">
            <div className="w-6 h-6 border-r-[3px] border-b-[3px] border-[#ff4b0b]"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

const workflowCardsData = [
  {
    num: "01",
    title: "Tareas automáticas",
    text: "Reducimos acciones manuales y repetitivas.",
    icon: Database,
  },
  {
    num: "02",
    title: "Herramientas conectadas",
    text: "La información pasa de un sistema a otro.",
    icon: Bell,
  },
  {
    num: "03",
    title: "Seguimiento y alertas",
    text: "Los procesos avanzan con avisos y control.",
    icon: CheckCircle2,
  },
];

const crmEditorialColumns = [
  {
    title: "Contactos organizados",
    text: "Datos e historial de cada consulta.",
    icon: Users,
  },
  {
    title: "Seguimiento comercial",
    text: "Etapas, responsables y próximos pasos.",
    icon: ListChecks,
  },
  {
    title: "Paneles de control",
    text: "Pendientes, avances y resultados.",
    icon: BarChart3,
  },
];

const webCapEditorialColumns = [
  {
    title: "Presentación clara",
    icon: Globe,
  },
  {
    title: "Captación de consultas",
    icon: FileText,
  },
  {
    title: "Contacto directo",
    icon: Cloud,
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
    deliverables: [
      "Flujo automatizado",
      "Resumen automático con IA",
      "Sistema de alertas",
      "Integración de herramientas",
      "Mapa de workflow",
      "Tablero de tareas",
      "Documentación operativa"
    ]
  },
  {
    title: "Canales digitales",
    description:
      "WhatsApp, redes y entornos comerciales listos para captar y responder mejor.",
    icon: Radio,
    path: "/sistemas-digitales/canales-digitales",
    deliverables: [
      "WhatsApp Business",
      "Mensajes automáticos",
      "Configuración Meta Suite",
      "Catálogo de atención",
      "Configuración de Instagram/Facebook",
      "Respuestas rápidas",
      "Etiquetas de atención"
    ]
  },
  {
    title: "Webs y landings",
    description:
      "Páginas conectadas a formularios, medición y rutas de conversión reales.",
    icon: Globe,
    path: "/sistemas-digitales/webs-y-landings",
    deliverables: [
      "Landing page",
      "Página de servicio / captación",
      "Formulario conectado",
      "Integración con WhatsApp",
      "Conexión con CRM",
      "Configuración de medición",
      "Página publicada"
    ]
  },
  {
    title: "CRM, datos y dashboards",
    description:
      "Seguimiento comercial y control operativo desde un tablero comprensible.",
    icon: BarChart3,
    path: "/sistemas-digitales/crm-datos-dashboards",
    deliverables: [
      "CRM y Pipeline comercial",
      "Tablero de leads",
      "Dashboard de ventas",
      "Bases de datos organizada",
      "Dashboard operativo",
      "Reporte diario o semanal",
      "Tablero de control"
    ]
  },
  {
    title: "Agentes IA",
    description:
      "Asistentes para clasificar, resumir, responder y acelerar decisiones.",
    icon: BrainCircuit,
    path: "/sistemas-digitales/agentes-ia",
    deliverables: [
      "Asistente de productividad",
      "Agente de soporte/atención",
      "Agente de contenido",
      "Prompt base y reglas",
      "Agente IA configurado",
      "Flujo de interacción"
    ]
  },
  {
    title: "Estrategia digital",
    description:
      "Ruta de implementación para definir qué ordenar primero y cómo escalarlo.",
    icon: Compass,
    path: "#estrategia-digital",
    deliverables: [
      "Diagnóstico digital",
      "Ruta de implementación",
      "Arquitectura de captación",
      "Plan de automatización",
      "Mapa de canales",
      "Flujo de conversión"
    ]
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





export default function SistemasDigitalesPage() {
  useSetNavbarVariant('brand')
  const reduceMotion = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);
  const [expandedArea, setExpandedArea] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleContactSubmit(e) {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');
    try {
      const data = Object.fromEntries(new FormData(e.target));
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (isLocal) {
        console.log('Modo Desarrollo: Simulando envío de lead', data);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        await fetch('https://hook.us2.make.com/p519xo2f741g1z29z213fctk4o9u0wro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            origen: 'Sistemas Digitales',
            nombre: data.name,
            telefono: data.phone,
            email: data.email,
            perfil: data.profile,
            interes: data.service,
            mensaje: data.message || 'Sin mensaje adicional',
          }),
        });
      }
      setFormSubmitted(true);
    } catch {
      setFormError('Ocurrió un error al enviar. Intenta de nuevo.');
    } finally {
      setFormSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f1ee] text-[#191918] selection:bg-[#ff4b0b] selection:text-white">
      <SEO
        title="Sistemas Digitales y Automatización con IA | Qaway LAB"
        description="Implementamos sistemas, CRMs y agentes con IA para optimizar la operación de tu negocio."
        canonical="https://qaway.dev/sistemas-digitales"
        type="website"
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Sistemas Digitales y Automatización",
          "provider": {
            "@type": "Organization",
            "name": "Qaway LAB"
          },
          "description": "Implementamos estructuras, herramientas y procesos digitales con IA para mejorar la operación diaria de tu negocio."
        }}
      />
      <HeroInicioBlockPractice />

      <section className="relative bg-[#121212] py-24 text-white overflow-hidden border-t border-white/5">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
          style={{
            backgroundImage:
              'url("https://www.transparenttextures.com/patterns/stardust.png")',
          }}
        />
        {/* Ambient glows directly on the section background */}
        <div className="absolute w-[600px] h-[600px] rounded-full pointer-events-none top-1/2 right-[10%] -translate-y-1/2 z-0" style={{ background: "radial-gradient(circle, rgba(255,75,11,0.12) 0%, transparent 70%)" }} />
        <div className="absolute w-[600px] h-[600px] rounded-full pointer-events-none top-1/2 right-[10%] -translate-y-1/2 z-0" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)" }} />

        <div className="relative z-10 mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Title and 2-column Buttons Grid */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              <div className="mb-8">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">SERVICIOS DE SISTEMAS DIGITALES</div>
                <h2 className="mt-4 text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em] text-white" style={displayFont}>
                  Soluciones digitales <br />
                  adaptadas a <span className="text-[#ff4b0b]">tu proyecto.</span>
                </h2>
                <p className="mt-5 text-[15px] leading-relaxed text-zinc-400 max-w-xl">
                  Automatización, canales digitales, CRM y herramientas internas y más, para ordenar, conectar procesos e información y facilitar el trabajo diario.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {items.map((item, idx) => {
                  const Icon = item.icon
                  const isActive = idx === activeIdx
                  return (
                    <button
                      key={item.title}
                      onClick={() => setActiveIdx(idx)}
                      className={`text-left flex items-center gap-3 p-4 border transition-all duration-300 w-full rounded-[5px] ${isActive
                        ? 'border-[#ff4b0b]/60 bg-[#ff4b0b]/4 shadow-[0_0_15px_rgba(255,75,11,0.12)] text-white font-bold'
                        : 'border-[#ff4b0b]/60 bg-white/[0.01] text-zinc-400 hover:bg-[#ff4b0b]/3 hover:shadow-[0_0_12px_rgba(255,75,11,0.08)] hover:-translate-y-[2px] hover:text-white'
                        }`}
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0 text-[#ff4b0b]" />
                      <span className={`text-[13px] font-bold tracking-tight transition-colors ${isActive ? 'text-white' : 'text-zinc-500 font-medium'}`}>
                        {item.title}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right Column: Widened preview image column */}
            <div className="lg:col-span-7">
              <div className="sticky top-28 flex items-center justify-center overflow-hidden relative p-4 md:p-6">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none" />

                <div className="relative z-10 w-full flex items-center justify-center min-h-[620px]" style={{ perspective: 1000 }}>
                  <div className="relative w-full max-w-[450px]" style={{ aspectRatio: '655/864' }}>
                    {items.map((item, idx) => {
                      const currentActive = activeIdx === null ? 0 : activeIdx
                      const isPast = idx < currentActive
                      const isActive = idx === currentActive
                      const isNext = idx === currentActive + 1

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
                          className="absolute inset-0 rounded-[5px] bg-black/80 p-0 shadow-2xl overflow-hidden"
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
                          }}
                          transition={{
                            default: {
                              type: 'spring',
                              stiffness: 300,
                              damping: 28,
                              mass: 0.6,
                            },
                            opacity: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover rounded-[5px]"
                            style={{
                              aspectRatio: '655/864',
                            }}
                          />
                          <div
                            className="absolute inset-0 bg-black pointer-events-none rounded-[5px] transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
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
              Automatización y flujos de trabajo / 01
            </p>
            <h2
              className="mt-3 text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em] text-[#191918]"
              style={displayFont}
            >
              Automatizamos tareas repetitivas
              <br />
              <span className="text-[#ff4b0b]">
                y procesos de trabajo.
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-[clamp(0.94rem,1.05vw,1.06rem)] leading-[1.5] text-[#4e4d4a]">
              Conectamos formularios, correos, documentos y tareas para registrar información, asignar responsables, enviar alertas y dar seguimiento sin repetir cada paso manualmente.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {workflowCardsData.map(function (card, index) {
                const Icon = card.icon;
                return (
                  <motion.article
                    key={card.num}
                    initial={reduceMotion ? false : "hidden"}
                    whileInView={reduceMotion ? undefined : "show"}
                    viewport={{ once: true, amount: 0.3 }}
                    variants={revealUp}
                    custom={0.08 * (index + 1)}
                    className="relative overflow-hidden border border-black/8 bg-white px-5 py-5 shadow-[0_18px_44px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out cursor-default rounded-[4px] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="text-[26px] sm:text-[32px] font-bold uppercase tracking-tight text-[#ff4b0b]"
                          style={displayFont}
                        >
                          {card.num}
                        </span>
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ff4b0b]/10 text-[#ff4b0b] border border-[#ff4b0b]/20">
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>
                      <h3 className="text-[16px] font-bold leading-tight text-[#191918]">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-black/60">
                        {card.text}
                      </p>
                    </div>

                    <div className="mt-5 w-full bg-black/5 h-[3px] rounded-full overflow-hidden">
                      <motion.div
                        className="bg-[#ff4b0b] h-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                          duration: 2,
                          delay: index * 0.4,
                          repeat: Infinity,
                          repeatDelay: 1,
                        }}
                      />
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "show"}
            viewport={{ once: true, amount: 0.2 }}
            variants={scaleUpImage}
            className="relative overflow-hidden bg-[#121212] shadow-[0_26px_80px_rgba(0,0,0,0.16)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,75,11,0.18),transparent_34%)]" />
            <img
              src="/assets/pages/3-sistemas-digitales/content-ops-automatización3.webp"
              alt="Automatización y flujos de trabajo en procesos digitales"
              className="relative z-10 h-full min-h-[25rem] w-full object-cover object-[50%_30%] brightness-90 contrast-[.95]"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute bottom-8 left-8 right-8 z-20 border border-white/12 bg-black/55 px-6 py-5 backdrop-blur-md">
              <div className="flex items-center gap-3 text-white">
                <Sparkles className="h-4 w-4 text-[#ff4b0b]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/76">
                  Flujos automatizados
                </span>
              </div>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
                Conexión fluida entre tus aplicaciones, bases de datos y equipos.
                Reduce tiempos muertos y elimina errores de digitación manual.
              </p>
            </div>
          </motion.div>
        </div>
      </section>


      <section className="border-b border-black/6 bg-[#f3f1ee] py-20 lg:py-28">
        <div className="mx-auto grid max-w-[94rem] gap-12 px-6 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14">
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "show"}
            viewport={{ once: true, amount: 0.2 }}
            variants={scaleUpImage}
            className="relative order-2 lg:order-1 overflow-hidden bg-[#121212] shadow-[0_26px_80px_rgba(0,0,0,0.16)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,75,11,0.18),transparent_34%)]" />
            <img
              src="/assets/pages/3-sistemas-digitales/content-ops-command-center.png"
              alt="Centro de control CRM y operaciones digitales"
              className="relative z-10 h-full min-h-[25rem] w-full object-cover object-center"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute bottom-8 left-8 right-8 z-20 border border-white/12 bg-black/55 px-6 py-5 backdrop-blur-md">
              <div className="flex items-center gap-3 text-white">
                <Sparkles className="h-4 w-4 text-[#ff4b0b]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/76">
                  CRM Y SEGUIMIENTO COMERCIAL
                </span>
              </div>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
                Contactos, oportunidades y tareas reunidos en una sola vista para facilitar el seguimiento diario.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "show"}
            viewport={{ once: true, amount: 0.2 }}
            variants={revealUp}
            custom={0}
            className="order-1 lg:order-2"
          >
            <p className="text-[#ff4b0b] text-[12px] font-bold uppercase tracking-[0.12em]">
              CRM y seguimiento comercial / 02
            </p>
            <h2
              className="mt-3 text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em] text-[#191918]"
              style={displayFont}
            >
              Organizamos contactos, consultas y
              <br />
              <span className="text-[#ff4b0b]">seguimiento comercial.</span>
            </h2>
            <p className="mt-3 max-w-xl text-[16px] leading-[1.62] text-[#666] sm:text-[17px]">
              Implementamos un CRM para registrar contactos, ordenar oportunidades y centralizar el seguimiento comercial. Configuramos paneles para visualizar pendientes, avances y resultados.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-3 border-t border-black/10 pt-6">
              {crmEditorialColumns.map(function (col, index) {
                const Icon = col.icon;
                return (
                  <motion.div
                    key={col.title}
                    whileHover={reduceMotion ? {} : { y: -3 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`group pr-2 ${index !== 2 ? "sm:border-r sm:border-black/10 sm:pr-4" : ""
                      }`}
                  >
                    <Icon className="h-6 w-6 text-[#ff4b0b] mb-3 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-0.5" />
                    <h3 className="text-[16px] font-bold leading-tight text-[#191918] transition-colors duration-300 group-hover:text-[#ff4b0b]">
                      {col.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-black/60">
                      {col.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-black/6 bg-[#f9f8f6] py-20 lg:py-28">
        <div className="mx-auto grid max-w-[94rem] gap-8 px-6 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-4 lg:px-14">
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "show"}
            viewport={{ once: true, amount: 0.2 }}
            variants={revealUp}
            custom={0}
          >
            <p className="text-[#ff4b0b] text-[12px] font-bold uppercase tracking-[0.12em]">
              Desarrollo web y páginas de captación / 03
            </p>
            <h2
              className="mt-3 text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em] text-[#191918]"
              style={displayFont}
            >
              Páginas web para presentar,
              <br />
              <span className="text-[#ff4b0b]">captar y convertir.</span>
            </h2>
            <p className="mt-3 max-w-xl text-[16px] leading-[1.62] text-[#666] sm:text-[17px]">
              Desarrollamos plataformas web de alto rendimiento. Desde la estructura visual hasta la integración técnica, diseñamos páginas preparadas para recibir tráfico, captar consultas y registrar cada oportunidad.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-3 border-t border-black/10 pt-6">
              {webCapEditorialColumns.map(function (col, index) {
                const Icon = col.icon;
                return (
                  <motion.div
                    key={col.title}
                    whileHover={reduceMotion ? {} : { y: -3 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    style={{ scale: 0.73, transformOrigin: "top left" }}
                    className={`group pr-2 ${index !== 2 ? "sm:border-r sm:border-black/10 sm:pr-4" : ""
                      }`}
                  >
                    <Icon className="h-6 w-6 text-[#ff4b0b] mb-3 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-0.5" />
                    <h3 className="text-[16px] font-medium leading-tight text-[#191918] transition-colors duration-300 group-hover:text-[#ff4b0b]">
                      {col.title}
                    </h3>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-10">
              <Link to="/portafolio" className="inline-flex items-center gap-4 border-b-2 border-[#ff4b0b] pb-2 text-sm font-bold text-[#191918] transition-colors hover:text-[#ff4b0b] scale-[1.26] origin-left">
                Ver proyectos
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "show"}
            viewport={{ once: true, amount: 0.2 }}
            variants={scaleUpImage}
            className="relative flex w-full items-center justify-center"
          >
            <div className="group relative mx-auto flex w-full justify-center lg:w-[105%] lg:-translate-x-10 xl:-translate-x-14">
              <img
                src="/assets/pages/3-sistemas-digitales/desarrollo-web-paginas-captacion3.webp"
                alt="Desarrollo web y páginas de captación para proyectos"
                className="relative z-10 h-auto w-full object-contain object-center transition-transform duration-500 hover:scale-[1.01]"
                loading="lazy"
                decoding="async"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="estrategia-digital" className="-scroll-mt-24 border-b border-white/8 bg-[#121212] py-20 text-white lg:py-28">
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
                className="mt-6 text-[clamp(2.3rem,5.3vw,4.0rem)] uppercase leading-[0.9] tracking-[-0.04em] text-white"
                style={displayFont}
              >
                El sistema de contenido
                <br />
                no vive solo<span className="text-[#ff4b0b]">.</span>
              </h2>

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
                    whileHover={reduceMotion ? {} : {
                      y: -6,
                      borderColor: "rgba(255,75,11,0.3)",
                      backgroundColor: "rgba(255,255,255,0.06)",
                      transition: { duration: 0.25, ease: "easeOut" },
                    }}
                    className="group text-left border border-white/10 bg-white/[0.03] p-5 w-full rounded-[5px] block"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid h-9 w-9 place-items-center border border-white/10 bg-white/5 text-[#ff4b0b]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/34">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 text-[16px] font-semibold leading-tight text-white">
                      {area.title}
                    </h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-white/56">
                      {area.description}
                    </p>
                  </motion.div>
                );
              })}
              <div className="sm:col-span-2 mt-8 lg:mt-8 flex justify-start">
                <a href="#diagnostico" className="group inline-flex items-center gap-4 border-b-2 border-[#ff4b0b] pb-2 text-sm font-bold text-white transition-colors hover:text-[#ff4b0b]">
                  Solicitar diagnóstico
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>
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
            className="mb-14 max-w-4xl mx-auto text-center"
          >
            <SectionLabel>Aplicaciones reales</SectionLabel>
            <h2
              className="mt-6 text-[clamp(2.7rem,4.6vw,4.9rem)] leading-[0.89] tracking-[-0.05em] text-[#191918]"
              style={displayFont}
            >
              Diseñamos infraestructura para{" "}
              <span className="text-[#ff4b0b]">creadores</span>,{" "}
              equipos y proyectos.
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


      <section id="diagnostico" className="-scroll-mt-24 bg-[#f3f1ee] py-20 lg:py-28">
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
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-white">
                    Definimos qué parte del sistema conviene ordenar primero
                    para que el siguiente paso ya tenga impacto real en ventas,
                    producción o coordinación interna.
                  </p>
                </div>
              </div>

              <div className="px-6 py-10 sm:px-8 lg:px-12 lg:py-12 flex flex-col justify-center">
                <h2
                  className="text-[clamp(2.1rem,4.8vw,3.6rem)] leading-[0.95] tracking-[-0.03em] text-[#191918]"
                  style={displayFont}
                >
                  Ya tienes la Idea.
                  <br />
                  <span className="text-[#ff4b0b]">Ahora Construimos</span>
                  <br />
                  Su Infraestructura.
                </h2>

                {formSubmitted ? (
                  <div className="mt-8 flex flex-col items-start gap-3 border border-black/8 bg-[#f8f6f2] px-6 py-6">
                    <CheckCircle2 className="h-7 w-7 text-[#ff4b0b]" />
                    <p className="text-[15px] font-semibold text-[#191918]">¡Solicitud enviada!</p>
                    <p className="text-sm text-black/56">Te contactamos en menos de 24 horas para definir el siguiente paso juntos.</p>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="mt-2 text-xs font-bold uppercase tracking-wider text-[#ff4b0b] hover:underline"
                    >
                      Enviar otra consulta
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="mt-8 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="sd-name" className="text-[11px] font-bold uppercase tracking-wider text-black/50">Nombre</label>
                        <input
                          id="sd-name" name="name" type="text" required
                          placeholder="Tu nombre completo"
                          className="border border-black/12 bg-[#f8f6f2] px-4 py-2.5 text-sm text-[#191918] placeholder:text-black/30 outline-none focus:border-[#ff4b0b]/60 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="sd-phone" className="text-[11px] font-bold uppercase tracking-wider text-black/50">Teléfono</label>
                        <input
                          id="sd-phone" name="phone" type="tel" required
                          placeholder="+51 999 999 999"
                          className="border border-black/12 bg-[#f8f6f2] px-4 py-2.5 text-sm text-[#191918] placeholder:text-black/30 outline-none focus:border-[#ff4b0b]/60 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="sd-email" className="text-[11px] font-bold uppercase tracking-wider text-black/50">Correo</label>
                        <input
                          id="sd-email" name="email" type="email" required
                          placeholder="tucorreo@empresa.com"
                          className="border border-black/12 bg-[#f8f6f2] px-4 py-2.5 text-sm text-[#191918] placeholder:text-black/30 outline-none focus:border-[#ff4b0b]/60 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="sd-profile" className="text-[11px] font-bold uppercase tracking-wider text-black/50">¿A qué te dedicas?</label>
                        <select
                          id="sd-profile" name="profile" required
                          className="border border-black/12 bg-[#f8f6f2] px-4 py-2.5 text-sm text-[#191918] outline-none focus:border-[#ff4b0b]/60 transition-colors"
                        >
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
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="sd-service" className="text-[11px] font-bold uppercase tracking-wider text-black/50">¿Qué necesitas implementar?</label>
                      <select
                        id="sd-service" name="service" required
                        className="border border-black/12 bg-[#f8f6f2] px-4 py-2.5 text-sm text-[#191918] outline-none focus:border-[#ff4b0b]/60 transition-colors"
                      >
                        <option value="">Selecciona un servicio</option>
                        <option value="Automatización y Workflows">Automatización y Workflows</option>
                        <option value="Canales Digitales">Canales Digitales</option>
                        <option value="Webs y Landings">Webs y Landings</option>
                        <option value="CRM, Datos y Dashboards">CRM, Datos y Dashboards</option>
                        <option value="Agentes IA">Agentes IA</option>
                        <option value="Herramientas Internas">Herramientas Internas</option>
                        <option value="Estrategia Digital">Estrategia Digital</option>
                        <option value="No sé todavía / Necesito orientación">No sé todavía / Necesito orientación</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="sd-message" className="text-[11px] font-bold uppercase tracking-wider text-black/50">Cuéntanos tu situación</label>
                      <textarea
                        id="sd-message" name="message" rows={3}
                        placeholder="¿Qué quieres ordenar, automatizar o mejorar?"
                        className="border border-black/12 bg-[#f8f6f2] px-4 py-2.5 text-sm text-[#191918] placeholder:text-black/30 outline-none focus:border-[#ff4b0b]/60 transition-colors resize-none"
                      />
                    </div>

                    {formError && <p className="text-xs text-red-500">{formError}</p>}

                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="inline-flex items-center gap-2 bg-[#ff4b0b] px-7 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#e03a00] disabled:opacity-60"
                    >
                      {formSubmitting ? 'Enviando...' : 'Solicitar diagnóstico'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <p className="text-[11px] text-black/38">Usamos esta información únicamente para responder tu consulta.</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
