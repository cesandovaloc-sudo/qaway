-- [SUPERADO por 20261119_password_change_hardening.sql] Nunca se aplicó en remoto:
-- no aparece en list_migrations y public.users.must_change_password no existía.
-- Se conserva como historia; no ejecutar. Motivo y evidencia en
-- doc2/9-Credenciales-y-auditoria/9.1 §2 y 9.2.
-- ============================================================
-- Alta asistida de usuarios (modalidad EXTRA a la invitación)
-- Objetivo: que el administrador de la plataforma cree cuentas listas
-- para ingresar (correo + contraseña provisional entregada por un canal
-- seguro) y pueda restablecerla cuando se pierda.
-- La invitación por correo (invite-user + user_invites + handle_new_user)
-- NO cambia: esta modalidad la REUTILIZA — en vez de enviar el correo de
-- invitación, la edge admin-provision-user crea la cuenta auth con
-- contraseña provisional y email_confirm directo, y el trigger existente
-- vincula tenant + rol + apps desde la invitación pendiente.
-- Nueva columna: users.must_change_password → la app fuerza el cambio de
-- contraseña en el primer ingreso tras un alta asistida o un reset.
-- 2026-11-16. Idempotente. Sin tocar migraciones existentes.
-- ============================================================

-- ─── 1. Columna estructural ───
alter table public.users
  add column if not exists must_change_password boolean not null default false;

comment on column public.users.must_change_password is
  'True tras alta asistida o reset de contraseña por plataforma: forzar cambio en el primer ingreso. La pantalla de cambio la regresa a false.';

-- ─── 2. Autodiagnóstico ───
do $$
begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'users'
       and column_name = 'must_change_password'
  ) then
    raise exception 'Autodiagnóstico FALLÓ: no existe public.users.must_change_password';
  end if;

  if not exists (
    select 1 from pg_trigger
     where tgname = 'on_auth_user_created' and not tgisinternal
  ) then
    raise exception 'Autodiagnóstico FALLÓ: falta el trigger on_auth_user_created (requisito del alta asistida)';
  end if;

  if not exists (
    select 1 from information_schema.tables
     where table_schema = 'public' and table_name = 'user_invites'
  ) then
    raise exception 'Autodiagnóstico FALLÓ: falta public.user_invites (la modalidad la reutiliza)';
  end if;

  raise notice 'Autodiagnóstico OK: must_change_password lista, trigger e invitaciones operativos. Aplica la edge admin-provision-user para activar la modalidad.';
end $$;
