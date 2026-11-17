/**
 * gpCicloVidaService.ts — Etapa 6.3
 * =================================
 * Servicios de CLASIFICACIÓN (tipo de proyecto) y CICLO DE VIDA (estado general)
 * del proyecto, según la arquitectura aprobada en `doc2/6.2` y las decisiones
 * funcionales de la Etapa 6.3.
 *
 * Reutiliza (sin duplicar):
 *   · Cliente Supabase COMPARTIDO con Qaway Hub (supabaseClient.ts, Etapa 4).
 *   · Contexto de identidad del Hub (contextoSesion.ts): plataforma + rol de app
 *     (`user_app_role('gestor-proyectos')`) + derecho de uso. NUNCA el placeholder
 *     `readStoredRole()` como fuente de autorización.
 *   · Catálogos vivos vía gpCatalogosService (Etapa 6) para etiquetas de estado/tipo.
 *
 * Seguridad (fail-closed):
 *   · La BARRERA REAL es la RPC `gp_cambiar_estado_proyecto` (SQL 0010, SECURITY
 *     DEFINER): valida transición, permisos (Hub + `gp_roles_proyecto_c.permisos`
 *     jsonb), motivo obligatorio y escribe UPDATE+auditoría en UNA transacción.
 *   · Este servicio valida en el núcleo lo MISMO que la RPC (transiciones válidas,
 *     capacidades por rol, motivo) — la UI nunca es la seguridad, solo su reflejo.
 *   · Sin sesión, sin cliente o con infraestructura pendiente ⇒ la operación NO se
 *     ejecuta y se devuelve un resultado estructurado y honesto (nada se falsea).
 *   · NO hay ruta de dos escrituras separadas (UPDATE + auditoría): el único
 *     camino de cambio es la RPC atómica ⇒ imposibilidad estructural de cambios
 *     parciales.
 *
 * Mapeo de roles (códigos YA PLANIFICADOS en el seed de `gp_roles_proyecto_c`,
 * tracker `5.2` fila 5 — no se inventan roles):
 *   administrador → gerente (todas las acciones de dirección + editar tipo)
 *   gestor        → jefe/responsable (iniciar, pausar, reanudar, completar)
 *   coordinador / supervisor / colaborador / lector → consulta
 *   (+ alias tolerantes: gerente/responsable/jefe/participante/observador)
 */

import { supabase } from './supabaseClient';
import { resolverContextoSesion, ErrorSesion, type ContextoSesion } from './contextoSesion';
import type { ValorCatalogo } from './gpCatalogosService';

// ---------------------------------------------------------------------------
// Tipos del dominio
// ---------------------------------------------------------------------------

/** Códigos canónicos del catálogo gp_estados_proyecto_c (0001, NO se modifica). */
export type EstadoProyecto = 'planificacion' | 'en_curso' | 'pausado' | 'completado' | 'cancelado';

/** Acciones de DIREcción (ciclo de vida) — distintas de la configuración (6.2 §3). */
export type AccionCicloVida = 'iniciar' | 'pausar' | 'reanudar' | 'completar' | 'cancelar' | 'reabrir';

/** Rol funcional del proyecto (derivado de gp_roles_proyecto_c, sin inventar). */
export type RolProyectoFuncional = 'gerente' | 'jefe' | 'coordinador' | 'colaborador' | 'lector' | 'sin_rol';

/**
 * Transiciones válidas APROBADAS (Etapa 6.3 §2.B):
 * planificación→en_curso · en_curso→pausado · pausado→en_curso ·
 * en_curso→completado · pausado→completado · planificación/en_curso/pausado→cancelado ·
 * reabrir: completado→en_curso · cancelado→planificacion.
 * El estado `sin clasificar` (NULL, B-8) NO transiciona: requiere clasificación
 * en el cutover/migración (nada se coercion a 'planificacion').
 */
export const TRANSICIONES_VALIDAS: Record<EstadoProyecto, Partial<Record<AccionCicloVida, EstadoProyecto>>> = {
  planificacion: { iniciar: 'en_curso', cancelar: 'cancelado' },
  en_curso: { pausar: 'pausado', completar: 'completado', cancelar: 'cancelado' },
  pausado: { reanudar: 'en_curso', completar: 'completado', cancelar: 'cancelado' },
  completado: { reabrir: 'en_curso' },
  cancelado: { reabrir: 'planificacion' },
};

/** Acciones que EXIGEN motivo (aprobado 6.3): completar, cancelar y reabrir. */
export const ACCIONES_MOTIVO_OBLIGATORIO: readonly AccionCicloVida[] = ['completar', 'cancelar', 'reabrir'];

/** Alias de códigos de rol → rol funcional (el seed canónico es la 1ª columna).
 *  Se aceptan tanto los códigos internacionales nuevos (gp_roles_proyecto_v2_c)
 *  como los legacy (gp_roles_proyecto_c, marcada deuda) y alias en español. */
export const ALIAS_ROL_PROYECTO: Record<string, RolProyectoFuncional> = {
  // Códigos internacionales (gp_roles_proyecto_v2_c)
  owner: 'gerente',
  manager: 'jefe',
  member: 'colaborador',
  viewer: 'lector',
  // Códigos legacy (gp_roles_proyecto_c — deuda, se retiran)
  administrador: 'gerente',
  gestor: 'jefe',
  coordinador: 'coordinador',
  supervisor: 'coordinador',
  colaborador: 'colaborador',
  lector: 'lector',
  // Alias en español / tolerantes
  propietario: 'gerente',
  gerente: 'gerente',
  responsable: 'jefe',
  jefe: 'jefe',
  participante: 'colaborador',
  observador: 'lector',
};

/** Etiqueta visible de cada acción (UI). */
export const ETIQUETA_ACCION: Record<AccionCicloVida, string> = {
  iniciar: 'Iniciar proyecto',
  pausar: 'Pausar proyecto',
  reanudar: 'Reanudar proyecto',
  completar: 'Marcar como completado',
  cancelar: 'Cancelar proyecto',
  reabrir: 'Reabrir proyecto',
};

/** Etiqueta "Sin clasificar" (bucket explícito de estado/tipo NULL — B-8). */
export const SIN_CLASIFICAR = 'Sin clasificar';

// ---------------------------------------------------------------------------
// Capacidades (matriz de permisos aprobada, 6.3 §2.B)
// ---------------------------------------------------------------------------

export interface CapacidadesCicloVida {
  iniciar: boolean;
  pausar: boolean;
  reanudar: boolean;
  completar: boolean;
  cancelar: boolean;
  reabrir: boolean;
  editarTipo: boolean;
  verHistorial: boolean;
}

const CAPACIDADES_NINGUNA: CapacidadesCicloVida = {
  iniciar: false, pausar: false, reanudar: false,
  completar: false, cancelar: false, reabrir: false,
  editarTipo: false, verHistorial: false,
};

function capacidades(rol: RolProyectoFuncional, verHistorial: boolean): CapacidadesCicloVida {
  switch (rol) {
    case 'gerente':
      // Gerente = administrador del proyecto: todas las acciones de dirección + clasificación (§5.2).
      return { iniciar: true, pausar: true, reanudar: true, completar: true, cancelar: true, reabrir: true, editarTipo: true, verHistorial };
    case 'jefe':
      // Jefe/responsable: iniciar, pausar, reanudar y completar; NO cancelar ni reabrir.
      return { iniciar: true, pausar: true, reanudar: true, completar: true, cancelar: false, reabrir: false, editarTipo: false, verHistorial };
    default:
      // coordinador / colaborador / lector / sin_rol: SOLO consulta.
      return { ...CAPACIDADES_NINGUNA, verHistorial };
  }
}

/**
 * Matriz de permisos (núcleo puro). Plataforma y admin de empresa (Hub) conservan
 * todas sus facultades; los demás roles del proyecto NO obtienen privilegios por
 * el simple hecho de pertenecer (rol de app editor/viewer ⇒ consulta).
 */
export function derivarCapacidades(entrada: {
  esPlataforma?: boolean | null;
  rolApp?: string | null;
  rolProyecto?: RolProyectoFuncional | null;
}): CapacidadesCicloVida {
  if (entrada.esPlataforma || entrada.rolApp === 'admin') {
    return { iniciar: true, pausar: true, reanudar: true, completar: true, cancelar: true, reabrir: true, editarTipo: true, verHistorial: true };
  }
  const rol = entrada.rolProyecto ?? 'sin_rol';
  const puedeVerHistorial =
    rol !== 'sin_rol' || entrada.rolApp === 'editor' || entrada.rolApp === 'viewer';
  return capacidades(rol, puedeVerHistorial);
}

/** Traduce un codigo de gp_roles_proyecto_c al rol funcional (alias tolerantes). */
export function rolFuncionalDesdeCodigo(codigo: string | null | undefined): RolProyectoFuncional {
  if (!codigo) return 'sin_rol';
  return ALIAS_ROL_PROYECTO[codigo] ?? 'sin_rol';
}

// ---------------------------------------------------------------------------
// Validación de una acción (núcleo puro — espejo de la RPC 0010)
// ---------------------------------------------------------------------------

export type ValidacionAccion =
  | { ok: true; estadoDestino: EstadoProyecto; motivoObligatorio: boolean }
  | {
      ok: false;
      codigo: 'ESTADO_SIN_CLASIFICAR' | 'TRANSICION_INVALIDA' | 'PERMISO_INSUFICIENTE' | 'MOTIVO_REQUERIDO';
      mensaje: string;
    };

export function validarAccion(p: {
  estadoActual: string | null | undefined;
  accion: AccionCicloVida;
  motivo?: string | null;
  capacidades: CapacidadesCicloVida;
}): ValidacionAccion {
  if (!p.estadoActual) {
    return {
      ok: false,
      codigo: 'ESTADO_SIN_CLASIFICAR',
      mensaje:
        'El proyecto está "Sin clasificar" (estado NULL, B-8): clasifícalo en la migración/cutover antes de ejecutar acciones de dirección.',
    };
  }
  const actual = p.estadoActual as EstadoProyecto;
  const destino = TRANSICIONES_VALIDAS[actual]?.[p.accion];
  if (!destino) {
    return {
      ok: false,
      codigo: 'TRANSICION_INVALIDA',
      mensaje: `La transición "${p.accion}" no es válida desde el estado "${actual}".`,
    };
  }
  if (!p.capacidades[p.accion]) {
    return {
      ok: false,
      codigo: 'PERMISO_INSUFICIENTE',
      mensaje: `Tu rol no permite "${ETIQUETA_ACCION[p.accion]}". La pertenencia al proyecto no otorga permisos administrativos.`,
    };
  }
  const motivoObligatorio = ACCIONES_MOTIVO_OBLIGATORIO.includes(p.accion);
  if (motivoObligatorio && (!p.motivo || p.motivo.trim() === '')) {
    return {
      ok: false,
      codigo: 'MOTIVO_REQUERIDO',
      mensaje: `"${ETIQUETA_ACCION[p.accion]}" exige un motivo obligatorio (queda registrado en la auditoría).`,
    };
  }
  return { ok: true, estadoDestino: destino, motivoObligatorio };
}

// ---------------------------------------------------------------------------
// Adaptador mínimo del cliente (inyectable: pruebas sin red)
// ---------------------------------------------------------------------------

export interface RespuestaRpc {
  data: unknown;
  error: { code?: string | number; message: string } | null;
}

export interface ClienteCicloVida {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<RespuestaRpc>;
  from: (tabla: string) => {
    select: (columnas: string) => {
      eq: (col: string, valor: unknown) => any;
      order: (col: string, opts?: Record<string, unknown>) => any;
      limit: (n: number) => any;
    };
  };
}

// ---------------------------------------------------------------------------
// Cambio de estado (ÚNICO camino de escritura: RPC atómica 0010)
// ---------------------------------------------------------------------------

export type ResultadoCambioEstado =
  | { ok: true; estadoAnterior: string | null; estadoNuevo: EstadoProyecto; accion: AccionCicloVida }
  | { ok: false; codigo: 'SIN_CLIENTE' | 'RPC_NO_APLICADA' | 'PERMISO' | 'TRANSICION' | 'MOTIVO' | 'ERROR'; mensaje: string };

function mensajeRpcNoAplicada(fn: string, sql: string): string {
  return `La función "${fn}" no está aplicada todavía en Supabase: ejecutar el SQL pendiente ${sql} (aplicación manual del responsable).`;
}

export async function cambiarEstadoCicloVida(
  deps: { cliente: ClienteCicloVida | null },
  p: { proyectoId: string; estadoDestino: EstadoProyecto; motivo: string | null },
): Promise<ResultadoCambioEstado> {
  if (!deps.cliente) {
    return {
      ok: false,
      codigo: 'SIN_CLIENTE',
      mensaje: 'Cliente Supabase no disponible (modo local fail-closed, sin VITE_SUPABASE_URL/ANON_KEY).',
    };
  }
  try {
    const respuesta = await deps.cliente.rpc('gp_cambiar_estado_proyecto', {
      p_proyecto_id: p.proyectoId,
      p_estado_nuevo: p.estadoDestino,
      p_motivo: p.motivo && p.motivo.trim() !== '' ? p.motivo.trim() : null,
    });
    if (respuesta.error) {
      const code = String(respuesta.error.code ?? '');
      const msg = String(respuesta.error.message ?? '');
      const noAplicada =
        code === 'PGRST202' ||
        code === '404' ||
        /Could not find the function/i.test(msg) ||
        /function .* does not exist/i.test(msg);
      if (noAplicada) {
        return { ok: false, codigo: 'RPC_NO_APLICADA', mensaje: mensajeRpcNoAplicada('gp_cambiar_estado_proyecto', '20261115_0010') };
      }
      if (msg.startsWith('PERMISO_INSUFICIENTE')) return { ok: false, codigo: 'PERMISO', mensaje: msg.replace(/^PERMISO_INSUFICIENTE:\s*/, '') };
      if (msg.startsWith('TRANSICION_INVALIDA')) return { ok: false, codigo: 'TRANSICION', mensaje: msg.replace(/^TRANSICION_INVALIDA:\s*/, '') };
      if (msg.startsWith('MOTIVO_REQUERIDO')) return { ok: false, codigo: 'MOTIVO', mensaje: msg.replace(/^MOTIVO_REQUERIDO:\s*/, '') };
      return { ok: false, codigo: 'ERROR', mensaje: msg || 'Error desconocido al registrar el cambio de estado.' };
    }
    const r = (respuesta.data ?? {}) as { estado_anterior?: unknown; estado_nuevo?: unknown; accion?: unknown };
    return {
      ok: true,
      estadoAnterior: typeof r.estado_anterior === 'string' ? r.estado_anterior : null,
      estadoNuevo: p.estadoDestino,
      accion: typeof r.accion === 'string' ? (r.accion as AccionCicloVida) : 'reabrir',
    };
  } catch (e) {
    return { ok: false, codigo: 'ERROR', mensaje: e instanceof Error ? e.message : String(e) };
  }
}

// ---------------------------------------------------------------------------
// Resolución de capacidades (identidad real del Hub + rol de proyecto)
// ---------------------------------------------------------------------------

export type ResolucionCapacidades =
  | { estado: 'sin_sesion'; capacidades: CapacidadesCicloVida; mensaje: string }
  | { estado: 'indisponible'; capacidades: CapacidadesCicloVida; mensaje: string; rolProyecto: RolProyectoFuncional | null }
  | {
      estado: 'ok';
      capacidades: CapacidadesCicloVida;
      rolProyecto: RolProyectoFuncional | null;
      rolApp: string | null;
      esPlataforma: boolean;
    };

function esRpcNoAplicada(error: { code?: string | number; message: string } | null | undefined): boolean {
  if (!error) return false;
  const code = String(error.code ?? '');
  const msg = String(error.message ?? '');
  return (
    code === 'PGRST202' ||
    code === '404' ||
    /Could not find the function/i.test(msg) ||
    /function .* does not exist/i.test(msg)
  );
}

export async function resolverCapacidadesProyecto(
  deps: { cliente: ClienteCicloVida | null; resolverContexto: () => Promise<ContextoSesion | null> },
  proyectoId: string,
): Promise<ResolucionCapacidades> {
  let ctx: ContextoSesion | null = null;
  try {
    ctx = await deps.resolverContexto();
  } catch (e) {
    const mensaje = e instanceof ErrorSesion ? e.message : e instanceof Error ? e.message : String(e);
    return {
      estado: 'indisponible',
      capacidades: CAPACIDADES_NINGUNA,
      rolProyecto: null,
      mensaje: `No se pudo verificar la identidad del Hub (fail-closed): ${mensaje}`,
    };
  }
  if (!ctx) {
    return {
      estado: 'sin_sesion',
      capacidades: CAPACIDADES_NINGUNA,
      mensaje: 'No hay sesión activa de Qaway Hub: inicia sesión para administrar el proyecto.',
    };
  }

  // Plataforma / admin de empresa: facultades completas del Hub (sin rol de proyecto).
  if (ctx.esPlataforma || ctx.rolApp === 'admin') {
    return { estado: 'ok', capacidades: derivarCapacidades({ esPlataforma: ctx.esPlataforma, rolApp: ctx.rolApp }), rolProyecto: null, rolApp: ctx.rolApp, esPlataforma: ctx.esPlataforma };
  }

  // Resto: rol de proyecto vía RPC (fail-closed: sin RPC verificable ⇒ solo consulta).
  if (!deps.cliente) {
    return {
      estado: 'indisponible',
      capacidades: CAPACIDADES_NINGUNA,
      rolProyecto: null,
      mensaje: 'Cliente Supabase no disponible: no se pudo verificar el rol del proyecto (fail-closed).',
    };
  }
  try {
    const respuesta = await deps.cliente.rpc('gp_rol_proyecto_actual', { p_proyecto_id: proyectoId });
    if (respuesta.error) {
      const mensaje = esRpcNoAplicada(respuesta.error)
        ? mensajeRpcNoAplicada('gp_rol_proyecto_actual', '20261115_0010')
        : String(respuesta.error.message ?? '');
      return { estado: 'indisponible', capacidades: CAPACIDADES_NINGUNA, rolProyecto: null, mensaje };
    }
    const rol = rolFuncionalDesdeCodigo(typeof respuesta.data === 'string' ? respuesta.data : null);
    return {
      estado: 'ok',
      capacidades: derivarCapacidades({ esPlataforma: false, rolApp: ctx.rolApp, rolProyecto: rol }),
      rolProyecto: rol,
      rolApp: ctx.rolApp,
      esPlataforma: false,
    };
  } catch (e) {
    return {
      estado: 'indisponible',
      capacidades: CAPACIDADES_NINGUNA,
      rolProyecto: null,
      mensaje: `No se pudo verificar el rol del proyecto (fail-closed): ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

// ---------------------------------------------------------------------------
// Historial de cambios de estado (gp_eventos_auditoria — SIN tablas nuevas)
// ---------------------------------------------------------------------------

export interface EventoEstado {
  id: string;
  ocurridoAt: string;
  accion: string | null;
  estadoAnterior: string | null;
  estadoNuevo: string | null;
  motivo: string | null;
  actorPersonaId: string | null;
  actorUserId: string | null;
}

export type ResultadoHistorial =
  | { estado: 'lista'; eventos: EventoEstado[] }
  | { estado: 'vacio'; mensaje: string }
  | { estado: 'error'; mensaje: string };

/** Núcleo puro: filas crudas de gp_eventos_auditoria → eventos de estado. */
export function mapearFilasHistorial(filas: unknown, error: string | null): ResultadoHistorial {
  if (error) {
    return { estado: 'error', mensaje: `No se pudo leer el historial de estado: ${error}` };
  }
  if (!Array.isArray(filas)) {
    return { estado: 'vacio', mensaje: 'Sin registros de cambio de estado todavía.' };
  }
  const eventos: EventoEstado[] = [];
  filas.forEach((fila) => {
    if (typeof fila !== 'object' || fila === null) return;
    const r = fila as Record<string, unknown>;
    const despues = (typeof r.payload_despues === 'object' && r.payload_despues !== null ? r.payload_despues : {}) as Record<string, unknown>;
    const antes = (typeof r.payload_antes === 'object' && r.payload_antes !== null ? r.payload_antes : {}) as Record<string, unknown>;
    eventos.push({
      id: typeof r.id === 'string' ? r.id : '',
      ocurridoAt: typeof r.ocurrido_at === 'string' ? r.ocurrido_at : '',
      accion: typeof despues.accion === 'string' ? despues.accion : null,
      estadoAnterior: typeof antes.estado_codigo === 'string' ? antes.estado_codigo : null,
      estadoNuevo: typeof despues.estado_codigo === 'string' ? despues.estado_codigo : null,
      motivo: typeof despues.motivo === 'string' ? despues.motivo : null,
      actorPersonaId: typeof r.actor_persona_id === 'string' ? r.actor_persona_id : null,
      actorUserId: typeof r.actor_user_id === 'string' ? r.actor_user_id : null,
    });
  });
  if (eventos.length === 0) {
    return { estado: 'vacio', mensaje: 'Sin registros de cambio de estado todavía.' };
  }
  return { estado: 'lista', eventos };
}

export async function listarHistorialEstado(
  deps: { cliente: ClienteCicloVida | null },
  proyectoId: string,
): Promise<ResultadoHistorial> {
  if (!deps.cliente) {
    return { estado: 'error', mensaje: 'Cliente Supabase no disponible (modo local fail-closed).' };
  }
  try {
    const consulta = deps.cliente
      .from('gp_eventos_auditoria')
      .select('id,accion,payload_antes,payload_despues,actor_user_id,actor_persona_id,origen,ocurrido_at')
      .eq('proyecto_id', proyectoId)
      .eq('entidad', 'gp_proyectos')
      .eq('accion', 'STATE_CHANGE')
      .order('ocurrido_at', { ascending: false })
      .limit(50);
    const respuesta = (await consulta) as unknown as { data: unknown; error: { message: string } | null };
    return mapearFilasHistorial(respuesta.data, respuesta.error ? respuesta.error.message : null);
  } catch (e) {
    return { estado: 'error', mensaje: e instanceof Error ? e.message : String(e) };
  }
}

// ---------------------------------------------------------------------------
// Clasificación (tipo) — helpers puros para la UI
// ---------------------------------------------------------------------------

/** Normaliza la selección de tipo: ''/'null' → NULL "Sin clasificar" (B-8). */
export function normalizarTipoSeleccion(valor: string | null | undefined): { codigo: string | null; etiqueta: string } {
  const limpio = typeof valor === 'string' ? valor.trim() : '';
  if (limpio === '' || limpio === 'null' || limpio === '__null__') {
    return { codigo: null, etiqueta: SIN_CLASIFICAR };
  }
  return { codigo: limpio, etiqueta: limpio };
}

/** Etiqueta del estado/tipo desde el catálogo vivo (fallback honesto, B-8). */
export function etiquetaDesdeCatalogo(
  codigo: string | null | undefined,
  valores: ValorCatalogo[] | undefined,
): string {
  if (!codigo) return SIN_CLASIFICAR;
  const encontrado = (valores ?? []).find((v) => v.codigo === codigo);
  return encontrado ? encontrado.nombre : codigo;
}

// ---------------------------------------------------------------------------
// Instancia de la app (cliente compartido del Hub + contexto real de sesión)
// ---------------------------------------------------------------------------

const clienteApp = supabase as unknown as ClienteCicloVida | null;

/** Capacidades del usuario autenticado sobre un proyecto (fail-closed). */
export function capacidadesDeProyecto(proyectoId: string): Promise<ResolucionCapacidades> {
  return resolverCapacidadesProyecto({ cliente: clienteApp, resolverContexto: resolverContextoSesion }, proyectoId);
}

/** Cambio de estado (RPC atómica gp_cambiar_estado_proyecto, SQL 0010). */
export function cambiarEstado(p: { proyectoId: string; estadoDestino: EstadoProyecto; motivo: string | null }): Promise<ResultadoCambioEstado> {
  return cambiarEstadoCicloVida({ cliente: clienteApp }, p);
}

/** Historial de STATE_CHANGE del proyecto (gp_eventos_auditoria). */
export function historialEstado(proyectoId: string): Promise<ResultadoHistorial> {
  return listarHistorialEstado({ cliente: clienteApp }, proyectoId);
}
