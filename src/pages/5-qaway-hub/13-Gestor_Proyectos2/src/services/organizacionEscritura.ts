/**
 * organizacionEscritura.ts
 * ========================
 * Servicio de ESCRITURA para la estructura organizacional de cada empresa
 * (tenant) sobre la tabla existente public.gestor_unidades. ÚNICA vía de
 * escritura del subsistema: siempre INSERT (NUNCA upsert — AdaptadorBD ni
 * expone esa operación), con pre-vuelo, lote idempotente y compensación
 * verificada fila por fila.
 *
 * Condiciones aprobadas (Etapa 2):
 *   1. Codes `BASE-DEL-NOMBRE-XXXX` (normalizado sin acentos); unicidad GLOBAL
 *      verificada en pre-vuelo contra uq_gestor_unidades_code; colisión ⇒ otro
 *      sufijo y re-verificación. Nunca upsert.
 *   2. `orden` 1..n entre hermanos, respetando el orden de definición.
 *   3. La creación BLOQUEA si la columna `orden` no existe (0005 pendiente);
 *      sin degradación silenciosa. La migración la aplica el usuario a mano.
 *   5. tenantId válido OBLIGATORIO y SIEMPRE coherente con la sesión real del
 *      Hub (Etapa 4). Autorización: si hay callback `verificarAutorizacion`,
 *      se exige true (contrato 2b intacto). Sin callback: con `db` inyectada
 *      (pruebas) la operación continúa marcada NO verificada con advertencia;
 *      en RUNTIME (sin db) se EXIGE la sesión real vía verificarAutorizacionSesion
 *      (sesión + user_can_use_app + rol admin/editor + coherencia de tenant) —
 *      denegada ⇒ AUTORIZACION_DENEGADA. Los fallos de RPC se PROPAGAN (nunca
 *      se falsea un veredicto por un fallo técnico). RLS (0006b) es la garantía
 *      final e independiente del frontend.
 *   6. Compensación: cada DELETE se verifica; si falla, se informa el lote y
 *      las filas pendientes de limpieza (ErrorCompensacion). Nunca se reporta
 *      una reversión exitosa sin comprobarla.
 *   7. Borradores validados antes de tocar BD: claves únicas, parentKey
 *      resuelta dentro del lote, ciclos (detectarCiclos), datos obligatorios,
 *      tamaño de lote. Las 251 semillas jamás se tocan (ids randomUUID ≠
 *      'unit-NNN'; deletes/updates siempre acotados por id+tenant).
 */

import {
  detectarCiclos,
  calcularNumeracion,
  type NodoJerarquia,
} from './organizacionJerarquia';
import type { GestorUnitType, } from './gestorOrganizacionService';
import {
  construirBorradoresPlantilla,
  type GestorUnitBorrador,
  type PlantillaSector,
} from './organizacionPlantillas';
import {
  fallbackInsercionDesde,
  listarUnidadesParaJerarquia,
  aNodosJerarquia,
  esErrorColumnaAusente,
  obtenerAdaptadorPorDefecto,
  TABLA_UNIDADES,
  type AdaptadorBD,
  type FilaBD,
} from './organizacionJerarquiaLectura';
import { verificarAutorizacionSesion } from './contextoSesion';

// ---------------------------------------------------------------------------
// Errores tipados
// ---------------------------------------------------------------------------

export type CodigoErrorOrganizacion =
  | 'TENANT_INVALIDO'
  | 'AUTORIZACION_DENEGADA'
  | 'MIGRACION_0005_PENDIENTE'
  | 'BORRADORES_INVALIDOS'
  | 'FUERA_DE_TENANT'
  | 'CICLO_ORGANIZACIONAL'
  | 'INSERCION_LOTE'
  | 'COMPENSACION_INCOMPLETA'
  | 'CODE_COLISION'
  | 'ID_COLISION'
  | 'ORDEN_ACTUALIZACION';

export class ErrorOrganizacion extends Error {
  readonly codigoError: CodigoErrorOrganizacion;
  readonly detalle: Record<string, unknown> | undefined;

  constructor(codigoError: CodigoErrorOrganizacion, message: string, detalle?: Record<string, unknown>) {
    super(message);
    this.name = 'ErrorOrganizacion';
    this.codigoError = codigoError;
    this.detalle = detalle;
  }
}

// ---------------------------------------------------------------------------
// Constantes y tipos
// ---------------------------------------------------------------------------

export const LIMITE_LOTE = 200;
const REINTENTOS_SUFIJO = 8;
const ALFABETO_SUFIJO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Espejo runtime del enum GestorUnitType (gestorOrganizacionService.ts L3-12). */
export const DOMINIO_UNIT_TYPE: readonly string[] = [
  'central', 'dre', 'ugel', 'obra', 'jefatura', 'tienda', 'oficina', 'departamento', 'other',
];

export type OrigenEstructura = PlantillaSector | 'desde-cero';

export interface UnidadInsertada {
  id: string;
  /** Key de plantilla; null en unidades creadas manualmente. */
  key: string | null;
  name: string;
  code: string;
  unitType: string;
  parentKey: string | null;
  parentUnitId: string | null;
  orden: number;
}

export interface ResultadoCreacionEstructura {
  loteId: string;
  tenantId: string;
  origen: OrigenEstructura;
  autorizacionVerificada: boolean;
  insertadas: UnidadInsertada[];
  /** key de plantilla → ruta numérica ('1', '1.1', '1.2.1'…) tras la inserción. */
  numeracionPorKey: Record<string, string>;
}

export interface VerificacionAcceso {
  db?: AdaptadorBD;
  verificarAutorizacion?: (tenantId: string) => boolean | Promise<boolean>;
}

export interface OpcionesCrearEstructura extends VerificacionAcceso {
  origen: OrigenEstructura;
  tenantId: string;
  borradoresPersonalizados?: GestorUnitBorrador[];
  soloActivadas?: boolean;
  generarId?: () => string;
  generarSufijo?: () => string;
}

export interface OpcionesCrearUnidad extends VerificacionAcceso {
  tenantId: string;
  name: string;
  unitType: GestorUnitType | string;
  parentUnitId?: string | null;
  orden?: number | null;
  region?: string | null;
  address?: string | null;
  metadata?: Record<string, unknown>;
  generarId?: () => string;
  generarSufijo?: () => string;
}

export interface PendienteLimpieza {
  id: string;
  code: string | null;
  name: string | null;
  motivo: string;
}

// ---------------------------------------------------------------------------
// Helpers base
// ---------------------------------------------------------------------------

function mensajeDe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Normaliza el nombre a la base del code: sin acentos, mayúsculas, guiones. */
export function normalizarBase(nombre: string): string {
  const sinAcentos = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return sinAcentos
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 28)
    .replace(/-+$/g, '');
}

/** Sufijo de 4 caracteres sin dígitos ambiguos (colisión, no criptografía). */
function generarSufijoUnidad(inyectado?: () => string): string {
  if (inyectado) return inyectado();
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buf = new Uint32Array(4);
    crypto.getRandomValues(buf);
    let out = '';
    for (let i = 0; i < 4; i++) {
      const byte = buf[i];
      out += ALFABETO_SUFIJO[(byte ?? 0) % ALFABETO_SUFIJO.length];
    }
    return out;
  }
  let out = '';
  for (let i = 0; i < 4; i++) out += ALFABETO_SUFIJO[Math.floor(Math.random() * ALFABETO_SUFIJO.length)];
  return out;
}

/** Id propio del tenant (identidad NUEVA; jamás la key de plantilla). */
function generarIdUnidad(inyectado?: () => string): string {
  if (inyectado) return inyectado();
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `u-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e12).toString(36)}`;
}

function validarTenantId(tenantId: unknown): string {
  if (typeof tenantId !== 'string' || tenantId.trim().length === 0) {
    throw new ErrorOrganizacion('TENANT_INVALIDO', 'Se requiere un tenantId válido de la empresa (texto no vacío).', {});
  }
  if (tenantId.length > 200) {
    throw new ErrorOrganizacion('TENANT_INVALIDO', 'El tenantId excede la longitud permitida (200).', {});
  }
  return tenantId.trim();
}

function validarNombre(nombre: unknown): string {
  if (typeof nombre !== 'string' || nombre.trim().length === 0) {
    throw new ErrorOrganizacion('BORRADORES_INVALIDOS', 'El nombre de la unidad es obligatorio (texto no vacío).', {});
  }
  if (nombre.trim().length > 200) {
    throw new ErrorOrganizacion('BORRADORES_INVALIDOS', 'El nombre de la unidad excede 200 caracteres.', {});
  }
  return nombre.trim();
}

function validarUnitType(unitType: unknown): string {
  if (typeof unitType !== 'string' || !DOMINIO_UNIT_TYPE.includes(unitType)) {
    throw new ErrorOrganizacion(
      'BORRADORES_INVALIDOS',
      `unit_type "${String(unitType)}" fuera del dominio existente (9 valores).`,
      { dominio: [...DOMINIO_UNIT_TYPE] },
    );
  }
  return unitType;
}

/**
 * Autorización (Etapa 4):
 *  · Con callback: se exige true (contrato Etapa 2b intacto).
 *  · Sin callback CON `db` inyectada: modo de PRUEBAS — no hay sesión real que
 *    consultar; la operación continúa marcada como NO verificada (advertencia).
 *  · Sin callback SIN `db` (RUNTIME): se EXIGE la sesión real del Hub vía
 *    verificarAutorizacionSesion (sesión + acceso a la app + rol admin/editor +
 *    coherencia del tenant con la identidad autenticada). Denegado ⇒
 *    AUTORIZACION_DENEGADA. Los fallos de infraestructura (RPC indisponible)
 *    se PROPAGAN: nunca se falsea un veredicto por un fallo técnico.
 */
async function verificarAcceso(opciones: VerificacionAcceso, tenantId: string): Promise<boolean> {
  if (opciones.verificarAutorizacion) {
    const autorizado = await opciones.verificarAutorizacion(tenantId);
    if (!autorizado) {
      throw new ErrorOrganizacion(
        'AUTORIZACION_DENEGADA',
        `El contexto de autenticación no tiene autorización para operar sobre la empresa "${tenantId}".`,
        { tenantId },
      );
    }
    return true;
  }
  if (opciones.db != null) {
    console.warn(
      `[organizacionEscritura] Autorización NO verificada para el tenant "${tenantId}": ` +
      'adaptador inyectado sin callback (modo de pruebas). En RUNTIME la autorización ' +
      'se exige siempre con la sesión real de Qaway Hub.',
    );
    return false;
  }
  const autorizado = await verificarAutorizacionSesion(tenantId);
  if (!autorizado) {
    throw new ErrorOrganizacion(
      'AUTORIZACION_DENEGADA',
      `La sesión de Qaway Hub no tiene autorización para operar sobre la empresa "${tenantId}" ` +
      '(sesión, acceso a la app, rol admin/editor o coherencia de tenant).',
      { tenantId },
    );
  }
  return true;
}

/** Probe de la columna `orden`: BLOQUEA la escritura si 0005 no está aplicada. */
async function exigirColumnaOrden(db: AdaptadorBD): Promise<void> {
  try {
    await db.seleccionar(TABLA_UNIDADES, { columnas: 'orden', limit: 1 });
  } catch (error) {
    if (esErrorColumnaAusente(error)) {
      throw new ErrorOrganizacion(
        'MIGRACION_0005_PENDIENTE',
        'La columna orden no existe en gestor_unidades: aplica la migración ' +
        '20261114_0005_gestor_unidades_orden_idx.sql antes de crear estructuras. ' +
        'La operación se detuvo sin insertar nada.',
        { causaOriginal: mensajeDe(error) },
      );
    }
    throw error;
  }
}

/** Pre-vuelo: columnas vigentes + ids/codes existentes (unicidad GLOBAL). */
async function prepararEntorno(db: AdaptadorBD): Promise<{ ids: Set<string>; codes: Set<string> }> {
  await exigirColumnaOrden(db);
  const filas = await db.seleccionar(TABLA_UNIDADES, { columnas: 'id,code' });
  const ids = new Set<string>();
  const codes = new Set<string>();
  for (const fila of filas) {
    ids.add(String(fila['id']));
    const code = fila['code'];
    if (typeof code === 'string') codes.add(code);
  }
  return { ids, codes };
}

// ---------------------------------------------------------------------------
// Validación de borradores (condición 7)
// ---------------------------------------------------------------------------

export function validarBorradoresLote(borradores: GestorUnitBorrador[]): void {
  if (!Array.isArray(borradores) || borradores.length === 0) {
    throw new ErrorOrganizacion('BORRADORES_INVALIDOS', 'El lote de borradores está vacío.', {});
  }
  if (borradores.length > LIMITE_LOTE) {
    throw new ErrorOrganizacion(
      'BORRADORES_INVALIDOS',
      `El lote tiene ${borradores.length} unidades y excede el límite ${LIMITE_LOTE}.`,
      {},
    );
  }
  const claves = new Set<string>();
  for (const borrador of borradores) {
    if (typeof borrador.key !== 'string' || borrador.key.trim().length === 0) {
      throw new ErrorOrganizacion('BORRADORES_INVALIDOS', 'Cada borrador requiere una key no vacía.', {});
    }
    validarNombre(borrador.name);
    validarUnitType(borrador.unitType);
    if (claves.has(borrador.key)) {
      throw new ErrorOrganizacion('BORRADORES_INVALIDOS', `Key duplicada en el lote: "${borrador.key}".`, {});
    }
    claves.add(borrador.key);
  }
  for (const borrador of borradores) {
    if (borrador.parentKey !== null && !claves.has(borrador.parentKey)) {
      throw new ErrorOrganizacion(
        'BORRADORES_INVALIDOS',
        `parentKey "${borrador.parentKey}" del nodo "${borrador.key}" no existe en el lote ` +
        '(para colgar de una unidad EXISTENTE usa crearHija).',
        { key: borrador.key },
      );
    }
  }
  const nodos: NodoJerarquia[] = borradores.map((b) => ({ id: b.key, parentUnitId: b.parentKey }));
  const ciclos = detectarCiclos(nodos);
  if (ciclos.length > 0) {
    throw new ErrorOrganizacion(
      'CICLO_ORGANIZACIONAL',
      `Los borradores contienen un ciclo: ${ciclos.join(', ')}.`,
      { ciclos },
    );
  }
}

/** `orden` 1..n entre hermanos según el ORDEN DE DEFINICIÓN del lote. */
function ordenesPorDefinicion(borradores: GestorUnitBorrador[]): Map<string, number> {
  const ordenPorKey = new Map<string, number>();
  const contadorPorPadre = new Map<string, number>();
  for (const borrador of borradores) {
    const padre = borrador.parentKey ?? 'Ø-raíz';
    const siguiente = (contadorPorPadre.get(padre) ?? 0) + 1;
    contadorPorPadre.set(padre, siguiente);
    ordenPorKey.set(borrador.key, siguiente);
  }
  return ordenPorKey;
}

function requerir<V>(mapa: Map<string, V>, clave: string, contexto: string): V {
  const valor = mapa.get(clave);
  if (valor === undefined) {
    throw new ErrorOrganizacion('BORRADORES_INVALIDOS', `Falta "${clave}" en ${contexto}.`, { clave });
  }
  return valor;
}

function asignarIds(
  borradores: GestorUnitBorrador[],
  idsExistentes: Set<string>,
  generarId?: () => string,
): Map<string, string> {
  const ids = new Map<string, string>();
  for (const borrador of borradores) {
    let asignado = '';
    for (let intento = 0; intento < REINTENTOS_SUFIJO; intento++) {
      const candidato = generarIdUnidad(generarId);
      if (!idsExistentes.has(candidato) && ![...ids.values()].includes(candidato)) {
        asignado = candidato;
        break;
      }
    }
    if (asignado === '') {
      throw new ErrorOrganizacion(
        'ID_COLISION',
        `No se pudo generar un id único para "${borrador.key}" tras ${REINTENTOS_SUFIJO} intentos.`,
        { key: borrador.key },
      );
    }
    ids.set(borrador.key, asignado);
  }
  return ids;
}

/** Codes BASE-DEL-NOMBRE-XXXX con verificación de unicidad GLOBAL y en lote. */
function asignarCodes(
  borradores: GestorUnitBorrador[],
  codesExistentes: Set<string>,
  generarSufijo?: () => string,
): Map<string, string> {
  const codes = new Map<string, string>();
  for (const borrador of borradores) {
    const base = normalizarBase(borrador.name);
    if (base.length === 0) {
      throw new ErrorOrganizacion(
        'BORRADORES_INVALIDOS',
        `El nombre "${borrador.name}" no genera una base de código (solo caracteres no alfanuméricos).`,
        { key: borrador.key },
      );
    }
    let asignado = '';
    for (let intento = 0; intento < REINTENTOS_SUFIJO; intento++) {
      const candidato = `${base}-${generarSufijoUnidad(generarSufijo)}`;
      const enLote = [...codes.values()].includes(candidato);
      if (!codesExistentes.has(candidato) && !enLote) {
        asignado = candidato;
        break;
      }
    }
    if (asignado === '') {
      throw new ErrorOrganizacion(
        'CODE_COLISION',
        `No se pudo generar un code único para "${borrador.name}" (base "${base}") ` +
        `tras ${REINTENTOS_SUFIJO} intentos de sufijo.`,
        { key: borrador.key, base },
      );
    }
    codes.set(borrador.key, asignado);
  }
  return codes;
}

interface PlanFila {
  borrador: GestorUnitBorrador;
  id: string;
  code: string;
  parentUnitId: string | null;
  orden: number;
}

/** Plan de inserción BFS por niveles: raíces primero, luego cada nivel. */
function planificarInsercion(
  borradores: GestorUnitBorrador[],
  idsPorKey: Map<string, string>,
  codesPorKey: Map<string, string>,
  ordenPorKey: Map<string, number>,
): PlanFila[] {
  const hijosPorPadre = new Map<string | null, GestorUnitBorrador[]>();
  for (const borrador of borradores) {
    const clave = borrador.parentKey ?? null;
    const lista = hijosPorPadre.get(clave);
    if (lista) lista.push(borrador);
    else hijosPorPadre.set(clave, [borrador]);
  }
  const plan: PlanFila[] = [];
  let nivel = [...(hijosPorPadre.get(null) ?? [])];
  let guardia = 0;
  while (nivel.length > 0 && guardia <= borradores.length + 1) {
    for (const borrador of nivel) {
      plan.push({
        borrador,
        id: requerir(idsPorKey, borrador.key, 'ids del lote'),
        code: requerir(codesPorKey, borrador.key, 'codes del lote'),
        parentUnitId: borrador.parentKey === null ? null : requerir(idsPorKey, borrador.parentKey, 'ids del lote'),
        orden: requerir(ordenPorKey, borrador.key, 'órdenes por definición'),
      });
    }
    nivel = nivel.flatMap((borrador) => hijosPorPadre.get(borrador.key) ?? []);
    guardia += 1;
  }
  if (plan.length !== borradores.length) {
    throw new ErrorOrganizacion(
      'BORRADORES_INVALIDOS',
      'Nodos inalcanzables desde la raíz del lote (ciclo no detectado o bosque parti­do).',
      { planificados: plan.length, esperados: borradores.length },
    );
  }
  return plan;
}

// ---------------------------------------------------------------------------
// Compensación de lotes (condición 6: cada DELETE se verifica)
// ---------------------------------------------------------------------------

function loteDeMetadata(metadata: unknown): string | null {
  const plantilla = (metadata as { plantilla?: { lote?: unknown } } | null | undefined)?.plantilla;
  return typeof plantilla?.lote === 'string' ? plantilla.lote : null;
}

/**
 * Elimina las filas del lote verificando EXPRESAMENTE cada DELETE (exactamente
 * 1 fila devuelta con el id esperado, filtrando id+tenant). Luego barre restos
 * del lote (inserciones cuya respuesta se perdió). Devuelve limpiadas y
 * pendientes; jamás toca filas de otro tenant ni las semillas.
 */
async function compensarLote(
  db: AdaptadorBD,
  tenantId: string,
  loteId: string,
  insertadas: UnidadInsertada[],
): Promise<{ limpiadas: string[]; pendientes: PendienteLimpieza[] }> {
  const limpiadas: string[] = [];
  const pendientes: PendienteLimpieza[] = [];
  const enPendientes = new Set<string>();
  const marcarPendiente = (p: PendienteLimpieza): void => {
    if (!enPendientes.has(p.id)) {
      enPendientes.add(p.id);
      pendientes.push(p);
    }
  };

  for (const fila of insertadas) {
    try {
      const borradas = await db.eliminar(TABLA_UNIDADES, { eq: [['id', fila.id], ['tenant_id', tenantId]] });
      const primera = borradas[0];
      if (borradas.length !== 1 || primera === undefined || String(primera['id']) !== fila.id) {
        marcarPendiente({
          id: fila.id, code: fila.code, name: fila.name,
          motivo: `Verificación DELETE fallida: devolvió ${borradas.length} fila(s).`,
        });
      } else {
        limpiadas.push(fila.id);
      }
    } catch (error) {
      marcarPendiente({ id: fila.id, code: fila.code, name: fila.name, motivo: `DELETE falló: ${mensajeDe(error)}` });
    }
  }

  // Barrido: filas del lote cuya respuesta de INSERT se perdió.
  try {
    const candidatas = await db.seleccionar(TABLA_UNIDADES, {
      columnas: 'id,code,name,metadata',
      eq: [['tenant_id', tenantId]],
    });
    for (const resto of candidatas) {
      const id = String(resto['id']);
      if (loteDeMetadata(resto['metadata']) === loteId && !limpiadas.includes(id) && !enPendientes.has(id)) {
        try {
          const borradas = await db.eliminar(TABLA_UNIDADES, { eq: [['id', id], ['tenant_id', tenantId]] });
          if (borradas.length === 1) limpiadas.push(id);
          else {
            marcarPendiente({
              id, code: typeof resto['code'] === 'string' ? (resto['code'] as string) : null,
              name: typeof resto['name'] === 'string' ? (resto['name'] as string) : null,
              motivo: `Resto del lote: DELETE devolvió ${borradas.length} fila(s).`,
            });
          }
        } catch (error) {
          marcarPendiente({
            id, code: typeof resto['code'] === 'string' ? (resto['code'] as string) : null,
            name: typeof resto['name'] === 'string' ? (resto['name'] as string) : null,
            motivo: `Resto del lote: DELETE falló: ${mensajeDe(error)}`,
          });
        }
      }
    }
  } catch (error) {
    marcarPendiente({
      id: `lote:${loteId}`, code: null, name: null,
      motivo: `El barrido del lote falló (${mensajeDe(error)}): verificar manualmente las filas con metadata.plantilla.lote=${loteId}.`,
    });
  }
  return { limpiadas, pendientes };
}

// ---------------------------------------------------------------------------
// Creación de estructuras desde plantilla
// ---------------------------------------------------------------------------

function resolverBorradores(opciones: OpcionesCrearEstructura): GestorUnitBorrador[] {
  if (opciones.borradoresPersonalizados) return opciones.borradoresPersonalizados;
  if (opciones.origen === 'desde-cero') {
    throw new ErrorOrganizacion(
      'BORRADORES_INVALIDOS',
      '"desde cero" no crea filas: para la primera unidad usa crearUnidad() ' +
      '(el bosque vacío es la ausencia de copia).',
      {},
    );
  }
  return construirBorradoresPlantilla(opciones.origen, { soloActivadas: opciones.soloActivadas === true });
}

/**
 * Crea la estructura completa de la empresa a partir de una plantilla (o de
 * borradores personalizados de la vista previa). Consistencia garantizada:
 * pre-vuelo → INSERT por niveles → ante el primer fallo, detención +
 * compensación verificada (0 filas residuales o ErrorCompensacion con el lote
 * y las filas pendientes).
 */
export async function crearEstructuraDesdePlantilla(
  opciones: OpcionesCrearEstructura,
): Promise<ResultadoCreacionEstructura> {
  const tenantId = validarTenantId(opciones.tenantId);
  const autorizacionVerificada = await verificarAcceso(opciones, tenantId);
  const db = opciones.db ?? obtenerAdaptadorPorDefecto();

  const borradores = resolverBorradores(opciones);
  validarBorradoresLote(borradores);
  const entorno = await prepararEntorno(db);

  const loteId = generarIdUnidad(opciones.generarId);
  const idsPorKey = asignarIds(borradores, entorno.ids, opciones.generarId);
  const codesPorKey = asignarCodes(borradores, entorno.codes, opciones.generarSufijo);
  const ordenPorKey = ordenesPorDefinicion(borradores);
  const plan = planificarInsercion(borradores, idsPorKey, codesPorKey, ordenPorKey);

  const insertadas: UnidadInsertada[] = [];
  try {
    for (const paso of plan) {
      const sello = paso.borrador.metadata.plantilla;
      const fila: FilaBD = {
        id: paso.id,
        tenant_id: tenantId,
        parent_unit_id: paso.parentUnitId,
        name: paso.borrador.name,
        code: paso.code,
        unit_type: paso.borrador.unitType,
        region: null,
        macroregion: null,
        address: null,
        status: 'active',
        metadata: { plantilla: { ...sello, lote: loteId } },
        orden: paso.orden,
      };
      await db.insertar(TABLA_UNIDADES, fila);
      insertadas.push({
        id: paso.id,
        key: paso.borrador.key,
        name: paso.borrador.name,
        code: paso.code,
        unitType: paso.borrador.unitType,
        parentKey: paso.borrador.parentKey,
        parentUnitId: paso.parentUnitId,
        orden: paso.orden,
      });
    }
  } catch (error) {
    const resultado = await compensarLote(db, tenantId, loteId, insertadas);
    if (resultado.pendientes.length > 0) {
      throw new ErrorOrganizacion(
        'COMPENSACION_INCOMPLETA',
        `La inserción falló (${mensajeDe(error)}) y la limpieza quedó INCOMPLETA: ` +
        `${resultado.pendientes.length} fila(s) pendientes de limpieza. Lote: ${loteId}.`,
        {
          loteId,
          causaOriginal: mensajeDe(error),
          limpiadas: resultado.limpiadas,
          pendientes: resultado.pendientes,
        },
      );
    }
    throw new ErrorOrganizacion(
      'INSERCION_LOTE',
      `Inserción fallida en el lote ${loteId} (${mensajeDe(error)}). ` +
      `Lote revertido por completo: ${resultado.limpiadas.length} fila(s) eliminadas y verificadas.`,
      { loteId, causaOriginal: mensajeDe(error), insertadasAntes: insertadas.map((f) => f.id) },
    );
  }

  // Numeración SOLO de presentación, calculada del árbol real ya insertado.
  const unidades = await listarUnidadesParaJerarquia({ tenantId, db });
  const numeracion = calcularNumeracion(
    aNodosJerarquia(unidades),
    fallbackInsercionDesde(unidades),
  );
  const numeracionPorKey: Record<string, string> = {};
  for (const fila of insertadas) {
    const ruta = numeracion.get(fila.id);
    if (ruta) numeracionPorKey[fila.key ?? fila.id] = ruta.ruta;
  }

  return { loteId, tenantId, origen: opciones.origen, autorizacionVerificada, insertadas, numeracionPorKey };
}

// ---------------------------------------------------------------------------
// Creación de unidades individuales (incorporación posterior)
// ---------------------------------------------------------------------------

async function leerUnidadPorIdYTenant(
  db: AdaptadorBD,
  unidadId: string,
  tenantId: string | null,
): Promise<FilaBD | null> {
  const filtros: Array<readonly [string, unknown]> = [['id', unidadId]];
  if (tenantId !== null) filtros.push(['tenant_id', tenantId]);
  const filas = await db.seleccionar(TABLA_UNIDADES, {
    columnas: 'id,code,name,tenant_id,parent_unit_id',
    eq: filtros,
  });
  return filas[0] ?? null;
}

/**
 * Verifica que un padre EXISTS y pertenece al tenant del llamador.
 * Rechaza explícitamente: padre inexistente, padre de otra empresa y padre
 * semilla del catálogo (tenant NULL — decisión de negocio pendiente).
 */
async function exigirPadreDelTenant(db: AdaptadorBD, parentUnitId: string, tenantId: string): Promise<string> {
  const global = await leerUnidadPorIdYTenant(db, parentUnitId, null);
  if (global === null) {
    throw new ErrorOrganizacion('FUERA_DE_TENANT', `La unidad padre "${parentUnitId}" no existe.`, { parentUnitId });
  }
  if (global['tenant_id'] == null) {
    throw new ErrorOrganizacion(
      'FUERA_DE_TENANT',
      `La unidad padre "${parentUnitId}" es una semilla del catálogo global (tenant NULL): ` +
      'no se permiten hijos de empresa bajo semillas en esta etapa.',
      { parentUnitId },
    );
  }
  if (String(global['tenant_id']) !== tenantId) {
    throw new ErrorOrganizacion(
      'FUERA_DE_TENANT',
      `La unidad padre "${parentUnitId}" pertenece a otra empresa; el tenant "${tenantId}" no puede operar sobre ella.`,
      { parentUnitId, tenantId },
    );
  }
  return String(global['code'] ?? '');
}

async function calcularSiguienteOrden(
  db: AdaptadorBD,
  tenantId: string,
  parentUnitId: string | null,
): Promise<number> {
  const filtros: ConsultaLocal = { columnas: 'orden', eq: [['tenant_id', tenantId]] };
  if (parentUnitId === null) filtros.isNull = ['parent_unit_id'];
  else filtros.eq = [...filtros.eq, ['parent_unit_id', parentUnitId]];
  const filas = await db.seleccionar(TABLA_UNIDADES, filtros);
  let maximo = 0;
  for (const fila of filas) {
    const orden = fila['orden'];
    if (typeof orden === 'number' && Number.isFinite(orden) && orden > maximo) maximo = orden;
  }
  return maximo + 1;
}

type ConsultaLocal = {
  columnas: string;
  eq: Array<readonly [string, unknown]>;
  isNull?: string[];
};

/** Crea UNA unidad (raíz o hija) propia del tenant. Insert único verificado. */
export async function crearUnidad(opciones: OpcionesCrearUnidad): Promise<UnidadInsertada> {
  const tenantId = validarTenantId(opciones.tenantId);
  const autorizacionVerificada = await verificarAcceso(opciones, tenantId);
  void autorizacionVerificada; // informativa; ver ResultadoCreacionEstructura
  const db = opciones.db ?? obtenerAdaptadorPorDefecto();
  const entorno = await prepararEntorno(db);

  const nombre = validarNombre(opciones.name);
  const unitType = validarUnitType(opciones.unitType);
  let parentUnitId: string | null = null;
  if (opciones.parentUnitId != null && opciones.parentUnitId !== '') {
    await exigirPadreDelTenant(db, opciones.parentUnitId, tenantId);
    parentUnitId = opciones.parentUnitId;
  }
  const orden = opciones.orden ?? (await calcularSiguienteOrden(db, tenantId, parentUnitId));

  let code = '';
  for (let intento = 0; intento < REINTENTOS_SUFIJO && code === ''; intento++) {
    const base = normalizarBase(nombre);
    if (base.length === 0) {
      throw new ErrorOrganizacion('CODE_COLISION', `El nombre "${nombre}" no genera base de código.`, {});
    }
    const candidato = `${base}-${generarSufijoUnidad(opciones.generarSufijo)}`;
    if (!entorno.codes.has(candidato)) code = candidato;
  }
  if (code === '') {
    throw new ErrorOrganizacion('CODE_COLISION', `No se pudo generar code único para "${nombre}".`, {});
  }

  let id = '';
  for (let intento = 0; intento < REINTENTOS_SUFIJO && id === ''; intento++) {
    const candidato = generarIdUnidad(opciones.generarId);
    if (!entorno.ids.has(candidato)) id = candidato;
  }
  if (id === '') throw new ErrorOrganizacion('ID_COLISION', `No se pudo generar id único para "${nombre}".`, {});

  const fila: FilaBD = {
    id,
    tenant_id: tenantId,
    parent_unit_id: parentUnitId,
    name: nombre,
    code,
    unit_type: unitType,
    region: opciones.region ?? null,
    macroregion: null,
    address: opciones.address ?? null,
    status: 'active',
    metadata: { ...(opciones.metadata ?? {}) },
    orden,
  };
  await db.insertar(TABLA_UNIDADES, fila);
  return { id, key: null, name: nombre, code, unitType, parentKey: null, parentUnitId, orden };
}

/** Crea una unidad hija bajo una unidad EXISTENTE del mismo tenant (orden = max+1). */
export async function crearHija(
  opciones: OpcionesCrearUnidad & { parentUnitId: string },
): Promise<UnidadInsertada> {
  if (typeof opciones.parentUnitId !== 'string' || opciones.parentUnitId.trim().length === 0) {
    throw new ErrorOrganizacion('BORRADORES_INVALIDOS', 'crearHija requiere parentUnitId válido.', {});
  }
  return crearUnidad({ ...opciones, parentUnitId: opciones.parentUnitId, orden: opciones.orden ?? null });
}

// ---------------------------------------------------------------------------
// Reordenamiento, movimiento y renombrado (identidad intacta)
// ---------------------------------------------------------------------------

interface HermanoActual { id: string; orden: number | null }

async function leerHermanos(
  db: AdaptadorBD,
  tenantId: string,
  parentUnitId: string | null,
): Promise<HermanoActual[]> {
  const filtros: ConsultaLocal = { columnas: 'id,orden', eq: [['tenant_id', tenantId]] };
  if (parentUnitId === null) filtros.isNull = ['parent_unit_id'];
  else filtros.eq = [...filtros.eq, ['parent_unit_id', parentUnitId]];
  try {
    const filas = await db.seleccionar(TABLA_UNIDADES, filtros);
    return filas.map((fila) => ({
      id: String(fila['id']),
      orden: typeof fila['orden'] === 'number' ? (fila['orden'] as number) : null,
    }));
  } catch (error) {
    if (esErrorColumnaAusente(error)) {
      throw new ErrorOrganizacion(
        'MIGRACION_0005_PENDIENTE',
        'La columna orden no existe (aplica 20261114_0005 antes de reordenar/mover).',
        { causaOriginal: mensajeDe(error) },
      );
    }
    throw error;
  }
}

/** UPDATE con verificación: exactamente 1 fila del id+tenant esperados. */
async function actualizarVerificado(
  db: AdaptadorBD,
  tenantId: string,
  unidadId: string,
  parche: FilaBD,
  contexto: string,
): Promise<FilaBD> {
  const filas = await db.actualizar(TABLA_UNIDADES, parche, {
    eq: [['id', unidadId], ['tenant_id', tenantId]],
  });
  const primera = filas[0];
  if (filas.length !== 1 || primera === undefined || String(primera['id']) !== unidadId) {
    throw new ErrorOrganizacion(
      'FUERA_DE_TENANT',
      `La unidad "${unidadId}" no pertenece al tenant "${tenantId}" (actualización afectó ${filas.length} fila(s)). ${contexto}`,
      { unidadId, tenantId, contexto },
    );
  }
  return primera;
}

/** Reordena hermanos 1..n según `idsEnNuevoOrden` (mismo conjunto, sin huecos). */
export async function reordenarHermanos(opciones: {
  tenantId: string;
  parentUnitId: string | null;
  idsEnNuevoOrden: string[];
  db?: AdaptadorBD;
  verificarAutorizacion?: (tenantId: string) => boolean | Promise<boolean>;
}): Promise<{ actualizadas: number; numeracion: Record<string, string> }> {
  const tenantId = validarTenantId(opciones.tenantId);
  await verificarAcceso(opciones, tenantId);
  const db = opciones.db ?? obtenerAdaptadorPorDefecto();
  await exigirColumnaOrden(db);

  const hermanos = await leerHermanos(db, tenantId, opciones.parentUnitId);
  const pedidos = opciones.idsEnNuevoOrden;
  const conjuntoActual = new Set(hermanos.map((h) => h.id));
  const conjuntoPedido = new Set(pedidos);
  if (conjuntoActual.size !== hermanos.length || conjuntoPedido.size !== pedidos.length) {
    throw new ErrorOrganizacion('BORRADORES_INVALIDOS', 'Hay ids duplicados en la lista de reordenamiento.', {});
  }
  if (conjuntoActual.size !== conjuntoPedido.size ||
      ![...conjuntoActual].every((id) => conjuntoPedido.has(id))) {
    throw new ErrorOrganizacion(
      'BORRADORES_INVALIDOS',
      'idsEnNuevoOrden debe contener EXACTAMENTE a los hermanos actuales (ni más ni menos).',
      { actuales: [...conjuntoActual], pedidos },
    );
  }

  let actualizadas = 0;
  for (let i = 0; i < pedidos.length; i++) {
    const id = pedidos[i];
    if (id === undefined) continue; // inalcanzable bajo el límite del bucle
    const actual = hermanos.find((h) => h.id === id)?.orden ?? null;
    if (actual !== i + 1) {
      await actualizarVerificado(db, tenantId, id, { orden: i + 1, updated_at: new Date().toISOString() }, 'reordenar');
      actualizadas += 1;
    }
  }

  const unidades = await listarUnidadesParaJerarquia({ tenantId, db });
  const numeracion = calcularNumeracion(aNodosJerarquia(unidades), fallbackInsercionDesde(unidades));
  const rutas: Record<string, string> = {};
  for (const id of pedidos) {
    const ruta = numeracion.get(id);
    if (ruta) rutas[id] = ruta.ruta;
  }
  return { actualizadas, numeracion: rutas };
}

/**
 * Mueve una unidad a otra rama (o a raíz) con prevención de ciclos: simula el
 * árbol resultante y exige detectarCiclos vacío. Conserva id, code y metadata.
 * El update principal (parent+orden) es atómico; los re-packs de orden de los
 * hermanos de origen/destino son cache de presentación (fallos informados sin
 * deshacer la jerarquía).
 */
export async function moverUnidad(opciones: {
  tenantId: string;
  unidadId: string;
  nuevoPadreId: string | null;
  posicion?: number | null;
  db?: AdaptadorBD;
  verificarAutorizacion?: (tenantId: string) => boolean | Promise<boolean>;
}): Promise<{ unidadId: string; parentUnitId: string | null; orden: number; ruta: string; ordenesRepack: number }> {
  const tenantId = validarTenantId(opciones.tenantId);
  await verificarAcceso(opciones, tenantId);
  const db = opciones.db ?? obtenerAdaptadorPorDefecto();
  await exigirColumnaOrden(db);

  const unidad = await leerUnidadPorIdYTenant(db, opciones.unidadId, tenantId);
  if (unidad === null) {
    throw new ErrorOrganizacion(
      'FUERA_DE_TENANT',
      `La unidad "${opciones.unidadId}" no pertenece al tenant "${tenantId}" o no existe.`,
      { unidadId: opciones.unidadId, tenantId },
    );
  }
  const padreAnterior = unidad['parent_unit_id'] == null ? null : String(unidad['parent_unit_id']);
  const nuevoPadre = opciones.nuevoPadreId;
  if (nuevoPadre !== null && nuevoPadre === opciones.unidadId) {
    throw new ErrorOrganizacion('CICLO_ORGANIZACIONAL', 'Una unidad no puede ser su propio padre.', { unidadId: opciones.unidadId });
  }
  if (nuevoPadre !== null) {
    await exigirPadreDelTenant(db, nuevoPadre, tenantId);
  }

  // Prevención de ciclos: árbol vigente con el movimiento propuesto aplicado.
  const unidades = await listarUnidadesParaJerarquia({ tenantId, db });
  const nodosPropuestos: NodoJerarquia[] = unidades.map((u) =>
    u.id === opciones.unidadId
      ? { id: u.id, parentUnitId: nuevoPadre, orden: u.orden }
      : { id: u.id, parentUnitId: u.parentUnitId, orden: u.orden },
  );
  const ciclos = detectarCiclos(nodosPropuestos);
  if (ciclos.includes(opciones.unidadId)) {
    throw new ErrorOrganizacion(
      'CICLO_ORGANIZACIONAL',
      `Mover "${opciones.unidadId}" bajo "${nuevoPadre ?? 'raíz'}" crearía un ciclo ` +
      '(el nuevo padre está dentro del subárbol propio).',
      { unidadId: opciones.unidadId, nuevoPadreId: nuevoPadre, ciclos },
    );
  }

  // Orden en destino: insertar en `posicion` (default: al final) y re-pack.
  const hermanosDestino = (await leerHermanos(db, tenantId, nuevoPadre)).filter((h) => h.id !== opciones.unidadId);
  const posicion = opciones.posicion ?? null;
  let ordenDestino = hermanosDestino.length + 1;
  if (posicion !== null) {
    if (!Number.isInteger(posicion) || posicion < 1) {
      throw new ErrorOrganizacion('ORDEN_ACTUALIZACION', 'La posición debe ser un entero ≥ 1.', { posicion });
    }
    ordenDestino = Math.min(posicion, hermanosDestino.length + 1);
  }
  hermanosDestino.splice(ordenDestino - 1, 0, { id: opciones.unidadId, orden: ordenDestino });

  await actualizarVerificado(
    db, tenantId, opciones.unidadId,
    { parent_unit_id: nuevoPadre, orden: ordenDestino, updated_at: new Date().toISOString() },
    'mover (jerarquía)',
  );

  // Re-pack de presentación: destino y origen (solo filas cuyo orden cambió).
  let ordenesRepack = 0;
  const reempaquetar = async (hermanos: HermanoActual[], contexto: string): Promise<void> => {
    for (let i = 0; i < hermanos.length; i++) {
      const hermano = hermanos[i];
      if (hermano === undefined) continue;
      if (hermano.id === opciones.unidadId) continue;
      if (hermano.orden !== i + 1) {
        await actualizarVerificado(db, tenantId, hermano.id, { orden: i + 1, updated_at: new Date().toISOString() }, contexto);
        ordenesRepack += 1;
      }
    }
  };
  try {
    await reempaquetar(hermanosDestino, 're-pack destino');
    if (padreAnterior !== nuevoPadre) {
      const hermanosOrigen = await leerHermanos(db, tenantId, padreAnterior);
      await reempaquetar(hermanosOrigen, 're-pack origen');
    }
  } catch (error) {
    if (error instanceof ErrorOrganizacion && error.codigoError === 'FUERA_DE_TENANT') throw error;
    throw new ErrorOrganizacion(
      'ORDEN_ACTUALIZACION',
      `La jerarquía quedó movida, pero un re-pack de orden falló (${mensajeDe(error)}): ` +
      'la presentación de orden puede estar desalineada (la numeración se recalcula igualmente).',
      { unidadId: opciones.unidadId, causaOriginal: mensajeDe(error) },
    );
  }

  const unidadesTras = await listarUnidadesParaJerarquia({ tenantId, db });
  const numeracionTras = calcularNumeracion(aNodosJerarquia(unidadesTras), fallbackInsercionDesde(unidadesTras));
  const rutaTras = numeracionTras.get(opciones.unidadId);
  return {
    unidadId: opciones.unidadId,
    parentUnitId: nuevoPadre,
    orden: ordenDestino,
    ruta: rutaTras?.ruta ?? '',
    ordenesRepack,
  };
}

/** Renombra una unidad (muta name; id, code, metadata y jerarquía intactos). */
export async function renombrarUnidad(opciones: {
  tenantId: string;
  unidadId: string;
  nuevoNombre: string;
  db?: AdaptadorBD;
  verificarAutorizacion?: (tenantId: string) => boolean | Promise<boolean>;
}): Promise<{ unidadId: string; name: string }> {
  const tenantId = validarTenantId(opciones.tenantId);
  await verificarAcceso(opciones, tenantId);
  const db = opciones.db ?? obtenerAdaptadorPorDefecto();
  const nombre = validarNombre(opciones.nuevoNombre);
  await actualizarVerificado(
    db, tenantId, opciones.unidadId,
    { name: nombre, updated_at: new Date().toISOString() },
    'renombrar',
  );
  return { unidadId: opciones.unidadId, name: nombre };
}
