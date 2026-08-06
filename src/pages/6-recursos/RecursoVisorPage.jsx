import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Copy, Check, Play, RefreshCw, Send, CheckCircle,
  FileText, Terminal, ClipboardCheck, Sparkles, Download, ExternalLink,
  BookOpen, Lock, ShieldCheck, HeartHandshake, Eye,
  FolderOpen, Zap, Key, Settings, Info
} from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'

// Resources detailed data with simulation structures
const SIMULATED_RESOURCES = {
  'notion-manual-sops': {
    title: 'Plantilla Notion: Manual de SOPs',
    category: 'plantillas',
    categoryLabel: 'Plantillas',
    type: 'Plantilla Notion',
    badge: 'Premium',
    description: 'Estructura lista para documentar procesos y automatizaciones de tu negocio, facilitando la delegación sin fricciones y estandarizando tu operación diaria.',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800',
    details: {
      useCase: 'Documentación de procesos corporativos, delegación de tareas y onboarding de equipo.',
      features: [
        'Estructura prediseñada con jerarquía de departamentos (Marketing, Ventas, Operaciones).',
        'Plantilla de SOP lista para duplicar con secciones de Objetivos, Responsables e Instrucciones.',
        'Base de datos de herramientas y accesos del negocio integrada.',
        'Sección de logs de automatizaciones para documentar flujos de Make/n8n.'
      ]
    }
  },
  'sheets-calculadora-leads': {
    title: 'Plantilla Google Sheets: Calculadora de ROI',
    category: 'plantillas',
    categoryLabel: 'Plantillas',
    type: 'Google Sheets',
    badge: 'Gratis',
    description: 'Calcula el retorno de inversión de tus campañas publicitarias y proyecta el costo de adquisición de leads de forma interactiva.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    details: {
      useCase: 'Evaluación rápida de rentabilidad en Meta Ads, Google Ads y TikTok Ads.',
      features: [
        'Cálculo automático de CTR, CPA, CPL y ROI.',
        'Simulador de escenarios optimista, realista y pesimista.',
        'Gráficos pre-configurados para reportes comerciales inmediatos.',
        'Fórmulas abiertas y listas para ser personalizadas.'
      ]
    }
  },
  'prompt-generador-copys': {
    title: 'Mega-Prompt: Generador de Copys de Venta',
    category: 'prompts',
    categoryLabel: 'Prompts',
    type: 'Prompt Claude/ChatGPT',
    badge: 'Gratis',
    description: 'Instrucción avanzada estructurada bajo técnicas de copywriting (AIDA) para redactar correos y landing pages altamente persuasivas en segundos.',
    image: 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=800',
    details: {
      useCase: 'Creación de textos publicitarios, correos fríos y copys para landings de servicios.',
      promptText: `Actúa como un Copywriter Senior experto en embudos de venta y conversión directa. Tu objetivo es redactar un copy de ventas utilizando la estructura AIDA (Atención, Interés, Deseo, Acción) enfocado en resolver el dolor principal de mi cliente ideal.

[INFORMACIÓN DEL PRODUCTO]
Nombre: {PRODUCT_NAME}
Descripción: {PRODUCT_DESC}
Cliente Ideal: {TARGET_AUDIENCE}
Dolor Principal: {MAIN_PAIN}

[INSTRUCCIONES DE FORMATO]
- Estructura el texto claramente separando cada fase: Atención, Interés, Deseo, Acción.
- Usa frases cortas, directas y con alta carga emocional.
- Agrega un llamado a la acción único, sin ambigüedades.
- Genera 3 variantes de títulos ganchos al inicio.`,
      features: [
        'Estructura profesional validada por copys de Qaway Lab.',
        'Fácil reemplazo de variables encerradas en corchetes.',
        'Optimizado para Claude 3.5 Sonnet y GPT-4o.'
      ]
    }
  },
  'prompt-calibracion-soporte': {
    title: 'Prompt: Asistente IA de Atención al Cliente',
    category: 'prompts',
    categoryLabel: 'Prompts',
    type: 'Prompt System',
    badge: 'Gratis',
    description: 'Prompt de sistema para entrenar a tus agentes de Inteligencia Artificial en WhatsApp, asegurando respuestas seguras y alineadas al tono del negocio.',
    image: 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=800',
    details: {
      useCase: 'Calibración de asistentes virtuales en plataformas como ManyChat, Landbot o scripts personalizados.',
      promptText: `Eres el Asistente Comercial de Qaway Lab, especializado en atención y pre-calificación de prospectos. Tu tono de comunicación debe ser profesional, cercano, empático y orientado a la eficiencia.

[REGLAS DE CONDUCTA]
1. Saluda cordialmente y agradece el contacto.
2. Haz preguntas cortas para entender si son una PyME buscando digitalizar sus procesos.
3. Si el cliente pregunta sobre precios de servicios personalizados, indica de forma educada que primero requerimos una breve consultoría de diagnóstico sin costo.
4. NUNCA inventes información. Si no conoces una respuesta, ofrece coordinar una llamada con un especialista de operaciones.
5. Mantén tus respuestas en un máximo de 3 párrafos de 2 líneas cada uno para facilitar la lectura en WhatsApp.`,
      features: [
        'Reglas estrictas para evitar alucinaciones del modelo.',
        'Estructura de tono de voz corporativo profesional.',
        'Respuestas optimizadas para lectura fluida en dispositivos móviles.'
      ]
    }
  },
  'checklist-campana-ads': {
    title: 'Checklist: Configuración de Campaña Meta Ads',
    category: 'checklists',
    categoryLabel: 'Checklists',
    type: 'PDF / Checklist',
    badge: 'Gratis',
    description: 'Lista de verificación obligatoria antes de encender tus anuncios en Meta. Evita errores fatales de píxel, presupuestos y segmentaciones.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    details: {
      useCase: 'Auditoría interna previa al lanzamiento de pauta en Facebook / Instagram Ads.',
      checklistItems: [
        { id: 'ads-1', text: 'Píxel de Meta instalado y recibiendo eventos activos en el Administrador de Eventos.' },
        { id: 'ads-2', text: 'Dominio de la landing page verificado en la Configuración del Negocio.' },
        { id: 'ads-3', text: 'Eventos de conversión prioritarios configurados bajo la Medición Agregada de Eventos.' },
        { id: 'ads-4', text: 'Presupuesto a nivel de campaña (CBO) o conjunto de anuncios (ABO) configurado correctamente.' },
        { id: 'ads-5', text: 'Públicos personalizados y similares (Lookalike) cargados y públicos de retargeting superpuestos excluidos.' },
        { id: 'ads-6', text: 'Creativos validados en formatos correctos (1:1 feed, 9:16 stories/reels).' },
        { id: 'ads-7', text: 'Parámetros URL y UTMs de seguimiento integrados en cada anuncio para tracking en GA4.' }
      ]
    }
  },
  'checklist-auditoria-seguridad': {
    title: 'Checklist: Seguridad en Sitios Web y APIs',
    category: 'checklists',
    categoryLabel: 'Checklists',
    type: 'PDF / Checklist',
    badge: 'Gratis',
    description: 'Puntos clave para proteger tu hosting, base de datos de Supabase y tokens de Web3Forms de accesos maliciosos.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
    details: {
      useCase: 'Blindaje de infraestructura web y bases de datos cloud.',
      checklistItems: [
        { id: 'sec-1', text: 'Políticas de Seguridad a Nivel de Fila (RLS) habilitadas en todas las tablas de Supabase.' },
        { id: 'sec-2', text: 'Clave de API "service_role" de Supabase oculta por completo (nunca expuesta en código de cliente).' },
        { id: 'sec-3', text: 'Restricciones de origen (CORS) habilitadas y limitadas solo a tus dominios de producción.' },
        { id: 'sec-4', text: 'Verificación en dos pasos (2FA) activa en cuentas de hosting, GitHub, Supabase y registradores de dominio.' },
        { id: 'sec-5', text: 'Certificado SSL forzado para redirecciones automáticas de HTTP a HTTPS.' },
        { id: 'sec-6', text: 'Tokens de Web3Forms restringidos para evitar envíos de spam mediante captchas configurados.' }
      ]
    }
  },
  'script-whatsapp-notion': {
    title: 'Script Node.js: WhatsApp a Notion CRM',
    category: 'scripts',
    categoryLabel: 'Scripts',
    type: 'Código JavaScript',
    badge: 'Premium',
    description: 'Código de servidor Node.js listo para recibir webhooks de la API en la nube de WhatsApp y volcar leads entrantes en Notion.',
    image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800',
    details: {
      useCase: 'Sincronización automática de contactos y conversaciones directas de WhatsApp a un tablero de Notion CRM.',
      scriptCode: `const express = require('express');
const { Client } = require('@notionhq/client');
const app = express();
app.use(express.json());

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Verificación del webhook de Meta (WhatsApp Cloud API)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === process.env.VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Recepción de mensajes y registro en Notion
app.post('/webhook', async (req, res) => {
  try {
    const changes = req.body.entry?.[0]?.changes?.[0]?.value;
    const contact = changes?.contacts?.[0];
    const message = changes?.messages?.[0];

    if (contact && message) {
      const phone = contact.wa_id;
      const name = contact.profile.name;
      const text = message.text?.body || '[Multimedia/Otro]';

      // Crear página en la Base de Datos del CRM de Notion
      await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
          Nombre: { title: [{ text: { content: name } }] },
          WhatsApp: { phone_number: phone },
          Mensaje: { rich_text: [{ text: { content: text } }] },
          Estado: { select: { name: 'Nuevo Lead' } },
          Fecha: { date: { start: new Date().toISOString() } }
        }
      });
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('Error registrando lead en Notion:', error);
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Webhook de WhatsApp comercial activo.'));`,
      features: [
        'Webhook Express estándar listo para producción.',
        'Uso del SDK oficial de Notion `@notionhq/client`.',
        'Validación del token de verificación de Meta incorporada.'
      ]
    }
  },
  'script-sheets-backup': {
    title: 'Google Apps Script: Backup Diario Automático',
    category: 'scripts',
    categoryLabel: 'Scripts',
    type: 'Apps Script',
    badge: 'Gratis',
    description: 'Código de automatización en Google Apps Script para respaldar tus hojas de cálculo críticas en Google Drive automáticamente en formato CSV.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    details: {
      useCase: 'Respaldos automáticos históricos de reportes de ventas, bases de leads u hojas de control operativas.',
      scriptCode: `function backupActiveSheetToCSV() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getActiveSheet();
  const sheetName = sheet.getName();
  
  // Generar datos en formato CSV
  const range = sheet.getDataRange();
  const values = range.getValues();
  let csvContent = "";
  
  for (let i = 0; i < values.length; i++) {
    const row = values[i].map(val => {
      // Limpiar texto para evitar romper columnas CSV
      let strVal = val.toString().replace(/"/g, '""');
      if (strVal.search(/("|,|\\n)/g) >= 0) {
        strVal = '"' + strVal + '"';
      }
      return strVal;
    });
    csvContent += row.join(",") + "\\r\\n";
  }
  
  // Crear archivo en Google Drive en carpeta específica
  const folderName = "Respaldos Automáticos Hojas de Control";
  let folder;
  const folders = DriveApp.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(folderName);
  }
  
  const formattedDate = Utilities.formatDate(new Date(), "GMT-5", "yyyy-MM-dd_HH-mm");
  const fileName = sheetName + "_Backup_" + formattedDate + ".csv";
  
  // Crear y guardar el respaldo CSV
  folder.createFile(fileName, csvContent, MimeType.PLAIN_TEXT);
  Logger.log("Respaldo exitoso creado en Drive: " + fileName);
}`,
      features: [
        'Código nativo compatible con Google Apps Script.',
        'Exportación rápida y sanitizada a estándar CSV.',
        'Creación automática de carpetas en Google Drive si no existen.'
      ]
    }
  }
}

export default function RecursoVisorPage() {
  const { resourceType, id } = useParams()
  const navigate = useNavigate()
  const resource = SIMULATED_RESOURCES[id]
  const resourceMatchesRoute = resource && resource.category === resourceType

  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  // Interactive Calculator State (ROI Sheets template simulator)
  const [calcData, setCalcData] = useState({
    budget: 1200,
    clicks: 15000,
    leads: 620,
    sales: 18,
    ticket: 149
  })

  // Real-time calculated properties
  const ctr = calcData.clicks > 0 ? ((calcData.clicks / 150000) * 100).toFixed(2) : 0 // Assuming 150k impressions
  const cpl = calcData.leads > 0 ? (calcData.budget / calcData.leads).toFixed(2) : 0
  const cpa = calcData.sales > 0 ? (calcData.budget / calcData.sales).toFixed(2) : 0
  const revenue = calcData.sales * calcData.ticket
  const roi = calcData.budget > 0 ? (((revenue - calcData.budget) / calcData.budget) * 100).toFixed(0) : 0

  // Interactive Prompt Generator Simulator State
  const [promptValues, setPromptValues] = useState({
    name: 'SaaS de Finanzas Automatizadas',
    desc: 'Software en la nube para consolidar cuentas y facturas de PyMEs usando IA.',
    target: 'Dueños de pequeños negocios y directores financieros estresados.',
    pain: 'Pérdida de 5 horas a la semana conciliando transacciones y excel manuales.'
  })
  const [generatedPromptText, setGeneratedPromptText] = useState('')
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)

  // Interactive Chatbot Assistant Simulator State
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: '¡Hola! Soy el Agente IA de Qaway Lab calibrado con este system prompt. ¿En qué te puedo ayudar hoy?' }
  ])
  const [isTyping, setIsTyping] = useState(false)

  // Interactive Checklist Checkboxes State
  const [checkedItems, setCheckedItems] = useState({})

  // Notion Template Simulator State
  const [activeNotionTab, setActiveNotionTab] = useState('estructura')
  const [notionCheckedItems, setNotionCheckedItems] = useState({
    'notion-sop-1': true,
    'notion-sop-2': false,
    'notion-sop-3': false,
  })
  
  // Reset states on ID change
  useEffect(() => {
    setCopied(false)
    setCopiedCode(false)
    setChatMessages([
      { role: 'assistant', text: '¡Hola! Soy el Agente IA de Qaway Lab calibrado con este system prompt. ¿En qué te puedo ayudar hoy?' }
    ])
    setChatInput('')
    setCheckedItems({})
    setActiveNotionTab('estructura')
    setNotionCheckedItems({
      'notion-sop-1': true,
      'notion-sop-2': false,
      'notion-sop-3': false,
    })
    
    // Set initial prompt text
    if (resource && resource.details && resource.details.promptText) {
      let initialText = resource.details.promptText
        .replace('{PRODUCT_NAME}', promptValues.name)
        .replace('{PRODUCT_DESC}', promptValues.desc)
        .replace('{TARGET_AUDIENCE}', promptValues.target)
        .replace('{MAIN_PAIN}', promptValues.pain)
      setGeneratedPromptText(initialText)
    }
  }, [id])

  if (!resource || !resourceMatchesRoute) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-black mb-4">Recurso no encontrado</h2>
        <p className="text-zinc-500 text-sm mb-6">El recurso simulado solicitado no existe o fue movido.</p>
        <Link to="/recursos" className="bg-black text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider">
          Volver a Recursos
        </Link>
      </div>
    )
  }

  // Handle copying prompt
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPromptText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle copying script code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(resource.details.scriptCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Generate customized prompt
  const handleGeneratePrompt = (e) => {
    e.preventDefault()
    setIsGeneratingPrompt(true)
    
    setTimeout(() => {
      let text = resource.details.promptText
        .replace('{PRODUCT_NAME}', promptValues.name)
        .replace('{PRODUCT_DESC}', promptValues.desc)
        .replace('{TARGET_AUDIENCE}', promptValues.target)
        .replace('{MAIN_PAIN}', promptValues.pain)
      
      setGeneratedPromptText(text)
      setIsGeneratingPrompt(false)
    }, 1200)
  }

  // Handle chat submission
  const handleChatSubmit = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userText = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', text: userText }])
    setChatInput('')
    setIsTyping(true)

    // Simulate Agent Responses based on prompt rules
    setTimeout(() => {
      let reply = ''
      const lowercaseText = userText.toLowerCase()
      if (lowercaseText.includes('precio') || lowercaseText.includes('cuanto cuesta') || lowercaseText.includes('costo')) {
        reply = 'Con gusto te comento. Para poder cotizar una solución personalizada y adaptada a la escala de tu PyME, primero requerimos realizar una breve consultoría de diagnóstico sin costo. ¿Te gustaría agendar una llamada breve de 15 minutos?'
      } else if (lowercaseText.includes('hola') || lowercaseText.includes('buenos dias') || lowercaseText.includes('buenas tardes')) {
        reply = '¡Hola! Es un gusto saludarte. Cuéntame, ¿qué tipo de procesos u operaciones operativas estás buscando optimizar o automatizar en tu negocio actualmente?'
      } else if (lowercaseText.includes('automatiz') || lowercaseText.includes('make') || lowercaseText.includes('n8n') || lowercaseText.includes('notion')) {
        reply = 'Excelente. En Qaway Lab trabajamos integrando Notion con automatizaciones en Make/n8n para sincronizar tu flujo comercial y ahorrarte horas operativas. ¿Quieres que coordinemos una videollamada para diagnosticar tu caso gratis?'
      } else {
        reply = 'Entiendo perfectamente tu consulta. Para darte la solución más exacta y eficiente bajo los criterios operativos de Qaway Lab, lo ideal sería coordinar una llamada de diagnóstico gratuita. ¿Te parece bien?'
      }

      setChatMessages(prev => [...prev, { role: 'assistant', text: reply }])
      setIsTyping(false)
    }, 1500)
  }

  // Handle checklist checkbox toggle
  const handleCheckToggle = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  // Calculate checklist progress
  const listItems = resource.details.checklistItems || []
  const checkedCount = Object.values(checkedItems).filter(Boolean).length
  const progressPercent = listItems.length > 0 ? Math.round((checkedCount / listItems.length) * 100) : 0

  return (
    <>
      {/* Hero Header */}
      <section className="relative pt-[120px] pb-16 bg-black border-b border-white/5 overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,210,0,0.05),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="grow">
            <Link 
              to="/recursos" 
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-qaway-accent text-xs font-bold uppercase tracking-wider mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver al Hub de Recursos
            </Link>
            <div className="flex items-center gap-3.5 mb-3">
              <span className="bg-white/10 text-zinc-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/5">
                {resource.categoryLabel}
              </span>
              <span className="bg-qaway-accent text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                {resource.badge}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
              {resource.title}
            </h1>
            <p className="text-zinc-400 text-sm font-light max-w-3xl leading-relaxed">
              {resource.description}
            </p>
          </div>
          <div className="shrink-0 flex gap-3 w-full md:w-auto">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="grow md:flex-initial inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-qaway-accent px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Obtener Recurso Real
            </a>
          </div>
        </div>
      </section>

      {/* Main Split Layout */}
      <section className="py-12 bg-white text-zinc-950 min-h-[600px]">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT COLUMN: Simulated Interactive Preview/Tool */}
          <div className="lg:col-span-8 bg-zinc-50 border border-zinc-200 rounded-[24px] p-6 md:p-8 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
                  IA
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Simulador de Recurso en Vivo</h3>
                  <p className="text-[10px] text-zinc-500">Prueba el comportamiento de la plantilla/herramienta antes de descargarla</p>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" /> Interactivo
              </span>
            </div>

            {/* CASE 1: ROI Sheets Template Simulator */}
            {id === 'sheets-calculadora-leads' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Presupuesto ($)</label>
                    <input 
                      type="number"
                      className="bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:border-black"
                      value={calcData.budget}
                      onChange={(e) => setCalcData({ ...calcData, budget: Math.max(0, parseFloat(e.target.value) || 0) })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Clicks Ads</label>
                    <input 
                      type="number"
                      className="bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:border-black"
                      value={calcData.clicks}
                      onChange={(e) => setCalcData({ ...calcData, clicks: Math.max(0, parseInt(e.target.value) || 0) })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Leads Registrados</label>
                    <input 
                      type="number"
                      className="bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:border-black"
                      value={calcData.leads}
                      onChange={(e) => setCalcData({ ...calcData, leads: Math.max(0, parseInt(e.target.value) || 0) })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Ventas Cerradas</label>
                    <input 
                      type="number"
                      className="bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:border-black"
                      value={calcData.sales}
                      onChange={(e) => setCalcData({ ...calcData, sales: Math.max(0, parseInt(e.target.value) || 0) })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Ticket Promedio ($)</label>
                    <input 
                      type="number"
                      className="bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:border-black"
                      value={calcData.ticket}
                      onChange={(e) => setCalcData({ ...calcData, ticket: Math.max(0, parseFloat(e.target.value) || 0) })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-zinc-200">
                  <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Costo por Lead (CPL)</span>
                    <span className="text-xl font-black text-zinc-900">${cpl}</span>
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Costo Adquisición (CPA)</span>
                    <span className="text-xl font-black text-zinc-900">${cpa}</span>
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Facturación Total</span>
                    <span className="text-xl font-black text-zinc-900 text-emerald-600">${revenue}</span>
                  </div>
                  <div className="bg-black rounded-xl p-4 text-center text-white">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Retorno (ROI)</span>
                    <span className={`text-xl font-black ${roi >= 100 ? 'text-qaway-accent' : 'text-rose-400'}`}>{roi}%</span>
                  </div>
                </div>

                <div className="bg-zinc-100 rounded-xl p-4 text-xs text-zinc-600 leading-relaxed border border-zinc-200">
                  <strong>💡 Análisis Operativo Qaway Lab:</strong> Con un CPL de <strong>${cpl}</strong> y un CPA de <strong>${cpa}</strong>, estás obteniendo un retorno sobre inversión publicitaria del <strong>{roi}%</strong>. Modifica los parámetros de arriba en tiempo real para proyectar tu embudo comercial de leads.
                </div>
              </div>
            )}

            {/* CASE 2: SOPs Notion Workspace Preview */}
            {id === 'notion-manual-sops' && (
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-lg flex flex-col min-h-[480px]">
                
                {/* Notion-style Top Bar */}
                <div className="bg-[#f7f7f5] border-b border-zinc-200 px-4 py-2 flex items-center justify-between text-xs text-zinc-500 font-sans select-none">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-medium text-zinc-800">
                      <span>📘</span> Qaway Lab / Workspace / Manual de SOPs
                    </span>
                    <span className="text-zinc-300">|</span>
                    <span className="bg-zinc-200 px-1.5 py-0.5 rounded text-[10px] text-zinc-600 font-medium">Solo lectura</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="hover:bg-zinc-200 px-2 py-1 rounded transition-colors">Compartir</button>
                    <button className="hover:bg-zinc-200 px-2 py-1 rounded transition-colors flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-qaway-accent-dark" /> Plantilla Notion
                    </button>
                  </div>
                </div>

                {/* Cover & Header */}
                <div className="relative h-28 bg-linear-to-r from-zinc-800 via-zinc-900 to-zinc-950 overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,rgba(255,210,0,0.15),transparent_50%)]" />
                  <div className="absolute bottom-2 right-4 text-[10px] text-zinc-500 font-mono">v1.2.4 • Estandarizado</div>
                </div>

                <div className="px-6 md:px-8 -mt-6 pb-6 relative z-10 text-left">
                  {/* Notion Page Icon */}
                  <div className="w-12 h-12 bg-white rounded-xl shadow-md border border-zinc-200 flex items-center justify-center text-2xl select-none mb-3">
                    📘
                  </div>
                  
                  <h3 className="text-2xl font-black text-zinc-950 mb-1">
                    Sistemas Digitales: Manual de SOPs & Accesos
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed mb-4">
                    Estructura integral para estandarizar operaciones, registrar flujos y gestionar accesos corporativos. Utiliza el selector de pestañas interactivo de abajo para ver cada sección del manual en acción.
                  </p>

                  {/* Notion-style Page Tabs */}
                  <div className="flex items-center gap-1 border-b border-zinc-200 mb-6 overflow-x-auto scrollbar-none pb-px">
                    <button
                      onClick={() => setActiveNotionTab('estructura')}
                      className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                        activeNotionTab === 'estructura'
                          ? 'border-black text-black font-bold'
                          : 'border-transparent text-zinc-400 hover:text-zinc-700 hover:border-zinc-200'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4" />
                      1. Panel Estructura
                    </button>
                    <button
                      onClick={() => setActiveNotionTab('sop')}
                      className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                        activeNotionTab === 'sop'
                          ? 'border-black text-black font-bold'
                          : 'border-transparent text-zinc-400 hover:text-zinc-700 hover:border-zinc-200'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      2. Plantilla de SOP
                    </button>
                    <button
                      onClick={() => setActiveNotionTab('automatizacion')}
                      className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                        activeNotionTab === 'automatizacion'
                          ? 'border-black text-black font-bold'
                          : 'border-transparent text-zinc-400 hover:text-zinc-700 hover:border-zinc-200'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      3. Bitácora de Automatización
                    </button>
                    <button
                      onClick={() => setActiveNotionTab('accesos')}
                      className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                        activeNotionTab === 'accesos'
                          ? 'border-black text-black font-bold'
                          : 'border-transparent text-zinc-400 hover:text-zinc-700 hover:border-zinc-200'
                      }`}
                    >
                      <Key className="w-4 h-4" />
                      4. Caja de Credenciales
                    </button>
                  </div>

                  {/* Notion Simulator Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeNotionTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="min-h-[280px]"
                    >
                      {/* TAB 1: Estructura General */}
                      {activeNotionTab === 'estructura' && (
                        <div className="grid md:grid-cols-12 gap-6 items-stretch">
                          {/* Sidebar Navigation simulation */}
                          <div className="md:col-span-4 bg-[#fcfcfb] border border-zinc-200 rounded-xl p-4 flex flex-col gap-2.5 text-xs text-zinc-650">
                            <span className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest pb-1.5 border-b border-zinc-250 flex items-center justify-between">
                              <span>📁 Workspace</span>
                              <Settings className="w-3.5 h-3.5" />
                            </span>
                            <div className="flex items-center gap-2 p-1.5 bg-zinc-200/50 rounded-lg text-zinc-950 font-bold border border-zinc-300/30">
                              <span>📂</span> 00-Manual de SOPs
                            </div>
                            <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer pl-6">
                              <span>📁</span> MKT & Ventas
                            </div>
                            <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer pl-6">
                              <span>📁</span> Operaciones & QA
                            </div>
                            <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer pl-6">
                              <span>📁</span> Finanzas & Legal
                            </div>
                            <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer pl-6">
                              <span>⚙️</span> Configuración
                            </div>
                          </div>

                          {/* Workspace Main view */}
                          <div className="md:col-span-8 flex flex-col justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-zinc-900 mb-2.5">Jerarquía de Carpetas Operativas</h4>
                              <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                                El manual organiza los procesos de tu negocio en 3 grandes capas: Dirección, Operaciones de soporte y Ejecución técnica, evitando la dispersión de información.
                              </p>
                              
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="p-1 rounded bg-orange-100 text-orange-750 text-xs">📈</span>
                                    <span className="font-bold text-[11px] text-zinc-900">MKT & Ventas</span>
                                  </div>
                                  <span className="text-[10px] text-zinc-500">3 SOPs • Conversión & Leads</span>
                                </div>
                                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="p-1 rounded bg-blue-100 text-blue-750 text-xs">🚀</span>
                                    <span className="font-bold text-[11px] text-zinc-900">Operaciones</span>
                                  </div>
                                  <span className="text-[10px] text-zinc-500">5 SOPs • Calidad & QA</span>
                                </div>
                                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="p-1 rounded bg-emerald-100 text-emerald-750 text-xs">💰</span>
                                    <span className="font-bold text-[11px] text-zinc-900">Finanzas & Legal</span>
                                  </div>
                                  <span className="text-[10px] text-zinc-500">2 SOPs • Control del ROI</span>
                                </div>
                                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="p-1 rounded bg-purple-100 text-purple-750 text-xs">🤖</span>
                                    <span className="font-bold text-[11px] text-zinc-900">Sistemas e IA</span>
                                  </div>
                                  <span className="text-[10px] text-zinc-500">4 SOPs • Make & Webhooks</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-[11px] bg-zinc-50 border border-zinc-200 p-2.5 rounded-lg text-zinc-500 mt-2">
                              <Info className="w-4 h-4 text-zinc-400 shrink-0" />
                              <span>Haz clic en la pestaña <strong>2. Plantilla de SOP</strong> para ver la estructura de un proceso documentado.</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: Plantilla de SOP */}
                      {activeNotionTab === 'sop' && (
                        <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
                          {/* Simulated document header */}
                          <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-4 text-left">
                            <div className="flex items-center gap-2 text-zinc-400 text-[9px] uppercase font-bold tracking-wider mb-1">
                              Procesos / Marketing
                            </div>
                            <h4 className="text-base font-bold text-zinc-950">
                              SOP-MKT-002: Lanzamiento de Campaña en Meta Ads
                            </h4>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-[10px]">
                              <div>
                                <span className="block text-zinc-400 font-bold uppercase mb-0.5">Responsable</span>
                                <span className="font-bold text-zinc-700 flex items-center gap-1">
                                  <span className="w-4 h-4 rounded-full bg-zinc-800 text-[8px] text-white flex items-center justify-center font-bold">MB</span> Media Buyer
                                </span>
                              </div>
                              <div>
                                <span className="block text-zinc-400 font-bold uppercase mb-0.5">Estado</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">✅ Estandarizado</span>
                              </div>
                              <div>
                                <span className="block text-zinc-400 font-bold uppercase mb-0.5">Herramienta</span>
                                <span className="font-semibold text-zinc-700">Meta Ads Manager</span>
                              </div>
                              <div>
                                <span className="block text-zinc-400 font-bold uppercase mb-0.5">Frecuencia</span>
                                <span className="font-semibold text-zinc-700">Mensual</span>
                              </div>
                            </div>
                          </div>

                          {/* Checklist Interactivo en el SOP */}
                          <div className="p-5 text-left space-y-4">
                            <div>
                              <h5 className="text-xs font-black uppercase text-zinc-400 tracking-wider mb-2">Pasos del Flujo de Trabajo (Interactivo)</h5>
                              <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
                                Marca los pasos según el flujo real del operador para evitar olvidos críticos en configuración técnica:
                              </p>
                              
                              <div className="space-y-2.5">
                                {[
                                  { id: 'notion-sop-1', text: 'Instalación y validación del pixel de Meta mediante la herramienta Pixel Helper.' },
                                  { id: 'notion-sop-2', text: 'Configuración del CBO y exclusión de listas de leads ya convertidos.' },
                                  { id: 'notion-sop-3', text: 'Verificación de URLs mediante UTM Builder de Google Analytics.' }
                                ].map((item) => {
                                  const isChecked = !!notionCheckedItems[item.id]
                                  return (
                                    <div 
                                      key={item.id} 
                                      onClick={() => setNotionCheckedItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                                        isChecked 
                                          ? 'bg-zinc-50 border-zinc-200 text-zinc-400 line-through' 
                                          : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300'
                                      }`}
                                    >
                                      <div className={`w-3.5 h-3.5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                                        isChecked ? 'bg-black border-black text-white' : 'bg-white border-zinc-300'
                                      }`}>
                                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                      </div>
                                      <span className="text-xs font-medium leading-tight">{item.text}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>

                            <div className="border-t border-zinc-100 pt-3">
                              <h5 className="text-xs font-black uppercase text-zinc-400 tracking-wider mb-1.5">Métricas Clave (KPIs)</h5>
                              <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 text-[11px] text-zinc-650 flex justify-between">
                                <span>Costo Por Lead Proyectado (CPL)</span>
                                <span className="font-bold text-zinc-900">Menos de $2.50 USD</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 3: Bitácora de Automatización */}
                      {activeNotionTab === 'automatizacion' && (
                        <div className="space-y-4 text-left">
                          <h4 className="text-sm font-bold text-zinc-900">Registro & Documentación de Webhooks e Integraciones</h4>
                          <p className="text-xs text-zinc-600 leading-relaxed">
                            No basta con automatizar; para escalar, tu equipo debe saber qué conecta con qué. Esta base de datos documenta los triggers de Make/Zapier/n8n para mitigar caídas del sistema.
                          </p>

                          {/* Simulated Table database in Notion */}
                          <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white text-xs">
                            <div className="grid grid-cols-12 gap-1 bg-zinc-50 border-b border-zinc-200 p-2.5 font-bold text-zinc-400 text-[10px] uppercase tracking-wider">
                              <div className="col-span-4">Nombre de Automatización</div>
                              <div className="col-span-2">Trigger</div>
                              <div className="col-span-3">Integración</div>
                              <div className="col-span-3 text-right">Estado</div>
                            </div>
                            <div className="divide-y divide-zinc-200">
                              <div className="grid grid-cols-12 gap-1 p-2.5 items-center hover:bg-zinc-50 transition-colors">
                                <div className="col-span-4 font-bold text-zinc-900 flex items-center gap-1.5">
                                  <span>🤖</span> Registro de Leads
                                </div>
                                <div className="col-span-2 text-zinc-505 font-mono text-[10px]">Typeform Webhook</div>
                                <div className="col-span-3 font-semibold text-zinc-600">Typeform ➔ Make ➔ Notion</div>
                                <div className="col-span-3 text-right">
                                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-105 text-emerald-800 text-[9px] font-bold">🟢 Operando</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-12 gap-1 p-2.5 items-center hover:bg-zinc-50 transition-colors">
                                <div className="col-span-4 font-bold text-zinc-900 flex items-center gap-1.5">
                                  <span>💬</span> Alerta Comercial Slack
                                </div>
                                <div className="col-span-2 text-zinc-505 font-mono text-[10px]">CRM Update</div>
                                <div className="col-span-3 font-semibold text-zinc-600">Notion ➔ n8n ➔ Slack</div>
                                <div className="col-span-3 text-right">
                                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-105 text-emerald-800 text-[9px] font-bold">🟢 Operando</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-12 gap-1 p-2.5 items-center hover:bg-zinc-50 transition-colors">
                                <div className="col-span-4 font-bold text-zinc-900 flex items-center gap-1.5">
                                  <span>📧</span> Backup de Ventas diario
                                </div>
                                <div className="col-span-2 text-zinc-505 font-mono text-[10px]">Cron 24h</div>
                                <div className="col-span-3 font-semibold text-zinc-600">Sheets ➔ G-Apps Script</div>
                                <div className="col-span-3 text-right">
                                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-105 text-emerald-800 text-[9px] font-bold">🟢 Operando</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] text-zinc-550 leading-normal flex items-start gap-2">
                            <span className="font-bold text-zinc-800">💡 Tip de Qaway Lab:</span>
                            <span>En la plantilla Notion real, cada fila se expande para mostrar las credenciales de API asociadas y el código JSON necesario para replicar la integración.</span>
                          </div>
                        </div>
                      )}

                      {/* TAB 4: Caja de Credenciales */}
                      {activeNotionTab === 'accesos' && (
                        <div className="space-y-4 text-left">
                          <h4 className="text-sm font-bold text-zinc-900">Caja Fuerte de Credenciales & Roles</h4>
                          <p className="text-xs text-zinc-600 leading-relaxed">
                            Organiza de forma segura qué plataformas usa el negocio, quién es el propietario/administrador y cuál es el enlace directo a la consola de inicio de sesión de cada herramienta.
                          </p>

                          {/* Credentials Table */}
                          <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white text-xs">
                            <div className="grid grid-cols-12 gap-1 bg-zinc-50 border-b border-zinc-200 p-2.5 font-bold text-zinc-400 text-[10px] uppercase tracking-wider">
                              <div className="col-span-3">Herramienta</div>
                              <div className="col-span-3">Nivel de Acceso</div>
                              <div className="col-span-3">Responsable</div>
                              <div className="col-span-3 text-right">Seguridad</div>
                            </div>
                            <div className="divide-y divide-zinc-200">
                              <div className="grid grid-cols-12 gap-1 p-2.5 items-center hover:bg-zinc-50 transition-colors">
                                <div className="col-span-3 font-bold text-zinc-900 flex items-center gap-1.5">
                                  🔑 Meta Business
                                </div>
                                <div className="col-span-3 text-zinc-650">Admin Completo</div>
                                <div className="col-span-3 text-zinc-550">CMO / Director</div>
                                <div className="col-span-3 text-right">
                                  <span className="inline-block px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[9px] font-bold border border-amber-200">MFA Requerido</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-12 gap-1 p-2.5 items-center hover:bg-zinc-50 transition-colors">
                                <div className="col-span-3 font-bold text-zinc-900 flex items-center gap-1.5">
                                  🔑 Stripe Billing
                                </div>
                                <div className="col-span-3 text-zinc-650">Lectura/Facturas</div>
                                <div className="col-span-3 text-zinc-550">Contador / CEO</div>
                                <div className="col-span-3 text-right">
                                  <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9px] font-bold border border-emerald-200">Seguro (SSO)</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-12 gap-1 p-2.5 items-center hover:bg-zinc-50 transition-colors">
                                <div className="col-span-3 font-bold text-zinc-900 flex items-center gap-1.5">
                                  🔑 Supabase Cloud
                                </div>
                                <div className="col-span-3 text-zinc-650">Developer (Sistemas)</div>
                                <div className="col-span-3 text-zinc-550">CTO</div>
                                <div className="col-span-3 text-right">
                                  <span className="inline-block px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[9px] font-bold border border-amber-200">MFA Requerido</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] text-zinc-550 leading-normal flex items-start gap-2">
                            <span className="font-bold text-zinc-800">🔒 Seguridad y Privacidad:</span>
                            <span>Esta tabla simula cómo centralizar los accesos en Notion. En el archivo real, recomendamos enlazar contraseñas seguras almacenadas en gestores encriptados como 1Password o Bitwarden.</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* CASE 3: Copy Generator Prompt Simulator */}
            {id === 'prompt-generador-copys' && (
              <div className="space-y-6">
                <form onSubmit={handleGeneratePrompt} className="grid md:grid-cols-2 gap-4 bg-zinc-100 p-4 rounded-xl border border-zinc-200">
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Nombre del Producto / Servicio</label>
                    <input 
                      type="text" 
                      className="bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-medium text-zinc-800 outline-none focus:border-black"
                      value={promptValues.name}
                      onChange={(e) => setPromptValues({ ...promptValues, name: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Público Objetivo (Buyer Persona)</label>
                    <input 
                      type="text" 
                      className="bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-medium text-zinc-800 outline-none focus:border-black"
                      value={promptValues.target}
                      onChange={(e) => setPromptValues({ ...promptValues, target: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-left md:col-span-2">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Descripción Breve</label>
                    <input 
                      type="text" 
                      className="bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-medium text-zinc-800 outline-none focus:border-black"
                      value={promptValues.desc}
                      onChange={(e) => setPromptValues({ ...promptValues, desc: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-left md:col-span-2">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Punto de Dolor Principal</label>
                    <input 
                      type="text" 
                      className="bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-medium text-zinc-800 outline-none focus:border-black"
                      value={promptValues.pain}
                      onChange={(e) => setPromptValues({ ...promptValues, pain: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 text-right">
                    <button 
                      type="submit"
                      disabled={isGeneratingPrompt}
                      className="bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 ml-auto transition-colors"
                    >
                      {isGeneratingPrompt ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Calibrando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" /> Calibrar Prompt
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="relative">
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button 
                      onClick={handleCopyPrompt}
                      className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-700 p-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> ¡Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copiar Prompt
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-[#0b0b0c] text-zinc-300 font-mono text-[11px] p-6 pt-14 rounded-xl overflow-x-auto text-left leading-relaxed max-h-[300px] border border-white/5 whitespace-pre-wrap">
                    {generatedPromptText}
                  </pre>
                </div>
              </div>
            )}

            {/* CASE 4: WhatsApp AI Agent Chatbot Simulator */}
            {id === 'prompt-calibracion-soporte' && (
              <div className="space-y-6">
                {/* Chat Panel */}
                <div className="bg-[#07070a] border border-white/5 rounded-2xl p-4 flex flex-col justify-between min-h-[360px] text-white">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-zinc-400">Prueba Chat de Agente IA</span>
                  </div>

                  <div className="grow flex flex-col gap-3.5 overflow-y-auto max-h-[220px] mb-4 text-xs pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                    {chatMessages.map((msg, i) => (
                      <div 
                        key={i} 
                        className={`flex flex-col max-w-[80%] rounded-xl p-3 leading-relaxed ${
                          msg.role === 'assistant' 
                            ? 'bg-[#12121e] border border-white/5 text-zinc-300 align-self-start mr-auto text-left' 
                            : 'bg-qaway-accent text-black font-semibold align-self-end ml-auto text-left'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="bg-[#12121e] border border-white/5 text-zinc-500 rounded-xl p-3 text-left max-w-[120px] italic flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3 animate-spin text-zinc-400" /> Agente escribe...
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleChatSubmit} className="flex gap-2 border-t border-white/5 pt-3">
                    <input 
                      type="text" 
                      placeholder="Escribe: '¿Tienen soporte técnico?' o '¿Cuánto cuestan sus servicios?'"
                      className="grow bg-[#111116] border border-white/5 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-qaway-accent"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={isTyping}
                    />
                    <button 
                      type="submit"
                      disabled={isTyping || !chatInput.trim()}
                      className="bg-qaway-accent hover:bg-qaway-accent-dark text-black px-4 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                <div className="relative">
                  <div className="absolute top-3 right-3">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(resource.details.promptText)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-700 p-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> ¡Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copiar System Prompt
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-[#0b0b0c] text-zinc-400 font-mono text-[10px] p-6 pt-14 rounded-xl overflow-x-auto text-left leading-relaxed max-h-[160px] border border-white/5 whitespace-pre-wrap">
                    {resource.details.promptText}
                  </pre>
                </div>
              </div>
            )}

            {/* CASES 5 & 6: Interactive Checklists */}
            {(id === 'checklist-campana-ads' || id === 'checklist-auditoria-seguridad') && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 bg-zinc-100 p-4 rounded-xl border border-zinc-200">
                  <div className="grow">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      <span>Progreso de Auditoría</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                      <div className="h-full bg-black transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {progressPercent === 100 ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-4.5 h-4.5" /> ¡Completado!
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-semibold">{checkedCount} de {listItems.length} completados</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  {listItems.map(item => {
                    const isChecked = !!checkedItems[item.id]
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => handleCheckToggle(item.id)}
                        className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
                          isChecked 
                            ? 'bg-zinc-100 border-zinc-300 text-zinc-500 line-through' 
                            : 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked ? 'bg-black border-black text-white' : 'bg-white border-zinc-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs leading-relaxed font-medium">{item.text}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* CASES 7 & 8: Copyable Code Scripts */}
            {(id === 'script-whatsapp-notion' || id === 'script-sheets-backup') && (
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute top-3 right-3">
                    <button 
                      onClick={handleCopyCode}
                      className="bg-zinc-850 hover:bg-zinc-800 text-zinc-300 p-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 border border-white/10"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> ¡Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copiar Código
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-[#0b0b0c] text-zinc-300 font-mono text-[11px] p-6 pt-14 rounded-xl overflow-x-auto text-left leading-relaxed max-h-[380px] border border-white/5">
                    <code>{resource.details.scriptCode}</code>
                  </pre>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Instructions, features, and setup documentation */}
          <div className="lg:col-span-4 flex flex-col gap-6 text-left">
            <div>
              <span className="text-zinc-400 text-[9px] font-bold uppercase tracking-widest block mb-1">
                Ficha Técnica
              </span>
              <h3 className="text-lg font-black text-zinc-900 mb-2 leading-tight">
                Detalles del Recurso
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-normal mb-4">
                Diseñado por consultores de <span className="font-semibold text-zinc-950">Qaway Lab</span> bajo criterios operativos reales para automatización de negocios.
              </p>

              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs text-zinc-700 space-y-3">
                <div>
                  <span className="block text-[8px] font-bold uppercase tracking-wider text-zinc-400">Caso de Uso</span>
                  <span className="font-semibold">{resource.details.useCase}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold uppercase tracking-wider text-zinc-400">Tipo de Archivo</span>
                  <span className="font-mono font-bold text-[10px]">{resource.type}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-200 pt-6">
              <h4 className="text-xs font-black uppercase text-zinc-900 tracking-wider mb-3">
                ¿Qué incluye la descarga?
              </h4>
              <ul className="space-y-2.5">
                {resource.details.features ? (
                  resource.details.features.map((feat, i) => (
                    <li key={i} className="text-xs text-zinc-600 flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="text-xs text-zinc-600 flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <span>Simulador en vivo 100% interactivo.</span>
                    </li>
                    <li className="text-xs text-zinc-600 flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <span>Guía paso a paso de implementación y configuración en tu entorno local.</span>
                    </li>
                    <li className="text-xs text-zinc-600 flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <span>Archivos editables listos para su uso comercial inmediato.</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="bg-zinc-100 border border-zinc-200 rounded-xl p-4 text-xs text-zinc-600 leading-relaxed">
              <h5 className="font-bold text-zinc-800 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Licencia de Uso
              </h5>
              Este recurso simulado y su código son de libre uso para fines formativos y de desarrollo. Prohibida su reventa.
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
