/**
 * Control de liberación de módulos de Inventario para tenants.
 *
 * NO elimina módulos/rutas: solo controla visibilidad y consumo para tenants.
 * Platform admins siempre ven todo. Los tenants ven solo los módulos liberados,
 * salvo que su tenant.features habilite todos o una lista explícita.
 *
 * Para ir mostrando módulos gradualmente:
 * - Agregar la clave a TENANT_RELEASED_MODULE_KEYS, o
 * - En el tenant, setear features.inventory_modules_release = 'all'
 *   o features.inventory_modules_release = ['dashboard','products',...]
 */

export const INVENTORY_MODULE_KEYS = [
  'dashboard',
  'products',
  'categories',
  'movements',
  'sedes',
  'clientes',
  'catalogos',
  'precios',
  'precios_panel',
  'paquetes',
  'kits',
  'cotizaciones',
  'ventas',
  'punto_de_venta',
  'registro_ventas',
  'pedidos_web',
  'pedidos',
  'compras',
  'proveedores',
  'ordenes_compra',
  'compras_panel',
  'promociones',
  'liquidaciones',
  'caja',
  'gastos',
  'contabilidad',
  'reportes',
  'config',
  'config_enlaces',
  'captura',
] as const

export type InventoryModuleKey = (typeof INVENTORY_MODULE_KEYS)[number]

// Módulos mínimos para el flujo operativo actual (tenant nuevo).
// Flujo: acceso tenant -> cargar productos/fotos/descripción -> reflejo en web -> ver web en vivo -> carrito/checkout/compras.
export const TENANT_RELEASED_MODULE_KEYS: InventoryModuleKey[] = [
  'dashboard',
  'products',
  'categories',
  'pedidos_web',
  'config',
]

type TenantLike = {
  features?: Record<string, unknown> | null
} | null | undefined

export function getTenantReleasedModules(tenant: TenantLike): Set<InventoryModuleKey> | 'all' {
  const raw = tenant?.features?.inventory_modules_release
  if (raw === 'all' || raw === '*') return 'all'
  if (Array.isArray(raw)) {
    const valid = raw.filter((k): k is InventoryModuleKey =>
      typeof k === 'string' && (INVENTORY_MODULE_KEYS as readonly string[]).includes(k)
    )
    return new Set(valid.length ? valid : TENANT_RELEASED_MODULE_KEYS)
  }
  return new Set(TENANT_RELEASED_MODULE_KEYS)
}

export function isInventoryModuleReleased(
  moduleKey: InventoryModuleKey,
  opts: { isPlatformAdmin?: boolean; tenant?: TenantLike },
): boolean {
  if (opts.isPlatformAdmin) return true
  const released = getTenantReleasedModules(opts.tenant)
  if (released === 'all') return true
  return released.has(moduleKey)
}
