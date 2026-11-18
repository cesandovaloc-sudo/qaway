# Bitácora · 18-nov-2026 · Fix checkout guest — INSERT en `order_items` sin `SELECT` en `orders`

**Proyecto:** `qrusdsqgygfolxfrafyd` · **Ejecutor:** agente opencode · **Autorización:** "puedes corregirlo? verifica" del responsable (18-nov), interpretada como orden de aplicación tras exponer el SQL exacto en chat.
**Migration ID en vivo:** `20261118152905` · **Archivo versionado:** `supabase/migrations/20261118152905_fix_order_items_insert_anon_guest.sql`
**Alcance:** dominio commerce (`orders` / `order_items`). **No toca `gp_*`** y **no cambia el estado de Etapa 6 ni de 6-E**.

---

## 1 · Síntoma y causa raíz

Checkout de invitado: se creaba la orden pero fallaban los ítems con:

```
ERROR: permission denied for table orders (SQLSTATE 42501)
hint: Grant the required privileges to the current role with: GRANT SELECT ON public.orders TO anon;
```

Cadena de causa:

1. `20260812000001_qawa_pagos_commerce.sql:159-161` creó `order_items_insert_own_or_guest` con una referencia directa a `public.orders` en el `WITH CHECK` (`exists (... user_id = auth.uid()) or is_guest_order(order_id)`).
2. `20260919224500_fix_f01_orders_anon_exposure.sql:22-24` revocó correctamente `SELECT` a `anon` en `orders`/`order_items`/`payments` (fix de exposición de PII) **sin ajustar esa política**.
3. PostgreSQL comprueba el privilegio `SELECT` de todas las tablas referenciadas en una expresión de política al planificar, aunque el `OR` luego corte por `is_guest_order()` (que sí es `SECURITY DEFINER`). Resultado: todo INSERT de `anon` en `order_items` muere con 42501.

**No fue causado por el agente:** los commits `448`–`451` solo tocan `doc2/`, servicios `gp_*`, UI/CSS y `dist/`; la última DDL previa era del 17-nov. El commit `ec632103` (10:20, Carlos Sandoval) solo recompiló `dist/`.

## 2 · Evidencia en vivo (antes del fix)

| Dato | Valor |
|---|---|
| Logs `postgres_logs`, rol `authenticator`, sentencia `INSERT INTO public.order_items` | 5 errores 42501: 15:10:53, 15:11:02, 15:18:32, 15:18:56, 15:19:26 UTC |
| `has_table_privilege('anon','public.orders','SELECT')` | `false` |
| `has_table_privilege('anon','public.order_items','INSERT')` | `true` |
| Pedidos guest de hoy | 5, **todos con 0 ítems** |
| Único pedido posterior al 19-sep con ítems | 05-oct, `user_id` no nulo (`authenticated` sí conserva `SELECT`) |

## 3 · Cambio aplicado (transacción única)

1. `create or replace function public.can_insert_order_item(check_order_id uuid)` — `STABLE SECURITY DEFINER`, `SET search_path = public`, owner `postgres`. Devuelve `true` si la orden existe y es del usuario autenticado **o** es guest (`user_id IS NULL`).
2. `grant execute on function public.can_insert_order_item(uuid) to anon, authenticated`.
3. `drop policy` + `create policy "order_items_insert_own_or_guest" ... with check (public.can_insert_order_item(order_id))`.

La lectura de `orders` pasa a privilegios de `definer`, así que la política ya no exige `SELECT` de `anon`. Mismo patrón que el `is_guest_order` ya versionado. **No se re-grantó `SELECT` a `anon`** (eso habría deshecho el fix de PII de septiembre).

## 4 · Verificación

| Chequeo | Resultado |
|---|---|
| `pg_proc`: firma `can_insert_order_item(uuid)`, owner `postgres`, `prosecdef=true`, volatilidad `s`, `search_path=public` | ✅ |
| `routine_privileges`: EXECUTE a `anon` y `authenticated` (además de `PUBLIC`/`postgres`/`service_role`) | ✅ |
| `pg_policy.check_expr` | `can_insert_order_item(order_id)` (sin referencia directa a `orders`) ✅ |
| Simulación `set local role anon` → INSERT en orden guest (con `rollback`) | ✅ 1 fila |
| Simulación `set local role anon` → INSERT en orden de otro usuario | ✅ rechazado: `42501 new row violates row-level security policy for table "order_items"` |
| Simulación `set local role authenticated` + JWT real → INSERT en orden propia | ✅ 1 fila |
| Seguridad preservada | `anon SELECT orders = false`, `anon INSERT order_items = true`, `authenticated SELECT orders = true` |
| Residuos | 0 marcadores de prueba; pedidos 75 e ítems 97 (idénticos a antes) |
| Logs tras el fix (aplicado 15:29:05, consulta 15:29:36) | sin errores nuevos; último 42501 = 15:19:26 |

Nota de honestidad: la simulación usa `set local role` sobre el rol real y se revierte con `rollback`; la prueba end-to-end desde el navegador queda para el responsable.

## 5 · Estado resultante y pendiente

- Checkout guest desbloqueado en la BD; RLS de `orders` y el fix de PII de `20260919224500` siguen intactos.
- Riesgo conocido (preexistente, no ampliado): el helper permite insertar ítems en cualquier orden guest cuyo UUID se conozca — igual que `is_guest_order` desde agosto.
- Error aparte, no tratado: `column orders.amount does not exist` (14:47 y 00:37 del 18-nov) — otra consulta usaría `amount` en vez de `total`.
- Pendiente opcional: prueba real de checkout desde el navegador.
