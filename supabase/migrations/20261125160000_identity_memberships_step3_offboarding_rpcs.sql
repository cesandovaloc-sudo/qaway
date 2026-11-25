-- Paso 3: offboarding y asignación compatible con tenant_memberships

create or replace function public.admin_assign_user_tenant(p_user_id uuid, p_tenant_id uuid, p_role text default 'viewer')
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not exists (select 1 from public.tenants where id = p_tenant_id) then
    raise exception 'Tenant no encontrado: %', p_tenant_id;
  end if;
  if p_role not in ('viewer', 'editor', 'guest', 'admin') then
    raise exception 'Rol invalido: %', p_role;
  end if;
  if public.is_platform_admin() then
    null;
  elsif public.is_tenant_admin()
    and p_tenant_id = public.get_auth_tenant_id()
    and p_role <> 'admin' then
    null;
  else
    raise exception 'Sin permiso para esta asignación';
  end if;

  update public.users set tenant_id = p_tenant_id, role = p_role where id = p_user_id;
  if not found then
    raise exception 'Usuario no encontrado: %', p_user_id;
  end if;

  insert into public.tenant_memberships (user_id, tenant_id, role, status, is_default, updated_at)
  values (p_user_id, p_tenant_id, p_role, 'active', false, now())
  on conflict (user_id, tenant_id) do update
    set role = excluded.role,
        status = 'active',
        updated_at = now();
end;
$function$;

create or replace function public.remove_tenant_member(p_user_id uuid, p_tenant_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if public.is_platform_admin() then
    null;
  elsif public.is_tenant_admin() and p_tenant_id = public.get_auth_tenant_id() then
    null;
  else
    raise exception 'Sin permiso para retirar membresía';
  end if;

  update public.tenant_memberships
  set status = 'removed',
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('removed_at', now(), 'removed_by', auth.uid(), 'reason', p_reason),
      updated_at = now()
  where user_id = p_user_id and tenant_id = p_tenant_id;

  if not found then
    raise exception 'Membresía no encontrada';
  end if;

  delete from public.user_app_roles
  where user_id = p_user_id and tenant_id = p_tenant_id;

  update public.users
  set tenant_id = null, updated_at = now()
  where id = p_user_id and tenant_id = p_tenant_id;

  delete from public.user_active_context
  where user_id = p_user_id and active_tenant_id = p_tenant_id;
end;
$function$;
