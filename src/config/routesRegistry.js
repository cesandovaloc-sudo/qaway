import {
  Sparkles,
  PenTool,
  Layers,
  Cpu,
  Palette,
  FolderKanban,
  Globe,
  BookOpen,
  Shield,
  GraduationCap,
} from 'lucide-react'

// =========================================================================
// ESTRUCTURA JERÁRQUICA DE RUTAS CENTRALIZADA (MANDOS SUPERIORES -> HIJOS)
// Fuente única de verdad para el sistema de rutas del portal.
// =========================================================================
export const hierarchicalRoutes = [
  // 1. BLOG & SISTEMA EDITORIAL
  {
    id: 'blog-publico',
    title: 'Página de Blog',
    path: '/blog',
    category: 'Blog',
    icon: Sparkles,
    badge: 'Público',
    badgeType: 'public',
    summary: 'Portada pública del blog, artículos recomendados y navegación por pilares temáticos.',
    children: [
      {
        title: 'Categoría: Inteligencia Artificial',
        path: '/blog/inteligencia-artificial',
        description: 'Ideas, herramientas y criterio aplicado para entender la IA más allá del ruido.',
        tag: 'Pilar',
      },
      {
        title: 'Categoría: Productividad',
        path: '/blog/productividad',
        description: 'Sistemas, hábitos y recursos para trabajar con más claridad y menos fricción.',
        tag: 'Pilar',
      },
      {
        title: 'Categoría: Marketing',
        path: '/blog/marketing',
        description: 'Captación, contenidos, CRM y decisiones comerciales conectadas a negocio real.',
        tag: 'Pilar',
      },
      {
        title: 'Categoría: Diseño & Branding',
        path: '/blog/diseno-branding',
        description: 'Comunicación visual, identidad y percepción de marca con criterio digital.',
        tag: 'Pilar',
      },
      {
        title: 'Categoría: Automatización',
        path: '/blog/automatizacion',
        description: 'Workflows, integraciones y operaciones digitales que ahorran tiempo y errores.',
        tag: 'Pilar',
      },
      {
        title: 'Artículo: Habilidades Clave con IA',
        path: '/blog/articulo/habilidades-clave-para-trabajar-con-ia-guia-practica',
        description: 'Guía práctica de capacidades fundamentales para el trabajo con IA.',
        tag: 'Post Producción',
      },
      {
        title: 'Render Dinámico de Artículo',
        path: '/blog/articulo/:id',
        description: 'Plantilla de lectura con audio por voz secuencial y cálculo de tiempo de lectura.',
        tag: 'Template',
      },
    ],
  },
  {
    id: 'blog-editor',
    title: 'Editor de Blog & Consola Editorial',
    path: '/hub/blog-editor',
    category: 'Blog',
    icon: PenTool,
    badge: 'Hub Interno',
    badgeType: 'hub',
    summary: 'Consola editorial WYSIWYG conectada a Supabase para redacción, vista previa y publicación sincronizada 1:1.',
    children: [
      {
        title: 'Crear Artículo Nuevo',
        path: '/editor/new',
        description: 'Lienzo en blanco con formato calibrado a 18px, interlineado 1.68 y ancho de 712px.',
        tag: 'WYSIWYG',
      },
      {
        title: 'Editor de Artículo Existente',
        path: '/editor/:id',
        description: 'Editor visual directo con auto-guardado y gestión de metadatos.',
        tag: 'WYSIWYG',
      },
      {
        title: 'Editor en Contexto de Hub',
        path: '/hub/blog-editor/editor/:id',
        description: 'Ruta interna anidada dentro del contenedor del Hub administrativo.',
        tag: 'Admin',
      },
    ],
  },

  // 2. QAWAY HUB
  {
    id: 'qaway-hub',
    title: 'Qaway Hub Central',
    path: '/hub',
    category: 'Qaway Hub',
    icon: Layers,
    badge: 'Hub Interno',
    badgeType: 'hub',
    summary: 'Consola central de operaciones y accesos a herramientas de gestión del equipo.',
    children: [
      {
        title: 'Portal de Acceso (Login de Hub)',
        path: '/login',
        description: 'Autenticación y puerta de acceso a la consola administrativa de Qaway Hub.',
        tag: 'Auth',
      },
      {
        title: 'CRM de Ventas & Leads',
        path: '/hub/crm',
        description: 'Bandeja de prospectos comerciales, estados de seguimiento y trazabilidad.',
        tag: 'CRM',
      },
      {
        title: 'WABA CRM (WhatsApp Console)',
        path: '/hub/waba-crm',
        description: 'Bandeja centralizada de mensajería empresarial vía WhatsApp Cloud API.',
        tag: 'WhatsApp API',
      },
      {
        title: 'Gestor de Proyectos & Timelines',
        path: '/hub/gestor-proyectos',
        description: 'Panel de control de hitos, fases operativas y cronogramas de entrega.',
        tag: 'Gestión',
      },
      {
        title: 'Portal de Cliente (Dinámico)',
        path: '/portal/:slug',
        description: 'Visualizador de estado de proyecto y cronograma en vivo para clientes.',
        tag: 'Portal Cliente',
      },
      {
        title: 'Recorrido de Proyecto (Hitos Ágiles)',
        path: '/proyectos/recorrido/:slug',
        description: 'Visualizador interactivo de hitos, entregables y avances del proyecto.',
        tag: 'Recorrido',
      },
      {
        title: 'Analytics Studio & Dashboards',
        path: '/hub/analytics',
        description: 'Métricas de navegación, fuentes de tráfico, interacción y tasas de conversión.',
        tag: 'Analítica',
      },
      {
        title: 'Optimizador de Imágenes WebP',
        path: '/hub/optimizador-webp',
        description: 'Herramienta interactiva para comprimir y convertir imágenes PNG y JPG a WebP en el navegador.',
        tag: 'Herramienta Web',
      },
      {
        title: 'Marketing Studio',
        path: '/hub/marketing',
        description: 'Planificación editorial, lanzamientos de productos y campañas de contenido.',
        tag: 'Marketing',
      },
      {
        title: 'Marketing Studio Twenty',
        path: '/hub/marketing2',
        description: 'Módulo extendido de experimentación y segmentación de audiencias para growth.',
        tag: 'Growth',
      },
    ],
  },

  // 3. SISTEMAS DIGITALES
  {
    id: 'sistemas-digitales',
    title: 'Sistemas Digitales',
    path: '/sistemas-digitales',
    category: 'Sistemas Digitales',
    icon: Cpu,
    badge: 'Servicios',
    badgeType: 'area',
    summary: 'Suite de soluciones tecnológicas para automatizar y escalar operaciones comerciales.',
    children: [
      {
        title: 'Automatización de Procesos',
        path: '/sistemas-digitales/automatizacion',
        description: 'Flujos sin código conectando Make, n8n, Zapier y OpenAI para ahorrar horas manuales.',
        tag: 'Workflows',
      },
      {
        title: 'Canales Digitales & Mensajería',
        path: '/sistemas-digitales/canales-digitales',
        description: 'Orquestación de WhatsApp API, correos transaccionales y soporte omnicanal.',
        tag: 'Mensajería',
      },
      {
        title: 'Webs & Landings de Alto Rendimiento',
        path: '/sistemas-digitales/webs-y-landings',
        description: 'Desarrollo web a medida con React, Vite y Tailwind enfocado en velocidad y conversión.',
        tag: 'Desarrollo',
      },
      {
        title: 'CRM, Datos & Dashboards',
        path: '/sistemas-digitales/crm-datos-dashboards',
        description: 'Modelado de bases de datos en Supabase y tableros interactivos para toma de decisiones.',
        tag: 'Datos',
      },
      {
        title: 'Agentes de IA Autónomos',
        path: '/sistemas-digitales/agentes-ia',
        description: 'Asistentes de IA contextuales entrenados con datos del negocio para soporte y ventas.',
        tag: 'Agentes IA',
      },
      {
        title: 'Herramientas Internas',
        path: '/sistemas-digitales/herramientas-internas',
        description: 'Paneles de administración y backoffices a medida para equipos operativos.',
        tag: 'Backoffice',
      },
      {
        title: 'Estrategia de Sistemas',
        path: '/sistemas-digitales/estrategia-digital',
        description: 'Diseño y optimización del stack tecnológico para escalar la infraestructura digital.',
        tag: 'Estrategia',
      },
    ],
  },

  // 4. ESTUDIO CREATIVO
  {
    id: 'estudio',
    title: 'Estudio Creativo',
    path: '/estudio',
    category: 'Estudio',
    icon: Palette,
    badge: 'Servicios',
    badgeType: 'area',
    summary: 'Dirección de arte, creación de identidad visual de marca y posicionamiento profesional.',
    children: [
      {
        title: 'Branding Digital',
        path: '/estudio/branding-digital',
        description: 'Sistemas de identidad visual, tipografía, paletas cromáticas y aplicaciones digitales.',
        tag: 'Identidad',
      },
      {
        title: 'Contenido Visual',
        path: '/estudio/contenido-visual',
        description: 'Producción multimedia, fotografía editorial y piezas para canales digitales.',
        tag: 'Audiovisual',
      },
      {
        title: 'Presencia Profesional',
        path: '/estudio/presencia-profesional',
        description: 'Posicionamiento estratégico para fundadores y ejecutivos en LinkedIn.',
        tag: 'Perfiles',
      },
      {
        title: 'Estrategia Digital (Estudio)',
        path: '/estudio/estrategia-digital',
        description: 'Planificación de marca y arquitectura de comunicación visual.',
        tag: 'Branding',
      },
      {
        title: 'Consultoría Estratégica',
        path: '/estudio/consultoria',
        description: 'Diagnóstico 1 a 1 y hoja de ruta para elevar la percepción comercial de la marca.',
        tag: 'Consultoría',
      },
      {
        title: 'Portada Oficial Qaway Lab',
        path: '/',
        description: 'Portada institucional principal con hero interactivo, servicios y manifiesto.',
        tag: 'Home',
      },
      {
        title: 'Brief de Onboarding & Requerimientos',
        path: '/brief',
        description: 'Formulario interactivo de captura de requerimientos de marca y sistemas para nuevos clientes.',
        tag: 'Onboarding',
      },
    ],
  },

  // 5. PROYECTOS & DEMOS
  {
    id: 'proyectos',
    title: 'Catálogo de Proyectos',
    path: '/proyectos',
    category: 'Proyectos',
    icon: FolderKanban,
    badge: 'Portafolio',
    badgeType: 'demo',
    summary: 'Portafolio interactivo de sitios web, ecosistemas digitales y casos de éxito reales.',
    children: [
      {
        title: 'Vallet Asesoría Inmobiliaria',
        path: '/proyectos/vallet',
        description: 'Suite inmobiliaria completa con portada, buscador de propiedades y ficha de detalle.',
        tag: 'Inmobiliaria',
        isSuite: true,
        suiteBadge: 'Suite 3 páginas',
        subPages: [
          {
            title: 'Portada Inmobiliaria',
            path: '/proyectos/vallet',
            description: 'Portada principal con hero interactivo y servicios de asesoría.',
            tag: 'Home',
          },
          {
            title: 'Catálogo de Propiedades',
            path: '/proyectos/vallet/propiedades',
            description: 'Buscador y catálogo de cartera con filtros por modalidad y distrito.',
            tag: 'Catálogo',
          },
          {
            title: 'Ficha de Propiedad (Miraflores)',
            path: '/proyectos/vallet/propiedad/departamento-miraflores',
            description: 'Secuencia interactiva de detalle de propiedad, fotos y agendamiento.',
            tag: 'Ficha Detalle',
          },
        ],
      },
      {
        title: 'Horizonte Inmobiliaria',
        path: '/proyectos/horizonte',
        description: 'Ecosistema web con recorridos 3D y captación automatizada a WhatsApp.',
        tag: 'Inmobiliaria',
        isSuite: true,
        suiteBadge: 'Suite 2 versiones',
        subPages: [
          {
            title: 'Horizonte (Vista Interactiva)',
            path: '/proyectos/horizonte',
            description: 'Recorrido interactivo y catálogo visual 3D.',
            tag: 'Live Demo',
          },
          {
            title: 'Horizonte (Versión Producción)',
            path: '/proyectos/horizonte-real',
            description: 'Entorno de despliegue real optimizado.',
            tag: 'Producción',
          },
        ],
      },
      {
        title: 'Mesa Selecta',
        path: '/proyectos/mesa-selecta',
        description: 'Plataforma gastronómica con catálogo gourmet y blog editorial.',
        tag: 'Gastronomía',
      },
      {
        title: 'EPC Estudio Contable',
        path: '/proyectos/epc',
        description: 'Sitio corporativo y portal de servicios contables y tributarios.',
        tag: 'Finanzas',
      },
      {
        title: 'Panadería Josué',
        path: '/proyectos/panaderia-josue',
        description: 'E-commerce y vitrina de productos artesanales con pedidos directos.',
        tag: 'E-commerce',
      },
      {
        title: 'Áurea Skincare',
        path: '/proyectos/aurea-skincare',
        description: 'Tienda digital de cosmética y cuidado facial de alta gama.',
        tag: 'Skincare',
      },
      {
        title: 'Plantora',
        path: '/proyectos/plantora',
        description: 'Catálogo botánico y plataforma de comercio de plantas de interior.',
        tag: 'Botánica',
      },
      {
        title: 'Saniclick',
        path: '/proyectos/saniclick',
        description: 'Web de servicios de higiene industrial y desinfección profesional.',
        tag: 'Servicios',
      },
      {
        title: 'Dental Clinic',
        path: '/proyectos/dental',
        description: 'Portal odontológico con reserva de citas y catálogo de especialidades.',
        tag: 'Salud',
      },
    ],
  },

  // 6. LANDINGS DE CAPTACIÓN
  {
    id: 'landings',
    title: 'Directorio de Landings',
    path: '/landings',
    category: 'Landings',
    icon: Globe,
    badge: 'Conversión',
    badgeType: 'landing',
    summary: 'Embudos de captación publicitaria y páginas de venta de servicios específicos.',
    children: [
      {
        title: 'Landing: Desarrollo Web & Software',
        path: '/landings/desarrollo-web',
        description: 'Página principal de ventas para servicios de diseño y programación web.',
        tag: 'Core Sales',
      },
      {
        title: 'Landing: Sistema de Contenido en Notion',
        path: '/landings/sistema-contenido-notion',
        description: 'Oferta del gestor y calendario editorial automatizado en Notion.',
        tag: 'Notion',
      },
      {
        title: 'Landing: Identidad Visual & Branding',
        path: '/landings/identidad-visual',
        description: 'Página de captación para proyectos de rediseño e identidad corporativa.',
        tag: 'Branding',
      },
      {
        title: 'Landing: Servicios Contables',
        path: '/landings/contable',
        description: 'Embudo de conversión para asesoría tributaria y contable.',
        tag: 'Contable',
      },
      {
        title: 'Landing: Restauración Fotográfica',
        path: '/landings/restauracion-fotografica',
        description: 'Servicio de restauración y remasterización digital de fotos familiares con IA.',
        tag: 'Servicios',
      },
      {
        title: 'Landing: Fotografía para LinkedIn',
        path: '/landings/fotografia-linkedin',
        description: 'Sesiones de retrato ejecutivo para perfiles corporativos en LinkedIn.',
        tag: 'Fotografía',
      },
    ],
  },

  // 7. RECURSOS & EBOOKS
  {
    id: 'recursos',
    title: 'Biblioteca de Recursos',
    path: '/recursos',
    category: 'Recursos',
    icon: BookOpen,
    badge: 'Público',
    badgeType: 'public',
    summary: 'Centro de descargas con guías prácticas, ebooks, checklists y plantillas de trabajo.',
    children: [
      {
        title: 'Guía: Primeros Flujos con IA',
        path: '/recursos/primeros-flujos-ia',
        description: 'Guía paso a paso para implementar tus primeras automatizaciones con IA.',
        tag: 'Guía Práctica',
      },
      {
        title: 'Script: Optimizador de Imágenes WebP (CLI)',
        path: '/recursos/optimizador-imagenes-webp',
        description: 'Script Node.js con motor Sharp para reducir hasta 95% el peso de imágenes sin pérdida visual.',
        tag: 'Script CLI',
      },
      {
        title: 'Ebook: Google Calendar Dominado',
        path: '/recursos/ebooks/google-calendar-dominado',
        description: 'Sistema operativo semanal para organizar tu tiempo con bloques y apoyo de IA.',
        tag: 'Ebook',
      },
      {
        title: 'Visor Dinámico de Recursos',
        path: '/recursos/:category',
        description: 'Filtrado dinámico por categoría y tipo de recurso descargable.',
        tag: 'Filtro',
      },
    ],
  },

  // 8. ACADEMY
  {
    id: 'academy',
    title: 'Qaway Academy',
    path: '/academy',
    category: 'Academy',
    icon: GraduationCap,
    badge: 'Formación',
    badgeType: 'area',
    summary: 'Programas formativos aplicados, workshops prácticos y metodologías de inteligencia artificial.',
    children: [
      {
        title: 'Qaway Academy (Plataforma)',
        path: '/academy',
        description: 'Catálogo de cursos y formaciones prácticas para profesionales.',
        tag: 'Formación',
      },
    ],
  },
]

export const categoriesList = [
  'Todos',
  'Estudio',
  'Sistemas Digitales',
  'Proyectos',
  'Blog',
  'Recursos',
  'Academy',
  'Qaway Hub',
  'Landings',
]
