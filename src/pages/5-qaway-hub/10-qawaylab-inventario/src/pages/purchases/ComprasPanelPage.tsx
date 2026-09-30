// @ts-ignore
import ComprasPanelLiteral from '../../../imagen-diseño/1-ResumenPanel/9-ComprasPanel2Literal'
import ComprasPanel from '../../../imagen-diseño/1-ResumenPanel/9-ComprasPanel2'

/**
 * Módulo "Compras" — gestión de compras a proveedores.
 *
 * Es deliberately distinto del módulo de compras que ya existe:
 *   - /compras            → PurchaseOrdersPage  (nota: hoy ese path lo secuestra
 *                          el alias del carrito, ver AppRouter L54)
 *   - /compras/ordenes    → PurchaseOrdersPage
 *   - /compras/proveedores → SuppliersPage
 *   - /compras-panel      → este panel de diseño (órdenes, proveedores y recepciones)
 *
 * No se toca nada de lo existente: el panel de diseño se monta en su propia ruta
 * y los datos son semillas (suppliersSeed, ordersSeed, receiptsSeed, itemsSeed).
 *
 * Ojo de CSS: este panel inyecta 63 clases SIN prefijo (.sidebar, .main, .brand,
 * .nav, .top). Es el mismo patrón que usa el panel de Pedidos, así que ambos
 * colisionarían si llegaran a montarse en la misma pantalla. Por eso vive en
 * ruta propia; si alguna vez se fusionan, hay que prefijar el CSS primero.
 *
 * Existe también `9-ComprasPanel1.jsx`, una variante anterior con 3 vistas y CSS
 * casi todo prefijado `cp-`. No se monta: este archivo es solo el lienzo.
 *
 * Fase actual: solo se monta el panel. La lógica real se conecta tras la
 * aprobación del diseño, igual que Clientes, Cotizaciones, Ventas y Pedidos.
 */
export default function ComprasPanelPage() {
  return (
    <div className="space-y-6">
      <ComprasPanelLiteral />
      <ComprasPanel />
    </div>
  )
}
