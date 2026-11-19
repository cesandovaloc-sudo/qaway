/**
 * Aislamiento por tenant del almacén local de tareas operativas.
 * =============================================================
 * `qaway-tasks-v1` es una clave legada y GLOBAL (localStorage) que contiene las
 * tareas históricas del tenant MINEDU original (DIGERE). Un tenant nuevo no debe
 * heredarlas: usa su propia clave y, por tanto, arranca sin ningún dato.
 *
 * No hay tabla nueva: el almacén sigue siendo localStorage ( pendiente validar
 * cómo se poblarán estos registros ). Solo se cambia la clave de acceso.
 */

import { tenantIdGpEnCache } from './gpPermisosService';

const CLAVE_LEGADA = 'qaway-tasks-v1';

/** Único tenant autorizado a conservar la clave histórica sin sufijo. */
export const TENANT_MINEDU_PRINCIPAL = '8bbc04cb-f030-48cc-904e-954c5b5af813';

/** Tenant resuelto en este momento (null mientras no se resolvió la sesión). */
export function tenantIdTareasLocal(): string | null {
  return tenantIdGpEnCache();
}

/** ¿Es el tenant MINEDU original? Se usa para NO borrar su dataset legítimo. */
export function esTenantMineduPrincipal(tenantId?: string | null): boolean {
  return (tenantId ?? null) === TENANT_MINEDU_PRINCIPAL;
}

/** Clave efectiva según el tenant autenticado (fail-closed: sin tenant ⇒ clave vacía). */
export function claveTareasLocal(): string {
  const tenantId = tenantIdGpEnCache();
  if (tenantId === TENANT_MINEDU_PRINCIPAL) return CLAVE_LEGADA;
  if (!tenantId) return `${CLAVE_LEGADA}::__sin_tenant__`;
  return `${CLAVE_LEGADA}::${tenantId}`;
}
