import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FileText,
  Sparkles,
  Sliders,
  Image,
  MessageSquare,
  CheckCircle2,
  Check,
  ChevronRight,
  Copy,
  Rocket,
  Lock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Upload,
  Settings,
  Key,
  Cpu,
  Layers,
  Globe
} from 'lucide-react'
import { useCampaign } from '../../../services/campaign/campaignContext'
import { AI_PROVIDERS } from '../../../config/aiModels'
import { APP_MODES } from '../../../config/appModes'
import OrganicResearchPanel from '../../../modules/contenido-organico/OrganicResearchPanel'
import OrganicContentGenerator from '../../../modules/contenido-organico/OrganicContentGenerator'
import { organicResearchService } from '../../../services/campaign/organicResearchService'
import { organicContentService } from '../../../services/campaign/organicContentService'


// Módulos Secuenciales de la Consola
const modules = [
  { id: 'brief', label: '01 · Brief Maestro', icon: FileText, desc: 'Entrada y estructuración de la marca' },
  { id: 'diagnostico', label: '02 · Diagnóstico Comercial', icon: AlertCircle, desc: 'Dolores, objeciones y calibración' },
  { id: 'organico', label: '03A · Investigación y Tendencias', icon: Sparkles, desc: 'Investigación y Oportunidades' },
  { id: 'embudo', label: '04 · Embudo Inbound', icon: Sliders, desc: 'Estructura de temperatura' },
  { id: 'copies', label: '05 · Assets & Copies', icon: Image, desc: 'Variantes persuasivas de copies' },
  { id: 'whatsapp', label: '06 · Flujo WhatsApp', icon: MessageSquare, desc: 'Flujo comercial y objeciones' },
  { id: 'checklist', label: '07 · Lanzamiento', icon: CheckCircle2, desc: 'Auditoría y cierre de campaña' },
]

const initialBrief = {
  marca: '',
  productoServicio: '',
  oferta: '',
  precio: '',
  publicoObjetivo: '',
  problemaPrincipal: '',
  deseoPrincipal: '',
  beneficios: [],
  diferenciadores: [],
  canalVenta: '',
  canalConversion: 'WhatsApp Business', // compatible with downstream
  tono: 'Directo y Estratégico',
  nivelConciencia: 'Consciente del Problema',
  objecionesProbables: [],
  restricciones: [],
  resumenEjecutivo: '',
  camposPendientes: []
}

// ========================================================
// COMPONENTE AUXILIAR COMPACTO: SELECCIÓN IA INTEGRADA POR ETAPA
// ========================================================
function IaSelectorCompact({ stage, isBriefMaestro }) {
  const { aiConfig, setAiConfig } = useCampaign()
  const [showSavedToast, setShowSavedToast] = useState(false)
  
  const [isOpen, setIsOpen] = useState(false)
  
  const globalProvider = aiConfig.defaultProvider || 'openai'
  const globalModel = aiConfig.defaultModel || 'gpt-4o-mini'
  
  const customConfig = aiConfig.stageModels?.[stage]
  const hasCustom = !!customConfig
  
  const currentProvider = hasCustom ? customConfig.provider : globalProvider
  const currentModel = hasCustom ? customConfig.model : globalModel
  
  const isKeyConfigured = aiConfig.apiKeys?.[currentProvider] || currentProvider === 'local' || aiConfig.localModelConfig?.enabled
  
  const [localProvider, setLocalProvider] = useState(currentProvider)
  const [localModel, setLocalModel] = useState(currentModel)

  useEffect(() => {
    setLocalProvider(currentProvider)
    setLocalModel(currentModel)
  }, [currentProvider, currentModel])

  if (isBriefMaestro) {
    return (
      <div className="bg-[#f8fafc]/60 border border-zinc-200 rounded-[10px] overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 flex items-center justify-between transition-colors hover:bg-zinc-50/40"
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-zinc-400" />
            <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest text-left">
              Modelo IA de trabajo
            </span>
            <span className="text-[9px] text-zinc-400 font-bold ml-1 hidden sm:inline">
              ({localProvider}:{localModel})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[9px] px-2.5 py-0.5 rounded-[4px] font-bold uppercase tracking-wider border shadow-3xs transition-all ${
              isKeyConfigured ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-250 animate-pulse'
            }`}>
              {isKeyConfigured ? 'Conexión Activa' : 'Falta API Key'}
            </span>
            {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="px-4 pb-4 space-y-3.5 border-t border-zinc-150 bg-white/40 pt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">Proveedor IA</label>
                  <select
                    value={localProvider}
                    onChange={(e) => {
                      const pVal = e.target.value
                      const defaultM = Object.values(AI_PROVIDERS).find(p => p.id === pVal)?.defaultModel || 'gpt-4o-mini'
                      setLocalProvider(pVal)
                      setLocalModel(defaultM)
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-[6px] px-2.5 py-1.5 text-xs text-zinc-750 outline-none font-semibold cursor-pointer shadow-3xs hover:border-zinc-300 transition-colors"
                  >
                    {Object.values(AI_PROVIDERS).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">Modelo IA</label>
                  <select
                    value={localModel}
                    onChange={(e) => setLocalModel(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-[6px] px-2.5 py-1.5 text-xs text-zinc-750 outline-none font-semibold cursor-pointer shadow-3xs hover:border-zinc-300 transition-colors"
                  >
                    {(Object.values(AI_PROVIDERS).find(p => p.id === localProvider) || AI_PROVIDERS.OPENAI).models.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!isKeyConfigured && (
                <div className="bg-amber-50/40 border border-amber-200/60 p-2.5 rounded-[8px] space-y-1">
                  <label className="text-[8px] font-bold text-amber-700 uppercase tracking-wider block mb-0.5">API Key del Proveedor Seleccionado</label>
                  <input
                    type="password"
                    placeholder={`Introduce tu API Key para ${localProvider === 'openai' ? 'OpenAI (sk-...)' : localProvider}`}
                    value={aiConfig.apiKeys?.[localProvider] || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      setAiConfig(prev => ({
                        ...prev,
                        apiKeys: {
                          ...prev.apiKeys,
                          [localProvider]: val
                        }
                      }))
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-[6px] px-2.5 py-1 text-[11px] text-zinc-800 outline-none font-mono shadow-3xs focus:border-zinc-350"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-1 gap-2">
                <div className="grow">
                  <AnimatePresence>
                    {showSavedToast && (
                      <motion.span
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[9px] font-bold text-emerald-650 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-[6px] inline-flex items-center gap-1 shadow-3xs"
                      >
                        <Check className="w-3 h-3 text-emerald-500" />
                        Modelo base guardado
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAiConfig(prev => ({
                      ...prev,
                      defaultProvider: localProvider,
                      defaultModel: localModel,
                      stageModels: {
                        ...prev.stageModels,
                        brief: { provider: localProvider, model: localModel }
                      }
                    }))
                    setShowSavedToast(true)
                    setTimeout(() => setShowSavedToast(false), 2500)
                  }}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white text-[9px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-[6px] transition active:scale-[0.97] shadow-xs"
                >
                  Guardar como modelo base
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="bg-[#f8fafc] border border-zinc-200/80 p-4 rounded-[10px] space-y-3 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-150 pb-2 gap-2">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-zinc-500" />
          <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Modelo IA Heredado</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-[10px] font-medium text-zinc-600 cursor-pointer flex items-center gap-1.5 select-none">
            <input
              type="radio"
              name={`ia-config-${stage}`}
              checked={!hasCustom}
              onChange={() => {
                setAiConfig(prev => {
                  const newStages = { ...prev.stageModels }
                  delete newStages[stage]
                  return {
                    ...prev,
                    stageModels: newStages
                  }
                })
              }}
              className="accent-zinc-900 w-3.5 h-3.5 cursor-pointer shadow-2xs"
            />
            Mantener modelo base heredado ({globalProvider}:{globalModel})
          </label>
          <label className="text-[10px] font-medium text-zinc-600 cursor-pointer flex items-center gap-1.5 select-none">
            <input
              type="radio"
              name={`ia-config-${stage}`}
              checked={hasCustom}
              onChange={() => {
                setAiConfig(prev => ({
                  ...prev,
                  stageModels: {
                    ...prev.stageModels,
                    [stage]: { provider: globalProvider, model: globalModel }
                  }
                }))
              }}
              className="accent-zinc-900 w-3.5 h-3.5 cursor-pointer shadow-2xs"
            />
            Cambiar solo para este módulo
          </label>
        </div>
      </div>

      {hasCustom && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1 overflow-hidden"
        >
          <div className="space-y-1">
            <label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider block mb-0.5">Proveedor IA de Reemplazo</label>
            <select
              value={localProvider}
              onChange={(e) => {
                const pVal = e.target.value
                const defaultM = Object.values(AI_PROVIDERS).find(p => p.id === pVal)?.defaultModel || 'gpt-4o-mini'
                setLocalProvider(pVal)
                setLocalModel(defaultM)
                setAiConfig(prev => ({
                  ...prev,
                  stageModels: {
                    ...prev.stageModels,
                    [stage]: { provider: pVal, model: defaultM }
                  }
                }))
              }}
              className="w-full bg-white border border-zinc-200 rounded-[6px] px-2.5 py-1.5 text-xs text-zinc-700 outline-none font-semibold cursor-pointer shadow-2xs"
            >
              {Object.values(AI_PROVIDERS).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider block mb-0.5">Modelo IA de Reemplazo</label>
            <select
              value={localModel}
              onChange={(e) => {
                const mVal = e.target.value
                setLocalModel(mVal)
                setAiConfig(prev => ({
                  ...prev,
                  stageModels: {
                    ...prev.stageModels,
                    [stage]: { ...prev.stageModels?.[stage], model: mVal }
                  }
                }))
              }}
              className="w-full bg-white border border-zinc-200 rounded-[6px] px-2.5 py-1.5 text-xs text-zinc-750 outline-none font-semibold cursor-pointer shadow-2xs"
            >
              {(Object.values(AI_PROVIDERS).find(p => p.id === localProvider) || AI_PROVIDERS.OPENAI).models.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function WabaCrmConsolePage() {
  const {
    appMode,
    setAppMode,
    appModeDetails,
    aiConfig,
    setAiConfig,
    whiteLabelBranding,
    setWhiteLabelBranding,
    executeIaTask
  } = useCampaign()

  const [activeModule, setActiveModule] = useState('brief')
  const [brief, setBrief] = useState(initialBrief)
  
  // Local state for brief list-editor inputs
  const [newBeneficio, setNewBeneficio] = useState('')
  const [newDiferenciador, setNewDiferenciador] = useState('')
  const [newObjecion, setNewObjecion] = useState('')
  const [newRestriccion, setNewRestriccion] = useState('')

  // NUEVO ESTADO: MÓDULO 02 · DIAGNÓSTICO COMERCIAL
  const [diagnostico, setDiagnostico] = useState({
    problemaCentral: '',
    doloresPrincipales: [],
    deseoProfundo: '',
    objecionesComerciales: [],
    nivelConciencia: '',
    temperaturaCampaña: '',
    oportunidadComunicacion: '',
    riesgoPrincipal: '',
    anguloEstrategico: '',
    enfoqueContenidoOrganico: '',
    mensajesAEvitar: [],
    datosRequierenValidacion: [],
    categoriaMercado: '',
    problemaSocialOperativo: '',
    herramientasTendenciasSugeridas: '',
    oportunidadPosicionamiento: ''
  })

  // Local state for diagnostico list-editor inputs
  const [newDolor, setNewDolor] = useState('')
  const [newObjecionComercial, setNewObjecionComercial] = useState('')
  const [newMensajeEvitar, setNewMensajeEvitar] = useState('')
  const [newValidacionSugerida, setNewValidacionSugerida] = useState('')

  // ========================================================
  // ESTADOS MÓDULO 03: INVESTIGACIÓN Y CONTENIDO ORGÁNICO
  // ========================================================
  const [organicSubTab, setOrganicSubTab] = useState('research') // 'research' o 'generator'
  const [isGeneratingOrganic, setIsGeneratingOrganic] = useState(false)
  const [opportunities, setOpportunities] = useState(() => {
    const saved = localStorage.getItem('qaway_organic_opportunities')
    return saved ? JSON.parse(saved) : []
  })
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(() => {
    return localStorage.getItem('qaway_selected_opportunity_id') || ''
  })
  const [organicApprovedPieces, setOrganicApprovedPieces] = useState(() => {
    const saved = localStorage.getItem('qaway_organic_approved_pieces')
    return saved ? JSON.parse(saved) : []
  })

  // Sincronización en LocalStorage de los estados del Módulo 03
  useEffect(() => {
    localStorage.setItem('qaway_organic_opportunities', JSON.stringify(opportunities))
  }, [opportunities])

  useEffect(() => {
    if (selectedOpportunityId) {
      localStorage.setItem('qaway_selected_opportunity_id', selectedOpportunityId)
    } else {
      localStorage.removeItem('qaway_selected_opportunity_id')
    }
  }, [selectedOpportunityId])

  useEffect(() => {
    localStorage.setItem('qaway_organic_approved_pieces', JSON.stringify(organicApprovedPieces))
  }, [organicApprovedPieces])


  // Control de entrada de Brief (Formulario o Archivo)
  const [briefInputType, setBriefInputType] = useState('form') // 'form' o 'file'
  const [selectedAge, setSelectedAge] = useState('25-40') // '18-25', '25-40', '40-60', 'otro'
  const [customAge, setCustomAge] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)

  // Referencias e indicadores de carga para archivos reales
  const fileInputRef = useRef(null)
  const [fileLoading, setFileLoading] = useState(false)
  const [editingField, setEditingField] = useState(null)

  // Alertas de vacíos de información calculadas en tiempo real para el Brief
  const missingFields = useMemo(() => {
    const missing = []
    if (!brief.marca || !brief.marca.trim() || brief.marca === 'Pendiente') missing.push('marca')
    if (!brief.productoServicio || !brief.productoServicio.trim() || brief.productoServicio === 'Pendiente') missing.push('producto/servicio')
    if (!brief.oferta || !brief.oferta.trim() || brief.oferta === 'Pendiente') missing.push('oferta principal')
    if (!brief.precio || !brief.precio.trim() || brief.precio === 'Pendiente') missing.push('precio')
    if (!brief.canalVenta || !brief.canalVenta.trim() || brief.canalVenta === 'Pendiente') missing.push('canal de venta')
    if (!brief.publicoObjetivo || !brief.publicoObjetivo.trim() || brief.publicoObjetivo === 'Pendiente') missing.push('público objetivo')
    return missing
  }, [brief])

  // Alertas de vacíos de información calculadas en tiempo real para el Diagnóstico
  const missingDiagFields = useMemo(() => {
    const missing = []
    if (!diagnostico.problemaCentral || !diagnostico.problemaCentral.trim()) missing.push('problemaCentral')
    if (!diagnostico.deseoProfundo || !diagnostico.deseoProfundo.trim()) missing.push('deseoProfundo')
    if (!diagnostico.anguloEstrategico || !diagnostico.anguloEstrategico.trim()) missing.push('anguloEstrategico')
    if (!diagnostico.oportunidadComunicacion || !diagnostico.oportunidadComunicacion.trim()) missing.push('oportunidadComunicacion')
    if (!diagnostico.riesgoPrincipal || !diagnostico.riesgoPrincipal.trim()) missing.push('riesgoVenderDemasiadoPronto')
    return missing
  }, [diagnostico])

  // Efecto de Autocalibración del Diagnóstico Comercial basado en el Brief Aprobado
  useEffect(() => {
    if (brief.marca) {
      // 1. Calibrar temperatura según nivel de conciencia del brief
      let temp = 'MOFU tibio'
      if (brief.nivelConciencia === 'Inconsciente') temp = 'TOFU frío'
      else if (brief.nivelConciencia === 'Totalmente Consciente') temp = 'BOFU caliente'

      // 2. Seed del diagnóstico a partir de los campos reales del brief
      setDiagnostico((prev) => {
        // Solo sobreescribir si están vacíos o vienen de un brief recién inicializado/extraído
        const isDefault = !prev.problemaCentral || prev.problemaCentral.startsWith('La pérdida constante') || prev.problemaCentral.startsWith('El caos creativo')
        
        if (!isDefault && prev.problemaCentral) {
          // Si el usuario ya modificó el diagnóstico, mantenemos sus cambios y solo sincronizamos nivel de conciencia y temperatura
          return {
            ...prev,
            nivelConciencia: brief.nivelConciencia || 'Consciente del Problema',
            temperaturaCampaña: temp
          }
        }

        const brand = brief.marca
        const prod = brief.productoServicio || 'nuestro servicio'
        const offer = brief.oferta || 'nuestra propuesta'
        const problem = brief.problemaPrincipal || ''
        const desire = brief.deseoPrincipal || ''
        const vChannel = brief.canalVenta || 'Canal comercial'
        const toneVal = brief.tono || 'estratégico'
        
        // Detección automática de faltantes para la validación (datosRequierenValidacion)
        const validations = []
        if (!brief.diferenciadores || brief.diferenciadores.length === 0) {
          validations.push("Requiere validación: Falta especificar diferenciadores de marca en el Brief Maestro.")
        }
        if (!brief.beneficios || brief.beneficios.length === 0) {
          validations.push("Requiere validación: Falta detallar beneficios específicos en el Brief Maestro.")
        }
        if (!brief.precio || brief.precio === 'Pendiente' || brief.precio.trim() === '') {
          validations.push("Requiere validación: El precio o modalidad comercial no está claro en el Brief Maestro.")
        }
        if (brief.camposPendientes && brief.camposPendientes.length > 0) {
          brief.camposPendientes.forEach(field => {
            validations.push(`Requiere validación: Falta completar el parámetro indispensable "${field}" en el Brief Maestro.`)
          })
        }

        // Evaluar si realmente es un producto de Notion o metodologías estructuradas (Sistema Operativo de Contenidos)
        const isNotionOrStructure = 
          brand.toLowerCase().includes('notion') || 
          prod.toLowerCase().includes('notion') || 
          offer.toLowerCase().includes('notion') || 
          problem.toLowerCase().includes('notion') ||
          brand.toLowerCase().includes('sistema operativo') || 
          prod.toLowerCase().includes('plantilla')

        let computedProblem = ''
        let computedDolores = []
        let computedDeseoProfundo = ''
        let computedObjeciones = []
        let computedOportunidad = ''
        let computedRiesgo = ''
        let computedAngulo = ''
        let computedEnfoque = ''
        let computedEvitar = []

        if (isNotionOrStructure) {
          computedProblem = `El desorden visual, la dispersión creativa y la ausencia de un ecosistema operativo centralizado. Esto provoca que el equipo o creador pierda consistencia en la publicación de contenidos al no unificar guiones, ideas y plazos.`
          computedDolores = [
            "Fuga de destellos creativos por no contar con una bandeja de captura express.",
            "Cuellos de botella y plazos rotos en fases de producción (Guion, Grabación, Edición).",
            "Publicación aleatoria 'por cumplir' en lugar de seguir un embudo inbound estructurado."
          ]
          computedDeseoProfundo = `Lograr consistencia editorial total, automatizando y centralizando el flujo de trabajo en una única pantalla de Notion sin silos.`
          computedObjeciones = [
            "Duda sobre la curva de aprendizaje de Notion y facilidad de uso.",
            "Incertidumbre sobre si requiere un plan de Notion de pago para funcionar.",
            "Escepticismo sobre si sirve para creadores individuales o solo para agencias."
          ]
          computedOportunidad = `Posicionar este sistema como el Hub Operativo definitivo que ahorra horas de planificación semanal y elimina la fatiga por desorganización.`
          computedRiesgo = `Vender directamente la plantilla de Notion como un gasto sin antes educar sobre las pérdidas invisibles de tiempo que ocasiona el caos operativo actual.`
          computedAngulo = `Enfoque en la eficiencia operativa extrema y la transformación de la rutina diaria: pasar de la improvisación al flujo continuo.`
          computedEnfoque = `Demostrar con capturas conceptuales o análisis crítico cómo el desorden editorial sabotea el alcance natural del algoritmo.`
          computedEvitar = [
            "No prometer que Notion automatiza la publicación en redes por sí sola.",
            "Evitar vender de forma agresiva en frío sin educar previamente.",
            "No usar tecnicismos abrumadores de fórmulas de Notion."
          ]
        } else {
          // ESTRICTAMENTE DERIVADO DEL BRIEF (Sin frases genéricas pre-fabricadas)
          computedProblem = `El obstáculo central es que el público objetivo se enfrenta a: ${problem}. Esto les impide alcanzar su meta de forma óptima.`
          
          computedDolores = [
            `Frustración directa y diaria al intentar resolver: ${problem}.`,
            `Incapacidad de materializar consistentemente el deseo de: ${desire}.`,
            `Pérdida de eficiencia o rentabilidad al operar bajo el escenario actual sin la oferta de ${brand}.`
          ]
          
          computedDeseoProfundo = `Satisfacer plenamente el anhelo de ${desire}, logrando obtener los beneficios clave de ${brief.beneficios?.[0] || 'la oferta'} de manera predecible.`
          
          computedObjeciones = brief.objecionesProbables?.length > 0 
            ? [...brief.objecionesProbables] 
            : [
                `Escepticismo sobre si el producto/servicio realmente resolverá su caso particular de: ${problem}.`,
                `Resistencia al precio (${brief.precio || 'oferta'}), cuestionando la rentabilidad real de la inversión.`,
                `Fricción o dudas sobre el canal de entrega o el proceso a través de: ${vChannel}.`
              ]

          computedOportunidad = `Posicionar a ${brand} como la alternativa de máxima efectividad que ataca de raíz el problema de ${problem} a través de su diferenciador principal: ${brief.diferenciadores?.[0] || 'innovación'}.`
          computedRiesgo = `Intentar presionar el cierre comercial en ${vChannel} antes de resolver la objeción sobre el costo o la viabilidad de la solución.`
          computedAngulo = `Destacar el beneficio central ("${brief.beneficios?.[0] || 'solución rápida'}") y el tono ${toneVal} para conectar directamente con las necesidades del cliente ideal.`
          computedEnfoque = `Educar a la audiencia sobre las consecuencias negativas de no solucionar a tiempo el dolor de ${problem}, abriendo paso al valor de ${brand}.`
          computedEvitar = brief.restricciones?.length > 0 
            ? [...brief.restricciones] 
            : [
                `No prometer resultados irreales o mágicos que no se desprendan de la oferta.`,
                `Evitar el uso de tecnicismos complejos de la industria que alejen al cliente ideal.`,
                `Evitar la presión de venta agresiva si la temperatura es TOFU fría.`
              ]
        }

        return {
          ...prev,
          problemaCentral: computedProblem,
          doloresPrincipales: computedDolores,
          deseoProfundo: computedDeseoProfundo,
          objecionesComerciales: computedObjeciones,
          nivelConciencia: brief.nivelConciencia || 'Consciente del Problema',
          temperaturaCampaña: temp,
          oportunidadComunicacion: computedOportunidad,
          riesgoPrincipal: computedRiesgo,
          anguloEstrategico: computedAngulo,
          enfoqueContenidoOrganico: computedEnfoque,
          mensajesAEvitar: computedEvitar,
          datosRequierenValidacion: validations.length > 0 ? validations : prev.datosRequierenValidacion || [],
          categoriaMercado: prev.categoriaMercado || `${prod} · Categoría comercial`,
          problemaSocialOperativo: prev.problemaSocialOperativo || computedProblem,
          herramientasTendenciasSugeridas: prev.herramientasTendenciasSugeridas || "Productividad asíncrona, IA Generativa, Simplificación digital",
          oportunidadPosicionamiento: prev.oportunidadPosicionamiento || computedOportunidad
        }
      })
    }
  }, [brief])

  // Manejador del evento de selección de archivo nativo con FileReader real
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFileLoading(true)
      setGeneratingMessage('Analizando bases de marca del archivo y detectando alcances...')
      
      const fileNameLower = file.name.toLowerCase()
      const isSistemaContenido = fileNameLower.includes('sistema') && fileNameLower.includes('contenido')
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target.result || ''
        
        setTimeout(() => {
          setUploadedFile({ name: file.name, size: file.size })
          
          if (isSistemaContenido) {
            // Cargamos los datos REALES y estratégicos extraídos de tu documento de Notion v2
            const extracted = {
              marca: 'SISTEMA OPERATIVO DE CONTENIDOS',
              productoServicio: 'Plantilla estructurada en Notion para creadores de contenido',
              oferta: 'Transforma el caos creativo en un flujo de trabajo estructurado y continuo en Notion.',
              precio: 'S/. 29',
              publicoObjetivo: 'Creadores de contenido, marcas personales, agencias y equipos que publican recurrentemente.',
              problemaPrincipal: 'El caos creativo, desorden visual y falta de un flujo de trabajo unificado que conecte la ideación, planificación, producción y calendario.',
              deseoPrincipal: 'Centralizar el flujo editorial en Notion con visualización Gantt, roles claros y seguimiento de fases (Guion, Producción, Edición).',
              beneficios: ['Centralización total del flujo creativo en Notion', 'Visualización Gantt de plazos y roles claros', 'Laboratorio de Ideas con sistema de captura express'],
              diferenciadores: ['Diseñado a partir de operaciones reales de agencias', 'Enfoque estricto en embudo inbound (TOFU, MOFU, BOFU)', 'Plantillas de guion listas para inyectar en copies'],
              canalVenta: 'Landing Page + Checkout',
              canalConversion: 'Landing Page + Checkout',
              tono: 'Directo y Estratégico',
              nivelConciencia: 'Consciente del Problema',
              objecionesProbables: ['¿Es muy difícil de implementar en mi Notion?', '¿Se requiere plan de pago de Notion?', '¿Sirve para equipos pequeños?'],
              restricciones: ['No vender de forma agresiva en frío', 'No prometer que Notion automatiza las operaciones externas'],
              resumenEjecutivo: 'Un ecosistema operativo digital robusto para marcas que buscan consistencia en su producción de contenido orgánico, eliminando silos y desorden.',
              camposPendientes: []
            }
            setBrief(extracted)
          } else {
            // Extracción real basada en palabras clave
            const lines = text.split('\n')
            const getFieldVal = (keywords, defVal = '') => {
              for (let line of lines) {
                const lower = line.toLowerCase()
                for (let kw of keywords) {
                  const pattern = kw + ':'
                  const patternAlt = kw + '：'
                  if (lower.includes(pattern) || lower.includes(patternAlt)) {
                    const idx = line.indexOf(':') !== -1 ? line.indexOf(':') : line.indexOf('：')
                    const val = line.substring(idx + 1).trim()
                    if (val) return val
                  }
                }
              }
              return defVal
            }

            const getListFieldVal = (headerKeywords) => {
              let active = false
              const result = []
              for (let line of lines) {
                const lower = line.toLowerCase()
                const isHeader = headerKeywords.some(kw => lower.includes(kw))
                if (isHeader) {
                  active = true
                  continue
                }
                if (active) {
                  if (line.trim() === '' || line.startsWith('#') || line.includes(':') || line.includes('：')) {
                    active = false
                    continue
                  }
                  const clean = line.replace(/^[-*•\d.]+\s*/, '').trim()
                  if (clean) result.push(clean)
                }
              }
              return result
            }

            const extractedMarca = getFieldVal(['marca', 'nombre de la marca', 'empresa', 'brand', 'name'])
            const extractedProducto = getFieldVal(['producto', 'servicio', 'producto o servicio', 'product', 'service'])
            const extractedOferta = getFieldVal(['oferta principal', 'oferta', 'promesa', 'promesa principal', 'offer'])
            const extractedPrecio = getFieldVal(['precio', 'costo', 'modalidad comercial', 'price', 'cost'])
            const extractedPublico = getFieldVal(['publico objetivo', 'publico', 'cliente ideal', 'target', 'audience'])
            const extractedProblema = getFieldVal(['problema principal', 'problema', 'dolor', 'dolor principal', 'problem'])
            const extractedDeseo = getFieldVal(['deseo principal', 'deseo', 'anhelo', 'desire'])
            const extractedCanal = getFieldVal(['canal de venta', 'canal', 'canal conversion', 'canalventa', 'sales channel'])
            const extractedTono = getFieldVal(['tono', 'tono de marca', 'tone'], 'Directo y Estratégico')
            const extractedConciencia = getFieldVal(['nivel de conciencia', 'conciencia'], 'Consciente del Problema')
            const extractedResumen = getFieldVal(['resumen ejecutivo', 'resumen', 'summary'], '')

            const extractedBeneficios = getListFieldVal(['beneficios', 'beneficio', 'benefits'])
            const extractedDiferenciadores = getListFieldVal(['diferenciadores', 'diferenciador', 'differentiators'])
            const extractedObjeciones = getListFieldVal(['objeciones', 'objeciones probables', 'objections'])
            const extractedRestricciones = getListFieldVal(['restricciones', 'evitar', 'restrictions'])

            // Formulación inteligente del público objetivo para evitar plantillas genéricas (Requerimiento 5)
            let computedPublico = extractedPublico || ''
            if (!computedPublico || computedPublico.toLowerCase().includes('personas de') || computedPublico.toLowerCase().includes('25 a 40')) {
              const prodLower = (extractedProducto || '').toLowerCase()
              const marcaLower = (extractedMarca || '').toLowerCase()
              
              if (prodLower.includes('notion') || prodLower.includes('contenido') || prodLower.includes('plantilla') || prodLower.includes('creador') || marcaLower.includes('sistema') || marcaLower.includes('contenido')) {
                computedPublico = 'Creadores de contenido, marcas personales, agencias y equipos que publican recurrentemente y necesitan ordenar ideas, planificación, producción y calendario editorial.'
              } else if (prodLower.includes('consult') || prodLower.includes('asesor') || prodLower.includes('b2b') || prodLower.includes('servicio')) {
                computedPublico = 'Consultores, profesionales independientes, agencias de servicios y directores comerciales B2B que buscan automatizar la prospección y generación de leads cualificados.'
              } else if (prodLower.includes('curso') || prodLower.includes('acad') || prodLower.includes('infoprod')) {
                computedPublico = 'Infoproductores, mentores y educadores digitales que buscan automatizar la entrega de sus formaciones y maximizar el LTV del estudiante.'
              } else if (extractedProducto) {
                computedPublico = `Empresas, líderes y profesionales especializados que utilizan activamente ${extractedProducto.toLowerCase()} y necesitan optimizar sus procesos de forma ágil.`
              } else {
                computedPublico = 'Directores, emprendedores y equipos operativos que buscan optimizar sus procesos de escala de marca.'
              }
            }

            const newBrief = {
              marca: extractedMarca || '',
              productoServicio: extractedProducto || '',
              oferta: extractedOferta || '',
              precio: extractedPrecio || '',
              publicoObjetivo: computedPublico,
              problemaPrincipal: extractedProblema || '',
              deseoPrincipal: extractedDeseo || '',
              beneficios: extractedBeneficios,
              diferenciadores: extractedDiferenciadores,
              canalVenta: extractedCanal || '',
              canalConversion: extractedCanal || 'WhatsApp Business',
              tono: extractedTono,
              nivelConciencia: extractedConciencia,
              objecionesProbables: extractedObjeciones,
              restricciones: extractedRestricciones,
              resumenEjecutivo: extractedResumen,
              camposPendientes: []
            }

            const mandatoryKeys = ['marca', 'productoServicio', 'oferta', 'publicoObjetivo', 'problemaPrincipal', 'precio', 'canalVenta']
            const missing = []
            mandatoryKeys.forEach(k => {
              if (!newBrief[k] || newBrief[k].trim() === '') {
                newBrief[k] = ''
                missing.push(k)
              }
            })
            newBrief.camposPendientes = missing

            setBrief(newBrief)
          }
          setFileLoading(false)
        }, 1500)
      }
      reader.readAsText(file)
    }
  }
  
  // Control del acordeón de opciones avanzadas
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showAccordion1, setShowAccordion1] = useState(false)
  const [showAccordion2, setShowAccordion2] = useState(false)
  const [showDiagAccordion1, setShowDiagAccordion1] = useState(false)
  const [showDiagAccordion2, setShowDiagAccordion2] = useState(false)
  const [showUploadPanel, setShowUploadPanel] = useState(false)
  
  // Control del Slider del Tono de Comunicación
  const [toneStep, setToneStep] = useState(2) // 1 = Corporativo, 2 = Directo, 3 = Emocional
  
  // Estados de desbloqueo y aprobación
  const [unlockedModules, setUnlockedModules] = useState(['brief'])
  const [approvedModules, setApprovedModules] = useState([])
  
  // Estado de carga progresiva simulada de la IA
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingMessage, setGeneratingMessage] = useState('')
  
  // Base de datos de la campaña activa (Generada por la IA)
  const [campaignData, setCampaignData] = useState(null)
  const [copyStatus, setCopyStatus] = useState('')
  
  // Variables auxiliares de navegación
  const activeIndex = modules.findIndex((m) => m.id === activeModule)
  const isFirstModule = activeIndex === 0
  const isLastModule = activeIndex === modules.length - 1

  // Estado del simulador de WhatsApp
  const [selectedWaStep, setSelectedWaStep] = useState(0)

  // Estado del selector de variantes de copies
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0)
  const [selectedCopyTone, setSelectedCopyTone] = useState('intermedia') // profesional, intermedia, agresiva

  // Mapeo del control deslizante del tono al texto del brief
  useEffect(() => {
    let toneText = 'directo, estratégico, claro'
    if (toneStep === 1) toneText = 'corporativo, formal, institucional'
    if (toneStep === 3) toneText = 'emocional, persuasivo, cercano'
    setBrief((prev) => ({ ...prev, tono: toneText }))
  }, [toneStep])


  // Efecto para sincronizar los módulos desbloqueados
  useEffect(() => {
    const newUnlocked = ['brief']
    if (approvedModules.includes('brief')) newUnlocked.push('diagnostico')
    if (approvedModules.includes('diagnostico')) newUnlocked.push('organico')
    if (approvedModules.includes('organico')) newUnlocked.push('embudo')
    if (approvedModules.includes('embudo')) newUnlocked.push('copies')
    if (approvedModules.includes('copies')) newUnlocked.push('whatsapp')
    if (approvedModules.includes('whatsapp')) newUnlocked.push('checklist')
    setUnlockedModules(newUnlocked)
  }, [approvedModules])

  // ========================================================
  // EVENT HANDLERS: MÓDULO 03 (INVESTIGACIÓN Y CONTENIDO ORGÁNICO)
  // ========================================================
  const handleRunOrganicResearch = async () => {
    setIsGeneratingOrganic(true)
    try {
      const ops = await organicResearchService.generateResearchOpportunities(
        executeIaTask,
        { brief, diagnostico },
        aiConfig
      )
      setOpportunities(ops)
      setSelectedOpportunityId('')
    } catch (e) {
      console.error('Error running organic research:', e)
    } finally {
      setIsGeneratingOrganic(false)
    }
  }

  const handleImproveOrganicOpportunity = (id) => {
    setOpportunities(prev => prev.map(o => {
      if (o.id === id) {
        return organicResearchService.improveOpportunityImpact(o)
      }
      return o
    }))
  }

  const handleGenerateOrganicPiece = async (format, style, opportunity) => {
    setIsGeneratingOrganic(true)
    try {
      const piece = await organicContentService.generateOrganicPiece({
        format,
        style,
        opportunity,
        executeIaTask,
        campaignState: { brief, diagnostico },
        aiConfig
      })
      return piece
    } catch (e) {
      console.error('Error generating piece:', e)
      return null
    } finally {
      setIsGeneratingOrganic(false)
    }
  }

  // Motor estratégico de simulación de IA
  const triggerIaProcessing = (moduleId) => {
    setIsGenerating(true)
    let messages = []
    
    if (moduleId === 'brief') {
      messages = [
        'Analizando brief manual del producto...',
        'Estructurando propuesta de valor única...',
        'Validando coherencia estratégica y restricciones...',
        'Brief Maestro generado con éxito.'
      ]
    } else if (moduleId === 'diagnostico') {
      messages = [
        'Analizando el comportamiento del público objetivo...',
        'Priorizando dolores y síntomas de comunicación...',
        'Extrayendo el problema central y 3 subproblemas...',
        'Diagnóstico estratégico estructurado correctamente.'
      ]
    } else if (moduleId === 'organico') {
      messages = [
        'Estructurando pilares educativos sin venta...',
        'Calibrando hooks de atracción según nivel de conciencia...',
        'Diseñando plan de contenidos orgánicos...',
        'Parrilla de contenido base generada.'
      ]
    } else if (moduleId === 'copies') {
      messages = [
        'Diseñando prompts visuales para cada asset...',
        'Redactando copies en tono Profesional (Valor y autoridad)...',
        'Redactando copies en tono Intermedio (Beneficios y dolor)...',
        'Redactando copies en tono Agresivo (Escasez y urgencia)...',
        'Biblioteca de assets y copias completada.'
      ]
    } else if (moduleId === 'whatsapp') {
      messages = [
        'Configurando protocolo conversacional comercial...',
        'Estructurando scripts de bienvenida y preguntas...',
        'Diseñando guiones de objeciones y cierres de venta...',
        'Secuencia y respuestas rápidas de WhatsApp listas.'
      ]
    } else {
      messages = ['Procesando módulo con IA...', 'Completado.']
    }

    let currentMsgIndex = 0
    setGeneratingMessage(messages[0])

    const interval = setInterval(() => {
      currentMsgIndex++
      if (currentMsgIndex < messages.length) {
        setGeneratingMessage(messages[currentMsgIndex])
      } else {
        clearInterval(interval)
        setIsGenerating(false)
        
        if (moduleId === 'brief') {
          const marca = brief.marca || 'Marca Pro'
          const oferta = brief.oferta || 'Servicio Premium'
          const precio = brief.precio || 'Precio Fijo'
          const dolor = brief.problemaPrincipal || 'el dolor central de comunicación de tu público ideal'
          const deseo = brief.deseoPrincipal || 'el anhelo estratégico de automatización y escalado'

          const isSistemaContenido = 
            (marca.toLowerCase().includes('sistema') && marca.toLowerCase().includes('contenido')) || 
            marca.toLowerCase().includes('operativo') || 
            uploadedFile?.name.toLowerCase().includes('sistema')

          const cleanDolor = dolor.charAt(0).toLowerCase() + dolor.slice(1).replace(/\.+$/, "")
          const cleanDeseo = deseo.charAt(0).toLowerCase() + deseo.slice(1).replace(/\.+$/, "")
          const cleanOferta = oferta.charAt(0).toLowerCase() + oferta.slice(1).replace(/\.+$/, "")

          const diagnosticoData = isSistemaContenido 
            ? {
                problemaCentral: "El caos creativo y la desconexión operativa. La marca pierde impacto y consistencia debido a que las ideas quedan dispersas en múltiples notas o chats, no existe un flujo editorial ordenado y el equipo trabaja de forma descoordinada.",
                subproblemas: [
                  { titulo: '1. Fuga Silenciosa de Ideas', desc: 'El 80% de los destellos creativos se desvanece por no contar con un Laboratorio de Ideas con sistema de captura express, impidiendo madurar los conceptos antes de la producción.' },
                  { titulo: '2. Cuello de Botella Operativo', desc: 'Retrasos continuos en la entrega y estrés en el equipo al no tener visibilidad de las fases de producción (Guion, Producción, Edición) ni una línea de tiempo Gantt clara.' },
                  { titulo: '3. Publicaciones sin Enfoque de Embudo', desc: 'Se crea contenido "por cumplir con el calendario" de forma aleatoria, en lugar de estructurar piezas conectadas a etapas comerciales (TOFU, MOFU, BOFU) para guiar al usuario hacia la conversión.' }
                ],
                conciencia: brief.nivelConciencia || 'Consciente del Problema',
                tipoCampana: 'Campaña de Lanzamiento y Educación Estratégica (80% valor / 20% urgencia)',
                riesgos: [
                  "Si se vende directamente en redes sin antes educar a la audiencia sobre el valor del orden operativo, percibirán el sistema como un gasto de Notion y no como una inversión de escala.",
                  "El desorden y la inconsistencia editorial enfrían el algoritmo de las plataformas, provocando que tu alcance natural y visibilidad caigan en picada.",
                  "La falta de un Hub centralizado fomenta el trabajo en silos, provocando duplicidad de tareas, plazos rotos y frustración en el equipo."
                ]
              }
            : {
                problemaCentral: `La pérdida constante de impacto y oportunidades comerciales debido a la siguiente problemática central: ${cleanDolor}.`,
                subproblemas: [
                  { titulo: '1. Falta de Enfoque Estratégico', desc: `Los contenidos y prospectos no conectan con el dolor real ya que se mantiene un escenario de ${cleanDolor}.` },
                  { titulo: '2. Desconexión en la Conversión', desc: `Falta de un hilo conductor estructurado para guiar al usuario a lograr de manera consistente el anhelo de ${cleanDeseo}.` },
                  { titulo: '3. Ejecución Inconsistente', desc: `Incapacidad de mantener la constancia operativa indispensable para posicionar con éxito la propuesta de ${cleanOferta}.` }
                ],
                conciencia: brief.nivelConciencia || 'Consciente del Problema',
                tipoCampana: 'Campaña Estratégica Mixta (80% valor / 20% urgencia)',
                riesgos: [
                  `Si se presiona con la venta directa antes de educar al público sobre el valor real de ${cleanOferta}, la audiencia ignorará la propuesta de inmediato.`,
                  `No enfocar la comunicación directamente en resolver el dolor de ${cleanDolor} provocará que el público lo perciba como un gasto y no como una inversión.`,
                  `La falta de un flujo de trabajo claro impedirá que el cliente alcance su anhelo de ${cleanDeseo}.`
                ]
              }

          setCampaignData({
            diagnostico: diagnosticoData,
            organico: [
              { pilar: 'Educativo', hook: `¿Sabías que el principal obstáculo para destacar hoy es que ${dolor}?`, desc: `Análisis detallado de cómo este problema frena el crecimiento y cómo resolverlo de raíz de forma simple.`, cta: 'Comenta "ESTRATEGIA" para enviarte una guía práctica paso a paso.' },
              { pilar: 'Dolor', hook: `El error silencioso de intentar conseguir ${deseo} sin antes resolver el problema de raíz.`, desc: 'Comparación del método tradicional e ineficiente frente a un enfoque centrado en la solución.', cta: `Síguenos para más consejos prácticos sobre ${marca}.` },
              { pilar: 'Autoridad', hook: `Cómo diseñamos la propuesta de ${oferta} para solucionar este dolor de forma definitiva.`, desc: 'Caso de estudio corto aplicando nuestra metodología probada paso a paso.', cta: 'Comparte esta publicación con alguien que necesite resolver este problema.' },
              { pilar: 'Confianza', hook: `¿Por qué tu público no conecta con tu propuesta? (Y la fórmula exacta para cambiarlo)`, desc: `Desglose paso a paso de una secuencia orientada a conseguir ${deseo} de forma simple y predecible.`, cta: 'Guarda esta publicación para usarla hoy mismo.' }
            ],
            assets: [
              {
                id: 1,
                etapa: 'atraccion',
                formato: 'carrusel',
                idea: `Carrusel interactivo: Los 3 errores mortales al intentar solucionar que: ${dolor}.`,
                promptVisual: 'Diseño de alto impacto estilo editorial, tipografía Outfit gigante, fondo gris claro con acentos modernos, capturas de pantalla conceptuales.',
                subproblema: 'Falta de Enfoque Estratégico',
                copies: {
                  profesional: `Para posicionar con éxito una propuesta como ${marca}, no basta con publicar contenido genérico. El verdadero secreto radica en diagnosticar y resolver el dolor real de tu cliente.\n\nAquí te mostramos los 3 errores de comunicación que te impiden solucionar este obstáculo hoy mismo.\n\nGuarda este carrusel y compártelo con tu equipo.`,
                  intermedia: `¿Sientes que trabajas el doble y no logras tus objetivos estratégicos?\n\nMuchos cometen el error de no ver que ${dolor}. En esta guía te enseñamos a estructurar una comunicación sólida para que tu oferta de ${oferta} sea irresistible.\n\n¿Quieres el método completo? Déjanos un comentario.`,
                  agresivo: `¡Deja de perder clientes y escala tu marca hoy mismo!\n\nConsigue la solución completa de ${marca} con un beneficio exclusivo por lanzamiento.\n\nAccede de inmediato por solo ${precio} haciendo clic en el enlace de abajo.`
                },
                cta: { profesional: 'Guardar publicación', intermedia: 'Comentar para recibir guía', agresivo: 'Acceder a la oferta ahora' }
              },
              {
                id: 2,
                etapa: 'consideracion',
                formato: 'video_corto',
                idea: `Video corto: La fórmula de 3 pasos para alcanzar de forma predecible: ${deseo}.`,
                promptVisual: 'Grabación premium de alta definición en primer plano con subtítulos dinámicos de alto contraste, acentos en verde esmeralda.',
                subproblema: 'Desconexión en la Conversión',
                copies: {
                  profesional: `El éxito de una propuesta radica en la claridad. Si tu cliente no entiende cómo le vas a resolver su problema, buscará otra opción.\n\nEn este video te enseño a estructurar una promesa clara para tu marca.\n\nSíguenos para más tácticas estratégicas de comunicación.`,
                  intermedia: `¿Te cuesta conectar con tu público ideal y demostrar el valor real de tu oferta?\n\nEl problema no es tu producto, es que no logran visualizar cómo conseguir ${deseo}. Aquí te revelo el script exacto de 3 pasos que usamos.\n\nMira el video completo hoy.`,
                  agresivo: `La claridad vende, la confusión ahuyenta. Con nuestra solución ${oferta}, tendrás el camino exacto para conseguir ${deseo} de forma rápida.\n\nAccede ahora antes de que el precio de ${precio} suba.`
                },
                cta: { profesional: 'Seguir cuenta', intermedia: 'Ver video completo', agresivo: 'Comprar ahora' }
              },
              {
                id: 3,
                etapa: 'conversion',
                formato: 'post_imagen',
                idea: `Imagen conceptual: El dashboard de control estratégico de ${marca}.`,
                promptVisual: 'Iluminación cinematográfica de una pantalla en un escritorio minimalista que muestra la consola interactiva con diseño de Bento Grid.',
                subproblema: 'Ejecución Inconsistente',
                copies: {
                  profesional: `La consistencia y organización determinan tu tasa de éxito comercial. Un entorno ordenado te permite optimizar tus recursos y escalar de manera predecible.\n\nDiseña flujos profesionales con ${marca}.`,
                  intermedia: `No tener un control diario sobre tus objetivos es regalarle tu tiempo a la competencia.\n\nCon el flujo estructurado de ${marca}, podrás solucionar el problema de que ${dolor} de forma sutil y eficiente.\n\nSolicita una demo comentando abajo.`,
                  agresivo: `¡Últimas horas para sumarte a la solución definitiva de ${marca} por solo ${precio}!\n\nNo dejes que tu negocio se detenga por falta de organización. Recibe el motor de instrucciones y el flujo optimizado hoy mismo.\n\nCompra garantizada.`
                },
                cta: { profesional: 'Descubrir ecosistema', intermedia: 'Solicitar Demo', agresivo: 'Comprar con descuento' }
              }
            ],
            whatsapp: {
              mensajeBienvenida: `¡Hola! Gracias por escribir a ${marca}. Soy tu asistente virtual estratégico. Para ayudarte a resolver el problema de que ${dolor} de la mejor forma, cuéntame: ¿Cuál es el nombre de tu marca o proyecto?`,
              preguntasDiagnostico: [
                `¿Cuál consideras que es el principal obstáculo por el cual tu público no logra ${deseo}?`,
                `¿Qué herramientas o métodos has intentado antes para posicionar tu oferta de ${oferta}?`
              ],
              presentacionSolucion: `Entiendo perfectamente. Basándome en tus respuestas, veo que el cuello de botella es que no cuentas con una estructura sólida. Con nuestra solución ${oferta}, podrás automatizar el flujo comercial sin sonar frío ni robótico.`,
              respuestasObjeciones: {
                precio: `Entiendo que el precio de ${precio} sea un factor a considerar. Sin embargo, si logras solucionar el problema de que ${dolor} gracias a nuestra herramienta, el sistema ya se habrá pagado solo. ¿Te gustaría ver un caso real en video?`,
                dudaTecnica: `Es una duda muy común. La instalación de ${marca} se realiza en solo 5 minutos mediante una interfaz limpia y te incluimos un videotutorial paso a paso muy sencillo. Si te trabas, nuestro equipo te asiste en vivo.`
              },
              ctaConversacion: `¿Prefieres que te enviemos el enlace de pago directo o te gustaría agendar una breve llamada de demostración de 5 minutos?`,
              secuenciaSeguimiento: [
                `Hola, ¿cómo estás? Te escribo de forma rápida porque sé que andas ocupado. ¿Lograste revisar el enlace de la consola que te envié ayer? Cuéntame si tienes alguna duda sobre cómo te ayudaremos a conseguir ${deseo}.`,
                `Hola. Veo que aún no has podido sumarte a ${marca}. Recuerda que la oferta especial de ${precio} expira pronto. ¿Qué te hace falta para dar el paso de solucionar de raíz que ${dolor}?`
              ],
              recuperacionLeads: `Entiendo que no sea el momento ideal para sumarte. Para agradecer tu tiempo, te he liberado una plantilla estratégica de ${marca} completamente gratis. Si en el futuro necesitas escalar, las puertas estarán abiertas.`
            },
            checklist: {
              items: [
                { key: 'brief', label: 'Brief Maestro Aprobado', status: true },
                { key: 'diagnostico', label: 'Diagnóstico Estratégico Cerrado', status: true },
                { key: 'organico', label: 'Plan Orgánico Base Generado', status: true },
                { key: 'embudo', label: 'Embudo Inbound Calibrado', status: true },
                { key: 'copies', label: 'Assets & Copies Redactados', status: true },
                { key: 'whatsapp', label: 'Flujo Comercial de WhatsApp Validado', status: true }
              ]
            }
          })
          
          if (!approvedModules.includes('brief')) {
            setApprovedModules((prev) => [...prev, 'brief'])
          }
        } else {
          if (!approvedModules.includes(moduleId)) {
            setApprovedModules((prev) => [...prev, moduleId])
          }
        }
      }
    }, 600)
  }

  // Descarga de archivos en Markdown
  const downloadMarkdown = (title, content) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Copia de textos simples
  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text)
    setCopyStatus('¡Texto copiado!')
    setTimeout(() => setCopyStatus(''), 1500)
  }

  // Genera el contenido Markdown del Brief Maestro
  const generateBriefMarkdown = () => {
    return `# Brief Maestro Estratégico: ${brief.marca || 'Marca Pro'}

## 1. Identidad de la Marca o Producto
* **Nombre de la Marca:** ${brief.marca || 'No especificado'}
* **Oferta / Promesa Principal:** ${brief.oferta || 'No especificada'}
* **Precio del Producto:** ${brief.precio || 'No especificado'}
* **Canal Principal de Conversión:** ${brief.canalConversion || 'WhatsApp Business'}

## 2. Segmentación del Público Objetivo
* **Público Objetivo:** ${brief.publicoObjetivo || 'No especificado'}
* **Problema Principal que Resuelve:** ${brief.problemaPrincipal || 'No especificado'}
* **Deseo Principal:** ${brief.deseoPrincipal || 'No especificado'}
* **Nivel de Conciencia Inicial:** ${brief.nivelConciencia || 'Consciente del Problema'}

## 3. Configuración de Comunicación
* **Tono de Comunicación:** ${brief.tono || 'directo, estratégico, claro'}

---
*Documento estructurado y descargado desde la Consola Qaway Hub v2.0 © 2026.*`
  }

  // Renderización condicional de los paneles de trabajo modular
  const renderWorkArea = () => {
    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
          <h3 className="text-zinc-900 font-extrabold text-base">Procesando con Inteligencia Artificial...</h3>
          <p className="text-zinc-500 text-xs mt-1 animate-pulse">{generatingMessage}</p>
        </div>
      )
    }

    switch (activeModule) {
      case 'brief':
        return (
          <div className="space-y-5">
            {/* COMPONENTE COMPACTO IA INTEGRADO */}
            <IaSelectorCompact stage="brief" isBriefMaestro={true} />
            {/* Input oculto para carga nativa de archivos */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md"
              className="hidden"
            />

            {/* SECCIÓN DE SUBIDA DE ARCHIVOS REALES (EXTREMADAMENTE COMPACTA) */}
            <div className="bg-[#f8fafc]/50 border border-zinc-200 p-4 rounded-[10px] shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-zinc-400" />
                  Carga Estratégica de Marca
                </h4>
                <p className="text-zinc-450 text-[9px] font-medium leading-relaxed">
                  Sube un archivo `.txt`, `.md` o `.pdf` con tus lineamientos para que la IA extraiga los datos reales del brief.
                </p>
              </div>
              
              <div className="flex items-center gap-2.5 shrink-0">
                {uploadedFile && (
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-[11px] bg-emerald-50/50 border border-emerald-250 px-2.5 py-1.5 rounded-[6px] shadow-3xs">
                    <Check className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                    <span className="line-clamp-1 max-w-[140px]">{uploadedFile.name}</span>
                    <button 
                      type="button" 
                      onClick={() => setUploadedFile(null)}
                      className="text-emerald-500 hover:text-red-500 font-bold ml-1 text-xs shrink-0"
                    >
                      ×
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-3.5 py-2 rounded-[6px] text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition active:scale-[0.97] shadow-xs"
                >
                  <Upload className="w-3 h-3 text-zinc-300" />
                  Cargar lineamientos
                </button>
              </div>
            </div>

            {/* FORMULARIO EDITABLE EN FICHA EJECUTIVA */}
            <div className="space-y-5 bg-white p-5 border border-zinc-200/80 rounded-[12px] shadow-xs">
              <div className="border-b border-zinc-150 pb-3 flex items-center justify-between">
                <h3 className="text-zinc-800 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  Ficha ejecutiva: Brief Maestro
                </h3>
                {uploadedFile && (
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-[10px] border border-emerald-250 font-extrabold uppercase tracking-wider">
                    Extracción Inteligente Activa
                  </span>
                )}
              </div>

              {/* Ficha Principal Visible */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3.5 pt-1">
                
                {/* Marca */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    marca
                  </label>
                  <input
                    type="text"
                    value={brief.marca}
                    placeholder="Ej. Qaway Lab..."
                    onChange={(e) => setBrief((prev) => ({ ...prev, marca: e.target.value }))}
                    className="w-full bg-[#f8fafc]/60 hover:bg-[#f8fafc]/90 border border-zinc-200/80 focus:border-zinc-400/80 focus:bg-white text-zinc-800 font-semibold rounded-[8px] px-3.5 py-2 text-xs outline-none transition-all duration-150 shadow-2xs"
                  />
                </div>

                {/* Producto o Servicio */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    productoServicio
                  </label>
                  <input
                    type="text"
                    value={brief.productoServicio}
                    placeholder="Ej. Sistema Operativo..."
                    onChange={(e) => setBrief((prev) => ({ ...prev, productoServicio: e.target.value }))}
                    className="w-full bg-[#f8fafc]/60 hover:bg-[#f8fafc]/90 border border-zinc-200/80 focus:border-zinc-400/80 focus:bg-white text-zinc-800 font-semibold rounded-[8px] px-3.5 py-2 text-xs outline-none transition-all duration-150 shadow-2xs"
                  />
                </div>

                {/* Oferta */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    oferta
                  </label>
                  <input
                    type="text"
                    value={brief.oferta}
                    placeholder="Ej. Transforma tu caos operativo..."
                    onChange={(e) => setBrief((prev) => ({ ...prev, oferta: e.target.value }))}
                    className="w-full bg-[#f8fafc]/60 hover:bg-[#f8fafc]/90 border border-zinc-200/80 focus:border-zinc-400/80 focus:bg-white text-zinc-800 font-semibold rounded-[8px] px-3.5 py-2 text-xs outline-none transition-all duration-150 shadow-2xs"
                  />
                </div>

                {/* Precio */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    precio
                  </label>
                  <input
                    type="text"
                    value={brief.precio}
                    placeholder="Ej. S/. 29 pago único..."
                    onChange={(e) => setBrief((prev) => ({ ...prev, precio: e.target.value }))}
                    className="w-full bg-[#f8fafc]/60 hover:bg-[#f8fafc]/90 border border-zinc-200/80 focus:border-zinc-400/80 focus:bg-white text-zinc-800 font-semibold rounded-[8px] px-3.5 py-2 text-xs outline-none transition-all duration-150 shadow-2xs"
                  />
                </div>

                {/* Canal de Venta */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    canalVenta
                  </label>
                  <select
                    value={brief.canalVenta}
                    onChange={(e) => setBrief((prev) => ({ ...prev, canalVenta: e.target.value, canalConversion: e.target.value }))}
                    className="w-full bg-[#f8fafc]/60 hover:bg-[#f8fafc]/90 border border-zinc-200/80 focus:border-zinc-400/80 focus:bg-white text-zinc-800 font-semibold rounded-[8px] px-3.5 py-2 text-xs outline-none transition-all duration-150 cursor-pointer shadow-2xs"
                  >
                    <option value="">-- Seleccionar Canal --</option>
                    <option value="WhatsApp Business">WhatsApp Business (Conversión manual)</option>
                    <option value="WhatsApp API (WABA)">WhatsApp Business API (Mensajería masiva)</option>
                    <option value="Landing Page + Checkout">Landing Page + Checkout directo</option>
                  </select>
                </div>

                {/* Público Objetivo */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    publicoObjetivo
                  </label>
                  <textarea
                    value={brief.publicoObjetivo}
                    placeholder="Describe detalladamente a quién va dirigido..."
                    onChange={(e) => setBrief((prev) => ({ ...prev, publicoObjetivo: e.target.value }))}
                    className="w-full bg-[#f8fafc]/60 hover:bg-[#f8fafc]/90 border border-zinc-200/80 focus:border-zinc-400/80 focus:bg-white text-zinc-800 font-semibold rounded-[8px] px-3.5 py-2 text-xs outline-none transition-all duration-150 min-h-[55px] resize-none shadow-2xs leading-relaxed"
                  />
                </div>

              </div>

              {/* Acordeón 1: Contexto Estratégico */}
              <div className="border border-zinc-200/60 rounded-[8px] overflow-hidden bg-zinc-50/10">
                <button
                  type="button"
                  onClick={() => setShowAccordion1(!showAccordion1)}
                  className="w-full px-4 py-3 flex items-center justify-between text-zinc-650 hover:text-zinc-800 transition-colors text-xs font-bold uppercase tracking-wider bg-zinc-50/40 border-b border-zinc-150/80"
                >
                  <span className="flex items-center gap-1.5">
                    ⚙️ Contexto estratégico
                  </span>
                  {showAccordion1 ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>

                <AnimatePresence>
                  {showAccordion1 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-5 space-y-4 border-t border-zinc-150 bg-white grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {/* Problema Principal */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Problema principal</label>
                        <textarea
                          value={brief.problemaPrincipal}
                          placeholder="Dolor o necesidad crítica de la audiencia..."
                          onChange={(e) => setBrief((prev) => ({ ...prev, problemaPrincipal: e.target.value }))}
                          className="w-full bg-[#f8fafc]/60 hover:bg-[#f8fafc]/90 border border-zinc-200/80 focus:border-zinc-400/80 focus:bg-white text-zinc-800 font-semibold rounded-[8px] px-3.5 py-2 text-xs outline-none transition-all duration-150 min-h-[50px] resize-none shadow-2xs leading-relaxed"
                        />
                      </div>

                      {/* Deseo Principal */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Deseo principal</label>
                        <textarea
                          value={brief.deseoPrincipal}
                          placeholder="¿Qué anhela alcanzar el público ideal?"
                          onChange={(e) => setBrief((prev) => ({ ...prev, deseoPrincipal: e.target.value }))}
                          className="w-full bg-[#f8fafc]/60 hover:bg-[#f8fafc]/90 border border-zinc-200/80 focus:border-zinc-400/80 focus:bg-white text-zinc-800 font-semibold rounded-[8px] px-3.5 py-2 text-xs outline-none transition-all duration-150 min-h-[50px] resize-none shadow-2xs leading-relaxed"
                        />
                      </div>

                      {/* Resumen Ejecutivo */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Resumen ejecutivo</label>
                        <textarea
                          value={brief.resumenEjecutivo}
                          placeholder="Síntesis del posicionamiento de la marca..."
                          onChange={(e) => setBrief((prev) => ({ ...prev, resumenEjecutivo: e.target.value }))}
                          className="w-full bg-[#f8fafc]/60 hover:bg-[#f8fafc]/90 border border-zinc-200/80 focus:border-zinc-400/80 focus:bg-white text-zinc-800 font-semibold rounded-[8px] px-3.5 py-2 text-xs outline-none transition-all duration-150 min-h-[50px] resize-none shadow-2xs leading-relaxed"
                        />
                      </div>

                      {/* Tono de Marca */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Tono de comunicación</label>
                        <select
                          value={brief.tono}
                          onChange={(e) => setBrief((prev) => ({ ...prev, tono: e.target.value }))}
                          className="w-full bg-[#f8fafc]/60 hover:bg-[#f8fafc]/90 border border-zinc-200/80 focus:border-zinc-400/80 focus:bg-white text-zinc-800 font-semibold rounded-[8px] px-3.5 py-2 text-xs outline-none transition-all duration-150 cursor-pointer shadow-2xs"
                        >
                          <option value="Directo y Estratégico">Directo y Estratégico</option>
                          <option value="Institucional y Corporativo">Institucional y Corporativo</option>
                          <option value="Cercano y Emocional">Cercano y Emocional</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Acordeón 2: Atributos Estratégicos Adicionales */}
              <div className="border border-zinc-200/60 rounded-[8px] overflow-hidden bg-zinc-50/10">
                <button
                  type="button"
                  onClick={() => setShowAccordion2(!showAccordion2)}
                  className="w-full px-4 py-3 flex items-center justify-between text-zinc-650 hover:text-zinc-800 transition-colors text-xs font-bold uppercase tracking-wider bg-zinc-50/40 border-b border-zinc-150/80"
                >
                  <span className="flex items-center gap-1.5">
                    ⚙️ Atributos estratégicos adicionales
                  </span>
                  {showAccordion2 ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>

                <AnimatePresence>
                  {showAccordion2 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-5 space-y-5 border-t border-zinc-150 bg-white"
                    >
                      {/* Beneficios */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Beneficios</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newBeneficio}
                            placeholder="Ej. Reducción de 5h semanales..."
                            onChange={(e) => setNewBeneficio(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newBeneficio.trim()) { setBrief(prev => ({ ...prev, beneficios: [...(prev.beneficios || []), newBeneficio.trim()] })); setNewBeneficio(''); } } }}
                            className="flex-1 bg-[#f8fafc]/60 border border-zinc-200/80 rounded-[8px] px-3.5 py-2 text-xs text-zinc-800 font-semibold outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => { if (newBeneficio.trim()) { setBrief(prev => ({ ...prev, beneficios: [...(prev.beneficios || []), newBeneficio.trim()] })); setNewBeneficio(''); } }}
                            className="bg-zinc-900 text-white px-4 py-2 rounded-[8px] text-xs font-extrabold"
                          >
                            Añadir
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {brief.beneficios?.map((b, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 text-[11px] bg-zinc-50 text-zinc-700 px-3 py-1.5 rounded-[8px] font-semibold border border-zinc-200">
                              {b}
                              <button type="button" onClick={() => setBrief(prev => ({ ...prev, beneficios: prev.beneficios.filter((_, idx) => idx !== i) }))} className="text-zinc-400 hover:text-red-500 font-bold ml-1">×</button>
                            </span>
                          ))}
                          {(!brief.beneficios || brief.beneficios.length === 0) && <span className="text-[11px] text-zinc-400/80 italic font-medium">Ninguno añadido aún.</span>}
                        </div>
                      </div>

                      {/* Diferenciadores */}
                      <div className="space-y-2 pt-3 border-t border-zinc-150">
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Diferenciadores</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newDiferenciador}
                            placeholder="Ej. Integración nativa de templates..."
                            onChange={(e) => setNewDiferenciador(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newDiferenciador.trim()) { setBrief(prev => ({ ...prev, diferenciadores: [...(prev.diferenciadores || []), newDiferenciador.trim()] })); setNewDiferenciador(''); } } }}
                            className="flex-1 bg-[#f8fafc]/60 border border-zinc-200/80 rounded-[8px] px-3.5 py-2 text-xs text-zinc-800 font-semibold outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => { if (newDiferenciador.trim()) { setBrief(prev => ({ ...prev, diferenciadores: [...(prev.diferenciadores || []), newDiferenciador.trim()] })); setNewDiferenciador(''); } }}
                            className="bg-zinc-900 text-white px-4 py-2 rounded-[8px] text-xs font-extrabold"
                          >
                            Añadir
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {brief.diferenciadores?.map((d, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 text-[11px] bg-zinc-50 text-zinc-700 px-3 py-1.5 rounded-[8px] font-semibold border border-zinc-200">
                              {d}
                              <button type="button" onClick={() => setBrief(prev => ({ ...prev, diferenciadores: prev.diferenciadores.filter((_, idx) => idx !== i) }))} className="text-zinc-400 hover:text-red-500 font-bold ml-1">×</button>
                            </span>
                          ))}
                          {(!brief.diferenciadores || brief.diferenciadores.length === 0) && <span className="text-[11px] text-zinc-400/80 italic font-medium">Ninguno añadido aún.</span>}
                        </div>
                      </div>

                      {/* Objeciones Probables */}
                      <div className="space-y-2 pt-3 border-t border-zinc-150">
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Objeciones probables</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newObjecion}
                            placeholder="Ej. Curva de aprendizaje..."
                            onChange={(e) => setNewObjecion(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newObjecion.trim()) { setBrief(prev => ({ ...prev, objecionesProbables: [...(prev.objecionesProbables || []), newObjecion.trim()] })); setNewObjecion(''); } } }}
                            className="flex-1 bg-[#f8fafc]/60 border border-zinc-200/80 rounded-[8px] px-3.5 py-2 text-xs text-zinc-800 font-semibold outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => { if (newObjecion.trim()) { setBrief(prev => ({ ...prev, objecionesProbables: [...(prev.objecionesProbables || []), newObjecion.trim()] })); setNewObjecion(''); } }}
                            className="bg-zinc-900 text-white px-4 py-2 rounded-[8px] text-xs font-extrabold"
                          >
                            Añadir
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {brief.objecionesProbables?.map((o, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 text-[11px] bg-zinc-50 text-zinc-700 px-3 py-1.5 rounded-[8px] font-semibold border border-zinc-200">
                              {o}
                              <button type="button" onClick={() => setBrief(prev => ({ ...prev, objecionesProbables: prev.objecionesProbables.filter((_, idx) => idx !== i) }))} className="text-zinc-400 hover:text-red-500 font-bold ml-1">×</button>
                            </span>
                          ))}
                          {(!brief.objecionesProbables || brief.objecionesProbables.length === 0) && <span className="text-[11px] text-zinc-400/80 italic font-medium">Ninguna objeción añadida aún.</span>}
                        </div>
                      </div>

                      {/* Restricciones */}
                      <div className="space-y-2 pt-3 border-t border-zinc-150">
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Restricciones</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newRestriccion}
                            placeholder="Ej. Evitar venta agresiva..."
                            onChange={(e) => setNewRestriccion(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newRestriccion.trim()) { setBrief(prev => ({ ...prev, restricciones: [...(prev.restricciones || []), newRestriccion.trim()] })); setNewRestriccion(''); } } }}
                            className="flex-1 bg-[#f8fafc]/60 border border-zinc-200/80 rounded-[8px] px-3.5 py-2 text-xs text-zinc-800 font-semibold outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => { if (newRestriccion.trim()) { setBrief(prev => ({ ...prev, restricciones: [...(prev.restricciones || []), newRestriccion.trim()] })); setNewRestriccion(''); } }}
                            className="bg-zinc-900 text-white px-4 py-2 rounded-[8px] text-xs font-extrabold"
                          >
                            Añadir
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {brief.restricciones?.map((r, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 text-[11px] bg-zinc-50 text-zinc-700 px-3 py-1.5 rounded-[8px] font-semibold border border-zinc-200">
                              {r}
                              <button type="button" onClick={() => setBrief(prev => ({ ...prev, restricciones: prev.restricciones.filter((_, idx) => idx !== i) }))} className="text-zinc-400 hover:text-red-500 font-bold ml-1">×</button>
                            </span>
                          ))}
                          {(!brief.restricciones || brief.restricciones.length === 0) && <span className="text-[11px] text-zinc-400/80 italic font-medium">Ninguna restricción añadida aún.</span>}
                        </div>
                      </div>

                      {/* Campos Pendientes */}
                      <div className="space-y-2 pt-3 border-t border-zinc-150">
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Campos pendientes</label>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {missingFields.map((field, idx) => (
                            <span key={idx} className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-[6px] border border-rose-200 uppercase tracking-wider shadow-2xs">
                              ⚠️ {field}
                            </span>
                          ))}
                          {missingFields.length === 0 && (
                            <span className="text-[10px] text-emerald-700 font-bold italic">✓ Todos los campos requeridos están completos.</span>
                          )}
                        </div>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* ACCIONES Y BOTONES DE NAVEGACIÓN */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 border-t border-zinc-150">
              <div className="grow">
                {fileLoading ? (
                  <div className="flex items-center gap-2 text-zinc-650 font-bold text-xs bg-zinc-50 border border-zinc-200 rounded-[10px] px-3.5 py-2.5 animate-pulse max-w-md">
                    <RefreshCw className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                    <span>{generatingMessage}</span>
                  </div>
                ) : uploadedFile ? (
                  <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs bg-emerald-50/50 border border-[#bbf7d0] rounded-[10px] px-3.5 py-2.5 max-w-md shadow-xs">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="line-clamp-1">Extracción exitosa: <strong className="text-emerald-800">{uploadedFile.name}</strong></span>
                  </div>
                ) : missingFields.length > 0 ? (
                  <div className="text-[11px] text-amber-700 bg-amber-50/60 border border-amber-200/80 rounded-[8px] px-3.5 py-2.5 font-semibold flex items-center gap-1.5 max-w-md shadow-2xs">
                    <span>⚠️ Faltan {missingFields.length} datos para validar: <strong className="text-amber-800">{missingFields.join(', ')}</strong></span>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-750 bg-emerald-50/60 border border-emerald-200/80 rounded-[8px] px-3.5 py-2.5 font-semibold flex items-center gap-1.5 max-w-md shadow-2xs">
                    <span>✓ ¡Brief listo para validar! Todos los campos requeridos están completos.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  disabled={fileLoading || isGenerating}
                  className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-extrabold px-5 py-3.5 rounded-[10px] flex items-center gap-2 transition-all shadow-xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  <Upload className="w-4 h-4 text-zinc-400" />
                  Subir otro archivo
                </button>

                <button
                  type="button"
                  disabled={missingFields.length > 0}
                  onClick={() => {
                    if (!approvedModules.includes('brief')) {
                      setApprovedModules((prev) => [...prev, 'brief']);
                    }
                    setActiveModule('diagnostico');
                  }}
                  className={`font-extrabold px-6 py-3.5 rounded-[10px] flex items-center gap-2 transition-all shadow-xs active:scale-[0.98] text-xs ${
                    missingFields.length > 0
                      ? 'bg-zinc-100 border border-zinc-200 text-zinc-400 cursor-not-allowed'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                  }`}
                >
                  Validar Brief y pasar a Diagnóstico
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )

      case 'diagnostico':
        if (!brief.marca) {
          return (
            <div className="text-zinc-500 py-12 text-center text-xs space-y-3 bg-zinc-50 border border-zinc-200/80 rounded-[10px] p-5 shadow-2xs">
              <AlertCircle className="w-8 h-8 text-zinc-450 mx-auto" />
              <p>⚠️ Primero debes ingresar y validar el **Brief Maestro** en el Módulo 01 para habilitar el Diagnóstico Comercial.</p>
              <button 
                type="button"
                onClick={() => setActiveModule('brief')}
                className="bg-zinc-900 text-white font-extrabold px-4.5 py-2.5 rounded-[10px] text-xs uppercase"
              >
                Ir a Módulo 01
              </button>
            </div>
          )
        }

        return (
          <div className="space-y-5">
            {/* COMPONENTE COMPACTO IA INTEGRADO */}
            <IaSelectorCompact stage="diagnostico" isBriefMaestro={false} />
            
            {/* Brief Maestro aprobado */}
            <div className="border border-zinc-200/60 rounded-[8px] overflow-hidden bg-zinc-50/10">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-4 py-3 flex items-center justify-between text-zinc-650 hover:text-zinc-800 transition-colors text-xs font-bold uppercase tracking-wider bg-zinc-50/40 border-b border-zinc-150/80"
              >
                <span className="flex items-center gap-2 text-zinc-700">
                  🔍 Brief Maestro aprobado
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-[10px] font-bold border border-emerald-200/60 uppercase tracking-wider shadow-2xs">
                    Aprobado
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </div>
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 bg-white border-t border-zinc-150/80 space-y-5 text-xs text-zinc-750"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-b border-zinc-100 pb-4">
                      <div>
                        <span className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider block mb-0.5">Marca</span>
                        <span className="text-zinc-800 font-bold text-sm">{brief.marca}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider block mb-0.5">Producto / Servicio</span>
                        <span className="text-zinc-800 font-semibold">{brief.productoServicio}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider block mb-0.5">Precio o modalidad comercial</span>
                        <span className="text-zinc-800 font-semibold">{brief.precio || "No especificado"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-zinc-100 pb-4">
                      <div>
                        <span className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider block mb-1">Oferta principal</span>
                        <p className="text-zinc-800 font-medium bg-[#f8fafc]/60 p-2.5 rounded-[8px] border border-zinc-200/80 leading-relaxed">{brief.oferta}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider block mb-1">Público objetivo</span>
                        <p className="text-zinc-800 font-medium bg-[#f8fafc]/60 p-2.5 rounded-[8px] border border-zinc-200/80 leading-relaxed">{brief.publicoObjetivo}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-zinc-100 pb-4">
                      <div>
                        <span className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider block mb-1">Problema principal</span>
                        <p className="text-zinc-800 font-medium leading-relaxed bg-[#f8fafc]/40 p-2.5 rounded-[8px] border border-zinc-150">{brief.problemaPrincipal}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider block mb-1">Deseo principal</span>
                        <p className="text-zinc-800 font-medium leading-relaxed bg-[#f8fafc]/40 p-2.5 rounded-[8px] border border-zinc-150">{brief.deseoPrincipal}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-zinc-100 pb-4">
                      <div className="space-y-1.5">
                        <span className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider block mb-0.5">Beneficios</span>
                        <div className="flex flex-wrap gap-1.5">
                          {brief.beneficios?.map((b, i) => (
                            <span key={i} className="bg-zinc-50 text-zinc-700 px-2.5 py-1 rounded-[6px] text-[11px] font-semibold border border-zinc-200">
                              ✓ {b}
                            </span>
                          )) || <span className="text-zinc-400/80 italic">Ninguno</span>}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider block mb-0.5">Diferenciadores</span>
                        <div className="flex flex-wrap gap-1.5">
                          {brief.diferenciadores?.map((d, i) => (
                            <span key={i} className="bg-zinc-50 text-zinc-700 px-2.5 py-1 rounded-[6px] text-[11px] font-semibold border border-zinc-200">
                              ✦ {d}
                            </span>
                          )) || <span className="text-zinc-400/80 italic">Ninguno</span>}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider block">Canal de venta</span>
                        <span className="text-zinc-800 font-bold">{brief.canalVenta}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider block">Tono de comunicación</span>
                        <span className="text-zinc-800 font-bold">{brief.tono}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* VISTA PRINCIPAL: 5 CAMPOS ESTRATÉGICOS CLAVE */}
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 gap-4">
                
                {/* problemaCentral */}
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                      problemaCentral
                    </label>
                    <span className="text-[9px] text-zinc-400/70 italic">¿Cuál es el verdadero obstáculo a resolver?</span>
                  </div>
                  <textarea
                    value={diagnostico.problemaCentral}
                    placeholder="Describe el problema central del cliente ideal..."
                    onChange={(e) => setDiagnostico((prev) => ({ ...prev, problemaCentral: e.target.value }))}
                    rows={2}
                    className="w-full bg-[#f8fafc]/40 hover:bg-[#f8fafc]/80 border border-zinc-200 focus:border-zinc-450 focus:bg-white text-zinc-800 font-semibold rounded-[8px] px-3.5 py-2 text-xs outline-none transition-all duration-150 min-h-[46px] resize-none shadow-2xs leading-relaxed"
                  />
                </div>

                {/* deseoProfundo */}
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                      deseoProfundo
                    </label>
                    <span className="text-[9px] text-zinc-400/70 italic">El anhelo subyacente que moviliza la compra</span>
                  </div>
                  <textarea
                    value={diagnostico.deseoProfundo}
                    placeholder="Describe el deseo profundo del cliente ideal..."
                    onChange={(e) => setDiagnostico((prev) => ({ ...prev, deseoProfundo: e.target.value }))}
                    rows={2}
                    className="w-full bg-[#f8fafc]/40 hover:bg-[#f8fafc]/80 border border-zinc-200 focus:border-zinc-450 focus:bg-white text-zinc-800 font-semibold rounded-[8px] px-3.5 py-2 text-xs outline-none transition-all duration-150 min-h-[46px] resize-none shadow-2xs leading-relaxed"
                  />
                </div>

                {/* anguloEstrategico */}
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                      anguloEstrategico
                    </label>
                    <span className="text-[9px] text-zinc-400/70 italic">La perspectiva única desde donde atacaremos el problema</span>
                  </div>
                  <textarea
                    value={diagnostico.anguloEstrategico}
                    placeholder="Describe el ángulo estratégico de la campaña..."
                    onChange={(e) => setDiagnostico((prev) => ({ ...prev, anguloEstrategico: e.target.value }))}
                    rows={2}
                    className="w-full bg-[#f8fafc]/40 hover:bg-[#f8fafc]/80 border border-zinc-200 focus:border-zinc-450 focus:bg-white text-zinc-800 font-semibold rounded-[8px] px-3.5 py-2 text-xs outline-none transition-all duration-150 min-h-[46px] resize-none shadow-2xs leading-relaxed"
                  />
                </div>

                {/* oportunidadComunicacion */}
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                      oportunidadComunicacion
                    </label>
                    <span className="text-[9px] text-zinc-400/70 italic">Rutas de posicionamiento diferenciadas</span>
                  </div>
                  <textarea
                    value={diagnostico.oportunidadComunicacion}
                    placeholder="Describe las oportunidades de comunicación..."
                    onChange={(e) => setDiagnostico((prev) => ({ ...prev, oportunidadComunicacion: e.target.value }))}
                    rows={2}
                    className="w-full bg-[#f8fafc]/40 hover:bg-[#f8fafc]/80 border border-zinc-200 focus:border-zinc-450 focus:bg-white text-zinc-800 font-semibold rounded-[8px] px-3.5 py-2 text-xs outline-none transition-all duration-150 min-h-[46px] resize-none shadow-2xs leading-relaxed"
                  />
                </div>

                {/* riesgoVenderDemasiadoPronto */}
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                      riesgoVenderDemasiadoPronto
                    </label>
                    <span className="text-[9px] text-zinc-400/70 italic">Peligros de empujar la oferta antes de educar</span>
                  </div>
                  <textarea
                    value={diagnostico.riesgoPrincipal}
                    placeholder="Describe el riesgo de una venta prematura sin educación..."
                    onChange={(e) => setDiagnostico((prev) => ({ ...prev, riesgoPrincipal: e.target.value }))}
                    rows={2}
                    className="w-full bg-[#f8fafc]/40 hover:bg-[#f8fafc]/80 border border-zinc-200 focus:border-zinc-450 focus:bg-white text-zinc-800 font-semibold rounded-[8px] px-3.5 py-2 text-xs outline-none transition-all duration-150 min-h-[46px] resize-none shadow-2xs leading-relaxed"
                  />
                </div>

              </div>
            </div>

            {/* ACORDEÓN 1: DETALLES ESTRATÉGICOS */}
            <div className="border border-zinc-200/80 rounded-[8px] overflow-hidden bg-zinc-50/10">
              <button
                type="button"
                onClick={() => setShowDiagAccordion1(!showDiagAccordion1)}
                className="w-full px-4 py-3 flex items-center justify-between text-zinc-650 hover:text-zinc-800 transition-colors text-xs font-bold uppercase tracking-wider bg-zinc-50/30 border-b border-zinc-150/80"
              >
                <span className="flex items-center gap-2 text-zinc-700">
                  📁 Detalles estratégicos
                </span>
                {showDiagAccordion1 ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </button>

              <AnimatePresence>
                {showDiagAccordion1 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="p-4 space-y-4 border-t border-zinc-150 bg-white text-xs text-zinc-700"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* doloresPrincipales */}
                      <div className="space-y-1.5 p-3.5 bg-zinc-50/40 border border-zinc-200/60 rounded-[8px]">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-zinc-400/90 uppercase tracking-widest block">doloresPrincipales</label>
                          <span className="text-[9px] text-zinc-400/80 font-bold bg-zinc-100 px-2 py-0.5 rounded-[4px]">{diagnostico.doloresPrincipales?.length || 0} ítems</span>
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={newDolor}
                            placeholder="Añadir dolor del avatar..."
                            onChange={(e) => setNewDolor(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newDolor.trim()) { setDiagnostico(prev => ({ ...prev, doloresPrincipales: [...(prev.doloresPrincipales || []), newDolor.trim()] })); setNewDolor(''); } } }}
                            className="flex-1 bg-white border border-zinc-200 rounded-[6px] px-2.5 py-1.5 text-xs text-zinc-800 outline-none focus:border-zinc-400 shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => { if (newDolor.trim()) { setDiagnostico(prev => ({ ...prev, doloresPrincipales: [...(prev.doloresPrincipales || []), newDolor.trim()] })); setNewDolor(''); } }}
                            className="bg-zinc-900 text-white px-3 py-1.5 rounded-[6px] text-[10px] font-bold shrink-0 hover:bg-zinc-800 transition active:scale-[0.97]"
                          >
                            Añadir
                          </button>
                        </div>
                        <div className="flex flex-col gap-1 mt-1 max-h-[150px] overflow-y-auto pr-1">
                          {diagnostico.doloresPrincipales?.map((d, i) => (
                            <div key={i} className="flex items-start justify-between bg-white p-2 rounded-[6px] border border-zinc-200/85 text-[11px] text-zinc-700 shadow-3xs leading-relaxed">
                              <span>{d}</span>
                              <button type="button" onClick={() => setDiagnostico(prev => ({ ...prev, doloresPrincipales: prev.doloresPrincipales.filter((_, idx) => idx !== i) }))} className="text-zinc-400 hover:text-red-500 font-bold ml-2 shrink-0">×</button>
                            </div>
                          ))}
                          {(!diagnostico.doloresPrincipales || diagnostico.doloresPrincipales.length === 0) && <span className="text-[10px] text-zinc-400 italic">No hay dolores estratégicos mapeados.</span>}
                        </div>
                      </div>

                      {/* objecionesComerciales */}
                      <div className="space-y-1.5 p-3.5 bg-zinc-50/40 border border-zinc-200/60 rounded-[8px]">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-zinc-400/90 uppercase tracking-widest block">objecionesComerciales</label>
                          <span className="text-[9px] text-zinc-400/80 font-bold bg-zinc-100 px-2 py-0.5 rounded-[4px]">{diagnostico.objecionesComerciales?.length || 0} ítems</span>
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={newObjecionComercial}
                            placeholder="Añadir objeción..."
                            onChange={(e) => setNewObjecionComercial(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newObjecionComercial.trim()) { setDiagnostico(prev => ({ ...prev, objecionesComerciales: [...(prev.objecionesComerciales || []), newObjecionComercial.trim()] })); setNewObjecionComercial(''); } } }}
                            className="flex-1 bg-white border border-zinc-200 rounded-[6px] px-2.5 py-1.5 text-xs text-zinc-800 outline-none focus:border-zinc-400 shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => { if (newObjecionComercial.trim()) { setDiagnostico(prev => ({ ...prev, objecionesComerciales: [...(prev.objecionesComerciales || []), newObjecionComercial.trim()] })); setNewObjecionComercial(''); } }}
                            className="bg-zinc-900 text-white px-3 py-1.5 rounded-[6px] text-[10px] font-bold shrink-0 hover:bg-zinc-800 transition active:scale-[0.97]"
                          >
                            Añadir
                          </button>
                        </div>
                        <div className="flex flex-col gap-1 mt-1 max-h-[150px] overflow-y-auto pr-1">
                          {diagnostico.objecionesComerciales?.map((o, i) => (
                            <div key={i} className="flex items-start justify-between bg-white p-2 rounded-[6px] border border-zinc-200/85 text-[11px] text-zinc-700 shadow-3xs leading-relaxed">
                              <span>{o}</span>
                              <button type="button" onClick={() => setDiagnostico(prev => ({ ...prev, objecionesComerciales: prev.objecionesComerciales.filter((_, idx) => idx !== i) }))} className="text-zinc-400 hover:text-red-500 font-bold ml-2 shrink-0">×</button>
                            </div>
                          ))}
                          {(!diagnostico.objecionesComerciales || diagnostico.objecionesComerciales.length === 0) && <span className="text-[10px] text-zinc-400 italic">No hay objeciones registradas.</span>}
                        </div>
                      </div>

                      {/* mensajesAEvitar */}
                      <div className="space-y-1.5 p-3.5 bg-zinc-50/40 border border-zinc-200/60 rounded-[8px]">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-zinc-400/90 uppercase tracking-widest block">mensajesAEvitar</label>
                          <span className="text-[9px] text-zinc-400/80 font-bold bg-zinc-100 px-2 py-0.5 rounded-[4px]">{diagnostico.mensajesAEvitar?.length || 0} ítems</span>
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={newMensajeEvitar}
                            placeholder="Añadir restricción..."
                            onChange={(e) => setNewMensajeEvitar(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newMensajeEvitar.trim()) { setDiagnostico(prev => ({ ...prev, mensajesAEvitar: [...(prev.mensajesAEvitar || []), newMensajeEvitar.trim()] })); setNewMensajeEvitar(''); } } }}
                            className="flex-1 bg-white border border-zinc-200 rounded-[6px] px-2.5 py-1.5 text-xs text-zinc-800 outline-none focus:border-zinc-400 shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => { if (newMensajeEvitar.trim()) { setDiagnostico(prev => ({ ...prev, mensajesAEvitar: [...(prev.mensajesAEvitar || []), newMensajeEvitar.trim()] })); setNewMensajeEvitar(''); } }}
                            className="bg-zinc-900 text-white px-3 py-1.5 rounded-[6px] text-[10px] font-bold shrink-0 hover:bg-zinc-800 transition active:scale-[0.97]"
                          >
                            Añadir
                          </button>
                        </div>
                        <div className="flex flex-col gap-1 mt-1 max-h-[150px] overflow-y-auto pr-1">
                          {diagnostico.mensajesAEvitar?.map((m, i) => (
                            <div key={i} className="flex items-start justify-between bg-white p-2 rounded-[6px] border border-zinc-200/85 text-[11px] text-zinc-700 shadow-3xs leading-relaxed">
                              <span>{m}</span>
                              <button type="button" onClick={() => setDiagnostico(prev => ({ ...prev, mensajesAEvitar: prev.mensajesAEvitar.filter((_, idx) => idx !== i) }))} className="text-zinc-400 hover:text-red-500 font-bold ml-2 shrink-0">×</button>
                            </div>
                          ))}
                          {(!diagnostico.mensajesAEvitar || diagnostico.mensajesAEvitar.length === 0) && <span className="text-[10px] text-zinc-400 italic">No hay restricciones añadidas.</span>}
                        </div>
                      </div>

                      {/* datosRequierenValidacion */}
                      <div className="space-y-1.5 p-3.5 bg-zinc-50/40 border border-zinc-200/60 rounded-[8px]">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-zinc-400/90 uppercase tracking-widest block">datosRequierenValidacion</label>
                          <span className="text-[9px] text-zinc-400/80 font-bold bg-zinc-100 px-2 py-0.5 rounded-[4px]">{diagnostico.datosRequierenValidacion?.length || 0} sugerencias</span>
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={newValidacionSugerida}
                            placeholder="Añadir parámetro a corroborar..."
                            onChange={(e) => setNewValidacionSugerida(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newValidacionSugerida.trim()) { setDiagnostico(prev => ({ ...prev, datosRequierenValidacion: [...(prev.datosRequierenValidacion || []), newValidacionSugerida.trim()] })); setNewValidacionSugerida(''); } } }}
                            className="flex-1 bg-white border border-zinc-200 rounded-[6px] px-2.5 py-1.5 text-xs text-zinc-800 outline-none focus:border-zinc-400 shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => { if (newValidacionSugerida.trim()) { setDiagnostico(prev => ({ ...prev, datosRequierenValidacion: [...(prev.datosRequierenValidacion || []), newValidacionSugerida.trim()] })); setNewValidacionSugerida(''); } }}
                            className="bg-zinc-900 text-white px-3 py-1.5 rounded-[6px] text-[10px] font-bold shrink-0 hover:bg-zinc-800 transition active:scale-[0.97]"
                          >
                            Añadir
                          </button>
                        </div>
                        <div className="flex flex-col gap-1 mt-1 max-h-[150px] overflow-y-auto pr-1">
                          {diagnostico.datosRequierenValidacion?.map((v, i) => (
                            <div key={i} className="flex items-start justify-between bg-white p-2 rounded-[6px] border border-zinc-200/85 text-[11px] text-zinc-700 shadow-3xs leading-relaxed">
                              <span>{v}</span>
                              <button type="button" onClick={() => setDiagnostico(prev => ({ ...prev, datosRequierenValidacion: prev.datosRequierenValidacion.filter((_, idx) => idx !== i) }))} className="text-zinc-400 hover:text-red-550 font-bold ml-2 shrink-0">×</button>
                            </div>
                          ))}
                          {(!diagnostico.datosRequierenValidacion || diagnostico.datosRequierenValidacion.length === 0) && <span className="text-[10px] text-zinc-455 font-bold italic">✓ Todo en orden. No hay parámetros marcados con validación requerida.</span>}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ACORDEÓN 2: COORDENADAS PARA INVESTIGACIÓN */}
            <div className="border border-zinc-200/80 rounded-[8px] overflow-hidden bg-zinc-50/10">
              <button
                type="button"
                onClick={() => setShowDiagAccordion2(!showDiagAccordion2)}
                className="w-full px-4 py-3 flex items-center justify-between text-zinc-650 hover:text-zinc-800 transition-colors text-xs font-bold uppercase tracking-wider bg-zinc-50/30 border-b border-zinc-150/80"
              >
                <span className="flex items-center gap-2 text-zinc-700">
                  📁 Coordenadas para investigación
                </span>
                {showDiagAccordion2 ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </button>

              <AnimatePresence>
                {showDiagAccordion2 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="p-4 space-y-4 border-t border-zinc-150 bg-white text-xs"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* categoriaMercado */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">categoriaMercado</label>
                        <input
                          type="text"
                          value={diagnostico.categoriaMercado || ''}
                          placeholder="Ej. Software de gestión de contenidos..."
                          onChange={(e) => setDiagnostico((prev) => ({ ...prev, categoriaMercado: e.target.value }))}
                          className="w-full bg-[#f8fafc]/40 hover:bg-[#f8fafc]/80 border border-zinc-200 focus:border-zinc-450 focus:bg-white text-zinc-850 font-semibold rounded-[6px] px-2.5 py-1.5 text-xs outline-none transition-all shadow-3xs"
                        />
                      </div>

                      {/* problemaSocialOperativo */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">problemaSocialOperativo</label>
                        <textarea
                          value={diagnostico.problemaSocialOperativo || ''}
                          placeholder="Ej. El caos y la fatiga mental por dispersión de herramientas..."
                          onChange={(e) => setDiagnostico((prev) => ({ ...prev, problemaSocialOperativo: e.target.value }))}
                          rows={2}
                          className="w-full bg-[#f8fafc]/40 hover:bg-[#f8fafc]/80 border border-zinc-200 focus:border-zinc-450 focus:bg-white text-zinc-855 font-semibold rounded-[6px] px-2.5 py-1.5 text-xs outline-none transition-all resize-none min-h-[48px] leading-relaxed shadow-3xs"
                        />
                      </div>

                      {/* herramientasTendenciasSugeridas */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">herramientasTendenciasSugeridas</label>
                        <input
                          type="text"
                          value={diagnostico.herramientasTendenciasSugeridas || ''}
                          placeholder="Ej. Notion templates, automatización, IA asíncrona..."
                          onChange={(e) => setDiagnostico((prev) => ({ ...prev, herramientasTendenciasSugeridas: e.target.value }))}
                          className="w-full bg-[#f8fafc]/40 hover:bg-[#f8fafc]/80 border border-zinc-200 focus:border-zinc-450 focus:bg-white text-zinc-850 font-semibold rounded-[6px] px-2.5 py-1.5 text-xs outline-none transition-all shadow-3xs"
                        />
                      </div>

                      {/* oportunidadPosicionamiento */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">oportunidadPosicionamiento</label>
                        <textarea
                          value={diagnostico.oportunidadPosicionamiento || ''}
                          placeholder="Ej. Único sistema que une la estrategia creativa con la ejecución diaria..."
                          onChange={(e) => setDiagnostico((prev) => ({ ...prev, oportunidadPosicionamiento: e.target.value }))}
                          rows={2}
                          className="w-full bg-[#f8fafc]/40 hover:bg-[#f8fafc]/80 border border-zinc-200 focus:border-zinc-450 focus:bg-white text-zinc-850 font-semibold rounded-[6px] px-2.5 py-1.5 text-xs outline-none transition-all resize-none min-h-[48px] leading-relaxed shadow-3xs"
                        />
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ACCIONES Y BOTONES DE NAVEGACIÓN */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 border-t border-zinc-150 mt-6">
              <div className="grow">
                {missingDiagFields.length > 0 ? (
                  <div className="text-[11px] text-amber-700 bg-amber-50/50 border border-amber-200/60 rounded-[8px] px-3.5 py-2 font-bold flex items-center gap-1.5 max-w-xs shadow-3xs">
                    <span>⚠️ Faltan {missingDiagFields.length} campos estratégicos para aprobar.</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-700 bg-emerald-50/50 border border-emerald-250 rounded-[8px] px-3.5 py-2 font-bold flex items-center gap-1.5 max-w-xs shadow-3xs">
                    <span>✓ Diagnóstico listo para aprobar.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModule('brief')}
                  className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-extrabold px-5 py-3.5 rounded-[10px] transition text-xs shadow-xs"
                >
                  Ajustar Brief Maestro
                </button>

                <button
                  type="button"
                  disabled={missingDiagFields.length > 0}
                  onClick={() => {
                    if (!approvedModules.includes('diagnostico')) {
                      setApprovedModules((prev) => [...prev, 'diagnostico']);
                    }
                    
                    // Sincronizar campaignData
                    setCampaignData((prev) => ({
                      ...prev,
                      diagnostico: {
                        problemaCentral: diagnostico.problemaCentral,
                        dolores: diagnostico.doloresPrincipales,
                        deseoProfundo: diagnostico.deseoProfundo,
                        objeciones: diagnostico.objecionesComerciales,
                        nivelConciencia: diagnostico.nivelConciencia || 'Consciente del Problema',
                        temperaturaCampaña: diagnostico.temperaturaCampaña || 'MOFU tibio',
                        oportunidadComunicacion: diagnostico.oportunidadComunicacion,
                        riesgoPrincipal: diagnostico.riesgoPrincipal,
                        anguloEstrategico: diagnostico.anguloEstrategico,
                        enfoqueContenidoOrganico: diagnostico.enfoqueContenidoOrganico || '',
                        mensajesAEvitar: diagnostico.mensajesAEvitar,
                        datosRequierenValidacion: diagnostico.datosRequierenValidacion,
                        categoriaMercado: diagnostico.categoriaMercado,
                        problemaSocialOperativo: diagnostico.problemaSocialOperativo,
                        herramientasTendenciasSugeridas: diagnostico.herramientasTendenciasSugeridas,
                        oportunidadPosicionamiento: diagnostico.oportunidadPosicionamiento
                      },
                      organico: prev?.organico || [
                        { pilar: 'Educativo', hook: `¿Sabías que el principal obstáculo en ${brief.productoServicio} es que ${brief.problemaPrincipal}?`, desc: `Análisis detallado de cómo este problema frena el crecimiento y cómo resolverlo de raíz.`, cta: 'Comenta "ESTRATEGIA" para enviarte una guía práctica paso a paso.' },
                        { pilar: 'Dolor', hook: `El error silencioso de intentar conseguir ${brief.deseoPrincipal} sin antes resolver el problema de raíz.`, desc: 'Comparación del método tradicional e ineficiente frente a un enfoque centrado en la solución.', cta: `Síguenos para más consejos prácticos sobre ${brief.marca}.` },
                        { pilar: 'Autoridad', hook: `Cómo diseñamos la propuesta de ${brief.oferta} para solucionar este dolor de forma definitiva.`, desc: 'Caso de estudio corto aplicando nuestra metodología probada paso a paso.', cta: 'Comparte esta publicación con alguien que necesite resolver este problema.' },
                        { pilar: 'Confianza', hook: `¿Por qué tu público no conecta con tu propuesta? (Y la fórmula exacta para cambiarlo)`, desc: `Desglose paso a paso de una secuencia orientada a conseguir ${brief.deseoPrincipal} de forma simple y predecible.`, cta: 'Guarda esta publicación para usarla hoy mismo.' }
                      ],
                      assets: prev?.assets || [
                        {
                          id: 1,
                          etapa: 'atraccion',
                          formato: 'carrusel',
                          idea: `Carrusel interactivo: Los 3 errores mortales al intentar solucionar que: ${brief.problemaPrincipal}.`,
                          promptVisual: 'Diseño de alto impacto estilo editorial, tipografía Outfit gigante, fondo gris claro con acentos modernos, capturas de pantalla conceptuales.',
                          subproblema: 'Falta de Enfoque Estratégico',
                          copies: {
                            profesional: `Para lanzar con éxito ${brief.marca}, el verdadero secreto radica en diagnosticar y resolver el dolor real de tu cliente.\n\nAquí te mostramos los 3 errores de comunicación que te impiden solucionar este obstáculo hoy mismo.\n\nGuarda este carrusel and compártelo con tu equipo.`,
                            intermedia: `¿Sientes que trabajas el doble y no logras tus objetivos?\n\nMuchos cometen el error de no ver que ${brief.problemaPrincipal}. En esta guía te enseñamos a explicar tu oferta de ${brief.oferta} de forma irresistible.\n\n¿Quieres el método completo? Déjanos un comentario.`,
                            agresivo: `¡Deja de perder clientes y escala tu marca hoy mismo!\n\nConsigue la solución completa de ${brief.marca} con un beneficio exclusivo por lanzamiento.\n\nAccede de inmediato por solo ${brief.precio} haciendo clic en el enlace de abajo.`
                          }
                        }
                      ],
                      whatsapp: prev?.whatsapp || {
                        mensajeBienvenida: `¡Hola! Bienvenido a ${brief.marca}. Qué gusto que nos contactes para conocer más sobre ${brief.productoServicio}.`,
                        preguntasDiagnostico: [
                          `¿Qué herramientas o métodos has intentado antes para resolver esto?`,
                          `¿Qué te impide automatizar y estructurar tu flujo de trabajo actualmente?`
                        ],
                        presentacionSolucion: `La propuesta de ${brief.oferta} está específicamente diseñada para resolver ${brief.problemaPrincipal}.`,
                        respuestasObjeciones: {
                          precio: `Entiendo que el precio de ${brief.precio} sea un factor a considerar. Sin embargo, si logras solucionar este obstáculo, la herramienta se pagará sola.`,
                          dudaTecnica: `La instalación se realiza en solo 5 minutos mediante una interfaz limpia y te incluimos un tutorial paso a paso.`
                        },
                        ctaConversacion: `Perfecto. Si estás listo para avanzar y lograr ${brief.deseoPrincipal}, el siguiente paso es realizar el checkout.`,
                        secuenciaSeguimiento: [
                          `Hola, ¿lograste revisar los detalles que te envié ayer? Cuéntame si tienes alguna duda.`,
                          `Hola. Recuerda que la oferta especial de ${brief.precio} expira pronto. ¿Qué te hace falta para dar el paso?`
                        ],
                        recuperacionLeads: `Entiendo que no sea el momento ideal. Te comparto un recurso gratuito de cortesía y las puertas quedan abiertas para cuando gustes iniciar.`
                      }
                    }));

                    setActiveModule('organico'); // Moves to 03A Investigación y Tendencias
                  }}
                  className={`font-extrabold px-6 py-3.5 rounded-[10px] flex items-center gap-2 transition-all shadow-xs active:scale-[0.98] text-xs ${
                    missingDiagFields.length > 0
                      ? 'bg-zinc-100 border border-zinc-200 text-zinc-400 cursor-not-allowed'
                      : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                  }`}
                >
                  Aprobar Diagnóstico y pasar a Investigación
                  <Check className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>

          </div>
        )

      case 'organico':
        if (!brief.marca || brief.marca === 'Pendiente') {
          return <div className="text-zinc-400 py-10 text-center text-xs">Completa y aprueba el Módulo 01 Brief Maestro para habilitar la Investigación de Tendencias.</div>
        }
        return (
          <div className="space-y-6">
            {/* COMPONENTE COMPACTO IA INTEGRADO */}
            <IaSelectorCompact stage="contenidoOrganico" isBriefMaestro={false} />
            {/* Sub-navegación del Módulo 03 */}
            <div className="flex border-b border-zinc-200/80 mb-2 bg-[#f8fafc]/50 p-1 rounded-[8px] gap-1">
              <button
                onClick={() => setOrganicSubTab('research')}
                className={`flex-1 py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-[6px] transition flex items-center justify-center gap-1.5 ${
                  organicSubTab === 'research' 
                    ? 'bg-zinc-900 text-white shadow-xs' 
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/50'
                }`}
              >
                🔍 03A · Investigación y Tendencias
              </button>
              <button
                onClick={() => setOrganicSubTab('generator')}
                className={`flex-1 py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-[6px] transition flex items-center justify-center gap-1.5 ${
                  organicSubTab === 'generator' 
                    ? 'bg-zinc-900 text-white shadow-xs' 
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/50'
                }`}
              >
                ✍️ 03B · Generador de Contenido
              </button>
            </div>

            {organicSubTab === 'research' ? (
              <OrganicResearchPanel
                opportunities={opportunities}
                onGenerate={handleRunOrganicResearch}
                onUpdate={handleRunOrganicResearch}
                onImprove={handleImproveOrganicOpportunity}
                onSelectOpportunity={(id) => {
                  setSelectedOpportunityId(id)
                  setOpportunities(prev => prev.map(o => ({
                    ...o,
                    estado: o.id === id ? 'seleccionada' : 'pendiente'
                  })))
                  setTimeout(() => {
                    setOrganicSubTab('generator')
                  }, 400)
                }}
                selectedOpportunityId={selectedOpportunityId}
                isGenerating={isGeneratingOrganic}
              />
            ) : (
              <OrganicContentGenerator
                selectedOpportunity={opportunities.find(o => o.id === selectedOpportunityId)}
                onGeneratePiece={handleGenerateOrganicPiece}
                approvedPieces={organicApprovedPieces}
                onApprovePiece={(newPiece) => {
                  setOrganicApprovedPieces(prev => [...prev, newPiece])
                }}
                onDiscardPiece={(id) => {
                  setOrganicApprovedPieces(prev => prev.filter(p => p.id !== id))
                }}
                isGenerating={isGeneratingOrganic}
                onFinishModule={() => {
                  if (!approvedModules.includes('organico')) {
                    setApprovedModules(prev => [...prev, 'organico'])
                  }
                  setActiveModule('embudo') // Passes to 04 Funnel
                }}
              />
            )}
          </div>
        )

      case 'embudo':
        if (!campaignData) return <div className="text-zinc-400 py-10 text-center text-xs">Completa el Módulo 01 para ver la estructura del embudo.</div>
        return (
          <div className="space-y-5">
            {/* COMPONENTE COMPACTO IA INTEGRADO */}
            <IaSelectorCompact stage="embudo" isBriefMaestro={false} />
            <div className="space-y-3">
              {[
                { etapa: 'Atracción (TOFU)', agresividad: '0%', color: 'bg-blue-500', desc: 'Foco en síntomas, problemas cotidianos del sector y valor educativo gratuito. Queda prohibido vender.' },
                { etapa: 'Consideración (MOFU Suave)', agresividad: '30%', color: 'bg-emerald-500', desc: 'Comparación de metodologías, explicación de soluciones y estructuración de autoridad.' },
                { etapa: 'Conversión (BOFU)', agresividad: '80%', color: 'bg-yellow-500', desc: 'Presentación de la oferta comercial, detalles del servicio, precio y bonus por lanzamiento.' },
                { etapa: 'Cierre & Venta (Directo)', agresividad: '100%', color: 'bg-orange-500', desc: 'Llamados directos a la acción comercial, escasez real de cupos, garantías y links de checkout.' },
                { etapa: 'Seguimiento & Reactivación', agresividad: '100%', color: 'bg-red-500', desc: 'Mensajes de recordatorio corteses, ofertas de recuperación de leads y testimonios de éxito.' }
              ].map((et, idx) => (
                <div key={idx} className="bg-zinc-50/40 border border-zinc-200/60 rounded-[10px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 md:max-w-xl">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${et.color}`}></div>
                      <h4 className="text-zinc-950 text-xs font-bold uppercase tracking-wider">{et.etapa}</h4>
                    </div>
                    <p className="text-zinc-500 text-xs leading-relaxed">{et.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Agresividad:</span>
                    <span className="text-xs font-black text-zinc-800 bg-white border border-zinc-200 px-3 py-1 rounded-[10px] shadow-xs">{et.agresividad}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => triggerIaProcessing('embudo')}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold px-6 py-3.5 rounded-[10px] flex items-center gap-2 transition shadow-xs"
              >
                Aprobar Estructura de Embudo
                <Check className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        )

      case 'copies':
        if (!campaignData) return <div className="text-zinc-400 py-10 text-center text-xs">Completa el Módulo 01 para redactar los copies.</div>
        
        const currentAsset = campaignData.assets[selectedAssetIndex]
        
        return (
          <div className="space-y-5">
            {/* COMPONENTE COMPACTO IA INTEGRADO */}
            <IaSelectorCompact stage="copies" isBriefMaestro={false} />
            <div className="grid lg:grid-cols-[280px_1fr] gap-5">
              {/* Columna Izquierda: Listado de Assets */}
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-1">Biblioteca de Assets</p>
                {campaignData.assets.map((as, idx) => (
                  <button
                    key={as.id}
                    onClick={() => setSelectedAssetIndex(idx)}
                    className={`w-full text-left rounded-[10px] p-3 border.5 transition ${
                      selectedAssetIndex === idx
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                        : 'bg-zinc-50/50 border-zinc-200 text-zinc-700 hover:bg-zinc-100/50'
                    }`}
                  >
                    <span className="flex items-center justify-between text-[8px] font-extrabold uppercase tracking-widest mb-1 text-zinc-400">
                      <span>{as.etapa}</span>
                      <span>{as.formato}</span>
                    </span>
                    <h4 className="text-[11px] font-bold leading-relaxed line-clamp-2">{as.idea}</h4>
                  </button>
                ))}
              </div>

              {/* Columna Derecha: Detalles, Variantes y Prompt */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-[10px] p-5 space-y-4">
                <div>
                  <span className="text-[9px] text-zinc-800 bg-white border border-zinc-200 px-2 py-0.5 rounded-[10px] font-extrabold uppercase tracking-widest shadow-xs">
                    Formato: {currentAsset.formato}
                  </span>
                  <h3 className="text-zinc-950 text-base font-extrabold mt-2 leading-snug">{currentAsset.idea}</h3>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Especificaciones e Idea Visual</h4>
                  <p className="text-zinc-600 text-xs leading-relaxed bg-white border border-zinc-200 rounded-[10px] p-4 shadow-xs">
                    {currentAsset.promptVisual}
                  </p>
                </div>

                {/* Pestañas de Tono */}
                <div className="space-y-3">
                  <div className="flex border-b border-zinc-200 pb-1">
                    {[
                      { key: 'profesional', label: 'Tono Profesional', desc: 'Autoridad / Valor' },
                      { key: 'intermedia', label: 'Tono Intermedio', desc: 'Problema / Beneficios' },
                      { key: 'agresiva', label: 'Tono Agresivo', desc: 'Escasez / Cierre' }
                    ].map((tone) => (
                      <button
                        key={tone.key}
                        onClick={() => setSelectedCopyTone(tone.key)}
                        className={`flex-1 text-center pb-2 transition text-xs font-bold border-b-2 ${
                          selectedCopyTone === tone.key
                            ? 'border-zinc-850 text-zinc-950'
                            : 'border-transparent text-zinc-400 hover:text-zinc-600'
                        }`}
                      >
                        <div>{tone.label}</div>
                        <span className="text-[8px] text-zinc-400 block font-normal">{tone.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Editor en Vivo */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Texto Redactado</span>
                      <button
                        onClick={() => handleCopyText(currentAsset.copies[selectedCopyTone])}
                        className="text-xs font-bold text-zinc-800 hover:text-zinc-600 flex items-center gap-1.5"
                      >
                        Copiar <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <textarea
                      value={currentAsset.copies[selectedCopyTone]}
                      onChange={(e) => {
                        const updated = { ...campaignData }
                        updated.assets[selectedAssetIndex].copies[selectedCopyTone] = e.target.value
                        setCampaignData(updated)
                      }}
                      className="w-full bg-white border border-zinc-200 rounded-[10px] p-4 text-xs text-zinc-700 leading-relaxed font-sans min-h-[140px] focus:outline-none focus:border-zinc-400 shadow-xs"
                    />

                    <div className="bg-white border border-zinc-200 rounded-[10px] p-3 flex items-center justify-between shadow-xs">
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest block">Llamado a la Acción (CTA)</span>
                        <span className="text-xs text-zinc-800 font-bold">{currentAsset.cta[selectedCopyTone]}</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                        Enfoque: {currentAsset.subproblema}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => triggerIaProcessing('copies')}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold px-6 py-3.5 rounded-[10px] flex items-center gap-2 transition shadow-xs"
              >
                Aprobar Assets & Copies
                <Check className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        )

      case 'whatsapp':
        if (!campaignData) return <div className="text-zinc-400 py-10 text-center text-xs">Completa el Módulo 01 para ver el protocolo de WhatsApp.</div>
        
        const wa = campaignData.whatsapp
        const waSteps = [
          { label: '01 · Mensaje de Bienvenida', text: wa.mensajeBienvenida },
          { label: '02 · Pregunta Diagnóstico 1', text: wa.preguntasDiagnostico[0] },
          { label: '03 · Pregunta Diagnóstico 2', text: wa.preguntasDiagnostico[1] },
          { label: '04 · Presentación de Solución', text: wa.presentacionSolucion },
          { label: '05 · Objeción de Precio', text: wa.respuestasObjeciones.precio },
          { label: '06 · Objeción Técnica', text: wa.respuestasObjeciones.dudaTecnica },
          { label: '07 · Llamado de Cierre', text: wa.ctaConversacion },
          { label: '08 · Seguimiento 24h', text: wa.secuenciaSeguimiento[0] },
          { label: '09 · Seguimiento 48h', text: wa.secuenciaSeguimiento[1] },
          { label: '10 · Mensaje Recuperación', text: wa.recuperacionLeads }
        ]

        return (
          <div className="space-y-5">
            {/* COMPONENTE COMPACTO IA INTEGRADO */}
            <IaSelectorCompact stage="whatsapp" isBriefMaestro={false} />
            <div className="grid lg:grid-cols-[1fr_360px] gap-5">
              {/* Columna Izquierda: Selección del Flujo */}
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-1">Protocolo Comercial en 10 Pasos</p>
                <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                  {waSteps.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedWaStep(idx)}
                      className={`w-full text-left rounded-[10px] p-3 border transition ${
                        selectedWaStep === idx
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                          : 'bg-zinc-50/50 border-zinc-200 text-zinc-700 hover:bg-zinc-100/50'
                      }`}
                    >
                      <h4 className="text-xs font-bold">{step.label}</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1">{step.text}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Columna Derecha: Simulador de WhatsApp Light Realista */}
              <div className="bg-[#efeae2] border border-zinc-200 rounded-[10px] p-4 flex flex-col h-[500px] shadow-xs relative overflow-hidden">
                {/* Textura de fondo sutil simulada */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/gray-lines.png')] opacity-[0.04] pointer-events-none"></div>

                {/* Cabecera del chat */}
                <div className="border-b border-zinc-300 pb-3 flex items-center gap-3 relative z-10">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white uppercase text-xs">
                    {brief.marca.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-800">{brief.marca} · Soporte</h4>
                    <span className="text-[9px] text-emerald-600 block font-medium">En línea</span>
                  </div>
                </div>

                {/* Pantalla de mensajes */}
                <div className="flex-1 py-4 overflow-y-auto space-y-3 pr-1 custom-scrollbar relative z-10">
                  <div className="flex justify-start">
                    <div className="bg-white border border-zinc-150 rounded-[10px] rounded-tl-none p-3 max-w-[85%] shadow-xs">
                      <p className="text-xs text-zinc-850 leading-relaxed">Hola, me interesa conocer más detalles sobre el producto.</p>
                      <span className="text-[9px] text-zinc-400 block text-right mt-1">10:30 AM</span>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedWaStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-end"
                    >
                      <div className="bg-[#d9fdd3] border border-[#c5eebf] rounded-[10px] rounded-tr-none p-3 max-w-[85%] shadow-xs">
                        <p className="text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap">{waSteps[selectedWaStep].text}</p>
                        <span className="text-[9px] text-emerald-600 block text-right mt-1">10:31 AM</span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Caja de enviar simulada */}
                <div className="border-t border-zinc-300 pt-3 flex items-center justify-between gap-3 relative z-10">
                  <div className="flex-1 bg-white border border-zinc-200 rounded-[10px] px-3 py-2.5 text-xs text-zinc-400">
                    Escribe un mensaje...
                  </div>
                  <button
                    onClick={() => handleCopyText(waSteps[selectedWaStep].text)}
                    className="bg-[#005c4b] hover:bg-[#004d3e] p-2.5 rounded-[10px] text-white transition shadow-xs"
                    title="Copiar mensaje"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => triggerIaProcessing('whatsapp')}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold px-6 py-3.5 rounded-[10px] flex items-center gap-2 transition shadow-xs"
              >
                Aprobar Flujo de WhatsApp
                <Check className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        )

      case 'checklist':
        if (!campaignData) return <div className="text-zinc-400 py-10 text-center text-xs">Completa el Módulo 01 para ver el checklist final.</div>
        
        const isCampaignReady = approvedModules.length >= 6

        return (
          <div className="space-y-5">
            <div className="bg-zinc-50 border border-zinc-200 rounded-[10px] p-5 space-y-3">
              <span className="text-[9px] bg-zinc-900 text-white px-2 py-0.5 rounded font-extrabold uppercase tracking-widest">Auditoría Pre-Lanzamiento</span>
              <h3 className="text-zinc-900 text-base font-extrabold leading-snug">Checklist de Calidad Comercial</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Verifica que todas las etapas indispensables estén validadas para garantizar la continuidad estratégica de tu campaña.
              </p>
            </div>

            <div className="bg-zinc-50/40 border border-zinc-200 rounded-[10px] p-4 space-y-3">
              {modules.slice(0, 6).map((m, idx) => {
                const isApproved = approvedModules.includes(m.id)
                return (
                  <div key={m.id} className="flex items-center justify-between border-b border-zinc-100 pb-3 last:border-none last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isApproved ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-800">{m.label}</h4>
                        <p className="text-[9px] text-zinc-400 mt-0.5">{m.desc}</p>
                      </div>
                    </div>
                    <div>
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-[10px]">
                          Cerrado <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 font-bold uppercase tracking-wider bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-[10px]">
                          Pendiente <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-[10px] p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full"></div>
              <div className="space-y-1 md:max-w-xl">
                <h4 className="text-white text-base font-extrabold">¿Todo listo para activar?</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Al confirmar, exportarás el documento Markdown estructurado listo para inyectar en tus CRM, administradores publicitarios y equipos comerciales.
                </p>
              </div>
              <div>
                <button
                  onClick={() => downloadMarkdown(`${brief.marca}-campana-completa`, JSON.stringify(campaignData, null, 2))}
                  disabled={!isCampaignReady}
                  className="w-full md:w-auto bg-white hover:bg-zinc-150 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-extrabold px-6 py-3.5 rounded-[10px] flex items-center justify-center gap-2 transition"
                >
                  Exportar Campaña (.md)
                  <Rocket className="w-4 h-4 text-emerald-500" />
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white text-zinc-800 flex flex-col font-sans relative selection:bg-zinc-900 selection:text-white">
      
      {/* ENCABEZADO HERO: Estilo Oscuro (Se mantiene según instrucción del usuario) */}
      <section 
        className="pt-28 pb-7 px-4 md:px-8 bg-[#070b11] text-white relative z-10 border-b border-zinc-850"
        style={appMode === 'white_label' ? { borderTop: `4px solid ${whiteLabelBranding.primaryColor}` } : {}}
      >
        {/* Elementos decorativos sutiles */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/10 via-[#070b11]/0 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-emerald-400 font-extrabold">
              {appMode === 'white_label' ? whiteLabelBranding.clientName : 'Qaway Hub · Consola de Operaciones'}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-1 leading-tight tracking-tight">
              {appMode === 'white_label' ? 'Consola Estratégica de Marca' : 'Consola de Campaña Estratégica'}
            </h1>
            <p className="text-zinc-400 text-xs mt-1 max-w-xl leading-relaxed">
              Crea, produce, activa y controla tus flujos comerciales paso a paso con el motor de instrucciones estratégico{appMode === 'white_label' ? '' : ' de Qaway'}.
            </p>
          </div>
          <div>
            <Link
              to="/hub"
              className="text-xs uppercase tracking-wider text-white hover:bg-zinc-900 font-extrabold inline-flex items-center gap-1.5 bg-[#121824] border border-zinc-800 px-4 py-2.5 rounded-[10px] transition"
            >
              <Rocket className="w-3.5 h-3.5 text-emerald-400" /> Salir al Hub
            </Link>
          </div>
        </div>
      </section>

      {/* CUERPO PRINCIPAL: Fondo Blanco Puro, Módulos en tonos grises premium (Estilo SaaS) */}
      <section className="flex-1 py-8 px-4 md:px-8 bg-white relative z-10">
        <div className="max-w-7xl mx-auto">
          {copyStatus && (
            <div className="fixed top-24 right-4 z-50 bg-zinc-900 text-white px-4 py-2.5 rounded-[10px] text-xs font-bold shadow-lg animate-bounce">
              {copyStatus}
            </div>
          )}

          <div className="grid lg:grid-cols-[270px_1fr] gap-6">
            
            {/* BARRA LATERAL: Control de Ruta Premium SaaS */}
            <aside className="bg-zinc-50 border border-zinc-200/80 rounded-[10px] p-4 h-fit lg:sticky lg:top-28 space-y-4 shadow-xs">
              <div>
                <p className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest px-1">Progreso Estratégico</p>
                <div className="w-full bg-zinc-200 h-1.5 rounded-[10px] overflow-hidden mt-2">
                  <div 
                    className="bg-zinc-900 h-full transition-all duration-500"
                    style={{ width: `${(approvedModules.length / modules.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[9px] text-zinc-500 mt-1.5 block px-1 font-semibold">
                  {approvedModules.length} de {modules.length} etapas validadas
                </span>
              </div>

              <div className="space-y-1 pt-2.5 border-t border-zinc-200">
                {modules.map((m, idx) => {
                  const Icon = m.icon
                  const isActive = activeModule === m.id
                  const isUnlocked = unlockedModules.includes(m.id)
                  const isApproved = approvedModules.includes(m.id)

                  return (
                    <button
                      key={m.id}
                      disabled={!isUnlocked}
                      onClick={() => {
                        setActiveModule(m.id)
                        setEditingField(null)
                      }}
                      className={`w-full text-left rounded-[10px] p-2.5 border transition flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs font-bold'
                          : isUnlocked
                          ? 'bg-transparent border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                          : 'bg-transparent border-transparent text-zinc-300 cursor-not-allowed opacity-40'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2.5 text-xs">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                        {m.label}
                      </span>
                      <span className="inline-flex items-center">
                        {isApproved ? (
                          <Check className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                        ) : !isUnlocked ? (
                          <Lock className="w-3.5 h-3.5 text-zinc-300" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </aside>

            {/* ÁREA DE TRABAJO CENTRAL: Estilo SaaS Premium */}
            <motion.main
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-zinc-200/80 rounded-[10px] p-5 md:p-6 shadow-xs"
            >
              {/* Cabecera del Lienzo */}
              <div className="mb-5 border-b border-zinc-150 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-zinc-900 text-base font-extrabold tracking-tight">
                    {modules.find((m) => m.id === activeModule)?.label}
                  </h2>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    {activeModule === 'brief'
                      ? 'Rellena los campos indispensables de tu producto o marca para inyectarlos en tu campaña.'
                      : 'Revisa, ajusta y valida las salidas generadas paso a paso por el motor de inteligencia artificial.'}
                  </p>
                </div>
                
                {/* Controles de navegación */}
                <div className="flex items-center gap-2">
                  <button
                    disabled={isFirstModule}
                    onClick={() => {
                      setActiveModule(modules[activeIndex - 1].id)
                      setEditingField(null)
                    }}
                    className="px-3.5 py-1.5 rounded-[10px] text-xs font-bold border border-zinc-200 text-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={isLastModule || !unlockedModules.includes(modules[activeIndex + 1].id)}
                    onClick={() => {
                      setActiveModule(modules[activeIndex + 1].id)
                      setEditingField(null)
                    }}
                    className="px-3.5 py-1.5 rounded-[10px] text-xs font-bold bg-zinc-950 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800"
                  >
                    Siguiente
                  </button>
                </div>
              </div>

              {/* Lienzo de Trabajo Dinámico */}
              {renderWorkArea()}

            </motion.main>

          </div>
        </div>
      </section>

    </div>
  )
}
