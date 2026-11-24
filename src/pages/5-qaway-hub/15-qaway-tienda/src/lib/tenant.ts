/**
 * Resuelve el tenant activo.
 * MVP: ruta `/tienda/:tenantSlug`.
 * Fase 2: resolver por Host/subdominio (ej. pepito.qawaylab.com) antes de caer a ruta.
 */
export function resolveTenantSlug(routeSlug?: string | null, hostname?: string | null): string {
  const host = (hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')).toLowerCase();
  // Placeholder fase 2: si hay subdominio de tenant, mapear aquí (requiere tabla/domains/config).
  // Ejemplo futuro: if (host.endsWith('.qawaylab.com')) { const sub = host.split('.')[0]; if (!['www','app'].includes(sub)) return sub; }
  void host;
  const slug = (routeSlug || '').trim().toLowerCase();
  return slug || 'demo';
}
