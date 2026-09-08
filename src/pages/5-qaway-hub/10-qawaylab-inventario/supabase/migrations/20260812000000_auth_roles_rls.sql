-- ─────────────────────────────────────────────────────────────
-- AUTH — Tabla `users` + RLS coherente con roles básicos
-- Roles: admin / editor / viewer / guest
--
-- Cómo usar: pegar en el SQL Editor de Supabase (proyecto de
-- inventario) o ejecutar con `supabase db push`. Es idempotente:
-- se puede re-ejecutar sin riesgo.
-- ─────────────────────────────────────────────────────────────

-- 1) Tabla pública de perfiles y roles
create table if not exists public.users (
  id              uuid primary key references auth.users (id) on delete cascade,
  email           text,
  full_name       text,
  avatar_url      text,
  role            text not null default 'viewer',
  permissions     jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  last_active_at  timestamptz
);

-- Idempotencia: si la tabla ya existía sin alguna columna
alter table public.users add column if not exists email          text;
alter table public.users add column if not exists full_name      text;
alter table public.users add column if not exists avatar_url     text;
alter table public.users add column if not exists role           text not null default 'viewer';
alter table public.users add column if not exists permissions    jsonb not null default '{}'::jsonb;
alter table public.users add column if not exists created_at     timestamptz not null default now();
alter table public.users add column if not exists last_active_at timestamptz;

-- Restricción de rol válido
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_role_check' and conrelid = 'public.users'::regclass
  ) then
    alter table public.users add constraint users_role_check check (role in ('admin', 'editor', 'viewer', 'guest'));
  end if;
end $$;

-- 2) Trigger: crear fila en `users` al registrarse un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3) Helper: ¿el usuario actual es admin? (security definer evita recursión de RLS)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$;

-- 4) RLS sobre `users`
alter table public.users enable row level security;

-- Leer: propia fila o admin
drop policy if exists "users_select_own_or_admin" on public.users;
create policy "users_select_own_or_admin" on public.users
  for select
  using (auth.uid() = id or public.is_admin());

-- Insertar: solo la propia fila (al registrarse) y sin rol elevado
-- (evita que un usuario se inserte con role='admin')
-- Nota: en políticas RLS la fila nueva se referencia sin prefijo `new.`
-- (el prefijo `new` solo existe en funciones de trigger).
drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own" on public.users
  for insert
  with check (auth.uid() = id and role = 'viewer');

-- Actualizar: propia fila o admin
drop policy if exists "users_update_own_or_admin" on public.users;
create policy "users_update_own_or_admin" on public.users
  for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- Eliminar: solo admin
drop policy if exists "users_delete_admin" on public.users;
create policy "users_delete_admin" on public.users
  for delete
  using (public.is_admin());

-- 5) Evitar escalada de privilegios: solo admin cambia roles.
-- auth.uid() NULL = service_role / SQL editor / postgres (confiables): se permite
-- el cambio para poder promover al PRIMER admin. Un usuario autenticado que no
-- es admin queda bloqueado.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Solo un admin puede cambiar el rol de un usuario';
  end if;
  return new;
end;
$$;

drop trigger if exists users_prevent_role_escalation on public.users;
create trigger users_prevent_role_escalation
  before update on public.users
  for each row execute procedure public.prevent_role_escalation();

-- 5b) Grants: la tabla users no tiene permisos por defecto para
-- anon/authenticated/service_role; se declaran explícitamente (en la
-- plataforma los default privileges suelen cubrirlo, pero no depende de ello).
grant select on public.users to anon;
grant select, insert, update, delete on public.users to authenticated;
grant all on public.users to service_role;

-- 6) Índices útiles
create index if not exists users_role_idx on public.users (role);
