// Tipos y contratos de datos para el Módulo Equipo (Qaway Gestor de Proyectos)
// Regla: Neutralidad institucional estricta. Cero referencias fijas a organismos públicos o sedes geográficas concretas.

export type EstadoOperativo = 'En funciones' | 'Licencia / Permiso' | 'Desvinculado';

export type EstadoCuenta = 'Invitación Pendiente' | 'Habilitada' | 'Suspendida';

export type RolSeguridad = 'Administrador' | 'Gestor' | 'Colaborador' | 'Consulta';

export interface SedeFrente {
  id: string;
  codigo: string;
  nombre: string;
  ambito: string;
  direccion?: string;
  responsableId?: string;
  responsableNombre?: string;
  dotacionRequerida: number;
}

export interface UnidadOrganizacional {
  id: string;
  codigo: string;
  nombre: string;
  nivel: number;
  reportaAId?: string;
  reportaANombre?: string;
  responsableId?: string;
  responsableNombre?: string;
}

export interface NotaInterna {
  id: string;
  integranteId: string;
  autorNombre: string;
  fechaHora: string;
  contenido: string;
}

export interface HistorialEvento {
  id: string;
  integranteId: string;
  fechaHora: string;
  tipoEvento:
    | 'creacion'
    | 'cambio_estado_operativo'
    | 'cambio_estado_cuenta'
    | 'reasignacion_sede'
    | 'cambio_cargo'
    | 'asignacion_tarea'
    | 'cambio_rol_seguridad'
    | 'edicion_datos';
  descripcion: string;
  autorNombre: string;
  valorAnterior?: string;
  valorNuevo?: string;
}

export interface AsignacionViva {
  id: string;
  integranteId: string;
  proyectoId: string;
  titulo: string;
  tipo: 'Hito' | 'Tarea' | 'Entregable' | 'Proceso';
  fechaInicio: string;
  fechaFin: string;
  esfuerzoHoras: number;
  progresoPorcentaje: number;
  estado: 'Completado' | 'En curso' | 'Pendiente' | 'Atrasado';
}

export interface Integrante {
  id: string;
  codigo: string;
  nombre: string;
  apellidos: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
  documentoIdentidad: string;
  avatarUrl?: string;
  iniciales: string;

  // Estados estrictamente desacoplados
  estadoOperativo: EstadoOperativo;
  estadoCuenta: EstadoCuenta;

  // Seguridad y permisos
  rolSeguridad: RolSeguridad;

  // Cargo y estructura jerárquica
  cargo: string;
  areaId: string;
  areaNombre: string;
  reportaAId?: string;
  reportaANombre?: string;

  // Sede territorial
  sedeId: string;
  sedeNombre: string;

  // Carga de trabajo y capacidad
  capacidadNominalHorasSemana: number;

  // Trazabilidad y fechas
  fechaIngreso: string;
  ultimoAcceso?: string;

  // Notas e historial
  notas?: NotaInterna[];
  historial?: HistorialEvento[];
}

export interface PresetVista {
  id: string;
  nombre: string;
  esPredefinido?: boolean;
  columnasVisibles: string[];
  ordenColumna?: string;
  ordenDireccion?: 'asc' | 'desc';
  filtros: {
    busqueda?: string;
    estadoOperativo?: string;
    estadoCuenta?: string;
    sedeId?: string;
    areaId?: string;
    rolSeguridad?: string;
  };
}
