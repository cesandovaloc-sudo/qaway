# Bitácora de Integración — Inventario y Carrito (`10-qawaylab-inventario`)

Registro de acople entre la aplicación de Inventario y el módulo de Carrito/Pagos de Qaway Lab.

---

## Iteración 1: Acople de Vistas de Cliente y Productos Vivos en Supabase
**Fecha:** 2026-09-13  
**Objetivo:** Servir como fuente de la verdad para el catálogo de productos y mantener el panel administrativo 100% aislado.

### Puntos esenciales:
1. **Blindaje del Panel de Inventario:**
   - Las rutas administrativas (`/hub/inventario/*`) continúan encapsuladas dentro de `<RequireAuth><AppLayout>`.
   - El sidebar negro de gestión (Logística, Comercial, Ventas, Compras, Finanzas) permanece 100% intacto y sin alteraciones.

2. **Base de Datos Unificada en Supabase:**
   - Migración `20260913140000_create_products_unified.sql` aplicada a la base de datos remota (`qrusdsqgygfolxfrafyd`).
   - 10 productos reales de Qaway Lab registrados en la tabla `public.products` con stock, precios en Soles (PEN) y SKUs oficiales.
   - Tanto el listado de productos de inventario (`ProductsPage.tsx`) como el carrito de clientes leen estos registros vivos de Supabase.

3. **Vistas de Cliente:**
   - La vista de compra (`/hub/pagos/carrito` o `/carrito`) y la de historial (`/hub/pagos/purchases`) se presentan con el Navbar oficial de Qaway Lab y sin cabeceras duplicadas.
