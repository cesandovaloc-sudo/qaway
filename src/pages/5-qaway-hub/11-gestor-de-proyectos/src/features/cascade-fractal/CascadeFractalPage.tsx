import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  FolderKanban,
  GanttChart,
  KanbanSquare,
  Layers,
  Milestone as MilestoneIcon,
  Phone,
  Plus,
  Sparkles,
  Target,
  Users,
  Video,
  Workflow,
  Zap,
} from 'lucide-react'
import { GanttTab } from '@/pages/projects/workspace/GanttTab'
import { KanbanBoardTab } from '@/pages/projects/workspace/KanbanBoardTab'
import { CalendarTab } from '@/pages/projects/workspace/CalendarTab'
import { MilestonesTab } from '@/pages/projects/workspace/MilestonesTab'
import { DocsTab } from '@/pages/projects/workspace/DocsTab'
import { TerritoryReporterTab } from '@/features/territory-reporter/TerritoryReporterTab'
import { SlideOverTaskSheet } from '@/components/projects/SlideOverTaskSheet'
import { useProjectsDataset, useTenantFilteredProjects } from '@/hooks/useProjects'
import { projectsService } from '@/services/projectsService'

// ─────────────────────────────────────────────────────────────────────────────
// CascadeFractalPage.tsx — Motor de Desglose Recursivo (WBS Fractal N-Niveles)
// Conecta e integra el 100% de los módulos funcionales existentes (GanttTab,
// KanbanBoardTab, TerritoryReporterTab, MilestonesTab, CalendarTab, DocsTab,
// SlideOverTaskSheet y projectsService) bajo un único árbol jerárquico con
// Roll-up automático de entregables e indicadores.
// ─────────────────────────────────────────────────────────────────────────────

export type FractalLevelType = 'programa' | 'proceso' | 'subproceso' | 'unidad_ejecutora'

export interface DeliverableCriterion {
  id: string
  label: string
  category: 'evidencia_foto' | 'documento_siga' | 'calidad_campo' | 'plazo'
  done: boolean
}

export interface ArticulationTask {
  id: string
  channel: 'zoom' | 'llamada' | 'whatsapp' | 'oficio'
  title: string
  assignee: string
  dueDate: string
  checks: Array<{ id: string; label: string; done: boolean }>
}

export interface HierarchyNode {
  id: string
  parentId: string | null
  code: string
  name: string
  levelType: FractalLevelType
  roleLabel: string
  owner: string
  timeframe: string
  predecessorIds: string[]
  criteria: DeliverableCriterion[]
  articulationTasks: ArticulationTask[]
}

const STORAGE_KEY = 'qaway_cascade_fractal_nodes_v1'

const INITIAL_MINEDU_NODES: HierarchyNode[] = [
  {
    id: 'min-prog-2027',
    parentId: null,
    code: 'PROG-MINEDU-2027',
    name: 'Dotación Nacional de Materiales Educativos 2027 (OM 032)',
    levelType: 'programa',
    roleLabel: 'Nivel 1 · Director DIGERE / Programa',
    owner: 'Coordinador General DIGERE',
    timeframe: 'Sep 2026 – Ago 2027',
    predecessorIds: [],
    criteria: [
      { id: 'c-m1', label: 'Aprobación de Cuadros de Distribución Nacional', category: 'documento_siga', done: true },
      { id: 'c-m2', label: 'Presupuesto habilitado en 26 DRE/GRE', category: 'documento_siga', done: true },
    ],
    articulationTasks: [
      {
        id: 'art-m1',
        channel: 'zoom',
        title: 'Comité Macro-Regional de Seguimiento OM 032 con Directores DRE',
        assignee: 'Carlos Sandoval',
        dueDate: '2026-10-20',
        checks: [
          { id: 'ck-1', label: 'Solicitar envío de acta firmada de cada DRE', done: true },
          { id: 'ck-2', label: 'Validar cierre de brechas de código modular', done: false },
        ],
      },
    ],
  },
  // NIVEL 2: PROCESOS (Con secuencia y convergencia)
  {
    id: 'min-proc-1',
    parentId: 'min-prog-2027',
    code: 'PROC-01',
    name: 'Proceso I: Planificación y Cuadro de Distribución (CDL en MC SIGA)',
    levelType: 'proceso',
    roleLabel: 'Nivel 2 · Coordinador Regional DRE',
    owner: 'Especialista DRE Junín',
    timeframe: 'Sep 2026 – Oct 2026',
    predecessorIds: [],
    criteria: [
      { id: 'c-p1', label: 'Padrón de II.EE. validado por Estadística', category: 'documento_siga', done: true },
      { id: 'c-p2', label: 'Cierre de Fase 1 y Fase 2 en MC SIGA', category: 'documento_siga', done: false },
    ],
    articulationTasks: [],
  },
  {
    id: 'min-proc-2',
    parentId: 'min-prog-2027',
    code: 'PROC-02',
    name: 'Proceso II: Acondicionamiento de Almacenes y Contratos de Transporte',
    levelType: 'proceso',
    roleLabel: 'Nivel 2 · Coordinador Regional DRE',
    owner: 'Jefe de Abastecimiento DRE',
    timeframe: 'Oct 2026 – Dic 2026',
    predecessorIds: ['min-proc-1'],
    criteria: [
      { id: 'c-p21', label: 'Almacenes UGEL fumigados y con parihuelas', category: 'evidencia_foto', done: true },
      { id: 'c-p22', label: 'Contratos de transporte terrestre/fluvial suscritos', category: 'documento_siga', done: false },
    ],
    articulationTasks: [],
  },
  {
    id: 'min-proc-3',
    parentId: 'min-prog-2027',
    code: 'PROC-03',
    name: 'Proceso III: Despacho PECOSA y Entrega a II.EE. (Convergencia Proc I + II)',
    levelType: 'proceso',
    roleLabel: 'Nivel 2 · Coordinador Regional DRE',
    owner: 'Coordinador Logístico Regional',
    timeframe: 'Ene 2027 – Mar 2027',
    predecessorIds: ['min-proc-1', 'min-proc-2'],
    criteria: [
      { id: 'c-p31', label: 'Emisión de PECOSA al 100% en SIGA', category: 'documento_siga', done: false },
      { id: 'c-p32', label: 'Actas de recepción firmadas por Directores de II.EE.', category: 'evidencia_foto', done: false },
    ],
    articulationTasks: [],
  },
  // NIVEL 3: SUBPROCESOS DENTRO DE PROCESO I
  {
    id: 'min-sub-1-5',
    parentId: 'min-proc-1',
    code: 'SUB-1.5',
    name: '1.5 Solicitud de Ajustes de Códigos Modulares en MC SIGA',
    levelType: 'subproceso',
    roleLabel: 'Nivel 3 · Monitor / Gestor Territorial',
    owner: 'Lucía Ramos (Gestora Junín)',
    timeframe: 'Plazo: 09 Oct 2026',
    predecessorIds: [],
    criteria: [
      { id: 'c-s15-1', label: 'Validación de 7 Direcciones (DEI a DITEN)', category: 'documento_siga', done: true },
      { id: 'c-s15-2', label: 'Oficio de conformidad remitido a DIGERE', category: 'documento_siga', done: true },
    ],
    articulationTasks: [],
  },
  {
    id: 'min-sub-1-6',
    parentId: 'min-proc-1',
    code: 'SUB-1.6',
    name: '1.6 Elaboración y Subida del CDL en MC SIGA (Fase 1 y Fase 2)',
    levelType: 'subproceso',
    roleLabel: 'Nivel 3 · Monitor / Gestor Territorial',
    owner: 'Carlos Mendoza (Gestor Territorial)',
    timeframe: 'Plazo: 22 Oct 2026',
    predecessorIds: ['min-sub-1-5'],
    criteria: [
      { id: 'c-s16-1', label: '13 UGELs con archivos Fase 1 validados', category: 'documento_siga', done: true },
      { id: 'c-s16-2', label: '13 UGELs con archivos Fase 2 validados', category: 'documento_siga', done: false },
    ],
    articulationTasks: [
      {
        id: 'art-s16',
        channel: 'llamada',
        title: 'Asistencia técnica de destrabe a UGELs con Fase 2 pendiente',
        assignee: 'Carlos Mendoza',
        dueDate: '2026-10-19',
        checks: [
          { id: 'ck-s1', label: 'Solicitar captura de carga en MC SIGA', done: true },
          { id: 'ck-s2', label: 'Solicitar oficio firmado por Director UGEL', done: false },
          { id: 'ck-s3', label: 'Validar porcentaje de avance real al 100%', done: false },
        ],
      },
    ],
  },
  // NIVEL 4: UNIDADES EJECUTORAS (UGELs) DENTRO DE SUBPROCESO 1.6
  {
    id: 'min-ugel-huancayo',
    parentId: 'min-sub-1-6',
    code: 'UGEL-01',
    name: 'UGEL Huancayo (Unidad Ejecutora)',
    levelType: 'unidad_ejecutora',
    roleLabel: 'Nivel 4 · Especialista Punto Focal UGEL',
    owner: 'Esp. SIAGIE Huancayo',
    timeframe: 'Oct 2026',
    predecessorIds: [],
    criteria: [
      { id: 'u-hyo-1', label: 'Archivo Fase 1 subido a MC SIGA', category: 'documento_siga', done: true },
      { id: 'u-hyo-2', label: 'Archivo Fase 2 subido a MC SIGA', category: 'documento_siga', done: true },
      { id: 'u-hyo-3', label: 'Acta de validación firmada (7 Direcciones)', category: 'calidad_campo', done: true },
    ],
    articulationTasks: [],
  },
  {
    id: 'min-ugel-satipo',
    parentId: 'min-sub-1-6',
    code: 'UGEL-08',
    name: 'UGEL Satipo (Unidad Ejecutora)',
    levelType: 'unidad_ejecutora',
    roleLabel: 'Nivel 4 · Especialista Punto Focal UGEL',
    owner: 'Esp. Dotación Satipo',
    timeframe: 'Oct 2026',
    predecessorIds: [],
    criteria: [
      { id: 'u-sat-1', label: 'Archivo Fase 1 subido a MC SIGA', category: 'documento_siga', done: true },
      { id: 'u-sat-2', label: 'Archivo Fase 2 subido a MC SIGA', category: 'documento_siga', done: false },
      { id: 'u-sat-3', label: 'Conformidad de DEBA y DIGEBR', category: 'calidad_campo', done: false },
    ],
    articulationTasks: [],
  },
  {
    id: 'min-ugel-junin',
    parentId: 'min-sub-1-6',
    code: 'UGEL-07',
    name: 'UGEL Junín (Unidad Ejecutora)',
    levelType: 'unidad_ejecutora',
    roleLabel: 'Nivel 4 · Especialista Punto Focal UGEL',
    owner: 'Esp. Dotación Junín',
    timeframe: 'Oct 2026',
    predecessorIds: [],
    criteria: [
      { id: 'u-jun-1', label: 'Archivo Fase 1 subido a MC SIGA', category: 'documento_siga', done: false },
      { id: 'u-jun-2', label: 'Archivo Fase 2 subido a MC SIGA', category: 'documento_siga', done: false },
      { id: 'u-jun-3', label: 'Evidencia fotográfica de comité UGEL', category: 'evidencia_foto', done: false },
    ],
    articulationTasks: [],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CASO 2 (DE CASCADA.TXT): CONSTRUCCIÓN DE VIVIENDA (Electricidad + Gasfitería -> Pintura)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'viv-prog-1',
    parentId: null,
    code: 'OBRA-RES-2027',
    name: 'Construcción de Edificio Residencial (Ejemplo Cascada Fractal)',
    levelType: 'programa',
    roleLabel: 'Nivel 1 · Ingeniero Residente / Director de Obra',
    owner: 'Ing. Carlos Sandoval',
    timeframe: 'Oct 2026 – Mar 2027',
    predecessorIds: [],
    criteria: [
      { id: 'v-1', label: 'Licencia de obra y expediente técnico aprobado', category: 'documento_siga', done: true },
    ],
    articulationTasks: [],
  },
  {
    id: 'viv-proc-gas',
    parentId: 'viv-prog-1',
    code: 'PROC-GAS',
    name: 'Proceso 1: Gasfitería y Redes de Agua (Corre en paralelo)',
    levelType: 'proceso',
    roleLabel: 'Nivel 2 · Jefe de Instalaciones Sanitarias',
    owner: 'Maestro Técnico A',
    timeframe: 'Semana 1 – Semana 3',
    predecessorIds: [],
    criteria: [
      { id: 'vg-1', label: 'Prueba hidráulica de tuberías sin fugas', category: 'calidad_campo', done: true },
      { id: 'vg-2', label: 'Cierre de regatas en muros', category: 'evidencia_foto', done: true },
    ],
    articulationTasks: [],
  },
  {
    id: 'viv-proc-elec',
    parentId: 'viv-prog-1',
    code: 'PROC-ELEC',
    name: 'Proceso 2: Electricidad y Cableado (Corre en paralelo)',
    levelType: 'proceso',
    roleLabel: 'Nivel 2 · Jefe de Instalaciones Eléctricas',
    owner: 'Ing. Electricista B',
    timeframe: 'Semana 1 – Semana 3',
    predecessorIds: [],
    criteria: [
      { id: 've-1', label: 'Entubado y cajas octogonales empotradas', category: 'calidad_campo', done: true },
      { id: 've-2', label: 'Megado de cables y tablero general', category: 'documento_siga', done: true },
    ],
    articulationTasks: [],
  },
  {
    id: 'viv-proc-pint',
    parentId: 'viv-prog-1',
    code: 'PROC-PINT',
    name: 'Proceso 3: Pintura General (Requiere Gasfitería + Electricidad)',
    levelType: 'proceso',
    roleLabel: 'Nivel 2 · Encargado de Acabados y Pintura',
    owner: 'Maestro Supervisor Pintura',
    timeframe: 'Semana 4 – Semana 6',
    predecessorIds: ['viv-proc-gas', 'viv-proc-elec'],
    criteria: [
      { id: 'vp-1', label: 'Paredes liberadas por electricidad y gasfitería', category: 'calidad_campo', done: true },
    ],
    articulationTasks: [],
  },
  {
    id: 'viv-sub-prep',
    parentId: 'viv-proc-pint',
    code: 'SUB-P1',
    name: 'Subproceso 3.1: Preparación y Lijado de Pared',
    levelType: 'subproceso',
    roleLabel: 'Nivel 3 · Monitor de Cuadrilla',
    owner: 'Supervisor de Preparación',
    timeframe: 'Semana 4',
    predecessorIds: [],
    criteria: [
      { id: 'vsp-1', label: 'Humedad < 15% medida con higrómetro', category: 'calidad_campo', done: true },
      { id: 'vsp-2', label: 'Masillado de imperfecciones al 100%', category: 'evidencia_foto', done: true },
    ],
    articulationTasks: [],
  },
  {
    id: 'viv-sub-imp',
    parentId: 'viv-proc-pint',
    code: 'SUB-P2',
    name: 'Subproceso 3.2: Puesta de Imprimante',
    levelType: 'subproceso',
    roleLabel: 'Nivel 3 · Monitor de Cuadrilla',
    owner: 'Supervisor de Imprimante',
    timeframe: 'Semana 5',
    predecessorIds: ['viv-sub-prep'],
    criteria: [
      { id: 'vsi-1', label: 'Sellado uniforme en todas las habitaciones', category: 'calidad_campo', done: true },
      { id: 'vsi-2', label: 'Limpieza de pisos y zócalos protegidos', category: 'evidencia_foto', done: false },
    ],
    articulationTasks: [],
  },
  {
    id: 'viv-unit-p1',
    parentId: 'viv-sub-imp',
    code: 'PINTOR-01',
    name: 'Pintor 1 — Habitación 101 y Sala',
    levelType: 'unidad_ejecutora',
    roleLabel: 'Nivel 4 · Operador / Pintor',
    owner: 'Juan Pérez (Pintor)',
    timeframe: 'Jueves 18 Oct',
    predecessorIds: [],
    criteria: [
      { id: 'vp1-1', label: 'Acabado uniforme sin marcas de rodillo', category: 'calidad_campo', done: true },
      { id: 'vp1-2', label: 'Limpieza total del área de trabajo', category: 'calidad_campo', done: true },
      { id: 'vp1-3', label: 'Fotografía de avance enviada por WhatsApp', category: 'evidencia_foto', done: true },
    ],
    articulationTasks: [],
  },
  {
    id: 'viv-unit-p2',
    parentId: 'viv-sub-imp',
    code: 'PINTOR-02',
    name: 'Pintor 2 — Habitaciones 102 y 103',
    levelType: 'unidad_ejecutora',
    roleLabel: 'Nivel 4 · Operador / Pintor',
    owner: 'Miguel Castro (Pintor)',
    timeframe: 'Viernes 19 Oct',
    predecessorIds: [],
    criteria: [
      { id: 'vp2-1', label: 'Acabado uniforme sin marcas de rodillo', category: 'calidad_campo', done: true },
      { id: 'vp2-2', label: 'Limpieza total del área de trabajo', category: 'calidad_campo', done: false },
      { id: 'vp2-3', label: 'Fotografía de avance enviada por WhatsApp', category: 'evidencia_foto', done: false },
    ],
    articulationTasks: [],
  },
]

const LEVEL_META: Record<
  FractalLevelType,
  { label: string; badgeClass: string; zoomToolLabel: string }
> = {
  programa: {
    label: 'NIVEL 1 · PROGRAMA / OBRA',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    zoomToolLabel: 'Macro-Procesos y Ruta Crítica',
  },
  proceso: {
    label: 'NIVEL 2 · PROCESO / FASE',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    zoomToolLabel: 'Subprocesos Secuenciales y Convergencias',
  },
  subproceso: {
    label: 'NIVEL 3 · SUBPROCESO / HITO',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    zoomToolLabel: 'Matriz Semafórica de Unidades (UGELs / Cuadrillas)',
  },
  unidad_ejecutora: {
    label: 'NIVEL 4 · UNIDAD EJECUTORA / OPERADOR',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    zoomToolLabel: 'Checklist de Entregables Físicos y Evidencias',
  },
}

type PolymorphicTool = 'wbs_cascada' | 'matriz_monitoreo' | 'gantt' | 'kanban' | 'hitos' | 'calendario' | 'docs'

export default function CascadeFractalPage() {
  const { projects } = useProjectsDataset()
  const scopedProjects = useTenantFilteredProjects()

  const [nodes, setNodes] = useState<HierarchyNode[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // ignore
    }
    return INITIAL_MINEDU_NODES
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes))
    } catch {
      // ignore
    }
  }, [nodes])

  // Nodo donde estamos parados actualmente (Contexto Fractal)
  const [contextNodeId, setContextNodeId] = useState<string>('min-prog-2027')
  const [activeTool, setActiveTool] = useState<PolymorphicTool>('wbs_cascada')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  // Modal ligero para disparar Tarea de Articulación (Zoom / Llamada / WhatsApp / Oficio)
  const [articulationDraft, setArticulationDraft] = useState<{
    targetNode: HierarchyNode
    channel: 'zoom' | 'llamada' | 'whatsapp' | 'oficio'
    title: string
    assignee: string
  } | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Proyecto real conectado para reutilizar GanttTab, KanbanBoardTab, MilestonesTab, TerritoryReporterTab
  const linkedProject = useMemo(
    () =>
      scopedProjects.find((p) => p.id === 'proj-minedu-2027') ??
      scopedProjects[0] ??
      projects[0],
    [scopedProjects, projects],
  )

  // Cálculo recursivo de Roll-up en vivo desde las hojas hasta la raíz
  const progressById = useMemo(() => {
    const map = new Map<string, number>()

    const computeNodeProgress = (nodeId: string): number => {
      if (map.has(nodeId)) return map.get(nodeId)!
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return 0

      const children = nodes.filter((n) => n.parentId === nodeId)
      const ownCriteriaTotal = node.criteria.length
      const ownCriteriaDone = node.criteria.filter((c) => c.done).length
      const ownRatio = ownCriteriaTotal > 0 ? (ownCriteriaDone / ownCriteriaTotal) * 100 : 100

      if (children.length === 0) {
        const val = Math.round(ownRatio)
        map.set(nodeId, val)
        return val
      }

      const childrenAvg =
        children.reduce((acc, child) => acc + computeNodeProgress(child.id), 0) /
        children.length
      // Promedio ponderado: 75% hijos (roll-up desde abajo) + 25% criterios propios del nivel
      const combined =
        ownCriteriaTotal > 0 ? Math.round(childrenAvg * 0.75 + ownRatio * 0.25) : Math.round(childrenAvg)
      map.set(nodeId, combined)
      return combined
    }

    for (const n of nodes) {
      computeNodeProgress(n.id)
    }
    return map
  }, [nodes])

  const contextNode = useMemo(
    () => nodes.find((n) => n.id === contextNodeId) ?? nodes[0],
    [nodes, contextNodeId],
  )

  // Camino de miga de pan (Breadcrumb) desde la raíz hasta el nodo actual
  const breadcrumbPath = useMemo(() => {
    const path: HierarchyNode[] = []
    let curr: HierarchyNode | undefined = contextNode
    while (curr) {
      path.unshift(curr)
      curr = curr.parentId ? nodes.find((n) => n.id === curr!.parentId) : undefined
    }
    return path
  }, [contextNode, nodes])

  const childNodes = useMemo(
    () => nodes.filter((n) => n.parentId === contextNode.id),
    [nodes, contextNode.id],
  )

  const toggleCriterion = (nodeId: string, criterionId: string) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id !== nodeId) return node
        return {
          ...node,
          criteria: node.criteria.map((c) =>
            c.id === criterionId ? { ...c, done: !c.done } : c,
          ),
        }
      }),
    )
  }

  const toggleArticulationCheck = (nodeId: string, taskId: string, checkId: string) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id !== nodeId) return node
        return {
          ...node,
          articulationTasks: node.articulationTasks.map((t) =>
            t.id !== taskId
              ? t
              : {
                  ...t,
                  checks: t.checks.map((ck) =>
                    ck.id === checkId ? { ...ck, done: !ck.done } : ck,
                  ),
                },
          ),
        }
      }),
    )
  }

  const handleCreateArticulationTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!articulationDraft || !articulationDraft.title.trim()) return

    const newTask: ArticulationTask = {
      id: `art-${Date.now()}`,
      channel: articulationDraft.channel,
      title: articulationDraft.title.trim(),
      assignee: articulationDraft.assignee.trim() || 'Carlos Mendoza',
      dueDate: '2026-10-22',
      checks: [
        { id: `ck-${Date.now()}-1`, label: 'Solicitar envío de fotografías de avance', done: false },
        { id: `ck-${Date.now()}-2`, label: 'Solicitar envío de documento/acta firmada', done: false },
        { id: `ck-${Date.now()}-3`, label: 'Validar porcentaje de avance real en campo', done: false },
      ],
    }

    setNodes((prev) =>
      prev.map((n) =>
        n.id === articulationDraft.targetNode.id
          ? { ...n, articulationTasks: [newTask, ...n.articulationTasks] }
          : n,
      ),
    )

    // También inyectamos el WorkItem real en projectsService para que aparezca en el Kanban y Bandeja
    if (linkedProject) {
      const created = projectsService.createWorkItem({
        projectId: linkedProject.id,
        title: `[${articulationDraft.channel.toUpperCase()}] ${articulationDraft.title.trim()} (${articulationDraft.targetNode.code})`,
        description: `Tarea de articulación disparada desde el nodo fractal "${articulationDraft.targetNode.name}". Incluye checklist de verificación de fotos, documento firmado y avance real.`,
        type: 'task',
        state: 'todo',
        priority: 'ALTA',
        assignee: {
          id: 'u-cascade',
          name: articulationDraft.assignee.trim() || 'Carlos Mendoza',
          role: 'Monitor de Subproceso',
          avatarColor: '#1e3a8a',
        },
        storyPoints: 3,
        dueDate: '2026-10-22',
        tags: ['CASCADA', articulationDraft.channel.toUpperCase(), articulationDraft.targetNode.code],
        subtasks: [
          { id: `st-${Date.now()}-1`, title: 'Solicitar envío de fotografías de avance', done: false },
          { id: `st-${Date.now()}-2`, title: 'Solicitar envío de documento/acta firmada', done: false },
          { id: `st-${Date.now()}-3`, title: 'Validar porcentaje de avance real', done: false },
        ],
        commentsCount: 1,
        attachmentsCount: 0,
        originType: 'accion_emergente',
        taskNature: 'contingencia_operativa',
        scopeTag: articulationDraft.targetNode.name,
        threatensMilestone: true,
      })
      setToastMessage(`Tarea "${created.code}" inyectada en Cascada y en tu Bandeja/Kanban`)
      setTimeout(() => setToastMessage(null), 4000)
    }

    setArticulationDraft(null)
  }

  const currentProgress = progressById.get(contextNode.id) ?? 0
  const levelMeta = LEVEL_META[contextNode.levelType]

  // Verificar si los predecesores del nodo actual están al 100% (Convergencia)
  const predecessorsInfo = useMemo(() => {
    return contextNode.predecessorIds
      .map((pid) => {
        const pNode = nodes.find((n) => n.id === pid)
        if (!pNode) return null
        return {
          node: pNode,
          progress: progressById.get(pid) ?? 0,
        }
      })
      .filter((x): x is { node: HierarchyNode; progress: number } => Boolean(x))
  }, [contextNode.predecessorIds, nodes, progressById])

  const isConvergenceUnlocked = predecessorsInfo.every((p) => p.progress >= 100)

  const tools: Array<{ key: PolymorphicTool; label: string; icon: React.ReactNode; badge?: string | number }> = [
    {
      key: 'wbs_cascada',
      label: 'Desglose Fractal & Roll-up',
      icon: <Workflow size={16} />,
      badge: childNodes.length || 'Hoja',
    },
    {
      key: 'matriz_monitoreo',
      label: 'Matriz de Monitoreo (UGEL / Campo)',
      icon: <BarChart3 size={16} />,
      badge: '13 UGEL',
    },
    {
      key: 'gantt',
      label: 'Cronograma Gantt',
      icon: <GanttChart size={16} />,
    },
    {
      key: 'kanban',
      label: 'Tablero Kanban',
      icon: <KanbanSquare size={16} />,
    },
    {
      key: 'hitos',
      label: 'Subprocesos & Hitos',
      icon: <MilestoneIcon size={16} />,
    },
    {
      key: 'calendario',
      label: 'Calendario',
      icon: <CalendarDays size={16} />,
    },
    {
      key: 'docs',
      label: 'Archivos & Wiki',
      icon: <BookOpen size={16} />,
    },
  ]

  return (
    <div className="mx-auto max-w-[1800px] space-y-4 pb-16">
      {toastMessage && (
        <div className="fixed bottom-16 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-950 px-4 py-3 text-xs font-bold text-white shadow-xl">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BARRA SUPERIOR 1: SELECTOR DE CASO (MINEDU vs CONSTRUCCIÓN) + BREADCRUMB FRACTAL N-NIVELES */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e3a8a] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
              <Sparkles size={13} /> Motor WBS en Cascada Fractal
            </span>
            <span className="text-xs text-slate-500">
              Las herramientas abajo son universales; se recalibran según el nivel donde estás parado.
            </span>
          </div>

          {/* Selector rápido de ejemplo de Cascada.txt */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setContextNodeId('min-prog-2027')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                contextNode.id.startsWith('min-')
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 size={14} className="text-blue-700" />
              Caso 1: MINEDU Dotación 2027 (OM 032)
            </button>
            <button
              type="button"
              onClick={() => setContextNodeId('viv-prog-1')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                contextNode.id.startsWith('viv-')
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers size={14} className="text-amber-600" />
              Caso 2: Construcción Casa (Gasfitería + Electricidad → Pintura)
            </button>
          </div>
        </div>

        {/* MIGA DE PAN FRACTAL (BREADCRUMB) */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Ubicación en Cascada:
          </span>
          {breadcrumbPath.map((item, idx) => {
            const isLast = idx === breadcrumbPath.length - 1
            const nodePct = progressById.get(item.id) ?? 0
            return (
              <div key={item.id} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight size={14} className="text-slate-300" />}
                <button
                  type="button"
                  onClick={() => setContextNodeId(item.id)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-all cursor-pointer ${
                    isLast
                      ? 'border-slate-900 bg-slate-900 font-bold text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 font-semibold text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate max-w-[240px]">{item.name}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums ${
                      isLast
                        ? 'bg-white/20 text-white'
                        : nodePct >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : nodePct >= 40
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {nodePct}%
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* FICHA / RESUMEN CONTEXTUAL DEL NODO ACTUAL (Un único Resumen vivo según el nodo) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${levelMeta.badgeClass}`}
              >
                {levelMeta.label}
              </span>
              <span className="text-xs font-bold text-slate-400 tabular-nums">
                {contextNode.code}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                <Users size={12} /> {contextNode.roleLabel}: <strong>{contextNode.owner}</strong>
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                <Clock size={12} /> {contextNode.timeframe}
              </span>
            </div>

            <h1 className="mt-2 text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
              {contextNode.name}
            </h1>

            {/* Estado de Convergencia de Predecesores (Ej. Electricidad + Gasfitería -> Pintura) */}
            {predecessorsInfo.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Convergencia previa requerida:
                </span>
                {predecessorsInfo.map(({ node: pNode, progress: pPct }) => (
                  <button
                    key={pNode.id}
                    type="button"
                    onClick={() => setContextNodeId(pNode.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      pPct >= 100
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-amber-200 bg-amber-50 text-amber-800'
                    }`}
                  >
                    {pPct >= 100 ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                    <span>{pNode.name}</span>
                    <span className="font-extrabold tabular-nums">({pPct}%)</span>
                  </button>
                ))}
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    isConvergenceUnlocked
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {isConvergenceUnlocked ? '✓ Etapa Desbloqueada' : '🔒 Esperando Convergencia'}
                </span>
              </div>
            )}
          </div>

          {/* Indicador de Roll-up Automático + Botón de Tarea de Articulación */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Avance Roll-up en Cascada
              </span>
              <span
                className={`text-3xl font-extrabold tabular-nums ${
                  currentProgress >= 80
                    ? 'text-emerald-600'
                    : currentProgress >= 40
                      ? 'text-amber-600'
                      : 'text-rose-600'
                }`}
              >
                {currentProgress}%
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setArticulationDraft({
                  targetNode: contextNode,
                  channel: 'zoom',
                  title: '',
                  assignee: contextNode.owner,
                })
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#172554] cursor-pointer"
            >
              <Zap size={15} /> Disparar Tarea de Seguimiento
            </button>
          </div>
        </div>

        {/* Barra de progreso Roll-up */}
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              currentProgress >= 80
                ? 'bg-emerald-500'
                : currentProgress >= 40
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
            }`}
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS POLIMÓRFICAS (Reutilizando 100% los componentes funcionales) */}
      <div className="flex gap-1.5 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs">
        {tools.map((t) => {
          const active = activeTool === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTool(t.key)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-xs font-bold transition-colors cursor-pointer ${
                active
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold tabular-nums ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* CONTENIDO DE LA HERRAMIENTA SELECCIONADA */}
      {activeTool === 'wbs_cascada' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* COLUMNA IZQUIERDA (2/3): SUB-NODOS HIJOS EN CASCADA (O ENTREGABLES SI ES UNIDAD EJECUTORA) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {childNodes.length > 0
                      ? `Desglose del Nivel Inferior (${childNodes.length} componentes que alimentan este nodo)`
                      : 'Ejecución Directa en Unidad Operativa (Nivel Hoja)'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Haz clic en cualquier componente para hacer zoom dentro de él, o marca sus criterios para ver cómo sube el porcentaje en cascada.
                  </p>
                </div>
              </div>

              {childNodes.length > 0 ? (
                <div className="space-y-3">
                  {childNodes.map((child) => {
                    const childPct = progressById.get(child.id) ?? 0
                    const grandChildrenCount = nodes.filter((n) => n.parentId === child.id).length
                    return (
                      <div
                        key={child.id}
                        className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-all hover:border-slate-300 hover:bg-white"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-extrabold text-slate-700 tabular-nums">
                                {child.code}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500">
                                {child.roleLabel}: <strong className="text-slate-700">{child.owner}</strong>
                              </span>
                              <span className="text-[11px] text-slate-400">· {child.timeframe}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setContextNodeId(child.id)}
                              className="mt-1 flex items-center gap-1.5 text-left text-base font-extrabold text-slate-900 hover:text-blue-700 cursor-pointer"
                            >
                              <span>{child.name}</span>
                              <ArrowRight size={15} className="text-blue-600 shrink-0" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <span
                              className={`rounded-lg px-2.5 py-1 text-sm font-extrabold tabular-nums ${
                                childPct >= 80
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : childPct >= 40
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {childPct}%
                            </span>
                            <button
                              type="button"
                              onClick={() => setContextNodeId(child.id)}
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                              Abrir Zoom ({grandChildrenCount} sub-nodos)
                            </button>
                          </div>
                        </div>

                        {/* Criterios verificables directos de este hijo (permiten probar el Roll-up en vivo) */}
                        {child.criteria.length > 0 && (
                          <div className="mt-3 border-t border-slate-200/70 pt-2.5">
                            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Criterios de Entregable (Marca para probar el Roll-up automático):
                            </p>
                            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                              {child.criteria.map((crit) => (
                                <label
                                  key={crit.id}
                                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                                    crit.done
                                      ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={crit.done}
                                    onChange={() => toggleCriterion(child.id, crit.id)}
                                    className="h-3.5 w-3.5 rounded accent-emerald-600"
                                  />
                                  <span className={crit.done ? 'line-through opacity-80' : ''}>
                                    {crit.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs text-emerald-900">
                  Estás en el <strong>Nivel 4 (Unidad Ejecutora / Operador de Campo)</strong>. Al marcar los checks de entregables en el panel derecho, el porcentaje sube automáticamente al Subproceso, al Proceso y al Programa General.
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA (1/3): CRITERIOS DEL NODO ACTUAL + TAREAS DE ARTICULACIÓN (ZOOM/LLAMADA/FOTOS) */}
          <div className="space-y-4">
            {/* Criterios del propio nodo */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <Target size={16} className="text-blue-700" />
                Entregables y Criterios de este Nivel
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Indicadores directos bajo responsabilidad de <strong>{contextNode.owner}</strong>.
              </p>

              <div className="mt-3 space-y-2">
                {contextNode.criteria.map((crit) => (
                  <label
                    key={crit.id}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs font-semibold transition-all cursor-pointer ${
                      crit.done
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={crit.done}
                      onChange={() => toggleCriterion(contextNode.id, crit.id)}
                      className="mt-0.5 h-4 w-4 rounded accent-emerald-600"
                    />
                    <span className="flex-1 leading-snug">{crit.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tareas Transversales de Seguimiento ("Tasks de Articulación") */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <Phone size={15} className="text-amber-600" />
                  Tareas de Seguimiento & Articulación
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setArticulationDraft({
                      targetNode: contextNode,
                      channel: 'llamada',
                      title: '',
                      assignee: contextNode.owner,
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  <Plus size={12} /> Nueva
                </button>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Llamadas, reuniones Zoom o envío de evidencias para destrabar este eslabón.
              </p>

              <div className="mt-3 space-y-3">
                {contextNode.articulationTasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                    Sin tareas de seguimiento activas en este nodo.
                  </div>
                ) : (
                  contextNode.articulationTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-blue-900">
                          {task.channel === 'zoom' ? <Video size={11} /> : <Phone size={11} />}
                          {task.channel}
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          Plazo: {task.dueDate}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">{task.title}</p>
                      <div className="space-y-1 pt-1">
                        {task.checks.map((ck) => (
                          <label
                            key={ck.id}
                            className="flex items-center gap-2 text-[11.5px] text-slate-700 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={ck.done}
                              onChange={() =>
                                toggleArticulationCheck(contextNode.id, task.id, ck.id)
                              }
                              className="h-3.5 w-3.5 rounded accent-blue-700"
                            />
                            <span className={ck.done ? 'line-through text-slate-400' : ''}>
                              {ck.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REUTILIZACIÓN 100% DE LOS MÓDULOS FUNCIONALES EXISTENTES */}
      {activeTool === 'matriz_monitoreo' && (
        <TerritoryReporterTab
          projectId={linkedProject?.id}
          onOpenTask={setSelectedTaskId}
        />
      )}

      {activeTool === 'gantt' && linkedProject && (
        <GanttTab projectId={linkedProject.id} onOpenTask={setSelectedTaskId} />
      )}

      {activeTool === 'kanban' && linkedProject && (
        <KanbanBoardTab projectId={linkedProject.id} onOpenTask={setSelectedTaskId} />
      )}

      {activeTool === 'hitos' && linkedProject && (
        <MilestonesTab projectId={linkedProject.id} onOpenTask={setSelectedTaskId} />
      )}

      {activeTool === 'calendario' && linkedProject && (
        <CalendarTab projectId={linkedProject.id} onOpenTask={setSelectedTaskId} />
      )}

      {activeTool === 'docs' && linkedProject && <DocsTab projectId={linkedProject.id} />}

      {/* Modal para disparar Tarea de Articulación con Checklist de Evidencias */}
      {articulationDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleCreateArticulationTask}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-extrabold text-blue-900">
                <Zap size={14} /> Nueva Tarea de Seguimiento en Cascada
              </span>
              <button
                type="button"
                onClick={() => setArticulationDraft(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                Cerrar
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-500">Nodo amarrado:</p>
              <p className="text-sm font-extrabold text-slate-900">
                {articulationDraft.targetNode.code} · {articulationDraft.targetNode.name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Canal de Acción
                </label>
                <select
                  value={articulationDraft.channel}
                  onChange={(e) =>
                    setArticulationDraft({
                      ...articulationDraft,
                      channel: e.target.value as 'zoom' | 'llamada' | 'whatsapp' | 'oficio',
                    })
                  }
                  className="h-9 w-full rounded-lg border border-slate-300 px-2.5 text-xs font-semibold text-slate-800"
                >
                  <option value="zoom">Reunión Zoom</option>
                  <option value="llamada">Llamada Telefónica</option>
                  <option value="whatsapp">WhatsApp / Evidencia</option>
                  <option value="oficio">Oficio / Documento</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Responsable
                </label>
                <input
                  value={articulationDraft.assignee}
                  onChange={(e) =>
                    setArticulationDraft({ ...articulationDraft, assignee: e.target.value })
                  }
                  className="h-9 w-full rounded-lg border border-slate-300 px-2.5 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Acción de destrabe / seguimiento
              </label>
              <input
                required
                autoFocus
                placeholder="Ej. Solicitar fotos de avance y acta firmada..."
                value={articulationDraft.title}
                onChange={(e) =>
                  setArticulationDraft({ ...articulationDraft, title: e.target.value })
                }
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-900"
              />
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Checklist automático que se incluirá:</p>
              <p>✓ Solicitar envío de fotografías de avance</p>
              <p>✓ Solicitar envío de documento / acta firmada</p>
              <p>✓ Validar porcentaje de avance real en campo</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setArticulationDraft(null)}
                className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-9 rounded-lg bg-[#1e3a8a] px-4 text-xs font-bold text-white hover:bg-[#172554]"
              >
                Crear e Inyectar al Kanban
              </button>
            </div>
          </form>
        </div>
      )}

      <SlideOverTaskSheet
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onOpenTask={setSelectedTaskId}
      />
    </div>
  )
}
