-- ============================================================================
-- 20261119_login_attempt_guard.sql
-- Bloqueo por intentos fallidos + aviso previo + límite de cambios de clave.
-- ¿POR QUÉ? GoTrue solo limita por IP y no expone intentos restantes; para
-- mostrar "te quedan N intentos" hace falta un contador propio. Los intentos
-- fallidos NO llegan a Postgres, así que el conteo lo hace una Edge Function
-- (verify_jwt: false) que llama a GoTrue y escribe estas funciones.
-- ADITIVO: tabla nueva + funciones + trigger. Sin DROP sobre tablas existentes.
-- Ejecución y evidencia: doc2/9-Credenciales-y-auditoria/9.3.
-- NOTA (20-nov-2026): el límite de 5 intentos de este archivo fue SUPERADO
-- por 20261120_login_attempts_seis_intentos.sql (6 intentos: 2 libres + 3/2/1).
-- Se conserva como historial de la decisión original; no volver a aplicar solo.
-- ============================================================================

create table if not exists public.user_login_attempts (
  email_key       text        primary key check (email_key = lower(btrim(email_key))),
  user_id         uuid        references auth.users(id) on delete set null,
  failed_count    integer     not null default 0 check (failed_count >= 0),
  first_failed_at timestamptz,
  last_failed_at  timestamptz,
  locked_until    timestamptz,
  last_ip         text,
  updated_at      timestamptz not null default clock_timestamp()
);
comment on table public.user_login_attempts is
  'Contador de intentos fallidos por correo. 5 intentos bloquean 15 min. Solo la Edge Function auth-login-guard lo escribe.';
comment on column public.user_login_attempts.email_key is
  'Correo normalizado (lower+btrim). Clave primaria: no revela si el usuario existe.';
comment on column public.user_login_attempts.locked_until is
  'Fin del bloqueo. Al vencer, el contador se reinicia en la próxima consulta.';

alter table public.user_login_attempts enable row level security;
revoke all on public.user_login_attempts from public, anon, authenticated;
grant select, insert, update, delete on public.user_login_attempts to service_role;

create or replace function public.login_guard_state(p_email text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare v public.user_login_attempts%rowtype; v_min int;
begin
  select * into v from public.user_login_attempts where email_key = lower(btrim(p_email));
  if not found then
    return jsonb_build_object('locked', false, 'failed_count', 0, 'remaining', 5);
  end if;
  if v.locked_until is not null and v.locked_until > clock_timestamp() then
    v_min := ceil(extract(epoch from (v.locked_until - clock_timestamp())) / 60)::int;
    return jsonb_build_object('locked', true, 'locked_until', v.locked_until,
                              'minutes_remaining', greatest(v_min,1), 'failed_count', v.failed_count);
  end if;
  if v.locked_until is not null and v.locked_until <= clock_timestamp() then
    update public.user_login_attempts
       set failed_count = 0, locked_until = null, first_failed_at = null,
           last_failed_at = null, updated_at = clock_timestamp()
     where email_key = v.email_key;
    return jsonb_build_object('locked', false, 'failed_count', 0, 'remaining', 5);
  end if;
  return jsonb_build_object('locked', false, 'failed_count', v.failed_count,
                            'remaining', greatest(5 - v.failed_count, 0));
end $$;

create or replace function public.login_guard_failure(p_email text, p_user_id uuid default null, p_ip text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_key text := lower(btrim(p_email)); v_count int; v_lock timestamptz; v_state jsonb;
begin
  v_state := public.login_guard_state(v_key);
  if (v_state->>'locked')::boolean then return v_state; end if;

  insert into public.user_login_attempts as a
    (email_key, user_id, failed_count, first_failed_at, last_failed_at, last_ip, updated_at)
  values (v_key, p_user_id, 1, clock_timestamp(), clock_timestamp(), p_ip, clock_timestamp())
  on conflict (email_key) do update set
    failed_count = a.failed_count + 1,
    user_id = coalesce(excluded.user_id, a.user_id),
    first_failed_at = coalesce(a.first_failed_at, clock_timestamp()),
    last_failed_at = clock_timestamp(),
    last_ip = excluded.last_ip,
    updated_at = clock_timestamp()
  returning a.failed_count into v_count;

  if v_count >= 5 then
    update public.user_login_attempts set locked_until = clock_timestamp() + interval '15 minutes'
     where email_key = v_key returning locked_until into v_lock;
    return jsonb_build_object('locked', true, 'remaining', 0,
                              'locked_until', v_lock, 'failed_count', v_count);
  end if;
  return jsonb_build_object('locked', false, 'remaining', 5 - v_count, 'failed_count', v_count);
end $$;

create or replace function public.login_guard_success(p_email text)
returns void language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  delete from public.user_login_attempts where email_key = lower(btrim(p_email));
end $$;

comment on function public.login_guard_state(text) is
  'Devuelve locked/remaining. Reinicia el contador si el bloqueo ya venció.';
comment on function public.login_guard_failure(text, uuid, text) is
  'Registra un intento fallido; en el 5o fija locked_until = ahora + 15 min.';
comment on function public.login_guard_success(text) is
  'Borra el contador del correo tras un inicio de sesión correcto.';

revoke all on function public.login_guard_state(text) from public, anon, authenticated;
revoke all on function public.login_guard_failure(text, uuid, text) from public, anon, authenticated;
revoke all on function public.login_guard_success(text) from public, anon, authenticated;
grant execute on function public.login_guard_state(text) to service_role;
grant execute on function public.login_guard_failure(text, uuid, text) to service_role;
grant execute on function public.login_guard_success(text) to service_role;

-- Límite de 5 cambios de clave por hora. ¿POR QUÉ en trigger y no en la app?
-- Aquí sí llega: GoTrue hace UPDATE de auth.users.encrypted_password con rol de
-- servicio. El trigger ve las 3 vías (modal, reset Edge y /update-password).
create or replace function public.enforce_password_change_limit()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_count int;
begin
  if tg_op = 'UPDATE' and new.encrypted_password is distinct from old.encrypted_password then
    select count(*) into v_count
      from public.user_password_events
     where user_id = new.id and evento = 'password_changed'
       and ocurrido_at > clock_timestamp() - interval '1 hour';
    if v_count >= 5 then
      raise exception 'Límite alcanzado: máximo 5 cambios de contraseña por hora. Intenta más tarde.';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists enforce_password_change_limit on auth.users;
create trigger enforce_password_change_limit
  before update of encrypted_password on auth.users
  for each row execute function public.enforce_password_change_limit();

revoke all on function public.enforce_password_change_limit() from public, anon, authenticated;
grant execute on function public.enforce_password_change_limit() to service_role;

do $$
begin
  if not exists (select 1 from pg_tables where schemaname='public' and tablename='user_login_attempts') then
    raise exception 'FALLÓ: falta user_login_attempts';
  end if;
  if not exists (select 1 from pg_trigger where tgname='enforce_password_change_limit' and not tgisinternal) then
    raise exception 'FALLÓ: falta el trigger de límite de cambios';
  end if;
  raise notice 'OK: contador de intentos y límite de cambios verificados';
end $$;

-- Rollback documentado (NO ejecutado):
-- drop trigger if exists enforce_password_change_limit on auth.users;
-- drop function if exists public.enforce_password_change_limit();
-- drop function if exists public.login_guard_success(text);
-- drop function if exists public.login_guard_failure(text, uuid, text);
-- drop function if exists public.login_guard_state(text);
-- drop table if exists public.user_login_attempts;
