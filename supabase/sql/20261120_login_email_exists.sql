-- ============================================================================
-- 20261120_login_email_exists.sql
-- Helper para la Edge Function auth-login-guard: ¿existe el correo en Auth?
-- ¿POR QUÉ? El responsable pidió distinguir "correo no encontrado" de
-- "contraseña incorrecta". supabase-js 2.112.1 no expone
-- admin.auth.admin.getUserByEmail (llamarlo daba 500). Esta RPC evita además
-- devolver datos personales: solo un booleano.
-- ADITIVO: función nueva, sin tocar tablas. EXECUTE solo para service_role.
-- ============================================================================

create or replace function public.login_email_exists(p_email text)
returns boolean language sql security definer set search_path = public, pg_temp
as $$
  select exists (select 1 from auth.users where email = lower(btrim(p_email)));
$$;

comment on function public.login_email_exists(text) is
  'Solo service_role. Devuelve si el correo existe en Auth; sin datos personales.';

revoke all on function public.login_email_exists(text) from public, anon, authenticated;
grant execute on function public.login_email_exists(text) to service_role;

-- Verificación:
-- select public.login_email_exists('carlossandoval172@gmail.com'); -- true
-- select public.login_email_exists('no-existe@example.invalid');   -- false

-- Rollback documentado (NO ejecutado):
-- drop function if exists public.login_email_exists(text);
