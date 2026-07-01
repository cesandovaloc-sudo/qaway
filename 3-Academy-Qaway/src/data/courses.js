/**
 * Catálogo de cursos — fuente única de verdad.
 * Cuando se conecte Supabase, reemplazar consultas aquí.
 */
export const courses = [
  {
    slug: 'ia-aplicada-productividad',
    title: 'IA Aplicada a la Productividad',
    description:
      'Aprende a integrar ChatGPT, Claude y otras herramientas IA en tu flujo de trabajo diario para ahorrar horas semanales.',
    summary:
      'Domina la inteligencia artificial para multiplicar tu productividad diaria.',
    level: 'Básico',
    duration: '4 módulos',
    price: 0, // gratuito
    modules: [
      { title: 'Fundamentos de IA aplicada', lessons: 4 },
      { title: 'ChatGPT para trabajo diario', lessons: 5 },
      { title: 'Claude y asistentes especializados', lessons: 3 },
      { title: 'Flujos de productividad con IA', lessons: 4 },
    ],
  },
  {
    slug: 'automatizacion-workflows',
    title: 'Automatización y Workflows',
    description:
      'Diseña sistemas de trabajo automatizados que conectan tus herramientas y reducen tareas repetitivas.',
    summary:
      'Convierte procesos manuales en flujos automáticos que funcionan solos.',
    level: 'Intermedio',
    duration: '6 módulos',
    price: 49.99,
    modules: [
      { title: 'Introducción a la automatización', lessons: 3 },
      { title: 'Mapa de procesos', lessons: 4 },
      { title: 'Herramientas de automatización', lessons: 5 },
      { title: 'Integraciones digitales', lessons: 4 },
      { title: 'Workflows avanzados', lessons: 4 },
      { title: 'Mantenimiento y escalado', lessons: 3 },
    ],
  },
  {
    slug: 'marketing-digital-ia',
    title: 'Marketing Digital con IA',
    description:
      'Combina estrategia digital con inteligencia artificial para crear campañas, contenido y captación eficiente.',
    summary:
      'Aprende a crear estrategias de marketing potenciadas por IA.',
    level: 'Intermedio',
    duration: '5 módulos',
    price: 49.99,
    modules: [
      { title: 'Estrategia digital moderna', lessons: 4 },
      { title: 'Contenido con IA', lessons: 5 },
      { title: 'Funnels y captación', lessons: 4 },
      { title: 'Campañas y ADS', lessons: 4 },
      { title: 'Medición y optimización', lessons: 3 },
    ],
  },
]
