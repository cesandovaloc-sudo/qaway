import type {
  Integrante,
  SedeFrente,
  UnidadOrganizacional,
  AsignacionViva,
  PresetVista,
  HistorialEvento,
} from './types';

export const INITIAL_SEDES: SedeFrente[] = [
  {
    id: 'sede-01',
    codigo: 'SED-CTR-01',
    nombre: 'Sede Central de Coordinación',
    ambito: 'Zona Metropolitana',
    direccion: 'Av. Las Palmas 450, Centro Corporativo',
    responsableId: 'int-001',
    responsableNombre: 'María Jara',
    dotacionRequerida: 4,
  },
  {
    id: 'sede-02',
    codigo: 'SED-NTE-02',
    nombre: 'Frente Territorial Norte',
    ambito: 'Sector Valle Norte',
    direccion: 'Jr. Comercio 120, Distrito Norte',
    responsableId: 'int-002',
    responsableNombre: 'Carlos Sandoval',
    dotacionRequerida: 4,
  },
  {
    id: 'sede-03',
    codigo: 'SED-EST-03',
    nombre: 'Frente Operativo Este',
    ambito: 'Sector Cordillera Este',
    direccion: 'Calle Real 890, Distrito Este',
    responsableId: 'int-004',
    responsableNombre: 'Juan Pérez',
    dotacionRequerida: 3,
  },
  {
    id: 'sede-04',
    codigo: 'SED-SUR-04',
    nombre: 'Frente Territorial Sur',
    ambito: 'Sector Valle Sur',
    direccion: 'Av. Principal 340, Distrito Sur',
    responsableId: 'int-005',
    responsableNombre: 'Ana Torres',
    dotacionRequerida: 3,
  },
  {
    id: 'sede-05',
    codigo: 'SED-LOG-05',
    nombre: 'Base Logística Central',
    ambito: 'Zona Industrial Centro',
    direccion: 'Carretera Central Km 14.5',
    responsableId: 'int-009',
    responsableNombre: 'Elena Rojas',
    dotacionRequerida: 2,
  },
];

export const INITIAL_AREAS: UnidadOrganizacional[] = [
  {
    id: 'area-01',
    codigo: 'DIR-OPS',
    nombre: 'Dirección de Operaciones',
    nivel: 1,
    responsableId: 'int-001',
    responsableNombre: 'María Jara',
  },
  {
    id: 'area-02',
    codigo: 'CRD-TER',
    nombre: 'Coordinación Territorial',
    nivel: 2,
    reportaAId: 'area-01',
    reportaANombre: 'Dirección de Operaciones',
    responsableId: 'int-002',
    responsableNombre: 'Carlos Sandoval',
  },
  {
    id: 'area-03',
    codigo: 'GES-SIS',
    nombre: 'Gestión de Sistemas y Procesos',
    nivel: 2,
    reportaAId: 'area-01',
    reportaANombre: 'Dirección de Operaciones',
    responsableId: 'int-003',
    responsableNombre: 'Lucía Flores',
  },
  {
    id: 'area-04',
    codigo: 'LOG-ALM',
    nombre: 'Logística y Almacenes de Campo',
    nivel: 3,
    reportaAId: 'area-02',
    reportaANombre: 'Coordinación Territorial',
    responsableId: 'int-009',
    responsableNombre: 'Elena Rojas',
  },
  {
    id: 'area-05',
    codigo: 'SUP-CAM',
    nombre: 'Supervisión y Seguimiento de Campo',
    nivel: 3,
    reportaAId: 'area-02',
    reportaANombre: 'Coordinación Territorial',
    responsableId: 'int-006',
    responsableNombre: 'Luis Ramírez',
  },
];

export const INITIAL_ASIGNACIONES: AsignacionViva[] = [
  {
    id: 'asg-01',
    integranteId: 'int-001',
    proyectoId: 'p1',
    titulo: 'Validación del Plan Maestro de Operaciones',
    tipo: 'Hito',
    fechaInicio: '2026-10-01',
    fechaFin: '2026-10-30',
    esfuerzoHoras: 24,
    progresoPorcentaje: 100,
    estado: 'Completado',
  },
  {
    id: 'asg-02',
    integranteId: 'int-001',
    proyectoId: 'p1',
    titulo: 'Presentación de Resultados ante Comité Directivo',
    tipo: 'Hito',
    fechaInicio: '2026-11-10',
    fechaFin: '2026-11-25',
    esfuerzoHoras: 16,
    progresoPorcentaje: 40,
    estado: 'En curso',
  },
  {
    id: 'asg-03',
    integranteId: 'int-002',
    proyectoId: 'p1',
    titulo: 'Coordinación de Comités Locales en Frente Norte',
    tipo: 'Proceso',
    fechaInicio: '2026-10-15',
    fechaFin: '2026-11-15',
    esfuerzoHoras: 35,
    progresoPorcentaje: 75,
    estado: 'En curso',
  },
  {
    id: 'asg-04',
    integranteId: 'int-002',
    proyectoId: 'p1',
    titulo: 'Auditoría de Cumplimiento Territorial Frente Este',
    tipo: 'Tarea',
    fechaInicio: '2026-11-01',
    fechaFin: '2026-11-12',
    esfuerzoHoras: 20,
    progresoPorcentaje: 20,
    estado: 'Atrasado',
  },
  {
    id: 'asg-05',
    integranteId: 'int-003',
    proyectoId: 'p1',
    titulo: 'Carga y verificación de matrices de datos del sistema',
    tipo: 'Entregable',
    fechaInicio: '2026-10-20',
    fechaFin: '2026-11-20',
    esfuerzoHoras: 30,
    progresoPorcentaje: 60,
    estado: 'En curso',
  },
  {
    id: 'asg-06',
    integranteId: 'int-004',
    proyectoId: 'p1',
    titulo: 'Recepción y cotejo de insumos en Frente Este',
    tipo: 'Tarea',
    fechaInicio: '2026-11-05',
    fechaFin: '2026-11-18',
    esfuerzoHoras: 18,
    progresoPorcentaje: 30,
    estado: 'En curso',
  },
  {
    id: 'asg-07',
    integranteId: 'int-005',
    proyectoId: 'p1',
    titulo: 'Verificación de padrón en Frente Sur',
    tipo: 'Tarea',
    fechaInicio: '2026-11-02',
    fechaFin: '2026-11-15',
    esfuerzoHoras: 22,
    progresoPorcentaje: 85,
    estado: 'En curso',
  },
  {
    id: 'asg-08',
    integranteId: 'int-007',
    proyectoId: 'p1',
    titulo: 'Capacitación a supervisores de campo locales',
    tipo: 'Tarea',
    fechaInicio: '2026-11-12',
    fechaFin: '2026-11-28',
    esfuerzoHoras: 25,
    progresoPorcentaje: 10,
    estado: 'Pendiente',
  },
  {
    id: 'asg-09',
    integranteId: 'int-009',
    proyectoId: 'p1',
    titulo: 'Despacho de cargamento matriz desde Base Logística',
    tipo: 'Hito',
    fechaInicio: '2026-10-25',
    fechaFin: '2026-11-10',
    esfuerzoHoras: 32,
    progresoPorcentaje: 90,
    estado: 'En curso',
  },
  {
    id: 'asg-10',
    integranteId: 'int-010',
    proyectoId: 'p1',
    titulo: 'Consolidación de informes de avance operativo semanal',
    tipo: 'Entregable',
    fechaInicio: '2026-11-01',
    fechaFin: '2026-11-30',
    esfuerzoHoras: 28,
    progresoPorcentaje: 45,
    estado: 'En curso',
  },
];

export const INITIAL_INTEGRANTES: Integrante[] = [
  {
    id: 'int-001',
    codigo: 'INT-001',
    nombre: 'María',
    apellidos: 'Jara Quispe',
    nombreCompleto: 'María Jara Quispe',
    email: 'm.jara@proyecto-operativo.org',
    telefono: '+51 987 654 321',
    documentoIdentidad: '45892104',
    iniciales: 'MJ',
    avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&h=120&fit=crop&crop=faces',
    estadoOperativo: 'En funciones',
    estadoCuenta: 'Habilitada',
    rolSeguridad: 'Administrador',
    cargo: 'Directora General de Operaciones',
    areaId: 'area-01',
    areaNombre: 'Dirección de Operaciones',
    sedeId: 'sede-01',
    sedeNombre: 'Sede Central de Coordinación',
    capacidadNominalHorasSemana: 40,
    fechaIngreso: '2026-08-01',
    ultimoAcceso: '03 nov. 2026 · 14:20',
    notas: [
      {
        id: 'not-01',
        integranteId: 'int-001',
        autorNombre: 'Carlos Sandoval',
        fechaHora: '28 oct. 2026 · 11:30',
        contenido: 'Aprobó el cronograma de despliegue territorial para los frentes Norte y Este.',
      },
    ],
    historial: [
      {
        id: 'his-01',
        integranteId: 'int-001',
        fechaHora: '01 ago. 2026 · 09:00',
        tipoEvento: 'creacion',
        descripcion: 'Alta inicial del integrante en el proyecto.',
        autorNombre: 'Sistema',
      },
    ],
  },
  {
    id: 'int-002',
    codigo: 'INT-002',
    nombre: 'Carlos',
    apellidos: 'Mendoza Ríos',
    nombreCompleto: 'Carlos Sandoval',
    email: 'c.mendoza@proyecto-operativo.org',
    telefono: '+51 964 234 567',
    documentoIdentidad: '41209873',
    iniciales: 'CM',
    estadoOperativo: 'En funciones',
    estadoCuenta: 'Habilitada',
    rolSeguridad: 'Gestor',
    cargo: 'Coordinador General Territorial',
    areaId: 'area-02',
    areaNombre: 'Coordinación Territorial',
    reportaAId: 'int-001',
    reportaANombre: 'María Jara Quispe',
    sedeId: 'sede-02',
    sedeNombre: 'Frente Territorial Norte',
    capacidadNominalHorasSemana: 40,
    fechaIngreso: '2026-08-15',
    ultimoAcceso: '03 nov. 2026 · 17:05',
    notas: [],
    historial: [
      {
        id: 'his-02',
        integranteId: 'int-002',
        fechaHora: '15 ago. 2026 · 09:30',
        tipoEvento: 'creacion',
        descripcion: 'Asignado como Coordinador General del Frente Norte.',
        autorNombre: 'María Jara Quispe',
      },
    ],
  },
  {
    id: 'int-003',
    codigo: 'INT-003',
    nombre: 'Lucía',
    apellidos: 'Flores Valdivia',
    nombreCompleto: 'Lucía Flores Valdivia',
    email: 'l.flores@proyecto-operativo.org',
    telefono: '+51 955 123 456',
    documentoIdentidad: '47653201',
    iniciales: 'LF',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces',
    estadoOperativo: 'En funciones',
    estadoCuenta: 'Habilitada',
    rolSeguridad: 'Gestor',
    cargo: 'Especialista Principal de Sistemas',
    areaId: 'area-03',
    areaNombre: 'Gestión de Sistemas y Procesos',
    reportaAId: 'int-001',
    reportaANombre: 'María Jara Quispe',
    sedeId: 'sede-01',
    sedeNombre: 'Sede Central de Coordinación',
    capacidadNominalHorasSemana: 40,
    fechaIngreso: '2026-09-01',
    ultimoAcceso: '03 nov. 2026 · 12:45',
    notas: [],
    historial: [],
  },
  {
    id: 'int-004',
    codigo: 'INT-004',
    nombre: 'Juan',
    apellidos: 'Pérez Gálvez',
    nombreCompleto: 'Juan Pérez Gálvez',
    email: 'j.perez@frente-este.org',
    telefono: '+51 945 123 890',
    documentoIdentidad: '40982314',
    iniciales: 'JP',
    estadoOperativo: 'En funciones',
    estadoCuenta: 'Invitación Pendiente',
    rolSeguridad: 'Colaborador',
    cargo: 'Responsable Operativo de Frente',
    areaId: 'area-02',
    areaNombre: 'Coordinación Territorial',
    reportaAId: 'int-002',
    reportaANombre: 'Carlos Sandoval',
    sedeId: 'sede-03',
    sedeNombre: 'Frente Operativo Este',
    capacidadNominalHorasSemana: 40,
    fechaIngreso: '2026-10-01',
    ultimoAcceso: '—',
    notas: [
      {
        id: 'not-02',
        integranteId: 'int-004',
        autorNombre: 'Carlos Sandoval',
        fechaHora: '02 nov. 2026 · 16:00',
        contenido: 'Se reenvió invitación de acceso a su correo institucional.',
      },
    ],
    historial: [
      {
        id: 'his-03',
        integranteId: 'int-004',
        fechaHora: '01 oct. 2026 · 10:00',
        tipoEvento: 'cambio_estado_cuenta',
        descripcion: 'Invitación emitida para activación de cuenta.',
        autorNombre: 'Carlos Sandoval',
      },
    ],
  },
  {
    id: 'int-005',
    codigo: 'INT-005',
    nombre: 'Ana',
    apellidos: 'Torres Morales',
    nombreCompleto: 'Ana Torres Morales',
    email: 'a.torres@frente-sur.org',
    telefono: '+51 966 789 012',
    documentoIdentidad: '46231908',
    iniciales: 'AT',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces',
    estadoOperativo: 'En funciones',
    estadoCuenta: 'Habilitada',
    rolSeguridad: 'Colaborador',
    cargo: 'Especialista Territorial de Supervisión',
    areaId: 'area-02',
    areaNombre: 'Coordinación Territorial',
    reportaAId: 'int-002',
    reportaANombre: 'Carlos Sandoval',
    sedeId: 'sede-04',
    sedeNombre: 'Frente Territorial Sur',
    capacidadNominalHorasSemana: 40,
    fechaIngreso: '2026-09-10',
    ultimoAcceso: '02 nov. 2026 · 18:30',
    notas: [],
    historial: [],
  },
  {
    id: 'int-006',
    codigo: 'INT-006',
    nombre: 'Luis',
    apellidos: 'Ramírez Candia',
    nombreCompleto: 'Luis Ramírez Candia',
    email: 'l.ramirez@proyecto-operativo.org',
    telefono: '+51 981 456 123',
    documentoIdentidad: '43981276',
    iniciales: 'LR',
    estadoOperativo: 'Licencia / Permiso',
    estadoCuenta: 'Suspendida',
    rolSeguridad: 'Consulta',
    cargo: 'Analista de Supervisión de Campo',
    areaId: 'area-05',
    areaNombre: 'Supervisión y Seguimiento de Campo',
    reportaAId: 'int-002',
    reportaANombre: 'Carlos Sandoval',
    sedeId: 'sede-01',
    sedeNombre: 'Sede Central de Coordinación',
    capacidadNominalHorasSemana: 40,
    fechaIngreso: '2026-08-15',
    ultimoAcceso: '20 oct. 2026 · 10:15',
    notas: [],
    historial: [
      {
        id: 'his-04',
        integranteId: 'int-006',
        fechaHora: '25 oct. 2026 · 08:30',
        tipoEvento: 'cambio_estado_operativo',
        descripcion: 'Registro de permiso temporal por motivos de salud.',
        autorNombre: 'María Jara Quispe',
        valorAnterior: 'En funciones',
        valorNuevo: 'Licencia / Permiso',
      },
    ],
  },
  {
    id: 'int-007',
    codigo: 'INT-007',
    nombre: 'Sofía',
    apellidos: 'Huamán Castro',
    nombreCompleto: 'Sofía Huamán Castro',
    email: 's.huaman@frente-este.org',
    telefono: '+51 974 567 890',
    documentoIdentidad: '48123904',
    iniciales: 'SH',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
    estadoOperativo: 'En funciones',
    estadoCuenta: 'Habilitada',
    rolSeguridad: 'Colaborador',
    cargo: 'Coordinadora de Capacitación Territorial',
    areaId: 'area-02',
    areaNombre: 'Coordinación Territorial',
    reportaAId: 'int-002',
    reportaANombre: 'Carlos Sandoval',
    sedeId: 'sede-03',
    sedeNombre: 'Frente Operativo Este',
    capacidadNominalHorasSemana: 40,
    fechaIngreso: '2026-09-15',
    ultimoAcceso: '03 nov. 2026 · 11:20',
    notas: [],
    historial: [],
  },
  {
    id: 'int-008',
    codigo: 'INT-008',
    nombre: 'Diego',
    apellidos: 'Castro Poma',
    nombreCompleto: 'Diego Castro Poma',
    email: 'd.castro@proyecto-operativo.org',
    telefono: '+51 989 234 567',
    documentoIdentidad: '45091283',
    iniciales: 'DC',
    estadoOperativo: 'En funciones',
    estadoCuenta: 'Invitación Pendiente',
    rolSeguridad: 'Colaborador',
    cargo: 'Analista de Datos Operativos',
    areaId: 'area-03',
    areaNombre: 'Gestión de Sistemas y Procesos',
    reportaAId: 'int-003',
    reportaANombre: 'Lucía Flores Valdivia',
    sedeId: 'sede-01',
    sedeNombre: 'Sede Central de Coordinación',
    capacidadNominalHorasSemana: 40,
    fechaIngreso: '2026-10-20',
    ultimoAcceso: '—',
    notas: [],
    historial: [],
  },
  {
    id: 'int-009',
    codigo: 'INT-009',
    nombre: 'Elena',
    apellidos: 'Rojas Medina',
    nombreCompleto: 'Elena Rojas Medina',
    email: 'e.rojas@base-logistica.org',
    telefono: '+51 982 654 789',
    documentoIdentidad: '44129845',
    iniciales: 'ER',
    estadoOperativo: 'En funciones',
    estadoCuenta: 'Habilitada',
    rolSeguridad: 'Gestor',
    cargo: 'Jefa de Base Logística y Almacén',
    areaId: 'area-04',
    areaNombre: 'Logística y Almacenes de Campo',
    reportaAId: 'int-002',
    reportaANombre: 'Carlos Sandoval',
    sedeId: 'sede-05',
    sedeNombre: 'Base Logística Central',
    capacidadNominalHorasSemana: 40,
    fechaIngreso: '2026-08-20',
    ultimoAcceso: '03 nov. 2026 · 16:10',
    notas: [],
    historial: [],
  },
  {
    id: 'int-010',
    codigo: 'INT-010',
    nombre: 'Miguel',
    apellidos: 'Salazar Bravo',
    nombreCompleto: 'Miguel Salazar Bravo',
    email: 'm.salazar@proyecto-operativo.org',
    telefono: '+51 976 543 210',
    documentoIdentidad: '42890123',
    iniciales: 'MS',
    estadoOperativo: 'En funciones',
    estadoCuenta: 'Habilitada',
    rolSeguridad: 'Gestor',
    cargo: 'Especialista de Monitoreo de Procesos',
    areaId: 'area-05',
    areaNombre: 'Supervisión y Seguimiento de Campo',
    reportaAId: 'int-002',
    reportaANombre: 'Carlos Sandoval',
    sedeId: 'sede-02',
    sedeNombre: 'Frente Territorial Norte',
    capacidadNominalHorasSemana: 40,
    fechaIngreso: '2026-09-01',
    ultimoAcceso: '03 nov. 2026 · 09:40',
    notas: [],
    historial: [],
  },
  {
    id: 'int-011',
    codigo: 'INT-011',
    nombre: 'Patricia',
    apellidos: 'León Sánchez',
    nombreCompleto: 'Patricia León Sánchez',
    email: 'p.leon@frente-norte.org',
    telefono: '+51 963 456 789',
    documentoIdentidad: '46901234',
    iniciales: 'PL',
    estadoOperativo: 'Desvinculado',
    estadoCuenta: 'Suspendida',
    rolSeguridad: 'Consulta',
    cargo: 'Ex-Asistente de Enlace Territorial',
    areaId: 'area-02',
    areaNombre: 'Coordinación Territorial',
    reportaAId: 'int-002',
    reportaANombre: 'Carlos Sandoval',
    sedeId: 'sede-02',
    sedeNombre: 'Frente Territorial Norte',
    capacidadNominalHorasSemana: 0,
    fechaIngreso: '2026-08-10',
    ultimoAcceso: '10 oct. 2026 · 11:00',
    notas: [],
    historial: [
      {
        id: 'his-05',
        integranteId: 'int-011',
        fechaHora: '15 oct. 2026 · 17:00',
        tipoEvento: 'cambio_estado_operativo',
        descripcion: 'Cierre de asignación por finalización de ciclo operativo.',
        autorNombre: 'María Jara Quispe',
        valorAnterior: 'En funciones',
        valorNuevo: 'Desvinculado',
      },
    ],
  },
  {
    id: 'int-012',
    codigo: 'INT-012',
    nombre: 'Roberto',
    apellidos: 'Vega Arce',
    nombreCompleto: 'Roberto Vega Arce',
    email: 'r.vega@frente-sur.org',
    telefono: '+51 956 234 567',
    documentoIdentidad: '41782390',
    iniciales: 'RV',
    estadoOperativo: 'En funciones',
    estadoCuenta: 'Habilitada',
    rolSeguridad: 'Colaborador',
    cargo: 'Supervisor de Ruta y Distribución',
    areaId: 'area-04',
    areaNombre: 'Logística y Almacenes de Campo',
    reportaAId: 'int-009',
    reportaANombre: 'Elena Rojas Medina',
    sedeId: 'sede-04',
    sedeNombre: 'Frente Territorial Sur',
    capacidadNominalHorasSemana: 40,
    fechaIngreso: '2026-09-05',
    ultimoAcceso: '03 nov. 2026 · 15:30',
    notas: [],
    historial: [],
  },
];

export const INITIAL_PRESETS: PresetVista[] = [
  {
    id: 'preset-todos',
    nombre: 'Todos los integrantes',
    esPredefinido: true,
    columnasVisibles: ['integrante', 'cargo', 'sede', 'estadoOperativo', 'estadoCuenta', 'carga'],
    ordenColumna: 'nombreCompleto',
    ordenDireccion: 'asc',
    filtros: {},
  },
  {
    id: 'preset-activos',
    nombre: 'En funciones con acceso activo',
    esPredefinido: true,
    columnasVisibles: ['integrante', 'cargo', 'sede', 'estadoOperativo', 'estadoCuenta', 'carga'],
    ordenColumna: 'nombreCompleto',
    ordenDireccion: 'asc',
    filtros: {
      estadoOperativo: 'En funciones',
      estadoCuenta: 'Habilitada',
    },
  },
  {
    id: 'preset-pendientes',
    nombre: 'Cuentas por activar',
    esPredefinido: true,
    columnasVisibles: ['integrante', 'cargo', 'sede', 'estadoCuenta', 'email', 'telefono'],
    ordenColumna: 'nombreCompleto',
    ordenDireccion: 'asc',
    filtros: {
      estadoCuenta: 'Invitación Pendiente',
    },
  },
  {
    id: 'preset-frentes',
    nombre: 'Equipo territorial por sede',
    esPredefinido: true,
    columnasVisibles: ['sede', 'integrante', 'cargo', 'estadoOperativo', 'carga'],
    ordenColumna: 'sedeNombre',
    ordenDireccion: 'asc',
    filtros: {
      estadoOperativo: 'En funciones',
    },
  },
];

// Servicios locales de persistencia con LocalStorage
const STORAGE_KEYS = {
  INTEGRANTES: 'qaway_equipo_integrantes_v1',
  SEDES: 'qaway_equipo_sedes_v1',
  AREAS: 'qaway_equipo_areas_v1',
  ASIGNACIONES: 'qaway_equipo_asignaciones_v1',
  PRESETS: 'qaway_equipo_presets_v1',
  ACTIVE_PRESET: 'qaway_equipo_active_preset_id_v1',
};

export const getStoredIntegrantes = (): Integrante[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTEGRANTES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_INTEGRANTES;
};

export const saveStoredIntegrantes = (data: Integrante[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.INTEGRANTES, JSON.stringify(data));
  } catch {}
};

export const getStoredSedes = (): SedeFrente[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SEDES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_SEDES;
};

export const saveStoredSedes = (data: SedeFrente[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SEDES, JSON.stringify(data));
  } catch {}
};

export const getStoredAreas = (): UnidadOrganizacional[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AREAS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_AREAS;
};

export const getStoredAsignaciones = (): AsignacionViva[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ASIGNACIONES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_ASIGNACIONES;
};

export const saveStoredAsignaciones = (data: AsignacionViva[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ASIGNACIONES, JSON.stringify(data));
  } catch {}
};

export const getStoredPresets = (): PresetVista[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESETS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_PRESETS;
};

export const saveStoredPresets = (data: PresetVista[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(data));
  } catch {}
};
