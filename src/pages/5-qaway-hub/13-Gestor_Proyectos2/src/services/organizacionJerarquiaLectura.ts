/**
 * organizacionJerarquiaLectura.ts
 * ===============================
 * Lectura jerárquica de `gestor_unidades` + infraestructura común de acceso a
 * datos (AdaptadorBD inyectable) usada también por organizacionEscritura.ts.
 * Justificación de la integración: lectura y escritura comparten la única vía
 * de acceso a BD del subsistema (inyectable para pruebas sin red) y la lectura
 * jerárquica es la base de las operaciones de escritura (crearHija, mover,
 * reordenar necesitan el árbol y los hermanos vigentes).
 *
 * Reglas clave (Etapa 2, aprobadas):
 *   · La lectura tolera que la columna `orden` (migración 0005) aún no exista,
 *     PERO la degradación es EXPLÍCITA: cada fila devuelve
 *     `ordenDisponible: false` y `orden: null` — nunca silenciosa.
 *   · La ESCRITURA (organizacionEscritura.ts) SÍ bloquea con error si `orden`
 *     no existe (ErrorOrganizacion codigoError 'MIGRACION_0005_PENDIENTE').
 *   · Con adaptador inyectado (pruebas): con tenantId se filtra por `tenant_id`
 *     (aislamiento); sin tenantId → vista global del adaptador (incluye las 251
 *     semillas con tenant_id NULL). Contrato Etapa 2b intacto.
 *   · RUNTIME (sin adaptador): la vista la define la sesión REAL del Hub
 *     (Etapa 4): plataforma → todas (o el tenant pedido); empresa autorizada →
 *     SOLO su empresa (el catálogo nacional NO se mezcla aquí para no corromper
 *     la numeración 1..n entre raíces). Sin sesión → ErrorSesion fail-closed.
 */

import type { FallbackInsercion, NodoJerarquia } from './organizacionJerarquia';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { exigirContextoLectura, ErrorSesion } from './contextoSesion';

export const TABLA_UNIDADES = 'gestor_unidades';

const COLUMNAS_JERARQUIA = 'id,tenant_id,parent_unit_id,name,code,unit_type,orden,created_at';
const COLUMNAS_SIN_ORDEN = 'id,tenant_id,parent_unit_id,name,code,unit_type,created_at';

// ---------------------------------------------------------------------------
// Adaptador de BD (inyectable; supabase-js solo vía crearAdaptadorSupabase)
// ---------------------------------------------------------------------------

export type FilaBD = { [columna: string]: unknown };

export interface ConsultaSeleccion {
  columnas: string;
  eq?: Array<readonly [string, unknown]>;
  /** Columnas con filtro IS NULL (p. ej. parent_unit_id para raíces). */
  isNull?: string[];
  in?: Array<readonly [string, unknown[]]>;
  limit?: number;
  orden?: { columna: string; ascendente?: boolean };
}

export interface AdaptadorBD {
  seleccionar(tabla: string, consulta: ConsultaSeleccion): Promise<FilaBD[]>;
  /** INSERT de UNA fila (nunca upsert); devuelve la fila insertada; error ⇒ throw. */
  insertar(tabla: string, fila: FilaBD): Promise<FilaBD>;
  /** UPDATE filtrado; devuelve las filas actualizadas (0 filas = filtro sin match). */
  actualizar(tabla: string, parche: FilaBD, filtros: { eq: Array<readonly [string, unknown]> }): Promise<FilaBD[]>;
  /** DELETE filtrado; devuelve las filas borradas (0 filas = filtro sin match). */
  eliminar(tabla: string, filtros: { eq: Array<readonly [string, unknown]> }): Promise<FilaBD[]>;
}

/** Error de BD envuelto: conserva el código PG/PostgREST cuando exista. */
export class ErrorBD extends Error {
  readonly codigo: string | undefined;
  readonly detalles: unknown;

  constructor(origen: unknown) {
    const o = (origen ?? {}) as { message?: unknown; code?: unknown; details?: unknown };
    const mensaje = typeof o.message === 'string' && o.message.length > 0 ? o.message : 'Error de base de datos';
    super(mensaje);
    this.name = 'ErrorBD';
    this.codigo = typeof o.code === 'string' ? o.code : undefined;
    this.detalles = o.details;
  }
}

/** true si el error indica que una columna aún no existe (42703 / PostgREST). */
export function esErrorColumnaAusente(error: unknown): boolean {
  if (!(error instanceof ErrorBD)) return false;
  if (error.codigo === '42703') return true;
  return /does not exist|could not find the/i.test(error.message);
}

/**
 * Adaptador sobre supabase-js. Cast local a `any` del builder: la API usada
 * está acotada por la interfaz AdaptadorBD (select/insert/update/delete sin
 * upsert). Misma convención que gestorOrganizacionService (row: any).
 */
export function crearAdaptadorSupabase(cliente: SupabaseClient): AdaptadorBD {
  return {
    async seleccionar(tabla, consulta) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let builder: any = cliente.from(tabla).select(consulta.columnas);
      for (const [col, valor] of consulta.eq ?? []) builder = builder.eq(col, valor);
      for (const col of consulta.isNull ?? []) builder = builder.is(col, null);
      for (const [col, valores] of consulta.in ?? []) builder = builder.in(col, valores);
      if (consulta.orden) builder = builder.order(consulta.orden.columna, { ascending: consulta.orden.ascendente ?? true });
      if (consulta.limit !== undefined) builder = builder.limit(consulta.limit);
      const { data, error } = await builder;
      if (error) throw new ErrorBD(error);
      return (data ?? []) as FilaBD[];
    },
    async insertar(tabla, fila) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let builder: any = cliente.from(tabla).insert(fila);
      const { data, error } = await builder.select().single();
      if (error) throw new ErrorBD(error);
      return data as FilaBD;
    },
    async actualizar(tabla, parche, filtros) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let builder: any = cliente.from(tabla).update(parche);
      for (const [col, valor] of filtros.eq) builder = builder.eq(col, valor);
      const { data, error } = await builder.select();
      if (error) throw new ErrorBD(error);
      return (data ?? []) as FilaBD[];
    },
    async eliminar(tabla, filtros) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let builder: any = cliente.from(tabla).delete();
      for (const [col, valor] of filtros.eq) builder = builder.eq(col, valor);
      const { data, error } = await builder.select();
      if (error) throw new ErrorBD(error);
      return (data ?? []) as FilaBD[];
    },
  };
}

let adaptadorPorDefecto: AdaptadorBD | null = null;

/** Adaptador por defecto (lazy) sobre el cliente Supabase del módulo. */
export function obtenerAdaptadorPorDefecto(): AdaptadorBD {
  if (!adaptadorPorDefecto) {
    if (!supabase) {
      throw new ErrorBD({ message: 'Supabase no está disponible (modo local sin cliente). Provee un AdaptadorBD inyectado.' });
    }
    adaptadorPorDefecto = crearAdaptadorSupabase(supabase);
  }
  return adaptadorPorDefecto;
}

// ---------------------------------------------------------------------------
// Lectura jerárquica
// ---------------------------------------------------------------------------

export interface UnidadJerarquia {
  id: string;
  tenantId: string | null;
  parentUnitId: string | null;
  name: string;
  code: string;
  unitType: string;
  /** Orden entre hermanos (migración 0005). NULL si sin orden o columna ausente. */
  orden: number | null;
  createdAt: string | null;
  /** false = la columna orden NO existe aún (0005 pendiente): degradación explícita. */
  ordenDisponible: boolean;
}

function mapearUnidadJerarquia(fila: FilaBD, ordenDisponible: boolean): UnidadJerarquia {
  const ordenBruta = fila['orden'];
  return {
    id: String(fila['id']),
    tenantId: fila['tenant_id'] == null ? null : String(fila['tenant_id']),
    parentUnitId: fila['parent_unit_id'] == null ? null : String(fila['parent_unit_id']),
    name: String(fila['name']),
    code: String(fila['code']),
    unitType: String(fila['unit_type'] ?? 'other'),
    orden:
      ordenDisponible && typeof ordenBruta === 'number' && Number.isFinite(ordenBruta) ? ordenBruta : null,
    createdAt: typeof fila['created_at'] === 'string' ? (fila['created_at'] as string) : null,
    ordenDisponible,
  };
}

/** Ruta por adaptador (inyectado en pruebas; contrato Etapa 2b intacto). */
async function listarViaAdaptador(db: AdaptadorBD, tenantId?: string | null): Promise<UnidadJerarquia[]> {
  const filtros: ConsultaSeleccion = { columnas: COLUMNAS_JERARQUIA };
  if (tenantId != null) filtros.eq = [['tenant_id', tenantId]];

  let filas: FilaBD[];
  let ordenDisponible = true;
  try {
    filas = await db.seleccionar(TABLA_UNIDADES, filtros);
  } catch (error) {
    if (!esErrorColumnaAusente(error)) throw error;
    ordenDisponible = false;
    filas = await db.seleccionar(TABLA_UNIDADES, { ...filtros, columnas: COLUMNAS_SIN_ORDEN });
  }
  return filas.map((fila) => mapearUnidadJerarquia(fila, ordenDisponible));
}

/**
 * Lista unidades con los campos necesarios para la numeración jerárquica.
 * Si la columna `orden` no existe (0005 pendiente), re-lee SIN `orden` y marca
 * `ordenDisponible: false` en todas las filas (degradación explícita, no silenciosa).
 *
 * Etapa 4: sin `db` inyectada (RUNTIME) la vista la define la sesión real:
 *  · plataforma → todas las unidades, o solo las del tenant pedido;
 *  · empresa autorizada → SOLO las unidades de su empresa (exigirContextoLectura
 *    valida sesión + acceso a la app; las 251 semillas NO se mezclan aquí para
 *    no corromper la numeración 1..n entre raíces del tenant);
 *  · tenantId de parámetro ≠ empresa autenticada ⇒ TENANT_AJENO (el parámetro
 *    nunca sustituye a la identidad);
 *  · sin sesión ⇒ ErrorSesion SIN_SESION (fail-closed; nunca vista global).
 */
export async function listarUnidadesParaJerarquia(
  opciones?: { tenantId?: string | null; db?: AdaptadorBD },
): Promise<UnidadJerarquia[]> {
  if (opciones?.db) return listarViaAdaptador(opciones.db, opciones.tenantId);
  const ctx = await exigirContextoLectura();
  const pedido =
    typeof opciones?.tenantId === 'string' && opciones.tenantId.trim() !== '' ? opciones.tenantId.trim() : null;
  if (ctx.esPlataforma) return listarViaAdaptador(obtenerAdaptadorPorDefecto(), pedido);
  if (pedido !== null && pedido !== ctx.tenantId) {
    throw new ErrorSesion(
      'TENANT_AJENO',
      `El tenantId del parámetro ("${pedido}") no es la empresa autenticada ("${ctx.tenantId ?? 'sin tenant'}").`,
    );
  }
  return listarViaAdaptador(obtenerAdaptadorPorDefecto(), ctx.tenantId);
}

/** Convierte filas de jerarquía en la entrada pura de calcularNumeracion. */
export function aNodosJerarquia(unidades: UnidadJerarquia[]): NodoJerarquia[] {
  return unidades.map((u) => ({ id: u.id, parentUnitId: u.parentUnitId, orden: u.orden }));
}

/** Comparación por unidades de código UTF-16 (idéntica a organizacionJerarquia). */
function compararTexto(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Fallback de inserción determinista: ordena por (created_at, id) y devuelve
 * id → índice (0,1,2…). created_at ISO compara lexicográficamente de forma estable.
 */
export function fallbackInsercionDesde(unidades: UnidadJerarquia[]): FallbackInsercion {
  const ordenadas = [...unidades].sort((a, b) => {
    const ca = a.createdAt ?? '';
    const cb = b.createdAt ?? '';
    if (ca !== cb) return ca < cb ? -1 : 1;
    return compararTexto(a.id, b.id);
  });
  const mapa = new Map<string, number>();
  ordenadas.forEach((u, i) => mapa.set(u.id, i));
  return mapa;
}
