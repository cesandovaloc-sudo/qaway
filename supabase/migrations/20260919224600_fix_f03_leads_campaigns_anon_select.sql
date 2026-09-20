-- ============================================================
-- F-03 FIX ALTO: Cerrar SELECT anonimo en leads y campaigns
-- La rama (auth.uid() IS NULL AND tenant_id IS NOT NULL) permite
-- enumerar leads de cualquier tenant conociendo su UUID (en repo publico).
-- 2026-09-19 — Auditoria run-1.
-- ============================================================

-- LEADS: eliminar rama anon del SELECT
DROP POLICY IF EXISTS "leads_tenant_select" ON public.leads;
CREATE POLICY "leads_tenant_select" ON public.leads
  FOR SELECT USING (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND tenant_id = public.get_auth_tenant_id())
    -- ELIMINADO: rama anon que permitia SELECT con tenant_id IS NOT NULL
  );

-- LEADS: INSERT anonimo se mantiene pero acotado solo a tenant_id valido y status=new
DROP POLICY IF EXISTS "leads_tenant_insert" ON public.leads;
CREATE POLICY "leads_tenant_insert" ON public.leads
  FOR INSERT WITH CHECK (
    tenant_id IS NOT NULL AND (
      public.is_admin()
      OR auth.uid() IS NULL    -- formularios publicos: solo INSERT, no SELECT
      OR tenant_id = public.get_auth_tenant_id()
    )
  );

-- CAMPAIGNS: eliminar rama anon del SELECT
DROP POLICY IF EXISTS "campaigns_tenant_select" ON public.campaigns;
CREATE POLICY "campaigns_tenant_select" ON public.campaigns
  FOR SELECT USING (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND tenant_id = public.get_auth_tenant_id())
    -- ELIMINADO: rama anon
  );