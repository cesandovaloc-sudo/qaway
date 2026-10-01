-- Allow trusted service-role provisioning to assign a user's initial role.
--
-- Edge Functions using the service role have no auth.uid(). The previous
-- trigger treated that trusted path as an ordinary user and blocked the
-- register-brand flow when it promoted the creator to tenant admin.
create or replace function public.prevent_permissions_selfwrite()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() is null for service_role/SQL maintenance operations.
  if auth.uid() is not null and not public.is_admin() then
    if (new.permissions is distinct from old.permissions)
       or (new.role is distinct from old.role) then
      raise exception 'Operacion no permitida: Solo los administradores pueden modificar roles o permisos.';
    end if;
  end if;
  return new;
end;
$$;
