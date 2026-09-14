-- ============================================================
-- Pagos multi-pasarela — migración
-- ============================================================
-- Objetivo (paso 2 del plan de pagos):
--   1. Permitir el proveedor 'taypi' en payments.
--   2. Permitir los métodos 'taypi' y 'manual' en orders.
--   3. Hacer la idempotencia (REGLA R4) segura con VARIAS pasarelas activas:
--      el identificador de la pasarela solo es único DENTRO de su proveedor.
--
-- Idempotente: se puede ejecutar más de una vez sin efecto adicional.
-- Nada aquí borra datos ni reescribe filas existentes.
-- ============================================================

-- ─── 1. payments.provider: agregar 'taypi' ───────────────────
alter table public.payments drop constraint if exists payments_provider_check;

alter table public.payments
  add constraint payments_provider_check
  check (provider in ('mercadopago', 'taypi', 'culqi', 'stripe', 'manual', 'woocommerce'));

-- ─── 2. orders.payment_method: agregar 'taypi' y 'manual' ────
alter table public.orders drop constraint if exists orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('mercadopago', 'taypi', 'manual', 'yape', 'card', 'pagoefectivo', 'directo', 'stripe'));

-- ─── 3. Idempotencia multi-pasarela (REGLA R4) ───────────────
-- El mismo provider_id puede repetirse entre proveedores distintos; lo que no
-- puede repetirse es el par. Sin este índice, con dos pasarelas activas un pago
-- podría descartarse como "duplicado" del de otra pasarela.
create unique index if not exists idx_payments_provider_provider_id
  on public.payments (provider, provider_id)
  where provider_id is not null;

-- ─── 4. Índice de apoyo para el webhook ──────────────────────
create index if not exists idx_payments_order_status
  on public.payments (order_id, status);
