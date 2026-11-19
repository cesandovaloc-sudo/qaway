-- ============================================================================
-- 20261119_password_change_hardening.sql
-- Endurecimiento de cambios de contraseña: columna faltante + auditoría + trigger.
--
-- ¿POR QUÉ EXISTE ESTE ARCHIVO?
-- 1) La migración `20261116120000_assisted_provisioning.sql` prometió agregar
--    `public.users.must_change_password`, pero NUNCA se aplicó en remoto
--    (no aparece en `list_migrations`). La Edge Function `admin-provision-user`
--    v5 escribe en esa columna y el error se ignora: había bandera en
--    `auth.raw_user_meta_data` (la lee la app) pero no rastro en BD pública.
-- 2) No existía ninguna tabla de auditoría de contraseñas: la única fecha era
--    `auth.users.updated_at`, que también cambia por metadata ajena a la clave.
-- 3) Este parche se documenta en `doc2/9-Credenciales-y-auditoria/` porque la
--   (tablas `users`/`auth.users` es infraestructura COMPARTIDA del Hub: mañana
--    pasará a la carta general (usauripos), no se queda solo en el Gestor 2.
--
-- ALCANCE: 100% ADITIVO. Sin DROP de columnas, sin UPDATE masivo, sin borrar
-- filas. `public.users` es compartida: cualquier cambio destructivo aquí rompe
-- otras apps. Por eso solo ADD COLUMN y una tabla nueva.
-- No implementa bloqueo por intentos fallidos de login: GoTrue hace ese
-- intento fuera de Postgres; se documenta como decisión pendiente en 9.1 §6.
-- ============================================================================

-- 1. Columnas faltantes en public.users -------------------------------------
-- ¿Por qué aquí y no solo en user_metadata? Porque la metadata es propiedad de
-- Auth y puede reescribirse desde cualquier cliente con sesión; la columna de
-- BD es la que pueden auditar plataforma y otras apps sin leer `auth.users`.
alter table public.users
  add column if not exists must_change_password boolean not null default false,
  add column if not exists password_changed_at timestamptz;

comment on column public.users.must_change_password is
  'True tras alta asistida o reset: el usuario debe cambiar la clave. Se sincroniza desde auth.raw_user_meta_data mediante on_auth_user_password_change.';
comment on column public.users.password_changed_at is
  'Última vez que cambió el hash de la contraseña (auth.users.encrypted_password). Null si nunca se registró un cambio desde esta migración.';

-- 2. Tabla de auditoría ------------------------------------------------------
-- ¿Por qué una tabla nueva y no reutilizar gp_eventos_auditoria? Esa tabla es
-- del dominio gp_* (proyectos/empresas) y su RLS depende de empresa/proyecto.
-- Un evento de credenciales no pertenece a un proyecto: necesita tenant_id y
-- user_id, y debe ser legible por seguridad, no por miembros de un proyecto.
create table if not exists public.user_password_events (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  tenant_id      uuid        references public.tenants(id) on delete set null,
  evento         text        not null check (evento in ('password_changed', 'flag_set', 'flag_cleared')),
  ocurrido_at    timestamptz not null default clock_timestamp(),
  actor_user_id  uuid        references auth.users(id) on delete set null,
  metadata       jsonb       not null default '{}'::jsonb,
  constraint uq_user_password_event unique (user_id, evento, ocurrido_at)
);

-- ¿Por qué clock_timestamp() y no now()? now() es igual para toda la
-- transacción; dos eventos del mismo usuario en una sola transacción chocarían
-- con el UNIQUE. clock_timestamp() da un instante real por fila.
create index if not exists idx_user_password_events_user_fecha
  on public.user_password_events (user_id, ocurrido_at desc);
create index if not exists idx_user_password_events_tenant_fecha
  on public.user_password_events (tenant_id, ocurrido_at desc);

comment on table public.user_password_events is
  'Historial inmutable de cambios de contraseña y de la bandera de cambio obligatorio. Solo escritura por trigger SECURITY DEFINER.';
comment on column public.user_password_events.evento is
  'password_changed = cambió encrypted_password; flag_set/flag_cleared = cambió must_change_password sin cambio de hash.';
comment on column public.user_password_events.metadata is
  'Contexto del evento: fuerza_cambio, flag antes/después, origen. NUNCA contiene la contraseña ni su hash.';

-- 3. RLS ---------------------------------------------------------------------
-- ¿Por qué solo SELECT? El historial es prueba: si el usuario o un admin de
-- tenant pudiera borrarlo, dejaría de ser auditoría. El trigger escribe con
-- SECURITY DEFINER (bypass de RLS) y no hay política INSERT/UPDATE/DELETE para
-- authenticated: esas operaciones están denegadas por defecto.
alter table public.user_password_events enable row level security;
revoke all on public.user_password_events from anon;
grant select on public.user_password_events to authenticated;

drop policy if exists user_password_events_select on public.user_password_events;
create policy user_password_events_select on public.user_password_events
  for select to authenticated
  using (
       public.is_admin()                                             -- plataforma ve todo
    or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()) -- admin de su tenant
    or auth.uid() = user_id                                          -- el dueño ve los suyos
  );

-- 4. Trigger de sincronización ----------------------------------------------
-- ¿Por qué un trigger y no llamadas desde la app? Porque el cambio de clave
-- también lo hacen la Edge Function (reset) y el link de recuperación
-- (/update-password). Un trigger en auth.users es el ÚNICO punto que ve las
-- tres vías. Sin él, la app podía cambiar la metadata y la BD quedaría vieja.
create or replace function public.on_auth_user_password_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_flag       boolean;
  v_flag_old   boolean;
  v_cambio     boolean := false;
  v_tenant     uuid;
  v_evento     text;
  v_meta       jsonb;
begin
  if tg_op = 'INSERT' then
    v_flag     := coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, false);
    v_flag_old := false;
  else
    v_flag     := coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, false);
    v_flag_old := coalesce((old.raw_user_meta_data->>'must_change_password')::boolean, false);
    v_cambio   := new.encrypted_password is distinct from old.encrypted_password;
  end if;

  select tenant_id into v_tenant from public.users where id = new.id;

  update public.users u
     set must_change_password = v_flag,
         password_changed_at  = case when v_cambio then clock_timestamp() else u.password_changed_at end
   where u.id = new.id;

  if v_cambio then
    v_evento := 'password_changed';
    v_meta   := jsonb_build_object(
      'fuerza_cambio', v_flag_old,
      'flag_despues', v_flag,
      'origen', case when tg_op = 'INSERT' then 'alta' else 'auth_update' end
    );
  elsif v_flag_old is distinct from v_flag then
    v_evento := case when v_flag then 'flag_set' else 'flag_cleared' end;
    v_meta   := jsonb_build_object('antes', v_flag_old, 'despues', v_flag, 'origen', 'auth_metadata');
  else
    return new; -- metadata cambió pero no hay nada de credenciales que registrar
  end if;

  insert into public.user_password_events (user_id, tenant_id, evento, metadata)
  values (new.id, v_tenant, v_evento, v_meta);

  return new;
end;
$$;

comment on function public.on_auth_user_password_change() is
  'Sincroniza public.users.must_change_password / password_changed_at y escribe user_password_events cuando cambia la clave o la bandera en auth.users.';

-- ¿Por qué revocar EXECUTE? Es una función de trigger: nadie debe poder llamarla
-- por REST/RPC. El trigger la ejecuta igual aunque el rol no tenga EXECUTE.
revoke all on function public.on_auth_user_password_change() from public, anon, authenticated;

drop trigger if exists on_auth_user_password_change on auth.users;
create trigger on_auth_user_password_change
  after insert or update of encrypted_password, raw_user_meta_data on auth.users
  for each row execute function public.on_auth_user_password_change();

-- 5. Autodiagnóstico ---------------------------------------------------------
-- ¿Por qué? La migración anterior de 2026-11-16 decía "autodiagnóstico OK"
-- pero nunca se ejecutó. Un error silencioso aquí es exactamente el bug que
-- estamos cerrando: preferimos que la migración FALLE si falta algo.
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='users'
                   and column_name='must_change_password') then
    raise exception 'FALLÓ: falta public.users.must_change_password';
  end if;
  if not exists (select 1 from information_schema.tables
                 where table_schema='public' and table_name='user_password_events') then
    raise exception 'FALLÓ: falta public.user_password_events';
  end if;
  if not exists (select 1 from pg_trigger
                  where tgname='on_auth_user_password_change' and not tgisinternal) then
    raise exception 'FALLÓ: falta el trigger on_auth_user_password_change';
  end if;
  if not exists (select 1 from pg_policies
                  where schemaname='public' and tablename='user_password_events'
                    and policyname='user_password_events_select') then
    raise exception 'FALLÓ: falta la política RLS de lectura';
  end if;
  raise notice 'OK: columna, auditoría, trigger y RLS de contraseñas verificados';
end $$;

-- 6. Rollback (DOCUMENTADO, NO EJECUTADO) -----------------------------------
-- ¿Por qué se escribe aunque no se ejecuta? Porque la regla de doc2 exige que
-- toda migración sobre infra compartida pueda revertirse sin improvisar.
--   drop trigger if exists on_auth_user_password_change on auth.users;
--   drop function if exists public.on_auth_user_password_change();
--   drop policy if exists user_password_events_select on public.user_password_events;
--   drop table if exists public.user_password_events;
--   alter table public.users drop column if exists password_changed_at;
--   alter table public.users drop column if exists must_change_password;
-- OJO: solo en entorno de prueba. En producción el historial de auditoría no
-- se descarta: si falla, se corrige hacia adelante con otra migración.
