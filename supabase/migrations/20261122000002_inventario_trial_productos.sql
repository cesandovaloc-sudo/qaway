-- 20261122000002_inventario_trial_productos.sql
-- Objetivo: que el administrador de la empresa de trabajo pueda crear productos
-- (módulo `products` del plan `basico`), sin abrir el resto de módulos.
--
-- Causa que corrige:
--   `products` tiene RLS que exige user_can_use_feature('inventario','products'),
--   lo que a su vez exige (a) rol en user_app_roles y (b) suscripción active/trialing.
--   La empresa no tenía ninguna de las dos.
--
-- Alcance: solo la empresa de trabajo (minedu-prueba-2) y su administrador.
-- Reversible: borrar la suscripción y el rol creados aquí.

do $$
declare
  v_tenant uuid := 'cafdbee3-dcb3-46cc-8d1e-26bb75982189';  -- minedu-prueba-2
  v_user   uuid := 'ca081543-5f6f-47dd-b048-6a0512d8f5a4';  -- carlossandoval172@gmail.com
  v_app    uuid;
begin
  select id into v_app from public.app_catalog where slug = 'inventario';
  if v_app is null then
    raise exception 'No existe la app inventario en app_catalog';
  end if;

  insert into public.tenant_app_subscriptions
    (tenant_id, app_id, plan, status, trial_started_at, trial_ends_at, billing_type, auto_renew)
  values
    (v_tenant, v_app, 'basico', 'trialing', now(), now() + interval '30 days', 'recurring', false)
  on conflict do nothing;

  insert into public.user_app_roles (user_id, tenant_id, app_id, role)
  values (v_user, v_tenant, v_app, 'admin')
  on conflict do nothing;
end $$;

-- Verificación (debe devolver true):
-- select public.tenant_has_app_feature(
--   'cafdbee3-dcb3-46cc-8d1e-26bb75982189', 'inventario', 'products');
