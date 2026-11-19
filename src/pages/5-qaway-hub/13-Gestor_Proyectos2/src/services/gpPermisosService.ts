/**
 * gpPermisosService.ts — Etapa 6-B
 * ================================
 * Permisos granulares del modelo del Gestor de Proyectos (decisión del
 * responsable, 17-nov), codificados TAL CUAL:
 *
 *   · La PLATAFORMA accede a todo.
 *   · El tenant admin es el ÚNICO admin de su empresa (rol 'admin' de la app).
 *   · Roles de empresa: admin | editor | operativo | visor (visor no modifica nada).
 *   · Los permisos DELICADOS nunca vienen en el rol grueso: viven en
 *     `user_app_roles.permissions` (jsonb) — llaves v1:
 *       gp.crear_proyecto · gp.editar_proyecto · gp.administrar_edt · gp.registrar_personas
 *   · "Totales" = editor + todas las llaves.
 *   · Tareas: todos los roles de escritura (admin/editor/operativo) crean tareas;
 *     admin/editor editan ajenas; cada quien edita lo suyo (created_by).
 *   · EDT = DELICADO (admin o gp.administrar_edt).
 *
 * Lectura del perfil: fila PROPIA de public.user_app_roles (RLS `uar_own_read`:
 * user_id = auth.uid()) filtrada por app_id = app_catalog('gestor-proyectos').
 * Sin DDL nuevo: las políticas vivas del Hub bastan. El ADMIN de tenant lee a
 * los usuarios de su empresa (RLS `users_tenant_read`) y edita sus roles
 * (RLS `uar_tenant_admin_manage`) — la pantalla de permisos curables escribe
 * directo, y la DB sigue siendo el mando real (el gating de UI es UX).
 *
 * Sesión: reutiliza resolverContextoSesion() (Etapa 4). SIN sesión (modo local
 * explícito del shell) el servicio devuelve null y el llamador mantiene su
 * comportamiento actual. CON sesión sin rol legible ⇒ capacidades de solo
 * lectura (fail-closed).
 *
 * Normalización de vocabulario: el Hub nombra roles viewer/guest; el Gestor usa
 * visor/operativo. Solo-lectura reconocida: visor | viewer | guest. Escritura:
 * admin | editor | operativo. Cualquier otro valor (o rol ausente) ⇒ solo lectura.
 */

import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { APP_SLUG, resolverContextoSesion } from './contextoSesion';

/** Llaves delicadas v1 (curables por el admin de la empresa en la UI). */
export const LLAVES_V1 = [
  'gp.crear_proyecto',
  'gp.editar_proyecto',
  'gp.administrar_edt',
  'gp.registrar_personas',
] as const;

export type LlavePermiso = (typeof LLAVES_V1)[number];

/** Vocabulario oficial del Gestor para roles de empresa. */
export const ROLES_GP = ['admin', 'editor', 'operativo', 'visor'] as const;

export type RolGp = (typeof ROLES_GP)[number];

const ROLES_SOLO_LECTURA: readonly string[] = ['visor', 'viewer', 'guest'];
const ROLES_ESCRITURA: readonly string[] = ['admin', 'editor', 'operativo'];

export interface PerfilGp {
  userId: string;
  tenantId: string | null;
  esPlataforma: boolean;
  /** Rol crudo en user_app_roles para la app gestor-proyectos (null si no tiene fila). */
  rol: string | null;
  /** Llaves delicadas resueltas del jsonb permissions (curadas por el admin). */
  permisos: string[];
}

export interface CapacidadesGp {
  crearProyecto: boolean;
  editarProyecto: boolean;
  administrarEdt: boolean;
  registrarPersonas: boolean;
  crearTarea: boolean;
  editarTareaAjena: boolean;
  editarPropio: boolean;
  /** Administra la pestaña Permisos (tenant admin o plataforma). */
  administrarPermisos: boolean;
}

// ---------------------------------------------------------------------------
// Capa PURA (sin red): normalización y matriz del modelo
// ---------------------------------------------------------------------------

/**
 * `permissions` jsonb: se acepta el shape OBJETO ({"gp.x": true}) — el vivo hoy —
 * y por robustez también array de strings. Nunca se inventan llaves.
 */
export function permisosDesdeJsonb(valor: unknown): string[] {
  if (Array.isArray(valor)) {
    return valor.filter((v): v is string => typeof v === 'string' && v.trim() !== '');
  }
  if (valor && typeof valor === 'object') {
    return Object.entries(valor as Record<string, unknown>)
      .filter(([, v]) => v !== false && v !== null && v !== undefined)
      .map(([k]) => k)
      .filter((k) => k.trim() !== '');
  }
  return [];
}

const CAPACIDADES_VACIAS: CapacidadesGp = {
  crearProyecto: false,
  editarProyecto: false,
  administrarEdt: false,
  registrarPersonas: false,
  crearTarea: false,
  editarTareaAjena: false,
  editarPropio: false,
  administrarPermisos: false,
};

const CAPACIDADES_TOTALES: CapacidadesGp = {
  crearProyecto: true,
  editarProyecto: true,
  administrarEdt: true,
  registrarPersonas: true,
  crearTarea: true,
  editarTareaAjena: true,
  editarPropio: true,
  administrarPermisos: true,
};

/** Matriz del modelo (pura, testeable). `conSesion=false` ⇒ fail-closed total. */
export function capacidadesDe(
  rol: string | null,
  permisos: readonly string[],
  esPlataforma: boolean,
  conSesion = true,
): CapacidadesGp {
  if (!conSesion) return CAPACIDADES_VACIAS;
  if (esPlataforma) return CAPACIDADES_TOTALES;
  if (rol === 'admin') return CAPACIDADES_TOTALES; // único admin de su empresa
  if (ROLES_SOLO_LECTURA.includes(rol ?? '')) return CAPACIDADES_VACIAS;
  if (!ROLES_ESCRITURA.includes(rol ?? '')) return CAPACIDADES_VACIAS; // rol nulo/desconocido
  const llaves = new Set(permisos);
  return {
    crearProyecto: llaves.has('gp.crear_proyecto'),
    editarProyecto: llaves.has('gp.editar_proyecto'),
    administrarEdt: llaves.has('gp.administrar_edt'),
    registrarPersonas: llaves.has('gp.registrar_personas'),
    crearTarea: true,
    editarTareaAjena: rol === 'editor',
    editarPropio: true,
    administrarPermisos: false,
  };
}

// ---------------------------------------------------------------------------
// Perfil propio (caché invalidable, patrón contextoSesion)
// ---------------------------------------------------------------------------

let cachePerfil: PerfilGp | null | undefined = undefined;
let enVueloPerfil: Promise<PerfilGp | null> | null = null;

async function resolverPerfil(): Promise<PerfilGp | null> {
  if (!supabase) return null; // modo local / pruebas sin cliente
  let ctx: Awaited<ReturnType<typeof resolverContextoSesion>> = null;
  try {
    ctx = await resolverContextoSesion();
  } catch {
    return null; // sin sesión no hay perfil GP (fail-closed para el llamador)
  }
  if (!ctx) return null;
  const base: PerfilGp = {
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    esPlataforma: ctx.esPlataforma,
    rol: null,
    permisos: [],
  };
  const { data: app, error: appError } = await supabase
    .from('app_catalog')
    .select('id')
    .eq('slug', APP_SLUG)
    .maybeSingle();
  if (appError || !app) return base;
  const appId = String((app as { id?: unknown }).id ?? '');
  if (!appId) return base;
  const { data: fila, error: filaError } = await supabase
    .from('user_app_roles')
    .select('role,permissions')
    .eq('user_id', ctx.userId)
    .eq('app_id', appId)
    .maybeSingle();
  if (filaError || !fila) return base;
  const r = fila as { role?: unknown; permissions?: unknown };
  return {
    ...base,
    rol: typeof r.role === 'string' ? r.role : null,
    permisos: permisosDesdeJsonb(r.permissions),
  };
}

export async function cargarPerfilGp(): Promise<PerfilGp | null> {
  if (cachePerfil !== undefined) return cachePerfil;
  if (!enVueloPerfil) {
    enVueloPerfil = resolverPerfil()
      .then((p) => {
        cachePerfil = p;
        return p;
      })
      .finally(() => {
        enVueloPerfil = null;
      });
  }
  return enVueloPerfil;
}

/** Fuerza re-resolución (tras curar permisos o cambiar de sesión). */
export function invalidarPerfilGp(): void {
  cachePerfil = undefined;
  enVueloPerfil = null;
}

/** Tenant ya resuelto en caché, sin esperar la promesa (para claves de storage local). */
export function tenantIdGpEnCache(): string | null {
  return cachePerfil?.tenantId ?? null;
}

// La caché del perfil depende de la sesión del Hub: al cambiar de cuenta debe
// re-resolverse, o un tenant nuevo heredaría el tenant del perfil anterior.
if (supabase) {
  try {
    supabase.auth.onAuthStateChange(() => {
      invalidarPerfilGp();
    });
  } catch {}
}

/** Hook de lectura para pantallas: perfil + capacidades derivadas. */
export function usePerfilGp(): { perfil: PerfilGp | null; cargando: boolean; capacidades: CapacidadesGp } {
  const [perfil, setPerfil] = useState<PerfilGp | null | undefined>(undefined);
  useEffect(() => {
    let vigente = true;
    cargarPerfilGp().then((p) => {
      if (vigente) setPerfil(p);
    });
    return () => {
      vigente = false;
    };
  }, []);
  const cargando = perfil === undefined;
  return {
    perfil: perfil ?? null,
    cargando,
    capacidades: cargando
      ? CAPACIDADES_VACIAS
      : capacidadesDe(perfil!.rol, perfil!.permisos, perfil!.esPlataforma, true),
  };
}

// ---------------------------------------------------------------------------
// Administración de permisos (solo admin de la empresa / plataforma)
// ---------------------------------------------------------------------------

export interface UsuarioEmpresa {
  id: string;
  email: string | null;
  nombre: string | null;
  rol: string | null;
  permisos: string[];
  /** ¿Tiene fila en user_app_roles para esta app? */
  tieneFila: boolean;
}

export type ResultadoUsuarios =
  | { estado: 'lista'; usuarios: UsuarioEmpresa[] }
  | { estado: 'error'; mensaje: string };

/** Directorio de la empresa con su rol GP y llaves (RLS: users_tenant_read + uar_tenant_admin_manage). */
export async function listarUsuariosEmpresa(): Promise<ResultadoUsuarios> {
  if (!supabase) return { estado: 'error', mensaje: 'Sin cliente Supabase (modo local).' };
  const perfil = await cargarPerfilGp();
  if (!perfil) return { estado: 'error', mensaje: 'Sin sesión de Qaway Hub: inicia sesión para administrar permisos.' };
  if (!perfil.esPlataforma && perfil.rol !== 'admin') {
    return { estado: 'error', mensaje: 'Solo el admin de la empresa (o la plataforma) administra permisos.' };
  }
  if (!perfil.tenantId) {
    return { estado: 'error', mensaje: 'La cuenta no tiene empresa asignada (public.users.tenant_id NULL).' };
  }
  const { data: app, error: appError } = await supabase
    .from('app_catalog')
    .select('id')
    .eq('slug', APP_SLUG)
    .maybeSingle();
  if (appError || !app) {
    return { estado: 'error', mensaje: 'No se pudo resolver la app gestor-proyectos en app_catalog.' };
  }
  const appId = String((app as { id?: unknown }).id ?? '');
  if (!appId) return { estado: 'error', mensaje: 'La app gestor-proyectos no tiene id en app_catalog.' };

  const [usersRes, rolesRes] = await Promise.all([
    supabase.from('users').select('id,email,full_name,last_name').eq('tenant_id', perfil.tenantId),
    supabase.from('user_app_roles').select('user_id,role,permissions').eq('app_id', appId).eq('tenant_id', perfil.tenantId),
  ]);
  if (usersRes.error) {
    return { estado: 'error', mensaje: `No se pudo leer el directorio de la empresa: ${usersRes.error.message}` };
  }
  if (rolesRes.error) {
    return { estado: 'error', mensaje: `No se pudo leer los roles de la app: ${rolesRes.error.message}` };
  }

  const rolesPorUsuario = new Map<string, { rol: string | null; permisos: string[] }>();
  ((rolesRes.data ?? []) as Array<{ user_id?: unknown; role?: unknown; permissions?: unknown }>).forEach((r) => {
    if (typeof r.user_id === 'string' && r.user_id.trim() !== '') {
      rolesPorUsuario.set(r.user_id, {
        rol: typeof r.role === 'string' ? r.role : null,
        permisos: permisosDesdeJsonb(r.permissions),
      });
    }
  });

  const usuarios: UsuarioEmpresa[] = ((usersRes.data ?? []) as Array<Record<string, unknown>>)
    .map((u) => {
      const id = typeof u.id === 'string' ? u.id : '';
      const nombre = [u.full_name, u.last_name]
        .filter((v) => typeof v === 'string' && (v as string).trim() !== '')
        .map(String)
        .join(' ')
        .trim();
      const datos = rolesPorUsuario.get(id);
      return {
        id,
        email: typeof u.email === 'string' ? u.email : null,
        nombre: nombre || null,
        rol: datos?.rol ?? null,
        permisos: datos?.permisos ?? [],
        tieneFila: Boolean(datos),
      };
    })
    .filter((u) => u.id !== '');
  return { estado: 'lista', usuarios };
}

export type ResultadoGuardado = { ok: true } | { ok: false; mensaje: string };

/**
 * Guarda rol + llaves de un usuario de la empresa (jsonb shape objeto {"gp.x": true}).
 * RLS real: `uar_tenant_admin_manage` (is_tenant_admin ∧ tenant propio). Fallo ⇒ mensaje honesto.
 */
export async function guardarRolGp(p: {
  userId: string;
  tenantId: string;
  rol: string;
  permisos: string[];
}): Promise<ResultadoGuardado> {
  if (!supabase) return { ok: false, mensaje: 'Sin cliente Supabase (modo local).' };
  const perfil = await cargarPerfilGp();
  if (!perfil) return { ok: false, mensaje: 'Sin sesión de Qaway Hub.' };
  if (!perfil.esPlataforma && perfil.rol !== 'admin') {
    return { ok: false, mensaje: 'Solo el admin de la empresa (o la plataforma) administra permisos.' };
  }
  const { data: app, error: appError } = await supabase
    .from('app_catalog')
    .select('id')
    .eq('slug', APP_SLUG)
    .maybeSingle();
  if (appError || !app) return { ok: false, mensaje: 'No se pudo resolver la app en app_catalog.' };
  const appId = String((app as { id?: unknown }).id ?? '');
  if (!appId) return { ok: false, mensaje: 'La app gestor-proyectos no tiene id en app_catalog.' };

  const permisosJsonb: Record<string, boolean> = {};
  p.permisos.forEach((k) => {
    permisosJsonb[k] = true;
  });

  const { data: existente } = await supabase
    .from('user_app_roles')
    .select('id')
    .eq('user_id', p.userId)
    .eq('app_id', appId)
    .maybeSingle();

  if (existente && (existente as { id?: unknown }).id) {
    const { error } = await supabase
      .from('user_app_roles')
      .update({ role: p.rol, permissions: permisosJsonb })
      .eq('id', String((existente as { id?: unknown }).id));
    if (error) return { ok: false, mensaje: `No se pudo guardar: ${error.message}` };
  } else {
    const { error } = await supabase.from('user_app_roles').insert({
      user_id: p.userId,
      app_id: appId,
      tenant_id: p.tenantId,
      role: p.rol,
      permissions: permisosJsonb,
    });
    if (error) return { ok: false, mensaje: `No se pudo crear el rol: ${error.message}` };
  }
  invalidarPerfilGp();
  return { ok: true };
}
