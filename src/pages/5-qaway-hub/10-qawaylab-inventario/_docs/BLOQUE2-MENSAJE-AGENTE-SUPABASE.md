# BLOQUE 2 — Instrucciones para el agente especializado en Supabase

> **Para:** Agente Supabase (seguridad de base de datos) · **De:** Buffy (agente de remediación Bloque 1) · **Fecha:** 2026-09-26
> **Repositorio:** `C:\LEO\EMPRESAS\QAWAY LAB\1-QawayLab-Digital\1-qawaylab-web` (rama `main-web`, último commit del Bloque 1: `9578c705`)

## Contexto (léelo primero — 5 min)

Se completó la auditoría de seguridad **run-2** del módulo `10-qawaylab-inventario` (skill `security-audit`, perfil deep/scoped). Resultados: **7 hallazgos confirmados, 16 pendientes de validación en vivo, 3 descartados**.

**Documentos fuente (rutas completas):**

| Documento | Ruta |
|---|---|
| Reporte ejecutivo | `C:\Users\csand\security-audit-skill\1-qawaylab-web\run-2\REPORT.md` |
| Detalle de confirmados (con fixes propuestos) | `C:\Users\csand\security-audit-skill\1-qawaylab-web\run-2\FINDINGS-DETAIL.md` |
| **16 pendientes + SQL de verificación** | `C:\Users\csand\security-audit-skill\1-qawaylab-web\run-2\NEEDS-VALIDATION.md` |
| Registros estructurados | `C:\Users\csand\security-audit-skill\1-qawaylab-web\run-2\findings.json` |
| Bitácora del Bloque 1 (qué ya se hizo en código) | `src/pages/5-qaway-hub/10-qawaylab-inventario/_docs/bitacora-bloque1-remediacion.md` |

**Lo que el Bloque 1 YA resolvió en código (NO lo repitas):** saneamiento del DSL `or=`, filtro `user_id` en fallback de pagos, proyección pública sin `cost/stock`, checkout fail-closed (propaga errores reales), panel de pedidos web sin datos ficticios, env del bundle, endurecimiento de la Edge Function `consulta-ruc-dni` (ya exige rol `user_app_role` fail-closed — tu trabajo es asegurar que ese RPC exista y sea correcto en vivo), script de validación blindado.

## Tu misión

Cerrar la superficie de seguridad del backend Supabase del módulo inventario, en este orden. **Paso 0 primero** (decide todo lo demás).

---

### PASO 0 — Verificación owner (SOLO LECTURA, sin cambios)

Ejecuta el paquete SQL completo de la sección **"Paquete owner-observed"** en `NEEDS-VALIDATION.md` (rutas arriba) y archiva el resultado. Decide por tabla/función:

- `relrowsecurity = false` en las 20 tablas baseline → **Paso 2 aplicable tal cual**.
- `proacl` de `restore_stock`/`next_correlativo`/`next_sale_number` con EXECUTE a `public`/`anon` → **Paso 3 aplicable**.
- `pg_policies` de las 7 tablas financieras con `using (true)` → **Paso 4 aplicable**.
- **`select payment_method, count(*) from orders group by 1`** — si existen pedidos con `taypi`/`manual`, el CHECK vivo fue ampliado fuera del repo: en ese caso NO recrees el CHECK original (romperías pedidos); documenta el dominio real y solo fail-closed del frontend (ya hecho) aplica. Si NO existen, aplica el CHECK ampliado versionado (Paso 5).

### PASO 1 — 🔴 PRIORIDAD: bloquear auto-otorgamiento de permisos (C-1, HIGH, ya confirmado)

Un autenticado puede hacer `UPDATE users SET permissions = '{"can_access_fiscal_settings": true}' WHERE id = auth.uid()`: el trigger `prevent_role_escalation` solo vigila la columna `role`, y `has_permission()` (SECURITY DEFINER) consume esa columna self-writable para fiscal/ventas/facturación. Evidencia: `supabase/migrations/20260812000000_auth_roles_rls.sql:98-138` y `20260813000003_config_fiscal.sql:118-182`.

```sql
-- En la migración consolidada:
create or replace function public.prevent_permissions_selfwrite()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin()
     and (new.permissions is distinct from old.permissions
          or new.role is distinct from old.role) then
    raise exception 'solo admin puede cambiar role/permissions';
  end if;
  return new;
end $$;

drop trigger if exists users_guard_permissions on public.users;
create trigger users_guard_permissions
  before update on public.users
  for each row execute function public.prevent_permissions_selfwrite();
```

Criterio de aceptación: con un usuario no-admin, `update users set permissions = ... where id = auth.uid()` debe fallar; el mismo update por un admin debe funcionar.

### PASO 2 — RLS en las 20 tablas baseline (N-01, potencialmente critical)

Tablas (de `20260813000001_baseline_inventario.sql`): categories, inventory_locations, products, product_variants, product_images, inventory_movements, price_lists, product_prices, customers, quotations, quotation_items, bundles, bundle_items, liquidation_campaigns, liquidation_items, catalogs, catalog_items, ai_suggestions, pricing_rules, shared_access_links.

Modelo por tabla (adapta con el resultado del Paso 0):
- **Lectura pública controlada** (products/categories/bundles/catalogs y sus items): policy SELECT `using (true)` **solo si la fila es pública**; para columnas sensibles usa la proyección del frontend ya hecha y considera vista pública.
- **Escritura**: `using/with check (public.has_permission('<permiso>'))` o rol admin según la tabla (p.ej. `can_adjust_stock` para inventory_movements).
- **shared_access_links**: owner-or-admin — `using/with check (created_by = auth.uid() or public.is_admin())` (cierra C-3).

Criterio: repetir el query del Paso 0 → todas en `relrowsecurity = true`; pruebas con dummy principals: un viewer NO puede crear producto; un guest no lee customers.

### PASO 3 — Revoke de RPCs SECURITY DEFINER (N-02)

```sql
revoke execute on function public.restore_stock(uuid, numeric) from public, anon;
revoke execute on function public.next_correlativo(uuid) from public, anon;
revoke execute on function public.next_sale_number() from public, anon;
-- luego grant fino:
grant execute on function public.restore_stock(uuid, numeric) to authenticated; -- + check interno de rol en la función
```

Además: añade dentro de cada función un check de autorización (patrón: `if not public.has_permission('can_adjust_stock') then raise exception ... end if;`) — el revoke solo es la primera capa. `next_correlativo` debe exigir rol de facturación.

### PASO 4 — Policies reales en finanzas/contabilidad (N-03)

Reemplazar `using (true)`/`with check (true)` de purchase_orders, purchase_order_items, petty_cash_movements, expenses, transactions, accounting_entries, accounting_entry_lines (evidencia: `20260813000006:91-158`, `20260813000007:50-82`) por predicates de rol (`has_permission('can_access_fiscal_settings')`/admin). Y:

```sql
-- la vista bypasea RLS de las tablas base (no es security_invoker):
drop view if exists public.accounting_entry_balances;
create view public.accounting_entry_balances
with (security_invoker = true) as ...  -- misma definición actual
```

### PASO 5 — Storage + CHECK de orders (según Paso 0)

- **products bucket** (N-10): policy insert con binding de rol (`has_permission('can_upload_photos')` o `can_capture_products`) y key-prefix obligatorio (`with check (bucket_id='products' and (name) like 'products/%' and ...)`) — coordina el prefijo con el código.
- **resources bucket** (N-11): añadir policies UPDATE/DELETE con owner-or-admin; evaluar privatizar el bucket y servir vouchers por signed URL (decisión de negocio, consúltala).
- **CHECK de orders.payment_method** (N-04): según el resultado del Paso 0 (ver arriba). Si aplica ampliar: `alter table public.orders drop constraint orders_payment_method_check; alter table public.orders add constraint orders_payment_method_check check (payment_method in ('yape','card','pagoefectivo','directo','stripe','mercadopago','taypi','manual'));`

### PASO 6 — Limpieza y refuerzos varios

- **N-16**: desactivar/eliminar en la DB viva los usuarios `adminx@test.local` y `comprador@test.local` (existen solo si el script corrió contra este proyecto).
- **N-15**: crear `add_stock(uuid, numeric)` SECURITY DEFINER con check de `can_adjust_stock` (el código de `purchaseService.ts:212` ya lo invoca; hoy da PGRST202 silencioso y el stock no entra).
- **N-06/N-07**: verificar `verify_jwt=true` en la function `consulta-ruc-dni`; el código ya exige rol — valida que `user_app_role('inventario')` exista y devuelva los roles correctos; refuerza rate-limit a nivel gateway/quotas si la plataforma lo permite.
- **N-05**: grep del desplegado actual por `VITE_OPENAI` (si apareció en un build, rotar la clave).
- **N-14**: documenta la semántica viva de `user_app_role`/`is_platform_admin` y evalúa RLS por app (reporte, no necesariamente implementación).

## Reglas de trabajo

1. **UNA migración consolidada versionada** en `supabase/migrations/` (formato `YYYYMMDDHHMMSS_bloque2_seguridad_run2.sql`), idempotente (`drop policy if exists` + `create policy`), NUNCA modificar migraciones existentes.
2. Sin `git push` (lo hace el agente de deploy). Commit con la nomenclatura del repo. **Commit total.**
3. Nada destructivo sobre datos: las policies restrictivas se prueban primero en staging/local (`supabase start` + `validate-order-flow.sh` con env de passwords).
4. Al terminar, actualiza `C:\Users\csand\security-audit-skill\1-qawaylab-web\run-2\findings.json` y el ledger promoviendo/descartando cada `needs_validation` con la evidencia del Paso 0, y añade tu bitácora en `_docs/bitacora-bloque2-supabase.md`.
5. **Después de tu Bloque 2** se ejecuta el QA funcional (gstack-qa) — no antes.
