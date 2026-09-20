-- ============================================================
-- FASE 2: Aislamiento por tenant (products, customers, quotes)
-- Refactorizado a bloques defensivos IF EXISTS (mismo patron
-- que hardening_rls_public_catalog) para evitar 42P01 en bases
-- donde customers/quotations no existen aun.
-- ============================================================
DO $$
BEGIN
  -- products: siempre existe, ADD COLUMN IF NOT EXISTS es seguro
  ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS tenant_id uuid references public.tenants (id) on delete set null;
  CREATE INDEX IF NOT EXISTS products_tenant_idx ON public.products (tenant_id);
  UPDATE public.products SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

  DROP POLICY IF EXISTS "products_public_read" ON public.products;
  CREATE POLICY "products_public_read" ON public.products
    FOR SELECT USING (
      (status = 'active' AND tenant_id IN (
        SELECT id FROM public.tenants WHERE status = 'active' AND deleted_at IS NULL
      ))
      OR auth.role() = 'authenticated'
    );
  DROP POLICY IF EXISTS "products_staff_insert" ON public.products;
  CREATE POLICY "products_tenant_insert" ON public.products
    FOR INSERT WITH CHECK (public.is_admin() OR tenant_id = public.get_auth_tenant_id());
  DROP POLICY IF EXISTS "products_staff_update" ON public.products;
  CREATE POLICY "products_tenant_update" ON public.products
    FOR UPDATE
    USING (public.is_admin() OR tenant_id = public.get_auth_tenant_id())
    WITH CHECK (public.is_admin() OR tenant_id = public.get_auth_tenant_id());
  DROP POLICY IF EXISTS "products_staff_delete" ON public.products;
  CREATE POLICY "products_tenant_delete" ON public.products
    FOR DELETE USING (public.is_admin() OR tenant_id = public.get_auth_tenant_id());
  RAISE NOTICE 'products: tenant_id y policies aplicados.';

  -- customers: solo si existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='customers') THEN
    ALTER TABLE public.customers
      ADD COLUMN IF NOT EXISTS tenant_id uuid references public.tenants (id) on delete set null;
    CREATE INDEX IF NOT EXISTS customers_tenant_idx ON public.customers (tenant_id);
    UPDATE public.customers SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
    DROP POLICY IF EXISTS "sensitive_staff_all" ON public.customers;
    DROP POLICY IF EXISTS "sensitive_delete_admin" ON public.customers;
    CREATE POLICY "customers_tenant_all" ON public.customers
      FOR ALL
      USING (public.is_admin() OR tenant_id = public.get_auth_tenant_id())
      WITH CHECK (public.is_admin() OR tenant_id = public.get_auth_tenant_id());
    RAISE NOTICE 'customers: tenant_id y policies aplicados.';
  ELSE
    RAISE NOTICE 'customers no existe (saltando).';
  END IF;

  -- quotations: solo si existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='quotations') THEN
    ALTER TABLE public.quotations
      ADD COLUMN IF NOT EXISTS tenant_id uuid references public.tenants (id) on delete set null;
    CREATE INDEX IF NOT EXISTS quotations_tenant_idx ON public.quotations (tenant_id);
    UPDATE public.quotations SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
    DROP POLICY IF EXISTS "sensitive_staff_all" ON public.quotations;
    CREATE POLICY "quotations_tenant_all" ON public.quotations
      FOR ALL
      USING (public.is_admin() OR tenant_id = public.get_auth_tenant_id())
      WITH CHECK (public.is_admin() OR tenant_id = public.get_auth_tenant_id());
    RAISE NOTICE 'quotations: tenant_id y policies aplicados.';
  ELSE
    RAISE NOTICE 'quotations no existe (saltando).';
  END IF;

  -- quotation_items: solo si existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='quotation_items') THEN
    DROP POLICY IF EXISTS "sensitive_staff_all" ON public.quotation_items;
    CREATE POLICY "quotation_items_tenant_all" ON public.quotation_items
      FOR ALL
      USING (
        public.is_admin() OR EXISTS (
          SELECT 1 FROM public.quotations q
          WHERE q.id = quotation_items.quotation_id
            AND q.tenant_id = public.get_auth_tenant_id()
        )
      )
      WITH CHECK (
        public.is_admin() OR EXISTS (
          SELECT 1 FROM public.quotations q
          WHERE q.id = quotation_items.quotation_id
            AND q.tenant_id = public.get_auth_tenant_id()
        )
      );
    RAISE NOTICE 'quotation_items: policies aplicados.';
  ELSE
    RAISE NOTICE 'quotation_items no existe (saltando).';
  END IF;

END $$;