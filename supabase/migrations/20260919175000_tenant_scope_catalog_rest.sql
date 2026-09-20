-- ============================================================
-- FASE 3: tenant_id resto del catalogo + defaults automaticos
-- Refactorizado a bloques defensivos IF EXISTS.
-- ============================================================
DO $$
DECLARE
  t text;
  legacy_tables text[] := ARRAY[
    'bundles','catalogs','price_lists','pricing_rules',
    'liquidation_campaigns','inventory_locations','inventory_movements',
    'ai_suggestions','shared_access_links'
  ];
BEGIN
  -- DEFAULT en products/customers/quotations (ya existen tras 174000)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='tenant_id') THEN
    ALTER TABLE public.products ALTER COLUMN tenant_id SET DEFAULT public.get_auth_tenant_id();
    RAISE NOTICE 'products: default tenant_id aplicado.';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='customers') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='customers' AND column_name='tenant_id') THEN
      ALTER TABLE public.customers ALTER COLUMN tenant_id SET DEFAULT public.get_auth_tenant_id();
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='quotations') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='quotations' AND column_name='tenant_id') THEN
      ALTER TABLE public.quotations ALTER COLUMN tenant_id SET DEFAULT public.get_auth_tenant_id();
    END IF;
  END IF;

  -- Tablas legacy: ADD COLUMN IF NOT EXISTS + DEFAULT + index + backfill + policies
  FOREACH t IN ARRAY legacy_tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL;', t);
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET DEFAULT public.get_auth_tenant_id();', t);
      EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (tenant_id);', t||'_tenant_idx', t);
      EXECUTE format('UPDATE public.%I SET tenant_id = ''00000000-0000-0000-0000-000000000001'' WHERE tenant_id IS NULL;', t);
      RAISE NOTICE 'Tabla %: tenant_id configurado.', t;
    ELSE
      RAISE NOTICE 'Tabla % no existe (saltando).', t;
    END IF;
  END LOOP;

  -- Policies de escritura (solo si tabla existe) — SELECT gates ya definidos en 20260919160000
  -- bundles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='bundles') THEN
    DROP POLICY IF EXISTS "catalog_write_staff" ON public.bundles;
    DROP POLICY IF EXISTS "bundles_tenant_write" ON public.bundles;
    DROP POLICY IF EXISTS "bundles_tenant_ud" ON public.bundles;
    DROP POLICY IF EXISTS "bundles_tenant_del" ON public.bundles;
    EXECUTE 'CREATE POLICY bundles_tenant_write ON public.bundles FOR INSERT WITH CHECK (public.is_admin() OR tenant_id = public.get_auth_tenant_id());';
    EXECUTE 'CREATE POLICY bundles_tenant_ud ON public.bundles FOR UPDATE USING (public.is_admin() OR tenant_id = public.get_auth_tenant_id()) WITH CHECK (public.is_admin() OR tenant_id = public.get_auth_tenant_id());';
    EXECUTE 'CREATE POLICY bundles_tenant_del ON public.bundles FOR DELETE USING (public.is_admin() OR tenant_id = public.get_auth_tenant_id());';
  END IF;
  -- inventory_movements
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='inventory_movements') THEN
    DROP POLICY IF EXISTS "sensitive_staff_all" ON public.inventory_movements;
    DROP POLICY IF EXISTS "movements_tenant_all" ON public.inventory_movements;
    EXECUTE 'CREATE POLICY movements_tenant_all ON public.inventory_movements FOR ALL USING (public.is_admin() OR tenant_id = public.get_auth_tenant_id()) WITH CHECK (public.is_admin() OR tenant_id = public.get_auth_tenant_id());';
  END IF;
  -- ai_suggestions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='ai_suggestions') THEN
    DROP POLICY IF EXISTS "sensitive_staff_all" ON public.ai_suggestions;
    DROP POLICY IF EXISTS "ai_tenant_all" ON public.ai_suggestions;
    EXECUTE 'CREATE POLICY ai_tenant_all ON public.ai_suggestions FOR ALL USING (public.is_admin() OR tenant_id = public.get_auth_tenant_id()) WITH CHECK (public.is_admin() OR tenant_id = public.get_auth_tenant_id());';
  END IF;

  RAISE NOTICE 'Fase 3 completa: tablas legacy procesadas segun disponibilidad.';
END $$;