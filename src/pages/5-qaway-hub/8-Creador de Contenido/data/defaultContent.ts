import { CompetitorVideo, ScriptItem, CarouselDeck, LeadMagnetResource } from '../types/content.types'

export const INITIAL_COMPETITORS: CompetitorVideo[] = [
  {
    id: 'comp-1',
    creatorName: 'Nate Herk / AI Labs',
    handle: '@nateherk',
    videoUrl: 'https://instagram.com/p/reel-1',
    title: '5 Skills de Claude para automatizar 1 mes de contenido',
    views: 485000,
    saves: 42300,
    shares: 18900,
    hookText: 'Estas de aquí son las 5 skills de Claude que me crean todo el contenido del mes.',
    coreThesis: 'Desacoplar Hook de Cuerpo y usar SOPs especializados multiplica la producción 10x.',
    format: 'reel'
  },
  {
    id: 'comp-2',
    creatorName: 'Growth Design Hub',
    handle: '@growthdesign',
    videoUrl: 'https://instagram.com/p/reel-2',
    title: 'Por qué tu web no convierte (Caso Real)',
    views: 310000,
    saves: 29500,
    shares: 11200,
    hookText: 'El 90% de las marcas comete este error en los primeros 3 segundos de su web.',
    coreThesis: 'Mostrar pruebas tangibles y velocidad antes que claims abstractos duplica la retención.',
    format: 'carrusel'
  },
  {
    id: 'comp-3',
    creatorName: 'SaaS Builder Lab',
    handle: '@saasbuilder',
    videoUrl: 'https://instagram.com/p/reel-3',
    title: 'De idea a MVP en 48 horas sin código',
    views: 620000,
    saves: 68100,
    shares: 24700,
    hookText: 'Si tuviera que empezar de cero hoy con IA, no usaría ChatGPT para esto.',
    coreThesis: 'Los agentes modulares con herramientas locales superan a los chatbots genéricos.',
    format: 'blog'
  }
]

export const INITIAL_SCRIPTS: ScriptItem[] = [
  {
    id: 'script-1',
    title: 'Las 5 Skills de Automatización de Contenidos',
    format: 'reel',
    platform: 'instagram',
    hook: {
      text: 'Estas son las 5 skills que me crean todo el contenido del mes sin perder calidad.',
      variant: 'curiosidad',
      durationSec: 3.2,
      wordCount: 16
    },
    retentionBridge: 'La mayoría de creadores se queman porque intentan pensar 30 ideas distintas cada mes. El truco está en desacoplar el hook del cuerpo.',
    coreBody: 'Primero, usamos un extractor de patrones virales de referentes. Segundo, un copywriter que arma la estructura con tiempos de retención. Tercero, grabamos un solo cuerpo y le conectamos 5 ganchos distintos. Cuarto, calendarizamos equilibrando reels, historias y carruseles.',
    cta: {
      text: 'Comenta la palabra SKILL y te envío el sistema y las guías completas por DM.',
      triggerKeyword: 'SKILL',
      leadMagnetName: 'Guía de 5 Skills + SOPs de Contenido'
    },
    descriptionCopy: 'Deja de quemarte creando contenido desde cero. Aquí te muestro la arquitectura modular de producción con IA. Guarda este video y comenta SKILL para enviarte las instrucciones maestras.',
    status: 'en_edicion',
    scheduledDate: '2026-09-15',
    createdAt: '2026-09-07T12:00:00Z',
    updatedAt: '2026-09-07T12:00:00Z'
  },
  {
    id: 'script-2',
    title: 'Cómo estructurar un Carrusel que convierta seguidores en leads',
    format: 'carrusel',
    platform: 'instagram',
    hook: {
      text: 'El formato de carrusel de 7 slides que genera 40% más guardados que un Reel.',
      variant: 'resultado_especifico',
      durationSec: 4.0,
      wordCount: 15
    },
    retentionBridge: 'Un carrusel no es un resumen de Wikipedia. Es una conversación donde cada diapositiva te obliga a deslizar a la siguiente.',
    coreBody: 'Slide 1: Hook visual directo con número concreto. Slide 2: El error oculto del usuario. Slide 3 y 4: La solución paso a paso con diagrama o código. Slide 5: Caso de éxito o antes/después. Slide 6: Resumen ejecutivo. Slide 7: CTA único de comentario para ManyChat.',
    cta: {
      text: 'Desliza al final y comenta CARRUSEL para enviarte la plantilla editable en Canva y Figma.',
      triggerKeyword: 'CARRUSEL',
      leadMagnetName: 'Plantilla de Carrusel de Alta Conversión'
    },
    descriptionCopy: 'Los carruseles son el activo con mayor ratio de guardados en Instagram hoy. Aplica este framework de 7 diapositivas y cuéntame tus resultados. Link de plantilla en comentarios.',
    status: 'listo_grabar',
    scheduledDate: '2026-09-18',
    createdAt: '2026-09-07T13:00:00Z',
    updatedAt: '2026-09-07T13:00:00Z'
  },
  {
    id: 'script-3',
    title: 'Arquitectura de Agentes de IA para Productividad Empresarial',
    format: 'blog',
    platform: 'blog_qaway',
    hook: {
      text: 'Por qué los chatbots quedaron obsoletos y cómo los agentes locales están reemplazando flujos enteros.',
      variant: 'contrarian',
      durationSec: 5.0,
      wordCount: 16
    },
    retentionBridge: 'En 2026, pedirle a un chat que resuma un PDF es el nivel básico. Las empresas de alto rendimiento conectan modelos a terminales, bases de datos y orquestadores.',
    coreBody: 'Analizamos cómo una arquitectura basada en MCP (Model Context Protocol) combinada con Docker y n8n permite ejecutar tareas asíncronas con verificación visual y bucles de autocorrección sin intervención humana.',
    cta: {
      text: 'Descarga el informe técnico completo de arquitectura de agentes en Qaway Lab.',
      triggerKeyword: 'AGENTE',
      leadMagnetName: 'Whitepaper: Arquitectura de Agentes 2026'
    },
    descriptionCopy: 'Artículo técnico y estratégico para directores de tecnología y fundadores sobre la implementación de agentes autónomos seguros en infraestructuras privadas.',
    blogMeta: {
      seoTitle: 'Agentes Autónomos de IA y Productividad 2026 | Qaway Lab',
      metaDescription: 'Descubre cómo los agentes de IA con MCP y orquestadores autónomos multiplican la productividad técnica sin exponer datos sensibles.',
      targetKeywords: ['agentes ia', 'productividad empresarial', 'mcp claude', 'automatizacion n8n'],
      readingTimeMin: 6,
      contentMarkdown: `# Agentes Autónomos de IA: La Nueva Frontera de la Productividad Técnica\n\nEl paso de simples chatbots conversacionales a **sistemas agénticos con herramientas de ejecución** marca el cambio más importante en desarrollo de software y operaciones digitales.\n\n## 1. El límite de los chatbots tradicionales\nUn chat pasivo depende de que el usuario formule la pregunta exacta y copie el resultado. En contraste, un **agente autónomo**:\n- Inspecciona el entorno y los archivos.\n- Diseña un plan antes de modificar código.\n- Ejecuta pruebas y valida que la solución funcione.\n\n## 2. El rol de los protocolos de contexto (MCP)\nCon la llegada de protocolos abiertos como MCP, la IA puede interactuar de forma segura con bases de datos, APIs de redes sociales y terminales de ejecución sin exponer credenciales en texto plano.\n\n## 3. Conclusión para líderes de negocio\nAutomatizar no es sustituir el criterio humano, sino eliminar la fricción repetitiva para enfocar el talento en estrategia y diseño de producto.`
    },
    status: 'programado',
    scheduledDate: '2026-09-22',
    createdAt: '2026-09-07T14:00:00Z',
    updatedAt: '2026-09-07T14:00:00Z'
  },
  {
    id: 'script-4',
    title: 'Framework de 3 Pasos para Diseñar Landing Pages que Sí Vendan',
    format: 'post',
    platform: 'linkedin',
    hook: {
      text: 'Tu landing page no necesita más texto. Necesita mejor jerarquía y velocidad.',
      variant: 'resultado_especifico',
      durationSec: 3.5,
      wordCount: 12
    },
    retentionBridge: 'Hicimos una auditoría a más de 40 sitios web de servicios y encontramos que el 85% pierde al visitante antes del primer scroll.',
    coreBody: 'Regla 1: Un solo mensaje claro en el Hero que responda qué haces y para quién es. Regla 2: Evidencias tangibles ("receipts") antes de testimonios genéricos. Regla 3: Un solo botón principal con contraste directo.',
    cta: {
      text: 'Comenta "AUDITORIA" en este post y revisamos tu landing page en 24 horas.',
      triggerKeyword: 'AUDITORIA',
      leadMagnetName: 'Checklist de Auditoría Web Express'
    },
    descriptionCopy: 'El diseño web efectivo no es arte decorativo; es claridad y reducción de fricción cognitiva. ¿Cuándo fue la última vez que auditaste la tasa de rebote de tu portada?',
    postVisualText: '3 Reglas de Oro para tu Landing Page:\n1. 1 Promesa Clara\n2. Cero Texto Relleno\n3. Evidencias Verificables',
    status: 'guion_aprobado',
    scheduledDate: '2026-09-25',
    createdAt: '2026-09-07T15:00:00Z',
    updatedAt: '2026-09-07T15:00:00Z'
  }
]

export const INITIAL_CAROUSELS: CarouselDeck[] = [
  {
    id: 'carousel-1',
    title: '5 Skills de Claude para 1 Mes de Contenido',
    niche: 'Creación de Contenido & IA',
    theme: 'dark_qaway',
    slides: [
      {
        id: 's-1',
        slideNumber: 1,
        type: 'portada',
        title: '5 Skills de Claude',
        subtitle: '1 Mes de contenido programado en 1 tarde',
        footerNote: 'Desliza para ver el sistema →'
      },
      {
        id: 's-2',
        slideNumber: 2,
        type: 'contenido',
        title: 'Skill 1: Generador de Ideas',
        subtitle: 'Espía los outliers de tus referentes',
        bullets: [
          'Analiza qué vídeos superaron 3x la media de views',
          'Extrae el ángulo psicológico y la tesis',
          'Genera 10 conceptos adaptados a tu marca'
        ],
        footerNote: '01 / 05 Skills'
      },
      {
        id: 's-3',
        slideNumber: 3,
        type: 'contenido',
        title: 'Skill 2: Copywriter Modular',
        subtitle: 'Escribe palabra por palabra con tiempos',
        bullets: [
          'Hook (0-3 segundos) para detener el scroll',
          'Retención (3-15 segundos) planteando el conflicto',
          'Cuerpo de alto valor y CTA único'
        ],
        footerNote: '02 / 05 Skills'
      },
      {
        id: 's-4',
        slideNumber: 4,
        type: 'revelacion',
        title: 'Skill 3: Distribuidor Combinatorio',
        subtitle: '1 Cuerpo grabado × 5 Hooks = 5 Creativos',
        bullets: [
          'Graba un solo video explicativo de 40 segundos',
          'Graba 5 introducciones diferentes de 5 segundos',
          'Multiplica tus probabilidades virales sin cansarte'
        ],
        footerNote: '03 / 05 Skills'
      },
      {
        id: 's-5',
        slideNumber: 5,
        type: 'cta',
        title: '¿Quieres las 5 Skills?',
        subtitle: 'Comenta la palabra SKILL y te las envío por DM',
        bullets: [
          'Incluye los SOPs en Markdown',
          'Plantilla de calendario de 30 días',
          'Guía de automatización con ManyChat'
        ],
        footerNote: 'Qaway Lab Content Suite'
      }
    ]
  }
]

export const INITIAL_LEAD_MAGNETS: LeadMagnetResource[] = [
  {
    id: 'lm-1',
    title: 'SOP Maestro: Auditoría de Perfil Instagram en Chrome',
    category: 'Estrategia de Redes',
    summary: 'Prompt maestro paso a paso para auditar perfiles en segundos y detectar fugas de conversión en biografía, historias destacadas y reels.',
    triggerKeyword: 'AUDITORIA',
    targetFormat: 'prompt_maestro',
    contentMarkdown: `# SOP: Auditoría de Perfil de Instagram para Conversión\n\n## 1. Biografía (Los 3 Segundos de Decisión)\n- [ ] ¿El titular deja claro exactamente qué problema resuelves sin usar tecnicismos confusos?\n- [ ] ¿Hay una prueba social o credencial verificable?\n- [ ] ¿El enlace único dirige a un recurso de alto valor con captura de lead?\n\n## 2. Historias Destacadas (El Embudo Invisible)\n- **Destacada 1: 'Empieza Aquí'** → Quién eres, tu historia y a quién ayudas.\n- **Destacada 2: 'Resultados / Casos'** → Capturas reales de clientes satisfechos.\n- **Destacada 3: 'Recurso Gratis'** → Cómo conseguir tu guía principal.\n\n## 3. Matriz de Contenido (Los Últimos 9 Posts)\n- Al menos 3 reels orientados a alcance de nuevos usuarios.\n- Al menos 3 carruseles orientados a guardados y autoridad.\n- Al menos 3 publicaciones con llamada a la acción hacia mensajería privada.`
  },
  {
    id: 'lm-2',
    title: 'Guía Maestra: Fórmulas de Hooks y Tiempos de Retención',
    category: 'Copywriting Audiovisual',
    summary: '25 Fórmulas probadas de ganchos verbales y visuales clasificados por categoría: Contrarian, Curiosidad, Error Común y Resultado Rápido.',
    triggerKeyword: 'HOOKS',
    targetFormat: 'checklist',
    contentMarkdown: `# 25 Fórmulas de Hooks de Alta Retención\n\n### Categoría 1: Contrarian (Romper la creencia común)\n1. *"Todo el mundo te dice que hagas [X], pero en realidad eso está arruinando tu [Y]."* \n2. *"Si tuviera que empezar de cero en [año], no usaría [herramienta popular]. Haría esto."*\n3. *"Deja de [acción común]. Es una pérdida de tiempo por esta sencilla razón..."*\n\n### Categoría 2: Resultado Específico con Prueba\n4. *"Cómo conseguimos [resultado numérico] en [periodo corto] con solo [recurso]."*\n5. *"Este pequeño cambio en [área] aumentó nuestra conversión en un [porcentaje]%."*\n\n### Categoría 3: El Error Oculto\n6. *"El 95% de las marcas comete este error en los primeros 3 segundos y ni se dan cuenta."*\n7. *"Si tu contenido no está consiguiendo guardados, estás ignorando esta regla básica."*`
  }
]
