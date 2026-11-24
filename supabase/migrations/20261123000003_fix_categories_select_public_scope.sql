-- 20261123000003_fix_categories_select_public_scope.sql
-- Objetivo: cerrar la lectura cruzada de `public.categories` sin catálogo público.
--
-- Causa:
--   `categories_select_public` estaba definida como USING (true), así que cualquiera
--   (incluido `anon`) podía leer las categorías de todos los tenants.
--
-- Solución:
--   Solo se permite leer una categoría cuando:
--     * el usuario es super admin de plataforma, o
--     * la categoría pertenece a su propio tenant (tenant_id = get_auth_tenant_id()), o
--     * el tenant dueño tiene contratado el add-on `catalogo_publico` activo
--       (tenant_has_app_feature(..., 'inventario', 'public_catalog')).
--
-- Reversible: recrear la política anterior con USING (true).

drop policy if exists categories_select_public on public.categories;

create policy categories_select_public on public.categories
  for select using (
    public.is_platform_admin()
    or (tenant_id is not null and tenant_id = public.get_auth_tenant_id())
    or (
      tenant_id is not null
      and public.tenant_has_app_feature(tenant_id, 'inventario', 'public_catalog')
    )
  );
