-- Fix Paso 1: permitir sincronización de users.tenant_id por el propio usuario
-- cuando cambia su contexto activo a un tenant con membresía activa.
-- No relaja is_platform_admin ni reglas de escalación de rol/permisos.

create or replace function public.prevent_role_escalation()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_role text;
  v_tenant uuid;
begin
  if auth.uid() is null then
    return new;
  end if;
  if public.is_platform_admin() then
    return new;
  end if;
  select role, tenant_id into v_role, v_tenant from public.users where id = auth.uid();
  if new.tenant_id is distinct from old.tenant_id then
    if not (
      auth.uid() = old.id
      and new.tenant_id is not null
      and exists (
        select 1 from public.tenant_memberships tm
        where tm.user_id = auth.uid()
          and tm.tenant_id = new.tenant_id
          and tm.status = 'active'
      )
    ) then
      raise exception 'Solo plataforma mueve usuarios o banderas';
    end if;
  end if;
  if coalesce(new.is_platform_admin, false) is distinct from coalesce(old.is_platform_admin, false) then
    raise exception 'Solo plataforma mueve usuarios o banderas';
  end if;
  if new.role is distinct from old.role then
    if not (v_role = 'admin' and v_tenant is not null and old.tenant_id = v_tenant) then
      raise exception 'Sin permiso de rol';
    end if;
    if new.role = 'admin' then
      raise exception 'Solo plataforma otorga admin';
    end if;
  end if;
  if new.permissions is distinct from old.permissions then
    if not (v_role = 'admin' and v_tenant is not null and old.tenant_id = v_tenant) then
      raise exception 'Sin permiso para otorgar secciones del panel';
    end if;
  end if;
  return new;
end;
$function$;
