import { TenantAgentWorkspace } from '../types/agent.types'

export const DEFAULT_AGENTS_DATA: TenantAgentWorkspace[] = [
  {
    id: 'tenant-qaway-master',
    slug: 'qaway-lab',
    name: 'Qaway Lab Digital (Master)',
    industry: 'Tecnología, SaaS y Sistemas Web',
    role: 'consultoria_ventas',
    agentName: 'QawayBot Consultor',
    tone: 'ejecutivo_formal',
    welcomeGreeting: '¡Hola! Soy el Asistente Virtual Oficial de Qaway Lab Digital (IA). ¿En qué proyecto o solución digital podemos orientarte hoy?',
    handoverMessage: 'He registrado tu solicitud de contacto directo. En breve uno de nuestros ingenieros de soluciones continuará la conversación contigo.',
    channel: 'whatsapp',
    aiSettings: {
      enabled: true,
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      mode: 'managed',
      api_key: null,
      temperature: 0.3,
      waba_phone_number_id: '10987654321',
      human_handoff_keywords: [
        'humano', 'asesor', 'persona', 'hablar con alguien',
        'queja', 'reclamo', 'cotizacion personalizada', 'ejecutivo'
      ],
      system_prompt: ''
    },
    knowledgeBase: [
      {
        id: 'kb-1',
        title: 'Sistemas Web y Apps a Medida',
        category: 'Desarrollo',
        description: 'Arquitecturas SaaS completas en React 19, Vite, Supabase, Tailwind v4 y PostgreSQL con alta disponibilidad y UX ergonómico.',
        referencePrice: 'Cotización sujeta a alcance tras diagnóstico técnico'
      },
      {
        id: 'kb-2',
        title: 'Notion Enterprise & SOPs de Negocio',
        category: 'Operaciones',
        description: 'Sistemas operativos completos para empresas, gestión de procesos, CRM interno y tableros operativos en Notion.',
        referencePrice: 'Plantilla Pro oficial: S/ 49 o $15 USD'
      },
      {
        id: 'kb-3',
        title: 'Comercio Conversacional & WhatsApp CRM WABA',
        category: 'Comercio',
        description: 'Integración oficial de WhatsApp Business API, flujos nativos de catálogo, cobros y agentes inteligentes multi-tenant.',
        referencePrice: 'Planes desde $49 USD/mes según volumen'
      }
    ],
    faqs: [
      {
        id: 'faq-1',
        question: '¿Qué garantía tienen los desarrollos de Qaway Lab?',
        answer: 'Todos nuestros proyectos cuentan con garantía técnica de estabilización, soporte continuo y trazabilidad de código con commits y despliegues auditados.'
      },
      {
        id: 'faq-2',
        question: '¿Cómo puedo agendar una llamada con un asesor?',
        answer: 'Puedes escribir la palabra "asesor" en este chat o acceder a nuestro calendario público en /hub/agenda para reservar tu sesión de diagnóstico.'
      }
    ],
    metrics: {
      totalConversations: 1240,
      simulationsRun: 48,
      handoffCount: 32,
      complianceScore: 100
    }
  },
  {
    id: 'tenant-coravet',
    slug: 'coravet',
    name: 'CoraVet Clínica Veterinaria',
    industry: 'Salud Animal y Pet Shop',
    role: 'agendamiento_citas',
    agentName: 'Luna CoraVet',
    tone: 'clinico_profesional',
    welcomeGreeting: '¡Hola! Soy Luna, la Asistente Virtual de CoraVet Clínica Veterinaria (IA). ¿En qué puedo cuidar a tu mascota hoy?',
    handoverMessage: 'Comprendo. Estoy derivando este caso de inmediato a nuestro equipo médico en recepción para que te asistan personalmente.',
    channel: 'whatsapp',
    aiSettings: {
      enabled: true,
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      mode: 'managed',
      api_key: null,
      temperature: 0.25,
      waba_phone_number_id: '10987654322',
      human_handoff_keywords: [
        'doctor', 'veterinario', 'emergencia', 'urgencia',
        'humano', 'asesor', 'grave', 'sangre', 'convulsion'
      ],
      system_prompt: ''
    },
    knowledgeBase: [
      {
        id: 'kb-c1',
        title: 'Consulta Médica General & Vacunación',
        category: 'Medicina',
        description: 'Evaluación integral por médico veterinario colegiado, control de peso, triaje y aplicación de vacunas importadas.',
        referencePrice: 'Consulta general desde S/ 45'
      },
      {
        id: 'kb-c2',
        title: 'Urgencias Médicas 24 Horas',
        category: 'Urgencias',
        description: 'Atención crítica inmediata para traumatismos, intoxicaciones y emergencias quirúrgicas.',
        referencePrice: 'Derivación inmediata presencial'
      }
    ],
    faqs: [
      {
        id: 'faq-c1',
        question: '¿Atienden emergencias los domingos?',
        answer: 'Sí, nuestra sede principal cuenta con médico veterinario de guardia las 24 horas del día, los 7 días de la semana.'
      }
    ],
    metrics: {
      totalConversations: 820,
      simulationsRun: 35,
      handoffCount: 27,
      complianceScore: 100
    }
  },
  {
    id: 'tenant-vallet',
    slug: 'vallet',
    name: 'Vallet Grupo Inmobiliario',
    industry: 'Bienes Raíces y Proyectos Residenciales',
    role: 'calificacion_leads',
    agentName: 'Vallet Advisor',
    tone: 'ejecutivo_formal',
    welcomeGreeting: 'Estimado/a, soy el Asesor Digital de Vallet Inmobiliaria (IA). ¿En qué proyecto o distrito te gustaría invertir hoy?',
    handoverMessage: 'Excelente, un Asesor Inmobiliario Senior tomará contacto directo contigo para presentarte los planos y opciones de financiamiento.',
    channel: 'web',
    aiSettings: {
      enabled: true,
      provider: 'openai',
      model: 'gpt-4o-mini',
      mode: 'byok',
      api_key: null,
      temperature: 0.2,
      waba_phone_number_id: null,
      human_handoff_keywords: [
        'asesor', 'agente', 'visita', 'separacion', 'humano', 'llamada'
      ],
      system_prompt: ''
    },
    knowledgeBase: [
      {
        id: 'kb-v1',
        title: 'Proyecto Residencial Alto Miraflores',
        category: 'Departamentos',
        description: 'Edificio sostenible de 1, 2 y 3 dormitorios frente a parque con certificación Edge y áreas comunes de lujo.',
        referencePrice: 'Desde $125,000 USD'
      }
    ],
    faqs: [
      {
        id: 'faq-v1',
        question: '¿Trabajan con crédito MiVivienda?',
        answer: 'Sí, los departamentos de 1 y 2 dormitorios califican al Bono Mivivienda Verde con tasas preferenciales con los principales bancos.'
      }
    ],
    metrics: {
      totalConversations: 540,
      simulationsRun: 19,
      handoffCount: 14,
      complianceScore: 100
    }
  }
]
