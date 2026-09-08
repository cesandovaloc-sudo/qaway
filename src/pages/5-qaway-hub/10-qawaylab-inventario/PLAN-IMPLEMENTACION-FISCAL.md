# Plan de Implementación Priorizado — Capa Comercial-Fiscal

> Objetivo: cerrar las **3 brechas críticas** del `REPORTE-COMPLETITUD.md`:
> 1. **Documento fiscal en clientes** (DNI/RUC + consulta SUNAT)
> 2. **Ventas al crédito** (estado Pagado/Deuda + pagos parciales)
> 3. **Facturación electrónica SUNAT** (series, IGV, comprobantes, estados)
>
> Referencia funcional: `SUSII_REFERENCIA.md`. Fuente: `REPORTE-COMPLETITUD.md`.

---

## Estado de avance (13-08-2026)

| Fase | Estado | Entregado |
|---|---|---|
| **0.1** Baseline de inventario | ✅ Hecho | `20260813000001_baseline_inventario.sql` |
| **0.2** Config fiscal (schema) | ✅ Hecho | `20260813000003_config_fiscal.sql` (business_settings, taxes, sunat_units, series + seeds) |
| **0.3** SettingsPage real | ✅ Hecho | Tabs Negocio / Series / Impuestos / Unidades + `fiscalService.ts` + permiso `can_access_fiscal_settings` |
| **1** Clientes con documento fiscal | ✅ Hecho | `20260813000002_clientes_fiscal.sql` + SUNAT lookup + `fiscal.ts` |
| **2** Ventas al crédito (POS) | ✅ Hecho | `20260813000004_ventas_credito.sql` + SalesPage / NewSalePage / SaleDetailPage + `saleService.ts` |
| **3** Schema de facturación | ✅ Schema listo, ⏳ conexión pendiente | `20260813000005_facturacion.sql` (invoices, invoice_lines, next_correlativo) |
| **3** Envío a SUNAT (edge functions, adapter, PDF) | ⏳ Pendiente | Ver §8 "Guía de activación" |
| **4** Consolidación (CxC, reportes) | ⏳ Pendiente | Fuera de esta tanda |

> **Nota de diseño:** las ventas de mostrador guardan el IGV en **0** hasta que se active la
> facturación (Fase 3). La estructura ya soporta IGV por línea (`igv_total`, `tax_code`,
> `igv_rate`) sin cambios de schema al momento de conectarse.

---

## 0. Dependencias entre brechas

```
Config fiscal (impuestos, series, negocio) ──┐
                                             ├──► Ventas al crédito ──► Facturación SUNAT
Cliente con documento fiscal ────────────────┘        ▲                    ▲
                                                      │                    │
                                      (la venta genera el     (el comprobante nace de
                                       comprobante)           una venta con cliente+ítems)
```

**Orden de ataque:** Fase 0 (cimientos) → Fase 1 (clientes) → Fase 2 (ventas) → Fase 3 (facturación) → Fase 4 (consolidación). Cada fase deja el sistema en estado usable; no hace falta terminar todo para liberar valor.

**Principio de dominio:** el repo ya declara "cada dominio con un solo dueño" (§47.2, migración commerce). El módulo externo `@qawaylab/pago` es dueño del **ecommerce online** (carrito/checkout). La **venta de mostrador con crédito** es un dominio nuevo del inventario → **tablas propias** (`sales`, no reusar `orders` para no acoplar dominios).

---

## FASE 0 — Cimientos: schema versionado + configuración fiscal  ⏱ ~1–1.5 días

**Prerrequisito detectado en el reporte:** el DDL de inventario (products, categories, movements…) **no está versionado** en migraciones (solo `users` y commerce). Riesgo de drift que se agrava al agregar FKs fiscales.

### 0.1 Versionar el schema existente (riesgo, no funcionalidad)
- Crear `supabase/migrations/20260813000000_baseline_inventario.sql` con el DDL real de inventario tal como está en Supabase (idempotente, `create table if not exists`), para que `supabase db push` reproduzca el estado.
- Sin cambios de diseño aquí: solo snapshot para que las siguientes migraciones tengan base.

### 0.2 Tablas de configuración fiscal
Migración `20260813000001_config_fiscal.sql`:
- `business_settings` (una fila por empresa): `ruc`, `razon_social`, `nombre_comercial`, `direccion`, `regimen`, `igv_rate` (default 18), `sunat_connected` (bool), `sunat_connection_meta` (jsonb).
- `taxes` (catálogo SUNAT): `codigo` (10=IGV, 11=Exonerado, 12=Inafecto, 15=ISC…), `descripcion`, `tasa`, `tipo` ('igv'|'isc'|'exonerado'|'inafecto'), `active`.
- `sunat_units` (catálogo): `codigo` (NIU, KGM, MTR…), `descripcion`. Seed con ~50 unidades comunes.
- `series` (comprobantes): `id`, `tipo_doc` ('01' boleta, '01' factura — códigos SUNAT: 01=Factura, 03=Boleta, 07=NC, 08=ND, 09=Guía, 40=Percepción), `serie` ('B001','F001','BC01','FC01'…), `descripcion`, `correlativo_actual` (int, default 0), `active`. Seed: B001, F001, BC01, FC01, BD01, FD01.
- RLS: solo `admin` y `can_access_settings` leen/escriben configuración; catálogos `taxes`/`sunat_units` legibles por autenticados.

### 0.3 SettingsPage real (hoy es placeholder "Próximamente")
- `src/pages/SettingsPage.tsx` → tabs: **Negocio** (RUC/razón social/dirección/IGV + botón "Conectar a SUNAT" que registra credenciales del proveedor), **Series** (CRUD + correlativo), **Impuestos**, **Unidades**, **Monedas**.
- Servicio `src/services/fiscalService.ts` (get/update business_settings, taxes, units, series; nextCorrelativo(serie) con transacción).
- Nuevo permiso granular `can_access_fiscal_settings` en `src/types/user.ts` (admin=true).

**Entregable:** el sistema puede configurarse fiscalmente (RUC, IGV, series) desde la UI.

---

## FASE 1 — Clientes con documento fiscal + consulta SUNAT  ⏱ ~1–1.5 días

### 1.1 Schema
Migración `20260813000002_clientes_fiscal.sql` — `ALTER TABLE customers ADD`:
- `doc_type` text check ('DNI','RUC','CE','PASAPORTE','SIN_DOC')
- `doc_number` text
- `fiscal_name` text (razón social / nombre legal — distinto de `name` comercial)
- `address` text (domicilio fiscal)
- `extra_data` jsonb (datos adicionales: mascota, género, alias — lo que SUSII guarda aparte)
- Índice único parcial `ON customers (doc_type, doc_number) WHERE doc_type <> 'SIN_DOC'`
- Validación: dígito verificador de RUC (11) y DNI (8) en el cliente (función plpgsql `validate_doc` + guard en UI).

### 1.2 Servicio y UI
- `src/types/index.ts`: extender `Customer` + `CustomerType` (agregar 'proveedor'? → **no**: proveedores son una brecha separada, fuera de este plan; solo documentar).
- `src/services/customerService.ts`: `getCustomers/searchCustomers/createCustomer/updateCustomer` ya usan `*` → compatibles; agregar `lookupFiscalDoc(docType, docNumber)`.
- `src/pages/customers/CustomersPage.tsx`: formulario con **Tipo doc + Nº + botón "SUNAT"** (autocompleta `fiscal_name`/`address` desde el servicio), columna documento en tabla, badge del tipo.
- **Consulta SUNAT = Edge Function de Supabase** (mantiene el token en servidor, no en el bundle):
  `supabase/functions/consulta-ruc-dni/index.ts` — llama al proveedor elegido y devuelve `{ razon_social, direccion, estado, condicion }`. El cliente browser solo hace `supabase.functions.invoke`.
- Servicio con patrón adapter (igual que `src/services/adapters/commerceAdapter.ts`): `src/services/adapters/sunatLookupAdapter.ts` → proveedor conmutable por env.

### 1.3 Proveedor de consulta RUC/DNI (decidir)
Opciones reales con plan free: **apis.net.pe**, **ApisPeru** (apisperu.com), **PeruAPI** (peruapi.com), **ApiPeruDev** (apiperu.dev), **dniruc.com**. Criterio: token barato, cobertura RUC+DNI, uptime. **Recomendación inicial:** empezar con uno de plan free (ej. apis.net.pe) para el MVP y poder cambiarlo sin tocar UI (adapter).

**Entregable:** clientes con DNI/RUC validado + autocompletado SUNAT → requisito habilitante de facturación.

---

## FASE 2 — Ventas al crédito (POS de mostrador)  ⏱ ~2–3 días

### 2.1 Schema (dominio `sales`, propio del inventario)
Migración `20260813000003_ventas_credito.sql`:
- `sales`: `id`, `sale_number` (correlativo por sede, ej. `V-000109`), `customer_id` (FK customers), **snapshot fiscal del cliente** (`doc_type`, `doc_number`, `fiscal_name`, `address` — congela el dato al momento de vender), `subtotal`, `discount`, `igv_total`, `total`, `currency` (PEN/USD), `payment_status` ('pagado'|'deuda'|'parcial'), `status` ('active'|'cancelled'), `payment_method`, `notes`, `created_by` (FK users), `created_at`, `paid_at`.
- `sale_items`: `sale_id`, `product_id`, `product_title`, `quantity`, `unit_price`, `subtotal`, `tax_code`, `unit_sunat`.
- `sale_payments` (pagos parciales): `id`, `sale_id`, `amount`, `method` ('efectivo'|'yape'|'tarjeta'|'transferencia'), `received_at`, `created_by`, `notes`.
- `next_sale_number()` plpgsql con bloqueo de fila (mismo patrón que correlativo de series) → sin huecos ni colisiones.
- Trigger: al insertar `sale_items` → `inventory_movements` tipo `sale` con `reference` = sale_number (cierra la brecha "movimientos sin referencia al documento origen").
- RLS: roles con `can_view_sales`/`can_create_sales`/`can_register_payments` (agregar a `src/types/user.ts`, admin=true, editor=true).

### 2.2 UI (nuevo módulo "Ventas")
- `src/pages/sales/SalesPage.tsx`: tabla con **correlativo | fecha | cliente (doc) | total | estado (Pagado/Deuda badges) | usuario** — clonando el estilo de `ProductsPage`.
- `src/pages/sales/NewSalePage.tsx`: formulario tipo POS: cliente (buscar con doc fiscal), ítems, **tipo boleta/factura (señal para Fase 3)**, método de pago, **"Guardar como Deuda" / "Registrar abono"**.
- `src/pages/sales/SaleDetailPage.tsx`: detalle + **registrar pagos parciales** (abono) + historial de pagos + botón "Emitir comprobante" (habilita Fase 3).
- `src/services/saleService.ts`: createSale (con pagos, en transacción), getSales con filtros, registerPayment, getDebts (por cliente), cancelSale.
- Ruta en `AppRouter.tsx` + link en navegación.

### 2.3 Coexistencia con ecommerce
- El checkout online (`@qawaylab/pago`) **no cambia**: sigue creando `orders` pagadas online.
- Las ventas de mostrador viven en `sales`. Reporte consolidado (dashboard/ventas totales) lee ambos.

**Entregable:** vender al contado o al crédito, registrar abonos, deuda por cliente, stock descontado con trazabilidad.

---

## FASE 3 — Facturación electrónica SUNAT  ⏱ ~3–5 días (la pieza grande)

### 3.1 Schema
Migración `20260813000004_facturacion.sql`:
- `invoices` (comprobante): `id`, `sale_id` (FK, nullable — también permite comprobantes manuales), `series_id` (FK series), `correlativo`, `numero` (`B001-00002`), `tipo_doc` ('01'/'03'), **snapshot fiscal completo del cliente** (doc, nombre, dirección), `moneda`, `subtotal`, `igv_total`, `total`, `igv_rate`, `descuento`, `estado` ('generado'|'enviado'|'aceptado'|'rechazado'|'anulado'), `sunat_response` (jsonb: código, descripción, CDR), `xml_url`, `pdf_url`, `created_by`, `emitted_at`, `created_at`.
- `invoice_lines`: `invoice_id`, `product_title`, `quantity`, `unit_price`, `tax_code`, `igv_amount`, `total`.
- Función `next_correlativo(serie_id)` con `SELECT ... FOR UPDATE` (transaccional, sin huecos).

### 3.2 Motor de cálculo IGV
- `src/utils/fiscal.ts`: `calcLineIgv(price, qty, taxCode, igvRate)`, `calcTotals(lines, discount)`, redondeo a 2 decimales (reglas SUNAT), impuestos por línea (IGV/Exonerado/Inafecto desde `taxes`).
- Tests unitarios con vitest (el repo ya tiene cultura fuerte de tests): casos IGV 18%, exonerado, descuento global, PEN/USD.

### 3.3 Servicio SUNAT (patrón adapter)
- `src/services/sunatService.ts` + `src/services/adapters/sunatInvoiceAdapter.ts` (mismo patrón que `commerceAdapter`): `sendInvoice(invoice)` → `{ status, sunatResponse }`, `queryStatus(numero)`.
- Edge Function `supabase/functions/facturar/index.ts`: recibe el comprobante, construye el XML/JSON del proveedor, lo envía, guarda respuesta. **El token del proveedor vive solo en servidor (env).**
- Estados del flujo: `generado → enviado → aceptado / rechazado` (+ `anulado`); consulta manual de estado.

### 3.4 PDF del comprobante
- jsPDF ya está en el stack → `src/utils/invoicePdf.ts`: formato boleta/factura (datos empresa desde `business_settings`, cliente, líneas, IGV, totales, serie-número, QR opcional).
- Subir PDF a Storage bucket `invoices` (RLS: lectura admin/autenticados; link en el detalle).

### 3.5 UI
- `src/pages/invoices/InvoicesPage.tsx`: tabla **serie-número | tipo | cliente | total | estado (badge)** — igual que el módulo Facturación de SUSII.
- `src/pages/invoices/InvoiceDetailPage.tsx`: detalle + acciones (enviar a SUNAT, consultar estado, anular, descargar PDF/XML).
- Desde `SaleDetailPage`: botón "Emitir boleta/factura" → pregenera el comprobante con los datos congelados de la venta.
- Ruta en `AppRouter.tsx` + permisos `can_issue_invoices`, `can_manage_series` (admin=true, editor=true).

### 3.6 Proveedor de facturación SUNAT (decidir — ver §5)
Opciones reales: **Nubefact** (API REST madura, la más usada por ERPs), **Alanube** (API moderna + sandbox), **Lucode**, **FeryFact**, **Llama.pe**. Criterio: sandbox para desarrollo, costo por comprobante, soporte notas crédito/débito (para Fase 4+), OSE incluido.

**Entregable:** boletas y facturas con IGV 18%, series/correlativo automáticos, envío y estados SUNAT, PDF descargable.

---

## FASE 4 — Consolidación: cuentas por cobrar + reportes  ⏱ ~1 día

- `src/pages/sales/DebtsPage.tsx` (o sección en Ventas): **deudas por cliente** (suma de `sales` con saldo, menos pagos), filtro por cliente, botón "Registrar abono".
- Dashboard: agregar tarjeta "Cuentas por cobrar" (monto total + clientes en deuda).
- Reporte simple de ventas por día/tipo de pago (recharts ya está).
- Notas crédito/débito (07/08) y guía de remisión: **fuera de alcance de este plan** (señalado como siguiente iteración; el adapter debe dejar la puerta abierta).

---

## 5. Decisiones de proveedores (requieren tu OK)

| Servicio | Opciones reales | Recomendación inicial | Nota |
|---|---|---|---|
| **Facturación SUNAT** | Nubefact, Alanube (sandbox), Lucode, FeryFact, Llama.pe | **Alanube o Nubefact** — pedir sandbox para desarrollo | La elección cambia solo el adapter + env, no la UI |
| **Consulta RUC/DNI** | apis.net.pe, ApisPeru, PeruAPI, ApiPeruDev, dniruc.com | Cualquiera con plan free (ej. apis.net.pe) | Mismo razonamiento: adapter conmutable |

> ⚠️ Si prefieres, al arrancar la Fase 3 hago la investigación comparativa en detalle (precios por comprobante, límites, SLA) y te presento una recomendación final antes de integrar.

---

## 6. Resumen de esfuerzo

| Fase | Alcance | Esfuerzo |
|---|---|---|
| **0** Cimientos | Baseline + config fiscal + SettingsPage | 1–1.5 días |
| **1** Clientes doc fiscal | Migration + lookup SUNAT + UI | 1–1.5 días |
| **2** Ventas al crédito | sales/sale_items/sale_payments + POS + stock | 2–3 días |
| **3** Facturación SUNAT | invoices + IGV + adapter + PDF + UI | 3–5 días |
| **4** Consolidación | CxC + reportes | ~1 día |
| **Total** | | **8–12 días hábiles (~2–3 semanas)** |

---

## 7. Riesgos y supuestos

- **RUC/credenciales SUNAT reales:** necesarias para probar envío real; hasta entonces se desarrolla contra sandbox del proveedor.
- **Schema de inventario no versionado:** la Fase 0 lo resuelve; sin ella, las FKs nuevas pueden fallar en entornos frescos.
- **Alcance:** proveedores, compras/OC, caja chica, multi-sede, notas crédito/débito y guías quedan fuera (brechas Alta/Media del reporte, siguiente iteración).
- **Pruebas:** cada fase incluye migraciones idempotentes + tests vitest (servicios, cálculos IGV, adapters) siguiendo el patrón de tests existente del repo.

---

## 8. Guía de activación SUNAT (cuando quieras conectarte)

> La base está lista. Para emitir comprobantes solo falta: proveedor, token, edge functions y UI de facturación.

### 8.1 Elegir proveedor (2 servicios independientes)
1. **Facturación electrónica:** Nubefact, Alanube (tiene sandbox), Lucode, FeryFact o Llama.pe. Pedir credenciales de **sandbox** para desarrollo.
2. **Consulta RUC/DNI** (ya integrada con adapter): apis.net.pe, ApisPeru, PeruAPI, ApiPeruDev o dniruc.com — cualquiera con plan free.

### 8.2 Pasos para activar
1. **Contratar el proveedor de facturación** y obtener token de producción (+ sandbox).
2. **Cargar el token como secret** de la edge function `facturar` (no en el bundle). La app ya guarda `sunat_connected` en `business_settings`; se marca true al verificar el primer envío exitoso.
3. **Llenar `business_settings`** desde Configuración → Negocio: RUC, razón social, dirección, régimen, IGV (18). Las series B001/F001 ya existen en Configuración → Series.
4. **Implementar la Fase 3 restante:**
   - `src/services/sunatService.ts` + `src/services/adapters/sunatInvoiceAdapter.ts` (patrón `commerceAdapter`).
   - Edge function `supabase/functions/facturar/index.ts`: recibe la venta, arma el XML/JSON del proveedor, envía y guarda la respuesta en `invoices.sunat_response`.
   - `src/utils/fiscal.ts` ya tiene validadores de documento; agregar `calcLineIgv`/`calcTotals` (redondeo SUNAT a 2 decimales) + tests.
   - PDF con jsPDF (ya en el stack) y subida a bucket `invoices`.
   - Páginas `InvoicesPage`/`InvoiceDetailPage` y botón "Emitir comprobante" en `SaleDetailPage` (hoy está deshabilitado).
5. **Verificar** con el sandbox del proveedor antes de producción.

### 8.3 Lo que NO cambia al conectar
- El schema (`20260813000005_facturacion.sql`) ya existe.
- El correlativo por serie es transaccional (`next_correlativo`).
- La consulta RUC/DNI ya funciona vía edge function `consulta-ruc-dni` + `sunatLookupAdapter`.
- Las ventas de mostrador guardan snapshot fiscal del cliente → el comprobante nace de la venta sin re-ingresar datos.
