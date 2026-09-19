-- ============================================================
-- HARDENING RLS — Catálogo e Inventario Legacy (Idempotente & Condicional)
-- Verifica la existencia física de cada tabla en information_schema
-- antes de habilitar RLS, aplicar políticas y otorgar grants.
-- Garantiza que tablas no creadas no revienten el despliegue en bases limpias.
-- ============================================================

DO $$
DECLARE
  t text;
  public_catalog_tables text[] := ARRAY[
    'bundles', 'bundle_items', 'catalogs', 'catalog_items',
    'categories', 'product_images', 'product_variants', 'product_prices',
    'price_lists', 'pricing_rules', 'liquidation_campaigns', 'liquidation_items'
  ];
  sensitive_staff_tables text[] := ARRAY[
    'customers', 'quotations', 'quotation_items', 'inventory_movements', 'ai_suggestions', 'inventory_locations'
  ];
BEGIN
  -- ─── 1. TABLAS DE CATÁLOGO PÚBLICO ───
  FOREACH t IN ARRAY public_catalog_tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
      
      -- Política SELECT pública/staff
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_select_public', t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (true);', t || '_select_public', t);

      -- Política WRITE staff autenticado
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'catalog_write_staff', t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');', 'catalog_write_staff', t);

      -- Grants
      EXECUTE format('GRANT SELECT ON public.%I TO anon;', t);
      EXECUTE format('GRANT ALL ON public.%I TO authenticated, service_role;', t);
      RAISE NOTICE 'RLS y políticas aplicadas con éxito en public.%', t;
    ELSE
      RAISE NOTICE 'Tabla public.% no existe en esta base de datos (saltando).', t;
    END IF;
  END LOOP;

  -- ─── 2. TABLAS SENSIBLES OPERATIVAS STAFF ───
  FOREACH t IN ARRAY sensitive_staff_tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);

      -- Política SELECT & WRITE solo staff autenticado
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'sensitive_staff_all', t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');', 'sensitive_staff_all', t);

      -- Política DELETE solo admin
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'sensitive_delete_admin', t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE USING (public.is_admin());', 'sensitive_delete_admin', t);

      -- Grants
      EXECUTE format('GRANT ALL ON public.%I TO authenticated, service_role;', t);
      RAISE NOTICE 'RLS y políticas de protección staff aplicadas con éxito en public.%', t;
    ELSE
      RAISE NOTICE 'Tabla public.% no existe en esta base de datos (saltando).', t;
    END IF;
  END LOOP;

  -- ─── 3. LINKS DE INVITADO (shared_access_links) ───
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shared_access_links') THEN
    EXECUTE 'ALTER TABLE public.shared_access_links ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS guest_links_select_active ON public.shared_access_links;';
    EXECUTE 'CREATE POLICY guest_links_select_active ON public.shared_access_links FOR SELECT USING (is_active = true and (expires_at is null or expires_at > now()));';
    EXECUTE 'DROP POLICY IF EXISTS guest_links_staff_all ON public.shared_access_links;';
    EXECUTE 'CREATE POLICY guest_links_staff_all ON public.shared_access_links FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');';
    EXECUTE 'GRANT SELECT ON public.shared_access_links TO anon;';
    EXECUTE 'GRANT ALL ON public.shared_access_links TO authenticated, service_role;';
    RAISE NOTICE 'RLS aplicado en shared_access_links.';
  ELSE
    RAISE NOTICE 'Tabla public.shared_access_links no existe en esta base de datos (saltando).';
  END IF;

END $$;

