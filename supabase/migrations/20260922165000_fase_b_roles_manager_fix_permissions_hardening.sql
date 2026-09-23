-- ============================================================
-- CIERRE FASE B · Accesos por rol (validado del traspaso
-- docs/fase_b_accesos_por_rol_supabase.md)
-- 2026-09-22 · Autor: 1-agente-supabase
--
-- 1) admin_assign_user_tenant: quitar 'manager' (rol huérfano) del
--    allowlist → alinear con el CHECK de users.role
--    ('admin','editor','viewer','guest') + UI (ROLE_META).
-- 2) prevent_role_escalation v4: además de role/tenant/is_platform_admin,
--    rechazar que un trabajador se auto-cambie permissions (secciones de
--    panel) vía users_update_own_or_admin; solo admin del tenant o plataforma.
-- 3) Directorio de tenant POR MEMBRESÍA: miembros internos (admin/editor/
--    viewer) lo ven (colaboración, menciones, chat), guests NO (externos),
--    plataforma vía is_admin(). Aprobado 2026-09-22.
-- Idempotente. Sin push (protocolo: dry-run + OK del usuario).
-- ============================================================

-- ─── 1. Rol 'manager' fuera del allowlist (opción B) ───
create or replace function public.admin_assign_user_tenant(
  p_user_id   uuid,
  p_tenant_id uuid,
  p_role      text DEFAULT 'viewer'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.tenants where id = p_tenant_id) then
    raise exception 'Tenant no encontrado: %', p_tenant_id;
  end if;
  if p_role not in ('viewer', 'editor', 'guest', 'admin') then
    raise exception 'Rol invalido: %. Roles permitidos: viewer, editor, guest, admin (manager fue removido: huérfano, sin CHECK ni UI)', p_role;
  end if;
  if public.is_platform_admin() then
    update public.users set tenant_id = p_tenant_id, role = p_role where id = p_user_id;
  elsif public.is_tenant_admin()
    and p_tenant_id = public.get_auth_tenant_id()
    and p_role <> 'admin' then
    update public.users set tenant_id = p_tenant_id, role = p_role where id = p_user_id;
  else
    raise exception 'Sin permiso para esta asignación';
  end if;
  if not found then
    raise exception 'Usuario no encontrado: %', p_user_id;
  end if;
end;
$$;

-- ─── 2. Trigger anti-escalada v4: + guarda sobre permissions ───
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_tenant uuid;
begin
  -- Servicio/dashboard (sin JWT) conserva vía libre
  if auth.uid() is null then
    return new;
  end if;
  -- Plataforma: todo permitido
  if public.is_platform_admin() then
    return new;
  end if;
  select role, tenant_id into v_role, v_tenant from public.users where id = auth.uid();
  -- tenant_id e is_platform_admin: solo plataforma los mueve
  if new.tenant_id is distinct from old.tenant_id
     or coalesce(new.is_platform_admin, false) is distinct from coalesce(old.is_platform_admin, false) then
    raise exception 'Solo plataforma mueve usuarios o banderas';
  end if;
  -- role: admin de la marca gestiona viewer/editor/guest de SU marca; nunca otorga admin
  if new.role is distinct from old.role then
    if not (v_role = 'admin' and v_tenant is not null and old.tenant_id = v_tenant) then
      raise exception 'Sin permiso de rol';
    end if;
    if new.role = 'admin' then
      raise exception 'Solo plataforma otorga admin';
    end if;
  end if;
  -- v4: permissions (secciones de panel) solo las cambia el admin de SU marca
  if new.permissions is distinct from old.permissions then
    if not (v_role = 'admin' and v_tenant is not null and old.tenant_id = v_tenant) then
      raise exception 'Sin permiso para otorgar secciones del panel';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists users_prevent_role_escalation on public.users;
create trigger users_prevent_role_escalation
  before update on public.users
  for each row execute procedure public.prevent_role_escalation();

-- ─── 3. Directorio por MEMBRESÍA (decisión aprobada 2026-09-22) ───
-- Modelo industria (Trello/Slack/Google): miembros internos ven el roster
-- del tenant (colaboración/mentions/chats); guests (externos: proveedor,
-- becario, cliente puntual) NO ven el directorio — solo su propia fila
-- (cubierta por users_select_own_or_admin ya existente). Plataforma ve todo
-- vía is_admin(). Clientes/chats no viven en users (son contactos WabaCrm,
-- gobernados por user_app_roles) → nada que acotar aquí.
create or replace function public.is_tenant_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role <> 'guest' and tenant_id is not null
  );
$$;

drop policy if exists "users_tenant_read" on public.users;
create policy "users_tenant_read" on public.users
  for select using (
    public.is_tenant_member() and tenant_id = public.get_auth_tenant_id()
  );