/**
 * contextoSesion.ts
 * =================
 * Contexto de AUTENTICACIÓN y AUTORIZACIÓN del módulo, integrado con Qaway Hub
 * (Etapa 4). NO crea mecanismos paralelos: reutiliza la infraestructura de
 * plataforma verificada del Hub:
 *
 *   · Sesión: `auth.users`, vía el cliente Supabase COMPARTIDO
 *     (supabaseClient.ts sin storageKey propio ⇒ misma sesión localStorage que
 *     `src/config/supabase.js` del Hub ⇒ el MISMO `auth.uid()`).
 *   · Empresa activa: `public.users.tenant_id` (lo que devuelve el helper
 *     SQL `get_auth_tenant_id()`; migración 20260919153000:20-28).
 *   · Acceso a la app: RPC `user_can_use_app('gestor-proyectos')` — exige rol
 *     de app Y suscripción active/trialing (20260921130000:94-127).
 *   · Rol de app: RPC `user_app_role('gestor-proyectos')` ⇒ admin|editor|viewer|guest.
 *   · Plataforma: `public.users.is_platform_admin`.
 *
 * Fail-closed: sin sesión, sin acceso a la app o sin rol suficiente, la
 * operación se deniega. Un `tenantId` recibido como parámetro NUNCA sustituye
 * a la identidad real (TENANT_AJENO). El slug 'gestor-proyectos' debe existir
 * en `app_catalog` (migración 0006a): sin él, el acceso de empresa se deniega
 * y solo la plataforma opera (comportamiento correcto, no un error).
 *
 * Nota Etapa 4: las pruebas REALES de RLS (identidades vivas) son un
 * procedimiento manual en Supabase (doc2/3.9); aquí se prueban los evaluadores
 * y el cableado con clientes falsos, sin red.
 */

import { supabase } from './supabaseClient';
import { getSesionCompartida, consultaCacheada, invalidarCacheAcceso } from '../../../../../router/sessionCache';

/** Slug de la app en public.app_catalog (migración 0006a). */
export const APP_SLUG = 'gestor-proyectos';

const ROLES_VALIDOS: readonly string[] = ['admin', 'editor', 'viewer', 'guest'];

export type RolApp = 'admin' | 'editor' | 'viewer' | 'guest';

export interface ContextoSesion {
  /** auth.users.id = auth.uid() de la sesión compartida con el Hub. */
  userId: string;
  email: string | null;
  /** public.users.tenant_id (uuid-text; NULL en cuentas de plataforma). */
  tenantId: string | null;
  /** public.users.is_platform_admin. */
  esPlataforma: boolean;
  /** RPC user_app_role(APP_SLUG): null si no tiene rol de la app. */
  rolApp: RolApp | null;
  /** RPC user_can_use_app(APP_SLUG): rol + suscripción active/trialing. */
  puedeUsarApp: boolean;
}

export type CodigoErrorSesion =
  | 'SIN_SESION'
  | 'SIN_ACCESO_APP'
  | 'ROL_INSUFICIENTE'
  | 'TENANT_AJENO'
  | 'CLIENTE_INDISPONIBLE'
  | 'RPC_INDISPONIBLE';

export class ErrorSesion extends Error {
  readonly codigo: CodigoErrorSesion;

  constructor(codigo: CodigoErrorSesion, message: string) {
    super(message);
    this.name = 'ErrorSesion';
    this.codigo = codigo;
  }
}

// ---------------------------------------------------------------------------
// Evaluadores de autorización (PUROS: testear sin red, decidir sin cliente)
// ---------------------------------------------------------------------------

export type EvaluacionAcceso =
  | { ok: true; ctx: ContextoSesion }
  | { ok: false; codigo: CodigoErrorSesion; mensaje: string };

/** Lectura: plataforma ⇒ todo; empresa ⇒ acceso a la app + tenant asignado. */
export function evaluarLectura(ctx: ContextoSesion | null): EvaluacionAcceso {
  if (!ctx) {
    return {
      ok: false,
      codigo: 'SIN_SESION',
      mensaje: 'No hay sesión activa de Qaway Hub: inicia sesión para consultar unidades.',
    };
  }
  if (ctx.esPlataforma) return { ok: true, ctx };
  if (!ctx.puedeUsarApp) {
    return {
      ok: false,
      codigo: 'SIN_ACCESO_APP',
      mensaje: 'La cuenta no tiene acceso autorizado a Gestor de Proyectos (rol de app y/o suscripción).',
    };
  }
  if (!ctx.tenantId) {
    return {
      ok: false,
      codigo: 'SIN_ACCESO_APP',
      mensaje: 'La cuenta autenticada no tiene empresa asignada (public.users.tenant_id NULL).',
    };
  }
  return { ok: true, ctx };
}

/**
 * Escritura: plataforma ⇒ todo (incluido catálogo nacional y otras empresas).
 * Empresa ⇒ acceso a la app + rol admin|editor + tenant asignado + coherencia:
 * un tenantId del parámetro distinto a la empresa autenticada ⇒ TENANT_AJENO.
 */
export function evaluarEscritura(ctx: ContextoSesion | null, tenantIdParam?: string | null): EvaluacionAcceso {
  if (!ctx) {
    return {
      ok: false,
      codigo: 'SIN_SESION',
      mensaje: 'No hay sesión activa de Qaway Hub: inicia sesión para administrar unidades.',
    };
  }
  if (ctx.esPlataforma) return { ok: true, ctx };
  if (!ctx.puedeUsarApp) {
    return {
      ok: false,
      codigo: 'SIN_ACCESO_APP',
      mensaje: 'La cuenta no tiene acceso autorizado a Gestor de Proyectos (rol de app y/o suscripción).',
    };
  }
  if (ctx.rolApp !== 'admin' && ctx.rolApp !== 'editor') {
    return {
      ok: false,
      codigo: 'ROL_INSUFICIENTE',
      mensaje: `El rol "${ctx.rolApp ?? 'sin rol'}" no puede escribir unidades (se requiere admin o editor).`,
    };
  }
  if (!ctx.tenantId) {
    return {
      ok: false,
      codigo: 'SIN_ACCESO_APP',
      mensaje: 'La cuenta autenticada no tiene empresa asignada (public.users.tenant_id NULL).',
    };
  }
  const pedido = typeof tenantIdParam === 'string' ? tenantIdParam.trim() : '';
  if (pedido !== '' && pedido !== ctx.tenantId) {
    return {
      ok: false,
      codigo: 'TENANT_AJENO',
      mensaje:
        `El tenantId del parámetro ("${pedido}") no es la empresa autenticada ("${ctx.tenantId}"): ` +
        'la identidad real no puede sustituirse por parámetro.',
    };
  }
  return { ok: true, ctx };
}

// ---------------------------------------------------------------------------
// Resolución del contexto (sesión compartida del Hub, con caché invalidable)
// ---------------------------------------------------------------------------

let valorCache: ContextoSesion | null | undefined = undefined;
let enVuelo: Promise<ContextoSesion | null> | null = null;

// Usuario de la sesión: UNA SOLA llamada getUser compartida por todo el flujo
// del Gestor (contexto + aviso de cambio de clave en App.tsx). Antes se pedía
// dos veces: aquí y en App.tsx:157. Se renueva solo al cambiar la identidad.
export interface UsuarioSesion {
  id: string;
  email: string | null;
  user_metadata: Record<string, unknown>;
}

let usuarioCache: UsuarioSesion | null | undefined = undefined;
let usuarioEnVuelo: Promise<UsuarioSesion | null> | null = null;

export async function obtenerUsuarioSesion(): Promise<UsuarioSesion | null> {
  if (usuarioCache !== undefined) return usuarioCache;
  if (!supabase) return null; // modo local / pruebas sin cliente
  if (!usuarioEnVuelo) {
    usuarioEnVuelo = getSesionCompartida()
      .then(async ({ data: sesData }) => {
        const sUser = sesData?.session?.user ?? null;
        if (sUser) {
          usuarioCache = {
            id: sUser.id,
            email: typeof sUser.email === 'string' ? sUser.email : null,
            user_metadata: (sUser.user_metadata ?? {}) as Record<string, unknown>,
          };
          return usuarioCache;
        }
        const { data, error } = await supabase!.auth.getUser();
        if (error) {
          throw new ErrorSesion('SIN_SESION', `No se pudo validar la sesión de Qaway Hub: ${error.message}`);
        }
        const u = data?.user ?? null;
        usuarioCache = u
          ? {
              id: u.id,
              email: typeof u.email === 'string' ? u.email : null,
              user_metadata: (u.user_metadata ?? {}) as Record<string, unknown>,
            }
          : null;
        return usuarioCache;
      })
      .finally(() => {
        usuarioEnVuelo = null;
      });
  }
  return usuarioEnVuelo;
}

/** Fuerza una nueva lectura del usuario (cambio de identidad). */
export function invalidarUsuarioSesion(): void {
  usuarioCache = undefined;
  usuarioEnVuelo = null;
  invalidarCacheAcceso();
}

async function resolver(): Promise<ContextoSesion | null> {
  if (!supabase) return null; // modo local / pruebas sin cliente: sin contexto real
  const usuario = await obtenerUsuarioSesion();
  if (!usuario) return null;

  // Perfil de plataforma (compartido con HubAccessGuard via consultaCacheada) + RPCs en paralelo.
  const [perfilRes, rolRes, usoRes] = await Promise.all([
    consultaCacheada(
      `user:${usuario.id}`,
      () => supabase!.from('users').select('id, full_name, last_name, email, role, is_platform_admin, tenant_id, avatar_url').eq('id', usuario.id).maybeSingle(),
    ),
    supabase.rpc('user_app_role', { p_app_slug: APP_SLUG }),
    supabase.rpc('user_can_use_app', { p_app_slug: APP_SLUG }),
  ]);
  if (perfilRes.error) {
    throw new ErrorSesion('SIN_SESION', `No se pudo leer el perfil public.users: ${perfilRes.error.message}`);
  }
  if (rolRes.error) {
    throw new ErrorSesion('RPC_INDISPONIBLE', `RPC user_app_role no disponible: ${rolRes.error.message}`);
  }
  if (usoRes.error) {
    throw new ErrorSesion('RPC_INDISPONIBLE', `RPC user_can_use_app no disponible: ${usoRes.error.message}`);
  }
  const perfil = (perfilRes.data ?? null) as { tenant_id?: unknown; is_platform_admin?: unknown } | null;
  const rolBruto = typeof rolRes.data === 'string' ? rolRes.data : null;
  const rol: RolApp | null = rolBruto !== null && ROLES_VALIDOS.includes(rolBruto) ? (rolBruto as RolApp) : null;
  return {
    userId: usuario.id,
    email: typeof usuario.email === 'string' ? usuario.email : null,
    tenantId: perfil?.tenant_id == null ? null : String(perfil.tenant_id),
    esPlataforma: perfil?.is_platform_admin === true,
    rolApp: rol,
    puedeUsarApp: usoRes.data === true,
  };
}

/**
 * Resuelve el contexto de la sesión compartida del Hub.
 * · Sin cliente (tests/modo local) ⇒ null (fail-closed para el llamador).
 * · Sin usuario ⇒ null.
 * · Error de infraestructura (RPC indisponible) ⇒ LANZA RPC_INDISPONIBLE
 *   (nunca se falsea un veredicto de autorización por un fallo técnico).
 * Caché en memoria; se invalida al cambiar la sesión (onAuthStateChange).
 */
export async function resolverContextoSesion(): Promise<ContextoSesion | null> {
  if (valorCache !== undefined) return valorCache;
  if (!enVuelo) {
    enVuelo = resolver()
      .then((ctx) => {
        valorCache = ctx;
        return ctx;
      })
      .finally(() => {
        enVuelo = null;
      });
  }
  return enVuelo;
}

/** Fuerza re-resolución (cambio de sesión, pruebas). */
export function invalidarContexto(): void {
  valorCache = undefined;
  enVuelo = null;
}

// Invalidación automática al cambiar la sesión del Hub (misma sesión compartida).
if (supabase) {
  try {
    supabase.auth.onAuthStateChange((evento) => {
      if (evento === 'SIGNED_IN' || evento === 'SIGNED_OUT' || evento === 'USER_UPDATED') {
        invalidarContexto();
        invalidarUsuarioSesion();
      }
    });
  } catch {
    // Entornos sin auth real (pruebas): sin invalidación automática.
  }
}

// ---------------------------------------------------------------------------
// Exigencias fail-closed y callback compatible con el contrato de Etapa 2b
// ---------------------------------------------------------------------------

/** Exige un contexto VÁLIDO para lectura; ErrorSesion si no. */
export async function exigirContextoLectura(): Promise<ContextoSesion> {
  const ctx = await resolverContextoSesion();
  const evaluacion = evaluarLectura(ctx);
  if (!evaluacion.ok) throw new ErrorSesion(evaluacion.codigo, evaluacion.mensaje);
  return evaluacion.ctx;
}

/** Exige un contexto VÁLIDO para escritura sobre `tenantIdParam`; ErrorSesion si no. */
export async function exigirContextoEscritura(tenantIdParam?: string | null): Promise<ContextoSesion> {
  const ctx = await resolverContextoSesion();
  const evaluacion = evaluarEscritura(ctx, tenantIdParam);
  if (!evaluacion.ok) throw new ErrorSesion(evaluacion.codigo, evaluacion.mensaje);
  return evaluacion.ctx;
}

/**
 * Callback de autorización compatible con `VerificacionAcceso.verificarAutorizacion`
 * (organizacionEscritura, contrato Etapa 2b): true solo si la sesión real del Hub
 * puede escribir sobre `tenantId`. Los fallos de infraestructura (RPC) se propagan;
 * los veredictos de denegación devuelven false (fail-closed).
 */
export async function verificarAutorizacionSesion(tenantId: string): Promise<boolean> {
  const ctx = await resolverContextoSesion();
  const evaluacion = evaluarEscritura(ctx, tenantId);
  if (evaluacion.ok) return true;
  return false; // SIN_SESION / SIN_ACCESO_APP / ROL_INSUFICIENTE / TENANT_AJENO ⇒ denegado
}
