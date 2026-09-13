# Bitácora de Iteraciones — Qaway Pagos y Carrito (`3-qawaylab-pagos`)

Registro de cambios e iteraciones del módulo de pagos y storefront de Qaway Lab.

---

## Iteración 2: Integración con Inventario Supabase y Navbar de Marca Oficial
**Fecha:** 2026-09-13  
**Objetivo:** Acoplar el carrito y compras al ecosistema de inventario eliminando la cabecera interna, consumiendo 10 productos reales de Supabase y mostrando únicamente el Navbar oficial de Qaway Lab.

### Puntos esenciales:
1. **Eliminación del Navbar Interno:**
   - Se removió completamente `<header className="site-header">`.
   - La página se renderiza dentro del `<Route element={<Layout />}>` general, heredando el Navbar oficial de la marca Qaway Lab en variante `'light'`.
   - Se aplicó `paddingTop: '96px'` para garantizar que el Navbar de la marca flote sin tapar el título `"Mi pedido."`.

2. **Supresión de Catálogos Redundantes:**
   - La ruta raíz redirige a `carrito`. No existen catálogos duplicados dentro de pagos, ya que la web y el inventario cuentan con sus vitrinas oficiales.

3. **Solo dos páginas de cliente:**
   - `/hub/pagos/carrito` (y `/carrito`): Resumen de compra, edición de cantidades y checkout multi-método (Yape/Plin/Transferencia/Mercado Pago).
   - `/hub/pagos/purchases`: Historial de compras y comprobantes del cliente.

4. **Sincronización con 10 Productos Reales de Supabase:**
   - La tabla `public.products` fue creada y unificada en Supabase (`qrusdsqgygfolxfrafyd`).
   - Se insertaron 10 productos/servicios reales de Qaway Lab (precios en PEN, SKU, imágenes y stock).
   - El carrito se alimenta directamente de la base de datos remota en tiempo real (cero datos hardcodeados).

---

## Iteración 1: Restauración de la Lógica del Carrito y Storefront Autónomo
**Fecha:** 2026-09-13  
**Objetivo:** Devolver la funcionalidad completa del carrito y catálogo original preservando al 100% el diseño sin parches visuales.
