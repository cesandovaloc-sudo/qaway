import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  FileSpreadsheet,
  Building2,
  MapPin,
  Calendar,
  Users,
  Monitor,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Download,
  Upload,
  RotateCcw,
  Edit2,
  Save,
  X,
  Copy,
  Check,
  TrendingUp,
  BarChart2,
  PieChart as PieChartIcon,
  ShieldCheck,
  Layers,
  Sparkles,
  Database,
  Cloud,
  Plus,
  Trash2,
  Image as ImageIcon,
  FileText,
  Presentation,
  CheckSquare,
  Send,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LabelList,
} from 'recharts'
import * as XLSX from 'xlsx'
import type {
  Region,
  AccionComunicacionDirectores,
  EntidadReportData,
  HitoSeguimiento,
  NivelAvanceCDL,
  PlanAprobacion,
  ResumenIntervencion,
  ParticipanteIntervencion,
  EvidenciaReunion,
  SesionAsistenciaTecnica,
  PreambulosReporte,
} from './intervencionData'
import {
  ENTIDADES_CATALOGO,
  DATA_POR_DEFECTO,
  UGEL_APPLICABLE_DIRECTIONS,
  getReportDataForEntidad,
} from './intervencionData'
import { intervencionSyncService } from './intervencionSyncService'


interface PreambuloCardProps {
  titulo: string
  puntoId: string
  subtitulo?: string
  contenido: string
  opcionesSesion?: { id: 'consolidado' | 'sesion1' | 'sesion2'; label: string }[]
  sesionActiva?: 'consolidado' | 'sesion1' | 'sesion2'
  onCambiarSesion?: (sesion: 'consolidado' | 'sesion1' | 'sesion2') => void
  onGuardar: (nuevoTexto: string) => Promise<void> | void
  onCopiar: () => void
  isCopiado: boolean
}

function PreambuloCard({
  titulo,
  subtitulo,
  contenido,
  opcionesSesion,
  sesionActiva,
  onCambiarSesion,
  onGuardar,
  onCopiar,
  isCopiado,
}: PreambuloCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(contenido)

  useEffect(() => {
    setDraft(contenido)
  }, [contenido, sesionActiva])

  const handleSave = async () => {
    await onGuardar(draft)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraft(contenido)
    setIsEditing(false)
  }

  return (
    <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded-xs p-3.5 shadow-2xs space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#107c41] rounded-xs inline-block"></span>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#107c41]" />
            {titulo}
          </span>
          <span className="text-[10px] bg-emerald-50 text-[#107c41] font-bold px-2 py-0.5 rounded-xs border border-emerald-200">
            {subtitulo || 'Texto Oficial Word'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {opcionesSesion && onCambiarSesion && (
            <div className="flex items-center bg-white p-0.5 rounded-xs border border-[#cbd5e1] text-[11px]">
              {opcionesSesion.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onCambiarSesion(opt.id)}
                  className={`px-2.5 py-0.5 font-medium rounded-xs transition-colors cursor-pointer ${
                    sesionActiva === opt.id
                      ? 'bg-[#107c41] text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={onCopiar}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Copiar texto formal al portapapeles para pegar en el informe Word"
          >
            {isCopiado ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">¡Copiado para Word!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar texto para Word</span>
              </>
            )}
          </button>

          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-2.5 py-1 bg-[#107c41] hover:bg-[#0f6f39] text-white text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar</span>
              </button>
              <button
                onClick={handleCancel}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-xs font-medium rounded-xs flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancelar</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Personalizar texto del informe"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#107c41]" />
              <span>Editar</span>
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={6}
          className="w-full text-xs text-slate-800 p-2.5 border border-[#107c41] rounded-xs bg-white font-sans leading-relaxed focus:outline-none"
        />
      ) : (
        <div className="text-xs text-slate-700 leading-relaxed font-sans select-text whitespace-pre-line bg-white/60 p-3 rounded-xs border border-slate-200/60">
          {contenido && contenido.trim() ? (
            contenido
          ) : (
            <span className="text-slate-400 italic">No hay texto redactado para esta sección.</span>
          )}
        </div>
      )}
    </div>
  )
}

export default function ReporteIntervencionExcel() {
  // Filtros obligatorios estrictos solicitados por el usuario:
  // 1. REGION: Pasco y Junín
  // 2. UGEL / DRE dependiente
  const [regionSeleccionada, setRegionSeleccionada] = useState<Region>('Junín')
  const [entidadId, setEntidadId] = useState<string>('ugel-chanchamayo')

  // Pestañas tipo Excel
  const [activeSheet, setActiveSheet] = useState<'todo' | 'resumen' | 'hitos' | 'planes' | 'cdl' | 'comunicacion' | 'participantes' | 'evidencias'>('todo')

  // Estado de sincronización en tiempo real con Supabase
  const [syncStatus, setSyncStatus] = useState<{
    isSyncing: boolean
    isSavedInSupabase: boolean
    lastSaved: string | null
  }>({
    isSyncing: false,
    isSavedInSupabase: true,
    lastSaved: null,
  })

  // Estado de copiado temporal
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  // Referencia para input file de Excel Google Form
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estado para la sesión activa del preámbulo de Cuadro 03
  const [sesionCuadro03Preambulo, setSesionCuadro03Preambulo] = useState<'consolidado' | 'sesion1' | 'sesion2'>('consolidado')

  // Manejador general para copiar texto al portapapeles
  const handleCopyTexto = async (texto: string, key: string) => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiedSection(key)
      setTimeout(() => setCopiedSection(null), 2500)
    } catch (e) {
      console.warn('Error al copiar al portapapeles:', e)
    }
  }

  // Manejadores para guardar preámbulos editados en el store y Supabase
  const handleSavePreambuloCuadro03 = async (nuevoTexto: string, sesion: 'consolidado' | 'sesion1' | 'sesion2') => {
    const currentPreambulos = currentData.preambulos || getReportDataForEntidad(entidadId).preambulos!
    const updatedPreambulos = {
      ...currentPreambulos,
      cuadro03: {
        ...currentPreambulos.cuadro03,
        [sesion]: nuevoTexto,
      },
    }
    await updateCurrentData({
      ...currentData,
      preambulos: updatedPreambulos,
    })
  }

  const handleSavePreambuloCDL = async (nuevoTexto: string) => {
    const currentPreambulos = currentData.preambulos || getReportDataForEntidad(entidadId).preambulos!
    await updateCurrentData({
      ...currentData,
      preambulos: {
        ...currentPreambulos,
        cdl: nuevoTexto,
      },
    })
  }

  const handleSavePreambuloHitos = async (nuevoTexto: string) => {
    const currentPreambulos = currentData.preambulos || getReportDataForEntidad(entidadId).preambulos!
    await updateCurrentData({
      ...currentData,
      preambulos: {
        ...currentPreambulos,
        hitos: nuevoTexto,
      },
    })
  }

  const handleSavePreambuloPlanes = async (nuevoTexto: string) => {
    const currentPreambulos = currentData.preambulos || getReportDataForEntidad(entidadId).preambulos!
    await updateCurrentData({
      ...currentData,
      preambulos: {
        ...currentPreambulos,
        planes: nuevoTexto,
      },
    })
  }


  // Entidades filtradas según la región activa
  const entidadesFiltradas = useMemo(() => {
    return ENTIDADES_CATALOGO.filter((e) => e.region === regionSeleccionada)
  }, [regionSeleccionada])

  // Ajustar entidad al cambiar de región si no pertenece a la misma
  useEffect(() => {
    const existe = entidadesFiltradas.some((e) => e.id === entidadId)
    if (!existe && entidadesFiltradas.length > 0) {
      setEntidadId(entidadesFiltradas[0].id)
    }
  }, [regionSeleccionada, entidadesFiltradas, entidadId])

  const entidadActual = useMemo(() => {
    return (
      ENTIDADES_CATALOGO.find((e) => e.id === entidadId) || {
        id: entidadId,
        nombre: 'Entidad Seleccionada',
        tipo: 'UGEL',
        region: regionSeleccionada,
        number: 1,
      }
    )
  }, [entidadId, regionSeleccionada])

  const isDRE = entidadActual.tipo === 'DRE'

  // Direcciones pedagógicas oficiales que aplican a esta UGEL
  const direccionesAsignadas = useMemo(() => {
    return UGEL_APPLICABLE_DIRECTIONS[entidadId] || ['DEI', 'DEP', 'DES', 'DEBA', 'DEBE', 'DEIB', 'DISER']
  }, [entidadId])

  // Estado con persistencia local y sincronización remota
  const [dataStore, setDataStore] = useState<Record<string, EntidadReportData>>(() => {
    try {
      const saved = localStorage.getItem('qaway_reporte_intervencion_excel_v3')
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return DATA_POR_DEFECTO
  })

  // Cargar datos remotos de Supabase al montar o cambiar de entidad
  useEffect(() => {
    let isMounted = true
    async function loadFromSupabase() {
      setSyncStatus((s) => ({ ...s, isSyncing: true }))
      try {
        const remoteData = await intervencionSyncService.loadEntidadData(entidadId)
        if (remoteData && isMounted) {
          setDataStore((prev) => ({ ...prev, [entidadId]: remoteData }))
          setSyncStatus({
            isSyncing: false,
            isSavedInSupabase: true,
            lastSaved: new Date().toLocaleTimeString(),
          })
          return
        }
      } catch (err) {
        console.warn('Error fetching Supabase data:', err)
      }
      if (isMounted) {
        setSyncStatus((s) => ({ ...s, isSyncing: false, isSavedInSupabase: true }))
      }
    }
    loadFromSupabase()
    return () => {
      isMounted = false
    }
  }, [entidadId])

  // Obtener datos actuales de la entidad con fusion profunda garantizada
  const currentData: EntidadReportData = useMemo(() => {
    const defaultData = getReportDataForEntidad(entidadId)
    const stored = dataStore[entidadId]
    if (!stored) return defaultData

    return {
      ...defaultData,
      ...stored,
      resumen: { ...defaultData.resumen, ...(stored.resumen || {}) },
      registroCuadro03:
        stored.registroCuadro03 && stored.registroCuadro03.length > 0
          ? stored.registroCuadro03
          : defaultData.registroCuadro03,
      hitos:
        stored.hitos &&
        stored.hitos.length === defaultData.hitos.length &&
        stored.hitos.some((h) => h.id.startsWith('h1.')) &&
        !stored.hitos.some((h) => h.subproceso === 'Instrumentos de Distribución')
          ? stored.hitos
          : defaultData.hitos,
      nivelesCDL:
        stored.nivelesCDL && stored.nivelesCDL.length === defaultData.nivelesCDL.length
          ? stored.nivelesCDL
          : defaultData.nivelesCDL,
      planes:
        stored.planes && stored.planes.length === defaultData.planes.length
          ? stored.planes
          : defaultData.planes,
      comunicacionDirectores:
        stored.comunicacionDirectores && stored.comunicacionDirectores.length > 0
          ? stored.comunicacionDirectores
          : defaultData.comunicacionDirectores || [],
      participantes:
        stored.participantes && stored.participantes.length > 0
          ? stored.participantes
          : defaultData.participantes,
      evidencias:
        stored.evidencias && stored.evidencias.length > 0
          ? stored.evidencias
          : defaultData.evidencias,
      preambulos: {
        cuadro03: {
          consolidado:
            stored.preambulos?.cuadro03?.consolidado && stored.preambulos.cuadro03.consolidado.includes('En el periodo reportado')
              ? stored.preambulos.cuadro03.consolidado
              : defaultData.preambulos?.cuadro03?.consolidado || '',
          sesion1:
            stored.preambulos?.cuadro03?.sesion1 ||
            defaultData.preambulos?.cuadro03?.sesion1 ||
            '',
          sesion2:
            stored.preambulos?.cuadro03?.sesion2 ||
            defaultData.preambulos?.cuadro03?.sesion2 ||
            '',
        },
        cdl: stored.preambulos?.cdl || defaultData.preambulos?.cdl || '',
        hitos:
          stored.preambulos?.hitos && stored.preambulos.hitos.includes('i) hito 1.3')
            ? stored.preambulos.hitos
            : defaultData.preambulos?.hitos || '',
        planes:
          stored.preambulos?.planes && stored.preambulos.planes.includes('Se abordaron las disposiciones relacionadas')
            ? stored.preambulos.planes
            : defaultData.preambulos?.planes || '',
        comunicacion: stored.preambulos?.comunicacion || defaultData.preambulos?.comunicacion || '',
      },
    }
  }, [dataStore, entidadId])

  // Guardar en Supabase y localStorage en simultáneo
  const updateCurrentData = async (newData: EntidadReportData) => {
    // 1. Actualización de estado reactivo inmediato
    setDataStore((prev) => ({ ...prev, [entidadId]: newData }))
    setSyncStatus((s) => ({ ...s, isSyncing: true }))

    // 2. Persistir en Supabase y localStorage a través del servicio
    const success = await intervencionSyncService.saveEntidadData(
      entidadId,
      entidadActual.nombre,
      regionSeleccionada,
      newData,
      entidadActual.number || 1
    )

    setSyncStatus({
      isSyncing: false,
      isSavedInSupabase: success,
      lastSaved: new Date().toLocaleTimeString(),
    })
  }

  // Restablecer valores de primera intervención
  const handleResetData = () => {
    if (window.confirm(`¿Deseas restablecer los datos de primera intervención para ${entidadActual.nombre}?`)) {
      const defaultData = getReportDataForEntidad(entidadId)
      updateCurrentData(defaultData)
      setIsEditingResumen(false)
      setIsEditingHitos(false)
      setIsEditingCDL(false)
      setIsEditingPlanes(false)
      setIsEditingParticipantes(false)
      setIsEditingEvidencias(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ESTADOS DE EDICIÓN FUERA DEL CUADRO PARA CADA TABLERO
  // ─────────────────────────────────────────────────────────────

  // Punto 1: Edición de Resumen
  const [isEditingResumen, setIsEditingResumen] = useState(false)
  const [editResumen, setEditResumen] = useState<ResumenIntervencion>(currentData.resumen)

  // Registro de Sesiones del Cuadro 03 (Formato Word Oficial)
  const [isEditingCuadro03, setIsEditingCuadro03] = useState(false)
  const [editCuadro03, setEditCuadro03] = useState<SesionAsistenciaTecnica[]>(currentData.registroCuadro03 || [])

  useEffect(() => {
    setEditResumen(currentData.resumen)
    setEditCuadro03(currentData.registroCuadro03 || [])
  }, [currentData.resumen, currentData.registroCuadro03])

  const handleSaveResumen = () => {
    updateCurrentData({
      ...currentData,
      resumen: editResumen,
    })
    setIsEditingResumen(false)
  }

  const handleCancelResumen = () => {
    setEditResumen(currentData.resumen)
    setIsEditingResumen(false)
  }

  const handleSaveCuadro03 = () => {
    const sumPart = editCuadro03.reduce((acc, c) => acc + Number(c.participantes || 0), 0)
    const sumVirt = editCuadro03.filter((c) => c.modalidad === 'Virtual').length
    const sumPres = editCuadro03.filter((c) => c.modalidad === 'Presencial').length
    updateCurrentData({
      ...currentData,
      registroCuadro03: editCuadro03,
      resumen: {
        ...currentData.resumen,
        intervencionesTotal: editCuadro03.length,
        participantesTotal: sumPart,
        intervencionesVirtuales: sumVirt,
        intervencionesPresenciales: sumPres,
      },
    })
    setIsEditingCuadro03(false)
  }

  const handleCancelCuadro03 = () => {
    setEditCuadro03(currentData.registroCuadro03 || [])
    setIsEditingCuadro03(false)
  }

  const handleAddSesionCuadro03 = () => {
    const nuevaSesion: SesionAsistenciaTecnica = {
      numero: editCuadro03.length + 1,
      fecha: new Date().toLocaleDateString('es-PE'),
      dreUgel: entidadActual.nombre,
      tipoAt: 'Asistencia técnica',
      alcance: isDRE ? 'Regional' : 'Local',
      tema: 'Seguimiento a los subprocesos de planificación de la distribución',
      modalidad: 'Virtual',
      participantes: 8,
    }
    setEditCuadro03([...editCuadro03, nuevaSesion])
    setIsEditingCuadro03(true)
  }

  const handleRemoveSesionCuadro03 = (num: number) => {
    setEditCuadro03(editCuadro03.filter((s) => s.numero !== num))
  }

  const copyCuadro03TSV = () => {
    const headers = ['Intervenciones', 'Fecha', 'Modalidad', 'Alcance', 'Participantes']
    const rows = (currentData.registroCuadro03 || []).map((s) => [
      1,
      s.fecha.replace(/\//g, '-'),
      s.modalidad,
      s.alcance,
      s.participantes,
    ])
    const tsv = [
      headers.join('\t'),
      ...rows.map((r) => r.join('\t')),
      'Fuente: Formulario Google Form, registro fotográfico',
    ].join('\n')
    navigator.clipboard.writeText(tsv)
    triggerCopyNotice('cuadro03')
  }

  // Punto 2: Edición de Hitos
  const [isEditingHitos, setIsEditingHitos] = useState(false)
  const [editHitos, setEditHitos] = useState<HitoSeguimiento[]>(currentData.hitos)

  useEffect(() => {
    setEditHitos(currentData.hitos)
  }, [currentData.hitos])

  const handleSaveHitos = () => {
    updateCurrentData({
      ...currentData,
      hitos: editHitos,
    })
    setIsEditingHitos(false)
  }

  const handleCancelHitos = () => {
    setEditHitos(currentData.hitos)
    setIsEditingHitos(false)
  }

  // Punto 3: Edición de Matriz CDL
  const [isEditingCDL, setIsEditingCDL] = useState(false)
  const [editCDL, setEditCDL] = useState<NivelAvanceCDL[]>(currentData.nivelesCDL)

  useEffect(() => {
    setEditCDL(currentData.nivelesCDL)
  }, [currentData.nivelesCDL])

  const handleSaveCDL = () => {
    updateCurrentData({
      ...currentData,
      nivelesCDL: editCDL,
    })
    setIsEditingCDL(false)
  }

  const handleCancelCDL = () => {
    setEditCDL(currentData.nivelesCDL)
    setIsEditingCDL(false)
  }

  // Punto 4: Edición de Planes y Enlaces
  const [isEditingPlanes, setIsEditingPlanes] = useState(false)
  const [editPlanes, setEditPlanes] = useState<PlanAprobacion[]>(currentData.planes)

  useEffect(() => {
    setEditPlanes(currentData.planes)
  }, [currentData.planes])

  const handleSavePlanes = () => {
    updateCurrentData({
      ...currentData,
      planes: editPlanes,
    })
    setIsEditingPlanes(false)
  }

  const handleCancelPlanes = () => {
    setEditPlanes(currentData.planes)
    setIsEditingPlanes(false)
  }

  // Punto 5: Edición y gestión de Comunicación a Directores (Hito 1.7)
  const [isEditingComunicacion, setIsEditingComunicacion] = useState(false)
  const [editComunicacion, setEditComunicacion] = useState<AccionComunicacionDirectores[]>(
    currentData.comunicacionDirectores || []
  )

  useEffect(() => {
    setEditComunicacion(currentData.comunicacionDirectores || [])
  }, [currentData.comunicacionDirectores])

  const handleSaveComunicacion = () => {
    updateCurrentData({
      ...currentData,
      comunicacionDirectores: editComunicacion,
    })
    setIsEditingComunicacion(false)
  }

  const handleCancelComunicacion = () => {
    setEditComunicacion(currentData.comunicacionDirectores || [])
    setIsEditingComunicacion(false)
  }

  const handleSavePreambuloComunicacion = async (nuevoTexto: string) => {
    const currentPreambulos = currentData.preambulos || getReportDataForEntidad(entidadId).preambulos!
    await updateCurrentData({
      ...currentData,
      preambulos: {
        ...currentPreambulos,
        comunicacion: nuevoTexto,
      },
    })
  }

  const copyComunicacionTSV = () => {
    const headers = [
      'N°',
      'Acción de Comunicación / Capacitación',
      'Canal / Medio',
      'Plazo Oficial',
      'Estado',
      'Responsable',
    ]
    const rows = (currentData.comunicacionDirectores || []).map((c, i) => [
      i + 1,
      c.actividad,
      c.medioCanal,
      c.plazoOficial,
      c.estado,
      c.responsable,
    ])
    const tsv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n')
    navigator.clipboard.writeText(tsv)
    triggerCopyNotice('comunicacion')
  }

  // Punto 5: Edición y subida de Participantes (Google Form / Excel)
  const [isEditingParticipantes, setIsEditingParticipantes] = useState(false)
  const [editParticipantes, setEditParticipantes] = useState<ParticipanteIntervencion[]>(currentData.participantes || [])

  useEffect(() => {
    setEditParticipantes(currentData.participantes || [])
  }, [currentData.participantes])

  const handleSaveParticipantes = () => {
    updateCurrentData({
      ...currentData,
      participantes: editParticipantes,
      resumen: {
        ...currentData.resumen,
        participantesTotal: editParticipantes.length,
      },
    })
    setIsEditingParticipantes(false)
  }

  const handleCancelParticipantes = () => {
    setEditParticipantes(currentData.participantes || [])
    setIsEditingParticipantes(false)
  }

  const handleAddParticipante = () => {
    const nuevo: ParticipanteIntervencion = {
      id: `p-${Date.now()}`,
      marcaTemporal: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString().slice(0, 5),
      apellidosNombres: '',
      dni: '',
      cargo: 'Especialista',
      institucion: entidadActual.nombre,
      correo: '',
      telefono: '',
      asistencia: true,
    }
    setEditParticipantes([nuevo, ...editParticipantes])
    setIsEditingParticipantes(true)
  }

  const handleRemoveParticipante = (id: string) => {
    setEditParticipantes(editParticipantes.filter((p) => p.id !== id))
  }

  // Importar Excel / CSV de Google Forms
  const handleUploadGoogleFormExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result
        const wb = XLSX.read(buffer, { type: 'binary' })
        const sheetName = wb.SheetNames[0]
        const sheet = wb.Sheets[sheetName]
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

        if (rows.length < 2) {
          alert('El archivo no contiene filas de datos.')
          return
        }

        const headers = rows[0].map((h: any) => String(h || '').trim().toLowerCase())

        // Detección heurística de columnas de Google Forms
        const idxTimestamp = headers.findIndex((h) => h.includes('marca') || h.includes('fecha') || h.includes('time'))
        const idxNombre = headers.findIndex((h) => h.includes('nombre') || h.includes('apellido') || h.includes('participante'))
        const idxDni = headers.findIndex((h) => h.includes('dni') || h.includes('documento'))
        const idxCargo = headers.findIndex((h) => h.includes('cargo') || h.includes('puesto') || h.includes('funcion'))
        const idxEntidad = headers.findIndex((h) => h.includes('institucion') || h.includes('entidad') || h.includes('ugel') || h.includes('dre'))
        const idxCorreo = headers.findIndex((h) => h.includes('correo') || h.includes('email') || h.includes('mail'))
        const idxTel = headers.findIndex((h) => h.includes('celular') || h.includes('telefono') || h.includes('tel'))

        const imported: ParticipanteIntervencion[] = []

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i]
          if (!row || row.length === 0) continue

          const nombreVal = idxNombre !== -1 ? String(row[idxNombre] || '').trim() : String(row[1] || '').trim()
          if (!nombreVal) continue

          imported.push({
            id: `p-imp-${Date.now()}-${i}`,
            marcaTemporal: idxTimestamp !== -1 ? String(row[idxTimestamp] || '') : new Date().toLocaleDateString(),
            apellidosNombres: nombreVal,
            dni: idxDni !== -1 ? String(row[idxDni] || '').replace(/[^0-9]/g, '') : '',
            cargo: idxCargo !== -1 ? String(row[idxCargo] || '') : 'Participante',
            institucion: idxEntidad !== -1 ? String(row[idxEntidad] || '') : entidadActual.nombre,
            correo: idxCorreo !== -1 ? String(row[idxCorreo] || '') : '',
            telefono: idxTel !== -1 ? String(row[idxTel] || '') : '',
            asistencia: true,
          })
        }

        if (imported.length > 0) {
          const updatedList = [...imported, ...(currentData.participantes || [])]
          updateCurrentData({
            ...currentData,
            participantes: updatedList,
            resumen: {
              ...currentData.resumen,
              participantesTotal: updatedList.length,
            },
          })
          alert(`¡Se importaron exitosamente ${imported.length} participantes desde el Excel de Google Form!`)
        } else {
          alert('No se detectaron participantes válidos en el archivo.')
        }
      } catch (err: any) {
        console.error('Error al procesar Excel de Google Form:', err)
        alert('Error al leer el archivo Excel: ' + (err?.message || 'Formato no reconocido'))
      }
    }
    reader.readAsBinaryString(file)
    event.target.value = ''
  }

  // Punto 6: Edición y gestión de Evidencias de Reuniones por Fecha
  const [isEditingEvidencias, setIsEditingEvidencias] = useState(false)
  const [editEvidencias, setEditEvidencias] = useState<EvidenciaReunion[]>(currentData.evidencias || [])
  const [fechaReunionFiltro, setFechaReunionFiltro] = useState<string>('todas')

  useEffect(() => {
    setEditEvidencias(currentData.evidencias || [])
  }, [currentData.evidencias])

  const handleSaveEvidencias = () => {
    updateCurrentData({
      ...currentData,
      evidencias: editEvidencias,
    })
    setIsEditingEvidencias(false)
  }

  const handleCancelEvidencias = () => {
    setEditEvidencias(currentData.evidencias || [])
    setIsEditingEvidencias(false)
  }

  const handleAddEvidencia = () => {
    const nueva: EvidenciaReunion = {
      id: `ev-${Date.now()}`,
      fecha: currentData.resumen.ultimaFecha || '19/10/2026',
      titulo: 'Nueva Evidencia de Asistencia Técnica',
      tipo: 'captura',
      descripcion: 'Registro fotográfico o acta de reunión técnica.',
      enlaceUrl: 'https://drive.google.com/',
      archivoNombre: 'Evidencia.pdf',
    }
    setEditEvidencias([nueva, ...editEvidencias])
    setIsEditingEvidencias(true)
  }

  const handleRemoveEvidencia = (id: string) => {
    setEditEvidencias(editEvidencias.filter((ev) => ev.id !== id))
  }

  // Fechas únicas para filtrar evidencias
  const fechasReunionesDisponibles = useMemo(() => {
    const list = (currentData.evidencias || []).map((e) => e.fecha)
    return Array.from(new Set(list))
  }, [currentData.evidencias])

  const evidenciasFiltradas = useMemo(() => {
    const list = isEditingEvidencias ? editEvidencias : (currentData.evidencias || [])
    if (fechaReunionFiltro === 'todas') return list
    return list.filter((e) => e.fecha === fechaReunionFiltro)
  }, [currentData.evidencias, editEvidencias, isEditingEvidencias, fechaReunionFiltro])

  // ─────────────────────────────────────────────────────────────
  // UTILIDAD: COPIAR TABLAS AL PORTAPAPELES (TSV / EXCEL PURO)
  // ─────────────────────────────────────────────────────────────
  const triggerCopyNotice = (sectionId: string) => {
    setCopiedSection(sectionId)
    setTimeout(() => setCopiedSection(null), 2500)
  }

  const copyHitosTableTSV = () => {
    const headers = ['N°', 'Hito de Planificación', 'Instrumento / Entregable', 'Plazo', 'Estado', 'Situación / Observaciones']
    const rows = currentData.hitos.map((h, i) => [
      i + 1,
      h.nombre,
      h.subproceso,
      h.plazo,
      h.estado,
      h.observacion,
    ])
    const tsv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n')
    navigator.clipboard.writeText(tsv)
    triggerCopyNotice('hitos')
  }

  const copyCDLTableTSV = () => {
    const headers = [
      'N°',
      'Dirección Pedagógica',
      'Código',
      '% Avance Declarado',
      '¿Elaboró Cuadro?',
      'Carga en MC-SIGA',
      'Plazo',
    ]
    const rows = currentData.nivelesCDL.map((n, i) => [
      i + 1,
      n.nivel,
      n.codigoDireccion,
      `${n.porcentajeAvance}%`,
      n.elaboroCuadro,
      n.cargaMCSIGA,
      n.fechaEntrega ? n.fechaEntrega.split(' ')[0] : '22/10/2026',
    ])
    const tsv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n')
    navigator.clipboard.writeText(tsv)
    triggerCopyNotice('cdl')
  }

  const copyPlanesTableTSV = () => {
    const headers = [
      'Hito',
      'Estado Aprobación',
      'Documento Formal / RD',
      'Fecha',
      'Observaciones',
      'Link',
    ]
    const rows = currentData.planes.map((p) => [
      p.planNombre,
      p.estado,
      p.documentoAprobacion,
      p.fechaAprobacion,
      p.observacion,
      p.enlaceUrl,
    ])
    const tsv = [
      headers.join('\t'),
      ...rows.map((r) => r.join('\t')),
      'Fuente: Actas de asistencia técnica',
    ].join('\n')
    navigator.clipboard.writeText(tsv)
    triggerCopyNotice('planes')
  }

  const copyParticipantesTSV = () => {
    const headers = ['N°', 'Marca Temporal', 'Apellidos y Nombres', 'DNI', 'Cargo / Función', 'Institución', 'Correo', 'Teléfono', 'Asistencia']
    const rows = (currentData.participantes || []).map((p, i) => [
      i + 1,
      p.marcaTemporal || '',
      p.apellidosNombres,
      p.dni,
      p.cargo,
      p.institucion,
      p.correo,
      p.telefono || '',
      p.asistencia ? 'Sí' : 'No',
    ])
    const tsv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n')
    navigator.clipboard.writeText(tsv)
    triggerCopyNotice('participantes')
  }

  // ─────────────────────────────────────────────────────────────
  // CÁLCULOS Y DATOS PARA GRÁFICOS PERSONALIZADOS POR UGEL
  // ─────────────────────────────────────────────────────────────
  const deriveElaboroCuadro = (pct: number): 'Completado' | 'En proceso' | 'Sin avance' => {
    if (pct >= 100) return 'Completado'
    if (pct > 0) return 'En proceso'
    return 'Sin avance'
  }

  const deriveCargaMCSIGA = (pct: number): 'Cargado' | 'En proceso' | 'Pendiente' => {
    if (pct >= 100) return 'Cargado'
    if (pct > 0) return 'En proceso'
    return 'Pendiente'
  }

  const totalesCDL = useMemo(() => {
    const dataRef = isEditingCDL ? editCDL : currentData.nivelesCDL
    const totalDirecciones = dataRef.length
    const completadas = dataRef.filter((d) => (Number(d.porcentajeAvance) || 0) >= 100).length
    const enProceso = dataRef.filter((d) => {
      const p = Number(d.porcentajeAvance) || 0
      return p > 0 && p < 100
    }).length
    const sinAvance = dataRef.filter((d) => (Number(d.porcentajeAvance) || 0) === 0).length
    const sumaPorcentajes = dataRef.reduce((acc, curr) => acc + (Number(curr.porcentajeAvance) || 0), 0)
    const promedioAvance = totalDirecciones > 0 ? Math.round(sumaPorcentajes / totalDirecciones) : 0

    return {
      totalDirecciones,
      conAvance: completadas,
      enProceso,
      sinAvance,
      promedioAvance,
    }
  }, [currentData.nivelesCDL, editCDL, isEditingCDL])

  // Gráfico 1: Torta de Estado CDL por Direcciones (Filtra slices vacías para evitar colisiones)
  const dataPieEstado = useMemo(() => {
    const all = [
      { name: 'Completadas', value: totalesCDL.conAvance, color: '#107c41' },
      { name: 'En proceso', value: totalesCDL.enProceso, color: '#d97706' },
      { name: 'Sin avance', value: totalesCDL.sinAvance, color: '#64748b' },
    ]
    const filtered = all.filter((d) => d.value > 0)
    return filtered.length > 0 ? filtered : [{ name: 'Sin avance', value: totalesCDL.totalDirecciones || 1, color: '#64748b' }]
  }, [totalesCDL])

  // Gráfico 2: Barras de Avance % por Dirección Pedagógica
  const dataBarrasAgrupadas = useMemo(() => {
    const dataRef = isEditingCDL ? editCDL : currentData.nivelesCDL
    return dataRef.map((n) => {
      const avanceVal = Number(n.porcentajeAvance) || 0
      return {
        codigo: n.codigoDireccion || n.nivel.slice(0, 4),
        nombre: n.nivel,
        avance: avanceVal,
        color: avanceVal === 100 ? '#107c41' : avanceVal >= 50 ? '#d97706' : avanceVal > 0 ? '#f59e0b' : '#94a3b8',
      }
    })
  }, [currentData.nivelesCDL, editCDL, isEditingCDL])

  // Gráfico 3: Anillo de Cumplimiento / Avance Promedio Global Territorial
  const dataPromedioGlobal = useMemo(() => {
    const logrado = totalesCDL.promedioAvance
    const brecha = Math.max(0, 100 - logrado)
    const colorLogrado = logrado >= 80 ? '#107c41' : logrado > 0 ? '#d97706' : '#94a3b8'
    return [
      { name: 'Avance Logrado', value: logrado, color: colorLogrado },
      { name: 'Brecha Pendiente', value: brecha, color: '#f1f5f9' },
    ]
  }, [totalesCDL.promedioAvance])

  // Gráfico 4: Radar de Madurez Técnica
  const dataRadar = useMemo(() => {
    return currentData.madurezInicial
  }, [currentData.madurezInicial])

  // Exportar a Excel Real
  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new()

    // Hoja 1: Resumen y Metadatos
    const resumenWsData = [
      ['REPORTE DE INTERVENCIÓN TERRITORIAL - EXCEL VIEW'],
      ['Entidad:', entidadActual.nombre],
      ['Tipo:', entidadActual.tipo],
      ['Región:', entidadActual.region],
      ['Direcciones asignadas:', direccionesAsignadas.join(', ')],
      ['Fecha de Corte:', currentData.resumen.ultimaFecha],
      [],
      ['INDICADOR DE INTERVENCIÓN', 'VALOR'],
      ['Intervenciones acumuladas', currentData.resumen.intervencionesTotal],
      ['Participantes acumulados', (currentData.participantes || []).length || currentData.resumen.participantesTotal],
      ['Modalidad Virtual', currentData.resumen.intervencionesVirtuales],
      ['Modalidad Presencial', currentData.resumen.intervencionesPresenciales],
      ['Alcance', currentData.resumen.alcance],
      ['Tema de Intervención', currentData.resumen.tema],
      ['Objetivo de Intervención', currentData.resumen.objetivo],
    ]
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenWsData)
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen_Intervención')

    // Hoja 2: Hitos de Seguimiento
    const hitosWsData = [
      ['CÓDIGO', 'HITO DE PLANIFICACIÓN', 'INSTRUMENTO / ENTREGABLE', 'PLAZO', 'ESTADO', 'OBSERVACIÓN'],
      ...currentData.hitos.map((h, i) => [
        `HITO-0${i + 1}`,
        h.nombre,
        h.subproceso,
        h.plazo,
        h.estado,
        h.observacion,
      ]),
    ]
    const wsHitos = XLSX.utils.aoa_to_sheet(hitosWsData)
    XLSX.utils.book_append_sheet(wb, wsHitos, 'Hitos_Seguimiento')

    // Hoja 3: Nivel de Avance CDL
    const cdlWsData = [
      ['DIRECCIÓN / NIVEL', 'TOTAL II.EE.', 'CON AVANCE', 'CON OBS.', 'POR CULMINAR', '% AVANCE', 'ESTADO EN 1RA INTERVENCIÓN', 'SUSTENTO TÉCNICO'],
      ...currentData.nivelesCDL.map((n) => [
        n.nivel,
        n.totalIIEE,
        n.conAvance,
        n.conObservaciones,
        n.porCulminar,
        `${n.porcentajeAvance}%`,
        n.estadoInicial,
        n.observacion,
      ]),
      [
        'TOTAL CONSOLIDADO',
        totalesCDL.totalIIEE,
        totalesCDL.conAvance,
        totalesCDL.conObs,
        totalesCDL.porCulminar,
        `${totalesCDL.promedioAvance}%`,
        'CONSOLIDADO',
        `Cálculo global para las ${totalesCDL.totalDirecciones} direcciones pedagógicas de ${entidadActual.nombre}`,
      ],
    ]
    const wsCDL = XLSX.utils.aoa_to_sheet(cdlWsData)
    XLSX.utils.book_append_sheet(wb, wsCDL, 'Avance_CDL')

    // Hoja 4: Aprobación de Planes y Enlaces
    const planesWsData = [
      ['PLAN / INSTRUMENTO', 'APLICA A', 'ESTADO DE APROBACIÓN', 'DOCUMENTO FORMAL', 'FECHA APROBACIÓN', 'ENLACE DE UBICACIÓN', 'RESPONSABLE', 'OBSERVACIÓN'],
      ...currentData.planes.map((p) => [
        p.planNombre,
        p.aplicaA,
        p.estado,
        p.documentoAprobacion,
        p.fechaAprobacion,
        p.enlaceUrl,
        p.responsable,
        p.observacion,
      ]),
    ]
    const wsPlanes = XLSX.utils.aoa_to_sheet(planesWsData)
    XLSX.utils.book_append_sheet(wb, wsPlanes, 'Planes_y_Enlaces')

    // Hoja 5: Participantes (Google Forms)
    const partWsData = [
      ['N°', 'MARCA TEMPORAL', 'APELLIDOS Y NOMBRES', 'DNI', 'CARGO / FUNCIÓN', 'INSTITUCIÓN', 'CORREO', 'TELÉFONO', 'ASISTENCIA'],
      ...(currentData.participantes || []).map((p, i) => [
        i + 1,
        p.marcaTemporal || '',
        p.apellidosNombres,
        p.dni,
        p.cargo,
        p.institucion,
        p.correo,
        p.telefono || '',
        p.asistencia ? 'SÍ' : 'NO',
      ]),
    ]
    const wsPart = XLSX.utils.aoa_to_sheet(partWsData)
    XLSX.utils.book_append_sheet(wb, wsPart, 'Participantes_Form')

    // Hoja 6: Evidencias de Reuniones
    const evidWsData = [
      ['N°', 'FECHA DE REUNIÓN', 'TÍTULO DE LA EVIDENCIA', 'TIPO', 'DESCRIPCIÓN', 'ENLACE DRIVE / ARCHIVO'],
      ...(currentData.evidencias || []).map((e, i) => [
        i + 1,
        e.fecha,
        e.titulo,
        e.tipo,
        e.descripcion,
        e.enlaceUrl,
      ]),
    ]
    const wsEvid = XLSX.utils.aoa_to_sheet(evidWsData)
    XLSX.utils.book_append_sheet(wb, wsEvid, 'Evidencias_Reuniones')

    const fileName = `Reporte_Intervencion_${entidadActual.id}_${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-20">
      {/* Input oculto para subida de Excel de Google Form */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUploadGoogleFormExcel}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      {/* ─────────────────────────────────────────────────────────────
          BARRA DE TÍTULO Y HERRAMIENTAS TIPO EXCEL MODERNO
         ───────────────────────────────────────────────────────────── */}
      <header className="border-b border-[#cbd5e1] bg-white sticky top-0 z-30 shadow-xs">
        <div className="bg-[#107c41] text-white px-4 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-[#0f6f39] flex items-center justify-center border border-white/20 shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-xs text-emerald-100">
                  Libro de Asistencia Técnica
                </span>
                <span className="text-xs text-emerald-100">| Producto 03 - MINEDU Dotación 2027</span>
              </div>
              <h1 className="text-sm md:text-base font-bold text-white tracking-tight flex items-center gap-2">
                Tablero Gráfico de Seguimiento e Intervención Territorial
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Indicador de persistencia en Supabase */}
            <div className="bg-[#0f6f39] border border-white/20 px-2.5 py-1 rounded-xs text-[11px] font-mono flex items-center gap-1.5 shadow-2xs">
              {syncStatus.isSyncing ? (
                <>
                  <div className="w-2 h-2 rounded-xs bg-amber-400 animate-spin"></div>
                  <span className="text-amber-200">Guardando en Supabase...</span>
                </>
              ) : syncStatus.isSavedInSupabase ? (
                <>
                  <Database className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-100">Supabase Conectado</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-blue-300" />
                  <span className="text-blue-100">Local Guardado</span>
                </>
              )}
            </div>

            <button
              onClick={handleExportToExcel}
              className="px-3 py-1.5 text-xs font-semibold bg-white text-[#107c41] hover:bg-emerald-50 rounded-xs border border-white/40 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar libro completo en formato Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleResetData}
              className="px-2.5 py-1.5 text-xs font-medium bg-[#0f6f39] hover:bg-[#0a4e28] text-white rounded-xs border border-white/20 transition-colors cursor-pointer flex items-center gap-1"
              title="Restablecer valores originales de 1ra intervención"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restablecer</span>
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            BARRA DE FILTROS ESTRICTOS (SOLO REGIÓN: PASCO/JUNÍN Y UGEL/DRE)
           ───────────────────────────────────────────────────────────── */}
        <div className="bg-[#f1f5f9] px-4 py-2.5 border-b border-[#cbd5e1] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filtro 1: Región (Pasco y Junín) */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xs border border-[#cbd5e1] shadow-2xs">
              <MapPin className="w-4 h-4 text-[#107c41] shrink-0" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Región:</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xs border border-slate-200">
                {(['Junín', 'Pasco'] as Region[]).map((reg) => {
                  const isSel = regionSeleccionada === reg
                  return (
                    <button
                      key={reg}
                      onClick={() => setRegionSeleccionada(reg)}
                      className={`px-3 py-1 text-xs font-semibold rounded-xs cursor-pointer transition-all ${
                        isSel
                          ? 'bg-[#107c41] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      {reg}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Filtro 2: UGEL / DRE */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xs border border-[#cbd5e1] shadow-2xs">
              <Building2 className="w-4 h-4 text-[#107c41] shrink-0" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">UGEL / DRE:</span>
              <select
                value={entidadId}
                onChange={(e) => setEntidadId(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[#107c41] rounded-xs px-1.5 py-0.5 cursor-pointer"
              >
                {entidadesFiltradas.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.tipo === 'DRE' ? `★ ${ent.nombre}` : ent.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag indicador del tipo y Direcciones asignadas */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-semibold border bg-white text-slate-700 border-slate-300">
                <span className="w-2 h-2 rounded-xs bg-[#107c41]"></span>
                <span>Nivel: {isDRE ? 'Regional (DRE)' : 'Local (UGEL)'}</span>
              </div>

              <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-xs text-xs font-mono bg-emerald-50 border border-emerald-300 text-emerald-800">
                <strong>{direccionesAsignadas.length} Direcciones:</strong>
                <span className="text-[11px] text-emerald-700">{direccionesAsignadas.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Navegación por Pestañas tipo Excel */}
          <div className="flex items-center bg-white rounded-xs border border-[#cbd5e1] p-0.5 overflow-x-auto">
            {[
              { id: 'todo', label: 'Ver Todo' },
              { id: 'resumen', label: '1. Resumen' },
              { id: 'hitos', label: '2. Hitos' },
              { id: 'planes', label: '3. Plan Distribución' },
              { id: 'cdl', label: '4. Cuadros CDL' },
              { id: 'comunicacion', label: '5. Comunicación Directores' },
              { id: 'participantes', label: '6. Participantes' },
              { id: 'evidencias', label: '7. Evidencias' },
            ].map((tab) => {
              const active = activeSheet === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSheet(tab.id as any)}
                  className={`px-3 py-1 text-xs font-medium rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#107c41] text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          CONTENIDO PRINCIPAL
         ───────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 pt-5 space-y-6">

        {/* Banner de Entidad Activa */}
        <div className="bg-white border border-[#cbd5e1] rounded-xs p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-[#107c41]">
          <div className="flex-1 min-w-[280px]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#107c41]">
                Intervención de Asistencia Técnica y Monitoreo
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Región {regionSeleccionada}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono font-bold text-slate-600">
                {direccionesAsignadas.length} Direcciones Pedagógicas Oficiales
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
              <span>{entidadActual.nombre}</span>
              <span className="text-xs px-2 py-0.5 font-bold rounded-xs bg-emerald-100 text-emerald-800 border border-emerald-300">
                {entidadActual.tipo}
              </span>
            </h2>

            {isEditingResumen ? (
              <div className="mt-2 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase block">Objetivo de la intervención:</label>
                <textarea
                  value={editResumen.objetivo}
                  onChange={(e) => setEditResumen({ ...editResumen, objetivo: e.target.value })}
                  rows={2}
                  className="w-full text-xs p-1.5 border border-[#107c41] rounded-xs font-sans bg-emerald-50/20"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                <strong className="text-slate-700">Objetivo: </strong>
                {currentData.resumen.objetivo}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 bg-[#f8fafc] px-3.5 py-2 rounded-xs border border-[#cbd5e1] text-xs">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Última fecha</span>
              {isEditingResumen ? (
                <input
                  type="text"
                  value={editResumen.ultimaFecha}
                  onChange={(e) => setEditResumen({ ...editResumen, ultimaFecha: e.target.value })}
                  className="w-24 text-xs font-mono px-1 py-0.5 border border-[#107c41] rounded-xs bg-white"
                />
              ) : (
                <span className="font-bold text-slate-800 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[#107c41]" />
                  {currentData.resumen.ultimaFecha}
                </span>
              )}
            </div>
            <div className="w-px h-8 bg-slate-300"></div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Alcance</span>
              {isEditingResumen ? (
                <select
                  value={editResumen.alcance}
                  onChange={(e) => setEditResumen({ ...editResumen, alcance: e.target.value as any })}
                  className="text-xs font-bold px-1 py-0.5 border border-[#107c41] rounded-xs bg-white"
                >
                  <option value="Local">Local</option>
                  <option value="Regional">Regional</option>
                </select>
              ) : (
                <span className="font-bold text-slate-800">{currentData.resumen.alcance}</span>
              )}
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            PUNTO 1: TARJETAS PRINCIPALES DE RESUMEN DE INTERVENCIÓN
           ═════════════════════════════════════════════════════════════ */}
        {(activeSheet === 'todo' || activeSheet === 'resumen') && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between border-b border-[#cbd5e1] pb-2 gap-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#107c41] rounded-xs inline-block"></span>
                <span>Punto 1: Resumen General de Intervención (KPIs)</span>
              </h3>

              {/* Botón de acción FUERA del cuadro */}
              <div className="flex items-center gap-2">
                {isEditingResumen ? (
                  <>
                    <button
                      onClick={handleSaveResumen}
                      className="px-2.5 py-1 bg-[#107c41] hover:bg-[#0f6f39] text-white text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Resumen</span>
                    </button>
                    <button
                      onClick={handleCancelResumen}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-xs font-medium rounded-xs flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancelar</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingResumen(true)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Editar valores de resumen"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#107c41]" />
                    <span>Editar Resumen</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Tarjeta 1: Total Intervenciones */}
              <div className="bg-white border border-[#cbd5e1] rounded-xs p-3.5 shadow-2xs hover:border-[#107c41] transition-colors">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Intervenciones</span>
                  <Calendar className="w-4 h-4 text-[#107c41]" />
                </div>
                {isEditingResumen ? (
                  <input
                    type="number"
                    value={editResumen.intervencionesTotal}
                    onChange={(e) => setEditResumen({ ...editResumen, intervencionesTotal: Number(e.target.value) })}
                    className="text-2xl font-black text-slate-900 font-mono w-20 border border-[#107c41] rounded-xs px-1.5 py-0.5 bg-white"
                  />
                ) : (
                  <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                    {currentData.resumen.intervencionesTotal}
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <span>Con la</span>
                  <span className="font-semibold text-slate-700">{entidadActual.nombre}</span>
                </div>
              </div>

              {/* Tarjeta 2: Participantes Acumulados */}
              <div className="bg-white border border-[#cbd5e1] rounded-xs p-3.5 shadow-2xs hover:border-[#107c41] transition-colors">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Participantes</span>
                  <Users className="w-4 h-4 text-[#107c41]" />
                </div>
                {isEditingResumen ? (
                  <input
                    type="number"
                    value={editResumen.participantesTotal}
                    onChange={(e) => setEditResumen({ ...editResumen, participantesTotal: Number(e.target.value) })}
                    className="text-2xl font-black text-slate-900 font-mono w-24 border border-[#107c41] rounded-xs px-1.5 py-0.5 bg-white"
                  />
                ) : (
                  <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                    {currentData.resumen.participantesTotal}
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                  <span>Según Actas Oficiales</span>
                </div>
              </div>

              {/* Tarjeta 3: Modalidad Virtual */}
              <div className="bg-white border border-[#cbd5e1] rounded-xs p-3.5 shadow-2xs hover:border-[#107c41] transition-colors">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Virtuales</span>
                  <Monitor className="w-4 h-4 text-blue-600" />
                </div>
                {isEditingResumen ? (
                  <input
                    type="number"
                    value={editResumen.intervencionesVirtuales}
                    onChange={(e) => setEditResumen({ ...editResumen, intervencionesVirtuales: Number(e.target.value) })}
                    className="text-2xl font-black text-slate-900 font-mono w-20 border border-[#107c41] rounded-xs px-1.5 py-0.5 bg-white"
                  />
                ) : (
                  <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                    {currentData.resumen.intervencionesVirtuales}
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-1">
                  <span>Sesiones en línea (Meet / Zoom)</span>
                </div>
              </div>

              {/* Tarjeta 4: Modalidad Presencial */}
              <div className="bg-white border border-[#cbd5e1] rounded-xs p-3.5 shadow-2xs hover:border-[#107c41] transition-colors">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Presenciales</span>
                  <Building2 className="w-4 h-4 text-amber-600" />
                </div>
                {isEditingResumen ? (
                  <input
                    type="number"
                    value={editResumen.intervencionesPresenciales}
                    onChange={(e) => setEditResumen({ ...editResumen, intervencionesPresenciales: Number(e.target.value) })}
                    className="text-2xl font-black text-slate-900 font-mono w-20 border border-[#107c41] rounded-xs px-1.5 py-0.5 bg-white"
                  />
                ) : (
                  <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                    {currentData.resumen.intervencionesPresenciales}
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-1">
                  <span>Reuniones en sede territorial</span>
                </div>
              </div>
            </div>

            
            {/* Tabla 1 — Asistencia (Formato Oficial Word Entregable) */}
            <div className="bg-white border border-[#cbd5e1] rounded-xs shadow-2xs overflow-hidden mt-3">
              <div className="bg-[#f1f5f9] px-4 py-2 border-b border-[#cbd5e1] flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-[#107c41]" />
                    Tabla 1 — Asistencia
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {entidadActual.nombre} · Formato oficial entregable Producto 03
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyCuadro03TSV}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Copiar Tabla 1 al portapapeles para pegar directo en Word o Excel"
                  >
                    {copiedSection === 'cuadro03' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">¡Copiado para Word!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copiar datos</span>
                      </>
                    )}
                  </button>

                  {isEditingCuadro03 ? (
                    <>
                      <button
                        onClick={handleSaveCuadro03}
                        className="px-2.5 py-1 bg-[#107c41] hover:bg-[#0f6f39] text-white text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar</span>
                      </button>
                      <button
                        onClick={handleCancelCuadro03}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-xs font-medium rounded-xs flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancelar</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditingCuadro03(true)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#107c41]" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto select-text">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#e9eff6] border-b border-[#cbd5e1] text-slate-800 font-bold text-center text-xs">
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-36">Intervenciones</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-40 font-mono">Fecha</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-36">Modalidad</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-36">Alcance</th>
                      <th className="py-2.5 px-3 w-36">Participantes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cbd5e1] text-center">
                    {(isEditingCuadro03 ? editCuadro03 : (currentData.registroCuadro03 || [])).map((s, idx) => (
                      <tr key={idx} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3 border-r border-[#cbd5e1] font-mono font-semibold text-slate-700">
                          1
                        </td>

                        <td className="py-2.5 px-3 border-r border-[#cbd5e1] font-mono text-slate-800">
                          {isEditingCuadro03 ? (
                            <input
                              type="text"
                              value={s.fecha}
                              onChange={(e) => {
                                const updated = editCuadro03.map((item, i) =>
                                  i === idx ? { ...item, fecha: e.target.value } : item
                                )
                                setEditCuadro03(updated)
                              }}
                              className="w-full text-xs font-mono px-1 py-0.5 border border-[#107c41] rounded-xs bg-white text-center"
                            />
                          ) : (
                            s.fecha.replace(/\//g, '-')
                          )}
                        </td>

                        <td className="py-2.5 px-3 border-r border-[#cbd5e1] text-slate-800 font-medium">
                          {isEditingCuadro03 ? (
                            <select
                              value={s.modalidad}
                              onChange={(e) => {
                                const updated = editCuadro03.map((item, i) =>
                                  i === idx ? { ...item, modalidad: e.target.value as any } : item
                                )
                                setEditCuadro03(updated)
                              }}
                              className="w-full text-xs px-1 py-0.5 border border-[#107c41] rounded-xs bg-white text-center"
                            >
                              <option value="Virtual">Virtual</option>
                              <option value="Presencial">Presencial</option>
                            </select>
                          ) : (
                            s.modalidad
                          )}
                        </td>

                        <td className="py-2.5 px-3 border-r border-[#cbd5e1] text-slate-800 font-medium">
                          {isEditingCuadro03 ? (
                            <input
                              type="text"
                              value={s.alcance}
                              onChange={(e) => {
                                const updated = editCuadro03.map((item, i) =>
                                  i === idx ? { ...item, alcance: e.target.value } : item
                                )
                                setEditCuadro03(updated)
                              }}
                              className="w-full text-xs px-1 py-0.5 border border-[#107c41] rounded-xs bg-white text-center"
                            />
                          ) : (
                            s.alcance
                          )}
                        </td>

                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {isEditingCuadro03 ? (
                            <input
                              type="number"
                              value={s.participantes}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0
                                const updated = editCuadro03.map((item, i) =>
                                  i === idx ? { ...item, participantes: val } : item
                                )
                                setEditCuadro03(updated)
                              }}
                              className="w-full text-xs font-mono font-bold px-1 py-0.5 border border-[#107c41] rounded-xs bg-white text-center"
                            />
                          ) : (
                            s.participantes
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pie de tabla oficial */}
              <div className="px-4 py-2 bg-slate-50 border-t border-[#cbd5e1] text-xs text-slate-700">
                <span className="font-bold">Fuente:</span> Formulario Google Form, registro fotográfico
              </div>
            </div>

            {/* Texto Narrativo Oficial del Informe — Punto 1 */}
            <PreambuloCard
              titulo={`Texto Narrativo Oficial — Punto 1: Asistencia y Articulación Territorial (${entidadActual.nombre})`}
              puntoId="p1-cuadro03"
              subtitulo="Descripción de intervenciones e hitos abordados para el informe Word"
              contenido={currentData.preambulos?.cuadro03?.consolidado || ''}
              onGuardar={(nuevo) => handleSavePreambuloCuadro03(nuevo, 'consolidado')}
              onCopiar={() => handleCopyTexto(
                currentData.preambulos?.cuadro03?.consolidado || '',
                'preambulo-cuadro03'
              )}
              isCopiado={copiedSection === 'preambulo-cuadro03'}
            />
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════
            PUNTO 2: TABLA DE HITOS DE SEGUIMIENTO
           ═════════════════════════════════════════════════════════════ */}
        {(activeSheet === 'todo' || activeSheet === 'hitos') && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between border-b border-[#cbd5e1] pb-2 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#107c41] rounded-xs inline-block"></span>
                  <span>Punto 2: Tablero de Seguimiento de Hitos Clave</span>
                </h3>
                <span className="text-xs text-slate-500">
                  Nivel activo: <strong className="text-[#107c41]">{isDRE ? 'DRE (Regional)' : 'UGEL (Local)'}</strong>
                </span>
              </div>
            </div>

            {/* Preámbulo Narrativo Oficial: Punto 2 / Hitos */}
            <PreambuloCard
              titulo={`Preámbulo Narrativo Oficial — Punto 2: Seguimiento de Hitos de Planificación (${isDRE ? 'DRE' : 'UGEL'})`}
              puntoId="p2-hitos"
              subtitulo="Orientaciones Brindadas y Compromisos Acordados"
              contenido={currentData.preambulos?.hitos || ''}
              onGuardar={handleSavePreambuloHitos}
              onCopiar={() => handleCopyTexto(currentData.preambulos?.hitos || '', 'preambulo-hitos')}
              isCopiado={copiedSection === 'preambulo-hitos'}
            />

            {/* Tabla de Hitos con BOTONES INTEGRADOS en la barra de la tabla */}
            <div className="bg-white border border-[#cbd5e1] rounded-xs shadow-2xs overflow-hidden">
              <div className="bg-[#f1f5f9] px-4 py-2 border-b border-[#cbd5e1] flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#107c41]" />
                  Seguimiento de Hitos Oficiales — {entidadActual.nombre}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyHitosTableTSV}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Copiar tabla completa al portapapeles para pegar en Excel"
                  >
                    {copiedSection === 'hitos' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">¡Copiado para Excel!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copiar datos</span>
                      </>
                    )}
                  </button>

                  {isEditingHitos ? (
                    <>
                      <button
                        onClick={handleSaveHitos}
                        className="px-2.5 py-1 bg-[#107c41] hover:bg-[#0f6f39] text-white text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar Hitos</span>
                      </button>
                      <button
                        onClick={handleCancelHitos}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-xs font-medium rounded-xs flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancelar</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditingHitos(true)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Editar hitos y plazos"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#107c41]" />
                      <span>Editar Hitos</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto select-text">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f1f5f9] border-b border-[#cbd5e1] text-slate-700 font-bold uppercase text-[11px]">
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-12 text-center font-mono">N°</th>
                      <th className="py-2.5 px-4 border-r border-[#cbd5e1]">Hito de Planificación</th>
                      <th className="py-2.5 px-4 border-r border-[#cbd5e1] w-64">Instrumento / Entregable</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-48 font-mono">Plazo</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-36 text-center">Estado</th>
                      <th className="py-2.5 px-4">Situación / Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cbd5e1]">
                    {(isEditingHitos ? editHitos : currentData.hitos).map((hito, idx) => {
                      return (
                        <tr key={hito.id} className="hover:bg-[#f8fafc] transition-colors">
                          <td className="py-2.5 px-3 border-r border-[#cbd5e1] text-center font-mono text-slate-500 font-semibold">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-4 border-r border-[#cbd5e1] font-semibold text-slate-900">
                            {hito.nombre}
                          </td>
                          <td className="py-2.5 px-4 border-r border-[#cbd5e1] text-slate-700 font-medium">
                            {isEditingHitos ? (
                              <input
                                type="text"
                                value={hito.subproceso}
                                onChange={(e) => {
                                  const updated = editHitos.map((h) =>
                                    h.id === hito.id ? { ...h, subproceso: e.target.value } : h
                                  )
                                  setEditHitos(updated)
                                }}
                                className="w-full text-xs px-1.5 py-0.5 border border-[#107c41] rounded-xs bg-white text-slate-800"
                                placeholder="Instrumento o entregable formal..."
                              />
                            ) : (
                              hito.subproceso
                            )}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#cbd5e1] font-mono text-slate-700">
                            {isEditingHitos ? (
                              <input
                                type="text"
                                value={hito.plazo}
                                onChange={(e) => {
                                  const updated = editHitos.map((h) =>
                                    h.id === hito.id ? { ...h, plazo: e.target.value } : h
                                  )
                                  setEditHitos(updated)
                                }}
                                className="w-full text-xs font-mono px-1.5 py-0.5 border border-[#107c41] rounded-xs bg-white"
                              />
                            ) : (
                              hito.plazo
                            )}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#cbd5e1] text-center">
                            {isEditingHitos ? (
                              <select
                                value={hito.estado}
                                onChange={(e) => {
                                  const updated = editHitos.map((h) =>
                                    h.id === hito.id ? { ...h, estado: e.target.value as any } : h
                                  )
                                  setEditHitos(updated)
                                }}
                                className="text-xs font-bold px-2 py-1 rounded-xs border border-slate-300 w-full text-center bg-white cursor-pointer"
                              >
                                <option value="Aprobado">Aprobado</option>
                                <option value="En proceso">En proceso</option>
                                <option value="En planificación">En planificación</option>
                                <option value="Sin elaborar">Sin elaborar</option>
                              </select>
                            ) : (
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-xs text-[11px] font-bold border text-center ${
                                  hito.estado === 'Aprobado'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : hito.estado === 'En proceso'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : hito.estado === 'En planificación'
                                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                                    : 'bg-rose-50 text-rose-800 border-rose-300'
                                }`}
                              >
                                {hito.estado}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 text-xs">
                            {isEditingHitos ? (
                              <input
                                type="text"
                                value={hito.observacion}
                                onChange={(e) => {
                                  const updated = editHitos.map((h) =>
                                    h.id === hito.id ? { ...h, observacion: e.target.value } : h
                                  )
                                  setEditHitos(updated)
                                }}
                                className="w-full text-xs px-2 py-0.5 border border-[#107c41] rounded-xs bg-white"
                              />
                            ) : (
                              hito.observacion
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════
            PUNTO 3: PLAN DE DISTRIBUCIÓN Y ENLACES DIGITALES
           ═════════════════════════════════════════════════════════════ */}
        {(activeSheet === 'todo' || activeSheet === 'planes') && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between border-b border-[#cbd5e1] pb-2 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#107c41] rounded-xs inline-block"></span>
                  <span>Punto 3: Plan de Distribución ({isDRE ? 'PDR' : 'PDL'}) y Enlaces Digitales</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Control formal de instrumentos de gestión con hipervínculo directo al repositorio de evidencias
                </p>
              </div>
            </div>

            {/* Preámbulo Narrativo Oficial: Punto 3 / Hito 1.4 */}
            <PreambuloCard
              titulo={`Preámbulo Narrativo Oficial — Punto 3: Elaboración y Aprobación del Plan de Distribución (${isDRE ? 'PDR' : 'PDL'})`}
              puntoId="p3-planes"
              subtitulo="1.1. Hito 1.4: Elaboración y aprobación del Plan de Distribución Local (PDL)"
              contenido={currentData.preambulos?.planes || ''}
              onGuardar={handleSavePreambuloPlanes}
              onCopiar={() => handleCopyTexto(currentData.preambulos?.planes || '', 'preambulo-planes')}
              isCopiado={copiedSection === 'preambulo-planes'}
            />

            {/* Tabla de Planes con BOTONES INTEGRADOS en la barra de la tabla */}
            <div className="bg-white border border-[#cbd5e1] rounded-xs shadow-2xs overflow-hidden">
              <div className="bg-[#f1f5f9] px-4 py-2 border-b border-[#cbd5e1] flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-[#107c41]" />
                  Tabla 3 — Aprobación del Plan de Distribución ({isDRE ? 'PDR' : 'PDL'})
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyPlanesTableTSV}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Copiar tabla completa de planes al portapapeles para pegar en Excel"
                  >
                    {copiedSection === 'planes' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">¡Copiado para Excel!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copiar datos</span>
                      </>
                    )}
                  </button>

                  {isEditingPlanes ? (
                    <>
                      <button
                        onClick={handleSavePlanes}
                        className="px-2.5 py-1 bg-[#107c41] hover:bg-[#0f6f39] text-white text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar</span>
                      </button>
                      <button
                        onClick={handleCancelPlanes}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-xs font-medium rounded-xs flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancelar</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditingPlanes(true)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Editar componentes del Plan de Distribución"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#107c41]" />
                      <span>Editar Plan</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto select-text">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f1f5f9] border-b border-[#cbd5e1] text-slate-700 font-bold uppercase text-[11px]">
                      <th className="py-2.5 px-4 border-r border-[#cbd5e1]">Hito</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-36 text-center">Estado Aprobación</th>
                      <th className="py-2.5 px-4 border-r border-[#cbd5e1] w-52">Documento Formal / RD</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-28 font-mono text-center">Fecha</th>
                      <th className="py-2.5 px-4 border-r border-[#cbd5e1]">Observaciones</th>
                      <th className="py-2.5 px-4 min-w-[260px]">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cbd5e1]">
                    {(isEditingPlanes ? editPlanes : currentData.planes).map((plan) => (
                      <tr key={plan.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-4 border-r border-[#cbd5e1] font-semibold text-slate-900">
                          {plan.planNombre}
                        </td>

                        <td className="py-2.5 px-3 border-r border-[#cbd5e1] text-center">
                          {isEditingPlanes ? (
                            <select
                              value={plan.estado}
                              onChange={(e) => {
                                const updated = editPlanes.map((p) =>
                                  p.id === plan.id ? { ...p, estado: e.target.value as any } : p
                                )
                                setEditPlanes(updated)
                              }}
                              className="text-xs font-bold px-2 py-1 rounded-xs border border-slate-300 w-full bg-white cursor-pointer"
                            >
                              <option value="Aprobado">Aprobado</option>
                              <option value="En proceso">En proceso</option>
                              <option value="En elaboración">En elaboración</option>
                              <option value="En revisión">En revisión</option>
                              <option value="Sin elaborar">Sin elaborar</option>
                            </select>
                          ) : (
                            <span className="font-semibold text-slate-800 text-xs">
                              {plan.estado}
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-4 border-r border-[#cbd5e1] text-slate-700">
                          {isEditingPlanes ? (
                            <input
                              type="text"
                              value={plan.documentoAprobacion}
                              onChange={(e) => {
                                const updated = editPlanes.map((p) =>
                                  p.id === plan.id ? { ...p, documentoAprobacion: e.target.value } : p
                                )
                                setEditPlanes(updated)
                              }}
                              className="w-full text-xs px-2 py-0.5 border border-[#107c41] rounded-xs bg-white"
                            />
                          ) : (
                            <span className="font-medium text-slate-800">{plan.documentoAprobacion}</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 border-r border-[#cbd5e1] text-center font-mono text-slate-700">
                          {isEditingPlanes ? (
                            <input
                              type="text"
                              value={plan.fechaAprobacion}
                              onChange={(e) => {
                                const updated = editPlanes.map((p) =>
                                  p.id === plan.id ? { ...p, fechaAprobacion: e.target.value } : p
                                )
                                setEditPlanes(updated)
                              }}
                              className="w-24 text-xs font-mono px-1 py-0.5 border border-[#107c41] rounded-xs bg-white text-center"
                            />
                          ) : (
                            plan.fechaAprobacion
                          )}
                        </td>

                        <td className="py-2.5 px-4 border-r border-[#cbd5e1] text-slate-600 text-xs">
                          {isEditingPlanes ? (
                            <input
                              type="text"
                              value={plan.observacion}
                              onChange={(e) => {
                                const updated = editPlanes.map((p) =>
                                  p.id === plan.id ? { ...p, observacion: e.target.value } : p
                                )
                                setEditPlanes(updated)
                              }}
                              className="w-full text-xs px-2 py-0.5 border border-[#107c41] rounded-xs bg-white"
                            />
                          ) : (
                            plan.observacion
                          )}
                        </td>

                        <td className="py-2.5 px-4">
                          {isEditingPlanes ? (
                            <input
                              type="text"
                              value={plan.enlaceUrl}
                              onChange={(e) => {
                                const updated = editPlanes.map((p) =>
                                  p.id === plan.id ? { ...p, enlaceUrl: e.target.value } : p
                                )
                                setEditPlanes(updated)
                              }}
                              className="w-full text-xs px-2 py-0.5 border border-[#107c41] rounded-xs font-mono bg-white"
                              placeholder="https://drive.google.com/..."
                            />
                          ) : plan.enlaceUrl ? (
                            <a
                              href={plan.enlaceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:text-blue-900 underline font-mono text-[11px] break-all block"
                              title={plan.enlaceUrl}
                            >
                              {plan.enlaceUrl}
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">No asignado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pie de tabla oficial */}
              <div className="px-4 py-2 bg-slate-50 border-t border-[#cbd5e1] text-xs text-slate-700">
                <span className="font-bold">Fuente:</span> Actas de asistencia técnica
              </div>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════
            PUNTO 4: NIVEL DE AVANCE DE CUADROS DE DISTRIBUCIÓN
            (Ajustado exactamente a las direcciones de CADA UGEL)
           ═════════════════════════════════════════════════════════════ */}
        {(activeSheet === 'todo' || activeSheet === 'cdl') && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-[#cbd5e1] pb-2 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#107c41] rounded-xs inline-block"></span>
                  <span>Punto 4: Nivel de Avance de Cuadros de Distribución (CDL)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Desglose por las {totalesCDL.totalDirecciones} direcciones pedagógicas asignadas a {entidadActual.nombre} (Datos diferenciados para el informe)
                </p>
              </div>
            </div>

            {/* Preámbulo Narrativo Oficial: Punto 4 / Cuadros CDL */}
            <PreambuloCard
              titulo={`Preámbulo Narrativo Oficial — Punto 4: Elaboración del Cuadro de Distribución (CDL)`}
              puntoId="p4-cdl"
              subtitulo="Diagnóstico Situacional por Direcciones Pedagógicas"
              contenido={currentData.preambulos?.cdl || ''}
              onGuardar={handleSavePreambuloCDL}
              onCopiar={() => handleCopyTexto(currentData.preambulos?.cdl || '', 'preambulo-cdl')}
              isCopiado={copiedSection === 'preambulo-cdl'}
            />

            {/* Tabla CDL con BOTONES INTEGRADOS en la barra de la tabla */}
            <div className="bg-white border border-[#cbd5e1] rounded-xs shadow-2xs overflow-hidden">
              <div className="bg-[#f1f5f9] px-4 py-2 border-b border-[#cbd5e1] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-[#107c41]" />
                    Matriz de Cobertura según Direcciones de {entidadActual.nombre}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded-xs font-mono font-bold">
                      {totalesCDL.totalDirecciones} Direcciones Asignadas
                    </span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-xs font-mono font-bold border border-emerald-300">
                      {totalesCDL.conAvance} de {totalesCDL.totalDirecciones} Culminadas
                    </span>
                  </div>
                </div>

                {/* Botones de acción PEGADOS al cuadro */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyCDLTableTSV}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Copiar matriz completa al portapapeles para pegar en Excel"
                  >
                    {copiedSection === 'cdl' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">¡Copiado para Excel!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copiar datos</span>
                      </>
                    )}
                  </button>

                  {isEditingCDL ? (
                    <>
                      <button
                        onClick={handleSaveCDL}
                        className="px-2.5 py-1 bg-[#107c41] hover:bg-[#0f6f39] text-white text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar Matriz</span>
                      </button>
                      <button
                        onClick={handleCancelCDL}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-xs font-medium rounded-xs flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancelar</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditingCDL(true)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Editar porcentaje de avance y estados de la matriz"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#107c41]" />
                      <span>Editar Matriz CDL</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto select-text">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#cbd5e1] text-slate-700 font-bold uppercase text-[11px]">
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-12 text-center font-mono">N°</th>
                      <th className="py-2.5 px-4 border-r border-[#cbd5e1]">Dirección Pedagógica</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-24 text-center font-mono">Código</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-36 text-center font-mono">% Avance Declarado</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-32 text-center">¿Elaboró Cuadro?</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-32 text-center">Carga en MC-SIGA</th>
                      <th className="py-2.5 px-3 text-center font-mono w-32">Plazo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cbd5e1]">
                    {(isEditingCDL ? editCDL : currentData.nivelesCDL).map((n, idx) => (
                      <tr key={n.codigoDireccion || n.nivel} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3 border-r border-[#cbd5e1] text-center font-mono text-slate-500 font-semibold">
                          {idx + 1}
                        </td>

                        <td className="py-2.5 px-4 border-r border-[#cbd5e1] font-semibold text-slate-900">
                          {n.nivel}
                        </td>

                        <td className="py-2.5 px-3 border-r border-[#cbd5e1] text-center font-mono">
                          <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {n.codigoDireccion}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 border-r border-[#cbd5e1] text-center font-mono">
                          {isEditingCDL ? (
                            <div className="flex items-center gap-1 justify-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={n.porcentajeAvance}
                                onChange={(e) => {
                                  const val = Math.min(100, Math.max(0, Number(e.target.value) || 0))
                                  const newElaboro = deriveElaboroCuadro(val)
                                  const newCarga = deriveCargaMCSIGA(val)
                                  const updated = editCDL.map((item) =>
                                    item.codigoDireccion === n.codigoDireccion
                                      ? {
                                          ...item,
                                          porcentajeAvance: val,
                                          elaboroCuadro: newElaboro,
                                          cargaMCSIGA: newCarga,
                                        }
                                      : item
                                  )
                                  setEditCDL(updated)
                                }}
                                className="w-16 text-xs font-mono font-bold text-center px-1 py-0.5 border border-[#107c41] rounded-xs bg-white"
                              />
                              <span className="font-bold text-slate-700">%</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 justify-center">
                              <span className="font-bold text-slate-800 font-mono text-xs w-10 text-right">{n.porcentajeAvance}%</span>
                              <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    n.porcentajeAvance === 100
                                      ? 'bg-[#107c41]'
                                      : n.porcentajeAvance >= 50
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${n.porcentajeAvance}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="py-2.5 px-3 border-r border-[#cbd5e1] text-center">
                          {isEditingCDL ? (
                            <select
                              value={n.elaboroCuadro}
                              onChange={(e) => {
                                const estado = e.target.value as 'Completado' | 'En proceso' | 'Sin avance'
                                const avance = estado === 'Completado' ? 100 : estado === 'Sin avance' ? 0 : (n.porcentajeAvance > 0 && n.porcentajeAvance < 100 ? n.porcentajeAvance : 50)
                                const carga = deriveCargaMCSIGA(avance)
                                const updated = editCDL.map((item) =>
                                  item.codigoDireccion === n.codigoDireccion
                                    ? {
                                        ...item,
                                        elaboroCuadro: estado,
                                        porcentajeAvance: avance,
                                        cargaMCSIGA: carga,
                                      }
                                    : item
                                )
                                setEditCDL(updated)
                              }}
                              className="text-xs font-bold px-1.5 py-1 rounded-xs border border-slate-300 w-full text-center bg-white cursor-pointer"
                            >
                              <option value="Completado">Completado</option>
                              <option value="En proceso">En proceso</option>
                              <option value="Sin avance">Sin avance</option>
                            </select>
                          ) : (
                            (() => {
                              const currentPct = Number(n.porcentajeAvance) || 0
                              const currentElaboro = deriveElaboroCuadro(currentPct)
                              return (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold border ${
                                    currentElaboro === 'Completado'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : currentElaboro === 'En proceso'
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : 'bg-slate-100 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {currentElaboro}
                                </span>
                              )
                            })()
                          )}
                        </td>

                        <td className="py-2.5 px-3 border-r border-[#cbd5e1] text-center">
                          {isEditingCDL ? (
                            <select
                              value={n.cargaMCSIGA}
                              onChange={(e) => {
                                const updated = editCDL.map((item) =>
                                  item.codigoDireccion === n.codigoDireccion
                                    ? { ...item, cargaMCSIGA: e.target.value as any }
                                    : item
                                )
                                setEditCDL(updated)
                              }}
                              className="text-xs font-bold px-1.5 py-1 rounded-xs border border-slate-300 w-full text-center bg-white cursor-pointer"
                            >
                              <option value="Cargado">Cargado</option>
                              <option value="En proceso">En proceso</option>
                              <option value="Pendiente">Pendiente</option>
                            </select>
                          ) : (
                            (() => {
                              const currentPct = Number(n.porcentajeAvance) || 0
                              const currentCarga = deriveCargaMCSIGA(currentPct)
                              return (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold border ${
                                    currentCarga === 'Cargado'
                                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                                      : currentCarga === 'En proceso'
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : 'bg-slate-100 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {currentCarga}
                                </span>
                              )
                            })()
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                          {isEditingCDL ? (
                            <input
                              type="text"
                              value={n.fechaEntrega}
                              onChange={(e) => {
                                const updated = editCDL.map((item) =>
                                  item.codigoDireccion === n.codigoDireccion
                                    ? { ...item, fechaEntrega: e.target.value }
                                    : item
                                )
                                setEditCDL(updated)
                              }}
                              className="w-full text-xs font-mono text-center px-1 py-0.5 border border-[#107c41] rounded-xs bg-white"
                            />
                          ) : (
                            <span>{n.fechaEntrega ? n.fechaEntrega.split(' ')[0] : '22/10/2026'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gráficos Estadísticos Recharts (Máximo 2 por fila) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Gráfico 1: Estado de Cuadros por Dirección */}
              <div className="bg-white border border-[#cbd5e1] rounded-xs p-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <PieChartIcon className="w-3.5 h-3.5 text-[#107c41]" />
                    Distribución de Estado de Cuadros
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    Total: {totalesCDL.totalDirecciones}
                  </span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataPieEstado}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="46%"
                        outerRadius={70}
                        innerRadius={42}
                        paddingAngle={dataPieEstado.length > 1 ? 4 : 0}
                        label={({ name, value, percent }) => `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                        labelLine={true}
                      >
                        {dataPieEstado.map((entry, index) => (
                          <Cell key={`cell-pie-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any) => [`${val} Direcciones`, name]}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontSize: '11px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                        payload={[
                          { value: `Completadas (${totalesCDL.conAvance})`, type: 'rect', color: '#107c41' },
                          { value: `En proceso (${totalesCDL.enProceso})`, type: 'rect', color: '#d97706' },
                          { value: `Sin avance (${totalesCDL.sinAvance})`, type: 'rect', color: '#64748b' },
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico 2: Nivel de Avance % Declarado por Dirección (Letras derechas / horizontales) */}
              <div className="bg-white border border-[#cbd5e1] rounded-xs p-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-[#107c41]" />
                    Avance (%) por Dirección Pedagógica
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-200">
                    Escala: 0% a 100%
                  </span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataBarrasAgrupadas} margin={{ top: 18, right: 10, left: -18, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="codigo"
                        tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                        interval={0}
                        textAnchor="middle"
                        dy={6}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: '#475569' }}
                        unit="%"
                      />
                      <Tooltip
                        formatter={(val: any) => [`${val}%`, 'Avance Declarado']}
                        labelFormatter={(lbl: any) => {
                          const item = dataBarrasAgrupadas.find((d) => d.codigo === lbl)
                          return item ? `${item.codigo} - ${item.nombre}` : lbl
                        }}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontSize: '11px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        }}
                      />
                      <Bar
                        dataKey="avance"
                        name="% Avance Declarado"
                        radius={[4, 4, 0, 0]}
                        barSize={28}
                      >
                        {dataBarrasAgrupadas.map((entry, index) => (
                          <Cell
                            key={`cell-bar-${index}`}
                            fill={entry.color}
                          />
                        ))}
                        <LabelList
                          dataKey="avance"
                          position="top"
                          formatter={(val: any) => `${val}%`}
                          style={{ fontSize: '10px', fontWeight: 'bold', fill: '#475569' }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico 3: Avance Promedio Global Territorial (Declara formalmente el Promedio de la UGEL) */}
              <div className="bg-white border border-[#cbd5e1] rounded-xs p-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#107c41]" />
                    Avance Promedio Global Territorial
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    {entidadActual.nombre}
                  </span>
                </div>
                <div className="h-64 relative flex flex-col justify-between">
                  <div className="h-44 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dataPromedioGlobal}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          startAngle={90}
                          endAngle={-270}
                          innerRadius={50}
                          outerRadius={68}
                          paddingAngle={0}
                          stroke="#cbd5e1"
                          strokeWidth={0.5}
                        >
                          <Cell fill={dataPromedioGlobal[0].color} />
                          <Cell fill={dataPromedioGlobal[1].color} />
                        </Pie>
                        <Tooltip
                          formatter={(val: any, name: any) => [`${val}%`, name]}
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            fontSize: '11px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-black font-mono text-slate-800 leading-none">
                        {totalesCDL.promedioAvance}%
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">
                        Promedio Global
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-[11px]">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-slate-500 font-medium">Meta Territorial:</span>
                      <span className="font-mono font-bold text-slate-700">100% de CDL</span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: dataPromedioGlobal[0].color }}></span>
                        Avance Declarado:
                      </span>
                      <span className="font-mono font-bold" style={{ color: dataPromedioGlobal[0].color }}>
                        {totalesCDL.promedioAvance}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
                        Brecha Restante:
                      </span>
                      <span className="font-mono font-semibold text-slate-500">
                        {100 - totalesCDL.promedioAvance}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════
            PUNTO 5: COMUNICACIÓN A LAS II.EE. Y DIRECTORES (HITO 1.7)
           ═════════════════════════════════════════════════════════════ */}
        {(activeSheet === 'todo' || activeSheet === 'comunicacion') && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between border-b border-[#cbd5e1] pb-2 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#107c41] rounded-xs inline-block"></span>
                  <span>Punto 5: Comunicación a las Instituciones Educativas (II. EE.) y Directores (Hito 1.7)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Seguimiento oficial de la emisión de Oficios Múltiples (Plazo: 27/11/2026), Capacitación a Directores (Plazo: 04/12/2026) y Estrategia de Difusión
                </p>
              </div>
            </div>

            {/* Preámbulo Narrativo Oficial: Punto 5 / Comunicación Hito 1.7 */}
            <PreambuloCard
              titulo={`Preámbulo Narrativo Oficial — Punto 5: Comunicación a II. EE. y Capacitación a Directores (Hito 1.7)`}
              puntoId="p5-comunicacion"
              subtitulo="Articulación Territorial, Pautas de Recepción y Vigilancia Social"
              contenido={currentData.preambulos?.comunicacion || ''}
              onGuardar={handleSavePreambuloComunicacion}
              onCopiar={() => handleCopyTexto(currentData.preambulos?.comunicacion || '', 'preambulo-comunicacion')}
              isCopiado={copiedSection === 'preambulo-comunicacion'}
            />

            {/* Tabla de Comunicación con BOTONES INTEGRADOS en la barra de la tabla */}
            <div className="bg-white border border-[#cbd5e1] rounded-xs shadow-2xs overflow-hidden">
              <div className="bg-[#f1f5f9] px-4 py-2 border-b border-[#cbd5e1] flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-[#107c41]" />
                  Matriz de Acciones de Comunicación y Difusión Territorial — Hito 1.7
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyComunicacionTSV}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Copiar matriz completa al portapapeles para pegar en Excel"
                  >
                    {copiedSection === 'comunicacion' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">¡Copiado para Excel!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copiar datos</span>
                      </>
                    )}
                  </button>

                  {isEditingComunicacion ? (
                    <>
                      <button
                        onClick={handleSaveComunicacion}
                        className="px-2.5 py-1 bg-[#107c41] hover:bg-[#0f6f39] text-white text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar Acciones</span>
                      </button>
                      <button
                        onClick={handleCancelComunicacion}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-xs font-medium rounded-xs flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancelar</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditingComunicacion(true)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Editar acciones de comunicación"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#107c41]" />
                      <span>Editar Acciones</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto select-text">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f1f5f9] border-b border-[#cbd5e1] text-slate-700 font-bold uppercase text-[11px]">
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-12 text-center font-mono">N°</th>
                      <th className="py-2.5 px-4 border-r border-[#cbd5e1]">Acción de Comunicación / Capacitación</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-40">Canal / Medio</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-32 font-mono text-center">Plazo Oficial</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-36 text-center">Estado</th>
                      <th className="py-2.5 px-4 w-52">Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cbd5e1]">
                    {(isEditingComunicacion ? editComunicacion : (currentData.comunicacionDirectores || [])).map((com, idx) => (
                      <tr key={com.id || idx} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3 border-r border-[#cbd5e1] text-center font-mono text-slate-500 font-semibold">
                          {idx + 1}
                        </td>

                        <td className="py-2.5 px-4 border-r border-[#cbd5e1] font-semibold text-slate-900">
                          {isEditingComunicacion ? (
                            <input
                              type="text"
                              value={com.actividad}
                              onChange={(e) => {
                                const updated = editComunicacion.map((c) =>
                                  c.id === com.id ? { ...c, actividad: e.target.value } : c
                                )
                                setEditComunicacion(updated)
                              }}
                              className="w-full text-xs px-2 py-0.5 border border-[#107c41] rounded-xs bg-white font-medium"
                            />
                          ) : (
                            com.actividad
                          )}
                        </td>

                        <td className="py-2.5 px-3 border-r border-[#cbd5e1] text-slate-700">
                          {isEditingComunicacion ? (
                            <input
                              type="text"
                              value={com.medioCanal}
                              onChange={(e) => {
                                const updated = editComunicacion.map((c) =>
                                  c.id === com.id ? { ...c, medioCanal: e.target.value } : c
                                )
                                setEditComunicacion(updated)
                              }}
                              className="w-full text-xs px-1.5 py-0.5 border border-[#107c41] rounded-xs bg-white"
                            />
                          ) : (
                            <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-xs font-medium border border-slate-200">
                              {com.medioCanal}
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 border-r border-[#cbd5e1] text-center font-mono text-slate-700">
                          {isEditingComunicacion ? (
                            <input
                              type="text"
                              value={com.plazoOficial}
                              onChange={(e) => {
                                const updated = editComunicacion.map((c) =>
                                  c.id === com.id ? { ...c, plazoOficial: e.target.value } : c
                                )
                                setEditComunicacion(updated)
                              }}
                              className="w-full text-xs font-mono px-1 py-0.5 border border-[#107c41] rounded-xs bg-white text-center"
                            />
                          ) : (
                            <span className="font-semibold">{com.plazoOficial}</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 border-r border-[#cbd5e1] text-center">
                          {isEditingComunicacion ? (
                            <select
                              value={com.estado}
                              onChange={(e) => {
                                const updated = editComunicacion.map((c) =>
                                  c.id === com.id ? { ...c, estado: e.target.value as any } : c
                                )
                                setEditComunicacion(updated)
                              }}
                              className="text-xs font-bold px-2 py-1 rounded-xs border border-slate-300 w-full bg-white cursor-pointer"
                            >
                              <option value="Aprobado">Aprobado</option>
                              <option value="En proceso">En proceso</option>
                              <option value="En planificación">En planificación</option>
                              <option value="Sin elaborar">Sin elaborar</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-xs text-[11px] font-bold border text-center ${
                                com.estado === 'Aprobado'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : com.estado === 'En proceso'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : com.estado === 'En planificación'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}
                            >
                              {com.estado}
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-4 text-slate-700 text-xs font-medium">
                          {isEditingComunicacion ? (
                            <input
                              type="text"
                              value={com.responsable}
                              onChange={(e) => {
                                const updated = editComunicacion.map((c) =>
                                  c.id === com.id ? { ...c, responsable: e.target.value } : c
                                )
                                setEditComunicacion(updated)
                              }}
                              className="w-full text-xs px-2 py-0.5 border border-[#107c41] rounded-xs bg-white"
                            />
                          ) : (
                            com.responsable
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════
            PUNTO 6: REGISTRO DE PARTICIPANTES (SUBIDA EXCEL GOOGLE FORM)
           ═════════════════════════════════════════════════════════════ */}
        {(activeSheet === 'todo' || activeSheet === 'participantes') && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between border-b border-[#cbd5e1] pb-2 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#107c41] rounded-xs inline-block"></span>
                  <span>Punto 6: Registro de Participantes de la Asistencia Técnica (Google Form)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Importa el archivo de respuestas de Google Forms o edita la lista de asistentes directamente
                </p>
              </div>

              {/* Botones de acción FUERA del cuadro */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Subir archivo Excel o CSV exportado de Google Forms"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Excel Google Form</span>
                </button>

                <button
                  onClick={copyParticipantesTSV}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Copiar lista completa de participantes para Excel"
                >
                  {copiedSection === 'participantes' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">¡Copiado para Excel!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copiar datos</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleAddParticipante}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#107c41]" />
                  <span>Agregar</span>
                </button>

                {isEditingParticipantes ? (
                  <>
                    <button
                      onClick={handleSaveParticipantes}
                      className="px-2.5 py-1 bg-[#107c41] hover:bg-[#0f6f39] text-white text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar</span>
                    </button>
                    <button
                      onClick={handleCancelParticipantes}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-xs font-medium rounded-xs flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancelar</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingParticipantes(true)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#107c41]" />
                    <span>Editar</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#cbd5e1] rounded-xs shadow-2xs overflow-hidden">
              <div className="overflow-x-auto select-text">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f1f5f9] border-b border-[#cbd5e1] text-slate-700 font-bold uppercase text-[11px]">
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-12 text-center font-mono">N°</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-36 font-mono">Marca Temporal</th>
                      <th className="py-2.5 px-4 border-r border-[#cbd5e1]">Apellidos y Nombres</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-28 font-mono">DNI</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-48">Cargo / Función</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-48">Institución / Área</th>
                      <th className="py-2.5 px-4 border-r border-[#cbd5e1]">Correo Electrónico</th>
                      <th className="py-2.5 px-3 border-r border-[#cbd5e1] w-28 font-mono">Teléfono</th>
                      <th className="py-2.5 px-2 text-center w-14">Asist.</th>
                      {isEditingParticipantes && <th className="py-2.5 px-2 text-center w-12">Borrar</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cbd5e1]">
                    {(isEditingParticipantes ? editParticipantes : (currentData.participantes || [])).map((p, idx) => (
                      <tr key={p.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2 px-3 border-r border-[#cbd5e1] text-center font-mono text-slate-500 font-semibold">
                          {idx + 1}
                        </td>

                        <td className="py-2 px-3 border-r border-[#cbd5e1] font-mono text-slate-500 text-[11px]">
                          {isEditingParticipantes ? (
                            <input
                              type="text"
                              value={p.marcaTemporal || ''}
                              onChange={(e) => {
                                const updated = editParticipantes.map((item) =>
                                  item.id === p.id ? { ...item, marcaTemporal: e.target.value } : item
                                )
                                setEditParticipantes(updated)
                              }}
                              className="w-full text-xs font-mono px-1 py-0.5 border border-[#107c41] rounded-xs bg-white"
                            />
                          ) : (
                            p.marcaTemporal || '-'
                          )}
                        </td>

                        <td className="py-2 px-4 border-r border-[#cbd5e1] font-semibold text-slate-900">
                          {isEditingParticipantes ? (
                            <input
                              type="text"
                              value={p.apellidosNombres}
                              onChange={(e) => {
                                const updated = editParticipantes.map((item) =>
                                  item.id === p.id ? { ...item, apellidosNombres: e.target.value } : item
                                )
                                setEditParticipantes(updated)
                              }}
                              className="w-full text-xs px-1 py-0.5 border border-[#107c41] rounded-xs bg-white font-semibold"
                            />
                          ) : (
                            p.apellidosNombres
                          )}
                        </td>

                        <td className="py-2 px-3 border-r border-[#cbd5e1] font-mono text-slate-700">
                          {isEditingParticipantes ? (
                            <input
                              type="text"
                              value={p.dni}
                              onChange={(e) => {
                                const updated = editParticipantes.map((item) =>
                                  item.id === p.id ? { ...item, dni: e.target.value } : item
                                )
                                setEditParticipantes(updated)
                              }}
                              className="w-full text-xs font-mono px-1 py-0.5 border border-[#107c41] rounded-xs bg-white"
                            />
                          ) : (
                            p.dni
                          )}
                        </td>

                        <td className="py-2 px-3 border-r border-[#cbd5e1] text-slate-700">
                          {isEditingParticipantes ? (
                            <input
                              type="text"
                              value={p.cargo}
                              onChange={(e) => {
                                const updated = editParticipantes.map((item) =>
                                  item.id === p.id ? { ...item, cargo: e.target.value } : item
                                )
                                setEditParticipantes(updated)
                              }}
                              className="w-full text-xs px-1 py-0.5 border border-[#107c41] rounded-xs bg-white"
                            />
                          ) : (
                            p.cargo
                          )}
                        </td>

                        <td className="py-2 px-3 border-r border-[#cbd5e1] text-slate-600">
                          {isEditingParticipantes ? (
                            <input
                              type="text"
                              value={p.institucion}
                              onChange={(e) => {
                                const updated = editParticipantes.map((item) =>
                                  item.id === p.id ? { ...item, institucion: e.target.value } : item
                                )
                                setEditParticipantes(updated)
                              }}
                              className="w-full text-xs px-1 py-0.5 border border-[#107c41] rounded-xs bg-white"
                            />
                          ) : (
                            p.institucion
                          )}
                        </td>

                        <td className="py-2 px-4 border-r border-[#cbd5e1] font-mono text-slate-600 text-[11px]">
                          {isEditingParticipantes ? (
                            <input
                              type="text"
                              value={p.correo}
                              onChange={(e) => {
                                const updated = editParticipantes.map((item) =>
                                  item.id === p.id ? { ...item, correo: e.target.value } : item
                                )
                                setEditParticipantes(updated)
                              }}
                              className="w-full text-xs font-mono px-1 py-0.5 border border-[#107c41] rounded-xs bg-white"
                            />
                          ) : (
                            p.correo
                          )}
                        </td>

                        <td className="py-2 px-3 border-r border-[#cbd5e1] font-mono text-slate-600 text-[11px]">
                          {isEditingParticipantes ? (
                            <input
                              type="text"
                              value={p.telefono || ''}
                              onChange={(e) => {
                                const updated = editParticipantes.map((item) =>
                                  item.id === p.id ? { ...item, telefono: e.target.value } : item
                                )
                                setEditParticipantes(updated)
                              }}
                              className="w-full text-xs font-mono px-1 py-0.5 border border-[#107c41] rounded-xs bg-white"
                            />
                          ) : (
                            p.telefono || '-'
                          )}
                        </td>

                        <td className="py-2 px-2 border-r border-[#cbd5e1] text-center">
                          {p.asistencia ? (
                            <span className="inline-block w-4 h-4 rounded-xs bg-emerald-100 text-emerald-800 text-center font-bold text-[10px] leading-4 border border-emerald-300">
                              ✓
                            </span>
                          ) : (
                            <span className="inline-block w-4 h-4 rounded-xs bg-rose-100 text-rose-800 text-center font-bold text-[10px] leading-4 border border-rose-300">
                              ✕
                            </span>
                          )}
                        </td>

                        {isEditingParticipantes && (
                          <td className="py-2 px-2 text-center">
                            <button
                              onClick={() => handleRemoveParticipante(p.id)}
                              className="text-rose-600 hover:text-rose-800 p-1 rounded-xs hover:bg-rose-50 cursor-pointer"
                              title="Eliminar participante"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#f1f5f9] font-bold text-slate-900 border-t-2 border-[#cbd5e1]">
                      <td colSpan={2} className="py-2 px-3 uppercase text-[11px]">
                        Total Asistentes Registrados
                      </td>
                      <td colSpan={isEditingParticipantes ? 8 : 7} className="py-2 px-4 font-mono text-emerald-800">
                        {(currentData.participantes || []).length} Participantes Validados
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════
            PUNTO 7: REPOSITORIO DE EVIDENCIAS DE REUNIONES POR FECHA
            (Debajo de todo lo creado, con fotos, actas y PPTs)
           ═════════════════════════════════════════════════════════════ */}
        {(activeSheet === 'todo' || activeSheet === 'evidencias') && (
          <section className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between border-b border-[#cbd5e1] pb-2 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#107c41] rounded-xs inline-block"></span>
                  <span>Punto 7: Evidencias de las Asistencias Técnicas y Reuniones por Fecha</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Capturas de pantalla de la reunión, actas firmadas, presentaciones PPT y registro fotográfico
                </p>
              </div>

              {/* Botones de acción FUERA del cuadro */}
              <div className="flex items-center gap-2">
                {/* Filtro por fecha de reunión */}
                <div className="flex items-center gap-1.5 bg-white border border-[#cbd5e1] rounded-xs px-2.5 py-1 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Fecha:</span>
                  <select
                    value={fechaReunionFiltro}
                    onChange={(e) => setFechaReunionFiltro(e.target.value)}
                    className="font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    <option value="todas">Todas las reuniones</option>
                    {fechasReunionesDisponibles.map((f) => (
                      <option key={f} value={f}>
                        Reunión del {f}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAddEvidencia}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#107c41]" />
                  <span>Subir / Registrar Evidencia</span>
                </button>

                {isEditingEvidencias ? (
                  <>
                    <button
                      onClick={handleSaveEvidencias}
                      className="px-2.5 py-1 bg-[#107c41] hover:bg-[#0f6f39] text-white text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar</span>
                    </button>
                    <button
                      onClick={handleCancelEvidencias}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-xs font-medium rounded-xs flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancelar</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingEvidencias(true)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-[#cbd5e1] text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#107c41]" />
                    <span>Editar Evidencias</span>
                  </button>
                )}
              </div>
            </div>

            {/* Cuadrícula de evidencias con tarjetas institucionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 select-text">
              {evidenciasFiltradas.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white border border-[#cbd5e1] rounded-xs p-4 shadow-2xs flex flex-col justify-between hover:border-[#107c41] transition-colors relative"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <span className="text-[11px] font-mono font-bold text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#107c41]" />
                        {ev.fecha}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs border ${
                          ev.tipo === 'captura'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : ev.tipo === 'presentacion'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : ev.tipo === 'acta'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {ev.tipo === 'captura' && '📸 Captura Virtual'}
                        {ev.tipo === 'presentacion' && '📑 Diapositivas PPT'}
                        {ev.tipo === 'acta' && '✍️ Acta Firmada'}
                        {ev.tipo === 'registro' && '📋 Registro Asistencia'}
                      </span>
                    </div>

                    {isEditingEvidencias ? (
                      <div className="space-y-2 mt-1">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Título:</label>
                          <input
                            type="text"
                            value={ev.titulo}
                            onChange={(e) => {
                              const updated = editEvidencias.map((item) =>
                                item.id === ev.id ? { ...item, titulo: e.target.value } : item
                              )
                              setEditEvidencias(updated)
                            }}
                            className="w-full text-xs font-semibold p-1 border border-[#107c41] rounded-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Fecha de reunión:</label>
                          <input
                            type="text"
                            value={ev.fecha}
                            onChange={(e) => {
                              const updated = editEvidencias.map((item) =>
                                item.id === ev.id ? { ...item, fecha: e.target.value } : item
                              )
                              setEditEvidencias(updated)
                            }}
                            className="w-full text-xs font-mono p-1 border border-[#107c41] rounded-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Tipo de evidencia:</label>
                          <select
                            value={ev.tipo}
                            onChange={(e) => {
                              const updated = editEvidencias.map((item) =>
                                item.id === ev.id ? { ...item, tipo: e.target.value as any } : item
                              )
                              setEditEvidencias(updated)
                            }}
                            className="w-full text-xs p-1 border border-[#107c41] rounded-xs bg-white"
                          >
                            <option value="captura">Captura de reunión</option>
                            <option value="presentacion">Presentación PPT</option>
                            <option value="acta">Acta firmada</option>
                            <option value="registro">Registro de asistencia</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Enlace Drive o URL:</label>
                          <input
                            type="text"
                            value={ev.enlaceUrl}
                            onChange={(e) => {
                              const updated = editEvidencias.map((item) =>
                                item.id === ev.id ? { ...item, enlaceUrl: e.target.value } : item
                              )
                              setEditEvidencias(updated)
                            }}
                            className="w-full text-xs font-mono p-1 border border-[#107c41] rounded-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Descripción:</label>
                          <textarea
                            value={ev.descripcion}
                            onChange={(e) => {
                              const updated = editEvidencias.map((item) =>
                                item.id === ev.id ? { ...item, descripcion: e.target.value } : item
                              )
                              setEditEvidencias(updated)
                            }}
                            rows={2}
                            className="w-full text-xs p-1 border border-[#107c41] rounded-xs bg-white"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveEvidencia(ev.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer pt-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar esta evidencia</span>
                        </button>
                      </div>
                    ) : (
                      <div>
                        {/* Simulación visual de miniatura de documento institucional */}
                        <div className="h-32 bg-slate-100 rounded-xs border border-slate-200 mb-2.5 flex flex-col items-center justify-center p-3 text-center overflow-hidden relative group">
                          {ev.tipo === 'captura' && <Monitor className="w-10 h-10 text-blue-600 mb-1" />}
                          {ev.tipo === 'presentacion' && <Presentation className="w-10 h-10 text-rose-600 mb-1" />}
                          {ev.tipo === 'acta' && <FileText className="w-10 h-10 text-emerald-700 mb-1" />}
                          {ev.tipo === 'registro' && <CheckSquare className="w-10 h-10 text-amber-600 mb-1" />}
                          <span className="text-[11px] font-mono text-slate-600 font-bold max-w-[200px] truncate">
                            {ev.archivoNombre || ev.titulo}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Haga clic en el enlace para abrir en el Drive
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{ev.titulo}</h4>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{ev.descripcion}</p>
                      </div>
                    )}
                  </div>

                  {!isEditingEvidencias && (
                    <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                      <a
                        href={ev.enlaceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#107c41] hover:text-[#0f6f39] font-bold flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Evidencia en Drive</span>
                      </a>
                      <span className="text-[10px] text-slate-400 font-mono">Reunión {ev.fecha}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  )
}