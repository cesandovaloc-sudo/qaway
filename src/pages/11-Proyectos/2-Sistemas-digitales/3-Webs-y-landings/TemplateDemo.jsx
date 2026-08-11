/**
 * TemplateDemo.jsx
 * 
 * Página de demostración del ProjectTemplate.
 * Solo visible en modo desarrollo.
 */

import ProjectTemplate from './ProjectTemplate'

const demoData = {
  kicker: 'PROYECTO WEB',
  title: 'Sistema Digital Qaway',
  description: 'Sitio web corporativo y generador de consultas para proyectos de marca, identidad visual y sistemas digitales.',
  client: 'Qaway Lab',
  service: 'Diseño + Desarrollo',
  year: '2024',
  technologies: ['React', 'Vite', 'Tailwind CSS', 'Supabase'],
  videoSrc: null,
  liveUrl: 'https://qawaylab.com',
  
  presentationText: 'Desarrollamos un sistema digital completo para Qaway Lab, incluyendo sitio web corporativo, plataforma de formación (Academy), sistema de pagos y herramientas de gestión. El objetivo era crear una presencia digital profesional que comunicara expertise en transformación digital.',
  
  objectives: [
    {
      title: 'Presentación Clara',
      description: 'Información organizada para explicar el proyecto de manera efectiva.'
    },
    {
      title: 'Captación de Consultas',
      description: 'Formularios y llamadas a la acción orientadas a generar contactos.'
    },
    {
      title: 'Experiencia Responsive',
      description: 'Diseño adaptado a escritorio, tablet y móvil.'
    },
    {
      title: 'Conexión Digital',
      description: 'Integración con WhatsApp, formularios y CRM.'
    }
  ],
  
  walkthroughVideo: null,
  
  identity: {
    colors: [
      { value: '#ff4b0b', hex: '#FF4B0B' },
      { value: '#111111', hex: '#111111' },
      { value: '#18181b', hex: '#18181B' },
      { value: '#fafafa', hex: '#FAFAFA' },
    ],
    typography: [
      { name: 'Display', fontFamily: "'Arial Narrow', 'Roboto Condensed', sans-serif" },
      { name: 'Body', fontFamily: "'Inter', -apple-system, sans-serif" },
    ],
  },
  
  devices: [
    { image: 'https://picsum.photos/seed/qaway-desktop/800/500', alt: 'Vista desktop', wide: true },
    { image: 'https://picsum.photos/seed/qaway-tablet/400/500', alt: 'Vista tablet' },
    { image: 'https://picsum.photos/seed/qaway-mobile/300/500', alt: 'Vista móvil' },
  ],
  
  pages: [
    { image: 'https://picsum.photos/seed/page-inicio/600/400', title: 'Inicio', description: 'Presentación y primera llamada a la acción.' },
    { image: 'https://picsum.photos/seed/page-estudio/600/400', title: 'Estudio', description: 'Servicios creativos y identidad visual.' },
    { image: 'https://picsum.photos/seed/page-sistemas/600/400', title: 'Sistemas Digitales', description: 'Automatización y herramientas con IA.' },
    { image: 'https://picsum.photos/seed/page-proyectos/600/400', title: 'Proyectos', description: 'Portafolio de casos de éxito.' },
    { image: 'https://picsum.photos/seed/page-blog/600/400', title: 'Blog', description: 'Contenido educativo y recursos.' },
    { image: 'https://picsum.photos/seed/page-academy/600/400', title: 'Academy', description: 'Plataforma de formación en línea.' },
  ],
  
  details: [
    { image: 'https://picsum.photos/seed/detail-nav/400/300', title: 'Navegación', description: 'Estructura clara para encontrar información.' },
    { image: 'https://picsum.photos/seed/detail-form/400/300', title: 'Formularios', description: 'Elementos ubicados estratégicamente.' },
    { image: 'https://picsum.photos/seed/detail-responsive/400/300', title: 'Diseño Responsive', description: 'Adaptación real a diferentes pantallas.' },
    { image: 'https://picsum.photos/seed/detail-icons/400/300', title: 'Iconografía', description: 'Elementos visuales coherentes con la marca.' },
  ],
  
  optionalVideo: null,
  
  results: [
    { value: '+120%', label: 'Consultas generadas' },
    { value: '-35%', label: 'Tiempo de respuesta' },
    { value: '+80%', label: 'Visitas móviles' },
    { value: '100%', label: 'Operación conectada' },
  ],
  
  prevProject: {
    title: 'Academy App',
    url: '/proyectos/academy',
  },
  nextProject: {
    title: 'CRM Automatizado',
    url: '/proyectos/crm',
  },
}

export default function TemplateDemo() {
  return <ProjectTemplate {...demoData} />
}
