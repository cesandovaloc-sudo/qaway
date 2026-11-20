/**
 * perfilVisibleService.ts — UNA SOLA lectura del perfil que ve el usuario.
 * =====================================================================
 * Antes el mismo dato se pedía tres veces, cada uno con su propio estado vacío:
 *   · Topbar.tsx            → getUser + users + tenants
 *   · PerfilTab.tsx         → getUser + users + tenants
 *   · EmpresaTab.tsx        → tenants + getUser + users
 * Resultado: al entrar al Gestor se veía "Cargando...", "Sin proyectos" y el
 * formulario de empresa en blanco durante unos milisegundos, hasta que cada
 * consulta respondía. Ese es el destello documentado en
 * 0-SOLUCIONES/1-Pop Up.txt (punto 4) que el parche `cargandoNube` solo tapaba
 * en el Gantt.
 *
 * Aquí se resuelve UNA vez (caché en vuelo, patrón contextoSesion) y se
 * comparte con los tres consumidores. El shell de App.tsx espera a que esta
 * promesa termine antes de montar Sidebar/Topbar/canvas: no hay timeouts, no
 * hay localStorage como fuente y no se oculta lentitud.
 *
 * Sin cliente o sin sesión devuelve null (fail-closed), igual que el resto del
 * módulo. La caché se invalida solo en eventos de identidad.
 */

import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { obtenerUsuarioSesion } from './contextoSesion';
import { consultaCacheada } from '../../../../../router/sessionCache';

export interface PerfilVisible {
  userId: string;
  nombre: string;
  email: string;
  rol: string;
  roleLabel: string;
  initials: string;
  avatarUrl: string | null;
  esPlataforma: boolean;
  tenantId: string;
  tenantNombre: string;
  /** Responsable real de la empresa (admin del tenant), no quien está mirando. */
  responsable: string;
  /** Fila completa del tenant: la edición de empresa conserva content/features. */
  tenant: {
    id: string;
    name: string;
    legal_name: string | null;
    content: Record<string, unknown>;
    features: Record<string, unknown>;
  } | null;
}

let cachePerfil: PerfilVisible | null | undefined = undefined;
let enVuelo: Promise<PerfilVisible | null> | null = null;

function nombreDe(fila: any, user: { email: string | null; user_metadata: Record<string, unknown> }): string {
  const completo = [fila?.full_name, fila?.last_name].filter(Boolean).join(' ').trim();
  return completo
    || String(user.user_metadata?.full_name || user.user_metadata?.nombre || user.user_metadata?.name || '')
    || user.email?.split('@')[0]
    || 'Usuario';
}

function inicialesDe(nombre: string): string {
  const palabras = nombre.split(/\s+/).filter(Boolean);
  return (palabras.length >= 2
    ? `${palabras[0]?.[0] ?? ''}${palabras[1]?.[0] ?? ''}`
    : nombre.slice(0, 2)
  ).toUpperCase();
}

async function resolver(): Promise<PerfilVisible | null> {
  if (!supabase) return null;
  const user = await obtenerUsuarioSesion();
  if (!user) return null;

  const { data: uRow } = await consultaCacheada(
    `user:${user.id}`,
    () => supabase!
      .from('users')
      .select('id, full_name, last_name, email, role, is_platform_admin, tenant_id, avatar_url')
      .eq('id', user.id)
      .maybeSingle(),
  );

  const tenantId = uRow?.tenant_id == null ? '' : String(uRow.tenant_id);
  const [{ data: tRow }, { data: usuarios }] = await Promise.all([
    tenantId
      ? consultaCacheada(
          `tenant:${tenantId}`,
          () => supabase!
            .from('tenants')
            .select('id, name, legal_name, status, content, features')
            .eq('id', tenantId)
            .maybeSingle(),
        )
      : Promise.resolve({ data: null }),
    tenantId
      ? consultaCacheada(
          `tenant_users:${tenantId}`,
          () => supabase!
            .from('users')
            .select('id, full_name, last_name, email, role')
            .eq('tenant_id', tenantId)
            .limit(50),
        )
      : Promise.resolve({ data: [] }),
  ]);

  const nombre = nombreDe(uRow, user);
  const tenantNombre = String(tRow?.name || '');
  const rol = String(uRow?.role || '');
  const esPlataforma = uRow?.is_platform_admin === true;
  const roleLabel = esPlataforma
    ? 'Super Administrador'
    : tenantNombre
      ? `${tenantNombre}${rol ? ` · ${rol}` : ''}`
      : rol || 'Usuario';

  // RLS users_tenant_read permite leer a los usuarios de la propia empresa.
  const filas = Array.isArray(usuarios) ? usuarios : [];
  const admin = filas.find((u: any) => u?.role === 'admin') || filas.find((u: any) => u?.id === user.id);
  const responsable = admin
    ? nombreDe(admin, user)
    : '';

  return {
    userId: user.id,
    nombre,
    email: String(uRow?.email || user.email || ''),
    rol,
    roleLabel,
    initials: inicialesDe(nombre),
    avatarUrl: uRow?.avatar_url || null,
    esPlataforma,
    tenantId,
    tenantNombre,
    responsable,
    tenant: tRow
      ? {
          id: String(tRow.id),
          name: String(tRow.name || ''),
          legal_name: tRow.legal_name == null ? null : String(tRow.legal_name),
          content: (tRow.content && typeof tRow.content === 'object' ? tRow.content : {}) as Record<string, unknown>,
          features: (tRow.features && typeof tRow.features === 'object' ? tRow.features : {}) as Record<string, unknown>,
        }
      : null,
  };
}

/** Perfil visible compartido: una sola resolución mientras el shell arranca. */
export async function cargarPerfilVisible(): Promise<PerfilVisible | null> {
  if (cachePerfil !== undefined) return cachePerfil;
  if (!enVuelo) {
    enVuelo = resolver()
      .then((p) => { cachePerfil = p; return p; })
      .finally(() => { enVuelo = null; });
  }
  return enVuelo;
}

/** Fuerza re-resolución (cambio de identidad o datos de empresa guardados). */
export function invalidarPerfilVisible(): void {
  cachePerfil = undefined;
  enVuelo = null;
}

if (supabase) {
  try {
    supabase.auth.onAuthStateChange((evento) => {
      if (evento === 'SIGNED_IN' || evento === 'SIGNED_OUT' || evento === 'USER_UPDATED') {
        invalidarPerfilVisible();
      }
    });
  } catch { /* entornos sin auth real */ }
}

/**
 * Hook de lectura. Arranca con la caché ya resuelta si existe: por eso los
 * consumidores montados después del gate (Configuración) no muestran estados
 * vacíos. `recargar` refresca en silencio, sin volver a poner `cargando`.
 */
export function usePerfilVisible(): {
  perfil: PerfilVisible | null;
  cargando: boolean;
  recargar: () => Promise<PerfilVisible | null>;
} {
  const [perfil, setPerfil] = useState<PerfilVisible | null | undefined>(cachePerfil);
  useEffect(() => {
    let vigente = true;
    if (cachePerfil !== undefined) return () => { vigente = false; };
    cargarPerfilVisible().then((p) => { if (vigente) setPerfil(p); });
    return () => { vigente = false; };
  }, []);

  const recargar = async () => {
    invalidarPerfilVisible();
    const p = await cargarPerfilVisible();
    setPerfil(p);
    return p;
  };

  return { perfil: perfil ?? null, cargando: perfil === undefined, recargar };
}
