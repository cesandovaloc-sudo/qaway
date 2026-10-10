// @ts-ignore
import SedesModuleLiteral from '../../../imagen-diseño/1-ResumenPanel/13-SedesModuleLiteral'
import SedesModule from '../../../imagen-diseño/1-ResumenPanel/13-SedesModule'

/**
 * Módulo "Sedes" — sedes, almacenes y puntos de operación.
 *
 * Ruta propia en `/hub/inventario/sedes`. La palabra "sedes" no estaba usada
 * en ninguna ruta (las rutas existentes del dominio son /logistica/*,
 * /inventario/* y el catch-all /:id → ProductDetailPage, que no pisa porque
 * los segmentos estáticos tienen prioridad sobre el dinámico en React Router).
 *
 * No confundir con lo que ya existe:
 *   - /logistica/ubicaciones  → LocationsPage = ubicaciones físicas dentro
 *     del almacén (estantes/zonas de productos)
 *   - /logistica/categorias   → CategoriesPage = categorías de productos
 *
 * Este panel cubre un dominio que la app no tenía: la entidad SEDE
 * (oficina/tienda/almacén por ciudad) con sus almacenes asociados y su
 * configuración regional (zona horaria, moneda, formatos, opciones
 * operativas por sede).
 *
 * El módulo es autocontenido: solo React + lucide-react. NO trae CSS aparte
 * (todo es Tailwind con clases del hub) ni importa react-router ni servicios:
 * fase 1 = solo montaje del diseño con sus datos semilla, igual que
 * Clientes, Cotizaciones, Ventas, Pedidos, Compras, Precios, Kits y
 * Liquidaciones. La conexión a datos reales va en fase 2 tras aprobar diseño.
 */
export default function SedesPanelPage() {
  return (
    <div className="space-y-6">
      <SedesModuleLiteral />
      <SedesModule />
    </div>
  )
}
