-- ============================================================
-- PROBLEMA 2: correcciones de gates
-- 1. catalogo_publico es un add-on, no una feature incluida por plan.
-- 2. Solo el administrador global puede saltar el gate de plan.
-- 3. Las operaciones internas críticas de Inventario también se validan
--    en RLS; no se modifica la lógica de remates ni del catálogo público.
-- ============================================================

-- La fila histórica no debe conceder acceso al catálogo público por plan.
delete from public.app_plan_features
where feature_key = 'public_catalog'
  and app_id = (select id from public.app_catalog where slug = 'inventario');

-- El catálogo público se habilita únicamente por su suscripción add-on
-- vigente, asociada a la suscripción principal de Inventi Pro.
create or replace function public.tenant_has_app_feature(
  p_tenant_id uuid,
  p_app_slug text,
  p_feature_key text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_feature_key = 'public_catalog' then exists (
      select 1
      from public.tenant_app_subscriptions tas
      join public.app_catalog a on a.id = tas.app_id
      join public.tenant_app_subscription_addons addon
        on addon.subscription_id = tas.id
      where tas.tenant_id = p_tenant_id
        and a.slug = p_app_slug
        and addon.addon_slug = 'catalogo_publico'
        and addon.status = 'active'
        and (addon.included_until is null or addon.included_until > now())
    )
    else exists (
      select 1
      from public.tenant_app_subscriptions tas
      join public.app_catalog a on a.id = tas.app_id
      join public.app_plan_features apf
        on apf.app_id = tas.app_id and apf.plan = tas.plan
      where tas.tenant_id = p_tenant_id
        and a.slug = p_app_slug
        and tas.status in ('active', 'trialing')
        and (tas.status = 'active' or tas.trial_ends_at is null or tas.trial_ends_at > now())
        and apf.feature_key = p_feature_key
    )
  end;
$$;

-- is_admin() ya representa únicamente is_platform_admin(). Esta función
-- conserva explícitamente ese bypass y nunca concede bypass al admin tenant.
create or replace function public.user_can_use_feature(p_app_slug text, p_feature_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
    or (
      public.user_can_use_app(p_app_slug)
      and public.tenant_has_app_feature(public.get_auth_tenant_id(), p_app_slug, p_feature_key)
    );
$$;

create or replace function public.user_can_use_app(p_app_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
    or exists (
      select 1
      from public.user_app_roles uar
      join public.app_catalog a on a.id = uar.app_id
      join public.tenant_app_subscriptions tas
        on tas.tenant_id = uar.tenant_id and tas.app_id = uar.app_id
      where uar.user_id = auth.uid()
        and a.slug = p_app_slug
        and uar.tenant_id = public.get_auth_tenant_id()
        and (
          tas.status = 'active'
          or (tas.status = 'trialing' and (tas.trial_ends_at is null or tas.trial_ends_at > now()))
        )
    );
$$;

-- Backend/RLS gates for internal Inventario data. Platform admin is the only
-- bypass; tenant admins still require the contracted plan feature.
do $do$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'inventory_locations', 'product_variants', 'product_images',
    'inventory_movements', 'price_lists', 'product_prices', 'customers',
    'bundles', 'bundle_items', 'quotations', 'quotation_items'
  ] loop
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t) then
      execute format('drop policy if exists %I on public.%I', t || '_tenant_all', t);
      execute format(
        'create policy %I on public.%I for all using (
           public.is_platform_admin()
           or (tenant_id = public.get_auth_tenant_id()
               and public.user_can_use_feature(''inventario'', ''inventory''))
         ) with check (
           public.is_platform_admin()
           or (tenant_id = public.get_auth_tenant_id()
               and public.user_can_use_feature(''inventario'', ''inventory''))
         )',
        t || '_tenant_plan_all', t
      );
    end if;
  end loop;
end;
$do$;

-- products tiene políticas históricas con nombres propios y por eso se ajusta
-- explícitamente para que una sesión autenticada no pueda escribir sin plan.
drop policy if exists "products_staff_insert" on public.products;
create policy "products_staff_insert" on public.products
  for insert with check (
    public.is_platform_admin()
    or (tenant_id = public.get_auth_tenant_id()
        and public.user_can_use_feature('inventario', 'products'))
  );

drop policy if exists "products_staff_update" on public.products;
create policy "products_staff_update" on public.products
  for update using (
    public.is_platform_admin()
    or (tenant_id = public.get_auth_tenant_id()
        and public.user_can_use_feature('inventario', 'products'))
  ) with check (
    public.is_platform_admin()
    or (tenant_id = public.get_auth_tenant_id()
        and public.user_can_use_feature('inventario', 'products'))
  );

drop policy if exists "products_staff_delete" on public.products;
create policy "products_staff_delete" on public.products
  for delete using (
    public.is_platform_admin()
    or (tenant_id = public.get_auth_tenant_id()
        and public.user_can_use_feature('inventario', 'products'))
  );

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (
    status = 'active'
    or (
      auth.role() = 'authenticated'
      and (
        public.is_platform_admin()
        or (tenant_id = public.get_auth_tenant_id()
            and public.user_can_use_feature('inventario', 'products'))
      )
    )
  );

grant execute on function public.tenant_has_app_feature(uuid, text, text) to anon, authenticated;
grant execute on function public.user_can_use_feature(text, text) to anon, authenticated;
