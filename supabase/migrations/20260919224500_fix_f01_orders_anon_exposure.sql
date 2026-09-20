-- ============================================================
-- F-01 FIX CRITICO: Cerrar orders/order_items/payments a anon
-- orders_public_read USING(true) + GRANT SELECT TO anon
-- permite listar todos los pedidos con shipping/totales/notas.
-- 2026-09-19 — Auditoria run-1.
-- ============================================================

-- 1. Eliminar policy SELECT abierta en orders (guest checkout no necesita SELECT)
DROP POLICY IF EXISTS "orders_public_read" ON public.orders;

-- 2. Policy correcta: propietario autenticado o admin ven sus pedidos
--    Invitados (guest) NO necesitan SELECT: la confirmacion viene del redirect MP.
DROP POLICY IF EXISTS "orders_read_own_or_admin" ON public.orders;
CREATE POLICY "orders_read_own_or_admin" ON public.orders
  FOR SELECT USING (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

-- 3. Revocar GRANT SELECT TO anon en tablas financieras
--    (grant original: 20260812000001_qawa_pagos_commerce.sql:185)
REVOKE SELECT ON public.orders FROM anon;
REVOKE SELECT ON public.order_items FROM anon;
REVOKE SELECT ON public.payments FROM anon;

-- Mantener INSERT anon para que guest checkout siga funcionando
GRANT INSERT ON public.orders, public.order_items TO anon;

-- 4. Proteccion adicional: INSERT anon en orders no puede marcar status!=pending
DROP POLICY IF EXISTS "orders_public_insert" ON public.orders;
CREATE POLICY "orders_public_insert" ON public.orders
  FOR INSERT WITH CHECK (
    status = 'pending'
    AND user_id IS NULL
  );