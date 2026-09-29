// @ts-ignore
import PanelVentas from '../../../imagen-diseño/1-ResumenPanel/7-PanelVentas1'

/**
 * Módulo "Registro de ventas" — vista administrativa de ventas.
 *
 * Es deliberately distinto del Punto de Venta:
 *   - /ventas         → SalesPage + NewSalePage = POS de mostrador (contado/crédito)
 *   - /ventas/registro → este panel = registro administrativo (canal, comprobante,
 *                        almacén, entrega) sobre la misma tabla `sales`.
 *
 * Fase actual: solo se monta el panel de diseño. La lógica real se conecta tras
 * la aprobación del diseño, igual que en Clientes y Cotizaciones.
 * No se borra ni se mueve nada de las páginas de venta existentes.
 */
export default function RegistroVentasPage() {
  return (
    <div className="space-y-6">
      <PanelVentas />
    </div>
  )
}
