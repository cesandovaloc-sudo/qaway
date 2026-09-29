// @ts-ignore
import PedidosPanel from '../../../imagen-diseño/1-ResumenPanel/8-PedidosPanel'

/**
 * Módulo "Pedidos" — gestión de pedidos de todos los canales.
 *
 * Deliberadamente aparte de "Pedidos Web" (/ventas/pedidos-web), que sigue
 * intacto: ese lee la tabla `orders` del ecommerce y este panel es la vista
 * operativa de preparación, despacho y entrega. La posible fusión de las dos se
 * evalúa después; hasta entonces ninguna se toca.
 *
 * Fase actual: solo se monta el panel de diseño. La lógica real se conecta tras
 * la aprobación del diseño, igual que en Clientes, Cotizaciones y Ventas.
 */
export default function PedidosPage() {
  return (
    <div className="space-y-6">
      <PedidosPanel />
    </div>
  )
}
