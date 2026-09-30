-- ============================================================
-- FIX: ALINEAR EL BYPASS DEL SUPER ADMINISTRADOR DE PLATAFORMA
-- ============================================================
-- TenantContext ya reconoce como Super Administrador a:
--   role = 'admin' AND tenant_id IS NULL
-- además del flag explícito is_platform_admin = true.
--
-- Esta migración alinea la función usada por RPC/RLS con ese contrato.
-- No modifica filas, planes, suscripciones ni políticas.

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
      and (
        coalesce(is_platform_admin, false)
        or tenant_id is null
      )
  );
$$;

-- is_admin() es el alias histórico del bypass administrativo de plataforma.
-- Mantenerlo delegado evita que las funciones existentes diverjan.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin();
$$;
