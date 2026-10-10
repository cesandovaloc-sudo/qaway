// @ts-ignore
import KitsModuleLiteral from '../../../imagen-diseño/1-ResumenPanel/11-KitsModuleLiteral'
import KitsModule from '../../../imagen-diseño/1-ResumenPanel/11-KitsModule'

/**
 * Módulo "Kits" — paquetes y kits armables.
 *
 * Este módulo **no existía**: no había ruta, ni página, ni entrada de menú, ni
 * tabla en Supabase. Se crea desde cero sobre el panel de diseño.
 *
 * Distinto del módulo de paquetes que ya vive en la app:
 *   - /paquetes  → PackagesPage (sección COMERCIAL del sidebar, intacto)
 *   - /kits      → este panel de diseño
 *
 * No se toca nada de lo existente. Los datos son semilla (`kits`, 5 filas) y las
 * cuatro vistas del panel hardcodean sus tablas: 'Lista de kits', 'Componentes',
 * 'Tipos de kits' y 'Configuración'.
 *
 * Sobre el CSS: el panel inyecta `*{box-sizing:border-box}` y 12 clases sin
 * prefijo (`.panel`, `.head`, `.stat`, `.tabs`, `.filters`, `.scroll`,
 * `.settings`, `.drawer`, `.sub`, `.avatar`, `.symbol`, `.active`, `.on`,
 * `.primary`). Se revisó una por una contra los CSS de la app:
 *   - el reset `*` es inofensivo, el preflight de Tailwind v4 ya lo aplica
 *   - la única coincidencia nominal, `.active`, es falsa: la del storefront es
 *     `.qawa-storefront .main-nav a.active` (descendiente y sobre un `<a>`), y el
 *     panel usa un `div.active` dentro de `.kits`
 *   - el resto de selectores del panel cuelgan de `.kits`
 * Aun así es el mismo patrón de los demás paneles: si algún día se fusiona con
 * otro en la misma pantalla, hay que prefijar primero.
 *
 * Fase actual: solo se monta el panel. La lógica real se conecta tras la
 * aprobación del diseño, igual que Clientes, Cotizaciones, Ventas, Pedidos,
 * Compras y Precios.
 */
export default function KitsPage() {
  return (
    <div className="space-y-6">
      <KitsModuleLiteral />
      <KitsModule />
    </div>
  )
}
