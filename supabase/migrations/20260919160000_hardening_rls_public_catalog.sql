-- ============================================================
-- HARDENING RLS — Catálogo e Inventario Legacy (Idempotente & Condicional)
-- Revisión 2026-09-19: restaurados filtros específicos por tabla en SELECT anon.
-- USING(true) genérico reemplazado por gates correctos: status/is_public/is_active.
-- Evita exponer borradores, inactivos y reglas de precio internas a usuarios anón.
-- ============================================================

DO $$
BEGIN

  -- ══════════════════════════════════════════════════════════════
  -- BLOQUE A: TABLAS CON FILTRO ESPECÍFICO EN SELECT ANON
  -- Estas tablas NO pueden tener USING(true): tienen borradores o datos internos.
  -- ══════════════════════════════════════════════════════════════

  -- ── bundles: solo activos visibles al público ──
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bundles') THEN
    EXECUTE 'ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS bundles_select_public ON public.bundles;';
    EXECUTE 'CREATE POLICY bundles_select_public ON public.bundles FOR SELECT USING (status = ''active'' OR auth.role() = ''authenticated'');';
    EXECUTE 'DROP POLICY IF EXISTS catalog_write_staff ON public.bundles;';
    EXECUTE 'CREATE POLICY catalog_write_staff ON public.bundles FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');';
    EXECUTE 'GRANT SELECT ON public.bundles TO anon;';
    EXECUTE 'GRANT ALL ON public.bundles TO authenticated, service_role;';
    RAISE NOTICE 'RLS aplicado en public.bundles (filtro: status=active).';
  ELSE
    RAISE NOTICE 'Tabla public.bundles no existe (saltando).';
  END IF;

  -- ── catalogs: solo catálogos marcados is_public ──
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'catalogs') THEN
    EXECUTE 'ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS catalogs_select_public ON public.catalogs;';
    EXECUTE 'CREATE POLICY catalogs_select_public ON public.catalogs FOR SELECT USING (is_public = true OR auth.role() = ''authenticated'');';
    EXECUTE 'DROP POLICY IF EXISTS catalog_write_staff ON public.catalogs;';
    EXECUTE 'CREATE POLICY catalog_write_staff ON public.catalogs FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');';
    EXECUTE 'GRANT SELECT ON public.catalogs TO anon;';
    EXECUTE 'GRANT ALL ON public.catalogs TO authenticated, service_role;';
    RAISE NOTICE 'RLS aplicado en public.catalogs (filtro: is_public=true).';
  ELSE
    RAISE NOTICE 'Tabla public.catalogs no existe (saltando).';
  END IF;

  -- ── price_lists: solo listas activas visibles al público ──
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'price_lists') THEN
    EXECUTE 'ALTER TABLE public.price_lists ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS price_lists_select_public ON public.price_lists;';
    EXECUTE 'CREATE POLICY price_lists_select_public ON public.price_lists FOR SELECT USING (is_active = true OR auth.role() = ''authenticated'');';
    EXECUTE 'DROP POLICY IF EXISTS catalog_write_staff ON public.price_lists;';
    EXECUTE 'CREATE POLICY catalog_write_staff ON public.price_lists FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');';
    EXECUTE 'GRANT SELECT ON public.price_lists TO anon;';
    EXECUTE 'GRANT ALL ON public.price_lists TO authenticated, service_role;';
    RAISE NOTICE 'RLS aplicado en public.price_lists (filtro: is_active=true).';
  ELSE
    RAISE NOTICE 'Tabla public.price_lists no existe (saltando).';
  END IF;

  -- ── pricing_rules: solo reglas activas (protege reglas internas) ──
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pricing_rules') THEN
    EXECUTE 'ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS pricing_rules_select_public ON public.pricing_rules;';
    EXECUTE 'CREATE POLICY pricing_rules_select_public ON public.pricing_rules FOR SELECT USING (is_active = true OR auth.role() = ''authenticated'');';
    EXECUTE 'DROP POLICY IF EXISTS catalog_write_staff ON public.pricing_rules;';
    EXECUTE 'CREATE POLICY catalog_write_staff ON public.pricing_rules FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');';
    EXECUTE 'GRANT SELECT ON public.pricing_rules TO anon;';
    EXECUTE 'GRANT ALL ON public.pricing_rules TO authenticated, service_role;';
    RAISE NOTICE 'RLS aplicado en public.pricing_rules (filtro: is_active=true).';
  ELSE
    RAISE NOTICE 'Tabla public.pricing_rules no existe (saltando).';
  END IF;

  -- ── liquidation_campaigns: solo campañas activas ──
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'liquidation_campaigns') THEN
    EXECUTE 'ALTER TABLE public.liquidation_campaigns ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS liquidation_campaigns_select_public ON public.liquidation_campaigns;';
    EXECUTE 'CREATE POLICY liquidation_campaigns_select_public ON public.liquidation_campaigns FOR SELECT USING (status = ''active'' OR auth.role() = ''authenticated'');';
    EXECUTE 'DROP POLICY IF EXISTS catalog_write_staff ON public.liquidation_campaigns;';
    EXECUTE 'CREATE POLICY catalog_write_staff ON public.liquidation_campaigns FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');';
    EXECUTE 'GRANT SELECT ON public.liquidation_campaigns TO anon;';
    EXECUTE 'GRANT ALL ON public.liquidation_campaigns TO authenticated, service_role;';
    RAISE NOTICE 'RLS aplicado en public.liquidation_campaigns (filtro: status=active).';
  ELSE
    RAISE NOTICE 'Tabla public.liquidation_campaigns no existe (saltando).';
  END IF;

  -- ── inventory_locations: solo staff, sin acceso anon ──
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inventory_locations') THEN
    EXECUTE 'ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS inventory_locations_select_staff ON public.inventory_locations;';
    EXECUTE 'CREATE POLICY inventory_locations_select_staff ON public.inventory_locations FOR SELECT USING (auth.role() = ''authenticated'');';
    EXECUTE 'DROP POLICY IF EXISTS catalog_write_staff ON public.inventory_locations;';
    EXECUTE 'CREATE POLICY catalog_write_staff ON public.inventory_locations FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');';
    EXECUTE 'GRANT ALL ON public.inventory_locations TO authenticated, service_role;';
    RAISE NOTICE 'RLS aplicado en public.inventory_locations (solo staff).';
  ELSE
    RAISE NOTICE 'Tabla public.inventory_locations no existe (saltando).';
  END IF;

  -- ══════════════════════════════════════════════════════════════
  -- BLOQUE B: TABLAS DE ITEMS / IMÁGENES (USING true es correcto:
  -- heredan visibilidad del objeto padre; anon no llega sin el ID padre)
  -- ══════════════════════════════════════════════════════════════
  DECLARE
    t text;
    open_catalog_items text[] := ARRAY[
      'bundle_items', 'catalog_items', 'categories',
      'product_images', 'product_variants', 'product_prices',
      'liquidation_items'
    ];
  BEGIN
    FOREACH t IN ARRAY open_catalog_items LOOP
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_select_public', t);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (true);', t || '_select_public', t);
        EXECUTE format('DROP POLICY IF EXISTS catalog_write_staff ON public.%I;', t);
        EXECUTE format('CREATE POLICY catalog_write_staff ON public.%I FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');', t);
        EXECUTE format('GRANT SELECT ON public.%I TO anon;', t);
        EXECUTE format('GRANT ALL ON public.%I TO authenticated, service_role;', t);
        RAISE NOTICE 'RLS aplicado en public.% (SELECT abierto — items hijo).', t;
      ELSE
        RAISE NOTICE 'Tabla public.% no existe (saltando).', t;
      END IF;
    END LOOP;
  END;

  -- ══════════════════════════════════════════════════════════════
  -- BLOQUE C: TABLAS SENSIBLES (PII, cotizaciones, kardex)
  -- Solo staff autenticado. Borrado: solo admin.
  -- ══════════════════════════════════════════════════════════════
  DECLARE
    t text;
    sensitive_tables text[] := ARRAY[
      'customers', 'quotations', 'quotation_items',
      'inventory_movements', 'ai_suggestions'
    ];
  BEGIN
    FOREACH t IN ARRAY sensitive_tables LOOP
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('DROP POLICY IF EXISTS sensitive_staff_all ON public.%I;', t);
        EXECUTE format('CREATE POLICY sensitive_staff_all ON public.%I FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');', t);
        EXECUTE format('DROP POLICY IF EXISTS sensitive_delete_admin ON public.%I;', t);
        EXECUTE format('CREATE POLICY sensitive_delete_admin ON public.%I FOR DELETE USING (public.is_admin());', t);
        EXECUTE format('GRANT ALL ON public.%I TO authenticated, service_role;', t);
        RAISE NOTICE 'RLS sensible aplicado en public.% (staff + delete admin).', t;
      ELSE
        RAISE NOTICE 'Tabla public.% no existe (saltando).', t;
      END IF;
    END LOOP;
  END;

  -- ══════════════════════════════════════════════════════════════
  -- BLOQUE D: LINKS DE INVITADO — SELECT anon acotado a vigentes
  -- ══════════════════════════════════════════════════════════════
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shared_access_links') THEN
    EXECUTE 'ALTER TABLE public.shared_access_links ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS guest_links_select_active ON public.shared_access_links;';
    EXECUTE 'CREATE POLICY guest_links_select_active ON public.shared_access_links FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));';
    EXECUTE 'DROP POLICY IF EXISTS guest_links_staff_all ON public.shared_access_links;';
    EXECUTE 'CREATE POLICY guest_links_staff_all ON public.shared_access_links FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');';
    EXECUTE 'GRANT SELECT ON public.shared_access_links TO anon;';
    EXECUTE 'GRANT ALL ON public.shared_access_links TO authenticated, service_role;';
    RAISE NOTICE 'RLS aplicado en shared_access_links (anon: solo vigentes).';
  ELSE
    RAISE NOTICE 'Tabla public.shared_access_links no existe (saltando).';
  END IF;

END $$;


