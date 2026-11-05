// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import '../cronograma-gantt/gantt.css';
import './sedes.css';
import {
  AlertTriangle,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  X,
  ChartNoAxesColumnIncreasing,
  FileText,
  ExternalLink,
  FolderKanban,
} from 'lucide-react';

export interface SedeItem {
  id: string;
  name: string;
  zona: string;
  sedeFisica: string;
  coordinadorZonal: string;
  gestorCampo: string;
  status: 'En plazo' | 'En curso' | 'Con retraso' | 'Completado';
  progress: number;
  tasksTotal: number;
  tasksDone: number;
  presupuesto: string;
  lastInspection: string;
}

const INITIAL_SEDES: SedeItem[] = [
  {
    id: 's-1',
    name: 'Sede Chupaca',
    zona: 'Valle del Mantaro',
    sedeFisica: 'Chupaca Centro',
    coordinadorZonal: 'Carlos Mendoza',
    gestorCampo: 'María Salazar',
    status: 'Completado',
    progress: 100,
    tasksTotal: 4,
    tasksDone: 4,
    presupuesto: 'S/ 65,000',
    lastInspection: '24 oct. 2026',
  },
  {
    id: 's-2',
    name: 'Sede Concepción',
    zona: 'Valle del Mantaro',
    sedeFisica: 'Concepción Norte',
    coordinadorZonal: 'Carlos Mendoza',
    gestorCampo: 'María Salazar',
    status: 'En plazo',
    progress: 85,
    tasksTotal: 4,
    tasksDone: 3,
    presupuesto: 'S/ 72,000',
    lastInspection: '26 oct. 2026',
  },
  {
    id: 's-3',
    name: 'Sede Huancayo Central',
    zona: 'Valle del Mantaro',
    sedeFisica: 'Huancayo Metropolitano',
    coordinadorZonal: 'Carlos Mendoza',
    gestorCampo: 'Carlos Mendoza',
    status: 'En curso',
    progress: 55,
    tasksTotal: 13,
    tasksDone: 5,
    presupuesto: 'S/ 140,000',
    lastInspection: '25 oct. 2026',
  },
  {
    id: 's-4',
    name: 'Sede Jauja',
    zona: 'Valle del Mantaro',
    sedeFisica: 'Jauja Aeropuerto',
    coordinadorZonal: 'Carlos Mendoza',
    gestorCampo: 'Carlos Mendoza',
    status: 'En curso',
    progress: 50,
    tasksTotal: 4,
    tasksDone: 2,
    presupuesto: 'S/ 58,000',
    lastInspection: '22 oct. 2026',
  },
  {
    id: 's-5',
    name: 'Sede Tarma',
    zona: 'Zona Sierra Central',
    sedeFisica: 'Tarma Alta',
    coordinadorZonal: 'Lucía Ramos',
    gestorCampo: 'Carlos Mendoza',
    status: 'En curso',
    progress: 45,
    tasksTotal: 5,
    tasksDone: 2,
    presupuesto: 'S/ 80,000',
    lastInspection: '20 oct. 2026',
  },
  {
    id: 's-6',
    name: 'Sede Chanchamayo',
    zona: 'Selva Central',
    sedeFisica: 'La Merced',
    coordinadorZonal: 'Lucía Ramos',
    gestorCampo: 'Lucía Ramos',
    status: 'En curso',
    progress: 35,
    tasksTotal: 6,
    tasksDone: 2,
    presupuesto: 'S/ 95,000',
    lastInspection: '21 oct. 2026',
  },
  {
    id: 's-7',
    name: 'Sede Yauli - La Oroya',
    zona: 'Zona Minera / Sierra',
    sedeFisica: 'La Oroya Antigua',
    coordinadorZonal: 'Carlos Mendoza',
    gestorCampo: 'Carlos Mendoza',
    status: 'Con retraso',
    progress: 30,
    tasksTotal: 4,
    tasksDone: 1,
    presupuesto: 'S/ 50,000',
    lastInspection: '18 oct. 2026',
  },
  {
    id: 's-8',
    name: 'Sede Satipo',
    zona: 'Selva Central',
    sedeFisica: 'Satipo Urbano',
    coordinadorZonal: 'Lucía Ramos',
    gestorCampo: 'María Salazar',
    status: 'Con retraso',
    progress: 20,
    tasksTotal: 5,
    tasksDone: 1,
    presupuesto: 'S/ 110,000',
    lastInspection: '19 oct. 2026',
  },
  {
    id: 's-9',
    name: 'Sede Pichanaki',
    zona: 'Selva Central',
    sedeFisica: 'Pichanaki Eje Cafetero',
    coordinadorZonal: 'Lucía Ramos',
    gestorCampo: 'Lucía Ramos',
    status: 'Con retraso',
    progress: 20,
    tasksTotal: 5,
    tasksDone: 1,
    presupuesto: 'S/ 88,000',
    lastInspection: '17 oct. 2026',
  },
  {
    id: 's-10',
    name: 'Sede Río Tambo',
    zona: 'Selva Frontera',
    sedeFisica: 'Puerto Prado',
    coordinadorZonal: 'Lucía Ramos',
    gestorCampo: 'Javier Ruiz',
    status: 'Con retraso',
    progress: 10,
    tasksTotal: 4,
    tasksDone: 0,
    presupuesto: 'S/ 75,000',
    lastInspection: '15 oct. 2026',
  },
];

const GESTOR_COLORS: Record<string, string> = {
  'María Salazar': '#0284c7',
  'Carlos Mendoza': '#2563eb',
  'Lucía Ramos': '#7c3aed',
  'Javier Ruiz': '#d97706',
  'Sin Asignar': '#94a3b8',
};

const getInitials = (name: string) => {
  if (!name) return 'S';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};


export type UgelStatus = 'Cumple' | 'En proceso' | 'No cumple' | 'Sin información';

export interface UgelTask {
  id: string;
  text: string;
  done: boolean;
}

export interface UgelDoc {
  id: string;
  name: string;
  updatedAt: string;
  type: 'excel' | 'pdf';
  verified: boolean;
}

export interface UgelExecutionRow {
  id: string;
  ugelName: string;
  status: UgelStatus;
  start: string;
  end: string;
  durationLabel: string;
  progress: number;
  responsable: string;
  cargo: string;
  faseActual: string;
  observaciones: string;
  tasks: UgelTask[];
  docs: UgelDoc[];
  barLeftPct: number;
  barWidthPct: number;
}

export interface DeliverableOption {
  id: string;
  code: string;
  name: string;
  componentName: string;
  start: string;
  end: string;
  durationLabel: string;
}

const DEFAULT_DELIVERABLES: DeliverableOption[] = [
  {
    id: 'pt-1.6',
    code: '1.6',
    name: 'Elaboración del CDL en MC SIGA',
    componentName: 'I. Planificación de la distribución',
    start: '12/10/2026',
    end: '30/11/2026',
    durationLabel: '2 meses',
  },
  {
    id: 'pt-4.2',
    code: '4.2',
    name: 'Contratación del servicio de transporte a II.EE.',
    componentName: 'IV. Gestión de contratos de distribución',
    start: '01/12/2026',
    end: '01/02/2027',
    durationLabel: '2 meses',
  },
  {
    id: 'pt-6.2',
    code: '6.2',
    name: 'Despacho y emisión de PECOSA en MC SIGA',
    componentName: 'VI. Despacho de ME de UGEL a II.EE.',
    start: '02/02/2027',
    end: '26/02/2027',
    durationLabel: '1 mes',
  },
  {
    id: 'pt-7.1',
    code: '7.1',
    name: 'Recepción física, verificación y suscripción de PECOSA en IE',
    componentName: 'VII. Recepción de ME en la IE',
    start: '15/01/2027',
    end: '26/02/2027',
    durationLabel: '1.5 meses',
  },
  {
    id: 'pt-7.2',
    code: '7.2',
    name: 'Tratamiento, formulación y reporte de Actas de Incidencia',
    componentName: 'VII. Recepción de ME en la IE',
    start: '15/01/2027',
    end: '26/02/2027',
    durationLabel: '1.5 meses',
  },
];

const INITIAL_UGEL_ROWS: UgelExecutionRow[] = [
  {
    id: 'ugel-chupaca',
    ugelName: 'UGEL Chupaca',
    status: 'Cumple',
    start: '12/10/2026',
    end: '15/11/2026',
    durationLabel: '1 mes',
    progress: 100,
    responsable: 'Esp. CDL Chupaca',
    cargo: 'Ejecutor Operativo',
    faseActual: 'Fase 3 – Validación DEI completada',
    observaciones: 'Cuadro de Distribución Local validado al 100% y acta suscrita sin observaciones.',
    barLeftPct: 18,
    barWidthPct: 28,
    tasks: [
      { id: 't1', text: 'Conformar comité de distribución UGEL', done: true },
      { id: 't2', text: 'Cargar archivo RAR en MC SIGA', done: true },
      { id: 't3', text: 'Validar asignación modular sin inconsistencias', done: true },
      { id: 't4', text: 'Remitir oficio de conformidad CDL a DRE Junín', done: true },
    ],
    docs: [
      { id: 'd1', name: 'CDL Chupaca - Consolidado Final.xlsx', updatedAt: 'Actualizado 14 nov. 2026', type: 'excel', verified: true },
      { id: 'd2', name: 'Acta_Comite_UGEL_Chupaca.pdf', updatedAt: 'Actualizado 15 oct. 2026', type: 'pdf', verified: true },
      { id: 'd3', name: 'Sustento_PECOSA_Preliminar.pdf', updatedAt: 'Actualizado 15 nov. 2026', type: 'pdf', verified: true },
    ],
  },
  {
    id: 'ugel-concepcion',
    ugelName: 'UGEL Concepción',
    status: 'Cumple',
    start: '12/10/2026',
    end: '15/11/2026',
    durationLabel: '1 mes',
    progress: 100,
    responsable: 'Esp. CDL Concepción',
    cargo: 'Ejecutor Operativo',
    faseActual: 'Fase 3 – Validación DEI completada',
    observaciones: 'Registro MC SIGA y validación de matrícula cerrados en plazo.',
    barLeftPct: 18,
    barWidthPct: 28,
    tasks: [
      { id: 't1', text: 'Conformar comité de distribución UGEL', done: true },
      { id: 't2', text: 'Cargar archivo RAR en MC SIGA', done: true },
      { id: 't3', text: 'Validar asignación modular sin inconsistencias', done: true },
      { id: 't4', text: 'Remitir oficio de conformidad CDL a DRE Junín', done: true },
    ],
    docs: [
      { id: 'd1', name: 'CDL Concepción - Fase 3.xlsx', updatedAt: 'Actualizado 15 nov. 2026', type: 'excel', verified: true },
      { id: 'd2', name: 'Resolucion_Comite_Concepcion.pdf', updatedAt: 'Actualizado 16 oct. 2026', type: 'pdf', verified: true },
    ],
  },
  {
    id: 'ugel-huancayo',
    ugelName: 'UGEL Huancayo',
    status: 'En proceso',
    start: '14/10/2026',
    end: '28/11/2026',
    durationLabel: '1.5 meses',
    progress: 75,
    responsable: 'Esp. CDL Huancayo',
    cargo: 'Ejecutor Operativo',
    faseActual: 'Fase 2 – Registro MC SIGA',
    observaciones: 'Pendiente validación de DEI y envío de acta de comité.',
    barLeftPct: 21,
    barWidthPct: 36,
    tasks: [
      { id: 't1', text: 'Conformar comité de distribución UGEL', done: true },
      { id: 't2', text: 'Cargar archivo RAR en MC SIGA', done: true },
      { id: 't3', text: 'Registro de NEA en sistema MC SIGA', done: true },
      { id: 't4', text: 'Validación DEI y cierre de brechas nivel inicial', done: false },
    ],
    docs: [
      { id: 'd1', name: 'CDL Huancayo - Fase 2.xlsx', updatedAt: 'Actualizado 12 oct. 2026', type: 'excel', verified: true },
      { id: 'd2', name: 'Acta_Instalacion_Huancayo.pdf', updatedAt: 'Actualizado 18 oct. 2026', type: 'pdf', verified: true },
      { id: 'd3', name: 'Reporte_NEA_Preliminar.pdf', updatedAt: 'Actualizado 04 nov. 2026', type: 'pdf', verified: false },
    ],
  },
  {
    id: 'ugel-jauja',
    ugelName: 'UGEL Jauja',
    status: 'En proceso',
    start: '14/10/2026',
    end: '28/11/2026',
    durationLabel: '1.5 meses',
    progress: 50,
    responsable: 'Ana Torres · Esp. Jauja',
    cargo: 'Especialista de Materiales',
    faseActual: 'Fase 2 – Registro MC SIGA',
    observaciones: 'En proceso de conciliación de códigos modulares de zona rural.',
    barLeftPct: 21,
    barWidthPct: 36,
    tasks: [
      { id: 't1', text: 'Conformar comité de distribución UGEL', done: true },
      { id: 't2', text: 'Cargar archivo RAR en MC SIGA', done: true },
      { id: 't3', text: 'Registro de NEA en sistema MC SIGA', done: false },
      { id: 't4', text: 'Validación DEI y envío de oficio CDL', done: false },
    ],
    docs: [
      { id: 'd1', name: 'CDL Jauja - Preliminar.xlsx', updatedAt: 'Actualizado 20 oct. 2026', type: 'excel', verified: true },
      { id: 'd2', name: 'Oficio_Comite_Jauja.pdf', updatedAt: 'Actualizado 19 oct. 2026', type: 'pdf', verified: false },
    ],
  },
  {
    id: 'ugel-junin',
    ugelName: 'UGEL Junín',
    status: 'En proceso',
    start: '14/10/2026',
    end: '28/11/2026',
    durationLabel: '1.5 meses',
    progress: 50,
    responsable: 'María Jara · Esp. Junín',
    cargo: 'Ejecutor Operativo',
    faseActual: 'Fase 2 – Registro MC SIGA',
    observaciones: 'Avance al 50% en carga de cuadros de distribución local.',
    barLeftPct: 21,
    barWidthPct: 36,
    tasks: [
      { id: 't1', text: 'Conformar comité de distribución UGEL', done: true },
      { id: 't2', text: 'Cargar archivo RAR en MC SIGA', done: true },
      { id: 't3', text: 'Validar registro sin inconsistencias', done: false },
      { id: 't4', text: 'Confirmar 100% de NEA registradas', done: false },
    ],
    docs: [
      { id: 'd1', name: 'CDL Junín - Fase 2.xlsx', updatedAt: 'Actualizado 22 oct. 2026', type: 'excel', verified: true },
    ],
  },
  {
    id: 'ugel-satipo',
    ugelName: 'UGEL Satipo',
    status: 'No cumple',
    start: '14/10/2026',
    end: '28/11/2026',
    durationLabel: '1.5 meses',
    progress: 33,
    responsable: 'Javier Ruiz · Esp. Satipo',
    cargo: 'Responsable Logístico',
    faseActual: 'Fase 1 – Planificación y CDL preliminar',
    observaciones: 'Demora en validación de códigos modulares de escuelas bilingües.',
    barLeftPct: 21,
    barWidthPct: 36,
    tasks: [
      { id: 't1', text: 'Conformar comité de distribución UGEL', done: true },
      { id: 't2', text: 'Cargar archivo RAR en MC SIGA', done: false },
      { id: 't3', text: 'Validar padrón de II.EE. EIB', done: false },
    ],
    docs: [
      { id: 'd1', name: 'CDL Satipo - Borrador.xlsx', updatedAt: 'Actualizado 18 oct. 2026', type: 'excel', verified: false },
    ],
  },
  {
    id: 'ugel-tarma',
    ugelName: 'UGEL Tarma',
    status: 'No cumple',
    start: '14/10/2026',
    end: '28/11/2026',
    durationLabel: '1.5 meses',
    progress: 20,
    responsable: 'Lucía Ramos · Esp. Tarma',
    cargo: 'Ejecutor Operativo',
    faseActual: 'Fase 1 – Planificación',
    observaciones: 'Se solicitó asistencia técnica a DIGERE para desbloqueo de usuario SIGA.',
    barLeftPct: 21,
    barWidthPct: 36,
    tasks: [
      { id: 't1', text: 'Conformar comité de distribución UGEL', done: true },
      { id: 't2', text: 'Cargar archivo RAR en MC SIGA', done: false },
      { id: 't3', text: 'Registro de NEA', done: false },
      { id: 't4', text: 'Suscripción de CDL validado', done: false },
      { id: 't5', text: 'Envío de expediente a DRE', done: false },
    ],
    docs: [
      { id: 'd1', name: 'Acta_Conformacion_Tarma.pdf', updatedAt: 'Actualizado 15 oct. 2026', type: 'pdf', verified: true },
    ],
  },
  {
    id: 'ugel-chanchamayo',
    ugelName: 'UGEL Chanchamayo',
    status: 'No cumple',
    start: '14/10/2026',
    end: '28/11/2026',
    durationLabel: '1.5 meses',
    progress: 20,
    responsable: 'Juan Pérez · Esp. Chanchamayo',
    cargo: 'Responsable de Logística',
    faseActual: 'Fase 1 – Planificación',
    observaciones: 'Pendiente remisión de resolución directoral del comité UGEL.',
    barLeftPct: 21,
    barWidthPct: 36,
    tasks: [
      { id: 't1', text: 'Conformar comité de distribución UGEL', done: true },
      { id: 't2', text: 'Cargar archivo RAR en MC SIGA', done: false },
      { id: 't3', text: 'Validar asignación modular', done: false },
      { id: 't4', text: 'Cierre de CDL en SIGA', done: false },
      { id: 't5', text: 'Firma de conformidad', done: false },
    ],
    docs: [
      { id: 'd1', name: 'CDL Chanchamayo - Inicial.xlsx', updatedAt: 'Actualizado 14 oct. 2026', type: 'excel', verified: false },
    ],
  },
  {
    id: 'ugel-yauli',
    ugelName: 'UGEL Yauli',
    status: 'No cumple',
    start: '14/10/2026',
    end: '28/11/2026',
    durationLabel: '1.5 meses',
    progress: 10,
    responsable: 'Esp. CDL Yauli - La Oroya',
    cargo: 'Ejecutor Operativo',
    faseActual: 'Fase 1 – Planificación',
    observaciones: 'En revisión de metas de atención por reubicación de locales escolares.',
    barLeftPct: 21,
    barWidthPct: 36,
    tasks: [
      { id: 't1', text: 'Instalar comité UGEL', done: false },
      { id: 't2', text: 'Cargar archivo RAR en MC SIGA', done: false },
    ],
    docs: [],
  },
  {
    id: 'ugel-pichanaqui',
    ugelName: 'UGEL Pichanaqui',
    status: 'No cumple',
    start: '14/10/2026',
    end: '28/11/2026',
    durationLabel: '1.5 meses',
    progress: 0,
    responsable: 'Esp. CDL Pichanaqui',
    cargo: 'Ejecutor Operativo',
    faseActual: 'Fase 1 – Planificación',
    observaciones: 'Requerimiento de regularización urgente emitido por coordinación regional.',
    barLeftPct: 21,
    barWidthPct: 36,
    tasks: [
      { id: 't1', text: 'Conformar comité de distribución UGEL', done: false },
      { id: 't2', text: 'Cargar archivo RAR en MC SIGA', done: false },
    ],
    docs: [],
  },
  {
    id: 'ugel-riotambo',
    ugelName: 'UGEL Río Tambo',
    status: 'No cumple',
    start: '14/10/2026',
    end: '28/11/2026',
    durationLabel: '1.5 meses',
    progress: 0,
    responsable: 'Esp. CDL Río Tambo',
    cargo: 'Ejecutor Operativo',
    faseActual: 'Fase 1 – Planificación',
    observaciones: 'En coordinación para acceso satelital y carga de matriz SIGA.',
    barLeftPct: 21,
    barWidthPct: 36,
    tasks: [
      { id: 't1', text: 'Conformar comité de distribución UGEL', done: false },
      { id: 't2', text: 'Cargar archivo RAR en MC SIGA', done: false },
    ],
    docs: [],
  },
  {
    id: 'ugel-pangoa',
    ugelName: 'UGEL Pangoa',
    status: 'Sin información',
    start: '14/10/2026',
    end: '28/11/2026',
    durationLabel: '1.5 meses',
    progress: 0,
    responsable: 'Esp. CDL Pangoa',
    cargo: 'Ejecutor Operativo',
    faseActual: 'Pendiente de reporte inicial',
    observaciones: 'Sin reporte registrado en el corte semanal.',
    barLeftPct: 21,
    barWidthPct: 36,
    tasks: [
      { id: 't1', text: 'Conformar comité de distribución UGEL', done: false },
      { id: 't2', text: 'Cargar archivo RAR en MC SIGA', done: false },
    ],
    docs: [],
  },
  {
    id: 'ugel-perene',
    ugelName: 'UGEL Perené',
    status: 'No cumple',
    start: '14/10/2026',
    end: '28/11/2026',
    durationLabel: '1.5 meses',
    progress: 0,
    responsable: 'Esp. CDL Perené',
    cargo: 'Ejecutor Operativo',
    faseActual: 'Fase 1 – Planificación',
    observaciones: 'Pendiente acreditación de responsable SIGA ante la DRE Junín.',
    barLeftPct: 21,
    barWidthPct: 36,
    tasks: [
      { id: 't1', text: 'Conformar comité de distribución UGEL', done: false },
      { id: 't2', text: 'Cargar archivo RAR en MC SIGA', done: false },
    ],
    docs: [],
  },
];

export default function SedesView({
  onActions,
  activeProjectId,
}: {
  onActions?: (h: any) => void;
  activeProjectId?: string;
}) {
  const storageKey = `qaway-sedes-${activeProjectId || 'default'}`;

  const [sedes, setSedes] = useState<SedeItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      /* fallback */
    }
    return INITIAL_SEDES;
  });

  // Pestañas y Vistas
  const [selectedTab, setSelectedTab] = useState<string>('Todas');
  const [viewMode, setViewMode] = useState<'Tarjetas' | 'Lista' | 'Territorial'>('Territorial');

  // Filtros de búsqueda y cabecera
  const [search, setSearch] = useState('');
  const [zonaFilter, setZonaFilter] = useState('Todas las Zonas');
  const [coordFilter, setCoordFilter] = useState('Todos los Coord.');
  const [gestorFilter, setGestorFilter] = useState('Todos los Gestores');
  const [statusFilter, setStatusFilter] = useState('Todos los Estados');
  const [openDropdown, setOpenDropdown] = useState<'zona' | 'coord' | 'gestor' | 'status' | null>(null);

  // Estados de la Vista Cronograma Territorial por UGEL
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string>('pt-1.6');
  const [ugelStatusFilter, setUgelStatusFilter] = useState<string>('Todos');
  const [ugelRowsByDeliverable, setUgelRowsByDeliverable] = useState<Record<string, UgelExecutionRow[]>>(() => {
    try {
      const saved = localStorage.getItem('qaway-sedes-territorial-v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { 'pt-1.6': INITIAL_UGEL_ROWS };
  });
  const [selectedUgelId, setSelectedUgelId] = useState<string | null>('ugel-huancayo');
  const [ugelDrawerTab, setUgelDrawerTab] = useState<'info' | 'tareas' | 'docs'>('info');
  const [newTaskText, setNewTaskText] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem('qaway-sedes-territorial-v1', JSON.stringify(ugelRowsByDeliverable));
    } catch {}
  }, [ugelRowsByDeliverable]);

  const currentDeliverable = useMemo(
    () => DEFAULT_DELIVERABLES.find((d) => d.id === selectedDeliverableId) || DEFAULT_DELIVERABLES[0],
    [selectedDeliverableId]
  );

  const currentUgelRows = useMemo(() => {
    const list = ugelRowsByDeliverable[selectedDeliverableId] || INITIAL_UGEL_ROWS;
    return list.filter((r) => {
      const matchSearch = search === '' || r.ugelName.toLowerCase().includes(search.toLowerCase()) || r.responsable.toLowerCase().includes(search.toLowerCase());
      const matchSt = ugelStatusFilter === 'Todos' || r.status === ugelStatusFilter;
      return matchSearch && matchSt;
    });
  }, [ugelRowsByDeliverable, selectedDeliverableId, search, ugelStatusFilter]);

  const allCurrentUgelRows = ugelRowsByDeliverable[selectedDeliverableId] || INITIAL_UGEL_ROWS;
  const deliverableRollupProgress = useMemo(() => {
    if (allCurrentUgelRows.length === 0) return 0;
    const sum = allCurrentUgelRows.reduce((acc, r) => acc + (r.progress || 0), 0);
    return Math.round(sum / allCurrentUgelRows.length);
  }, [allCurrentUgelRows]);

  const selectedUgelRow = useMemo(
    () => allCurrentUgelRows.find((r) => r.id === selectedUgelId) || null,
    [allCurrentUgelRows, selectedUgelId]
  );

  const updateUgelRow = (ugelId: string, updater: (row: UgelExecutionRow) => UgelExecutionRow) => {
    setUgelRowsByDeliverable((prev) => {
      const baseList = prev[selectedDeliverableId] || INITIAL_UGEL_ROWS;
      const nextList = baseList.map((r) => (r.id === ugelId ? updater(r) : r));
      return { ...prev, [selectedDeliverableId]: nextList };
    });
  };

  // Modales y Drawer
  const [selectedSede, setSelectedSede] = useState<SedeItem | null>(null);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [newSedeName, setNewSedeName] = useState('');
  const [newSedeZona, setNewSedeZona] = useState('Valle del Mantaro');
  const [newSedeCoord, setNewSedeCoord] = useState('Carlos Mendoza');
  const [newSedeGestor, setNewSedeGestor] = useState('María Salazar');
  const [newSedePresupuesto, setNewSedePresupuesto] = useState('S/ 60,000');

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(sedes));
    } catch {
      /* fallback */
    }
  }, [sedes, storageKey]);

  useEffect(() => {
    onActions?.({
      notify: (m: string) => alert(m),
    });
  }, [onActions]);

  // Cerrar popovers al hacer click fuera
  useEffect(() => {
    const handleWindowClick = () => setOpenDropdown(null);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  // Listas únicas de opciones
  const zonas = useMemo(() => ['Todas las Zonas', ...Array.from(new Set(sedes.map((s) => s.zona)))], [sedes]);
  const coords = useMemo(() => ['Todos los Coord.', ...Array.from(new Set(sedes.map((s) => s.coordinadorZonal)))], [sedes]);
  const gestores = useMemo(() => ['Todos los Gestores', ...Array.from(new Set(sedes.map((s) => s.gestorCampo)))], [sedes]);
  const statuses = ['Todos los Estados', 'En plazo', 'En curso', 'Con retraso', 'Completado'];

  // Métricas
  const totalSedes = sedes.length;
  const sedesEnPlazo = sedes.filter((s) => s.status === 'En plazo').length;
  const sedesEnCurso = sedes.filter((s) => s.status === 'En curso').length;
  const sedesRetraso = sedes.filter((s) => s.status === 'Con retraso').length;
  const sedesCompletado = sedes.filter((s) => s.status === 'Completado').length;
  const sedesAlDia = sedes.filter((s) => s.status === 'Completado' || s.status === 'En plazo').length;
  const gestoresActivos = new Set(sedes.map((s) => s.gestorCampo)).size;

  const tabPills = [
    { id: 'Todas', label: 'Todas las sedes', count: totalSedes },
    { id: 'En plazo', label: 'En plazo', count: sedesEnPlazo },
    { id: 'En curso', label: 'En curso', count: sedesEnCurso },
    { id: 'Con retraso', label: 'Con retraso', count: sedesRetraso },
    { id: 'Completado', label: 'Completadas', count: sedesCompletado },
  ];

  // Filtrado reactivo
  const filteredSedes = useMemo(() => {
    return sedes.filter((s) => {
      const matchSearch =
        search === '' ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.zona.toLowerCase().includes(search.toLowerCase()) ||
        s.sedeFisica.toLowerCase().includes(search.toLowerCase()) ||
        s.coordinadorZonal.toLowerCase().includes(search.toLowerCase()) ||
        s.gestorCampo.toLowerCase().includes(search.toLowerCase());

      const matchTab = selectedTab === 'Todas' || s.status === selectedTab;
      const matchZona = zonaFilter === 'Todas las Zonas' || s.zona === zonaFilter;
      const matchCoord = coordFilter === 'Todos los Coord.' || s.coordinadorZonal === coordFilter;
      const matchGestor = gestorFilter === 'Todos los Gestores' || s.gestorCampo === gestorFilter;
      const matchStatus = statusFilter === 'Todos los Estados' || s.status === statusFilter;

      return matchSearch && matchTab && matchZona && matchCoord && matchGestor && matchStatus;
    });
  }, [sedes, search, selectedTab, zonaFilter, coordFilter, gestorFilter, statusFilter]);

  const hasActiveFilters =
    search !== '' ||
    zonaFilter !== 'Todas las Zonas' ||
    coordFilter !== 'Todos los Coord.' ||
    gestorFilter !== 'Todos los Gestores' ||
    statusFilter !== 'Todos los Estados';

  const clearAllFilters = () => {
    setSearch('');
    setZonaFilter('Todas las Zonas');
    setCoordFilter('Todos los Coord.');
    setGestorFilter('Todos los Gestores');
    setStatusFilter('Todos los Estados');
  };

  const handleCreateSede = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSedeName.trim()) return;
    const item: SedeItem = {
      id: 's-' + Date.now(),
      name: newSedeName.trim(),
      zona: newSedeZona,
      sedeFisica: newSedeName.trim(),
      coordinadorZonal: newSedeCoord,
      gestorCampo: newSedeGestor,
      status: 'En curso',
      progress: 0,
      tasksTotal: 4,
      tasksDone: 0,
      presupuesto: newSedePresupuesto.trim() || 'S/ 50,000',
      lastInspection: 'Recién asignada',
    };
    setSedes((prev) => [item, ...prev]);
    setNewSedeName('');
    setIsModalCreateOpen(false);
  };

  const updateSelectedSede = (patch: Partial<SedeItem>) => {
    if (!selectedSede) return;
    const updated = { ...selectedSede, ...patch };
    setSelectedSede(updated);
    setSedes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const exportCSV = () => {
    const rows = [
      ['ID', 'Sede', 'Zona', 'Sede Física', 'Coordinador Zonal', 'Gestor de Campo', 'Estado', 'Avance (%)', 'Presupuesto', 'Última Inspección'],
      ...filteredSedes.map((s) => [
        s.id,
        s.name,
        s.zona,
        s.sedeFisica,
        s.coordinadorZonal,
        s.gestorCampo,
        s.status,
        String(s.progress),
        s.presupuesto,
        s.lastInspection,
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(['\ufeff' + rows.map((r) => r.map((v) => '"' + v.replaceAll('"', '""') + '"').join(',')).join('\r\n')], {
        type: 'text/csv;charset=utf-8;',
      })
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_sedes_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="gantt-v2">
      <div className="app">
        {/* Cabecera Principal Oficial (Idéntica a Cronograma) */}
        <header className="header">
          <div className="heading">
            <span className="heading-icon">
              <Building2 size={26} />
            </span>
            <div>
              <h1>Sedes de Supervisión y Frentes de Campo</h1>
              <p>
                Supervisión del avance físico, cumplimiento y asignación de gestores por cada frente operativo territorial.
              </p>
            </div>
          </div>
          <div className="head-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={exportCSV}
              title="Descargar reporte territorial en formato CSV"
            >
              <Download size={15} />
              <span>Exportar Sedes</span>
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={() => setIsModalCreateOpen(true)}
              title="Dar de alta una nueva sede o frente de trabajo"
            >
              <Plus size={16} />
              <span>Nueva Sede Operativa</span>
            </button>
          </div>
        </header>

        {/* Tarjetas Métricas Directivas (Idénticas a Cronograma) */}
        <section className="metrics">
          <article
            className="metric blue"
            onClick={() => {
              setSelectedTab('Todas');
              setStatusFilter('Todos los Estados');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <Building2 size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(totalSedes).padStart(2, '0')}</b>
              <strong>Sedes Supervisadas</strong>
              <small>frentes en seguimiento activo</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric green"
            onClick={() => {
              setSelectedTab('En plazo');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <CheckCircle2 size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(sedesAlDia).padStart(2, '0')}</b>
              <strong>En Plazo / Al Día</strong>
              <small>cumplimiento sin retrasos</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric amber"
            onClick={() => {
              setSelectedTab('Con retraso');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <AlertTriangle size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(sedesRetraso).padStart(2, '0')}</b>
              <strong>Con Retraso</strong>
              <small>requieren intervención prioritaria</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article className="metric red" style={{ cursor: 'default' }}>
            <span className="metric-icon">
              <Users size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(gestoresActivos).padStart(2, '0')}</b>
              <strong>Gestores Activos</strong>
              <small>asignados en territorio</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>
        </section>

        {/* =========================================================================
            LA CÁPSULA WORKSPACE CENTRAL (Idéntica a Cronograma, Tareas y Equipo)
           ========================================================================= */}
        <main className="workspace">
          {/* Tabs Superiores con Switcher de Modos a la Derecha */}
          <nav className="tabs">
            <div className="tabs-list">
              {tabPills.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={selectedTab === t.id ? 'active' : ''}
                  onClick={() => setSelectedTab(t.id)}
                >
                  {t.label} <span>({t.count})</span>
                </button>
              ))}
            </div>

            {/* Switcher de Modos (Fichas de Sedes / Lista / Cronograma Territorial) */}
            <div className="view-mode-switcher" role="tablist">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'Tarjetas' ? 'active' : ''}`}
                onClick={() => setViewMode('Tarjetas')}
                title="Vista Cuadrícula de Fichas de Sedes"
              >
                <LayoutGrid size={14} />
                <span>Fichas de Sedes</span>
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'Lista' ? 'active' : ''}`}
                onClick={() => setViewMode('Lista')}
                title="Vista Lista Tabular"
              >
                <List size={14} />
                <span>Lista</span>
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'Territorial' ? 'active' : ''}`}
                onClick={() => setViewMode('Territorial')}
                title="Cronograma de Ejecución Territorial por UGEL"
              >
                <Calendar size={14} />
                <span>Cronograma Territorial</span>
              </button>
            </div>
          </nav>

          {/* Barra de Filtros Nativa estilo Cronograma */}
          <div className="filters">
            <label className="search">
              <Search size={16} />
              <input
                placeholder="Buscar sede, distrito o frente territorial..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  <X size={14} />
                </button>
              )}
            </label>

            {/* Filtro Zona / Ámbito */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'zona' ? 'active' : ''} ${
                  zonaFilter !== 'Todas las Zonas' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'zona' ? null : 'zona');
                }}
                title="Filtrar por Zona o Macro-región"
              >
                <div className="filter-card-copy">
                  <small>Zona / Ámbito</small>
                  <span>{zonaFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'zona' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 220 }}>
                  <div className="filter-popover-title">Filtrar por Zona</div>
                  <div className="filter-popover-list">
                    {zonas.map((z) => (
                      <button
                        key={z}
                        type="button"
                        className={`filter-item-btn ${zonaFilter === z ? 'selected' : ''}`}
                        onClick={() => {
                          setZonaFilter(z);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{z}</span>
                        {zonaFilter === z && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro Coordinador Zonal */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'coord' ? 'active' : ''} ${
                  coordFilter !== 'Todos los Coord.' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'coord' ? null : 'coord');
                }}
                title="Filtrar por Coordinador Zonal"
              >
                <div className="filter-card-copy">
                  <small>Coordinador Zonal</small>
                  <span>{coordFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'coord' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 220 }}>
                  <div className="filter-popover-title">Filtrar por Coordinador</div>
                  <div className="filter-popover-list">
                    {coords.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`filter-item-btn ${coordFilter === c ? 'selected' : ''}`}
                        onClick={() => {
                          setCoordFilter(c);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{c}</span>
                        {coordFilter === c && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro Gestor de Campo */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'gestor' ? 'active' : ''} ${
                  gestorFilter !== 'Todos los Gestores' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'gestor' ? null : 'gestor');
                }}
                title="Filtrar por Gestor de Campo asignado"
              >
                <div className="filter-card-copy">
                  <small>Gestor de Campo</small>
                  <span>{gestorFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'gestor' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 220 }}>
                  <div className="filter-popover-title">Filtrar por Gestor</div>
                  <div className="filter-popover-list">
                    {gestores.map((g) => (
                      <button
                        key={g}
                        type="button"
                        className={`filter-item-btn ${gestorFilter === g ? 'selected' : ''}`}
                        onClick={() => {
                          setGestorFilter(g);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{g}</span>
                        {gestorFilter === g && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro Estado */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'status' ? 'active' : ''} ${
                  statusFilter !== 'Todos los Estados' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'status' ? null : 'status');
                }}
                title="Filtrar por Estado de cumplimiento"
              >
                <div className="filter-card-copy">
                  <small>Estado</small>
                  <span>{statusFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'status' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 200 }}>
                  <div className="filter-popover-title">Filtrar por Estado</div>
                  <div className="filter-popover-list">
                    {statuses.map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`filter-item-btn ${statusFilter === st ? 'selected' : ''}`}
                        onClick={() => {
                          setStatusFilter(st);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{st}</span>
                        {statusFilter === st && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="btn secondary"
                onClick={clearAllFilters}
                style={{ height: '38px', padding: '0 14px', fontSize: '12px' }}
                title="Restablecer todos los filtros"
              >
                <RefreshCw size={13} />
                <span>Limpiar</span>
              </button>
            )}
          </div>

          {/* Contenido de Sedes: Cronograma Territorial por UGEL, Vista Tarjetas o Vista Lista */}
          {viewMode === 'Territorial' ? (
            <div className={`sd-territorial-split ${selectedUgelRow ? 'with-drawer' : ''}`}>
              <div className="sd-territorial-gantt-wrap">
                {/* Barra de Selectores y Leyenda del Cronograma Territorial */}
                <div className="sd-territorial-toolbar">
                  <div className="sd-territorial-selectors">
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        Entregable WBS ejecutado por UGEL
                      </span>
                      <select
                        value={selectedDeliverableId}
                        onChange={(e) => setSelectedDeliverableId(e.target.value)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '12.5px',
                          fontWeight: 650,
                          color: '#0f172a',
                          outline: 'none',
                          minWidth: '300px',
                        }}
                      >
                        {DEFAULT_DELIVERABLES.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.code} {d.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        Estado UGEL
                      </span>
                      <select
                        value={ugelStatusFilter}
                        onChange={(e) => setUgelStatusFilter(e.target.value)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      >
                        <option value="Todos">Todos los estados</option>
                        <option value="Cumple">Cumple</option>
                        <option value="En proceso">En proceso</option>
                        <option value="No cumple">No cumple</option>
                        <option value="Sin información">Sin información</option>
                      </select>
                    </label>
                  </div>

                  {/* Leyenda Semafórica Oficial */}
                  <div className="sd-territorial-legend">
                    <span className="sd-legend-item">
                      <i className="sd-legend-dot" style={{ background: '#16a34a' }} /> Cumple
                    </span>
                    <span className="sd-legend-item">
                      <i className="sd-legend-dot" style={{ background: '#f59e0b' }} /> En proceso
                    </span>
                    <span className="sd-legend-item">
                      <i className="sd-legend-dot" style={{ background: '#ef4444' }} /> No cumple
                    </span>
                    <span className="sd-legend-item">
                      <i className="sd-legend-dot" style={{ background: '#94a3b8' }} /> Sin información
                    </span>
                  </div>
                </div>

                {/* Tabla Jerárquica Gantt de las 13 UGEL de Junín */}
                <table className="sd-territorial-table">
                  <thead>
                    <tr>
                      <th style={{ minWidth: '250px' }}>Sede / UGEL</th>
                      <th style={{ width: '125px' }}>Estado</th>
                      <th style={{ width: '95px' }}>Inicio</th>
                      <th style={{ width: '95px' }}>Fin</th>
                      <th style={{ width: '85px' }}>Duración</th>
                      <th>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', textAlign: 'center', fontSize: '11px' }}>
                          <span>Octubre 2026</span>
                          <span>Noviembre 2026</span>
                          <span>Diciembre 2026</span>
                          <span>Enero 2027</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Fila 0: Raíz del Proyecto */}
                    <tr className="sd-territorial-row row-hierarchy-root">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <ChevronDown size={14} color="#475569" />
                          <FolderKanban size={15} color="#2563eb" />
                          <span>MINEDU · Dotación 2027</span>
                        </div>
                      </td>
                      <td>
                        <span className="sd-ugel-badge proceso">
                          <i /> En proceso
                        </span>
                      </td>
                      <td>04/09/2026</td>
                      <td>30/07/2027</td>
                      <td>11 meses</td>
                      <td className="sd-gantt-track-cell">
                        <div className="sd-gantt-bar-wrap">
                          <div className="sd-gantt-bar-outer" style={{ width: '90%', marginLeft: '2%' }}>
                            <div className="sd-gantt-bar-fill" style={{ width: '28%', background: '#64748b' }} />
                          </div>
                          <span className="sd-gantt-bar-pct">28%</span>
                        </div>
                      </td>
                    </tr>

                    {/* Fila 1: Componente Padre */}
                    <tr className="sd-territorial-row row-hierarchy-comp">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', paddingLeft: '16px' }}>
                          <ChevronDown size={14} color="#475569" />
                          <Building2 size={15} color="#0284c7" />
                          <span>{currentDeliverable.componentName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="sd-ugel-badge proceso">
                          <i /> En proceso
                        </span>
                      </td>
                      <td>04/09/2026</td>
                      <td>30/11/2026</td>
                      <td>3 meses</td>
                      <td className="sd-gantt-track-cell">
                        <div className="sd-gantt-bar-wrap">
                          <div className="sd-gantt-bar-outer" style={{ width: '48%', marginLeft: '10%' }}>
                            <div className="sd-gantt-bar-fill" style={{ width: '57%', background: '#2563eb' }} />
                          </div>
                          <span className="sd-gantt-bar-pct">57%</span>
                        </div>
                      </td>
                    </tr>

                    {/* Fila 2: Paquete / Entregable Seleccionado (Rollup de las 13 UGELs) */}
                    <tr className="sd-territorial-row row-hierarchy-pkg">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', paddingLeft: '32px' }}>
                          <ChevronDown size={14} color="#15803d" />
                          <FileText size={15} color="#16a34a" />
                          <span>
                            {currentDeliverable.code} {currentDeliverable.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="sd-ugel-badge proceso">
                          <i /> En proceso
                        </span>
                      </td>
                      <td>{currentDeliverable.start}</td>
                      <td>{currentDeliverable.end}</td>
                      <td>{currentDeliverable.durationLabel}</td>
                      <td className="sd-gantt-track-cell">
                        <div className="sd-gantt-bar-wrap">
                          <div className="sd-gantt-bar-outer" style={{ width: '38%', marginLeft: '18%' }}>
                            <div
                              className="sd-gantt-bar-fill"
                              style={{ width: `${deliverableRollupProgress}%`, background: '#16a34a' }}
                            />
                          </div>
                          <span className="sd-gantt-bar-pct">{deliverableRollupProgress}%</span>
                        </div>
                      </td>
                    </tr>

                    {/* Filas 3..15: Las 13 UGEL de la Región Junín */}
                    {currentUgelRows.map((row) => {
                      const isSelected = selectedUgelId === row.id;
                      const badgeClass =
                        row.status === 'Cumple'
                          ? 'cumple'
                          : row.status === 'En proceso'
                          ? 'proceso'
                          : row.status === 'No cumple'
                          ? 'nocumple'
                          : 'sininfo';

                      const fillColor =
                        row.status === 'Cumple'
                          ? '#16a34a'
                          : row.status === 'En proceso'
                          ? '#f59e0b'
                          : row.status === 'No cumple'
                          ? '#ef4444'
                          : '#94a3b8';

                      return (
                        <tr
                          key={row.id}
                          className={`sd-territorial-row ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedUgelId(row.id)}
                        >
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '50px' }}>
                              <Building2 size={14} color={isSelected ? '#2563eb' : '#64748b'} />
                              <span style={{ fontWeight: isSelected ? 700 : 600, color: '#0f172a' }}>{row.ugelName}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`sd-ugel-badge ${badgeClass}`}>
                              <i /> {row.status}
                            </span>
                          </td>
                          <td style={{ color: '#475569', fontSize: '12.5px' }}>{row.start}</td>
                          <td style={{ color: '#475569', fontSize: '12.5px' }}>{row.end}</td>
                          <td style={{ color: '#64748b', fontSize: '12.5px' }}>{row.durationLabel}</td>
                          <td className="sd-gantt-track-cell">
                            <div className="sd-gantt-bar-wrap">
                              <div
                                className="sd-gantt-bar-outer"
                                style={{ width: `${row.barWidthPct}%`, marginLeft: `${row.barLeftPct}%` }}
                              >
                                <div
                                  className="sd-gantt-bar-fill"
                                  style={{
                                    width: `${Math.max(row.progress, row.status === 'No cumple' ? 18 : 0)}%`,
                                    background: fillColor,
                                  }}
                                />
                              </div>
                              <span className="sd-gantt-bar-pct">{row.progress}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Drawer / Panel Lateral Interactivo de UGEL Seleccionada */}
              {selectedUgelRow && (
                <aside className="sd-ugel-panel">
                  <div className="sd-ugel-panel-head">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                        {selectedUgelRow.ugelName}
                      </h3>
                      <span
                        className={`sd-ugel-badge ${
                          selectedUgelRow.status === 'Cumple'
                            ? 'cumple'
                            : selectedUgelRow.status === 'En proceso'
                            ? 'proceso'
                            : selectedUgelRow.status === 'No cumple'
                            ? 'nocumple'
                            : 'sininfo'
                        }`}
                      >
                        <i /> {selectedUgelRow.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUgelId(null)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: '#64748b',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                      title="Cerrar panel de UGEL"
                    >
                      <X size={17} />
                    </button>
                  </div>

                  {/* Navegación de 3 Pestañas: Información | Tareas | Documentos */}
                  <div className="sd-ugel-tabs">
                    <button
                      type="button"
                      className={`sd-ugel-tab-btn ${ugelDrawerTab === 'info' ? 'active' : ''}`}
                      onClick={() => setUgelDrawerTab('info')}
                    >
                      Información
                    </button>
                    <button
                      type="button"
                      className={`sd-ugel-tab-btn ${ugelDrawerTab === 'tareas' ? 'active' : ''}`}
                      onClick={() => setUgelDrawerTab('tareas')}
                    >
                      Tareas ({selectedUgelRow.tasks.filter((t) => t.done).length}/{selectedUgelRow.tasks.length})
                    </button>
                    <button
                      type="button"
                      className={`sd-ugel-tab-btn ${ugelDrawerTab === 'docs' ? 'active' : ''}`}
                      onClick={() => setUgelDrawerTab('docs')}
                    >
                      Documentos ({selectedUgelRow.docs.length})
                    </button>
                  </div>

                  {/* Cuerpo de la Pestaña Activa */}
                  <div className="sd-ugel-panel-body">
                    {ugelDrawerTab === 'info' && (
                      <>
                        {/* Avance General */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>Avance general</span>
                            <b style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{selectedUgelRow.progress}%</b>
                          </div>
                          <div className="sd-progress-track" style={{ height: '8px', marginBottom: '8px' }}>
                            <div
                              className="sd-progress-fill"
                              style={{
                                width: `${selectedUgelRow.progress}%`,
                                background:
                                  selectedUgelRow.status === 'Cumple'
                                    ? '#16a34a'
                                    : selectedUgelRow.status === 'En proceso'
                                    ? '#f59e0b'
                                    : selectedUgelRow.status === 'No cumple'
                                    ? '#ef4444'
                                    : '#94a3b8',
                              }}
                            />
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={selectedUgelRow.progress}
                            onChange={(e) => {
                              const val = +e.target.value;
                              updateUgelRow(selectedUgelRow.id, (r) => ({
                                ...r,
                                progress: val,
                                status: val === 100 ? 'Cumple' : val > 0 ? 'En proceso' : r.status,
                              }));
                            }}
                            style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
                          />
                        </div>

                        {/* Estado Operativo */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Estado UGEL</span>
                          <select
                            value={selectedUgelRow.status}
                            onChange={(e) => {
                              const st = e.target.value as UgelStatus;
                              updateUgelRow(selectedUgelRow.id, (r) => ({
                                ...r,
                                status: st,
                                progress: st === 'Cumple' ? 100 : st === 'Sin información' ? 0 : r.progress,
                              }));
                            }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '12px',
                              fontWeight: 650,
                              color: '#0f172a',
                            }}
                          >
                            <option value="Cumple">Cumple</option>
                            <option value="En proceso">En proceso</option>
                            <option value="No cumple">No cumple</option>
                            <option value="Sin información">Sin información</option>
                          </select>
                        </div>

                        {/* Periodo */}
                        <div>
                          <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Periodo</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                            <Calendar size={14} color="#64748b" />
                            <span>
                              {selectedUgelRow.start} – {selectedUgelRow.end}
                            </span>
                          </div>
                        </div>

                        {/* Responsable */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Responsable</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              className="sd-avatar-circle"
                              style={{ width: '28px', height: '28px', fontSize: '11px', background: '#dbeafe', color: '#1e40af' }}
                            >
                              {getInitials(selectedUgelRow.responsable)}
                            </span>
                            <div>
                              <b style={{ display: 'block', fontSize: '12.5px', color: '#0f172a' }}>{selectedUgelRow.responsable}</b>
                              <small style={{ fontSize: '11px', color: '#64748b' }}>{selectedUgelRow.cargo}</small>
                            </div>
                          </div>
                        </div>

                        {/* Fase actual */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Fase actual</span>
                          <span style={{ fontSize: '12.5px', fontWeight: 650, color: '#0f172a' }}>{selectedUgelRow.faseActual}</span>
                        </div>

                        {/* Tareas resumen */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Tareas</span>
                          <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${
                                  selectedUgelRow.tasks.length
                                    ? Math.round((selectedUgelRow.tasks.filter((t) => t.done).length / selectedUgelRow.tasks.length) * 100)
                                    : 0
                                }%`,
                                height: '100%',
                                background: '#1e3a8a',
                              }}
                            />
                          </div>
                          <b style={{ fontSize: '12px', color: '#0f172a' }}>
                            {selectedUgelRow.tasks.filter((t) => t.done).length}/{selectedUgelRow.tasks.length}
                          </b>
                        </div>

                        {/* Observaciones */}
                        <div>
                          <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Observaciones</span>
                          <textarea
                            rows={3}
                            value={selectedUgelRow.observaciones}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateUgelRow(selectedUgelRow.id, (r) => ({ ...r, observaciones: val }));
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              background: '#f8fafc',
                              fontSize: '12.5px',
                              color: '#334155',
                              resize: 'vertical',
                              outline: 'none',
                            }}
                          />
                        </div>

                        {/* Enlaces */}
                        {selectedUgelRow.docs.length > 0 && (
                          <div>
                            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Enlaces</span>
                            {selectedUgelRow.docs.slice(0, 2).map((doc) => (
                              <div
                                key={doc.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  marginBottom: '6px',
                                }}
                              >
                                <FileText size={16} color="#2563eb" />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <b
                                    style={{
                                      display: 'block',
                                      fontSize: '12.5px',
                                      color: '#2563eb',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {doc.name}
                                  </b>
                                  <small style={{ fontSize: '11px', color: '#64748b' }}>{doc.updatedAt}</small>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {ugelDrawerTab === 'tareas' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                          Checklist operativo de la UGEL (impacta el avance de la sede):
                        </div>
                        {selectedUgelRow.tasks.map((task) => (
                          <label
                            key={task.id}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              background: task.done ? '#f0fdf4' : '#ffffff',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={task.done}
                              onChange={() => {
                                updateUgelRow(selectedUgelRow.id, (r) => {
                                  const nextTasks = r.tasks.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t));
                                  const doneCount = nextTasks.filter((t) => t.done).length;
                                  const nextProg = nextTasks.length > 0 ? Math.round((doneCount / nextTasks.length) * 100) : r.progress;
                                  return {
                                    ...r,
                                    tasks: nextTasks,
                                    progress: nextProg,
                                    status: nextProg === 100 ? 'Cumple' : nextProg > 0 ? 'En proceso' : r.status,
                                  };
                                });
                              }}
                              style={{ marginTop: '2px', accentColor: '#16a34a' }}
                            />
                            <span
                              style={{
                                fontSize: '12.5px',
                                color: task.done ? '#15803d' : '#1e293b',
                                textDecoration: task.done ? 'line-through' : 'none',
                                fontWeight: task.done ? 600 : 500,
                              }}
                            >
                              {task.text}
                            </span>
                          </label>
                        ))}

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!newTaskText.trim()) return;
                            updateUgelRow(selectedUgelRow.id, (r) => {
                              const nextTasks = [...r.tasks, { id: 't-' + Date.now(), text: newTaskText.trim(), done: false }];
                              const doneCount = nextTasks.filter((t) => t.done).length;
                              const nextProg = Math.round((doneCount / nextTasks.length) * 100);
                              return {
                                ...r,
                                tasks: nextTasks,
                                progress: nextProg,
                              };
                            });
                            setNewTaskText('');
                          }}
                          style={{ display: 'flex', gap: '6px', marginTop: '6px' }}
                        >
                          <input
                            type="text"
                            placeholder="Añadir subtarea UGEL..."
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '12.5px',
                              outline: 'none',
                            }}
                          />
                          <button type="submit" className="btn primary" style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
                            <Plus size={14} />
                          </button>
                        </form>
                      </div>
                    )}

                    {ugelDrawerTab === 'docs' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                          Sustentos y entregables verificables (PECOSA, CDL, Actas):
                        </div>
                        {selectedUgelRow.docs.length === 0 ? (
                          <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '12.5px' }}>
                            Sin documentos cargados por esta UGEL.
                          </div>
                        ) : (
                          selectedUgelRow.docs.map((doc) => (
                            <div
                              key={doc.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                background: '#ffffff',
                              }}
                            >
                              <FileText size={18} color={doc.type === 'excel' ? '#16a34a' : '#2563eb'} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <b style={{ display: 'block', fontSize: '12.5px', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {doc.name}
                                </b>
                                <small style={{ fontSize: '11px', color: '#64748b' }}>{doc.updatedAt}</small>
                              </div>
                              <span
                                style={{
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  padding: '2px 7px',
                                  borderRadius: '999px',
                                  background: doc.verified ? '#dcfce7' : '#fef3c7',
                                  color: doc.verified ? '#15803d' : '#b45309',
                                }}
                              >
                                {doc.verified ? 'Verificado' : 'En revisión'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </aside>
              )}
            </div>
          ) : viewMode === 'Tarjetas' ? (
            <div className="sd-grid-container">
              {filteredSedes.map((s) => (
                <div key={s.id} className="sd-card">
                  <div className="sd-card-top">
                    <div>
                      <h3 className="sd-card-title">{s.name}</h3>
                      <span className="sd-card-sub">
                        <MapPin size={12} /> {s.zona} · {s.sedeFisica}
                      </span>
                    </div>
                    <span
                      className={`status-pill ${
                        s.status === 'Completado'
                          ? 'badge-complete'
                          : s.status === 'En plazo' || s.status === 'En curso'
                          ? 'badge-progress'
                          : 'badge-late'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="sd-card-body">
                    <div className="sd-row-metric">
                      <span>Avance físico consolidado</span>
                      <b>{s.progress}%</b>
                    </div>
                    <div className="sd-progress-track">
                      <div
                        className="sd-progress-fill"
                        style={{
                          width: `${s.progress}%`,
                          backgroundColor:
                            s.progress === 100 ? '#16a34a' : s.progress >= 40 ? '#2563eb' : '#d97706',
                        }}
                      />
                    </div>
                  </div>

                  <div className="sd-team-strip">
                    <div className="sd-team-line">
                      <span>Coord. Zonal:</span>
                      <b>{s.coordinadorZonal}</b>
                    </div>
                    <div className="sd-team-line">
                      <span>Gestor de Campo:</span>
                      <div className="sd-gestor-avatar-pill">
                        <span
                          className="sd-avatar-circle"
                          style={{ backgroundColor: GESTOR_COLORS[s.gestorCampo] || '#2563eb' }}
                        >
                          {getInitials(s.gestorCampo)}
                        </span>
                        <b>{s.gestorCampo}</b>
                      </div>
                    </div>
                    <div className="sd-team-line" style={{ marginTop: '2px', borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
                      <span>Presupuesto sede:</span>
                      <b style={{ color: '#0f172a' }}>{s.presupuesto}</b>
                    </div>
                  </div>

                  <div className="sd-card-actions">
                    <button
                      type="button"
                      className="sd-action-inspect"
                      onClick={() => setSelectedSede(s)}
                      title="Abrir ficha técnica y asignaciones"
                    >
                      <UserCheck size={14} />
                      <span>Ficha Técnica y Gestor</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="cronograma-lista-table-wrap"
              style={{
                overflowX: 'auto',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                margin: '0 0 16px',
              }}
            >
              <table className="cronograma-lista-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px 16px' }}>Sede / Frente Operativo</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px' }}>Zona / Ubicación</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px' }}>Coordinador Zonal</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px' }}>Gestor de Campo</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px' }}>Avance Físico</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px' }}>Presupuesto</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px' }}>Estado</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSedes.map((s) => (
                    <tr key={s.id}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building2 size={16} color="#2563eb" />
                          <span>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} color="#94a3b8" /> {s.zona} · {s.sedeFisica}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155', fontSize: '13px' }}>{s.coordinadorZonal}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="sd-gestor-avatar-pill">
                          <span
                            className="sd-avatar-circle"
                            style={{ backgroundColor: GESTOR_COLORS[s.gestorCampo] || '#2563eb' }}
                          >
                            {getInitials(s.gestorCampo)}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{s.gestorCampo}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', minWidth: '130px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                          <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${s.progress}%`,
                                height: '100%',
                                backgroundColor: s.progress === 100 ? '#16a34a' : s.progress >= 40 ? '#2563eb' : '#d97706',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{s.progress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                        {s.presupuesto}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span
                          className={`status-pill ${
                            s.status === 'Completado'
                              ? 'badge-complete'
                              : s.status === 'En plazo' || s.status === 'En curso'
                              ? 'badge-progress'
                              : 'badge-late'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ height: '30px', padding: '0 10px', fontSize: '12px' }}
                          onClick={() => setSelectedSede(s)}
                          title="Abrir ficha técnica y asignaciones"
                        >
                          Ficha
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pie de página canónico */}
          <footer className="footer">
            <span>
              Mostrando {filteredSedes.length} de {totalSedes} sedes registradas
            </span>
          </footer>
        </main>

        {/* Drawer Lateral de Ficha de Sede */}
        {selectedSede && (
          <aside className="sd-drawer">
            <div className="sd-drawer-head">
              <div>
                <h2 className="sd-drawer-title">{selectedSede.name}</h2>
                <small style={{ fontSize: '12px', color: '#64748b' }}>Ficha Operativa de Frente de Trabajo</small>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSede(null)}
                style={{
                  border: 'none',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="sd-drawer-body">
              <label className="sd-drawer-field">
                <span>Nombre de la Sede / Obra</span>
                <input
                  type="text"
                  value={selectedSede.name}
                  onChange={(e) => updateSelectedSede({ name: e.target.value })}
                />
              </label>

              <label className="sd-drawer-field">
                <span>Zona / Distrito / Macro-región</span>
                <input
                  type="text"
                  value={selectedSede.zona}
                  onChange={(e) => updateSelectedSede({ zona: e.target.value })}
                />
              </label>

              <label className="sd-drawer-field">
                <span>Coordinador Zonal a Cargo</span>
                <select
                  value={selectedSede.coordinadorZonal}
                  onChange={(e) => updateSelectedSede({ coordinadorZonal: e.target.value })}
                >
                  <option>Carlos Mendoza</option>
                  <option>Lucía Ramos</option>
                  <option>Dirección General</option>
                </select>
              </label>

              <label className="sd-drawer-field">
                <span>Gestor de Campo Asignado</span>
                <select
                  value={selectedSede.gestorCampo}
                  onChange={(e) => updateSelectedSede({ gestorCampo: e.target.value })}
                >
                  <option>María Salazar</option>
                  <option>Carlos Mendoza</option>
                  <option>Lucía Ramos</option>
                  <option>Javier Ruiz</option>
                  <option>Sin Asignar</option>
                </select>
              </label>

              <label className="sd-drawer-field">
                <span>Presupuesto Asignado</span>
                <input
                  type="text"
                  value={selectedSede.presupuesto}
                  onChange={(e) => updateSelectedSede({ presupuesto: e.target.value })}
                />
              </label>

              <div className="sd-drawer-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Avance Físico</span>
                  <b>{selectedSede.progress}%</b>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={selectedSede.progress}
                  onChange={(e) => updateSelectedSede({ progress: +e.target.value })}
                  style={{ width: '100%', accentColor: '#2563eb' }}
                />
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>Tareas de Supervisión</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  {selectedSede.tasksDone} de {selectedSede.tasksTotal} tareas cumplidas en campo para esta sede.
                </p>
              </div>
            </div>

            <div className="sd-drawer-footer">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setSelectedSede(null)}
                style={{ height: '36px', padding: '0 16px' }}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={() => setSelectedSede(null)}
                style={{ height: '36px', padding: '0 16px' }}
              >
                Guardar Cambios
              </button>
            </div>
          </aside>
        )}

        {/* Modal para Crear Nueva Sede Operativa */}
        {isModalCreateOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(3px)',
              display: 'grid',
              placeItems: 'center',
              padding: '16px',
            }}
            onClick={() => setIsModalCreateOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(500px, 100%)',
                background: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      Alta de Sede Operativa
                    </h3>
                    <small style={{ fontSize: '12px', color: '#64748b' }}>Asignación de frente territorial</small>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalCreateOpen(false)}
                  style={{
                    border: 'none',
                    background: '#f1f5f9',
                    borderRadius: '6px',
                    width: '30px',
                    height: '30px',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    color: '#64748b',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateSede} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
                  Nombre de la Sede / Edificio / Frente *
                  <input
                    required
                    autoFocus
                    placeholder="Ej. Sede Central Arequipa / Edificio Miraflores"
                    value={newSedeName}
                    onChange={(e) => setNewSedeName(e.target.value)}
                    style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
                  Zona / Distrito / Macro-región
                  <input
                    value={newSedeZona}
                    onChange={(e) => setNewSedeZona(e.target.value)}
                    placeholder="Ej. Lima Norte, Selva Central, Arequipa Sur..."
                    style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
                    Coordinador Zonal
                    <select
                      value={newSedeCoord}
                      onChange={(e) => setNewSedeCoord(e.target.value)}
                      style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff' }}
                    >
                      <option>Carlos Mendoza</option>
                      <option>Lucía Ramos</option>
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
                    Gestor de Campo
                    <select
                      value={newSedeGestor}
                      onChange={(e) => setNewSedeGestor(e.target.value)}
                      style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff' }}
                    >
                      <option>María Salazar</option>
                      <option>Carlos Mendoza</option>
                      <option>Lucía Ramos</option>
                      <option>Javier Ruiz</option>
                    </select>
                  </label>
                </div>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
                  Presupuesto Asignado a la Sede
                  <input
                    value={newSedePresupuesto}
                    onChange={(e) => setNewSedePresupuesto(e.target.value)}
                    placeholder="Ej. S/ 85,000 ó $ 25,000"
                    style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                  />
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => setIsModalCreateOpen(false)}
                    style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn primary"
                    style={{ height: '36px', padding: '0 18px', fontSize: '13px' }}
                  >
                    <Check size={16} />
                    <span>Crear Sede</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
