// @ts-ignore
import LiquidacionesLiteral from '../../../imagen-diseño/1-ResumenPanel/12-LiquidacionesLiteral'
import Liquidaciones from '../../../imagen-diseño/1-ResumenPanel/12-Liquidaciones'

/**
 * Módulo "Liquidaciones" — liquidaciones a proveedores y a clientes.
 *
 * Ruta propia en `/hub/inventario/liquidaciones`. La palabra "liquidaciones" no
 * estaba usada en ninguna ruta, así que no hubo que esquivar nada.
 *
 * No confundir con lo que ya existe:
 *   - /promociones           → LiquidationPage  = campañas de liquidación sobre
 *                              `liquidation_campaigns` / `liquidation_items`
 *                              (liquidar stock para vender)
 *   - /promociones/catalogos  → CatalogsPage
 *   - /liquidaciones          → este panel = liquidar cuentas pendientes con
 *                              proveedores y clientes (cobrar/pagar)
 *
 * Es el módulo con el CSS mejor aislado de los acoplados: 58 de sus 83 clases
 * llevan prefijo `liq-`. Las 25 sueltas (`.active`, `.nav-end`, `.green-text`,
 * `.spacer`, `.full`, `.current`, `.push`, `.on`…) son todas de apoyo y ninguna
 * choca con los CSS de la app; se comprobó en el gate.
 *
 * El panel trae su CSS en `12-Liquidaciones.css`, no embebido. Su import estaba
 * roto: pedía `./Liquidaciones.css` y el fichero se llama `12-Liquidaciones.css`.
 * Se corrigió, igual que se hizo con el de Ventas.
 *
 * Fase actual: solo se monta el panel. La lógica real se conecta tras la
 * aprobación del diseño, igual que Clientes, Cotizaciones, Ventas, Pedidos,
 * Compras, Precios y Kits.
 */
export default function LiquidacionesPage() {
  return (
    <div className="space-y-6">
      <LiquidacionesLiteral />
      <Liquidaciones />
    </div>
  )
}
