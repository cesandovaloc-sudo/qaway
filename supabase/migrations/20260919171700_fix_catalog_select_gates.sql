-- ============================================================
-- FIX: Restaurar filtros SELECT especificos en catalogo legacy
-- Corrige regresion introducida en 20260919160000 donde
-- USING(true) exponia borradores, inactivos y reglas de
-- precio internas a usuarios anonimos.
-- Auditado 2026-09-19 por agente externo.
-- ============================================================

DO $$
BEGIN

  -- bundles: solo activos visibles al publico
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bundles') THEN
    EXECUTE 'DROP POLICY IF EXISTS bundles_select_public ON public.bundles;';
    EXECUTE 'CREATE POLICY bundles_select_public ON public.bundles FOR SELECT USING (status = ''active'' OR auth.role() = ''authenticated'');';
    RAISE NOTICE 'bundles: SELECT corregido -> status=active.';
  ELSE
    RAISE NOTICE 'bundles no existe (saltando).';
  END IF;

  -- catalogs: solo catalogos marcados is_public
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'catalogs') THEN
    EXECUTE 'DROP POLICY IF EXISTS catalogs_select_public ON public.catalogs;';
    EXECUTE 'CREATE POLICY catalogs_select_public ON public.catalogs FOR SELECT USING (is_public = true OR auth.role() = ''authenticated'');';
    RAISE NOTICE 'catalogs: SELECT corregido -> is_public=true.';
  ELSE
    RAISE NOTICE 'catalogs no existe (saltando).';
  END IF;

  -- price_lists: solo listas activas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'price_lists') THEN
    EXECUTE 'DROP POLICY IF EXISTS price_lists_select_public ON public.price_lists;';
    EXECUTE 'CREATE POLICY price_lists_select_public ON public.price_lists FOR SELECT USING (is_active = true OR auth.role() = ''authenticated'');';
    RAISE NOTICE 'price_lists: SELECT corregido -> is_active=true.';
  ELSE
    RAISE NOTICE 'price_lists no existe (saltando).';
  END IF;

  -- pricing_rules: solo reglas activas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pricing_rules') THEN
    EXECUTE 'DROP POLICY IF EXISTS pricing_rules_select_public ON public.pricing_rules;';
    EXECUTE 'CREATE POLICY pricing_rules_select_public ON public.pricing_rules FOR SELECT USING (is_active = true OR auth.role() = ''authenticated'');';
    RAISE NOTICE 'pricing_rules: SELECT corregido -> is_active=true.';
  ELSE
    RAISE NOTICE 'pricing_rules no existe (saltando).';
  END IF;

  -- liquidation_campaigns: solo campanas activas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'liquidation_campaigns') THEN
    EXECUTE 'DROP POLICY IF EXISTS liquidation_campaigns_select_public ON public.liquidation_campaigns;';
    EXECUTE 'CREATE POLICY liquidation_campaigns_select_public ON public.liquidation_campaigns FOR SELECT USING (status = ''active'' OR auth.role() = ''authenticated'');';
    RAISE NOTICE 'liquidation_campaigns: SELECT corregido -> status=active.';
  ELSE
    RAISE NOTICE 'liquidation_campaigns no existe (saltando).';
  END IF;

  -- inventory_locations: solo staff, nunca anon
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inventory_locations') THEN
    EXECUTE 'DROP POLICY IF EXISTS inventory_locations_select_staff ON public.inventory_locations;';
    EXECUTE 'CREATE POLICY inventory_locations_select_staff ON public.inventory_locations FOR SELECT USING (auth.role() = ''authenticated'');';
    RAISE NOTICE 'inventory_locations: SELECT corregido -> solo authenticated.';
  ELSE
    RAISE NOTICE 'inventory_locations no existe (saltando).';
  END IF;

  RAISE NOTICE 'Fix de gates SELECT completado.';

END $$;