-- Problemas 3-6: el catálogo público debe pertenecer a un tenant activo y
-- requerir el add-on contratado. Los items heredan el mismo límite del padre.

alter table public.catalogs enable row level security;
alter table public.catalog_items enable row level security;

alter table public.catalog_items add column if not exists tenant_id uuid references public.tenants(id) on delete restrict;
update public.catalog_items ci
set tenant_id = c.tenant_id
from public.catalogs c
where c.id = ci.catalog_id
  and ci.tenant_id is null;
alter table public.catalog_items alter column tenant_id set default public.get_auth_tenant_id();
create index if not exists catalog_items_tenant_idx on public.catalog_items (tenant_id);

drop policy if exists catalogs_select_public on public.catalogs;
create policy catalogs_select_public on public.catalogs
  for select using (
    is_public = true
    and exists (
      select 1 from public.tenants t
      where t.id = catalogs.tenant_id
        and t.status = 'active'
        and t.deleted_at is null
    )
    and public.tenant_has_app_feature(tenant_id, 'inventario', 'public_catalog')
  );

drop policy if exists catalog_write_staff on public.catalogs;
create policy catalog_write_staff on public.catalogs
  for all using (
    public.is_platform_admin()
    or (tenant_id = public.get_auth_tenant_id()
        and public.user_can_use_feature('inventario', 'public_catalog'))
  ) with check (
    public.is_platform_admin()
    or (tenant_id = public.get_auth_tenant_id()
        and public.user_can_use_feature('inventario', 'public_catalog'))
  );

drop policy if exists catalog_items_select_public on public.catalog_items;
create policy catalog_items_select_public on public.catalog_items
  for select using (
    exists (
      select 1 from public.catalogs c
      where c.id = catalog_items.catalog_id
        and c.is_public = true
        and public.tenant_has_app_feature(c.tenant_id, 'inventario', 'public_catalog')
    )
  );

drop policy if exists catalog_write_staff on public.catalog_items;
create policy catalog_write_staff on public.catalog_items
  for all using (
    public.is_platform_admin()
    or (tenant_id = public.get_auth_tenant_id()
        and public.user_can_use_feature('inventario', 'public_catalog'))
  ) with check (
    public.is_platform_admin()
    or (tenant_id = public.get_auth_tenant_id()
        and public.user_can_use_feature('inventario', 'public_catalog'))
  );

grant select on public.catalogs, public.catalog_items to anon, authenticated;
