-- 20261123000002_fix_categories_rls_tenant_scope.sql
-- Objetivo: cerrar la contaminación cruzada entre tenants en `public.categories`.
--
-- Causa:
--   Quedaron dos políticas permisivas heredadas de 20260919160000:
--     * "Allow all operations for categories"  → ALL  USING(true) WITH CHECK(true)
--     * "catalog_write_staff"                  → ALL  auth.role()='authenticated'
--   Al ser permisivas (OR), anulaban la política tenant-scoped existente:
--   cualquier usuario autenticado podía insertar/actualizar/borrar categorías
--   de cualquier tenant, y `anon` podía borrarlas.
--
-- Solución:
--   Se eliminan ambas. La escritura queda gobernada por la política ya existente
--   `categories_tenant_plan_all`:
--     is_platform_admin()
--     OR (tenant_id = get_auth_tenant_id() AND user_can_use_feature('inventario','inventory'))
--   La lectura pública (`categories_select_public`) se mantiene sin cambios.
--
-- Reversible: recrear las políticas originales si se necesita el comportamiento previo.

drop policy if exists "Allow all operations for categories" on public.categories;
drop policy if exists catalog_write_staff on public.categories;
