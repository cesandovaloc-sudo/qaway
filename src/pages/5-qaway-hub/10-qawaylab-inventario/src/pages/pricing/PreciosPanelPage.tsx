import PrecioModule from '../../../imagen-diseño/1-ResumenPanel/10-PrecioModule'

/**
 * Módulo "Precios" del panel de diseño — lista de precios, precios por cliente,
 * por canal, promociones, historial y configuración.
 *
 * Es deliberately distinto del módulo de precios que ya existe:
 *   - /precios         → PriceListsPage
 *   - /precios/listas  → PriceListsPage
 *   - /precios-panel   → este panel de diseño
 *
 * No se toca nada de lo existente. El panel se monta en su propia ruta y sus
 * datos son semilla (`seed` de 4 productos, `channels`, `promos`, `history`,
 * `customers`).
 *
 * A diferencia de los paneles .jsx anteriores, este es `.tsx` y está tipado, así
 * que NO lleva `// @ts-ignore`. Ojo: `tsconfig.app.json` solo incluye `src` y
 * `contracts`, de modo que el panel entra al programa de `tsc` únicamente porque
 * esta página lo importa, y `noUnusedLocals` sí le aplica.
 *
 * Usa Tailwind, no CSS embebido. Gate ya verificado: en v4 la detección es por
 * sistema de ficheros desde la raíz respetando `.gitignore`, no por grafo de
 * imports, así que las clases de `imagen-diseño/` se emiten sin necesidad de
 * `@source`.
 *
 * Fase actual: solo se monta el panel. La lógica real se conecta tras la
 * aprobación del diseño, igual que Clientes, Cotizaciones, Ventas, Pedidos y
 * Compras.
 */
export default function PreciosPanelPage() {
  return (
    <div className="space-y-6">
      <PrecioModule />
    </div>
  )
}
